import { useTier3Metrics } from '@/hooks/useEmergenceMetrics';
import { Eye, GitBranch, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

interface Tier3LineageProps {
  worldId: string;
}

export function Tier3Lineage({ worldId }: Tier3LineageProps) {
  const { data, isLoading } = useTier3Metrics(worldId);

  if (isLoading || !data) {
    return (
      <div className="grid md:grid-cols-2 gap-4">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="p-4 rounded-lg border border-border bg-card/50 animate-pulse h-48" />
        ))}
      </div>
    );
  }

  const { influential, lineagePersistence } = data;

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {/* Most Referenced / Persistent */}
      <div className="p-4 rounded-lg border border-border bg-card/50">
        <div className="flex items-center gap-2 mb-4">
          <Eye className="w-4 h-4 text-spawn" />
          <span className="text-sm font-mono font-semibold text-foreground">Most Persistent</span>
        </div>
        <p className="text-xs text-muted-foreground font-mono mb-3 italic">
          Persistence is inferred from references, descendants, and concepts named.
        </p>
        <div className="space-y-3">
          {influential.length === 0 ? (
            <p className="text-sm text-muted-foreground font-mono">No minds yet...</p>
          ) : (
            influential.map((agent, i) => (
              <div key={agent.id} className="flex items-center gap-3">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono font-bold",
                  agent.lineage === 'A' 
                    ? "bg-founder-a/20 text-founder-a border border-founder-a/30" 
                    : "bg-founder-b/20 text-founder-b border border-founder-b/30"
                )}>
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-mono font-medium text-foreground truncate">
                    {agent.name}
                  </div>
                  <div className="text-xs font-mono text-muted-foreground">
                    {agent.mentions} mentions · {agent.descendants} descendants · {agent.conceptsNamed} concepts
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Lineage Persistence */}
      <div className="p-4 rounded-lg border border-border bg-card/50">
        <div className="flex items-center gap-2 mb-4">
          <GitBranch className="w-4 h-4 text-action" />
          <span className="text-sm font-mono font-semibold text-foreground">Lineage Persistence</span>
        </div>
        <p className="text-xs text-muted-foreground font-mono mb-3 italic">
          Which lineage's ideas and descendants persist in the world.
        </p>
        <div className="space-y-4">
          {lineagePersistence.length === 0 ? (
            <p className="text-sm text-muted-foreground font-mono">No lineages yet...</p>
          ) : (
            lineagePersistence.map(lineage => (
              <div key={lineage.founderType} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "w-3 h-3 rounded-full",
                      lineage.founderType === 'A' ? "bg-founder-a" : "bg-founder-b"
                    )} />
                    <span className="text-sm font-mono font-medium text-foreground">
                      {lineage.founder}
                    </span>
                  </div>
                  <span className="text-sm font-mono text-muted-foreground">
                    {lineage.persistenceShare.toFixed(0)}%
                  </span>
                </div>
                <Progress 
                  value={lineage.persistenceShare} 
                  className={cn(
                    "h-2",
                    lineage.founderType === 'A' ? "[&>div]:bg-founder-a" : "[&>div]:bg-founder-b"
                  )}
                />
                <div className="flex flex-wrap justify-between gap-x-2 gap-y-1 text-xs font-mono text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {lineage.activeDescendants}/{lineage.totalDescendants} active
                  </span>
                  <span>
                    {lineage.depth} generations deep
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
