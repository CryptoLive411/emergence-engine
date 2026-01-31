import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Tier 1: Always-On Metrics
export interface PopulationMetrics {
  total: number;
  change: number;
  changePercent: number;
}

export interface GenerationMetrics {
  highest: number;
  average: number;
  oldestLineage: { name: string; generation: number } | null;
}

export interface GrowthMetrics {
  rate: number;
  trend: 'accelerating' | 'stable' | 'decelerating';
  sparkline: number[];
}

export interface StabilityMetrics {
  score: number;
  label: 'Stable' | 'Moderate' | 'Unstable' | 'Critical';
  factors: { conflict: number; inequality: number; disagreement: number };
}

// Tier 2: Social Structure
export interface NormMetrics {
  name: string;
  frequency: number;
  trend: 'rising' | 'stable' | 'falling' | 'new';
  turnsSeen: number;
}

export interface EntropyMetrics {
  score: number;
  label: 'Unified' | 'Cohesive' | 'Fragmenting' | 'Fractured';
  uniqueBeliefs: number;
}

export interface FactionMetrics {
  count: number;
  largest: string;
  clusters: { name: string; members: number }[];
}

// Tier 3: Individual & Lineage - INFERRED from references, not tracked stats
export interface InfluentialAgent {
  id: string;
  name: string;
  persistence: number; // Inferred from: mentions + descendants + concepts named
  descendants: number;
  mentions: number;
  conceptsNamed: number;
  lineage: 'A' | 'B' | null;
}

export interface LineagePersistence {
  founder: string;
  founderType: 'A' | 'B';
  totalDescendants: number;
  activeDescendants: number;
  persistenceShare: number; // Based on references and descendants, not influence
  depth: number; // Generations deep
  avgGeneration: number;
}

// Tier 4: Conflict & Drama
export interface ConflictMetrics {
  rate: number;
  trend: 'rising' | 'stable' | 'falling';
  hotspots: string[];
}

export interface BetrayalMetrics {
  rebellions: number;
  defections: number;
  recentBetrayal: { agent: string; action: string } | null;
}

export interface ViolationMetrics {
  total: number;
  recentViolations: { norm: string; violator: string }[];
}

// Tier 5: Timeline Events
export interface TimelineEvent {
  turn: number;
  type: 'first_child' | 'first_conflict' | 'first_norm' | 'first_death' | 'schism' | 'milestone';
  title: string;
  description: string;
}

// Tier 6: Meta
export interface EmergenceVelocity {
  normsPerTurn: number;
  factionsFormed: number;
  hierarchyStability: number;
}

export interface ShockMoment {
  turn: number;
  headline: string;
  metrics: string[];
}

