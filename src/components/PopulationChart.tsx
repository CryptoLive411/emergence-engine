import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { usePopulationHistory, useEventStats } from '@/hooks/useAnalytics';
import { TrendingUp, Skull, Baby } from 'lucide-react';

interface PopulationChartProps {
  worldId: string | undefined;
}

export function PopulationChart({ worldId }: PopulationChartProps) {
  const { data: populationData = [] } = usePopulationHistory(worldId);
  const { data: eventStats = [] } = useEventStats(worldId);

  // Merge data
  const chartData = populationData.map(p => {
    const stats = eventStats.find(e => e.turnNumber === p.turnNumber);
    return {
      turn: p.turnNumber,
      population: p.population,
      births: stats?.spawns || 0,
      deaths: stats?.deaths || 0,
    };
  });

  // Calculate totals
  const totalBirths = eventStats.reduce((sum, e) => sum + e.spawns, 0);
  const totalDeaths = eventStats.reduce((sum, e) => sum + e.deaths, 0);
  const currentPop = populationData[populationData.length - 1]?.population || 0;

  if (chartData.length < 2) {
    return (
      <div className="p-4 rounded-lg border border-border bg-card/50">
        <h3 className="font-mono font-semibold text-foreground text-sm mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary" />
          Population Growth
        </h3>
        <div className="h-32 flex items-center justify-center text-muted-foreground text-sm font-mono">
          Run more ticks to see growth patterns...
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-lg border border-border bg-card/50">
      <h3 className="font-mono font-semibold text-foreground text-sm mb-3 flex items-center gap-2">
        <TrendingUp className="w-4 h-4 text-primary" />
        Population Growth
      </h3>
      
      {/* Stats row */}
      <div className="flex gap-4 mb-3 text-xs font-mono">
        <div className="flex items-center gap-1">
          <span className="text-muted-foreground">Current:</span>
          <span className="text-primary font-bold">{currentPop}</span>
        </div>
        <div className="flex items-center gap-1">
          <Baby className="w-3 h-3 text-spawn" />
          <span className="text-spawn">{totalBirths}</span>
        </div>
        <div className="flex items-center gap-1">
          <Skull className="w-3 h-3 text-destructive" />
          <span className="text-destructive">{totalDeaths}</span>
        </div>
      </div>

      <div className="h-32">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="populationGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis 
              dataKey="turn" 
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
            />
            <YAxis 
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))', 
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                fontSize: '12px',
                fontFamily: 'monospace',
              }}
              labelFormatter={(value) => `Turn ${value}`}
            />
            <Area 
              type="monotone" 
              dataKey="population" 
              stroke="hsl(var(--primary))" 
              strokeWidth={2}
              fill="url(#populationGradient)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
