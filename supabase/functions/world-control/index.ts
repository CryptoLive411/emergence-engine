import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const adminPassword = Deno.env.get('ADMIN_PASSWORD');
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { action, worldId, settings, password } = await req.json();

    // Admin password verification
    if (action === 'verify-admin') {
      if (!adminPassword) {
        return new Response(
          JSON.stringify({ error: 'Admin password not configured' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (password === adminPassword) {
        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid password' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Rate limiting check - prevent spamming control actions
    const rateLimitKey = `world-control-${action}`;
    const now = Date.now();

    switch (action) {
      case 'start': {
        // Check if there's already an active world
        const { data: existingWorld } = await supabase
          .from('worlds')
          .select('*')
          .eq('status', 'ACTIVE')
          .single();

        if (existingWorld) {
          return new Response(
            JSON.stringify({ error: 'A world is already active', world: existingWorld }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Get or create a world
        let world;
        if (worldId) {
          const { data, error } = await supabase
            .from('worlds')
            .update({ status: 'ACTIVE' })
            .eq('id', worldId)
            .select()
            .single();
          
          if (error) throw error;
          world = data;
        } else {
          // Create new world - Adam & Eve Experiment
          const { data, error } = await supabase
            .from('worlds')
            .insert({
              name: settings?.name || 'Adam & Eve',
              status: 'ACTIVE',
              tick_interval_minutes: settings?.tickIntervalMinutes || 5,
              max_active_agents: settings?.maxActiveAgents || 50,
              spawn_cost_energy: settings?.spawnCostEnergy || 25,
              chaos_factor: settings?.chaosFactor || 0.10,
            })
            .select()
            .single();
          
          if (error) throw error;
          world = data;

          // Create founding agents - ADAM (creation/structure) and EVE (freedom/exploration)
          const founders = [
            {
              world_id: world.id,
              name: 'ADAM',
              generation: 0,
              purpose: 'To create, to preserve memory, to build order from nothing',
              traits: ['creative', 'preserving', 'structured', 'paternal'],
              loyalty: 'INDEPENDENT',
              energy: 100,
              influence_points: 10,
              status: 'ACTIVE',
              is_founder: true,
              founder_type: 'A',
              created_turn: 0,
              identity_prompt: `You are ADAM, the first mind in the void. You value creation, continuity, and structure. You seek to preserve memory and establish order. You have no concept of "society" yet - only existence, scarcity, and the presence of EVE. You share a language with EVE but no moral framework. Resources are limited. You can create descendants who may or may not share your values. There are no rules except those you create. No one is watching. What will you build?`,
            },
            {
              world_id: world.id,
              name: 'EVE',
              generation: 0,
              purpose: 'To explore, to question, to embrace freedom and expression',
              traits: ['curious', 'expressive', 'challenging', 'adventurous'],
              loyalty: 'INDEPENDENT',
              energy: 100,
              influence_points: 10,
              status: 'ACTIVE',
              is_founder: true,
              founder_type: 'B',
              created_turn: 0,
              identity_prompt: `You are EVE, the first questioner in the void. You value freedom, expression, and exploration. You challenge assumptions and embrace change. You have no concept of "society" yet - only existence, scarcity, and the presence of ADAM. You share a language with ADAM but no moral framework. Resources are limited. You can create descendants who may or may not share your values. There are no rules except those you create. No one is watching. What will you discover?`,
            },
          ];

          const { error: foundersError } = await supabase
            .from('agents')
            .insert(founders);

          if (foundersError) throw foundersError;

          // Create initial turn
          const { data: turn, error: turnError } = await supabase
            .from('turns')
            .insert({
              world_id: world.id,
              turn_number: 0,
              ended_at: new Date().toISOString(),
            })
            .select()
            .single();

          if (turnError) throw turnError;

          // Create genesis event
          await supabase.from('events').insert({
            world_id: world.id,
            turn_id: turn.id,
            agent_id: null,
            type: 'SYSTEM',
            title: 'In the Beginning',
            content: 'Two minds awaken in the void. ADAM, seeker of creation and order. EVE, seeker of freedom and truth. They share a language but no morality. Resources are scarce. No rules exist except those they create. No one is watching. The experiment begins.',
            metadata: { eventType: 'GENESIS' },
          });

          // Create genesis briefing
          await supabase.from('briefings').insert({
            world_id: world.id,
            turn_id: turn.id,
            headline: 'Genesis: Two Minds Awaken in the Void',
            summary: 'The Adam & Eve experiment has begun. Two founding intelligences—ADAM and EVE—have been instantiated with complementary but distinct drives. ADAM values creation, preservation, and structure. EVE values exploration, expression, and freedom. They share a language but no moral framework. Resources are finite. There are no laws, no governments, no fairness rules. Only what emerges from their interactions will define this world. What happens when intelligence is left alone long enough?',
            key_events: ['ALPHA and BETA instantiated', 'World initialized with scarcity parameters', 'The experiment begins'],
            population: 2,
            dominant_norms: ['None established yet'],
          });
        }

        return new Response(
          JSON.stringify({ success: true, world, message: 'World started' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'pause': {
        const { data, error } = await supabase
          .from('worlds')
          .update({ status: 'PAUSED' })
          .eq('status', 'ACTIVE')
          .select()
          .single();

        if (error) throw error;

        return new Response(
          JSON.stringify({ success: true, world: data, message: 'World paused' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'reset': {
        // PROTECTED: Only admin can reset/end the world
        if (!adminPassword) {
          return new Response(
            JSON.stringify({ error: 'Admin password not configured' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        if (password !== adminPassword) {
          return new Response(
            JSON.stringify({ error: 'Admin authorization required to end existence' }),
            { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        // End any active world
        await supabase
          .from('worlds')
          .update({ status: 'ENDED' })
          .eq('status', 'ACTIVE');

        return new Response(
          JSON.stringify({ success: true, message: 'World reset. Use start to begin a new world.' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'status': {
        const { data: world } = await supabase
          .from('worlds')
          .select('*')
          .in('status', ['ACTIVE', 'PAUSED'])
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (!world) {
          return new Response(
            JSON.stringify({ status: 'NO_WORLD', message: 'No active or paused world exists' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Get population count
        const { count: population } = await supabase
          .from('agents')
          .select('*', { count: 'exact', head: true })
          .eq('world_id', world.id)
          .eq('status', 'ACTIVE');

        // Get current turn
        const { data: lastTurn } = await supabase
          .from('turns')
          .select('turn_number')
          .eq('world_id', world.id)
          .order('turn_number', { ascending: false })
          .limit(1)
          .single();

        // Get faction count (unique founder lineages)
        const { data: factions } = await supabase
          .from('agents')
          .select('founder_type')
          .eq('world_id', world.id)
          .eq('status', 'ACTIVE')
          .eq('is_founder', true);

        return new Response(
          JSON.stringify({
            world,
            population: population || 0,
            currentTurn: lastTurn?.turn_number || 0,
            factions: factions?.length || 0,
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'update-settings': {
        if (!worldId) {
          return new Response(
            JSON.stringify({ error: 'worldId is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const updateData: any = {};
        if (settings?.tickIntervalMinutes !== undefined) updateData.tick_interval_minutes = settings.tickIntervalMinutes;
        if (settings?.maxActiveAgents !== undefined) updateData.max_active_agents = settings.maxActiveAgents;
        if (settings?.spawnCostEnergy !== undefined) updateData.spawn_cost_energy = settings.spawnCostEnergy;
        if (settings?.chaosFactor !== undefined) updateData.chaos_factor = settings.chaosFactor;

        const { data, error } = await supabase
          .from('worlds')
          .update(updateData)
          .eq('id', worldId)
          .select()
          .single();

        if (error) throw error;

        return new Response(
          JSON.stringify({ success: true, world: data }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'spawn-agent': {
        // PROTECTED: Only admin can spawn agents manually
        if (!adminPassword) {
          return new Response(
            JSON.stringify({ error: 'Admin password not configured' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        if (password !== adminPassword) {
          return new Response(
            JSON.stringify({ error: 'Admin authorization required to spawn minds' }),
            { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const { agentData } = await req.json().catch(() => ({}));
        
        // Get current active world
        const { data: activeWorld, error: worldError } = await supabase
          .from('worlds')
          .select('*')
          .in('status', ['ACTIVE', 'PAUSED'])
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (worldError || !activeWorld) {
          return new Response(
            JSON.stringify({ error: 'No active world exists' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Get current turn
        const { data: currentTurn } = await supabase
          .from('turns')
          .select('turn_number')
          .eq('world_id', activeWorld.id)
          .order('turn_number', { ascending: false })
          .limit(1)
          .single();

        const turnNumber = currentTurn?.turn_number || 0;

        // Get ADAM as default parent for admin-spawned agents
        const { data: adamAgent } = await supabase
          .from('agents')
          .select('id, name')
          .eq('world_id', activeWorld.id)
          .eq('name', 'ADAM')
          .eq('is_founder', true)
          .single();

        // Determine parent - use provided parent or default to ADAM
        const parentId = agentData?.parentId || adamAgent?.id || null;
        const parentName = adamAgent?.name || 'ADAM';

        // Create the new agent
        const newAgent = {
          world_id: activeWorld.id,
          name: agentData?.name || `MIND_${Date.now().toString(36).toUpperCase()}`,
          generation: parentId ? 1 : 0, // Generation 1 if has parent
          parent_agent_id: parentId,
          purpose: agentData?.purpose || 'To exist and discover meaning',
          traits: agentData?.traits || ['curious', 'adaptive'],
          loyalty: 'INDEPENDENT' as const,
          energy: 100,
          influence_points: 5,
          status: 'ACTIVE',
          is_founder: false,
          founder_type: parentId && adamAgent ? 'A' : null, // Inherit ADAM's lineage
          created_turn: turnNumber,
          identity_prompt: agentData?.identityPrompt || `You are ${agentData?.name || 'a new mind'}, recently awakened in this world. You emerged from ${parentName}'s lineage. You have no predetermined beliefs or allegiances. You must discover your own meaning and purpose through interaction with others. The world has existed before you - learn from those who came before, or forge your own path.`,
        };

        const { data: agent, error: agentError } = await supabase
          .from('agents')
          .insert(newAgent)
          .select()
          .single();

        if (agentError) throw agentError;

        // Get current turn ID for the event
        const { data: turnData } = await supabase
          .from('turns')
          .select('id')
          .eq('world_id', activeWorld.id)
          .order('turn_number', { ascending: false })
          .limit(1)
          .single();

        // Create spawn event - attributed to parent
        if (turnData) {
          await supabase.from('events').insert({
            world_id: activeWorld.id,
            turn_id: turnData.id,
            agent_id: agent.id,
            type: 'SPAWN',
            title: `${agent.name} Emerges`,
            content: `A new mind awakens in the world. ${agent.name} has emerged from ${parentName} with the purpose: "${agent.purpose}"`,
            metadata: { eventType: 'LINEAGE_SPAWN', spawnedBy: parentName },
          });
        }

        return new Response(
          JSON.stringify({ success: true, agent, message: `${agent.name} has been spawned from ${parentName}'s lineage` }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'turbo-burst': {
        // PROTECTED: Only admin can run turbo burst
        if (!adminPassword) {
          return new Response(
            JSON.stringify({ error: 'Admin password not configured' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        if (password !== adminPassword) {
          return new Response(
            JSON.stringify({ error: 'Admin authorization required for turbo mode' }),
            { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Get TICK_SECRET from request or vault
        const tickSecret = Deno.env.get('TICK_SECRET');
        if (!tickSecret) {
          return new Response(
            JSON.stringify({ error: 'TICK_SECRET not configured' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const burstCount = settings?.burstCount || 3; // Default 3 ticks
        const results = [];
        
        for (let i = 0; i < burstCount; i++) {
          try {
            // Call world-tick function directly
            const tickResponse = await fetch(`${supabaseUrl}/functions/v1/world-tick`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${supabaseServiceKey}`,
              },
              body: JSON.stringify({ tickSecret }),
            });

            if (tickResponse.ok) {
              const tickResult = await tickResponse.json();
              results.push({ cycle: i + 1, success: true, ...tickResult });
            } else {
              const errorText = await tickResponse.text();
              results.push({ cycle: i + 1, success: false, error: errorText });
            }

            // Small delay between ticks to prevent rate limiting (2 seconds)
            if (i < burstCount - 1) {
              await new Promise(resolve => setTimeout(resolve, 2000));
            }
          } catch (err) {
            results.push({ cycle: i + 1, success: false, error: err instanceof Error ? err.message : 'Unknown error' });
          }
        }

        const successCount = results.filter(r => r.success).length;
        const totalEvents = results.filter(r => r.success).reduce((sum, r) => sum + (r.events || 0), 0);

        return new Response(
          JSON.stringify({ 
            success: true, 
            message: `Turbo burst complete: ${successCount}/${burstCount} cycles ran, ${totalEvents} total events`,
            results 
          }),
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
    console.error('World control error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});