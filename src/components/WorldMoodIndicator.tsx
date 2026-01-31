import { Cloud } from 'lucide-react';
import { useCurrentMood, MOOD_CONFIG, calculateMood } from '@/hooks/useWorldMemory';
import { useTier1Metrics } from '@/hooks/useEmergenceMetrics';
import { cn } from '@/lib/utils';

interface WorldMoodIndicatorProps {
  worldId: string;
  compact?: boolean;
}

export function WorldMoodIndicator({ worldId, compact = false }: WorldMoodIndicatorProps) {
  const { data: moodRecord } = useCurrentMood(worldId);
  const { data: tier1 } = useTier1Metrics(worldId);
  
  // Use recorded mood or calculate from current metrics
  const mood = moodRecord?.mood || calculateMood(
    (tier1?.stability?.score || 50) / 100,
    0.2, // Default conflict rate
    0.3  // Default entropy
  );
  
  const config = MOOD_CONFIG[mood];
  
  if (compact) {
    return (
      <div className={cn("flex items-center gap-1.5", config.color)}>
        <Cloud className="w-3 h-3" />
        <span className="font-mono text-xs">{config.label}</span>
      </div>
    );
  }
  
  return (
    <div className="p-3 rounded-lg border border-border bg-card/50">
      <div className="flex items-center gap-2 mb-1">
        <Cloud className={cn("w-4 h-4", config.color)} />
        <span className={cn("font-mono font-semibold text-sm", config.color)}>
          {config.label}
        </span>
      </div>
      <p className="text-xs text-muted-foreground italic">
        {config.description}
      </p>
    </div>
  );
}
