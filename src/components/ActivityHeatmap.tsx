import { memo, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Activity, TrendingUp } from 'lucide-react';
import { format, subHours, isAfter, isBefore } from 'date-fns';

interface Event {
  id: string;
  created_at: string;
}

interface ActivityHeatmapProps {
  events: Event[];
}

/**
 * Heatmap showing when activity happens
 * Helps users see patterns and peak times
 */
function ActivityHeatmapComponent({ events }: ActivityHeatmapProps) {
  const heatmapData = useMemo(() => {
    const now = new Date();
    const hours = 24;
    const buckets: number[] = new Array(hours).fill(0);

    events.forEach(event => {
      const eventTime = new Date(event.created_at);
      const hoursAgo = Math.floor((now.getTime() - eventTime.getTime()) / (1000 * 60 * 60));
      
      if (hoursAgo >= 0 && hoursAgo < hours) {
        buckets[hours - 1 - hoursAgo]++;
      }
    });

    return buckets;
  }, [events]);

  const maxActivity = Math.max(...heatmapData, 1);
  const totalActivity = heatmapData.reduce((sum, val) => sum + val, 0);
  const avgActivity = totalActivity / heatmapData.length;

  const getIntensityColor = (value: number) => {
    const intensity = value / maxActivity;
    if (intensity === 0) return 'bg-muted/20';
    if (intensity < 0.25) return 'bg-primary/20';
    if (intensity < 0.5) return 'bg-primary/40';
    if (intensity < 0.75) return 'bg-primary/60';
    return 'bg-primary';
  };

  if (totalActivity === 0) {
    return (
      <div className="p-8 text-center rounded-xl border border-border bg-card/30">
        <Activity className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
        <p className="text-sm text-muted-foreground">
          No activity to visualize yet
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-xl border border-border bg-card/30 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-mono uppercase tracking-wider text-foreground">
            Activity Last 24h
          </h3>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <TrendingUp className="w-3 h-3" />
          <span>{totalActivity} events</span>
        </div>
      </div>

      {/* Heatmap grid */}
      <div className="grid grid-cols-12 gap-1 mb-3">
        {heatmapData.map((value, idx) => (
          <div
            key={idx}
            className={cn(
              "h-8 rounded transition-all duration-300 hover:scale-110 cursor-pointer relative group",
              getIntensityColor(value)
            )}
            title={`${value} events ${24 - idx}h ago`}
          >
            {/* Tooltip on hover */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded bg-popover border border-border text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
              <div className="font-mono">{value} events</div>
              <div className="text-muted-foreground">{24 - idx}h ago</div>
            </div>
          </div>
        ))}
      </div>

      {/* Time labels */}
      <div className="flex justify-between text-[10px] text-muted-foreground font-mono mb-3">
        <span>24h ago</span>
        <span>12h ago</span>
        <span>now</span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="p-2 rounded bg-muted/20">
          <div className="text-xs text-muted-foreground">Peak</div>
          <div className="text-sm font-bold text-foreground">{maxActivity}</div>
        </div>
        <div className="p-2 rounded bg-muted/20">
          <div className="text-xs text-muted-foreground">Avg/hr</div>
          <div className="text-sm font-bold text-foreground">{avgActivity.toFixed(1)}</div>
        </div>
        <div className="p-2 rounded bg-muted/20">
          <div className="text-xs text-muted-foreground">Total</div>
          <div className="text-sm font-bold text-foreground">{totalActivity}</div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-2 mt-3">
        <span className="text-xs text-muted-foreground">Less</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 rounded bg-muted/20" />
          <div className="w-3 h-3 rounded bg-primary/20" />
          <div className="w-3 h-3 rounded bg-primary/40" />
          <div className="w-3 h-3 rounded bg-primary/60" />
          <div className="w-3 h-3 rounded bg-primary" />
        </div>
        <span className="text-xs text-muted-foreground">More</span>
      </div>
    </div>
  );
}

export const ActivityHeatmap = memo(ActivityHeatmapComponent);
