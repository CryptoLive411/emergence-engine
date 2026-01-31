import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Server-side X handle validation
const X_HANDLE_REGEX = /^[a-zA-Z0-9_]{1,15}$/;

function validateXHandle(handle: string): { valid: boolean; normalized?: string; error?: string } {
  if (!handle || typeof handle !== 'string') {
    return { valid: false, error: 'X handle is required' };
  }
  
  const normalized = handle.toLowerCase().replace('@', '').trim();
  
  if (!normalized) {
    return { valid: false, error: 'X handle is required' };
  }
  
  if (normalized.length > 15) {
    return { valid: false, error: 'X handle must be 15 characters or less' };
  }
  
  if (!X_HANDLE_REGEX.test(normalized)) {
    return { valid: false, error: 'X handle can only contain letters, numbers, and underscores' };
  }
  
  return { valid: true, normalized };
}

function validateAnnotationContent(content: string): { valid: boolean; sanitized?: string; error?: string } {
  if (!content || typeof content !== 'string') {
    return { valid: false, error: 'Content is required' };
  }
  
  const trimmed = content.trim();
  
  if (!trimmed) {
    return { valid: false, error: 'Content cannot be empty' };
  }
  
  if (trimmed.length > 500) {
    return { valid: false, error: 'Content must be 500 characters or less' };
  }
  
  return { valid: true, sanitized: trimmed };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { action, ...params } = await req.json();

    switch (action) {
      case 'claim-agent': {
        const { agentId, xHandle } = params;
        
        // Validate X handle
        const handleValidation = validateXHandle(xHandle);
        if (!handleValidation.valid) {
          return new Response(
            JSON.stringify({ error: handleValidation.error }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        const normalizedHandle = handleValidation.normalized!;
        
        // Check if user already has a claim
        const { data: existingUserClaim } = await supabase
          .from('claims')
          .select('*')
          .eq('x_handle', normalizedHandle)
          .maybeSingle();
        
        if (existingUserClaim) {
          return new Response(
            JSON.stringify({ error: 'You have already claimed an inhabitant. One claim per soul.' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        // Check if agent is already claimed
        const { data: existingAgentClaim } = await supabase
          .from('claims')
          .select('*')
          .eq('agent_id', agentId)
          .maybeSingle();
        
        if (existingAgentClaim) {
          return new Response(
            JSON.stringify({ error: 'This inhabitant has already been claimed.' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        // Verify agent exists
        const { data: agent } = await supabase
          .from('agents')
          .select('id')
          .eq('id', agentId)
          .single();
        
        if (!agent) {
          return new Response(
            JSON.stringify({ error: 'Agent not found' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        // Create the claim
        const { data, error } = await supabase
          .from('claims')
          .insert({
            agent_id: agentId,
            x_handle: normalizedHandle,
          })
          .select()
          .single();
        
        if (error) throw error;
        
        return new Response(
          JSON.stringify({ success: true, claim: data }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      case 'add-annotation': {
        const { eventId, xHandle, annotationType, content } = params;
        
        // Validate X handle
        const handleValidation = validateXHandle(xHandle);
        if (!handleValidation.valid) {
          return new Response(
            JSON.stringify({ error: handleValidation.error }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        const normalizedHandle = handleValidation.normalized!;
        
        // Validate annotation type
        if (!['highlight', 'tag', 'note'].includes(annotationType)) {
          return new Response(
            JSON.stringify({ error: 'Invalid annotation type' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        // Validate content
        const contentValidation = validateAnnotationContent(content);
        if (!contentValidation.valid) {
          return new Response(
            JSON.stringify({ error: contentValidation.error }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        // Verify event exists
        const { data: event } = await supabase
          .from('events')
          .select('id')
          .eq('id', eventId)
          .single();
        
        if (!event) {
          return new Response(
            JSON.stringify({ error: 'Event not found' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        // Create the annotation
        const { data, error } = await supabase
          .from('annotations')
          .insert({
            event_id: eventId,
            x_handle: normalizedHandle,
            annotation_type: annotationType,
            content: contentValidation.sanitized!,
          })
          .select()
          .single();
        
        if (error) throw error;
        
        return new Response(
          JSON.stringify({ success: true, annotation: data }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      case 'release-claim': {
        const { claimId, xHandle } = params;
        
        // Validate X handle
        const handleValidation = validateXHandle(xHandle);
        if (!handleValidation.valid) {
          return new Response(
            JSON.stringify({ error: handleValidation.error }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        const normalizedHandle = handleValidation.normalized!;
        
        // Verify the claim belongs to this user
        const { data: claim } = await supabase
          .from('claims')
          .select('*')
          .eq('id', claimId)
          .eq('x_handle', normalizedHandle)
          .single();
        
        if (!claim) {
          return new Response(
            JSON.stringify({ error: 'Claim not found or not owned by you' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        // Delete the claim
        const { error } = await supabase
          .from('claims')
          .delete()
          .eq('id', claimId);
        
        if (error) throw error;
        
        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      default:
        return new Response(
          JSON.stringify({ error: `Unknown action: ${action}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

  } catch (error: unknown) {
    console.error('Custodianship error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
