import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PaginatedEvent {
  id: string;
  world_id: string;
  turn_id: string;
  agent_id: string | null;
  type: 'SPEECH' | 'ACTION' | 'SPAWN' | 'SYSTEM';
  title: string;
  content: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

const PAGE_SIZE = 15;

/**
 * Paginated events hook with cursor-based pagination.
 * Only fetches one page at a time, with "Load More" support.
 * Heavily cached to reduce DB load.
 */
export function usePaginatedEvents(worldId?: string) {
  const [cursor, setCursor] = useState<string | null>(null);
  const [allEvents, setAllEvents] = useState<PaginatedEvent[]>([]);
  const [hasMore, setHasMore] = useState(true);

  // Fetch initial page
  const { isLoading, error, refetch } = useQuery({
    queryKey: ['paginated-events', worldId, 'initial'],
    queryFn: async () => {
      if (!worldId) return [];
      
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('world_id', worldId)
        .order('created_at', { ascending: false })
        .limit(PAGE_SIZE);
      
      if (error) throw error;
      
      const events = (data || []) as PaginatedEvent[];
      setAllEvents(events);
      setHasMore(events.length === PAGE_SIZE);
      
      if (events.length > 0) {
        setCursor(events[events.length - 1].created_at);
      }
      
      return events;
    },
    enabled: !!worldId,
    staleTime: 300000, // 5 minutes
    refetchInterval: 300000, // 5 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Load more function
  const loadMore = useCallback(async () => {
    if (!worldId || !cursor || !hasMore) return;
    
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('world_id', worldId)
        .order('created_at', { ascending: false })
        .lt('created_at', cursor)
        .limit(PAGE_SIZE);
      
      if (error) throw error;
      
      const newEvents = (data || []) as PaginatedEvent[];
      
      if (newEvents.length < PAGE_SIZE) {
        setHasMore(false);
      }
      
      if (newEvents.length > 0) {
        setAllEvents(prev => [...prev, ...newEvents]);
        setCursor(newEvents[newEvents.length - 1].created_at);
      }
    } catch (err) {
      console.error('Failed to load more events:', err);
    }
  }, [worldId, cursor, hasMore]);

  // Reset function
  const reset = useCallback(() => {
    setCursor(null);
    setAllEvents([]);
    setHasMore(true);
    refetch();
  }, [refetch]);

  return {
    events: allEvents,
    isLoading,
    error,
    hasMore,
    loadMore,
    reset,
  };
}
