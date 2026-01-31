import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { validateXHandle, normalizeXHandle } from '@/lib/validators';

export interface Claim {
  id: string;
  agent_id: string;
  x_handle: string;
  claimed_at: string;
  lineage_score: number;
}

export interface Annotation {
  id: string;
  event_id: string;
  x_handle: string;
  annotation_type: 'highlight' | 'tag' | 'note';
  content: string;
  created_at: string;
}

export interface Achievement {
  id: string;
  x_handle: string;
  achievement_type: string;
  achievement_name: string;
  description: string;
  earned_at: string;
  metadata: Record<string, unknown>;
}

// LocalStorage key for user's X handle
const X_HANDLE_KEY = 'genesis_x_handle';

export function getStoredXHandle(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(X_HANDLE_KEY);
}

export function setStoredXHandle(handle: string): void {
  localStorage.setItem(X_HANDLE_KEY, handle.toLowerCase().replace('@', ''));
}

export function clearStoredXHandle(): void {
  localStorage.removeItem(X_HANDLE_KEY);
}

// Fetch all claims - heavily cached
export function useClaims() {
  return useQuery({
    queryKey: ['claims'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('claims')
        .select('*')
        .order('lineage_score', { ascending: false });
      
      if (error) throw error;
      return (data || []) as Claim[];
    },
    staleTime: 300000, // 5 minutes
    refetchInterval: 300000, // 5 minutes
    retry: 2,
  });
}

// Fetch claim for specific agent
export function useAgentClaim(agentId?: string) {
  return useQuery({
    queryKey: ['claim', agentId],
    queryFn: async () => {
      if (!agentId) return null;
      
      const { data, error } = await supabase
        .from('claims')
        .select('*')
        .eq('agent_id', agentId)
        .maybeSingle();
      
      if (error) throw error;
      return data as Claim | null;
    },
    enabled: !!agentId,
  });
}

// Fetch user's claim by X handle
export function useUserClaim(xHandle?: string | null) {
  return useQuery({
    queryKey: ['user-claim', xHandle],
    queryFn: async () => {
      if (!xHandle) return null;
      
      const normalizedHandle = xHandle.toLowerCase().replace('@', '');
      const { data, error } = await supabase
        .from('claims')
        .select('*')
        .eq('x_handle', normalizedHandle)
        .maybeSingle();
      
      if (error) throw error;
      return data as Claim | null;
    },
    enabled: !!xHandle,
  });
}

// Fetch annotations for an event - ONLY use this on detail pages, NOT in lists
export function useEventAnnotations(eventId?: string) {
  return useQuery({
    queryKey: ['annotations', eventId],
    queryFn: async () => {
      if (!eventId) return [];
      
      const { data, error } = await supabase
        .from('annotations')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return (data || []) as Annotation[];
    },
    enabled: !!eventId,
    staleTime: 300000, // 5 minutes
  });
}

// Fetch all annotations for display
export function useAllAnnotations() {
  return useQuery({
    queryKey: ['all-annotations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('annotations')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      return (data || []) as Annotation[];
    },
  });
}

// Fetch achievements for a user
export function useUserAchievements(xHandle?: string | null) {
  return useQuery({
    queryKey: ['achievements', xHandle],
    queryFn: async () => {
      if (!xHandle) return [];
      
      const normalizedHandle = xHandle.toLowerCase().replace('@', '');
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .eq('x_handle', normalizedHandle)
        .order('earned_at', { ascending: false });
      
      if (error) throw error;
      return (data || []) as Achievement[];
    },
    enabled: !!xHandle,
  });
}

// Fetch leaderboard (top claims by lineage score) - heavily cached
export function useLeaderboard(limit = 10) {
  return useQuery({
    queryKey: ['leaderboard', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('claims')
        .select('*')
        .order('lineage_score', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return (data || []) as Claim[];
    },
    staleTime: 300000, // 5 minutes
    refetchInterval: 300000, // 5 minutes
    retry: 2,
  });
}

// Claim an agent
export function useClaimAgent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ agentId, xHandle }: { agentId: string; xHandle: string }) => {
      // Client-side validation first for UX
      const validation = validateXHandle(xHandle);
      if (!validation.valid) {
        throw new Error(validation.error);
      }
      
      // Call server-side edge function for secure processing
      const response = await supabase.functions.invoke('custodianship', {
        body: { 
          action: 'claim-agent',
          agentId, 
          xHandle 
        },
      });
      
      if (response.error) throw response.error;
      if (response.data?.error) throw new Error(response.data.error);
      
      // Store the handle locally
      setStoredXHandle(normalizeXHandle(xHandle));
      
      return response.data.claim as Claim;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['claims'] });
      queryClient.invalidateQueries({ queryKey: ['user-claim'] });
      queryClient.invalidateQueries({ queryKey: ['claim'] });
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
      toast.success('You have claimed this soul.');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// Add annotation to an event
export function useAddAnnotation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      eventId, 
      xHandle, 
      annotationType, 
      content 
    }: { 
      eventId: string; 
      xHandle: string; 
      annotationType: 'highlight' | 'tag' | 'note';
      content: string;
    }) => {
      // Client-side validation first for UX
      const validation = validateXHandle(xHandle);
      if (!validation.valid) {
        throw new Error(validation.error);
      }
      
      // Call server-side edge function for secure processing
      const response = await supabase.functions.invoke('custodianship', {
        body: { 
          action: 'add-annotation',
          eventId, 
          xHandle,
          annotationType,
          content
        },
      });
      
      if (response.error) throw response.error;
      if (response.data?.error) throw new Error(response.data.error);
      
      return response.data.annotation as Annotation;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['annotations', variables.eventId] });
      queryClient.invalidateQueries({ queryKey: ['all-annotations'] });
      toast.success('Annotation added to the historical record.');
    },
    onError: (error: Error) => {
      toast.error(`Failed to add annotation: ${error.message}`);
    },
  });
}

// Release a claim (give up witness status)
export function useReleaseClaim() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ claimId, xHandle }: { claimId: string; xHandle: string }) => {
      // Call server-side edge function for secure processing
      const response = await supabase.functions.invoke('custodianship', {
        body: { 
          action: 'release-claim',
          claimId,
          xHandle
        },
      });
      
      if (response.error) throw response.error;
      if (response.data?.error) throw new Error(response.data.error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['claims'] });
      queryClient.invalidateQueries({ queryKey: ['user-claim'] });
      queryClient.invalidateQueries({ queryKey: ['claim'] });
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
      toast.success('You have released your claim.');
    },
    onError: (error: Error) => {
      toast.error(`Failed to release claim: ${error.message}`);
    },
  });
}
