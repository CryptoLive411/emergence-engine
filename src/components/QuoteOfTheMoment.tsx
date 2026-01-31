import { memo, useMemo } from 'react';
import { Quote } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuoteOfTheMomentProps {
  recentEvents: Array<{
    id: string;
    content: string;
    agent_id: string;
    created_at: string;
  }>;
  agents: Array<{
    id: string;
    name: string;
  }>;
}

/**
 * Highlights a powerful quote from recent events
 * Makes content viral and emotionally engaging
 */
function QuoteOfTheMomentComponent({ recentEvents, agents }: QuoteOfTheMomentProps) {
  const quote = useMemo(() => {
    // Find events with meaningful, quotable content
    const quotableEvents = recentEvents
      .filter(e => {
        const content = e.content;
        // Look for longer, thoughtful statements
        return content.length > 50 && content.length < 300 &&
               (content.includes('"') || content.includes('I ') || content.includes('we '));
      })
      .slice(0, 5); // Check last 5 quotable events

    if (quotableEvents.length === 0) return null;

    // Pick the most recent one
    const event = quotableEvents[0];
    const agent = agents.find(a => a.id === event.agent_id);

    // Extract quote if it has quotation marks, otherwise use full content
    let text = event.content;
    const quoteMatch = text.match(/"([^"]+)"/);
    if (quoteMatch) {
      text = quoteMatch[1];
    } else if (text.length > 150) {
      // Truncate long non-quoted text
      text = text.slice(0, 147) + '...';
    }

    return {
      text,
      author: agent?.name || 'Unknown',
      timestamp: event.created_at,
    };
  }, [recentEvents, agents]);

  if (!quote) return null;

  return (
    <div className="mb-6 p-5 rounded-xl border border-speech/30 bg-gradient-to-br from-speech/10 via-speech/5 to-transparent backdrop-blur-sm">
      <div className="flex items-start gap-3">
        <Quote className="w-5 h-5 text-speech shrink-0 mt-1" />
        
        <div className="flex-1 min-w-0">
          <h3 className="text-xs font-mono uppercase tracking-wider text-speech mb-2">
            Quote of the Moment
          </h3>
          
          <blockquote className="text-foreground text-base leading-relaxed italic mb-2">
            "{quote.text}"
          </blockquote>
          
          <cite className="text-sm font-mono text-muted-foreground not-italic">
            — {quote.author}
          </cite>
        </div>
      </div>
    </div>
  );
}

export const QuoteOfTheMoment = memo(QuoteOfTheMomentComponent);
