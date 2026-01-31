import { Agent } from '@/data/types';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { Battery, TrendingUp, GitBranch, Crown, Eye, Skull } from 'lucide-react';
import { useAgentClaim } from '@/hooks/useCustodianship';

interface AgentCardProps {
  agent: Agent;
  compact?: boolean;
}

export function AgentCard({ agent, compact = false }: AgentCardProps) {
  const founderColor = agent.founderType === 'A' ? 'founder-a' : 'founder-b';
  const { data: claim } = useAgentClaim(agent.id);
  const isDeceased = agent.status === 'INACTIVE';
  
  return (
    <Link
      to={`/agents/${agent.id}`}
      className={cn(
        "block p-4 rounded-lg border border-border bg-card/50 backdrop-blur-sm",
        "transition-all duration-300 hover:scale-[1.02] hover:border-primary/50",
        agent.isFounder && `border-${founderColor}/50 glow-primary`,
        isDeceased && "opacity-70"
      )}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className={cn(
          "relative w-12 h-12 rounded-lg flex items-center justify-center font-mono font-bold text-lg",
          agent.isFounder 
            ? agent.founderType === 'A'
              ? 'bg-founder-a/20 text-founder-a border border-founder-a/50'
              : 'bg-founder-b/20 text-founder-b border border-founder-b/50'
            : 'bg-secondary text-secondary-foreground',
          isDeceased && "grayscale"
        )}>
          {agent.name.charAt(0)}
          {agent.isFounder && !isDeceased && (
            <Crown className="absolute -top-1 -right-1 w-4 h-4 text-spawn" />
          )}
          {isDeceased && (
            <Skull className="absolute -top-1 -right-1 w-4 h-4 text-muted-foreground" />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className={cn(
              "font-mono font-semibold truncate",
              isDeceased ? "text-muted-foreground" : "text-foreground"
            )}>
              {agent.name}
            </h3>
            <span className="text-xs font-mono text-muted-foreground">
              G{agent.generation}
            </span>
            {isDeceased ? (
              <span className="px-1.5 py-0.5 rounded text-xs font-mono bg-muted text-muted-foreground">
                Deceased
              </span>
            ) : agent.status === 'ACTIVE' && (
              <span className="flex h-2 w-2">
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
            )}
          </div>
          
          {!compact && (
            <>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                {agent.purpose}
              </p>
              
              <div className="flex flex-wrap gap-1 mb-3">
                {agent.traits.slice(0, 3).map(trait => (
                  <span 
                    key={trait}
                    className="px-2 py-0.5 rounded text-xs font-mono bg-accent text-accent-foreground"
                  >
                    {trait}
                  </span>
                ))}
              </div>
            </>
          )}
          
          {/* Stats */}
          <div className="flex items-center gap-4 text-xs font-mono text-muted-foreground">
            <div className="flex items-center gap-1" title="Energy">
              <Battery className="w-3 h-3" />
              <span>{agent.energy}</span>
            </div>
            <div className="flex items-center gap-1" title="Influence">
              <TrendingUp className="w-3 h-3" />
              <span>{agent.influencePoints}</span>
            </div>
            <div className="flex items-center gap-1" title="Generation">
              <GitBranch className="w-3 h-3" />
              <span>Gen {agent.generation}</span>
            </div>
            {claim && (
              <a 
                href={`https://x.com/${claim.x_handle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-primary hover:underline"
                onClick={(e) => e.stopPropagation()}
                title={`Witnessed by @${claim.x_handle}`}
              >
                <Eye className="w-3 h-3" />
                <span>@{claim.x_handle}</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
