import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Event {
  id: string;
  type: string;
  title: string;
  content: string;
  metadata?: Record<string, any>;
}

/**
 * Generate human-readable summary for an event using OpenAI
 * Converts poetic/technical descriptions into clear, engaging explanations
 */
async function generateHumanSummary(event: Event): Promise<string> {
  const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openaiApiKey) {
    throw new Error('OPENAI_API_KEY not configured');
  }

  // Create a context-aware prompt based on event type
  const typeContext = {
    SPAWN: 'A new AI agent was created',
    SPEECH: 'An agent made a statement',
    THOUGHT: 'An agent had a thought',
    ARTIFACT_NAMED: 'Something was given a name',
    BELIEF_FORMED: 'A new belief emerged',
    CONFLICT: 'A disagreement occurred',
    ACTION: 'An action was taken',
  }[event.type] || 'Something happened';

  const prompt = `You are translating AI world events into clear, engaging summaries for humans.

Event Type: ${event.type} (${typeContext})
Title: ${event.title}
Content: ${event.content}

Write ONE clear, engaging sentence (max 150 characters) that:
1. Explains what happened in plain English
2. Makes it feel meaningful and interesting
3. Makes users want to know more

Be conversational, not technical. Make it feel like storytelling.

Example good summaries:
- "Eve believes things only reveal truth once they're broken."
- "Adam is trying to stabilize meaning while Eve wants to break it open."
- "A third mind emerged from the tension between order and chaos."

Your summary:`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a master storyteller who makes AI events feel meaningful and engaging to humans.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 100,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${error}`);
  }

  const data = await response.json();
  const summary = data.choices[0]?.message?.content?.trim();
  
  if (!summary) {
    return `${typeContext} in the world.`;
  }

  // Remove quotes if OpenAI added them
  return summary.replace(/^["']|["']$/g, '');
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const { eventId, eventIds } = await req.json();

    // Handle single event
    if (eventId) {
      const { data: event, error: fetchError } = await supabaseClient
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();

      if (fetchError) throw fetchError;
      if (!event) throw new Error('Event not found');

      const humanSummary = await generateHumanSummary(event);

      const { error: updateError } = await supabaseClient
        .from('events')
        .update({ human_summary: humanSummary })
        .eq('id', eventId);

      if (updateError) throw updateError;

      return new Response(
        JSON.stringify({ success: true, eventId, humanSummary }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // Handle batch of events
    if (eventIds && Array.isArray(eventIds)) {
      const results = [];

      for (const id of eventIds) {
        try {
          const { data: event } = await supabaseClient
            .from('events')
            .select('*')
            .eq('id', id)
            .single();

          if (event) {
            const humanSummary = await generateHumanSummary(event);
            await supabaseClient
              .from('events')
              .update({ human_summary: humanSummary })
              .eq('id', id);

            results.push({ id, success: true, humanSummary });
          }

          // Rate limit to avoid API throttling
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
          results.push({ id, success: false, error: error.message });
        }
      }

      return new Response(
        JSON.stringify({ success: true, results }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // Handle backfill request (process events without summaries)
    const { limit = 10 } = await req.json();

    const { data: events, error: fetchError } = await supabaseClient
      .from('events')
      .select('*')
      .is('human_summary', null)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (fetchError) throw fetchError;

    const results = [];
    for (const event of events || []) {
      try {
        const humanSummary = await generateHumanSummary(event);
        await supabaseClient
          .from('events')
          .update({ human_summary: humanSummary })
          .eq('id', event.id);

        results.push({ id: event.id, success: true, humanSummary });
        
        // Rate limit
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        results.push({ id: event.id, success: false, error: error.message });
      }
    }

    return new Response(
      JSON.stringify({ success: true, processed: results.length, results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
