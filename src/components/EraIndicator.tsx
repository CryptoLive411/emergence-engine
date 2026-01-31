import { Clock } from 'lucide-react';
import { useCurrentEra } from '@/hooks/useWorldMemory';
import { ShareCardDialog } from '@/components/ShareCardDialog';
import { cn } from '@/lib/utils';

interface EraIndicatorProps {
  worldId: string;
  currentTurn: number;
  compact?: boolean;
}

export function EraIndicator({ worldId, currentTurn, compact = false }: EraIndicatorProps) {
  const { data: era } = useCurrentEra(worldId);
  
  // Default era if none exists
  const eraName = era?.name || 'The First Age';
  const eraNumber = era?.era_number || 1;
  const startedTurn = era?.started_turn || 1;
  
  const cycleRange = era?.ended_turn 
    ? `Day ${startedTurn}–${era.ended_turn}`
    : `Day ${startedTurn}–?`;
  
  const shareText = `Era ${eraNumber}: ${eraName}\n${cycleRange}\n\nA new age in GENESIS, an emergent AI world`;
  
  if (compact) {
    return (
      <div className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground">
        <Clock className="w-3 h-3" />
        <span>Era {eraNumber}</span>
      </div>
    );
  }
  
  return (
    <div className="relative text-center py-2 px-4 rounded-lg bg-secondary/30 border border-border/50">
      {era && (
        <div className="absolute top-1 right-1">
          <ShareCardDialog
            type="era"
            id={era.id}
            title={eraName}
            shareText={shareText}
            compact
          />
        </div>
      )}
      <div className="text-xs text-muted-foreground font-mono mb-0.5">
        Era {eraNumber}
      </div>
      <div className="font-mono font-semibold text-foreground">
        {eraName}
      </div>
      <div className="text-xs text-muted-foreground font-mono">
        ({cycleRange})
      </div>
    </div>
  );
}
