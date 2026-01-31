import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useBeliefTracking } from '@/hooks/useAnalytics';
import { Brain, Sparkles } from 'lucide-react';

interface BeliefChartProps {
  worldId: string | undefined;
}

export function BeliefChart({ worldId }: BeliefChartProps) {
  const { data: beliefs = [] } = useBeliefTracking(worldId);

  if (beliefs.length === 0) {
    return (
      <div className="p-4 rounded-lg border border-border bg-card/50">
        <h3 className="font-mono font-semibold text-foreground text-sm mb-3 flex items-center gap-2">
          <Brain className="w-4 h-4 text-action" />
          Emerging Beliefs
        </h3>
        <div className="h-32 flex items-center justify-center text-muted-foreground text-sm font-mono">
          No norms declared yet...
        </div>
      </div>
    );
  }

  // Truncate long norms for display
  const chartData = beliefs.slice(0, 5).map(b => ({
    ...b,
    displayNorm: b.norm.length > 20 ? b.norm.substring(0, 20) + '...' : b.norm,
  }));

  const colors = [
    'hsl(var(--primary))',
    'hsl(var(--action))',
    'hsl(var(--spawn))',
    'hsl(var(--speech))',
    'hsl(var(--founder-a))',
  ];

  return (
    <div className="p-4 rounded-lg border border-border bg-card/50">
      <h3 className="font-mono font-semibold text-foreground text-sm mb-3 flex items-center gap-2">
        <Brain className="w-4 h-4 text-action" />
        Emerging Beliefs
      </h3>

      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={chartData} 
            layout="vertical" 
            margin={{ top: 5, right: 5, left: 5, bottom: 0 }}
          >
            <XAxis 
              type="number" 
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
            />
            <YAxis 
              type="category" 
              dataKey="displayNorm" 
              tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
              width={80}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))', 
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                fontSize: '11px',
                fontFamily: 'monospace',
              }}
              formatter={(value, name, props) => [
                `Mentioned ${value} times`,
                props.payload.norm
              ]}
            />
            <Bar dataKey="count" radius={[0, 4, 4, 0]}>
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Belief list */}
      <div className="mt-3 space-y-1.5">
        {beliefs.slice(0, 3).map((belief, i) => (
          <div key={i} className="flex items-start gap-2 text-xs">
            <Sparkles className="w-3 h-3 mt-0.5 text-action flex-shrink-0" />
            <span className="text-muted-foreground font-mono line-clamp-1">{belief.norm}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
