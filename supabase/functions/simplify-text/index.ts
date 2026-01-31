import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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

    const { title, content, eventType } = await req.json();

    if (!content) {
      throw new Error('Content is required');
    }

    // Call Lovable AI using the correct endpoint
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
            content: `You are a helpful assistant that explains things in very simple, plain English. 
Your job is to take formal or complex text and rewrite it so that:
- A 10-year-old could understand it
- Someone learning English could understand it
- No fancy words or metaphors
- Short sentences only
- Be warm and friendly

Keep the same meaning but make it MUCH simpler. Be brief - 1-2 sentences max.`
          },
          {
            role: 'user',
            content: `Please explain this in simple words:

Title: ${title || 'Event'}
Type: ${eventType || 'update'}
What happened: ${content}`
          }
        ],
        max_tokens: 150,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      throw new Error(`AI request failed: ${response.status}`);
    }

    const data = await response.json();
    const simplifiedText = data.choices?.[0]?.message?.content || 'Could not simplify this text.';

    return new Response(
      JSON.stringify({ simplified: simplifiedText }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Simplify text error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
