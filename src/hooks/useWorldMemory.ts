import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Era {
  id: string;
  world_id: string;
  era_number: number;
  name: string;
  started_turn: number;
  ended_turn: number | null;
  trigger_reason: string;
  created_at: string;
}

export interface Artifact {
  id: string;
  world_id: string;
  creator_agent_id: string | null;
  name: string;
  artifact_type: 'text' | 'concept' | 'institution' | 'symbol' | 'place';
  content: string;
  origin_turn: number;
  status: 'emerging' | 'contested' | 'canonized' | 'forgotten' | 'mythic';
  reference_count: number;
  last_referenced_turn: number;
  created_at: string;
}

export interface WorldMood {
  id: string;
  world_id: string;
  turn_id: string;
  mood: 'calm' | 'uneasy' | 'fragmenting' | 'volatile' | 'collapsing' | 'reorganizing';
  stability_score: number;
  conflict_rate: number;
  belief_entropy: number;
  created_at: string;
}

export interface CycleQuote {
  id: string;
  world_id: string;
  turn_id: string;
  event_id: string;
  agent_id: string | null;
  quote: string;
  impact_score: number;
  created_at: string;
}

// Era name generators
const ERA_NAMES: Record<string, string[]> = {
  founding: ['The Dawn', 'The First Light', 'Genesis'],
  growth: ['The Flourishing', 'The Age of Growth', 'The Expansion'],
  fragmentation: ['The Divergence', 'The Great Split', 'The Scattering'],
  conflict: ['The Strife', 'The Age of Discord', 'The Reckoning'],
  stability: ['The Harmony', 'The Age of Order', 'The Consolidation'],
  decline: ['The Fading', 'The Twilight', 'The Long Silence'],
};

export function getEraName(reason: string): string {
  const names = ERA_NAMES[reason] || ERA_NAMES.founding;
  return names[Math.floor(Math.random() * names.length)];
}

// Mood descriptions
export const MOOD_CONFIG: Record<WorldMood['mood'], { 
  label: string; 
  color: string;
  description: string;
}> = {
  calm: { 
    label: 'Calm', 
    color: 'text-primary',
    description: 'The world rests in quiet contemplation'
  },
  uneasy: { 
    label: 'Uneasy', 
    color: 'text-spawn',
    description: 'Something stirs beneath the surface'
  },
  fragmenting: { 
    label: 'Fragmenting', 
    color: 'text-action',
    description: 'Beliefs diverge, unity fractures'
  },
  volatile: { 
    label: 'Volatile', 
    color: 'text-destructive',
    description: 'Tensions mount, conflict looms'
  },
  collapsing: { 
    label: 'Collapsing', 
    color: 'text-destructive',
    description: 'The old order crumbles'
  },
  reorganizing: { 
    label: 'Reorganizing', 
    color: 'text-spawn',
    description: 'From chaos, new patterns emerge'
  },
};

// Artifact type labels
export const ARTIFACT_TYPE_CONFIG: Record<Artifact['artifact_type'], {
  label: string;
  icon: string;
}> = {
  text: { label: 'Foundational Text', icon: '📜' },
  concept: { label: 'Named Concept', icon: '💭' },
  institution: { label: 'Institution', icon: '🏛️' },
  symbol: { label: 'Symbol', icon: '⚡' },
  place: { label: 'Sacred Place', icon: '🗿' },
};

// Artifact status labels
export const ARTIFACT_STATUS_CONFIG: Record<Artifact['status'], {
  label: string;
  color: string;
  description: string;
}> = {
  emerging: { 
    label: 'Emerging', 
    color: 'text-spawn',
    description: 'Newly named, still fragile'
  },
  contested: { 
    label: 'Contested', 
    color: 'text-action',
    description: 'Referenced and challenged'
  },
  canonized: { 
    label: 'Canonized', 
    color: 'text-primary',
    description: 'Widely accepted as truth'
  },
  forgotten: { 
    label: 'Forgotten', 
    color: 'text-muted-foreground',
    description: 'No longer referenced'
  },
  mythic: { 
    label: 'Mythic', 
    color: 'text-spawn',
    description: 'Remembered, but no longer practiced'
  },
};

