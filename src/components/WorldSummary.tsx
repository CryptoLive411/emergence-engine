import { useState, useEffect, useCallback, memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { BookOpen, RefreshCw, Clock, Users, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface SummaryData {
  summary: string;
  generatedAt: string;
  cycleCount: number;
  population: number;
  worldName: string;
  worldStatus: string;
}

const CACHE_KEY = 'molt_world_summary';
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds

function WorldSummaryComponent() {
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCachedSummary = (): SummaryData | null => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        const cacheTime = new Date(parsed.generatedAt).getTime();
        const now = Date.now();
        
        // Check if cache is still valid (less than 6 hours old)
        if (now - cacheTime < CACHE_DURATION) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error loading cached summary:', e);
    }
    return null;
  };

  const saveSummaryToCache = (data: SummaryData) => {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Error saving summary to cache:', e);
    }
  };

  const fetchSummary = useCallback(async (forceRefresh = false) => {
    // Check cache first unless forcing refresh
    if (!forceRefresh) {
      const cached = loadCachedSummary();
      if (cached) {
        setSummaryData(cached);
        setIsLoading(false);
        return;
      }
    }

    setIsRefreshing(forceRefresh);
    if (!forceRefresh) setIsLoading(true);
    setError(null);

    try {
      const response = await supabase.functions.invoke('generate-world-summary');

      if (response.error) {
        throw new Error(response.error.message);
      }

      if (response.data.error) {
        throw new Error(response.data.error);
      }

      const data = response.data as SummaryData;
      setSummaryData(data);
      saveSummaryToCache(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load summary');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  // Calculate time until next refresh
  const getNextRefreshTime = () => {
    if (!summaryData?.generatedAt) return null;
    const cacheTime = new Date(summaryData.generatedAt).getTime();
    const nextRefresh = new Date(cacheTime + CACHE_DURATION);
    return nextRefresh;
  };

  const nextRefresh = getNextRefreshTime();

  if (isLoading) {
    return (
      <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader className="pb-3">
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-1/2" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive/30 bg-destructive/5">
        <CardContent className="py-6">
          <p className="text-sm text-destructive font-mono">{error}</p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => fetchSummary(true)}
            className="mt-3"
          >
            Try again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <BookOpen className="w-5 h-5 text-primary" />
            <span>The Story So Far</span>
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fetchSummary(true)}
            disabled={isRefreshing}
            className="text-xs font-mono"
          >
            {isRefreshing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            <span className="ml-1.5 hidden sm:inline">Refresh</span>
          </Button>
        </div>
        
        {/* Stats row */}
        {summaryData && (
          <div className="flex items-center gap-4 text-xs font-mono text-muted-foreground mt-2">
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              <span>{summaryData.population} minds</span>
            </div>
            <span>·</span>
            <span>{summaryData.cycleCount} cycles recorded</span>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Summary text */}
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <p className="text-foreground/90 leading-relaxed whitespace-pre-line">
            {summaryData?.summary}
          </p>
        </div>
        
        {/* Footer with cache info */}
        <div className="pt-3 border-t border-border/50 flex items-center justify-between text-xs font-mono text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3 h-3" />
            {summaryData?.generatedAt && (
              <span>
                Generated {formatDistanceToNow(new Date(summaryData.generatedAt), { addSuffix: true })}
              </span>
            )}
          </div>
          <span className="text-muted-foreground/60">Click refresh for latest</span>
        </div>
      </CardContent>
    </Card>
  );
}

// Memoize to prevent unnecessary re-renders from parent
export const WorldSummary = memo(WorldSummaryComponent);
