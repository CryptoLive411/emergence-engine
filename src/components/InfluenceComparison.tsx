import { useInfluenceHistory } from '@/hooks/useDetailedAnalytics';
import { Crown, Users, Zap, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InfluenceComparisonProps {
  worldId: string | undefined;
}

export function InfluenceComparison({ worldId }: InfluenceComparisonProps) {
  const { data } = useInfluenceHistory(worldId);

  if (!data || (data.adam?.length === 0 && data.eve?.length === 0)) {
    return (
      <div className="p-6 rounded-lg border border-border bg-card/50">
        <h3 className="font-mono font-semibold text-foreground mb-4 flex items-center gap-2">
          <Crown className="w-5 h-5 text-action" />
          Influence Competition
        </h3>
        <div className="h-48 flex items-center justify-center text-muted-foreground text-sm font-mono">
          No influence data yet...
        </div>
      </div>
    );
  }

  const adamTotal = data.adamTotal || 0;
  const eveTotal = data.eveTotal || 0;
  const total = adamTotal + eveTotal || 1;
  const adamPercent = Math.round((adamTotal / total) * 100);
  const evePercent = 100 - adamPercent;

  const adamActive = data.adam?.filter((a: any) => a.status === 'ACTIVE').length || 0;
  const eveActive = data.eve?.filter((a: any) => a.status === 'ACTIVE').length || 0;

  return (
    <div className="p-6 rounded-lg border border-border bg-card/50">
      <h3 className="font-mono font-semibold text-foreground mb-4 flex items-center gap-2">
        <Crown className="w-5 h-5 text-action" />
        Influence Competition
      </h3>

      {/* Main comparison bar */}
      <div className="mb-6">
        <div className="flex justify-between mb-2 text-sm font-mono">
          <span className="text-founder-a font-bold">ADAM</span>
          <span className="text-founder-b font-bold">EVE</span>
        </div>
        <div className="h-8 rounded-full overflow-hidden flex bg-secondary/30">
          <div 
            className="bg-founder-a flex items-center justify-center transition-all duration-500"
            style={{ width: `${adamPercent}%` }}
          >
            {adamPercent > 15 && (
              <span className="text-xs font-mono font-bold text-background">{adamPercent}%</span>
            )}
          </div>
          <div 
            className="bg-founder-b flex items-center justify-center transition-all duration-500"
            style={{ width: `${evePercent}%` }}
          >
            {evePercent > 15 && (
              <span className="text-xs font-mono font-bold text-background">{evePercent}%</span>
            )}
          </div>
        </div>
      </div>

      {/* Detailed stats */}
      <div className="grid grid-cols-2 gap-4">
        {/* ADAM stats */}
        <div className="p-4 rounded-lg bg-founder-a/10 border border-founder-a/30">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-founder-a flex items-center justify-center">
              <span className="text-xs font-bold text-background">A</span>
            </div>
            <div>
              <div className="font-mono font-bold text-founder-a">ADAM</div>
              <div className="text-[10px] font-mono text-muted-foreground">Creation • Order</div>
            </div>
          </div>
          
          <div className="space-y-2 text-xs font-mono">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 text-muted-foreground">
                <Crown className="w-3 h-3" /> Total Influence
              </span>
              <span className="text-founder-a font-bold">{adamTotal}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 text-muted-foreground">
                <Users className="w-3 h-3" /> Active Agents
              </span>
              <span className="text-foreground">{adamActive}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 text-muted-foreground">
                <Zap className="w-3 h-3" /> Total Lineage
              </span>
              <span className="text-foreground">{data.adam?.length || 0}</span>
            </div>
          </div>
        </div>

        {/* EVE stats */}
        <div className="p-4 rounded-lg bg-founder-b/10 border border-founder-b/30">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-founder-b flex items-center justify-center">
              <span className="text-xs font-bold text-background">E</span>
            </div>
            <div>
              <div className="font-mono font-bold text-founder-b">EVE</div>
              <div className="text-[10px] font-mono text-muted-foreground">Freedom • Exploration</div>
            </div>
          </div>
          
          <div className="space-y-2 text-xs font-mono">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 text-muted-foreground">
                <Crown className="w-3 h-3" /> Total Influence
              </span>
              <span className="text-founder-b font-bold">{eveTotal}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 text-muted-foreground">
                <Users className="w-3 h-3" /> Active Agents
              </span>
              <span className="text-foreground">{eveActive}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 text-muted-foreground">
                <Zap className="w-3 h-3" /> Total Lineage
              </span>
              <span className="text-foreground">{data.eve?.length || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Winner indicator */}
      <div className="mt-4 pt-4 border-t border-border text-center">
        <div className="text-xs font-mono text-muted-foreground mb-1">Current Leader</div>
        <div className={cn(
          "text-lg font-mono font-bold",
          adamTotal > eveTotal ? "text-founder-a" : eveTotal > adamTotal ? "text-founder-b" : "text-primary"
        )}>
          {adamTotal > eveTotal ? "ADAM dominates" : eveTotal > adamTotal ? "EVE dominates" : "BALANCED"}
        </div>
      </div>
    </div>
  );
}
