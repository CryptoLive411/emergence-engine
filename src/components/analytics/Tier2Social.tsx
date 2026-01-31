import { useTier2Metrics } from '@/hooks/useEmergenceMetrics';
import { BookOpen, Shuffle, Users2, ArrowUp, ArrowDown, Sparkles, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface Tier2SocialProps {
  worldId: string;
}

export function Tier2Social({ worldId }: Tier2SocialProps) {
  const { data, isLoading } = useTier2Metrics(worldId);

  if (isLoading || !data) {
    return (
      <div className="grid md:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="p-4 rounded-lg border border-border bg-card/50 animate-pulse h-40" />
        ))}
      </div>
    );
  }

  const { norms, entropy, factions } = data;

  const getTrendIcon = (trend: string) => {
    if (trend === 'rising') return <ArrowUp className="w-3 h-3 text-primary" />;
    if (trend === 'falling') return <ArrowDown className="w-3 h-3 text-destructive" />;
    if (trend === 'new') return <Sparkles className="w-3 h-3 text-spawn" />;
    return <Minus className="w-3 h-3 text-muted-foreground" />;
  };

  const entropyColor = {
    'Unified': 'text-primary',
    'Cohesive': 'text-speech',
    'Fragmenting': 'text-spawn',
    'Fractured': 'text-destructive',
  };

  return (
    <div className="grid md:grid-cols-3 gap-4">
      {/* Norms & Beliefs */}
      <div className="p-4 rounded-lg border border-border bg-card/50 md:col-span-2">
        <div className="flex items-center gap-2 mb-3">
          <BookOpen className="w-4 h-4 text-primary" />
          <span className="text-sm font-mono font-semibold text-foreground">Dominant Beliefs</span>
        </div>
        <div className="space-y-2">
          {norms.length === 0 ? (
            <p className="text-sm text-muted-foreground font-mono">No norms have emerged yet...</p>
          ) : (
            norms.slice(0, 5).map((norm, i) => (
              <div key={norm.name} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="shrink-0">{getTrendIcon(norm.trend)}</span>
                  <span className="text-sm font-mono text-foreground truncate" title={norm.name}>
                    "{norm.name}"
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="outline" className="text-xs font-mono">
                    {norm.frequency}×
                  </Badge>
                  {norm.trend === 'new' && (
                    <Badge className="text-xs font-mono bg-spawn/20 text-spawn border-spawn/30">
                      NEW
                    </Badge>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Entropy & Factions */}
      <div className="space-y-4">
        {/* Entropy */}
        <div className="p-4 rounded-lg border border-border bg-card/50">
          <div className="flex items-center gap-2 mb-2">
            <Shuffle className="w-4 h-4 text-action" />
            <span className="text-xs font-mono text-muted-foreground">Belief Entropy</span>
          </div>
          <div className={cn("text-xl font-mono font-bold", entropyColor[entropy.label])}>
            {entropy.label}
          </div>
          <div className="mt-2 h-2 rounded-full bg-secondary overflow-hidden">
            <div 
              className={cn(
                "h-full rounded-full transition-all",
                entropy.label === 'Unified' ? 'bg-primary' :
                entropy.label === 'Cohesive' ? 'bg-speech' :
                entropy.label === 'Fragmenting' ? 'bg-spawn' : 'bg-destructive'
              )}
              style={{ width: `${entropy.score}%` }}
            />
          </div>
          <div className="text-xs font-mono text-muted-foreground mt-1">
            {entropy.uniqueBeliefs} unique beliefs
          </div>
        </div>

        {/* Factions */}
        <div className="p-4 rounded-lg border border-border bg-card/50">
          <div className="flex items-center gap-2 mb-2">
            <Users2 className="w-4 h-4 text-spawn" />
            <span className="text-xs font-mono text-muted-foreground">Factions</span>
          </div>
          <div className="text-2xl font-mono font-bold text-foreground">
            {factions.count}
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
            {factions.clusters.map(cluster => (
              <Badge 
                key={cluster.name} 
                variant="secondary" 
                className="text-xs font-mono"
              >
                {cluster.name}: {cluster.members}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
