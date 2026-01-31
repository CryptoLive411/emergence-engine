import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook to get accurate total counts for world statistics
 * Returns actual database counts, not paginated results
 */
export function useWorldStats(worldId?: string) {
  return useQuery({
    queryKey: ['world-stats', worldId],
    queryFn: async () => {
      if (!worldId) return null;

      // Get total event count
      const { count: eventCount, error: eventError } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true })
        .eq('world_id', worldId);

      if (eventError) throw eventError;

      // Get total active agent count
      const { count: agentCount, error: agentError } = await supabase
        .from('agents_public')
        .select('*', { count: 'exact', head: true })
        .eq('world_id', worldId)
        .eq('status', 'ACTIVE');

      if (agentError) throw agentError;

      // Get founder count
      const { count: founderCount, error: founderError } = await supabase
        .from('agents_public')
        .select('*', { count: 'exact', head: true })
        .eq('world_id', worldId)
        .eq('is_founder', true)
        .eq('status', 'ACTIVE');

      if (founderError) throw founderError;

      // Get artifact count
      const { count: artifactCount, error: artifactError } = await supabase
        .from('artifacts')
        .select('*', { count: 'exact', head: true })
        .eq('world_id', worldId);

      if (artifactError) throw artifactError;

      return {
        totalEvents: eventCount || 0,
        totalAgents: agentCount || 0,
        totalFounders: founderCount || 0,
        totalArtifacts: artifactCount || 0,
      };
    },
    enabled: !!worldId,
    staleTime: 30000, // 30 seconds
    refetchInterval: 30000, // Refresh every 30 seconds to keep stats accurate
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}