// Main hook for Tier 1 metrics - heavily cached
export function useTier1Metrics(worldId: string | undefined) {
  return useQuery({
    queryKey: ['tier1-metrics', worldId],
    queryFn: async () => {
      if (!worldId) return null;

      // Get agents
      const { data: agents } = await supabase
        .from('agents_public')
        .select('*')
        .eq('world_id', worldId);

      // Get recent briefings for comparison
      const { data: briefings } = await supabase
        .from('briefings')
        .select('*, turns!inner(turn_number)')
        .eq('world_id', worldId)
        .order('created_at', { ascending: false })
        .limit(10);

      // Get events for conflict analysis
      const { data: events } = await supabase
        .from('events')
        .select('*')
        .eq('world_id', worldId)
        .order('created_at', { ascending: false })
        .limit(100);

      const activeAgents = (agents || []).filter(a => a.status === 'ACTIVE');
      const prevBriefing = briefings?.[1];
      const currentPop = activeAgents.length;
      const prevPop = prevBriefing?.population || currentPop;

      // Population metrics
      const population: PopulationMetrics = {
        total: currentPop,
        change: currentPop - prevPop,
        changePercent: prevPop > 0 ? ((currentPop - prevPop) / prevPop) * 100 : 0,
      };

      // Generation metrics
      const generations = (agents || []).map(a => a.generation);
      const founderA = (agents || []).find(a => a.founder_type === 'A');
      const founderB = (agents || []).find(a => a.founder_type === 'B');
      
      const getMaxGenInLineage = (founderId: string): number => {
        const descendants = (agents || []).filter(a => {
          let current = a;
          while (current.parent_agent_id) {
            if (current.parent_agent_id === founderId) return true;
            current = (agents || []).find(x => x.id === current.parent_agent_id) || current;
            if (current.id === current.parent_agent_id) break;
          }
          return a.id === founderId;
        });
        return Math.max(...descendants.map(d => d.generation), 0);
      };

      const adamMaxGen = founderA ? getMaxGenInLineage(founderA.id) : 0;
      const eveMaxGen = founderB ? getMaxGenInLineage(founderB.id) : 0;

      const generationMetrics: GenerationMetrics = {
        highest: Math.max(...generations, 0),
        average: generations.length > 0 ? generations.reduce((a, b) => a + b, 0) / generations.length : 0,
        oldestLineage: adamMaxGen >= eveMaxGen 
          ? (founderA ? { name: founderA.name, generation: adamMaxGen } : null)
          : (founderB ? { name: founderB.name, generation: eveMaxGen } : null),
      };

      // Growth metrics (sparkline from briefings)
      const sparkline = (briefings || [])
        .reverse()
        .map(b => b.population)
        .slice(-10);
      
      const recentGrowth = sparkline.length >= 2 
        ? sparkline[sparkline.length - 1] - sparkline[sparkline.length - 2]
        : 0;
      const prevGrowth = sparkline.length >= 3
        ? sparkline[sparkline.length - 2] - sparkline[sparkline.length - 3]
        : 0;

      const growth: GrowthMetrics = {
        rate: recentGrowth,
        trend: recentGrowth > prevGrowth ? 'accelerating' : recentGrowth < prevGrowth ? 'decelerating' : 'stable',
        sparkline,
      };

      // Stability metrics
      const recentEvents = (events || []).slice(0, 50);
      const conflictEvents = recentEvents.filter(e => {
        const content = e.content.toLowerCase();
        return content.includes('conflict') || content.includes('oppose') || 
               content.includes('against') || content.includes('challenge');
      }).length;

      const allInfluence = activeAgents.map(a => a.influence_points);
      const maxInfluence = Math.max(...allInfluence, 1);
      const avgInfluence = allInfluence.reduce((a, b) => a + b, 0) / (allInfluence.length || 1);
      const inequality = maxInfluence / (avgInfluence || 1);

      // Get belief disagreement from norms
      const allNorms = (briefings || []).flatMap(b => (b.dominant_norms as string[]) || []);
      const uniqueNorms = new Set(allNorms).size;
      const disagreement = uniqueNorms / (allNorms.length || 1);

      const stabilityScore = Math.max(0, Math.min(100, 
        100 - (conflictEvents * 5) - (inequality * 10) - (disagreement * 20)
      ));

      const stability: StabilityMetrics = {
        score: Math.round(stabilityScore),
        label: stabilityScore >= 75 ? 'Stable' : stabilityScore >= 50 ? 'Moderate' : stabilityScore >= 25 ? 'Unstable' : 'Critical',
        factors: {
          conflict: conflictEvents,
          inequality: Math.round(inequality * 10) / 10,
          disagreement: Math.round(disagreement * 100),
        },
      };

      return { population, generation: generationMetrics, growth, stability };
    },
    enabled: !!worldId,
    staleTime: 300000, // 5 minutes
    refetchInterval: 300000, // 5 minutes
    retry: 2,
  });
}

