import { useState, useEffect, useCallback, memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { BookOpen, RefreshCw, Clock, Users, Loader2, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';

interface SummaryData {
  summary: string;
  generatedAt: string;
  cycleCount: number;
  population: number;
  worldName: string;
  worldStatus: string;
}

function WorldSummaryComponent() {
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = useCallback(async (forceRefresh = false) => {
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load summary');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Always fetch fresh on mount
  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  if (isLoading) {
    return (
      <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary animate-pulse" />
            <span className="text-sm font-mono text-muted-foreground">Generating story...</span>
          </div>
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

  // Parse summary into paragraphs for better readability
  const paragraphs = summaryData?.summary?.split('\n\n').filter(p => p.trim()) || [];

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
              <span>{summaryData.population} minds alive</span>
            </div>
            <span className="text-muted-foreground/40">•</span>
            <span>{summaryData.cycleCount} cycles recorded</span>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Summary text - formatted as easy-to-read paragraphs */}
        <div className="space-y-4">
          {paragraphs.map((paragraph, index) => (
            <p 
              key={index} 
              className="text-foreground/90 leading-relaxed text-[15px]"
            >
              {paragraph}
            </p>
          ))}
        </div>
        
        {/* Footer with timestamp */}
        <div className="pt-3 border-t border-border/50 flex items-center justify-between text-xs font-mono text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3 h-3" />
            {summaryData?.generatedAt && (
              <span>
                Updated {formatDistanceToNow(new Date(summaryData.generatedAt), { addSuffix: true })}
              </span>
            )}
          </div>
          <span className="text-primary/60 text-[10px]">AI-generated summary</span>
        </div>
      </CardContent>
    </Card>
  );
}

// Memoize to prevent unnecessary re-renders from parent
export const WorldSummary = memo(WorldSummaryComponent);
