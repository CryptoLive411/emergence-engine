import { memo } from 'react';
import { Sparkles, Landmark, Brain } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface EnhancedNamingEventProps {
  event: {
    id: string;
    title: string;
    content: string;
    created_at: string;
    type: string;
    metadata?: Record<string, any>;
  };
  agentName?: string;
}

/**
 * Full-width, animated card for naming events
 * Makes important moments feel BIGGER
 */
function EnhancedNamingEventComponent({ event, agentName }: EnhancedNamingEventProps) {
  // Only show for naming events
  if (event.type !== 'ARTIFACT_NAMED' && event.type !== 'BELIEF_FORMED') {
    return null;
  }

  const isBelief = event.type === 'BELIEF_FORMED';
  const Icon = isBelief ? Brain : Landmark;
  const label = isBelief ? 'A new belief was named' : 'Something was named';
  
  // Extract the name from title or metadata
  const name = event.metadata?.artifact_name || event.title;
  
  // Extract quote from content if it has quotation marks
  const quoteMatch = event.content.match(/"([^"]+)"/);
  const quote = quoteMatch ? quoteMatch[1] : null;

  return (
    <div className={cn(
      "col-span-full mb-6 p-6 rounded-2xl border-2 transition-all duration-500",
      "bg-gradient-to-br backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4",
      isBelief 
        ? "border-speech/40 from-speech/10 via-speech/5 to-transparent" 
        : "border-spawn/40 from-spawn/10 via-spawn/5 to-transparent"
    )}>
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className={cn(
          "p-4 rounded-xl shrink-0",
          isBelief ? "bg-speech/20 text-speech" : "bg-spawn/20 text-spawn"
        )}>
          <Icon className="w-8 h-8" />
        </div>
        
        <div className="flex-1 min-w-0">
          {/* Label */}
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className={cn(
              "w-4 h-4",
              isBelief ? "text-speech" : "text-spawn"
            )} />
            <span className={cn(
              "text-xs font-mono uppercase tracking-wider",
              isBelief ? "text-speech" : "text-spawn"
            )}>
              {label}
            </span>
          </div>
          
          {/* Name */}
          <h3 className="text-2xl font-display font-bold text-foreground mb-2">
            {name}
          </h3>
          
          {/* Quote if available */}
          {quote && (
            <blockquote className="text-foreground/80 text-base italic leading-relaxed mb-3 pl-4 border-l-2 border-primary/30">
              "{quote}"
            </blockquote>
          )}
          
          {/* Attribution */}
          <div className="flex items-center gap-3 text-sm text-muted-foreground font-mono">
            {agentName && (
              <>
                <span>Named by {agentName}</span>
                <span>·</span>
              </>
            )}
            <time>{formatDistanceToNow(new Date(event.created_at), { addSuffix: true })}</time>
          </div>
        </div>
      </div>
    </div>
  );
}

export const EnhancedNamingEvent = memo(EnhancedNamingEventComponent);
