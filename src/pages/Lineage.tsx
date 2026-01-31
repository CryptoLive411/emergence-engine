import { Layout } from '@/components/Layout';
import { LineageTree } from '@/components/LineageTree';
import { useWorld, useAgents, useLineageTree } from '@/hooks/useSimulation';
import { GitBranch, Info, Loader2 } from 'lucide-react';

const Lineage = () => {
  const { data: world } = useWorld();
  const { data: agents = [], isLoading } = useAgents(world?.id);
  const tree = useLineageTree(agents);

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
          <GitBranch className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-display font-bold text-foreground">Lineage Tree</h1>
        </div>
        <p className="text-muted-foreground font-mono text-sm">
          Trace the bloodlines from the original founders
        </p>
      </div>

      {/* Legend */}
      <div className="mb-6 p-4 rounded-lg border border-border bg-card/50">
        <div className="flex items-center gap-2 mb-3">
          <Info className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-mono text-muted-foreground">Legend</span>
        </div>
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-founder-a/20 border border-founder-a/50" />
            <span className="font-mono text-muted-foreground">ALPHA Lineage (Order)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-founder-b/20 border border-founder-b/50" />
            <span className="font-mono text-muted-foreground">BETA Lineage (Chaos)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-secondary border border-border" />
            <span className="font-mono text-muted-foreground">Descendants</span>
          </div>
        </div>
      </div>

      {/* Tree */}
      <div className="p-6 rounded-lg border border-border bg-card/50">
        {agents.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground font-mono">
              No inhabitants yet. The world awaits its first souls.
            </p>
          </div>
        ) : (
          <LineageTree tree={tree} />
        )}
      </div>
    </Layout>
  );
};

export default Lineage;