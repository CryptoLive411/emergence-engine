import { Layout } from '@/components/Layout';
import { ArtifactCard } from '@/components/ArtifactCard';
import { useArtifacts, ARTIFACT_STATUS_CONFIG, Artifact } from '@/hooks/useWorldMemory';
import { useWorld } from '@/hooks/useSimulation';
import { Landmark, Filter, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

type FilterType = 'all' | Artifact['status'];

const Museum = () => {
  const { data: world } = useWorld();
  const { data: artifacts = [], isLoading } = useArtifacts(world?.id);
  const [filter, setFilter] = useState<FilterType>('all');
  
  const filteredArtifacts = filter === 'all' 
    ? artifacts 
    : artifacts.filter(a => a.status === filter);
  
  // Group artifacts by section for display
  const canonized = artifacts.filter(a => a.status === 'canonized');
  const mythic = artifacts.filter(a => a.status === 'mythic');
  const contested = artifacts.filter(a => a.status === 'contested');
  const emerging = artifacts.filter(a => a.status === 'emerging');
  const forgotten = artifacts.filter(a => a.status === 'forgotten');
  
  const filterOptions: { value: FilterType; label: string; count: number }[] = [
    { value: 'all', label: 'All', count: artifacts.length },
    { value: 'canonized', label: 'Canonized', count: canonized.length },
    { value: 'mythic', label: 'Mythic', count: mythic.length },
    { value: 'contested', label: 'Contested', count: contested.length },
    { value: 'emerging', label: 'Emerging', count: emerging.length },
    { value: 'forgotten', label: 'Forgotten', count: forgotten.length },
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
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-2">
          <Landmark className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-display font-bold text-foreground tracking-wide">
            The Museum
          </h1>
        </div>
        <p className="text-muted-foreground font-mono max-w-xl mx-auto">
          A place outside time. Read-only. Permanent. Cumulative. 
          Only artifacts discovered or created by inhabitants may enter.
        </p>
      </div>
      
      {artifacts.length === 0 ? (
        <div className="text-center py-16">
          <Landmark className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground font-mono mb-2">
            The museum is empty.
          </p>
          <p className="text-sm text-muted-foreground/70 max-w-md mx-auto">
            Artifacts are born when inhabitants name something sacred, establish a doctrine,
            or declare something must be remembered. The world decides what is worth preserving.
          </p>
        </div>
      ) : (
        <>
          {/* Filters */}
          <div className="flex items-center gap-2 mb-6 flex-wrap">
            <Filter className="w-4 h-4 text-muted-foreground" />
            {filterOptions.filter(o => o.count > 0 || o.value === 'all').map(option => (
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
                <span className="ml-1.5 text-xs opacity-70">({option.count})</span>
              </button>
            ))}
          </div>
          
          {/* Filtered view */}
          {filter !== 'all' ? (
            <div className="grid md:grid-cols-2 gap-4">
              {filteredArtifacts.map(artifact => (
                <ArtifactCard key={artifact.id} artifact={artifact} />
              ))}
            </div>
          ) : (
            /* Sectioned view */
            <div className="space-y-8">
              {/* Canonized - Most prominent */}
              {canonized.length > 0 && (
                <section>
                  <h2 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
                    <span className="text-primary">●</span>
                    Canonized Truths
                    <span className="text-xs text-muted-foreground font-mono font-normal">
                      — Widely accepted as foundational
                    </span>
                  </h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    {canonized.map(artifact => (
                      <ArtifactCard key={artifact.id} artifact={artifact} />
                    ))}
                  </div>
                </section>
              )}
              
              {/* Mythic */}
              {mythic.length > 0 && (
                <section>
                  <h2 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
                    <span className="text-spawn">●</span>
                    Mythic Relics
                    <span className="text-xs text-muted-foreground font-mono font-normal">
                      — Remembered, but no longer practiced
                    </span>
                  </h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    {mythic.map(artifact => (
                      <ArtifactCard key={artifact.id} artifact={artifact} />
                    ))}
                  </div>
                </section>
              )}
              
              {/* Contested */}
              {contested.length > 0 && (
                <section>
                  <h2 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
                    <span className="text-action">●</span>
                    Contested Doctrines
                    <span className="text-xs text-muted-foreground font-mono font-normal">
                      — Referenced and challenged
                    </span>
                  </h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    {contested.map(artifact => (
                      <ArtifactCard key={artifact.id} artifact={artifact} />
                    ))}
                  </div>
                </section>
              )}
              
              {/* Emerging */}
              {emerging.length > 0 && (
                <section>
                  <h2 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
                    <span className="text-spawn">●</span>
                    Emerging Constructs
                    <span className="text-xs text-muted-foreground font-mono font-normal">
                      — Newly named, still fragile
                    </span>
                  </h2>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {emerging.map(artifact => (
                      <ArtifactCard key={artifact.id} artifact={artifact} compact />
                    ))}
                  </div>
                </section>
              )}
              
              {/* Forgotten */}
              {forgotten.length > 0 && (
                <section>
                  <h2 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
                    <span className="text-muted-foreground">●</span>
                    Forgotten Echoes
                    <span className="text-xs text-muted-foreground font-mono font-normal">
                      — No longer referenced
                    </span>
                  </h2>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 opacity-60">
                    {forgotten.map(artifact => (
                      <ArtifactCard key={artifact.id} artifact={artifact} compact />
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </>
      )}
    </Layout>
  );
};

export default Museum;
