import { useTurnBreakdown } from '@/hooks/useDetailedAnalytics';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, ComposedChart, Line } from 'recharts';
import { History, TrendingUp } from 'lucide-react';

interface TurnHistoryChartProps {
  worldId: string | undefined;
}

export function TurnHistoryChart({ worldId }: TurnHistoryChartProps) {
  const { data: breakdown = [] } = useTurnBreakdown(worldId);

  if (breakdown.length < 2) {
    return (
      <div className="p-6 rounded-lg border border-border bg-card/50">
        <h3 className="font-mono font-semibold text-foreground mb-4 flex items-center gap-2">
          <History className="w-5 h-5 text-speech" />
          Turn-by-Turn Activity
        </h3>
        <div className="h-64 flex items-center justify-center text-muted-foreground text-sm font-mono">
          Run more ticks to see detailed breakdown...
        </div>
      </div>
    );
  }

  // Calculate totals
  const totals = breakdown.reduce(
    (acc, t) => ({
      speeches: acc.speeches + t.speeches,
      norms: acc.norms + t.norms,
      spawns: acc.spawns + t.spawns,
      deaths: acc.deaths + t.deaths,
      chaos: acc.chaos + t.chaosEvents,
    }),
    { speeches: 0, norms: 0, spawns: 0, deaths: 0, chaos: 0 }
  );

  return (
    <div className="p-6 rounded-lg border border-border bg-card/50">
      <h3 className="font-mono font-semibold text-foreground mb-4 flex items-center gap-2">
        <History className="w-5 h-5 text-speech" />
        Turn-by-Turn Activity
      </h3>

      {/* Summary stats */}
      <div className="grid grid-cols-5 gap-2 mb-4">
        <div className="text-center p-2 rounded bg-speech/20">
          <div className="text-lg font-bold font-mono text-speech">{totals.speeches}</div>
          <div className="text-[10px] font-mono text-muted-foreground">Speeches</div>
        </div>
        <div className="text-center p-2 rounded bg-action/20">
          <div className="text-lg font-bold font-mono text-action">{totals.norms}</div>
          <div className="text-[10px] font-mono text-muted-foreground">Norms</div>
        </div>
        <div className="text-center p-2 rounded bg-spawn/20">
          <div className="text-lg font-bold font-mono text-spawn">{totals.spawns}</div>
          <div className="text-[10px] font-mono text-muted-foreground">Births</div>
        </div>
        <div className="text-center p-2 rounded bg-destructive/20">
          <div className="text-lg font-bold font-mono text-destructive">{totals.deaths}</div>
          <div className="text-[10px] font-mono text-muted-foreground">Deaths</div>
        </div>
        <div className="text-center p-2 rounded bg-purple-500/20">
          <div className="text-lg font-bold font-mono text-purple-400">{totals.chaos}</div>
          <div className="text-[10px] font-mono text-muted-foreground">Chaos</div>
        </div>
      </div>

      {/* Stacked bar chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={breakdown} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis 
              dataKey="turnNumber" 
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
            />
            <YAxis 
              yAxisId="left"
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
            />
            <YAxis 
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))', 
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                fontSize: '11px',
                fontFamily: 'monospace',
              }}
              labelFormatter={(value) => `Turn ${value}`}
            />
            <Legend 
              wrapperStyle={{ fontSize: '10px', fontFamily: 'monospace' }}
            />
            <Bar yAxisId="left" dataKey="speeches" stackId="a" fill="hsl(var(--speech))" name="Speeches" />
            <Bar yAxisId="left" dataKey="norms" stackId="a" fill="hsl(var(--action))" name="Norms" />
            <Bar yAxisId="left" dataKey="spawns" stackId="a" fill="hsl(var(--spawn))" name="Births" />
            <Bar yAxisId="left" dataKey="deaths" stackId="a" fill="hsl(var(--destructive))" name="Deaths" />
            <Line 
              yAxisId="right" 
              type="monotone" 
              dataKey="population" 
              stroke="hsl(var(--primary))" 
              strokeWidth={2}
              dot={{ fill: 'hsl(var(--primary))', r: 3 }}
              name="Population"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Turn headlines */}
      <div className="mt-4 pt-4 border-t border-border">
        <h4 className="text-sm font-mono font-semibold text-foreground mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary" />
          Turn Headlines
        </h4>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {breakdown.slice().reverse().map(turn => (
            <div 
              key={turn.turnNumber}
              className="flex items-start gap-3 p-2 rounded bg-secondary/30"
            >
              <span className="text-xs font-mono text-primary font-bold min-w-[40px]">
                T{turn.turnNumber}
              </span>
              <span className="text-xs font-mono text-muted-foreground">
                {turn.headline}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
