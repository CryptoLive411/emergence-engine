import { memo, useMemo } from 'react';
import { Activity, AlertTriangle, Zap, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TensionMeterProps {
  recentEvents: Array<{
    type: string;
    content: string;
    metadata?: Record<string, any>;
  }>;
}

type TensionLevel = 'stable' | 'tense' | 'fragmenting' | 'unstable';

/**
 * Visual indicator of world tension based on recent activity
 * Gives users a sense of momentum and build-up
 */
function TensionMeterComponent({ recentEvents }: TensionMeterProps) {
  const tensionLevel = useMemo((): TensionLevel => {
    // Analyze last 10 events for tension indicators
    const recent = recentEvents.slice(0, 10);
    
    let tensionScore = 0;
    
    recent.forEach(event => {
      const content = event.content.toLowerCase();
      
      // Conflict indicators
      if (event.type === 'CONFLICT') tensionScore += 3;
      if (content.includes('disagree') || content.includes('conflict')) tensionScore += 2;
      if (content.includes('but ') || content.includes('however')) tensionScore += 1;
      
      // Contradiction language
      if (content.includes('wrong') || content.includes('mistake')) tensionScore += 2;
      if (content.includes('question') || content.includes('doubt')) tensionScore += 1;
      
      // New concepts forming rapidly
      if (event.type === 'ARTIFACT_NAMED' || event.type === 'BELIEF_FORMED') tensionScore += 1;
      
      // Spawning indicates growth/change
      if (event.type === 'SPAWN') tensionScore += 1;
    });
    
    // Determine level based on score
    if (tensionScore >= 15) return 'unstable';
    if (tensionScore >= 10) return 'fragmenting';
    if (tensionScore >= 5) return 'tense';
    return 'stable';
  }, [recentEvents]);

  const config = {
    stable: {
      label: 'Stable',
      icon: Circle,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      borderColor: 'border-primary/30',
      description: 'The world is finding its rhythm',
    },
    tense: {
      label: 'Tense',
      icon: Activity,
      color: 'text-spawn',
      bgColor: 'bg-spawn/10',
      borderColor: 'border-spawn/30',
      description: 'Differences are emerging',
    },
    fragmenting: {
      label: 'Fragmenting',
      icon: Zap,
      color: 'text-action',
      bgColor: 'bg-action/10',
      borderColor: 'border-action/30',
      description: 'Competing views are forming',
    },
    unstable: {
      label: 'Unstable',
      icon: AlertTriangle,
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
      borderColor: 'border-destructive/30',
      description: 'The world is in flux',
    },
  };

  const current = config[tensionLevel];
  const Icon = current.icon;

  return (
    <div className={cn(
      "p-3 rounded-lg border transition-all duration-500",
      current.bgColor,
      current.borderColor
    )}>
      <div className="flex items-center gap-2 mb-1">
        <Icon className={cn("w-4 h-4", current.color)} />
        <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
          World State
        </span>
      </div>
      
      <div className={cn("text-lg font-display font-semibold", current.color)}>
        {current.label}
      </div>
      
      <p className="text-xs text-muted-foreground mt-1">
        {current.description}
      </p>
    </div>
  );
}

export const TensionMeter = memo(TensionMeterComponent);
