import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface BeliefEvolution {
  turnNumber: number;
  beliefs: string[];
  newBeliefs: string[];
  fadedBeliefs: string[];
}

export interface AgentRelationship {
  id: string;
  name: string;
  parentId: string | null;
  parentName: string | null;
  generation: number;
  loyalty: string;
  influence: number;
  energy: number;
  status: string;
  founderType: string | null;
  isFounder: boolean;
}

export interface TurnBreakdown {
  turnNumber: number;
  population: number;
  speeches: number;
  norms: number;
  spawns: number;
  deaths: number;
  chaosEvents: number;
  headline: string;
}

export function useBeliefEvolution(worldId: string | undefined) {
  return useQuery({
    queryKey: ['belief-evolution', worldId],
    queryFn: async () => {
      if (!worldId) return [];

      const { data: briefings, error } = await supabase
        .from('briefings')
        .select('*, turns!inner(turn_number)')
        .eq('world_id', worldId)
        .order('created_at', { ascending: true })
        .limit(20);

      if (error) throw error;

      const evolution: BeliefEvolution[] = [];
      let previousBeliefs: Set<string> = new Set();

      for (const briefing of briefings || []) {
        const currentBeliefs = new Set((briefing.dominant_norms as string[]) || []);
        const turnNum = (briefing as any).turns?.turn_number || 0;

        const newBeliefs = [...currentBeliefs].filter(b => !previousBeliefs.has(b));
        const fadedBeliefs = [...previousBeliefs].filter(b => !currentBeliefs.has(b));

        evolution.push({
          turnNumber: turnNum,
          beliefs: [...currentBeliefs],
          newBeliefs,
          fadedBeliefs,
        });

        previousBeliefs = currentBeliefs;
      }

      return evolution;
    },
    enabled: !!worldId,
    staleTime: 300000, // 5 minutes
    refetchInterval: 300000, // 5 minutes
    retry: 2,
  });
}

export function useAgentRelationships(worldId: string | undefined) {
  return useQuery({
    queryKey: ['agent-relationships', worldId],
    queryFn: async () => {
      if (!worldId) return [];

      const { data: agents, error } = await supabase
        .from('agents_public')
        .select('*')
        .eq('world_id', worldId)
        .order('created_turn', { ascending: true });

      if (error) throw error;

      return (agents || []).map(agent => {
        const parent = (agents || []).find(a => a.id === agent.parent_agent_id);
        return {
          id: agent.id,
          name: agent.name,
          parentId: agent.parent_agent_id,
          parentName: parent?.name || null,
          generation: agent.generation,
          loyalty: agent.loyalty,
          influence: agent.influence_points,
          energy: agent.energy,
          status: agent.status,
          founderType: agent.founder_type,
          isFounder: agent.is_founder,
        };
      });
    },
    enabled: !!worldId,
    staleTime: 300000, // 5 minutes
    refetchInterval: 300000, // 5 minutes
    retry: 2,
  });
}

export function useTurnBreakdown(worldId: string | undefined) {
  return useQuery({
    queryKey: ['turn-breakdown', worldId],
    queryFn: async () => {
      if (!worldId) return [];

      // Get all turns with their events and briefings
      const { data: turns, error: turnsError } = await supabase
        .from('turns')
        .select('*')
        .eq('world_id', worldId)
        .order('turn_number', { ascending: true })
        .limit(30);

      if (turnsError) throw turnsError;

      const { data: events } = await supabase
        .from('events')
        .select('*')
        .eq('world_id', worldId)
        .order('created_at', { ascending: false })
        .limit(300);

      const { data: briefings } = await supabase
        .from('briefings')
        .select('*')
        .eq('world_id', worldId)
        .limit(30);

      const breakdown: TurnBreakdown[] = [];

      for (const turn of turns || []) {
        const turnEvents = (events || []).filter(e => e.turn_id === turn.id);
        const turnBriefing = (briefings || []).find(b => b.turn_id === turn.id);

        breakdown.push({
          turnNumber: turn.turn_number,
          population: turnBriefing?.population || 0,
          speeches: turnEvents.filter(e => e.type === 'SPEECH').length,
          norms: turnEvents.filter(e => e.type === 'ACTION' && (e.metadata as any)?.normType).length,
          spawns: turnEvents.filter(e => e.type === 'SPAWN').length,
          deaths: turnEvents.filter(e => e.type === 'SYSTEM' && (e.metadata as any)?.eventType === 'DEATH').length,
          chaosEvents: turnEvents.filter(e => e.type === 'SYSTEM' && (e.metadata as any)?.eventType === 'CHAOS').length,
          headline: turnBriefing?.headline || 'No briefing',
        });
      }

      return breakdown;
    },
    enabled: !!worldId,
    staleTime: 300000, // 5 minutes
    refetchInterval: 300000, // 5 minutes
    retry: 2,
  });
}

export function useInfluenceHistory(worldId: string | undefined) {
  return useQuery({
    queryKey: ['influence-history', worldId],
    queryFn: async () => {
      if (!worldId) return { adam: [], eve: [] };

      // Get all agents to calculate lineage influence
      const { data: agents } = await supabase
        .from('agents_public')
        .select('*')
        .eq('world_id', worldId);

      const founders = (agents || []).filter(a => a.is_founder);
      const adamFounder = founders.find(f => f.founder_type === 'A');
      const eveFounder = founders.find(f => f.founder_type === 'B');

      // Build lineage influence over turns (simplified - shows current state)
      const getLineageAgents = (founderId: string): any[] => {
        const result: any[] = [];
        const queue = [founderId];
        
        while (queue.length > 0) {
          const currentId = queue.shift()!;
          const agent = (agents || []).find(a => a.id === currentId);
          if (agent) {
            result.push(agent);
            const children = (agents || []).filter(a => a.parent_agent_id === currentId);
            queue.push(...children.map(c => c.id));
          }
        }
        
        return result;
      };

      const adamLineage = adamFounder ? getLineageAgents(adamFounder.id) : [];
      const eveLineage = eveFounder ? getLineageAgents(eveFounder.id) : [];

      return {
        adam: adamLineage,
        eve: eveLineage,
        adamTotal: adamLineage.reduce((sum, a) => sum + a.influence_points, 0),
        eveTotal: eveLineage.reduce((sum, a) => sum + a.influence_points, 0),
      };
    },
    enabled: !!worldId,
    staleTime: 300000, // 5 minutes
    refetchInterval: 300000, // 5 minutes
    retry: 2,
  });
}
