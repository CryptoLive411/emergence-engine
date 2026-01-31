import { useTier1Metrics } from '@/hooks/useEmergenceMetrics';
import { Users, Layers, TrendingUp, Shield, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Area, AreaChart, ResponsiveContainer } from 'recharts';

interface Tier1MetricsProps {
  worldId: string;
}

export function Tier1Metrics({ worldId }: Tier1MetricsProps) {
  const { data, isLoading } = useTier1Metrics(worldId);

  if (isLoading || !data) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="p-4 rounded-lg border border-border bg-card/50 animate-pulse h-24" />
        ))}
      </div>
    );
  }

  const { population, generation, growth, stability } = data;

  const getTrendIcon = (trend: string) => {
    if (trend === 'accelerating' || trend === 'rising') return <ArrowUp className="w-3 h-3" />;
    if (trend === 'decelerating' || trend === 'falling') return <ArrowDown className="w-3 h-3" />;
    return <Minus className="w-3 h-3" />;
  };

  const stabilityColor = {
    'Stable': 'text-primary',
    'Moderate': 'text-spawn',
    'Unstable': 'text-action',
    'Critical': 'text-destructive',
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Population */}
      <div className="p-4 rounded-lg border border-border bg-card/50">
        <div className="flex items-center gap-2 mb-2">
          <Users className="w-4 h-4 text-primary" />
          <span className="text-xs font-mono text-muted-foreground">Population</span>
        </div>
        <div className="text-3xl font-mono font-bold text-foreground">{population.total}</div>
        <div className={cn(
          "text-xs font-mono mt-1",
          population.change > 0 ? "text-primary" : population.change < 0 ? "text-destructive" : "text-muted-foreground"
        )}>
          {population.change > 0 ? '+' : ''}{population.change} this cycle
        </div>
      </div>

      {/* Generations */}
      <div className="p-4 rounded-lg border border-border bg-card/50">
        <div className="flex items-center gap-2 mb-2">
          <Layers className="w-4 h-4 text-action" />
          <span className="text-xs font-mono text-muted-foreground">Generations</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-mono font-bold text-foreground">{generation.highest}</span>
          <span className="text-sm font-mono text-muted-foreground">
            avg {generation.average.toFixed(1)}
          </span>
        </div>
        {generation.oldestLineage && (
          <div className="text-xs font-mono text-muted-foreground mt-1">
            Oldest: {generation.oldestLineage.name}
          </div>
        )}
      </div>

      {/* Growth Rate */}
      <div className="p-4 rounded-lg border border-border bg-card/50">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="w-4 h-4 text-spawn" />
          <span className="text-xs font-mono text-muted-foreground">Growth Rate</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn(
            "flex items-center gap-1 text-sm font-mono font-semibold",
            growth.trend === 'accelerating' ? "text-primary" : 
            growth.trend === 'decelerating' ? "text-destructive" : "text-muted-foreground"
          )}>
            {getTrendIcon(growth.trend)}
            {growth.trend}
          </span>
        </div>
        {growth.sparkline.length > 1 && (
          <div className="h-8 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={growth.sparkline.map((v, i) => ({ i, v }))}>
                <Area 
                  type="monotone" 
                  dataKey="v" 
                  stroke="hsl(var(--primary))" 
                  fill="hsl(var(--primary) / 0.2)" 
                  strokeWidth={1.5}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Stability Index */}
      <div className="p-4 rounded-lg border border-border bg-card/50">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="w-4 h-4 text-speech" />
          <span className="text-xs font-mono text-muted-foreground">Stability</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className={cn("text-3xl font-mono font-bold", stabilityColor[stability.label])}>
            {stability.score}
          </span>
          <span className="text-sm font-mono text-muted-foreground">/ 100</span>
        </div>
        <div className={cn("text-xs font-mono mt-1", stabilityColor[stability.label])}>
          {stability.label}
        </div>
      </div>
    </div>
  );
}
