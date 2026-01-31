import { useWorldHeadline } from '@/hooks/useEmergenceMetrics';
import { Radio, Users, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WorldHeadlineProps {
  worldId: string;
}

export function WorldHeadline({ worldId }: WorldHeadlineProps) {
  const { data, isLoading } = useWorldHeadline(worldId);

  if (isLoading || !data) {
    return (
      <div className="p-6 rounded-lg border border-primary/30 bg-primary/5 animate-pulse h-24" />
    );
  }

  return (
    <div className="p-6 rounded-lg border border-primary/30 bg-gradient-to-r from-primary/10 to-transparent">
      <div className="flex items-center gap-2 mb-2">
        <Radio className="w-4 h-4 text-primary animate-pulse" />
        <span className="text-xs font-mono text-primary">DAY {data.turnNumber} — UNFOLDING</span>
      </div>
      
      <h2 className="text-xl md:text-2xl font-mono font-bold text-foreground mb-2">
        {data.headline}
      </h2>
      
      {data.insight && (
        <p className="text-sm font-mono text-muted-foreground italic">
          "{data.insight}"
        </p>
      )}

      <div className="flex gap-4 mt-4 pt-4 border-t border-border">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-primary" />
          <span className="text-sm font-mono text-foreground">{data.population} inhabitants</span>
        </div>
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-speech" />
          <span className="text-sm font-mono text-foreground">{data.normsCount} beliefs</span>
        </div>
      </div>
    </div>
  );
}
