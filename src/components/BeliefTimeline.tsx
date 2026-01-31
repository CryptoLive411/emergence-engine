import { useBeliefEvolution } from '@/hooks/useDetailedAnalytics';
import { Brain, Sparkles, TrendingDown, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BeliefTimelineProps {
  worldId: string | undefined;
}

export function BeliefTimeline({ worldId }: BeliefTimelineProps) {
  const { data: evolution = [] } = useBeliefEvolution(worldId);

  if (evolution.length === 0) {
    return (
      <div className="p-6 rounded-lg border border-border bg-card/50">
        <h3 className="font-mono font-semibold text-foreground mb-4 flex items-center gap-2">
          <Brain className="w-5 h-5 text-action" />
          Belief Evolution Timeline
        </h3>
        <div className="h-48 flex items-center justify-center text-muted-foreground text-sm font-mono">
          No beliefs have emerged yet...
        </div>
      </div>
    );
  }

  // Track all unique beliefs across all turns
  const allBeliefs = new Set<string>();
  for (const turn of evolution) {
    turn.beliefs.forEach(b => allBeliefs.add(b));
  }

  // Create a timeline matrix
  const beliefList = Array.from(allBeliefs);

  // Colors for beliefs
  const beliefColors = [
    'bg-primary',
    'bg-action',
    'bg-spawn',
    'bg-speech',
    'bg-founder-a',
    'bg-founder-b',
    'bg-purple-500',
    'bg-pink-500',
  ];

  return (
    <div className="p-6 rounded-lg border border-border bg-card/50">
      <h3 className="font-mono font-semibold text-foreground mb-4 flex items-center gap-2">
        <Brain className="w-5 h-5 text-action" />
        Belief Evolution Timeline
      </h3>

      {/* Stats */}
      <div className="flex gap-4 mb-4 text-xs font-mono">
        <div className="flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-spawn" />
          <span className="text-muted-foreground">Total beliefs emerged:</span>
          <span className="text-spawn font-bold">{beliefList.length}</span>
        </div>
      </div>

      {/* Timeline visualization */}
      <div className="overflow-x-auto">
        <div className="min-w-max">
          {/* Turn headers */}
          <div className="flex items-center gap-1 mb-2 pl-32 md:pl-40">
            {evolution.map(turn => (
              <div 
                key={turn.turnNumber}
                className="w-8 text-center text-xs font-mono text-muted-foreground"
              >
                T{turn.turnNumber}
              </div>
            ))}
          </div>

          {/* Belief rows */}
          <div className="space-y-1">
            {beliefList.map((belief, beliefIndex) => (
              <div key={belief} className="flex items-center gap-1">
                {/* Belief label */}
                <div 
                  className="w-32 md:w-40 text-xs font-mono text-muted-foreground truncate pr-2 shrink-0"
                  title={belief}
                >
                  {belief}
                </div>

                {/* Timeline cells */}
                {evolution.map(turn => {
                  const isActive = turn.beliefs.includes(belief);
                  const isNew = turn.newBeliefs.includes(belief);
                  const isFaded = turn.fadedBeliefs.includes(belief);

                  return (
                    <div
                      key={turn.turnNumber}
                      className={cn(
                        "w-8 h-6 rounded flex items-center justify-center transition-all",
                        isActive 
                          ? beliefColors[beliefIndex % beliefColors.length] 
                          : "bg-secondary/30",
                        isNew && "ring-2 ring-spawn ring-offset-1 ring-offset-background",
                      )}
                      title={isActive ? `Active in Turn ${turn.turnNumber}` : `Not active`}
                    >
                      {isNew && (
                        <Sparkles className="w-3 h-3 text-background" />
                      )}
                      {isFaded && (
                        <TrendingDown className="w-3 h-3 text-destructive" />
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-4 mt-4 pt-4 border-t border-border text-xs font-mono">
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 rounded bg-primary flex items-center justify-center">
            <Sparkles className="w-2 h-2 text-background" />
          </div>
          <span className="text-muted-foreground">New belief</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 rounded bg-primary" />
          <span className="text-muted-foreground">Active</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 rounded bg-secondary/30" />
          <span className="text-muted-foreground">Inactive</span>
        </div>
      </div>

      {/* Detailed belief list */}
      <div className="mt-6 pt-4 border-t border-border">
        <h4 className="text-sm font-mono font-semibold text-foreground mb-3">All Emerged Beliefs</h4>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {beliefList.map((belief, i) => {
            // Find first and last appearance
            const firstTurn = evolution.find(e => e.beliefs.includes(belief))?.turnNumber || 0;
            const lastTurn = [...evolution].reverse().find(e => e.beliefs.includes(belief))?.turnNumber || 0;
            const persistence = lastTurn - firstTurn + 1;
            const appearances = evolution.filter(e => e.beliefs.includes(belief)).length;

            return (
              <div 
                key={belief}
                className="flex items-start gap-3 p-2 rounded bg-secondary/30"
              >
                <div 
                  className={cn(
                    "w-3 h-3 rounded-full mt-0.5 flex-shrink-0",
                    beliefColors[i % beliefColors.length]
                  )}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-mono text-foreground">{belief}</p>
                  <div className="flex gap-3 mt-1 text-[10px] font-mono text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" />
                      First: T{firstTurn}
                    </span>
                    <span>Lasted: {persistence} turns</span>
                    <span>Mentions: {appearances}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
