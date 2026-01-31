import { Quote, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCurrentQuote } from '@/hooks/useWorldMemory';
import { useAgents, useWorld } from '@/hooks/useSimulation';
import { ShareCardDialog } from '@/components/ShareCardDialog';
import { cn } from '@/lib/utils';

interface QuoteOfTheCycleProps {
  worldId: string;
}

export function QuoteOfTheCycle({ worldId }: QuoteOfTheCycleProps) {
  const { data: quote } = useCurrentQuote(worldId);
  const { data: world } = useWorld();
  const { data: agents = [] } = useAgents(world?.id);
  
  if (!quote) {
    return null;
  }
  
  const agent = agents.find(a => a.id === quote.agent_id);
  const shareText = `"${quote.quote}" — ${agent?.name || 'Unknown Voice'}\n\nFrom OpenWorld, a living chronicle`;
  
  return (
    <div className="relative p-4 rounded-xl border border-primary/20 bg-primary/5 glass-card">
      {/* Quote icon */}
      <Quote className="absolute top-3 left-3 w-6 h-6 text-primary/20" />
      
      {/* Share button */}
      <div className="absolute top-3 right-3">
        <ShareCardDialog
          type="quote"
          id={quote.id}
          title="Voice of the World"
          shareText={shareText}
          compact
        />
      </div>
      
      {/* Quote content */}
      <div className="pl-8 pr-8">
        <p className="text-foreground font-serif italic leading-relaxed">
          "{quote.quote}"
        </p>
        
        {/* Attribution */}
        <div className="mt-3 flex items-center justify-between">
          {agent ? (
            <Link 
              to={`/agents/${agent.id}`}
              className="text-sm font-mono text-primary hover:underline inline-flex items-center gap-1"
            >
              — {agent.name}
              <ExternalLink className="w-3 h-3" />
            </Link>
          ) : (
            <span className="text-sm font-mono text-muted-foreground">
              — Unknown Voice
            </span>
          )}
          
          <span className="text-xs font-mono text-muted-foreground">
            Voice of the World
          </span>
        </div>
      </div>
    </div>
  );
}
