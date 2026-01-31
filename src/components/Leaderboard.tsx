import { Trophy, ExternalLink, Crown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLeaderboard } from '@/hooks/useCustodianship';
import { useAgents, useWorld } from '@/hooks/useSimulation';
import { cn } from '@/lib/utils';

export function Leaderboard() {
  const { data: leaderboard = [], isLoading } = useLeaderboard(10);
  const { data: world } = useWorld();
  const { data: agents = [] } = useAgents(world?.id);
  
  // Map agent IDs to names
  const agentMap = new Map(agents.map(a => [a.id, a]));
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-mono flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            Witness Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xs text-muted-foreground animate-pulse">Loading...</div>
        </CardContent>
      </Card>
    );
  }
  
  if (leaderboard.length === 0) {
    return (
      <Card className="border-dashed border-muted-foreground/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-mono flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            Witness Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xs text-muted-foreground">
            No witnesses have claimed inhabitants yet. Be the first to witness a soul.
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-mono flex items-center gap-2">
          <Trophy className="w-4 h-4 text-spawn" />
          Witness Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {leaderboard.map((claim, index) => {
          const agent = agentMap.get(claim.agent_id);
          const isTop3 = index < 3;
          
          return (
            <div 
              key={claim.id}
              className={cn(
                "flex items-center gap-3 p-2 rounded-lg",
                isTop3 ? "bg-spawn/5 border border-spawn/20" : "bg-secondary/30"
              )}
            >
              {/* Rank */}
              <div className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-bold",
                index === 0 && "bg-spawn text-spawn-foreground",
                index === 1 && "bg-muted-foreground/30 text-foreground",
                index === 2 && "bg-action/30 text-action",
                index > 2 && "bg-secondary text-muted-foreground"
              )}>
                {index === 0 ? <Crown className="w-3 h-3" /> : index + 1}
              </div>
              
              {/* Witness info */}
              <div className="flex-1 min-w-0">
                <a 
                  href={`https://x.com/${claim.x_handle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-mono text-primary hover:underline inline-flex items-center gap-1"
                >
                  @{claim.x_handle}
                  <ExternalLink className="w-3 h-3" />
                </a>
                {agent && (
                  <div className="text-xs text-muted-foreground truncate">
                    Witnessing: {agent.name}
                  </div>
                )}
              </div>
              
              {/* Score */}
              <div className="font-mono font-bold text-sm">
                {claim.lineage_score}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
