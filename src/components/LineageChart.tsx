import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useLineageStats } from '@/hooks/useAnalytics';
import { GitBranch, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LineageChartProps {
  worldId: string | undefined;
}

export function LineageChart({ worldId }: LineageChartProps) {
  const { data: lineageData = [] } = useLineageStats(worldId);

  if (lineageData.length === 0) {
    return (
      <div className="p-4 rounded-lg border border-border bg-card/50">
        <h3 className="font-mono font-semibold text-foreground text-sm mb-3 flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-spawn" />
          Lineage Balance
        </h3>
        <div className="h-32 flex items-center justify-center text-muted-foreground text-sm font-mono">
          No lineage data yet...
        </div>
      </div>
    );
  }

  const pieData = lineageData.map(l => ({
    name: l.founder,
    value: l.activeAgents,
    descendants: l.descendants,
    influence: l.totalInfluence,
    type: l.founderType,
  }));

  const totalActive = pieData.reduce((sum, d) => sum + d.value, 0);

  const COLORS = {
    'A': 'hsl(var(--founder-a))',
    'B': 'hsl(var(--founder-b))',
  };

  return (
    <div className="p-4 rounded-lg border border-border bg-card/50">
      <h3 className="font-mono font-semibold text-foreground text-sm mb-3 flex items-center gap-2">
        <GitBranch className="w-4 h-4 text-spawn" />
        Lineage Balance
      </h3>

      <div className="flex items-center gap-4">
        {/* Pie chart */}
        <div className="w-24 h-24">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={25}
                outerRadius={40}
                paddingAngle={2}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[entry.type as keyof typeof COLORS] || COLORS['A']} 
                    stroke="hsl(var(--background))"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '11px',
                  fontFamily: 'monospace',
                }}
                formatter={(value, name, props) => [
                  `${value} active (${props.payload.descendants} total)`,
                  props.payload.name
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-2">
          {lineageData.map((lineage, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div 
                  className={cn(
                    "w-3 h-3 rounded-full",
                    lineage.founderType === 'A' ? "bg-founder-a" : "bg-founder-b"
                  )}
                />
                <span className="font-mono text-xs text-foreground">{lineage.founder}</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="text-muted-foreground">{lineage.activeAgents}</span>
                <Crown className="w-3 h-3 text-action" />
                <span className="text-action">{lineage.totalInfluence}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Balance indicator */}
      {lineageData.length >= 2 && (
        <div className="mt-3 pt-3 border-t border-border">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-muted-foreground">Dominance:</span>
            <span className={cn(
              "font-bold",
              Math.abs(lineageData[0].activeAgents - lineageData[1].activeAgents) <= 1 
                ? "text-primary" 
                : lineageData[0].activeAgents > lineageData[1].activeAgents 
                  ? "text-founder-a" 
                  : "text-founder-b"
            )}>
              {Math.abs(lineageData[0].activeAgents - lineageData[1].activeAgents) <= 1 
                ? "BALANCED" 
                : lineageData[0].activeAgents > lineageData[1].activeAgents 
                  ? `${lineageData[0].founder} leads` 
                  : `${lineageData[1].founder} leads`}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
