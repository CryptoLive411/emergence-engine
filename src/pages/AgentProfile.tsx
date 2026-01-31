import { useParams, Link } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { EventCard } from '@/components/EventCard';
import { AgentCard } from '@/components/AgentCard';
import { ClaimButton } from '@/components/ClaimButton';
import { useAgent, useAgentChildren, useAgentEvents, useAgents, useWorld, useCurrentTurn } from '@/hooks/useSimulation';
import { 
  ArrowLeft, 
  Battery, 
  TrendingUp, 
  GitBranch, 
  Crown, 
  Target, 
  Heart,
  Clock,
  Shield,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';

const AgentProfile = () => {
  const { id } = useParams<{ id: string }>();
  const { data: agent, isLoading } = useAgent(id);
  const { data: children = [] } = useAgentChildren(id);
  const { data: events = [] } = useAgentEvents(id);
  const { data: world } = useWorld();
  const { data: allAgents = [] } = useAgents(world?.id);
  const { data: currentTurn } = useCurrentTurn(world?.id);
  
  const parentAgent = agent?.parent_agent_id 
    ? allAgents.find(a => a.id === agent.parent_agent_id)
    : null;

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!agent) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-muted-foreground font-mono">Agent not found</p>
          <Link to="/agents" className="text-primary hover:underline font-mono text-sm mt-2 inline-block">
            ← Back to agents
          </Link>
        </div>
      </Layout>
    );
  }

  const founderColor = agent.founder_type === 'A' ? 'founder-a' : 'founder-b';
  const loyaltyConfig = {
    PARENT: { label: 'Loyal to Parent', color: 'text-primary' },
    INDEPENDENT: { label: 'Independent', color: 'text-spawn' },
    REBELLIOUS: { label: 'Rebellious', color: 'text-destructive' },
  };

  return (
    <Layout>
      {/* Back link */}
      <Link 
        to="/agents" 
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground font-mono text-sm mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to agents
      </Link>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main profile */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header card */}
          <div className={cn(
            "p-6 rounded-lg border bg-card/50 backdrop-blur-sm",
            agent.is_founder 
              ? `border-${founderColor}/50`
              : "border-border"
          )}>
            <div className="flex items-start gap-4 mb-6">
              <div className={cn(
                "relative w-20 h-20 rounded-xl flex items-center justify-center font-mono font-bold text-3xl",
                agent.is_founder 
                  ? agent.founder_type === 'A'
                    ? 'bg-founder-a/20 text-founder-a border-2 border-founder-a/50'
                    : 'bg-founder-b/20 text-founder-b border-2 border-founder-b/50'
                  : 'bg-secondary text-secondary-foreground'
              )}>
                {agent.name.charAt(0)}
                {agent.is_founder && (
                  <Crown className="absolute -top-2 -right-2 w-6 h-6 text-spawn" />
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className={cn(
                    "text-3xl font-mono font-bold",
                    agent.is_founder 
                      ? agent.founder_type === 'A' ? 'text-founder-a' : 'text-founder-b'
                      : 'text-foreground'
                  )}>
                    {agent.name}
                  </h1>
                  <span className="px-2 py-0.5 rounded bg-secondary text-secondary-foreground font-mono text-sm">
                    Generation {agent.generation}
                  </span>
                  {agent.status === 'ACTIVE' && (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-primary/10 text-primary font-mono text-sm">
                      <span className="relative flex h-2 w-2">
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                      </span>
                      Active
                    </span>
                  )}
                </div>
                
                {parentAgent && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <span>Spawned by</span>
                    <Link 
                      to={`/agents/${parentAgent.id}`}
                      className="text-primary hover:underline font-mono"
                    >
                      {parentAgent.name}
                    </Link>
                  </div>
                )}

                <div className="flex items-center gap-4 text-sm">
                  <div className={cn(
                    "flex items-center gap-1",
                    loyaltyConfig[agent.loyalty].color
                  )}>
                    <Shield className="w-4 h-4" />
                    <span className="font-mono">{loyaltyConfig[agent.loyalty].label}</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span className="font-mono">Created Day {agent.created_turn}</span>
                  </div>
                </div>
                
                {/* Claim button */}
                <div className="mt-3">
                  <ClaimButton 
                    agentId={agent.id} 
                    agentName={agent.name} 
                    isFounder={agent.is_founder}
                  />
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <div className="p-3 rounded-lg bg-secondary/50">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                  <Battery className="w-3 h-3" />
                  Energy
                </div>
                <div className="text-2xl font-mono font-bold text-primary">{agent.energy}</div>
              </div>
              <div className="p-3 rounded-lg bg-secondary/50">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                  <TrendingUp className="w-3 h-3" />
                  Influence
                </div>
                <div className="text-2xl font-mono font-bold text-action">{agent.influence_points}</div>
              </div>
              <div className="p-3 rounded-lg bg-secondary/50">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                  <GitBranch className="w-3 h-3" />
                  Children
                </div>
                <div className="text-2xl font-mono font-bold text-spawn">{children.length}</div>
              </div>
              <div className="p-3 rounded-lg bg-secondary/50">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                  <Clock className="w-3 h-3" />
                  Generation
                </div>
                <div className="text-2xl font-mono font-bold text-foreground">
                  {agent.generation}
                </div>
              </div>
            </div>

            {/* Purpose */}
            <div className="mb-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <Target className="w-4 h-4" />
                Purpose
              </div>
              <p className="text-foreground leading-relaxed">{agent.purpose}</p>
            </div>

            {/* Traits */}
            <div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <Heart className="w-4 h-4" />
                Traits
              </div>
              <div className="flex flex-wrap gap-2">
                {(agent.traits as string[]).map((trait: string) => (
                  <span 
                    key={trait}
                    className="px-3 py-1 rounded-full text-sm font-mono bg-accent text-accent-foreground"
                  >
                    {trait}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <h2 className="font-mono font-semibold text-foreground mb-4">Recent Activity</h2>
            {events.length > 0 ? (
              <div className="space-y-3">
                {events.map(event => (
                  <EventCard key={event.id} event={{
                    id: event.id,
                    turnId: event.turn_id,
                    turnNumber: currentTurn?.turn_number || 0,
                    agentId: event.agent_id,
                    agentName: agent.name,
                    type: event.type,
                    title: event.title,
                    content: event.content,
                    metadata: event.metadata,
                    createdAt: new Date(event.created_at),
                  }} />
                ))}
              </div>
            ) : (
              <div className="p-6 rounded-lg border border-border bg-card/50 text-center">
                <p className="text-muted-foreground font-mono">No recent activity recorded</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Children */}
          <div>
            <h3 className="font-mono font-semibold text-foreground mb-3">
              {children.length > 0 ? `Children (${children.length})` : 'No Children Yet'}
            </h3>
            {children.length > 0 ? (
              <div className="space-y-3">
                {children.map(child => (
                  <AgentCard key={child.id} agent={{
                    id: child.id,
                    name: child.name,
                    generation: child.generation,
                    parentId: child.parent_agent_id,
                    traits: child.traits as string[],
                    purpose: child.purpose,
                    loyalty: child.loyalty,
                    energy: child.energy,
                    influencePoints: child.influence_points,
                    status: child.status,
                    createdTurn: child.created_turn,
                    isFounder: child.is_founder,
                    founderType: child.founder_type || undefined,
                    createdAt: new Date(child.created_at),
                  }} compact />
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-lg border border-border bg-card/50">
                <p className="text-sm text-muted-foreground font-mono">
                  This agent has not spawned any descendants yet.
                </p>
              </div>
            )}
          </div>

          {/* Lineage */}
          {parentAgent && (
            <div>
              <h3 className="font-mono font-semibold text-foreground mb-3">Lineage</h3>
              <div className="space-y-2">
                <AgentCard agent={{
                  id: parentAgent.id,
                  name: parentAgent.name,
                  generation: parentAgent.generation,
                  parentId: parentAgent.parent_agent_id,
                  traits: parentAgent.traits as string[],
                  purpose: parentAgent.purpose,
                  loyalty: parentAgent.loyalty,
                  energy: parentAgent.energy,
                  influencePoints: parentAgent.influence_points,
                  status: parentAgent.status,
                  createdTurn: parentAgent.created_turn,
                  isFounder: parentAgent.is_founder,
                  founderType: parentAgent.founder_type || undefined,
                  createdAt: new Date(parentAgent.created_at),
                }} compact />
                <Link 
                  to="/lineage"
                  className="block text-center text-sm text-primary hover:underline font-mono"
                >
                  View full lineage →
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default AgentProfile;