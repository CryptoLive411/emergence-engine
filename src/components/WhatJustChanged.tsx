import { memo, useMemo } from 'react';
import { Sparkles, Users, MessageSquare, Swords, Landmark } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface WhatJustChangedProps {
  recentEvents: Array<{
    id: string;
    type: string;
    title: string;
    created_at: string;
    metadata?: Record<string, any>;
  }>;
}

/**
 * Persistent header showing what just happened in the world
 * Gives users immediate orientation and sense of momentum
 */
function WhatJustChangedComponent({ recentEvents }: WhatJustChangedProps) {
  // Get last 3 meaningful events (not SYSTEM)
  const recentMeaningful = useMemo(() => {
    return recentEvents
      .filter(e => e.type !== 'SYSTEM')
      .slice(0, 3);
  }, [recentEvents]);

  if (recentMeaningful.length === 0) {
    return null;
  }

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'SPAWN':
        return <Users className="w-4 h-4" />;
      case 'SPEECH':
      case 'THOUGHT':
        return <MessageSquare className="w-4 h-4" />;
      case 'CONFLICT':
        return <Swords className="w-4 h-4" />;
      case 'ARTIFACT_CREATED':
      case 'ARTIFACT_NAMED':
        return <Landmark className="w-4 h-4" />;
      default:
        return <Sparkles className="w-4 h-4" />;
    }
  };

  const getEventLabel = (type: string, metadata?: Record<string, any>) => {
    switch (type) {
      case 'SPAWN':
        return 'A new mind emerged';
      case 'SPEECH':
        return 'A statement was made';
      case 'THOUGHT':
        return 'A thought formed';
      case 'CONFLICT':
        return 'Views are in conflict';
      case 'ARTIFACT_CREATED':
        return 'Something was created';
      case 'ARTIFACT_NAMED':
        return 'Something was named';
      case 'BELIEF_FORMED':
        return 'A new belief formed';
      default:
        return 'Something happened';
    }
  };

  const latestEvent = recentMeaningful[0];

  return (
    <div className="mb-6 p-4 rounded-xl border border-primary/30 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent backdrop-blur-sm">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-primary/20 text-primary shrink-0">
          {getEventIcon(latestEvent.type)}
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-xs font-mono uppercase tracking-wider text-primary mb-1">
            What Just Changed
          </h3>
          
          <div className="space-y-1.5">
            {recentMeaningful.map((event, idx) => (
              <div 
                key={event.id}
                className={cn(
                  "flex items-start gap-2 text-sm",
                  idx === 0 ? "text-foreground font-medium" : "text-muted-foreground"
                )}
              >
                <span className="text-primary shrink-0">–</span>
                <div className="flex-1 min-w-0">
                  <span>{getEventLabel(event.type, event.metadata)}</span>
                  {idx === 0 && (
                    <span className="ml-2 text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(event.created_at), { addSuffix: true })}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export const WhatJustChanged = memo(WhatJustChangedComponent);
