import { useTier5Metrics } from '@/hooks/useEmergenceMetrics';
import { Clock, Baby, BookMarked, Skull, Swords, Milestone } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Tier5TimelineProps {
  worldId: string;
}

export function Tier5Timeline({ worldId }: Tier5TimelineProps) {
  const { data, isLoading } = useTier5Metrics(worldId);

  if (isLoading || !data) {
    return (
      <div className="p-4 rounded-lg border border-border bg-card/50 animate-pulse h-48" />
    );
  }

  const { timeline } = data;

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'first_child': return <Baby className="w-4 h-4" />;
      case 'first_norm': return <BookMarked className="w-4 h-4" />;
      case 'first_death': return <Skull className="w-4 h-4" />;
      case 'first_conflict': return <Swords className="w-4 h-4" />;
      case 'schism': return <Swords className="w-4 h-4" />;
      default: return <Milestone className="w-4 h-4" />;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'first_child': return 'text-primary bg-primary/10 border-primary/30';
      case 'first_norm': return 'text-speech bg-speech/10 border-speech/30';
      case 'first_death': return 'text-destructive bg-destructive/10 border-destructive/30';
      case 'first_conflict': return 'text-action bg-action/10 border-action/30';
      case 'schism': return 'text-spawn bg-spawn/10 border-spawn/30';
      default: return 'text-muted-foreground bg-secondary border-border';
    }
  };

  return (
    <div className="p-4 rounded-lg border border-border bg-card/50">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-4 h-4 text-primary" />
        <span className="text-sm font-mono font-semibold text-foreground">World Timeline</span>
      </div>

      {timeline.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground font-mono">
            History awaits its first chapter...
          </p>
        </div>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />

          <div className="space-y-4">
            {timeline.map((event, i) => (
              <div key={i} className="relative flex gap-4 pl-10">
                {/* Event dot */}
                <div className={cn(
                  "absolute left-0 w-8 h-8 rounded-full flex items-center justify-center border",
                  getEventColor(event.type)
                )}>
                  {getEventIcon(event.type)}
                </div>

                {/* Event content */}
                <div className="flex-1 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-muted-foreground">
                      Turn {event.turn}
                    </span>
                  </div>
                  <h4 className="text-sm font-mono font-semibold text-foreground mt-1">
                    {event.title}
                  </h4>
                  <p className="text-xs font-mono text-muted-foreground mt-1">
                    {event.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
