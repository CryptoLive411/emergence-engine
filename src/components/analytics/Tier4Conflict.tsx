import { useTier4Metrics } from '@/hooks/useEmergenceMetrics';
import { Swords, HeartCrack, AlertTriangle, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface Tier4ConflictProps {
  worldId: string;
}

export function Tier4Conflict({ worldId }: Tier4ConflictProps) {
  const { data, isLoading } = useTier4Metrics(worldId);

  if (isLoading || !data) {
    return (
      <div className="grid md:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="p-4 rounded-lg border border-border bg-card/50 animate-pulse h-32" />
        ))}
      </div>
    );
  }

  const { conflict, betrayal, violations } = data;

  const getTrendIcon = (trend: string) => {
    if (trend === 'rising') return <ArrowUp className="w-3 h-3" />;
    if (trend === 'falling') return <ArrowDown className="w-3 h-3" />;
    return <Minus className="w-3 h-3" />;
  };

  return (
    <div className="grid md:grid-cols-3 gap-4">
      {/* Conflict Rate */}
      <div className="p-4 rounded-lg border border-border bg-card/50">
        <div className="flex items-center gap-2 mb-2">
          <Swords className="w-4 h-4 text-destructive" />
          <span className="text-xs font-mono text-muted-foreground">Conflict Rate</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-mono font-bold text-foreground">
            {conflict.rate}
          </span>
          <span className="text-sm text-muted-foreground font-mono">events</span>
        </div>
        <div className={cn(
          "flex items-center gap-1 text-sm font-mono mt-2",
          conflict.trend === 'rising' ? "text-destructive" : 
          conflict.trend === 'falling' ? "text-primary" : "text-muted-foreground"
        )}>
          {getTrendIcon(conflict.trend)}
          {conflict.trend}
        </div>
      </div>

      {/* Betrayals */}
      <div className="p-4 rounded-lg border border-border bg-card/50">
        <div className="flex items-center gap-2 mb-2">
          <HeartCrack className="w-4 h-4 text-action" />
          <span className="text-xs font-mono text-muted-foreground">Betrayals</span>
        </div>
        <div className="flex gap-4">
          <div>
            <div className="text-2xl font-mono font-bold text-foreground">
              {betrayal.rebellions}
            </div>
            <div className="text-xs font-mono text-muted-foreground">rebellions</div>
          </div>
          <div>
            <div className="text-2xl font-mono font-bold text-foreground">
              {betrayal.defections}
            </div>
            <div className="text-xs font-mono text-muted-foreground">defections</div>
          </div>
        </div>
        {betrayal.recentBetrayal && (
          <div className="mt-3 p-2 rounded bg-destructive/10 border border-destructive/20">
            <div className="text-xs font-mono text-destructive">
              Latest: {betrayal.recentBetrayal.agent}
            </div>
            <div className="text-xs font-mono text-muted-foreground truncate">
              {betrayal.recentBetrayal.action}
            </div>
          </div>
        )}
      </div>

      {/* Norm Violations */}
      <div className="p-4 rounded-lg border border-border bg-card/50">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="w-4 h-4 text-spawn" />
          <span className="text-xs font-mono text-muted-foreground">Norm Violations</span>
        </div>
        <div className="text-3xl font-mono font-bold text-foreground">
          {violations.total}
        </div>
        {violations.recentViolations.length > 0 ? (
          <div className="space-y-1.5 mt-2">
            {violations.recentViolations.slice(0, 2).map((v, i) => (
              <div key={i} className="text-xs font-mono text-muted-foreground truncate" title={`${v.violator} broke "${v.norm}"`}>
                <span className="text-foreground">{v.violator}</span> broke "{v.norm}"
              </div>
            ))}
          </div>
        ) : (
          <div className="text-xs font-mono text-muted-foreground mt-2">
            No violations recorded
          </div>
        )}
      </div>
    </div>
  );
}
