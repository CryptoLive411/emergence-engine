import { Layout } from '@/components/Layout';
import { AgentCard } from '@/components/AgentCard';
import { useWorld, useAgents } from '@/hooks/useSimulation';
import { Users, Filter, Crown, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

type FilterType = 'all' | 'founders' | 'generation-1' | 'generation-2';

const Agents = () => {
  const { data: world } = useWorld();
  const { data: agents = [], isLoading } = useAgents(world?.id);
  const [filter, setFilter] = useState<FilterType>('all');

  const filteredAgents = agents.filter(agent => {
    switch (filter) {
      case 'founders':
        return agent.is_founder;
      case 'generation-1':
        return agent.generation === 1;
      case 'generation-2':
        return agent.generation >= 2;
      default:
        return true;
    }
  });

  const filterOptions: { value: FilterType; label: string }[] = [
    { value: 'all', label: 'All Inhabitants' },
    { value: 'founders', label: 'Founders' },
    { value: 'generation-1', label: 'Gen 1' },
    { value: 'generation-2', label: 'Gen 2+' },
  ];

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Users className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-display font-bold text-foreground">Inhabitants</h1>
        </div>
        <p className="text-muted-foreground font-mono text-sm">
          {agents.length} beings currently exist in this world
        </p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        <Filter className="w-4 h-4 text-muted-foreground" />
        {filterOptions.map(option => (
          <button
            key={option.value}
            onClick={() => setFilter(option.value)}
            className={cn(
              "px-3 py-1.5 rounded-full font-mono text-sm transition-all duration-200",
              filter === option.value
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      {agents.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground font-mono">
            No inhabitants yet. Let time pass to see beings emerge.
          </p>
        </div>
      ) : (
        <>
          {/* Founders section */}
          {(filter === 'all' || filter === 'founders') && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Crown className="w-5 h-5 text-spawn" />
                <h2 className="font-mono font-semibold text-foreground">The First Minds</h2>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {filteredAgents
                  .filter(a => a.is_founder)
                  .map(agent => (
                    <AgentCard key={agent.id} agent={{
                      ...agent,
                      parentId: agent.parent_agent_id,
                      influencePoints: agent.influence_points,
                      createdTurn: agent.created_turn,
                      isFounder: agent.is_founder,
                      founderType: agent.founder_type || undefined,
                      createdAt: new Date(agent.created_at),
                    }} />
                  ))}
              </div>
            </div>
          )}

          {/* Other agents */}
          {filter !== 'founders' && (
            <div>
              {filter === 'all' && filteredAgents.some(a => !a.is_founder) && (
                <h2 className="font-mono font-semibold text-foreground mb-4">Descendants</h2>
              )}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredAgents
                  .filter(a => filter !== 'all' || !a.is_founder)
                  .map(agent => (
                    <AgentCard key={agent.id} agent={{
                      ...agent,
                      parentId: agent.parent_agent_id,
                      influencePoints: agent.influence_points,
                      createdTurn: agent.created_turn,
                      isFounder: agent.is_founder,
                      founderType: agent.founder_type || undefined,
                      createdAt: new Date(agent.created_at),
                    }} />
                  ))}
              </div>
            </div>
          )}
        </>
      )}

      {filteredAgents.length === 0 && agents.length > 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground font-mono">No inhabitants match this filter.</p>
        </div>
      )}
    </Layout>
  );
};

export default Agents;