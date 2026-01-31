import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SimplifyResult {
  simplified: string;
  isLoading: boolean;
  error: string | null;
}

export function useSimplify() {
  const [cache, setCache] = useState<Record<string, string>>({});

  const simplifyText = async (
    eventId: string,
    title: string,
    content: string,
    eventType: string
  ): Promise<SimplifyResult> => {
    // Check cache first
    if (cache[eventId]) {
      return { simplified: cache[eventId], isLoading: false, error: null };
    }

    try {
      const response = await supabase.functions.invoke('simplify-text', {
        body: { title, content, eventType },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      const simplified = response.data.simplified;
      
      // Cache the result
      setCache(prev => ({ ...prev, [eventId]: simplified }));
      
      return { simplified, isLoading: false, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to simplify';
      return { simplified: '', isLoading: false, error: errorMessage };
    }
  };

  const getCached = (eventId: string): string | null => {
    return cache[eventId] || null;
  };

  return { simplifyText, getCached, cache };
}
