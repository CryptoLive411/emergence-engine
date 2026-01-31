import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface TurnData {
  turnNumber: number;
  population: number;
  births: number;
  deaths: number;
  speeches: number;
  norms: number;
  timestamp: Date;
}

export interface BeliefData {
  norm: string;
  count: number;
  firstMentioned: number;
}

export interface LineageData {
  founder: string;
  founderType: string;
  descendants: number;
  totalInfluence: number;
}

export function usePopulationHistory(worldId: string | undefined) {
  return useQuery({
    queryKey: ['population-history', worldId],
    queryFn: async () => {
      if (!worldId) return [];

      // Get all briefings which contain population snapshots
      const { data: briefings, error } = await supabase
        .from('briefings')
        .select('*, turns!inner(turn_number, started_at)')
        .eq('world_id', worldId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      return (briefings || []).map((b: any) => ({
        turnNumber: b.turns?.turn_number || 0,
        population: b.population,
        timestamp: new Date(b.created_at),
      }));
    },
    enabled: !!worldId,
    refetchInterval: 30000,
  });
}

export function useEventStats(worldId: string | undefined) {
  return useQuery({
    queryKey: ['event-stats', worldId],
    queryFn: async () => {
      if (!worldId) return [];

      // Get events grouped by turn
      const { data: events, error } = await supabase
        .from('events')
        .select('*, turns!inner(turn_number)')
        .eq('world_id', worldId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Group by turn
      const turnMap = new Map<number, { speeches: number; norms: number; spawns: number; deaths: number }>();
      
      for (const event of events || []) {
        const turnNum = (event as any).turns?.turn_number || 0;
        const current = turnMap.get(turnNum) || { speeches: 0, norms: 0, spawns: 0, deaths: 0 };
        
        if (event.type === 'SPEECH') current.speeches++;
        if (event.type === 'ACTION' && event.metadata && (event.metadata as any).normType) current.norms++;
        if (event.type === 'SPAWN') current.spawns++;
        if (event.type === 'SYSTEM' && event.metadata && (event.metadata as any).eventType === 'DEATH') current.deaths++;
        
        turnMap.set(turnNum, current);
      }

      return Array.from(turnMap.entries()).map(([turn, stats]) => ({
        turnNumber: turn,
        ...stats,
      }));
    },
    enabled: !!worldId,
    refetchInterval: 30000,
  });
}

export function useBeliefTracking(worldId: string | undefined) {
  return useQuery({
    queryKey: ['belief-tracking', worldId],
    queryFn: async () => {
      if (!worldId) return [];

      // Get all briefings for dominant norms
      const { data: briefings, error } = await supabase
        .from('briefings')
        .select('dominant_norms, turns!inner(turn_number)')
        .eq('world_id', worldId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Track norm appearances over time
      const normHistory = new Map<string, { count: number; firstTurn: number; lastTurn: number }>();
      
      for (const briefing of briefings || []) {
        const norms = (briefing.dominant_norms as string[]) || [];
        const turnNum = (briefing as any).turns?.turn_number || 0;
        
        for (const norm of norms) {
          const existing = normHistory.get(norm);
          if (existing) {
            existing.count++;
            existing.lastTurn = turnNum;
          } else {
            normHistory.set(norm, { count: 1, firstTurn: turnNum, lastTurn: turnNum });
          }
        }
      }

      return Array.from(normHistory.entries())
        .map(([norm, data]) => ({
          norm,
          count: data.count,
          firstMentioned: data.firstTurn,
          persistence: data.lastTurn - data.firstTurn + 1,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
    },
    enabled: !!worldId,
    refetchInterval: 30000,
  });
}

export function useLineageStats(worldId: string | undefined) {
  return useQuery({
    queryKey: ['lineage-stats', worldId],
    queryFn: async () => {
      if (!worldId) return [];

      const { data: agents, error } = await supabase
        .from('agents_public')
        .select('*')
        .eq('world_id', worldId);

      if (error) throw error;

      const founders = (agents || []).filter(a => a.is_founder);
      
      const getDescendantCount = (founderId: string): number => {
        const children = (agents || []).filter(a => a.parent_agent_id === founderId);
        return children.length + children.reduce((sum, child) => sum + getDescendantCount(child.id), 0);
      };

      const getLineageInfluence = (founderId: string): number => {
        const lineage = (agents || []).filter(a => {
          let current = a;
          while (current.parent_agent_id) {
            if (current.parent_agent_id === founderId) return true;
            current = (agents || []).find(ag => ag.id === current.parent_agent_id) || current;
            if (current.id === a.id) break;
          }
          return a.id === founderId;
        });
        return lineage.reduce((sum, a) => sum + a.influence_points, 0);
      };

      return founders.map(f => ({
        founder: f.name,
        founderType: f.founder_type || 'A',
        descendants: getDescendantCount(f.id),
        totalInfluence: getLineageInfluence(f.id),
        activeAgents: (agents || []).filter(a => {
          if (a.id === f.id) return a.status === 'ACTIVE';
          let current = a;
          while (current.parent_agent_id) {
            if (current.parent_agent_id === f.id) return a.status === 'ACTIVE';
            const parent = (agents || []).find(ag => ag.id === current.parent_agent_id);
            if (!parent) break;
            current = parent;
          }
          return false;
        }).length,
      }));
    },
    enabled: !!worldId,
    refetchInterval: 30000,
  });
}
