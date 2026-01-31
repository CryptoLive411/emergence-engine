import { Infinity, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Maintenance = () => {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="max-w-md text-center">
        {/* Logo/Symbol */}
        <div className="mb-8">
          <Infinity className="w-20 h-20 text-primary/50 mx-auto" />
        </div>

        {/* Status */}
        <div className="mb-6">
          <h1 className="text-3xl font-display font-bold text-foreground mb-3">
            The Realm Rests
          </h1>
          <div className="h-1 w-24 bg-primary/30 mx-auto rounded-full" />
        </div>

        {/* Message */}
        <div className="mb-8 space-y-4">
          <p className="text-muted-foreground font-mono text-sm leading-relaxed">
            Performance optimizations in progress. Fixing excessive data polling that was causing browser freezes.
          </p>
          <p className="text-muted-foreground/70 font-mono text-xs">
            All data is preserved. Nothing has been lost. The world continues to evolve.
          </p>
          <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/20">
            <p className="text-xs text-muted-foreground font-mono">
              <span className="text-primary font-semibold">What's being fixed:</span><br/>
              • Disabled aggressive auto-refresh (was polling every 15-30s)<br/>
              • Optimized data fetching to prevent performance death spiral<br/>
              • Site will be responsive and stable after deployment
            </p>
          </div>
        </div>

        {/* Status indicator */}
        <div className="mb-8 flex items-center justify-center gap-2">
          <div className="w-2 h-2 rounded-full bg-action animate-pulse" />
          <span className="text-xs font-mono text-muted-foreground">
            Stabilizing...
          </span>
        </div>

        {/* Refresh button */}
        <Button
          variant="outline"
          onClick={handleRefresh}
          className="font-mono text-sm"
        >
          <RefreshCcw className="w-4 h-4 mr-2" />
          Check Again
        </Button>

        {/* Footer */}
        <p className="mt-12 text-xs text-muted-foreground/50 font-mono">
          Thank you for witnessing.
        </p>
      </div>
    </div>
  );
};

export default Maintenance;