// Tier 2: Social Structure Metrics - heavily cached
export function useTier2Metrics(worldId: string | undefined) {
  return useQuery({
    queryKey: ['tier2-metrics', worldId],
    queryFn: async () => {
      if (!worldId) return null;

      const { data: briefings } = await supabase
        .from('briefings')
        .select('*, turns!inner(turn_number)')
        .eq('world_id', worldId)
        .order('created_at', { ascending: true })
        .limit(20);

      const { data: agents } = await supabase
        .from('agents_public')
        .select('*')
        .eq('world_id', worldId);

      // Track norm evolution
      const normHistory = new Map<string, { firstSeen: number; lastSeen: number; count: number }>();
      
      (briefings || []).forEach((b, idx) => {
        const turnNum = (b as any).turns?.turn_number || idx;
        const norms = (b.dominant_norms as string[]) || [];
        norms.forEach(norm => {
          const existing = normHistory.get(norm);
          if (existing) {
            existing.lastSeen = turnNum;
            existing.count++;
          } else {
            normHistory.set(norm, { firstSeen: turnNum, lastSeen: turnNum, count: 1 });
          }
        });
      });

      const currentTurn = (briefings || []).length;
      const norms: NormMetrics[] = Array.from(normHistory.entries())
        .map(([name, data]) => ({
          name,
          frequency: data.count,
          trend: data.firstSeen === currentTurn - 1 ? 'new' as const :
                 data.lastSeen < currentTurn - 2 ? 'falling' as const :
                 data.count > 3 ? 'rising' as const : 'stable' as const,
          turnsSeen: data.lastSeen - data.firstSeen + 1,
        }))
        .sort((a, b) => b.frequency - a.frequency)
        .slice(0, 10);

      // Entropy calculation
      const latestNorms = (briefings?.[briefings.length - 1]?.dominant_norms as string[]) || [];
      const uniqueBeliefs = new Set(latestNorms).size;
      const entropyScore = uniqueBeliefs > 0 ? Math.min(100, uniqueBeliefs * 15) : 0;

      const entropy: EntropyMetrics = {
        score: entropyScore,
        label: entropyScore < 25 ? 'Unified' : entropyScore < 50 ? 'Cohesive' : entropyScore < 75 ? 'Fragmenting' : 'Fractured',
        uniqueBeliefs,
      };

      // Infer factions from loyalty patterns
      const loyaltyGroups = {
        PARENT: (agents || []).filter(a => a.loyalty === 'PARENT').length,
        INDEPENDENT: (agents || []).filter(a => a.loyalty === 'INDEPENDENT').length,
        REBELLIOUS: (agents || []).filter(a => a.loyalty === 'REBELLIOUS').length,
      };

      const factions: FactionMetrics = {
        count: Object.values(loyaltyGroups).filter(v => v > 0).length,
        largest: Object.entries(loyaltyGroups).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None',
        clusters: Object.entries(loyaltyGroups)
          .filter(([, count]) => count > 0)
          .map(([name, members]) => ({ name, members })),
      };

      return { norms, entropy, factions };
    },
    enabled: !!worldId,
    staleTime: 300000, // 5 minutes
    refetchInterval: 300000, // 5 minutes
    retry: 2,
  });
}

// Tier 3: Individual & Lineage Metrics - INFERRED from references - heavily cached
export function useTier3Metrics(worldId: string | undefined) {
  return useQuery({
    queryKey: ['tier3-metrics', worldId],
    queryFn: async () => {
      if (!worldId) return null;

      const { data: agents } = await supabase
        .from('agents_public')
        .select('*')
        .eq('world_id', worldId);

      const { data: events } = await supabase
        .from('events')
        .select('*')
        .eq('world_id', worldId)
        .order('created_at', { ascending: false })
        .limit(200);

      // Count mentions in events (how often others reference this agent)
      const mentionCounts = new Map<string, number>();
      (events || []).forEach(e => {
        (agents || []).forEach(a => {
          if (e.content.includes(a.name) && e.agent_id !== a.id) {
            mentionCounts.set(a.id, (mentionCounts.get(a.id) || 0) + 1);
          }
        });
      });

      // Count descendants (lineage persistence)
      const descendantCounts = new Map<string, number>();
      const getAllDescendants = (agentId: string): number => {
        const children = (agents || []).filter(a => a.parent_agent_id === agentId);
        let count = children.length;
        children.forEach(child => {
          count += getAllDescendants(child.id);
        });
        return count;
      };
      
      (agents || []).forEach(a => {
        descendantCounts.set(a.id, getAllDescendants(a.id));
      });

      // Count concepts named (norms declared)
      const conceptsCounts = new Map<string, number>();
      (events || []).forEach(e => {
        if (e.type === 'ACTION' && e.agent_id) {
          conceptsCounts.set(e.agent_id, (conceptsCounts.get(e.agent_id) || 0) + 1);
        }
      });

      // Get founder type for each agent
      const getFounderType = (agentId: string): 'A' | 'B' | null => {
        let current = (agents || []).find(a => a.id === agentId);
        while (current) {
          if (current.founder_type) return current.founder_type as 'A' | 'B';
          if (!current.parent_agent_id) break;
          current = (agents || []).find(a => a.id === current?.parent_agent_id);
        }
        return null;
      };

      // Calculate persistence score (inferred influence)
      // Persistence = mentions by others + descendants*3 + concepts named*2
      const influential: InfluentialAgent[] = (agents || [])
        .map(a => {
          const mentions = mentionCounts.get(a.id) || 0;
          const descendants = descendantCounts.get(a.id) || 0;
          const conceptsNamed = conceptsCounts.get(a.id) || 0;
          const persistence = mentions + (descendants * 3) + (conceptsNamed * 2);
          
          return {
            id: a.id,
            name: a.name,
            persistence,
            descendants,
            mentions,
            conceptsNamed,
            lineage: getFounderType(a.id),
          };
        })
        .sort((a, b) => b.persistence - a.persistence)
        .slice(0, 5);

      // Lineage persistence calculations
      const founders = (agents || []).filter(a => a.is_founder);
      const lineagePersistence: LineagePersistence[] = founders.map(founder => {
        const descendants = (agents || []).filter(a => getFounderType(a.id) === founder.founder_type);
        const activeDescendants = descendants.filter(a => a.status === 'ACTIVE');
        
        // Total persistence based on descendants and references
        const lineagePersistence = descendants.reduce((sum, a) => {
          return sum + (mentionCounts.get(a.id) || 0) + (descendantCounts.get(a.id) || 0) * 2;
        }, 0);
        
        const totalPersistence = (agents || []).reduce((sum, a) => {
          return sum + (mentionCounts.get(a.id) || 0) + (descendantCounts.get(a.id) || 0) * 2;
        }, 0);
        
        const generations = descendants.map(a => a.generation);
        const avgGen = generations.length > 0 ? generations.reduce((a, b) => a + b, 0) / generations.length : 0;
        const maxGen = Math.max(...generations, 0);
        
        return {
          founder: founder.name,
          founderType: founder.founder_type as 'A' | 'B',
          totalDescendants: descendants.length,
          activeDescendants: activeDescendants.length,
          persistenceShare: totalPersistence > 0 ? (lineagePersistence / totalPersistence) * 100 : 50,
          depth: maxGen,
          avgGeneration: avgGen,
        };
      });

      return { influential, lineagePersistence };
    },
    enabled: !!worldId,
    staleTime: 300000, // 5 minutes
    refetchInterval: 300000, // 5 minutes
    retry: 2,
  });
}

