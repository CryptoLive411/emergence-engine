import { memo, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Clock, Sparkles, Users, Swords, Landmark } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Event {
  id: string;
  type: string;
  title: string;
  created_at: string;
  content: string;
}

interface EventTimelineProps {
  events: Event[];
  limit?: number;
}

/**
 * Visual timeline showing major events chronologically
 * Highlights important moments with icons and colors
 */
function EventTimelineComponent({ events, limit = 10 }: EventTimelineProps) {
  const majorEvents = useMemo(() => {
    // Filter to major event types
    return events
      .filter(e => ['SPAWN', 'ARTIFACT_NAMED', 'BELIEF_FORMED', 'CONFLICT'].includes(e.type))
      .slice(0, limit);
  }, [events, limit]);

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'SPAWN':
        return <Users className="w-4 h-4" />;
      case 'ARTIFACT_NAMED':
      case 'BELIEF_FORMED':
        return <Landmark className="w-4 h-4" />;
      case 'CONFLICT':
        return <Swords className="w-4 h-4" />;
      default:
        return <Sparkles className="w-4 h-4" />;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'SPAWN':
        return 'text-spawn border-spawn/30 bg-spawn/10';
      case 'ARTIFACT_NAMED':
      case 'BELIEF_FORMED':
        return 'text-speech border-speech/30 bg-speech/10';
      case 'CONFLICT':
        return 'text-destructive border-destructive/30 bg-destructive/10';
      default:
        return 'text-primary border-primary/30 bg-primary/10';
    }
  };

  if (majorEvents.length === 0) {
    return (
      <div className="p-8 text-center rounded-xl border border-border bg-card/30">
        <Clock className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
        <p className="text-sm text-muted-foreground">
          No major events yet
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-xl border border-border bg-card/30 backdrop-blur-sm">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-mono uppercase tracking-wider text-foreground">
          Major Events Timeline
        </h3>
      </div>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-[15px] top-4 bottom-4 w-px bg-gradient-to-b from-primary via-border to-transparent" />

        <div className="space-y-4">
          {majorEvents.map((event, idx) => (
            <div key={event.id} className="relative pl-10">
              {/* Timeline dot */}
              <div className={cn(
                "absolute left-0 top-2 w-8 h-8 rounded-full border-2 flex items-center justify-center",
                getEventColor(event.type)
              )}>
                {getEventIcon(event.type)}
              </div>

              {/* Event card */}
              <div className={cn(
                "p-3 rounded-lg border transition-all duration-300 hover:scale-[1.02]",
                getEventColor(event.type)
              )}>
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h4 className="text-sm font-medium text-foreground">
                    {event.title}
                  </h4>
                  <time className="text-[10px] font-mono text-muted-foreground shrink-0">
                    {formatDistanceToNow(new Date(event.created_at), { addSuffix: true })}
                  </time>
                </div>
                
                {event.content && (
                  <p className="text-xs text-foreground/70 line-clamp-2">
                    {event.content}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {events.length > limit && (
        <p className="text-xs text-center text-muted-foreground mt-4">
          Showing {limit} of {events.length} major events
        </p>
      )}
    </div>
  );
}

export const EventTimeline = memo(EventTimelineComponent);
