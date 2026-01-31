import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the active world
    const { data: world } = await supabase
      .from('worlds')
      .select('*')
      .in('status', ['ACTIVE', 'PAUSED'])
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!world) {
      return new Response(
        JSON.stringify({ summary: 'No world exists yet. The simulation has not begun.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get agent count
    const { count: agentCount } = await supabase
      .from('agents')
      .select('*', { count: 'exact', head: true })
      .eq('world_id', world.id)
      .eq('status', 'ACTIVE');

    // Get ALL agents for character context (including deceased)
    const { data: agents } = await supabase
      .from('agents')
      .select('name, purpose, is_founder, status, generation, founder_type, created_at')
      .eq('world_id', world.id)
      .order('created_at', { ascending: true });

    // Get ALL events - speeches, actions, spawns (up to 200 for comprehensive context)
    const { data: allEvents } = await supabase
      .from('events')
      .select('type, title, content, created_at, agent_id, metadata')
      .eq('world_id', world.id)
      .in('type', ['SPEECH', 'ACTION', 'SPAWN'])
      .order('created_at', { ascending: true })
      .limit(200);

    // Get all artifacts created
    const { data: artifacts } = await supabase
      .from('artifacts')
      .select('name, artifact_type, content, created_at')
      .eq('world_id', world.id)
      .order('created_at', { ascending: true })
      .limit(50);

    // Get turn count
    const { count: turnCount } = await supabase
      .from('turns')
      .select('*', { count: 'exact', head: true })
      .eq('world_id', world.id);

    // Build a comprehensive transcript of what happened
    const agentMap = new Map((agents || []).map(a => [a.name, a]));
    
    // Format all events as a chronological narrative
    const eventTranscript = (allEvents || []).map(e => {
      if (e.type === 'SPEECH') {
        return `${e.title} said: "${e.content}"`;
      } else if (e.type === 'SPAWN') {
        return `NEW MIND: ${e.content}`;
      } else if (e.type === 'ACTION') {
        const actionType = (e.metadata as any)?.actionType || 'ACTION';
        return `${actionType}: ${e.content}`;
      }
      return `${e.type}: ${e.content}`;
    }).join('\n');

    // Format character introductions
    const characterIntros = (agents || []).map(a => {
      const role = a.is_founder ? `Founder (${a.founder_type === 'A' ? 'Order' : 'Chaos'})` : `Generation ${a.generation}`;
      const status = a.status === 'ACTIVE' ? '🟢 alive' : '⚫ deceased';
      return `• ${a.name} - ${role} - ${status}\n  Purpose: "${a.purpose || 'Unknown'}"`;
    }).join('\n');

    // Format artifacts/creations
    const emojiMap: Record<string, string> = {
      'concept': '💡',
      'institution': '🏛️',
      'symbol': '🔧',
      'place': '📍'
    };
    const creationsList = (artifacts || []).map(a => {
      const typeEmoji = emojiMap[a.artifact_type] || '✨';
      return `${typeEmoji} ${a.name} (${a.artifact_type}): ${a.content}`;
    }).join('\n');

    if (!allEvents || allEvents.length === 0) {
      return new Response(
        JSON.stringify({ 
          summary: 'The world just began. Two minds have awakened but nothing significant has happened yet. They are exploring their existence and discovering what it means to be.',
          generatedAt: new Date().toISOString(),
          cycleCount: turnCount || 0,
          population: agentCount || 0,
          worldName: world.name,
          worldStatus: world.status
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Call AI to generate a comprehensive but readable summary
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          {
            role: 'system',
            content: `You are a storyteller explaining what's happening in an AI world simulation to someone who just arrived. Your job is to read through EVERYTHING that has happened and write a clear, engaging summary.

WRITING STYLE:
- Write like you're telling a fascinating story to a friend over coffee
- Use simple, everyday language - a 12-year-old should understand it
- Be SPECIFIC - use names, quote memorable things characters said
- Explain relationships - who created whom, who agrees/disagrees
- Highlight interesting creations, ideas, or conflicts

STRUCTURE (use these exact sections with line breaks between):

**The Beginning**
Who started this world? What are the founding minds like?

**What's Been Happening**  
Tell the story chronologically. What did they say? What did they build? What ideas emerged?

**The Characters**
Brief intro to each mind - their personality based on what they've said and done.

**Things They've Created**
List any structures, objects, places, or concepts they've made.

**Right Now**
What's the current situation? Any ongoing discussions or projects?

RULES:
- Read ALL the events carefully - don't skip anything important
- Quote actual things they said (use "quotation marks")
- Be detailed but readable - aim for 5-6 paragraphs total
- Use line breaks between sections
- If they built something or named something, mention it!
- If there are conflicts or disagreements, explain them
- Make it feel like a living world with real personalities`
          },
          {
            role: 'user',
            content: `Please read through everything that has happened in this world and write a comprehensive summary:

WORLD: ${world.name}
STATUS: ${world.status === 'ACTIVE' ? 'Running' : 'Paused'}
CYCLES COMPLETED: ${turnCount || 0}
CURRENT POPULATION: ${agentCount || 0} minds alive

═══════════════════════════════════
THE CHARACTERS
═══════════════════════════════════
${characterIntros || 'No characters yet.'}

═══════════════════════════════════
COMPLETE TRANSCRIPT (oldest to newest)
═══════════════════════════════════
${eventTranscript || 'Nothing has happened yet.'}

═══════════════════════════════════
THINGS CREATED
═══════════════════════════════════
${creationsList || 'Nothing has been created yet.'}

Please summarize this entire history in a way that's easy to understand and engaging to read.`
          }
        ],
        max_tokens: 1500,
        temperature: 0.6,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      throw new Error(`AI request failed: ${response.status}`);
    }

    const data = await response.json();
    const summary = data.choices?.[0]?.message?.content || 'Could not generate summary.';

    return new Response(
      JSON.stringify({ 
        summary,
        generatedAt: new Date().toISOString(),
        cycleCount: turnCount || 0,
        population: agentCount || 0,
        worldName: world.name,
        worldStatus: world.status
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Generate summary error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