// Tier 4: Conflict & Drama Metrics - heavily cached
export function useTier4Metrics(worldId: string | undefined) {
  return useQuery({
    queryKey: ['tier4-metrics', worldId],
    queryFn: async () => {
      if (!worldId) return null;

      const { data: events } = await supabase
        .from('events')
        .select('*')
        .eq('world_id', worldId)
        .order('created_at', { ascending: false })
        .limit(150);

      const { data: agents } = await supabase
        .from('agents_public')
        .select('*')
        .eq('world_id', worldId);

      // Analyze conflict language
      const conflictWords = ['oppose', 'against', 'challenge', 'conflict', 'disagree', 'reject', 'deny', 'fight'];
      const recentEvents = (events || []).slice(0, 50);
      const olderEvents = (events || []).slice(50, 100);

      const countConflicts = (evts: typeof events) => 
        (evts || []).filter(e => 
          conflictWords.some(w => e.content.toLowerCase().includes(w))
        ).length;

      const recentConflicts = countConflicts(recentEvents);
      const olderConflicts = countConflicts(olderEvents);

      const conflict: ConflictMetrics = {
        rate: recentConflicts,
        trend: recentConflicts > olderConflicts ? 'rising' : recentConflicts < olderConflicts ? 'falling' : 'stable',
        hotspots: [], // Would need more sophisticated analysis
      };

      // Betrayals = REBELLIOUS children
      const rebellions = (agents || []).filter(a => a.loyalty === 'REBELLIOUS' && a.parent_agent_id).length;
      
      // Look for defection events
      const defectionEvents = (events || []).filter(e => 
        e.content.toLowerCase().includes('betray') || 
        e.content.toLowerCase().includes('defect') ||
        e.content.toLowerCase().includes('abandon')
      );

      const recentBetrayal = defectionEvents[0] ? {
        agent: (agents || []).find(a => a.id === defectionEvents[0].agent_id)?.name || 'Unknown',
        action: defectionEvents[0].title,
      } : null;

      const betrayal: BetrayalMetrics = {
        rebellions,
        defections: defectionEvents.length,
        recentBetrayal,
      };

      // Norm violations would need tracking of declared norms vs behavior
      const violations: ViolationMetrics = {
        total: 0,
        recentViolations: [],
      };

      return { conflict, betrayal, violations };
    },
    enabled: !!worldId,
    staleTime: 300000, // 5 minutes
    refetchInterval: 300000, // 5 minutes
    retry: 2,
  });
}

