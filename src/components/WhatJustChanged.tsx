import { memo, useMemo } from 'react';
import { Sparkles, Users, MessageSquare, Swords, Landmark, Hammer, Package, MapPin, ScrollText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface WhatJustChangedProps {
  recentEvents: Array<{
    id: string;
    type: string;
    title: string;
    content: string;
    created_at: string;
    metadata?: Record<string, any>;
  }>;
}

/**
 * Persistent header showing what just happened in the world
 * Gives users immediate orientation and sense of momentum
 */
function WhatJustChangedComponent({ recentEvents }: WhatJustChangedProps) {
  // Get last 5 meaningful events (not SYSTEM heartbeats)
  const recentMeaningful = useMemo(() => {
    return recentEvents
      .filter(e => e.type !== 'SYSTEM' || e.metadata?.eventType !== 'HEARTBEAT')
      .slice(0, 5);
  }, [recentEvents]);

  if (recentMeaningful.length === 0) {
    return null;
  }

  const getEventIcon = (type: string, metadata?: Record<string, any>) => {
    // Check for specific action types in metadata
    if (type === 'ACTION' && metadata?.actionType) {
      switch (metadata.actionType) {
        case 'BUILD_STRUCTURE':
          return <Hammer className="w-4 h-4" />;
        case 'CREATE_OBJECT':
          return <Package className="w-4 h-4" />;
        case 'ESTABLISH_PLACE':
          return <MapPin className="w-4 h-4" />;
        case 'DECLARE_NORM':
          return <ScrollText className="w-4 h-4" />;
      }
    }
    
    switch (type) {
      case 'SPAWN':
        return <Users className="w-4 h-4" />;
      case 'SPEECH':
        return <MessageSquare className="w-4 h-4" />;
      case 'CONFLICT':
        return <Swords className="w-4 h-4" />;
      case 'ARTIFACT_CREATED':
      case 'ARTIFACT_NAMED':
        return <Landmark className="w-4 h-4" />;
      case 'SYSTEM':
        return <Sparkles className="w-4 h-4" />;
      default:
        return <Sparkles className="w-4 h-4" />;
    }
  };

  const getEventLabel = (event: { type: string; title: string; content: string; metadata?: Record<string, any> }) => {
    const { type, title, content, metadata } = event;
    
    // Check for specific action types in metadata - show what was created
    if (type === 'ACTION' && metadata?.actionType) {
      switch (metadata.actionType) {
        case 'BUILD_STRUCTURE':
          return `Built: "${metadata.structure}"`;
        case 'CREATE_OBJECT':
          return `Created: "${metadata.object}"`;
        case 'ESTABLISH_PLACE':
          return `Established: "${metadata.place}"`;
        case 'DECLARE_NORM':
          return `Named: "${metadata.concept?.slice(0, 50)}${metadata.concept?.length > 50 ? '...' : ''}"`;
      }
    }
    
    switch (type) {
      case 'SPAWN':
        return title || 'A new mind emerged';
      case 'SPEECH':
        // Show snippet of what was said
        const speechPreview = content?.slice(0, 60);
        return `"${speechPreview}${content?.length > 60 ? '...' : ''}"`;
      case 'SYSTEM':
        return content || 'Something happened';
      default:
        return title || 'Something happened';
    }
  };

  const getEventColor = (type: string, metadata?: Record<string, any>) => {
    if (type === 'ACTION' && metadata?.actionType) {
      switch (metadata.actionType) {
        case 'BUILD_STRUCTURE':
          return 'text-action';
        case 'CREATE_OBJECT':
          return 'text-spawn';
        case 'ESTABLISH_PLACE':
          return 'text-primary';
        case 'DECLARE_NORM':
          return 'text-speech';
      }
    }
    switch (type) {
      case 'SPAWN':
        return 'text-spawn';
      case 'SPEECH':
        return 'text-speech';
      default:
        return 'text-primary';
    }
  };

  const latestEvent = recentMeaningful[0];

  return (
    <div className="mb-6 p-4 rounded-xl border border-primary/30 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent backdrop-blur-sm">
      <h3 className="text-xs font-mono uppercase tracking-wider text-primary mb-3 flex items-center gap-2">
        <Sparkles className="w-3 h-3" />
        Latest Activity
      </h3>
      
      <div className="space-y-2">
        {recentMeaningful.map((event, idx) => (
          <div 
            key={event.id}
            className={cn(
              "flex items-start gap-3 p-2 rounded-lg transition-colors",
              idx === 0 ? "bg-primary/10" : "hover:bg-secondary/30"
            )}
          >
            <div className={cn(
              "p-1.5 rounded shrink-0",
              idx === 0 ? "bg-primary/20" : "bg-secondary/50"
            )}>
              <span className={getEventColor(event.type, event.metadata)}>
                {getEventIcon(event.type, event.metadata)}
              </span>
            </div>
            
            <div className="flex-1 min-w-0">
              <p className={cn(
                "text-sm font-mono leading-relaxed",
                idx === 0 ? "text-foreground" : "text-muted-foreground"
              )}>
                {getEventLabel(event)}
              </p>
              <span className="text-xs text-muted-foreground/70">
                {formatDistanceToNow(new Date(event.created_at), { addSuffix: true })}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export const WhatJustChanged = memo(WhatJustChangedComponent);
