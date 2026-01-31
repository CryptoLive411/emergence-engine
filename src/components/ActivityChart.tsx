import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { useEventStats } from '@/hooks/useAnalytics';
import { Activity, MessageSquare, Scroll } from 'lucide-react';

interface ActivityChartProps {
  worldId: string | undefined;
}

export function ActivityChart({ worldId }: ActivityChartProps) {
  const { data: eventStats = [] } = useEventStats(worldId);

  if (eventStats.length < 2) {
    return (
      <div className="p-4 rounded-lg border border-border bg-card/50">
        <h3 className="font-mono font-semibold text-foreground text-sm mb-3 flex items-center gap-2">
          <Activity className="w-4 h-4 text-speech" />
          Activity Over Time
        </h3>
        <div className="h-32 flex items-center justify-center text-muted-foreground text-sm font-mono">
          Run more ticks to see activity patterns...
        </div>
      </div>
    );
  }

  const chartData = eventStats.map(e => ({
    turn: e.turnNumber,
    speeches: e.speeches,
    norms: e.norms,
  }));

  // Calculate activity metrics
  const avgSpeeches = eventStats.length > 0 
    ? (eventStats.reduce((sum, e) => sum + e.speeches, 0) / eventStats.length).toFixed(1) 
    : '0';
  const totalNorms = eventStats.reduce((sum, e) => sum + e.norms, 0);

  return (
    <div className="p-4 rounded-lg border border-border bg-card/50">
      <h3 className="font-mono font-semibold text-foreground text-sm mb-3 flex items-center gap-2">
        <Activity className="w-4 h-4 text-speech" />
        Activity Over Time
      </h3>

      {/* Stats */}
      <div className="flex gap-4 mb-3 text-xs font-mono">
        <div className="flex items-center gap-1">
          <MessageSquare className="w-3 h-3 text-speech" />
          <span className="text-muted-foreground">Avg:</span>
          <span className="text-speech font-bold">{avgSpeeches}/turn</span>
        </div>
        <div className="flex items-center gap-1">
          <Scroll className="w-3 h-3 text-action" />
          <span className="text-muted-foreground">Norms:</span>
          <span className="text-action font-bold">{totalNorms}</span>
        </div>
      </div>

      <div className="h-32">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
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
                fontSize: '11px',
                fontFamily: 'monospace',
              }}
              labelFormatter={(value) => `Turn ${value}`}
            />
            <Line 
              type="monotone" 
              dataKey="speeches" 
              stroke="hsl(var(--speech))" 
              strokeWidth={2}
              dot={{ fill: 'hsl(var(--speech))', r: 3 }}
              name="Speeches"
            />
            <Line 
              type="monotone" 
              dataKey="norms" 
              stroke="hsl(var(--action))" 
              strokeWidth={2}
              dot={{ fill: 'hsl(var(--action))', r: 3 }}
              name="Norms"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
