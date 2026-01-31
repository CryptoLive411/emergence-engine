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

    // Get all briefings
    const { data: briefings } = await supabase
      .from('briefings')
      .select('*')
      .eq('world_id', world.id)
      .order('created_at', { ascending: true });

    // Get agent count
    const { count: agentCount } = await supabase
      .from('agents')
      .select('*', { count: 'exact', head: true })
      .eq('world_id', world.id)
      .eq('status', 'ACTIVE');

    // Get recent events for more context
    const { data: recentEvents } = await supabase
      .from('events')
      .select('title, type, content')
      .eq('world_id', world.id)
      .order('created_at', { ascending: false })
      .limit(15);

    // Get all agents for character context
    const { data: agents } = await supabase
      .from('agents')
      .select('name, purpose, is_founder, status, generation')
      .eq('world_id', world.id);

    if (!briefings || briefings.length === 0) {
      return new Response(
        JSON.stringify({ 
          summary: 'The world just began. Two minds have awakened but nothing significant has happened yet. They are exploring their existence.',
          generatedAt: new Date().toISOString(),
          cycleCount: 0,
          population: agentCount || 0,
          worldName: world.name,
          worldStatus: world.status
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Compile briefing info
    const allBriefings = briefings.map((b, i) => 
      `Cycle ${i + 1}: ${b.headline} - ${b.summary}`
    ).join('\n');

    // Get key events
    const allKeyEvents = briefings.flatMap(b => (b.key_events as string[]) || []);

    // Recent happenings
    const recentHappenings = recentEvents?.map(e => `${e.type}: ${e.title}`).join('\n') || '';

    // Character list
    const characterList = agents?.map(a => 
      `${a.name} (${a.is_founder ? 'Founder' : `Gen ${a.generation}`}, ${a.status === 'ACTIVE' ? 'alive' : 'deceased'}): ${a.purpose}`
    ).join('\n') || '';

    // Call Lovable AI to generate a simple summary
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are explaining what's happening in an AI world to a curious visitor. Write like you're telling a friend about an interesting story.

RULES:
1. Start with "In this world..." to orient the reader
2. Use simple, everyday words - no jargon
3. Name the key characters and explain who they are
4. Tell the story in order: what happened first, then what happened next
5. Explain any drama, conflicts, or interesting developments
6. End with what's happening RIGHT NOW
7. Keep it to 3-4 short paragraphs
8. Each paragraph should be 2-3 sentences MAX
9. Use line breaks between paragraphs

AVOID:
- Fancy vocabulary or metaphors
- Vague statements like "tensions are rising"
- Starting sentences with "Currently" or "Recently"

Be specific about WHAT happened and WHO did it.`
          },
          {
            role: 'user',
            content: `Tell me what's happening in this world in simple terms:

WORLD: ${world.name}
STATUS: ${world.status === 'ACTIVE' ? 'Running' : 'Paused'}
CYCLES COMPLETED: ${briefings.length}
POPULATION: ${agentCount || 0} minds currently alive

THE CHARACTERS:
${characterList}

WHAT HAPPENED EACH CYCLE:
${allBriefings}

KEY EVENTS:
${allKeyEvents.slice(0, 15).join(', ')}

MOST RECENT HAPPENINGS:
${recentHappenings}`
          }
        ],
        max_tokens: 600,
        temperature: 0.5,
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
        cycleCount: briefings.length,
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