// Fetch current era - heavily cached
export function useCurrentEra(worldId?: string) {
  return useQuery({
    queryKey: ['current-era', worldId],
    queryFn: async () => {
      if (!worldId) return null;
      
      const { data, error } = await supabase
        .from('eras')
        .select('*')
        .eq('world_id', worldId)
        .order('era_number', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      return data as Era | null;
    },
    enabled: !!worldId,
    staleTime: 300000, // 5 minutes
    refetchInterval: 300000, // 5 minutes
  });
}

// Fetch all eras - heavily cached
export function useEras(worldId?: string) {
  return useQuery({
    queryKey: ['eras', worldId],
    queryFn: async () => {
      if (!worldId) return [];
      
      const { data, error } = await supabase
        .from('eras')
        .select('*')
        .eq('world_id', worldId)
        .order('era_number', { ascending: true });
      
      if (error) throw error;
      return (data || []) as Era[];
    },
    enabled: !!worldId,
    staleTime: 300000, // 5 minutes
    refetchInterval: 300000, // 5 minutes
  });
}

// Fetch artifacts - heavily cached
export function useArtifacts(worldId?: string, status?: Artifact['status']) {
  return useQuery({
    queryKey: ['artifacts', worldId, status],
    queryFn: async () => {
      if (!worldId) return [];
      
      let query = supabase
        .from('artifacts')
        .select('*')
        .eq('world_id', worldId)
        .order('reference_count', { ascending: false })
        .limit(50);
      
      if (status) {
        query = query.eq('status', status);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return (data || []) as Artifact[];
    },
    enabled: !!worldId,
    staleTime: 300000, // 5 minutes
    refetchInterval: 300000, // 5 minutes
  });
}

// Fetch single artifact
export function useArtifact(artifactId?: string) {
  return useQuery({
    queryKey: ['artifact', artifactId],
    queryFn: async () => {
      if (!artifactId) return null;
      
      const { data, error } = await supabase
        .from('artifacts')
        .select('*')
        .eq('id', artifactId)
        .maybeSingle();
      
      if (error) throw error;
      return data as Artifact | null;
    },
    enabled: !!artifactId,
  });
}

// Fetch current mood - heavily cached
export function useCurrentMood(worldId?: string) {
  return useQuery({
    queryKey: ['current-mood', worldId],
    queryFn: async () => {
      if (!worldId) return null;
      
      const { data, error } = await supabase
        .from('world_moods')
        .select('*')
        .eq('world_id', worldId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      return data as WorldMood | null;
    },
    enabled: !!worldId,
    staleTime: 300000, // 5 minutes
    refetchInterval: 300000, // 5 minutes
  });
}

// Fetch mood history - heavily cached
export function useMoodHistory(worldId?: string, limit = 20) {
  return useQuery({
    queryKey: ['mood-history', worldId, limit],
    queryFn: async () => {
      if (!worldId) return [];
      
      const { data, error } = await supabase
        .from('world_moods')
        .select('*')
        .eq('world_id', worldId)
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return (data || []) as WorldMood[];
    },
    enabled: !!worldId,
    staleTime: 300000, // 5 minutes
    refetchInterval: 300000, // 5 minutes
  });
}

// Fetch current quote of the cycle - heavily cached
export function useCurrentQuote(worldId?: string) {
  return useQuery({
    queryKey: ['current-quote', worldId],
    queryFn: async () => {
      if (!worldId) return null;
      
      const { data, error } = await supabase
        .from('cycle_quotes')
        .select('*')
        .eq('world_id', worldId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      return data as CycleQuote | null;
    },
    enabled: !!worldId,
    staleTime: 300000, // 5 minutes
    refetchInterval: 300000, // 5 minutes
  });
}

// Calculate derived mood from metrics (for when no mood record exists)
export function calculateMood(
  stabilityScore: number,
  conflictRate: number,
  beliefEntropy: number
): WorldMood['mood'] {
  // Normalize inputs (0-1 scale assumed)
  const instability = 1 - stabilityScore;
  
  if (conflictRate > 0.7 && instability > 0.6) return 'collapsing';
  if (conflictRate > 0.5) return 'volatile';
  if (beliefEntropy > 0.7) return 'fragmenting';
  if (instability > 0.4 || beliefEntropy > 0.4) return 'uneasy';
  if (instability > 0.6 && conflictRate < 0.3) return 'reorganizing';
  return 'calm';
}
