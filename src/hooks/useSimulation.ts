import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface World {
  id: string;
  name: string;
  status: 'ACTIVE' | 'PAUSED' | 'ENDED';
  tick_interval_minutes: number;
  max_active_agents: number;
  spawn_cost_energy: number;
  chaos_factor: number;
  created_at: string;
  updated_at: string;
}

export interface Agent {
  id: string;
  world_id: string;
  name: string;
  generation: number;
  parent_agent_id: string | null;
  traits: string[];
  purpose: string;
  loyalty: 'PARENT' | 'INDEPENDENT' | 'REBELLIOUS';
  energy: number;
  influence_points: number;
  status: 'ACTIVE' | 'INACTIVE';
  is_founder: boolean;
  founder_type: 'A' | 'B' | null;
  created_turn: number;
  created_at: string;
}

export interface WorldEvent {
  id: string;
  world_id: string;
  turn_id: string;
  agent_id: string | null;
  type: 'SPEECH' | 'ACTION' | 'SPAWN' | 'SYSTEM';
  title: string;
  content: string;
  metadata: Record<string, any>;
  created_at: string;
}

export interface Briefing {
  id: string;
  world_id: string;
  turn_id: string;
  headline: string;
  summary: string;
  key_events: string[];
  population: number;
  dominant_norms: string[];
  created_at: string;
}

export interface Turn {
  id: string;
  world_id: string;
  turn_number: number;
  started_at: string;
  ended_at: string | null;
}

