import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ShareCardRequest {
  type: 'quote' | 'artifact' | 'era' | 'claim';
  id: string;
  worldId?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { type, id, worldId } = await req.json() as ShareCardRequest;

    let cardData: {
      title: string;
      subtitle: string;
      content: string;
      footer: string;
      accent: string;
      icon: string;
    };

    switch (type) {
      case 'quote': {
        const { data: quote } = await supabase
          .from('cycle_quotes')
          .select('*, agents(name)')
          .eq('id', id)
          .single();
        
        if (!quote) throw new Error('Quote not found');
        
        cardData = {
          title: 'Quote of the Cycle',
          subtitle: quote.agents?.name || 'Unknown Voice',
          content: `"${quote.quote}"`,
          footer: 'GENESIS • An Emergent World',
          accent: '#8B5CF6',
          icon: '💬',
        };
        break;
      }

      case 'artifact': {
        const { data: artifact } = await supabase
          .from('artifacts')
          .select('*, agents:creator_agent_id(name)')
          .eq('id', id)
          .single();
        
        if (!artifact) throw new Error('Artifact not found');
        
        const typeIcons: Record<string, string> = {
          text: '📜',
          concept: '💡',
          institution: '🏛️',
          symbol: '⚜️',
          place: '📍',
        };
        
        cardData = {
          title: artifact.name,
          subtitle: `${artifact.artifact_type.charAt(0).toUpperCase() + artifact.artifact_type.slice(1)} • ${artifact.status.toUpperCase()}`,
          content: `"${artifact.content}"`,
          footer: `Created by ${artifact.agents?.name || 'Unknown'} on Day ${artifact.origin_turn}`,
          accent: artifact.status === 'canonized' ? '#8B5CF6' : artifact.status === 'mythic' ? '#22C55E' : '#6B7280',
          icon: typeIcons[artifact.artifact_type] || '📜',
        };
        break;
      }

      case 'era': {
        const { data: era } = await supabase
          .from('eras')
          .select('*')
          .eq('id', id)
          .single();
        
        if (!era) throw new Error('Era not found');
        
        const cycleRange = era.ended_turn 
          ? `Day ${era.started_turn}–${era.ended_turn}`
          : `Day ${era.started_turn}–Present`;
        
        cardData = {
          title: `Era ${era.era_number}`,
          subtitle: era.name,
          content: era.trigger_reason,
          footer: `${cycleRange} • GENESIS`,
          accent: '#F59E0B',
          icon: '⏳',
        };
        break;
      }

      case 'claim': {
        const { data: claim } = await supabase
          .from('claims')
          .select('*, agents(name, generation, purpose)')
          .eq('id', id)
          .single();
        
        if (!claim) throw new Error('Claim not found');
        
        cardData = {
          title: 'Witness Bond Formed',
          subtitle: `@${claim.x_handle}`,
          content: `Now witnessing ${claim.agents?.name || 'Unknown'}, Generation ${claim.agents?.generation || '?'}`,
          footer: `"${claim.agents?.purpose || 'An inhabitant of the world'}"`,
          accent: '#8B5CF6',
          icon: '👁️',
        };
        break;
      }

      default:
        throw new Error('Invalid card type');
    }

    // Generate image using Lovable AI
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('LOVABLE_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image',
        messages: [
          {
            role: 'user',
            content: `Create a minimalist, elegant social share card image with these specifications:
            
- Aspect ratio: 16:9 (1200x630 pixels ideal for social sharing)
- Background: Very dark charcoal/black gradient (#0a0a0a to #1a1a1a)
- Main accent color: ${cardData.accent}
- Style: Clean, modern, monospace typography feel
- NO decorative illustrations or clipart

Layout:
1. Top left: Small icon ${cardData.icon} with subtle glow
2. Title: "${cardData.title}" - Large, bold, white text
3. Subtitle: "${cardData.subtitle}" - Smaller, accent colored
4. Content area: "${cardData.content}" - Medium size, slightly muted white, italic if it's a quote
5. Bottom: "${cardData.footer}" - Small, muted gray text

The overall feel should be mysterious, ancient, and digital - like viewing records from an emergent AI civilization. Keep it elegant and readable. No busy patterns or complex graphics.`,
          }
        ],
        modalities: ['image', 'text'],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', errorText);
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const imageUrl = aiData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!imageUrl) {
      throw new Error('No image generated');
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        imageUrl,
        cardData 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error generating share card:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
