import { useAgentRelationships } from '@/hooks/useDetailedAnalytics';
import { cn } from '@/lib/utils';
import { GitBranch, User, Heart, Swords, HelpCircle } from 'lucide-react';

interface AgentGraphProps {
  worldId: string | undefined;
}

export function AgentGraph({ worldId }: AgentGraphProps) {
  const { data: agents = [] } = useAgentRelationships(worldId);

  if (agents.length === 0) {
    return (
      <div className="p-6 rounded-lg border border-border bg-card/50">
        <h3 className="font-mono font-semibold text-foreground mb-4 flex items-center gap-2">
          <GitBranch className="w-5 h-5 text-primary" />
          Agent Relationship Graph
        </h3>
        <div className="h-64 flex items-center justify-center text-muted-foreground text-sm font-mono">
          No agents yet...
        </div>
      </div>
    );
  }

  // Group by generation
  const generations = new Map<number, typeof agents>();
  for (const agent of agents) {
    const gen = generations.get(agent.generation) || [];
    gen.push(agent);
    generations.set(agent.generation, gen);
  }

  const loyaltyIcon = (loyalty: string) => {
    switch (loyalty) {
      case 'PARENT': return <Heart className="w-3 h-3 text-spawn" />;
      case 'REBELLIOUS': return <Swords className="w-3 h-3 text-destructive" />;
      default: return <HelpCircle className="w-3 h-3 text-muted-foreground" />;
    }
  };

  return (
    <div className="p-6 rounded-lg border border-border bg-card/50">
      <h3 className="font-mono font-semibold text-foreground mb-4 flex items-center gap-2">
        <GitBranch className="w-5 h-5 text-primary" />
        Agent Relationship Graph
      </h3>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-6 text-xs font-mono">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-founder-a" />
          <span className="text-muted-foreground">ADAM lineage</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-founder-b" />
          <span className="text-muted-foreground">EVE lineage</span>
        </div>
        <div className="flex items-center gap-1">
          <Heart className="w-3 h-3 text-spawn" />
          <span className="text-muted-foreground">Loyal</span>
        </div>
        <div className="flex items-center gap-1">
          <Swords className="w-3 h-3 text-destructive" />
          <span className="text-muted-foreground">Rebellious</span>
        </div>
      </div>

      {/* Graph visualization */}
      <div className="space-y-6 relative">
        {Array.from(generations.entries())
          .sort(([a], [b]) => a - b)
          .map(([gen, genAgents]) => (
            <div key={gen} className="relative">
              {/* Generation label */}
              <div className="mb-2 flex items-center gap-2">
                <span className="text-xs font-mono text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded">
                  Gen {gen}
                </span>
                <div className="flex-1 h-px bg-border" />
              </div>

              {/* Agents in this generation */}
              <div className="flex flex-wrap gap-3 justify-start">
                {genAgents.map(agent => {
                  // Determine lineage color
                  let lineageColor = 'border-border';
                  if (agent.isFounder) {
                    lineageColor = agent.founderType === 'A' ? 'border-founder-a' : 'border-founder-b';
                  } else {
                    // Find root founder
                    let current = agent;
                    while (current.parentId) {
                      const parent = agents.find(a => a.id === current.parentId);
                      if (!parent) break;
                      current = parent;
                    }
                    lineageColor = current.founderType === 'A' ? 'border-founder-a/60' : 'border-founder-b/60';
                  }

                  return (
                    <div
                      key={agent.id}
                      className={cn(
                        "relative p-3 rounded-lg border-2 bg-card/80 min-w-[120px]",
                        lineageColor,
                        agent.status === 'INACTIVE' && "opacity-50"
                      )}
                    >
                      {/* Connection line to parent */}
                      {agent.parentId && (
                        <div className="absolute -top-4 left-1/2 w-px h-4 bg-border" />
                      )}

                      <div className="flex items-center gap-2 mb-1">
                        <User className={cn(
                          "w-4 h-4",
                          agent.isFounder 
                            ? agent.founderType === 'A' ? "text-founder-a" : "text-founder-b"
                            : "text-muted-foreground"
                        )} />
                        <span className="font-mono text-sm font-bold text-foreground">
                          {agent.name}
                        </span>
                        {!agent.isFounder && loyaltyIcon(agent.loyalty)}
                      </div>

                      <div className="text-xs font-mono text-muted-foreground space-y-0.5">
                        <div className="flex justify-between">
                          <span>Energy:</span>
                          <span className={cn(
                            agent.energy > 50 ? "text-primary" : agent.energy > 20 ? "text-spawn" : "text-destructive"
                          )}>{agent.energy}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Influence:</span>
                          <span className="text-action">{agent.influence}</span>
                        </div>
                        {agent.parentName && (
                          <div className="text-[10px] pt-1 border-t border-border mt-1">
                            Child of {agent.parentName}
                          </div>
                        )}
                      </div>

                      {agent.status === 'INACTIVE' && (
                        <div className="absolute top-1 right-1 text-[10px] font-mono text-destructive">
                          FADED
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
