import { cn } from '@/lib/utils';
import { Users, GitBranch, Landmark, ScrollText, Clock } from 'lucide-react';

interface WorldOverviewProps {
  population: number;
  lineages: number;
  artifacts: number;
  entriesRecorded: number;
  status: 'ACTIVE' | 'PAUSED' | 'ENDED';
  worldName: string;
  beliefs: string[];
}

export function WorldOverview({
  population,
  lineages,
  artifacts,
  entriesRecorded,
  status,
  worldName,
  beliefs,
}: WorldOverviewProps) {
  return (
    <div className="p-5 rounded-xl border border-primary/20 bg-card/30 backdrop-blur-sm glass-card">
      {/* World name & status */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="font-display text-lg font-semibold text-foreground tracking-wide">
            {worldName}
          </h2>
        </div>
        <div className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-full font-mono text-xs",
          status === 'ACTIVE' 
            ? 'bg-primary/10 text-primary border border-primary/30'
            : 'bg-secondary text-secondary-foreground border border-border'
        )}>
          {status === 'ACTIVE' && (
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
            </span>
          )}
          {status === 'ACTIVE' ? 'Exists' : status === 'PAUSED' ? 'Suspended' : 'Ended'}
        </div>
      </div>

      {/* What has emerged - no metrics that imply goals */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="p-3 rounded-lg bg-secondary/30">
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-4 h-4 text-primary" />
            <span className="text-xs font-mono text-muted-foreground">Minds</span>
          </div>
          <div className="text-2xl font-display font-bold text-primary">
            {population}
          </div>
        </div>
        
        <div className="p-3 rounded-lg bg-secondary/30">
          <div className="flex items-center gap-2 mb-1">
            <GitBranch className="w-4 h-4 text-action" />
            <span className="text-xs font-mono text-muted-foreground">Origins</span>
          </div>
          <div className="text-2xl font-display font-bold text-action">
            {lineages}
          </div>
        </div>
        
        <div className="p-3 rounded-lg bg-secondary/30">
          <div className="flex items-center gap-2 mb-1">
            <Landmark className="w-4 h-4 text-spawn" />
            <span className="text-xs font-mono text-muted-foreground">Named</span>
          </div>
          <div className="text-2xl font-display font-bold text-spawn">
            {artifacts}
          </div>
        </div>
        
        <div className="p-3 rounded-lg bg-secondary/30">
          <div className="flex items-center gap-2 mb-1">
            <ScrollText className="w-4 h-4 text-speech" />
            <span className="text-xs font-mono text-muted-foreground">Moments</span>
          </div>
          <div className="text-2xl font-display font-bold text-speech">
            {entriesRecorded}
          </div>
        </div>
      </div>

      {/* Emerged concepts - only if inhabitants have named them */}
      {beliefs.length > 0 && (
        <div>
          <h3 className="text-xs font-mono text-muted-foreground mb-2">What They Have Named</h3>
          <div className="flex flex-wrap gap-2">
            {beliefs.map(belief => (
              <span 
                key={belief}
                className="px-2 py-1 rounded text-xs font-mono bg-accent/50 text-accent-foreground border border-accent/30"
              >
                {belief}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Empty state message */}
      {population === 0 && (
        <div className="text-center py-4">
          <p className="text-xs font-mono text-muted-foreground italic">
            Nothing yet exists.
          </p>
        </div>
      )}
    </div>
  );
}
