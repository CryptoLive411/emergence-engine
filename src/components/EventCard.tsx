import { WorldEvent, EventType } from '@/data/types';
import { cn } from '@/lib/utils';
import { MessageSquare, Zap, Sparkles, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';
import { EventAnnotations } from './EventAnnotations';
import { SimplifyButton } from './SimplifyButton';

interface EventCardProps {
  event: WorldEvent;
}

const eventTypeConfig: Record<EventType, { 
  icon: typeof MessageSquare; 
  colorClass: string;
  bgClass: string;
  label: string;
}> = {
  SPEECH: { 
    icon: MessageSquare, 
    colorClass: 'text-speech',
    bgClass: 'bg-speech/10 border-speech/30',
    label: 'Speech'
  },
  ACTION: { 
    icon: Zap, 
    colorClass: 'text-action',
    bgClass: 'bg-action/10 border-action/30',
    label: 'Action'
  },
  SPAWN: { 
    icon: Sparkles, 
    colorClass: 'text-spawn',
    bgClass: 'bg-spawn/10 border-spawn/30',
    label: 'Spawn'
  },
  SYSTEM: { 
    icon: AlertCircle, 
    colorClass: 'text-system',
    bgClass: 'bg-system/10 border-system/30',
    label: 'System'
  },
};

export function EventCard({ event }: EventCardProps) {
  const config = eventTypeConfig[event.type];
  const Icon = config.icon;
  
  return (
    <div className={cn(
      "relative p-4 rounded-lg border transition-all duration-300 hover:scale-[1.01]",
      "bg-card/50 backdrop-blur-sm",
      config.bgClass
    )}>
      {/* Event type badge */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-center gap-2">
          <div className={cn(
            "p-1.5 rounded",
            config.bgClass
          )}>
            <Icon className={cn("w-4 h-4", config.colorClass)} />
          </div>
          <div>
            {event.agentId ? (
              <Link 
                to={`/agents/${event.agentId}`}
                className={cn(
                  "font-mono font-semibold hover:underline",
                  config.colorClass
                )}
              >
                {event.agentName}
              </Link>
            ) : (
              <span className="font-mono font-semibold text-system">
                {event.agentName}
              </span>
            )}
            <span className="mx-2 text-muted-foreground">·</span>
            <span className="text-sm text-muted-foreground">
              {event.title}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
          <span>T{event.turnNumber}</span>
          <span>·</span>
          <span>{formatDistanceToNow(event.createdAt, { addSuffix: true })}</span>
        </div>
      </div>

      {/* Event content */}
      <div className="pl-10">
        <p className="text-foreground/90 leading-relaxed">
          {event.content}
        </p>
        
        {/* Metadata tags - formatted nicely */}
        {Object.keys(event.metadata).length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {Object.entries(event.metadata).map(([key, value]) => {
              // Format metadata for display
              let displayKey = key;
              let displayValue = String(value);
              
              // Special handling for spawn events
              if (key === 'eventType') {
                if (value === 'LINEAGE_SPAWN' || value === 'ADMIN_SPAWN') {
                  displayKey = 'Origin';
                  displayValue = event.metadata.spawnedBy ? `Created by ${event.metadata.spawnedBy}` : 'Spawned';
                  return (
                    <span 
                      key={key}
                      className="px-2 py-0.5 rounded text-xs font-mono bg-spawn/20 text-spawn border border-spawn/30"
                    >
                      {displayValue}
                    </span>
                  );
                } else if (value === 'GENESIS') {
                  return (
                    <span 
                      key={key}
                      className="px-2 py-0.5 rounded text-xs font-mono bg-primary/20 text-primary border border-primary/30"
                    >
                      Genesis Event
                    </span>
                  );
                }
              }
              
              // Skip spawnedBy since we already used it
              if (key === 'spawnedBy') return null;
              
              return (
                <span 
                  key={key}
                  className="px-2 py-0.5 rounded text-xs font-mono bg-secondary text-secondary-foreground"
                >
                  {displayKey}: {displayValue}
                </span>
              );
            })}
          </div>
        )}
        
        {/* Simplify button */}
        <SimplifyButton 
          eventId={event.id}
          title={event.title}
          content={event.content}
          eventType={event.type}
        />
        
        {/* Annotations */}
        <div className="mt-3 border-t border-border/50 pt-3">
          <EventAnnotations eventId={event.id} />
        </div>
      </div>
    </div>
  );
}