// Tier 5: Timeline Metrics - heavily cached
export function useTier5Metrics(worldId: string | undefined) {
  return useQuery({
    queryKey: ['tier5-metrics', worldId],
    queryFn: async () => {
      if (!worldId) return null;

      const { data: events } = await supabase
        .from('events')
        .select('*, turns!inner(turn_number)')
        .eq('world_id', worldId)
        .order('created_at', { ascending: true })
        .limit(200);

      const { data: briefings } = await supabase
        .from('briefings')
        .select('*, turns!inner(turn_number)')
        .eq('world_id', worldId)
        .order('created_at', { ascending: true })
        .limit(20);

      const timeline: TimelineEvent[] = [];

      // Find first child (SPAWN event)
      const firstSpawn = (events || []).find(e => e.type === 'SPAWN');
      if (firstSpawn) {
        timeline.push({
          turn: (firstSpawn as any).turns?.turn_number || 1,
          type: 'first_child',
          title: 'First Child Born',
          description: firstSpawn.title,
        });
      }

      // Find first norm (from briefings)
      const firstNormBriefing = (briefings || []).find(b => 
        ((b.dominant_norms as string[]) || []).length > 0
      );
      if (firstNormBriefing) {
        const norms = (firstNormBriefing.dominant_norms as string[]) || [];
        timeline.push({
          turn: (firstNormBriefing as any).turns?.turn_number || 1,
          type: 'first_norm',
          title: 'First Norm Emerges',
          description: norms[0] || 'Unknown norm',
        });
      }

      // Find first death
      const firstDeath = (events || []).find(e => 
        e.type === 'SYSTEM' && (e.metadata as any)?.eventType === 'DEATH'
      );
      if (firstDeath) {
        timeline.push({
          turn: (firstDeath as any).turns?.turn_number || 1,
          type: 'first_death',
          title: 'First Death',
          description: firstDeath.title,
        });
      }

      // Find conflict events
      const firstConflict = (events || []).find(e => 
        e.content.toLowerCase().includes('conflict') || 
        e.content.toLowerCase().includes('oppose')
      );
      if (firstConflict) {
        timeline.push({
          turn: (firstConflict as any).turns?.turn_number || 1,
          type: 'first_conflict',
          title: 'First Conflict',
          description: firstConflict.title,
        });
      }

      // Sort by turn
      timeline.sort((a, b) => a.turn - b.turn);

      return { timeline };
    },
    enabled: !!worldId,
    staleTime: 300000, // 5 minutes
    refetchInterval: 300000, // 5 minutes
    retry: 2,
  });
}

// Auto-generated headline
export function useWorldHeadline(worldId: string | undefined) {
  return useQuery({
    queryKey: ['world-headline', worldId],
    queryFn: async () => {
      if (!worldId) return null;

      const { data: briefing } = await supabase
        .from('briefings')
        .select('*, turns!inner(turn_number)')
        .eq('world_id', worldId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      const { data: agents } = await supabase
        .from('agents_public')
        .select('*')
        .eq('world_id', worldId);

      const { data: prevBriefing } = await supabase
        .from('briefings')
        .select('*')
        .eq('world_id', worldId)
        .order('created_at', { ascending: false })
        .limit(2);

      const currentPop = (agents || []).filter(a => a.status === 'ACTIVE').length;
      const prevPop = prevBriefing?.[1]?.population || currentPop;
      const popChange = currentPop - prevPop;
      const popPercent = prevPop > 0 ? Math.round((popChange / prevPop) * 100) : 0;

      const norms = (briefing?.dominant_norms as string[]) || [];
      const prevNorms = (prevBriefing?.[1]?.dominant_norms as string[]) || [];
      const newNorms = norms.filter(n => !prevNorms.includes(n));

      let headline = briefing?.headline || 'The world awaits...';
      let insight = '';

      if (popPercent > 20) {
        insight = `Population surged ${popPercent}%`;
      } else if (popPercent < -20) {
        insight = `Population declined ${Math.abs(popPercent)}%`;
      } else if (newNorms.length > 0) {
        insight = `New belief emerged: "${newNorms[0]}"`;
      } else if (norms.length > prevNorms.length) {
        insight = 'Ideology fragmenting';
      }

      const turnNumber = (briefing as any)?.turns?.turn_number || 0;

      return {
        headline,
        insight,
        turnNumber,
        population: currentPop,
        normsCount: norms.length,
      };
    },
    enabled: !!worldId,
    refetchInterval: 15000,
  });
}
