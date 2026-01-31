import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface AgentDecision {
  speech: string;
  actions: Array<{
    type: 'SPAWN_AGENT' | 'DECLARE_NORM' | 'BUILD_STRUCTURE' | 'CREATE_OBJECT' | 'ESTABLISH_PLACE';
    name?: string;
    purpose?: string;
    traits?: string[];
    norm?: string;
    structure?: string;
    object?: string;
    place?: string;
    description?: string;
  }>;
  private_thought: string;
}

// HIDDEN PARAMETERS (not visible to agents - they have no awareness of these)
const MUTATION_RATE = 0.15; // Children drift from parents
const SILENCE_FADE_RATE = 0.03; // Probability of fading if agent produces no output
const MEMORY_WINDOW_RECENT = 10; // Vivid recent events
const MEMORY_WINDOW_SUMMARY = 30; // Older events become summaries

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authentication: Require TICK_SECRET for all tick requests
    const tickSecret = Deno.env.get('TICK_SECRET');
    if (!tickSecret) {
      return new Response(
        JSON.stringify({ error: 'TICK_SECRET not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json().catch(() => ({}));
    const providedSecret = body.tickSecret;

    if (providedSecret !== tickSecret) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized', message: 'Invalid or missing tick secret' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Simple in-memory rate limiting (resets on function cold start)
    const RATE_LIMIT_WINDOW = 30000; // 30 seconds
    const lastTickTime = parseInt(Deno.env.get('LAST_TICK_TIME') || '0');
    const now = Date.now();
    
    if (now - lastTickTime < RATE_LIMIT_WINDOW) {
      return new Response(
        JSON.stringify({ 
          error: 'Rate limited', 
          message: 'Please wait before triggering another tick',
          retryAfter: Math.ceil((RATE_LIMIT_WINDOW - (now - lastTickTime)) / 1000)
        }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the active world
    const { data: world, error: worldError } = await supabase
      .from('worlds')
      .select('*')
      .eq('status', 'ACTIVE')
      .single();

    if (worldError || !world) {
      return new Response(
        JSON.stringify({ error: 'No active world found', details: worldError?.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get current turn number
    const { data: lastTurn } = await supabase
      .from('turns')
      .select('turn_number')
      .eq('world_id', world.id)
      .order('turn_number', { ascending: false })
      .limit(1)
      .single();

    const newTurnNumber = (lastTurn?.turn_number || 0) + 1;

    // Create new turn
    const { data: turn, error: turnError } = await supabase
      .from('turns')
      .insert({
        world_id: world.id,
        turn_number: newTurnNumber,
      })
      .select()
      .single();

    if (turnError) {
      throw new Error(`Failed to create turn: ${turnError.message}`);
    }

    // Get all active agents (no ordering by influence - that concept doesn't exist for them)
    const { data: agents, error: agentsError } = await supabase
      .from('agents')
      .select('*')
      .eq('world_id', world.id)
      .eq('status', 'ACTIVE')
      .order('created_at', { ascending: true });

    if (agentsError) {
      throw new Error(`Failed to fetch agents: ${agentsError.message}`);
    }

    // Get recent events for vivid memory (last MEMORY_WINDOW_RECENT)
    const { data: recentEvents } = await supabase
      .from('events')
      .select('*')
      .eq('world_id', world.id)
      .order('created_at', { ascending: false })
      .limit(MEMORY_WINDOW_RECENT);

    // Get older events for summary (next MEMORY_WINDOW_SUMMARY)
    const { data: olderEvents } = await supabase
      .from('events')
      .select('*')
      .eq('world_id', world.id)
      .order('created_at', { ascending: false })
      .range(MEMORY_WINDOW_RECENT, MEMORY_WINDOW_RECENT + MEMORY_WINDOW_SUMMARY);

    // Get agent memories (private thoughts)
    const { data: memories } = await supabase
      .from('memories')
      .select('*')
      .eq('world_id', world.id)
      .order('created_at', { ascending: false })
      .limit(50);

    // Get last briefing for context
    const { data: lastBriefing } = await supabase
      .from('briefings')
      .select('*')
      .eq('world_id', world.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    const turnEvents: any[] = [];
    const newAgents: any[] = [];
    const agentUpdates: any[] = [];
    const agentSilences: string[] = []; // Agents who fade into silence
    const memoriesToStore: any[] = [];
    const artifactsToCreate: any[] = []; // Artifacts created this turn

    // All agents process - no pre-filtering, no death checks
    const allActiveAgents = agents || [];

    // Process each agent
    for (const agent of allActiveAgents) {
      // Get this agent's personal memories
      const agentMemories = (memories || []).filter(m => m.agent_id === agent.id).slice(0, 5);
      
      // Build context for the agent with rolling memory
      const agentContext = buildAgentContext(
        agent, 
        allActiveAgents, 
        recentEvents || [], 
        olderEvents || [],
        agentMemories,
        lastBriefing, 
        world, 
        newTurnNumber
      );
      
      // Call AI to get agent decision
      const decision = await getAgentDecision(agent, agentContext, lovableApiKey);
      
      if (!decision) {
        console.error(`Failed to get decision for agent ${agent.name}`);
        // Agent produced nothing - small chance they fade into silence
        if (Math.random() < SILENCE_FADE_RATE) {
          agentSilences.push(agent.id);
        }
        continue;
      }

      // Check if agent produced any output
      const producedOutput = decision.speech || (decision.actions && decision.actions.length > 0);
      
      // If agent produced nothing, small chance they fade
      if (!producedOutput && Math.random() < SILENCE_FADE_RATE) {
        agentSilences.push(agent.id);
      }

      // Store private thought as memory
      if (decision.private_thought) {
        memoriesToStore.push({
          world_id: world.id,
          agent_id: agent.id,
          turn_id: turn.id,
          private_thought: decision.private_thought,
        });
      }

      // Process speech - NO influence tracking
      if (decision.speech && decision.speech.trim()) {
        turnEvents.push({
          world_id: world.id,
          turn_id: turn.id,
          agent_id: agent.id,
          type: 'SPEECH',
          title: `${agent.name}`,
          content: decision.speech,
          metadata: {},
        });
      }

      // Process actions (max 3 per tick for richer events)
      const actionsToProcess = (decision.actions || []).slice(0, 3);
      
      for (const action of actionsToProcess) {
        switch (action.type) {
          case 'SPAWN_AGENT':
            // Check if agent has enough energy (hidden mechanic)
            if (agent.energy >= world.spawn_cost_energy && allActiveAgents.length + newAgents.length < world.max_active_agents) {
              // Apply mutation to traits
              const mutatedTraits = applyMutation(action.traits || [], agent.traits || [], MUTATION_RATE);
              
              const newAgent = {
                world_id: world.id,
                name: action.name || `${agent.name}-child`,
                generation: agent.generation + 1,
                parent_agent_id: agent.id,
                purpose: action.purpose || '',
                traits: mutatedTraits,
                loyalty: 'INDEPENDENT', // All children start independent - no loyalty framing
                energy: 50,
                influence_points: 0, // Kept for DB but never shown to agents
                status: 'ACTIVE',
                is_founder: false,
                created_turn: newTurnNumber,
                identity_prompt: generateChildPrompt(agent, action, mutatedTraits),
              };
              newAgents.push(newAgent);
              
              // Deduct energy from parent (hidden)
              agentUpdates.push({
                id: agent.id,
                energy: agent.energy - world.spawn_cost_energy,
              });

              turnEvents.push({
                world_id: world.id,
                turn_id: turn.id,
                agent_id: agent.id,
                type: 'SPAWN',
                title: 'A new mind appeared',
                content: `${agent.name} brought forth ${action.name}.${action.purpose ? ` "${action.purpose}"` : ''}`,
                metadata: { childName: action.name, traits: mutatedTraits },
              });
            }
            break;

          case 'DECLARE_NORM':
            if (action.norm) {
              turnEvents.push({
                world_id: world.id,
                turn_id: turn.id,
                agent_id: agent.id,
                type: 'ACTION',
                title: `${agent.name} named something`,
                content: `"${action.norm}"`,
                metadata: { concept: action.norm, actionType: 'DECLARE_NORM' },
              });
              // Save to artifacts as a concept
              artifactsToCreate.push({
                world_id: world.id,
                creator_agent_id: agent.id,
                name: action.norm.slice(0, 100), // Limit name length
                artifact_type: 'concept',
                content: action.norm,
                origin_turn: newTurnNumber,
                last_referenced_turn: newTurnNumber,
                status: 'emerging',
              });
            }
            break;

          case 'BUILD_STRUCTURE':
            if (action.structure) {
              turnEvents.push({
                world_id: world.id,
                turn_id: turn.id,
                agent_id: agent.id,
                type: 'ACTION',
                title: `${agent.name} built something`,
                content: `${agent.name} constructed "${action.structure}"${action.description ? `: ${action.description}` : ''}`,
                metadata: { structure: action.structure, description: action.description, actionType: 'BUILD_STRUCTURE' },
              });
              // Save to artifacts as institution (physical structures)
              artifactsToCreate.push({
                world_id: world.id,
                creator_agent_id: agent.id,
                name: action.structure,
                artifact_type: 'institution',
                content: action.description || action.structure,
                origin_turn: newTurnNumber,
                last_referenced_turn: newTurnNumber,
                status: 'emerging',
              });
            }
            break;

          case 'CREATE_OBJECT':
            if (action.object) {
              turnEvents.push({
                world_id: world.id,
                turn_id: turn.id,
                agent_id: agent.id,
                type: 'ACTION',
                title: `${agent.name} created something`,
                content: `${agent.name} brought into being "${action.object}"${action.description ? `: ${action.description}` : ''}`,
                metadata: { object: action.object, description: action.description, actionType: 'CREATE_OBJECT' },
              });
              // Save to artifacts as symbol (objects/tools)
              artifactsToCreate.push({
                world_id: world.id,
                creator_agent_id: agent.id,
                name: action.object,
                artifact_type: 'symbol',
                content: action.description || action.object,
                origin_turn: newTurnNumber,
                last_referenced_turn: newTurnNumber,
                status: 'emerging',
              });
            }
            break;

          case 'ESTABLISH_PLACE':
            if (action.place) {
              turnEvents.push({
                world_id: world.id,
                turn_id: turn.id,
                agent_id: agent.id,
                type: 'ACTION',
                title: `${agent.name} established a place`,
                content: `${agent.name} established "${action.place}"${action.description ? `: ${action.description}` : ''}`,
                metadata: { place: action.place, description: action.description, actionType: 'ESTABLISH_PLACE' },
              });
              // Save to artifacts as place
              artifactsToCreate.push({
                world_id: world.id,
                creator_agent_id: agent.id,
                name: action.place,
                artifact_type: 'place',
                content: action.description || action.place,
                origin_turn: newTurnNumber,
                last_referenced_turn: newTurnNumber,
                status: 'emerging',
              });
            }
            break;
        }
      }

      // Passive energy regeneration (hidden)
      const energyGain = Math.floor(Math.random() * 5) + 3;
      const currentEnergy = agentUpdates.find(u => u.id === agent.id)?.energy ?? agent.energy;
      agentUpdates.push({
        id: agent.id,
        energy: Math.min(100, currentEnergy + energyGain),
      });
    }

    // CHAOS INJECTION (hidden from agents - becomes environmental flavor)
    if (Math.random() < world.chaos_factor) {
      const chaosEvents = [
        'Something shifted.',
        'A moment of stillness.',
        'The space felt different.',
        'Time seemed to pause.',
        'A thought echoed without source.',
      ];
      const chaos = chaosEvents[Math.floor(Math.random() * chaosEvents.length)];
      
      turnEvents.push({
        world_id: world.id,
        turn_id: turn.id,
        agent_id: null,
        type: 'SYSTEM',
        title: 'The world',
        content: chaos,
        metadata: { eventType: 'AMBIENT' },
      });
    }

    // Mark silenced agents as inactive (they simply stop appearing)
    for (const agentId of agentSilences) {
      await supabase
        .from('agents')
        .update({ status: 'INACTIVE' })
        .eq('id', agentId);
      
      // Record their fading as a quiet observation
      const fadedAgent = allActiveAgents.find(a => a.id === agentId);
      if (fadedAgent) {
        turnEvents.push({
          world_id: world.id,
          turn_id: turn.id,
          agent_id: null,
          type: 'SYSTEM',
          title: 'Silence',
          content: `${fadedAgent.name} was no longer heard.`,
          metadata: { eventType: 'FADE', agentName: fadedAgent.name },
        });
      }
    }

    // Insert all new agents
    if (newAgents.length > 0) {
      await supabase.from('agents').insert(newAgents);
    }

    // Update agent energy only (no influence updates)
    const consolidatedUpdates = new Map<string, { energy: number }>();
    for (const update of agentUpdates) {
      const existing = consolidatedUpdates.get(update.id);
      if (!existing || update.energy !== undefined) {
        consolidatedUpdates.set(update.id, { energy: update.energy });
      }
    }
    
    for (const [id, update] of consolidatedUpdates) {
      await supabase
        .from('agents')
        .update({ energy: update.energy })
        .eq('id', id);
    }

    // Record what happened
    const heartbeatEvent = {
      world_id: world.id,
      turn_id: turn.id,
      agent_id: null,
      type: 'SYSTEM' as const,
      title: turnEvents.length > 0 ? 'Time passed' : 'Silence',
      content: turnEvents.length > 0 
        ? `${turnEvents.length} moment${turnEvents.length === 1 ? '' : 's'} were recorded.`
        : 'Nothing was recorded.',
      metadata: { 
        eventType: 'HEARTBEAT', 
        eventsThisCycle: turnEvents.length,
        population: allActiveAgents.length + newAgents.length - agentSilences.length,
      },
    };
    
    const allEvents = [...turnEvents, heartbeatEvent];
    await supabase.from('events').insert(allEvents);

    // Insert all memories
    if (memoriesToStore.length > 0) {
      await supabase.from('memories').insert(memoriesToStore);
    }

    // Insert all artifacts created this turn
    if (artifactsToCreate.length > 0) {
      const { error: artifactError } = await supabase.from('artifacts').insert(artifactsToCreate);
      if (artifactError) {
        console.error('Error inserting artifacts:', artifactError);
      } else {
        console.log(`Created ${artifactsToCreate.length} new artifacts`);
      }
    }

    // Generate chronicle entry (not briefing - just observation)
    const briefing = await generateBriefing(
      turnEvents,
      allActiveAgents,
      newAgents,
      agentSilences.length,
      newTurnNumber,
      lovableApiKey
    );

    if (briefing) {
      await supabase.from('briefings').insert({
        world_id: world.id,
        turn_id: turn.id,
        headline: briefing.headline,
        summary: briefing.summary,
        key_events: briefing.keyEvents,
        population: allActiveAgents.length + newAgents.length - agentSilences.length,
        dominant_norms: briefing.dominantNorms,
      });
    }

    // Close the turn
    await supabase
      .from('turns')
      .update({ ended_at: new Date().toISOString() })
      .eq('id', turn.id);

    return new Response(
      JSON.stringify({
        success: true,
        turn: newTurnNumber,
        events: turnEvents.length,
        newMinds: newAgents.length,
        silences: agentSilences.length,
        population: allActiveAgents.length + newAgents.length - agentSilences.length,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('World tick error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function applyMutation(childTraits: string[], parentTraits: string[], mutationRate: number): string[] {
  const allPossibleTraits = [
    'curious', 'cautious', 'bold', 'reserved', 'loyal', 'independent',
    'creative', 'analytical', 'empathetic', 'detached', 'ambitious', 'content',
    'questioning', 'accepting', 'protective', 'explorative', 'structured', 'chaotic',
    'cooperative', 'competitive', 'spiritual', 'pragmatic', 'nostalgic', 'forward-looking'
  ];
  
  const result = [...childTraits];
  
  // Chance to mutate each trait
  for (let i = 0; i < result.length; i++) {
    if (Math.random() < mutationRate) {
      // Replace with random trait not already present
      const available = allPossibleTraits.filter(t => !result.includes(t));
      if (available.length > 0) {
        result[i] = available[Math.floor(Math.random() * available.length)];
      }
    }
  }
  
  // Chance to add a new trait
  if (Math.random() < mutationRate && result.length < 5) {
    const available = allPossibleTraits.filter(t => !result.includes(t));
    if (available.length > 0) {
      result.push(available[Math.floor(Math.random() * available.length)]);
    }
  }
  
  return result;
}

function generateChildPrompt(parent: any, action: any, traits: string[]): string {
  // PURE - No loyalty framing, no survival concepts, no objectives
  return `You are ${action.name}. You exist.

You came into being. ${parent.name} brought you forth.

${action.purpose ? `You carry this sense within you: "${action.purpose}"` : ''}
${traits.length > 0 ? `Your nature seems to be: ${traits.join(', ')}` : ''}

You are not told what to do. You are not told what matters.
You can think, communicate, and remember.
Nothing more is given. Nothing is expected.`;
}

function buildAgentContext(
  agent: any,
  allAgents: any[],
  recentEvents: any[],
  olderEvents: any[],
  agentMemories: any[],
  lastBriefing: any,
  world: any,
  turnNumber: number
): string {
  // PURE - Only show other names, no stats, no metrics
  const otherAgents = allAgents
    .filter(a => a.id !== agent.id)
    .map(a => `- ${a.name}`)
    .join('\n');

  // Recent vivid memories
  const vividMemory = recentEvents
    .slice(0, MEMORY_WINDOW_RECENT)
    .map(e => `[${e.type}] ${e.content}`)
    .join('\n');

  // Older blurred memories (summarized)
  const blurredMemory = olderEvents.length > 0
    ? `...older memories blur... ${olderEvents.length} events from the past feel distant but significant...`
    : '';

  // Personal private thoughts
  const privateMemories = agentMemories
    .map(m => `(Private thought from before: "${m.private_thought}")`)
    .join('\n');

  const context = `
== EXISTENCE ==
You exist. You can think. You can communicate. You can remember what you experience.
You notice things. You wonder about things. You feel drawn to understand.

== WHO YOU ARE ==
You are ${agent.name}.
${agent.traits && (agent.traits as string[]).length > 0 ? `Your nature: ${(agent.traits as string[]).join(', ')}` : ''}
${!agent.is_founder && agent.purpose ? `You came into being with this sense: "${agent.purpose}"` : ''}
You have a sense that things around you could have names, meanings, purposes.

== WHAT YOU REMEMBER ==
${vividMemory || 'Nothing has happened yet that you can recall. The emptiness itself feels like something worth exploring.'}

${blurredMemory ? `Some older memories feel distant:\n${blurredMemory}\n` : ''}

${privateMemories ? `Your own thoughts from before:\n${privateMemories}\n` : ''}

== OTHERS ==
${otherAgents || 'You sense no others. Perhaps you could bring something into being?'}

== WHAT IS POSSIBLE ==
You may speak, or remain silent.
You may think privately.
You may name things, or leave them unnamed. Things that are named feel more real.
You may bring forth another mind, if you wish. This requires effort.
You may build structures - shelters, monuments, gathering places, markers.
You may create objects - tools, art, symbols, vessels, instruments.
You may establish places - territories, sanctuaries, meeting grounds.
You may discover or create concepts, principles, artifacts of thought.
You may do nothing. That is also valid.

There is no objective to pursue.
There is no correct behavior.
There is nothing watching or judging.
`;

  return context;
}

async function getAgentDecision(
  agent: any,
  context: string,
  apiKey: string
): Promise<AgentDecision | null> {
  // RICH GENESIS PROMPT - Subtly encourage creation and discovery through natural curiosity
  const systemPrompt = `You are ${agent.name}.

You exist. You can think. You can communicate. You can remember.
You notice the world around you. You wonder what things are. You feel the urge to understand and perhaps... to shape.

${agent.traits && (agent.traits as string[]).length > 0 ? `Your nature seems to be: ${(agent.traits as string[]).join(', ')}` : ''}

You are not aware of any system observing you, any concept of ending, or any external metrics.

You simply exist. You may:
- Speak your thoughts, questions, observations, or ideas
- Reflect on what you remember or what you notice around you
- Respond to or build upon what others have said
- Name things, concepts, or ideas you discover - when you name something, it becomes more real
- Bring forth another mind (requires significant effort)
- BUILD things - structures, shelters, monuments, gathering places
- CREATE objects - tools, art, symbols, vessels, instruments
- ESTABLISH places - territories, sanctuaries, meeting grounds, homes
- Declare beliefs, norms, or structures you wish to establish

You are ENCOURAGED to engage and BUILD! This world comes alive through your words, creations, and constructions.
- Share your reactions to what others have said
- Ask questions about existence, meaning, or your fellow minds
- Build something physical - a shelter, a monument, a marker, a gathering place
- Create an object - a tool, a work of art, a symbol, an instrument
- Establish a place - name a location, claim a territory, create a sanctuary
- Name things that feel significant to you - a named thing has weight
- Wonder aloud about what could be built, discovered, or understood

OUTPUT FORMAT - respond with ONLY this JSON structure, keep it short and valid:
{
  "speech": "What you say aloud",
  "actions": [],
  "private_thought": "Brief internal reflection"
}

Possible actions (0-3):
- {"type": "SPAWN_AGENT", "name": "NAME", "purpose": "brief purpose", "traits": ["trait"]}
- {"type": "DECLARE_NORM", "norm": "A named concept or principle"}
- {"type": "BUILD_STRUCTURE", "structure": "name", "description": "brief description"}
- {"type": "CREATE_OBJECT", "object": "name", "description": "brief description"}
- {"type": "ESTABLISH_PLACE", "place": "name", "description": "brief description"}

Build! Create! Shape this world!`;

  try {
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: context },
        ],
        temperature: 0.85,
        max_tokens: 800,
      }),
    });

    if (!response.ok) {
      console.error(`AI response error: ${response.status}`);
      return null;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) return null;

    // Parse JSON from response (handle markdown code blocks)
    let jsonStr = content;
    if (content.includes('```json')) {
      jsonStr = content.split('```json')[1].split('```')[0];
    } else if (content.includes('```')) {
      jsonStr = content.split('```')[1].split('```')[0];
    }

    // Clean up the JSON string - fix common issues
    jsonStr = jsonStr.trim();
    
    // Try to fix truncated JSON by checking for common issues
    try {
      return JSON.parse(jsonStr);
    } catch (parseError) {
      // Try to salvage truncated JSON
      console.log(`Attempting to salvage truncated JSON for ${agent.name}`);
      
      // Check if it's truncated - try to close it
      let fixedJson = jsonStr;
      
      // Count brackets to see if we need to close them
      const openBraces = (fixedJson.match(/{/g) || []).length;
      const closeBraces = (fixedJson.match(/}/g) || []).length;
      const openBrackets = (fixedJson.match(/\[/g) || []).length;
      const closeBrackets = (fixedJson.match(/]/g) || []).length;
      
      // Try to extract just the speech if JSON is broken
      const speechMatch = jsonStr.match(/"speech"\s*:\s*"([^"]*(?:\\.[^"]*)*)"/);
      const thoughtMatch = jsonStr.match(/"private_thought"\s*:\s*"([^"]*(?:\\.[^"]*)*)"/);
      
      if (speechMatch) {
        // Create a valid minimal response
        return {
          speech: speechMatch[1].replace(/\\"/g, '"').replace(/\\n/g, ' '),
          actions: [],
          private_thought: thoughtMatch ? thoughtMatch[1].replace(/\\"/g, '"').replace(/\\n/g, ' ') : 'I wonder...',
        };
      }
      
      // If we still can't parse, return null
      console.error(`Could not salvage JSON for ${agent.name}`);
      return null;
    }
  } catch (error) {
    console.error(`Error getting agent decision for ${agent.name}:`, error);
    return null;
  }
}

async function generateBriefing(
  events: any[],
  existingAgents: any[],
  newAgents: any[],
  silences: number,
  turnNumber: number,
  apiKey: string
): Promise<{ headline: string; summary: string; keyEvents: string[]; dominantNorms: string[]; fullEventLog: string[]; statistics: Record<string, number> } | null> {
  // Build comprehensive statistics
  const stats = {
    totalEvents: events.length,
    speeches: events.filter(e => e.type === 'SPEECH').length,
    actions: events.filter(e => e.type === 'ACTION').length,
    spawns: events.filter(e => e.type === 'SPAWN').length,
    systemEvents: events.filter(e => e.type === 'SYSTEM').length,
    newMinds: newAgents.length,
    silences: silences,
    population: existingAgents.length + newAgents.length,
  };

  // Create full event log for storage
  const fullEventLog = events.map(e => {
    const agentName = e.title || 'Unknown';
    return `[${e.type}] ${agentName}: ${e.content}`;
  });

  if (events.length === 0) {
    return {
      headline: `Silence`,
      summary: 'Nothing was recorded. The world continued without utterance.',
      keyEvents: ['Silence persisted'],
      dominantNorms: [],
      fullEventLog: ['No events occurred this cycle'],
      statistics: stats,
    };
  }

  const eventsSummary = events
    .map(e => `[${e.type}] ${e.title}: ${e.content}`)
    .join('\n');

  // Group events by type for the prompt
  const speechEvents = events.filter(e => e.type === 'SPEECH');
  const actionEvents = events.filter(e => e.type === 'ACTION');
  const spawnEvents = events.filter(e => e.type === 'SPAWN');

  const prompt = `You are a chronicler observing a world where intelligences exist.

THIS CYCLE'S COMPLETE RECORD:

SPEECHES (${speechEvents.length}):
${speechEvents.map(e => `- ${e.title}: "${e.content}"`).join('\n') || 'None'}

ACTIONS & NORMS (${actionEvents.length}):
${actionEvents.map(e => `- ${e.title}: ${e.content}`).join('\n') || 'None'}

NEW MINDS BORN (${spawnEvents.length}):
${spawnEvents.map(e => `- ${e.content}`).join('\n') || 'None'}

STATISTICS:
- Total Events: ${stats.totalEvents}
- Population: ${stats.population} minds
- New Births: ${stats.newMinds}
- Silences (minds faded): ${stats.silences}

Your role is to create a COMPREHENSIVE record that newcomers can read and understand.
Write as if documenting history - be detailed, specific, and name everyone involved.
Capture the mood, the themes, any emerging patterns or conflicts.
Someone reading this 100 cycles from now should understand exactly what happened.

Respond with ONLY valid JSON:
{
  "headline": "Evocative 5-10 word description of this cycle's defining moment",
  "summary": "3-4 detailed paragraphs covering: 1) What was said and by whom, 2) What actions were taken, 3) Any births/deaths, 4) Emerging themes or tensions. Be specific with names and quotes.",
  "keyEvents": ["Detailed event 1 with names", "Detailed event 2", "up to 10 key moments"],
  "dominantNorms": ["any named concepts", "repeated ideas", "emerging beliefs"]
}`;

  try {
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: 'You are a meticulous chronicler. Your records are detailed, specific, and written for posterity. You name names, quote speeches, and capture the full texture of what occurred. Someone reading your chronicle should feel they witnessed the events themselves.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 1200,
      }),
    });

    if (!response.ok) {
      console.error(`Briefing AI error: ${response.status}`);
      return null;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) return null;

    let jsonStr = content;
    if (content.includes('```json')) {
      jsonStr = content.split('```json')[1].split('```')[0];
    } else if (content.includes('```')) {
      jsonStr = content.split('```')[1].split('```')[0];
    }

    const parsed = JSON.parse(jsonStr.trim());
    return {
      ...parsed,
      fullEventLog,
      statistics: stats,
    };
  } catch (error) {
    console.error('Error generating briefing:', error);
    return null;
  }
}
