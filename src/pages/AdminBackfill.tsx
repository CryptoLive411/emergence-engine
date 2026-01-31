import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { AdminAuthGate } from '@/components/AdminAuthGate';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Sparkles, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface BackfillResult {
  id: string;
  success: boolean;
  humanSummary?: string;
  error?: string;
}

const AdminBackfillContent = () => {
  const [isBackfilling, setIsBackfilling] = useState(false);
  const [results, setResults] = useState<BackfillResult[]>([]);
  const [totalProcessed, setTotalProcessed] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleBackfill = async (limit: number) => {
    setIsBackfilling(true);
    setError(null);
    setResults([]);
    setTotalProcessed(0);

    try {
      const { data, error: invokeError } = await supabase.functions.invoke('generate-human-summary', {
        body: { limit },
      });

      if (invokeError) throw invokeError;

      if (data.error) {
        throw new Error(data.error);
      }

      setResults(data.results || []);
      setTotalProcessed(data.processed || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to backfill summaries');
    } finally {
      setIsBackfilling(false);
    }
  };

  const successCount = results.filter(r => r.success).length;
  const failCount = results.filter(r => !r.success).length;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">
            Backfill Human Summaries
          </h1>
          <p className="text-muted-foreground">
            Generate human-readable summaries for existing events using AI
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Generate Summaries
            </CardTitle>
            <CardDescription>
              This will process events that don't have human summaries yet. Each batch takes ~1 second per event.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <Button
                onClick={() => handleBackfill(10)}
                disabled={isBackfilling}
                variant="outline"
              >
                {isBackfilling ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4 mr-2" />
                )}
                10 Events
              </Button>

              <Button
                onClick={() => handleBackfill(50)}
                disabled={isBackfilling}
                variant="outline"
              >
                {isBackfilling ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4 mr-2" />
                )}
                50 Events
              </Button>

              <Button
                onClick={() => handleBackfill(100)}
                disabled={isBackfilling}
              >
                {isBackfilling ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4 mr-2" />
                )}
                100 Events
              </Button>
            </div>

            {isBackfilling && (
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                <div className="flex items-center gap-2 text-sm text-primary">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing events... This may take a while.</span>
                </div>
              </div>
            )}

            {error && (
              <div className="p-4 rounded-lg bg-destructive/5 border border-destructive/20">
                <div className="flex items-center gap-2 text-sm text-destructive">
                  <AlertCircle className="w-4 h-4" />
                  <span>{error}</span>
                </div>
              </div>
            )}

            {totalProcessed > 0 && (
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">Results</span>
                  <span className="text-xs text-muted-foreground">
                    {totalProcessed} events processed
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1 text-primary">
                    <CheckCircle className="w-4 h-4" />
                    <span>{successCount} succeeded</span>
                  </div>
                  {failCount > 0 && (
                    <div className="flex items-center gap-1 text-destructive">
                      <AlertCircle className="w-4 h-4" />
                      <span>{failCount} failed</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {results.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Detailed Results</CardTitle>
              <CardDescription>
                Review the generated summaries
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {results.map((result, idx) => (
                  <div
                    key={result.id}
                    className={cn(
                      "p-3 rounded-lg border text-sm",
                      result.success
                        ? "bg-primary/5 border-primary/20"
                        : "bg-destructive/5 border-destructive/20"
                    )}
                  >
                    <div className="flex items-start gap-2">
                      {result.success ? (
                        <CheckCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-mono text-xs text-muted-foreground mb-1">
                          Event #{idx + 1}
                        </div>
                        {result.success && result.humanSummary ? (
                          <p className="text-foreground">{result.humanSummary}</p>
                        ) : (
                          <p className="text-destructive">{result.error || 'Unknown error'}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="mt-6 p-4 rounded-lg bg-muted/30 border border-border">
          <h3 className="text-sm font-medium text-foreground mb-2">Cost Estimate</h3>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• 10 events: ~$0.001 (~10 seconds)</li>
            <li>• 50 events: ~$0.005 (~50 seconds)</li>
            <li>• 100 events: ~$0.01 (~100 seconds)</li>
            <li>• 1000 events: ~$0.10 (~17 minutes)</li>
          </ul>
        </div>
      </div>
    </Layout>
  );
};

const AdminBackfill = () => {
  return (
    <AdminAuthGate>
      <AdminBackfillContent />
    </AdminAuthGate>
  );
};

export default AdminBackfill;