// Fetch the current world - heavily cached for high traffic
// Priority: ACTIVE first, then PAUSED, then most recently created
export function useWorld() {
  return useQuery({
    queryKey: ['world'],
    queryFn: async () => {
      // First try to get an ACTIVE world
      const { data: activeWorld, error: activeError } = await supabase
        .from('worlds')
        .select('*')
        .eq('status', 'ACTIVE')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (activeError && activeError.code !== 'PGRST116') throw activeError;
      if (activeWorld) return activeWorld as World;
      
      // Fall back to PAUSED world
      const { data: pausedWorld, error: pausedError } = await supabase
        .from('worlds')
        .select('*')
        .eq('status', 'PAUSED')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (pausedError && pausedError.code !== 'PGRST116') throw pausedError;
      return pausedWorld as World | null;
    },
    staleTime: 300000, // Data stays fresh for 5 minutes
    refetchInterval: 600000, // Auto-refresh every 10 minutes to match simulation tick
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

// Fetch all agents - heavily cached for high traffic
// Includes inactive founders so they remain visible as "deceased"
export function useAgents(worldId?: string) {
  return useQuery({
    queryKey: ['agents', worldId],
    queryFn: async () => {
      if (!worldId) return [];
      
      // Fetch active agents
      const { data: activeAgents, error: activeError } = await supabase
        .from('agents_public')
        .select('*')
        .eq('world_id', worldId)
        .eq('status', 'ACTIVE')
        .order('created_at', { ascending: true });
      
      if (activeError) throw activeError;
      
      // Also fetch inactive founders (they should always be visible)
      const { data: inactiveFounders, error: foundersError } = await supabase
        .from('agents_public')
        .select('*')
        .eq('world_id', worldId)
        .eq('is_founder', true)
        .eq('status', 'INACTIVE')
        .order('created_at', { ascending: true });
      
      if (foundersError) throw foundersError;
      
      // Combine and deduplicate by id
      const allAgents = [...(activeAgents || []), ...(inactiveFounders || [])];
      const uniqueAgents = allAgents.filter((agent, index, self) =>
        index === self.findIndex(a => a.id === agent.id)
      );
      
      return uniqueAgents as Agent[];
    },
    enabled: !!worldId,
    staleTime: 300000, // Data stays fresh for 5 minutes
    refetchInterval: 600000, // Auto-refresh every 10 minutes to match simulation tick
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

// Fetch single agent
export function useAgent(agentId?: string) {
  return useQuery({
    queryKey: ['agent', agentId],
    queryFn: async () => {
      if (!agentId) return null;
      
      const { data, error } = await supabase
        .from('agents_public')
        .select('*')
        .eq('id', agentId)
        .single();
      
      if (error) throw error;
      return data as Agent;
    },
    enabled: !!agentId,
  });
}

// Fetch agent's children
export function useAgentChildren(parentId?: string) {
  return useQuery({
    queryKey: ['agent-children', parentId],
    queryFn: async () => {
      if (!parentId) return [];
      
      const { data, error } = await supabase
        .from('agents_public')
        .select('*')
        .eq('parent_agent_id', parentId)
        .eq('status', 'ACTIVE');
      
      if (error) throw error;
      return (data || []) as Agent[];
    },
    enabled: !!parentId,
  });
}

// Fetch events - heavily cached for high traffic
export function useEvents(worldId?: string, limit = 50) {
  return useQuery({
    queryKey: ['events', worldId, limit],
    queryFn: async () => {
      if (!worldId) return [];
      
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('world_id', worldId)
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return (data || []) as WorldEvent[];
    },
    enabled: !!worldId,
    staleTime: 300000, // Data stays fresh for 5 minutes
    refetchInterval: 600000, // Auto-refresh every 10 minutes to match simulation tick
    retry: 3,
  });
}

// Fetch events by agent
export function useAgentEvents(agentId?: string, limit = 20) {
  return useQuery({
    queryKey: ['agent-events', agentId, limit],
    queryFn: async () => {
      if (!agentId) return [];
      
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('agent_id', agentId)
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return (data || []) as WorldEvent[];
    },
    enabled: !!agentId,
  });
}

// Fetch briefings - heavily cached for high traffic
export function useBriefings(worldId?: string) {
  return useQuery({
    queryKey: ['briefings', worldId],
    queryFn: async () => {
      if (!worldId) return [];
      
      const { data, error } = await supabase
        .from('briefings')
        .select('*')
        .eq('world_id', worldId)
        .order('created_at', { ascending: false })
        .limit(10); // Only fetch last 10 for homepage
      
      if (error) throw error;
      return (data || []) as Briefing[];
    },
    enabled: !!worldId,
    staleTime: 300000, // Data stays fresh for 5 minutes
    refetchInterval: 600000, // Auto-refresh every 10 minutes to match simulation tick
    retry: 3,
  });
}

// Fetch single briefing
export function useBriefing(briefingId?: string) {
  return useQuery({
    queryKey: ['briefing', briefingId],
    queryFn: async () => {
      if (!briefingId) return null;
      
      const { data, error } = await supabase
        .from('briefings')
        .select('*')
        .eq('id', briefingId)
        .single();
      
      if (error) throw error;
      return data as Briefing;
    },
    enabled: !!briefingId,
    staleTime: 300000, // 5 minutes
  });
}

// Fetch current turn - heavily cached for high traffic
export function useCurrentTurn(worldId?: string) {
  return useQuery({
    queryKey: ['current-turn', worldId],
    queryFn: async () => {
      if (!worldId) return null;
      
      const { data, error } = await supabase
        .from('turns')
        .select('*')
        .eq('world_id', worldId)
        .order('turn_number', { ascending: false })
        .limit(1)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data as Turn | null;
    },
    enabled: !!worldId,
    staleTime: 300000, // Data stays fresh for 5 minutes
    refetchInterval: 600000, // Auto-refresh every 10 minutes to match simulation tick
    retry: 3,
  });
}

// World control mutations
export function useWorldControl() {
  const queryClient = useQueryClient();

  const startWorld = useMutation({
    mutationFn: async (settings?: { 
      name?: string; 
      tickIntervalMinutes?: number; 
      maxActiveAgents?: number; 
      spawnCostEnergy?: number;
      chaosFactor?: number;
    }) => {
      const response = await supabase.functions.invoke('world-control', {
        body: { action: 'start', settings },
      });
      if (response.error) throw response.error;
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['world'] });
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['briefings'] });
      toast.success('World started!');
    },
    onError: (error: Error) => {
      toast.error(`Failed to start world: ${error.message}`);
    },
  });

  const pauseWorld = useMutation({
    mutationFn: async () => {
      const response = await supabase.functions.invoke('world-control', {
        body: { action: 'pause' },
      });
      if (response.error) throw response.error;
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['world'] });
      toast.success('World paused');
    },
    onError: (error: Error) => {
      toast.error(`Failed to pause world: ${error.message}`);
    },
  });

  const resetWorld = useMutation({
    mutationFn: async (password: string) => {
      const response = await supabase.functions.invoke('world-control', {
        body: { action: 'reset', password },
      });
      if (response.error) throw response.error;
      if (response.data?.error) throw new Error(response.data.error);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['world'] });
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['briefings'] });
      toast.success('World reset');
    },
    onError: (error: Error) => {
      toast.error(`Failed to reset world: ${error.message}`);
    },
  });

  const runTick = useMutation({
    mutationFn: async (password: string) => {
      const response = await supabase.functions.invoke('world-tick', {
        body: { tickSecret: password },
      });
      if (response.error) throw response.error;
      if (response.data?.error) throw new Error(response.data.error);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['world'] });
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['briefings'] });
      queryClient.invalidateQueries({ queryKey: ['current-turn'] });
      queryClient.invalidateQueries({ queryKey: ['artifacts'] });
      toast.success(`Turn ${data.turn} complete: ${data.events} events, ${data.newAgents} new agents`);
    },
    onError: (error: Error) => {
      toast.error(`Tick failed: ${error.message}`);
    },
  });

  const updateSettings = useMutation({
    mutationFn: async ({ worldId, settings }: {
      worldId: string;
      settings: {
        tickIntervalMinutes?: number;
        maxActiveAgents?: number;
        spawnCostEnergy?: number;
        chaosFactor?: number;
      };
    }) => {
      const response = await supabase.functions.invoke('world-control', {
        body: { action: 'update-settings', worldId, settings },
      });
      if (response.error) throw response.error;
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['world'] });
      toast.success('Settings updated');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update settings: ${error.message}`);
    },
  });

  const spawnAgent = useMutation({
    mutationFn: async ({ password, agentData }: {
      password: string;
      agentData?: {
        name?: string;
        purpose?: string;
        traits?: string[];
        identityPrompt?: string;
      };
    }) => {
      const response = await supabase.functions.invoke('world-control', {
        body: { action: 'spawn-agent', password, agentData },
      });
      if (response.error) throw response.error;
      if (response.data?.error) throw new Error(response.data.error);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast.success(data.message || 'New mind spawned');
    },
    onError: (error: Error) => {
      toast.error(`Failed to spawn agent: ${error.message}`);
    },
  });

  const turboBurst = useMutation({
    mutationFn: async ({ password, burstCount = 3 }: { password: string; burstCount?: number }) => {
      const response = await supabase.functions.invoke('world-control', {
        body: { action: 'turbo-burst', password, settings: { burstCount } },
      });
      if (response.error) throw response.error;
      if (response.data?.error) throw new Error(response.data.error);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['world'] });
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['briefings'] });
      queryClient.invalidateQueries({ queryKey: ['current-turn'] });
      queryClient.invalidateQueries({ queryKey: ['world-stats'] });
      queryClient.invalidateQueries({ queryKey: ['artifacts'] });
      toast.success(data.message || 'Turbo burst complete!');
    },
    onError: (error: Error) => {
      toast.error(`Turbo burst failed: ${error.message}`);
    },
  });

  return {
    startWorld,
    pauseWorld,
    resetWorld,
    runTick,
    updateSettings,
    spawnAgent,
    turboBurst,
  };
}

// Build lineage tree
export function useLineageTree(agents: Agent[]) {
  const founders = agents.filter(a => a.generation === 0);
  
  const buildNode = (agent: Agent): any => ({
    id: agent.id,
    name: agent.name,
    generation: agent.generation,
    founderType: agent.founder_type,
    purpose: agent.purpose,
    children: agents
      .filter(a => a.parent_agent_id === agent.id)
      .map(buildNode),
  });
  
  return founders.map(buildNode);
}