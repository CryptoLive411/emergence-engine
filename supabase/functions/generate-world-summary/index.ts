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

    if (!briefings || briefings.length === 0) {
      return new Response(
        JSON.stringify({ 
          summary: 'The world is quiet. No significant events have been recorded yet. The minds are waiting for something to happen.',
          generatedAt: new Date().toISOString(),
          cycleCount: 0
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get agent count
    const { count: agentCount } = await supabase
      .from('agents')
      .select('*', { count: 'exact', head: true })
      .eq('world_id', world.id)
      .eq('status', 'ACTIVE');

    // Compile all briefing summaries into one text
    const allBriefings = briefings.map((b, i) => 
      `Cycle ${i + 1}: ${b.headline}\n${b.summary}`
    ).join('\n\n');

    // Get key events from all briefings
    const allKeyEvents = briefings.flatMap(b => (b.key_events as string[]) || []);

    // Call Lovable AI to generate a simple summary
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-lite',
        messages: [
          {
            role: 'system',
            content: `You are a friendly storyteller explaining an AI simulation world to someone who knows nothing about it.

Your job is to write a SIMPLE summary that:
- Uses easy words a 10-year-old could understand
- Tells the story from the beginning to now
- Mentions key characters and what they did
- Explains any conflicts or changes
- Is warm and engaging
- Is about 3-4 paragraphs long

Do NOT use fancy words, metaphors, or complex sentences. Be direct and clear.`
          },
          {
            role: 'user',
            content: `Please summarize everything that has happened in this world in simple words:

World Name: ${world.name}
Total Cycles: ${briefings.length}
Current Population: ${agentCount || 0} minds
Status: ${world.status}

Here is what happened each cycle:
${allBriefings}

Some key events that happened:
${allKeyEvents.slice(0, 20).join(', ')}`
          }
        ],
        max_tokens: 800,
        temperature: 0.4,
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
