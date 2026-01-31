import { Layout } from '@/components/Layout';
import { useWorld, useAgents, useEvents } from '@/hooks/useSimulation';
import { useArtifacts, useEras } from '@/hooks/useWorldMemory';
import { 
  Radio, 
  Loader2,
  ScrollText,
  Users,
  Landmark,
  Calendar,
  MessageSquare,
  Dna,
  Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatDistanceToNow, format } from 'date-fns';

const Analytics = () => {
  const { data: world, isLoading: worldLoading } = useWorld();
  const { data: agents = [] } = useAgents(world?.id);
  const { data: events = [] } = useEvents(world?.id, 200);
  const { data: artifacts = [] } = useArtifacts(world?.id);
  const { data: eras = [] } = useEras(world?.id);

  if (worldLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!world) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <Radio className="w-16 h-16 text-muted-foreground/30 mb-4" />
          <h1 className="text-2xl font-display font-bold text-foreground mb-2">No World Exists</h1>
          <p className="text-muted-foreground font-mono mb-6">
            There is nothing to observe.
          </p>
          <Link to="/">
            <Button className="font-mono">Return to Chronicle</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  // Categorize events by type
  const speechEvents = events.filter(e => e.type === 'SPEECH');
  const actionEvents = events.filter(e => e.type === 'ACTION');
  const spawnEvents = events.filter(e => e.type === 'SPAWN');
  
  // Get unique beliefs/norms mentioned
  const mentionedConcepts = new Set<string>();
  events.forEach(e => {
    const metadata = e.metadata as Record<string, any>;
    if (metadata?.normType) mentionedConcepts.add(metadata.normType);
    if (metadata?.belief) mentionedConcepts.add(metadata.belief);
  });

  // Calculate generations
  const generations = new Set(agents.map(a => a.generation));
  const maxGeneration = Math.max(...Array.from(generations), 0);

  // Calculate time since creation
  const worldAge = formatDistanceToNow(new Date(world.created_at));

  // Get founders
  const founders = agents.filter(a => a.is_founder);

  return (
    <Layout>
      {/* Header */}
      <div className="mb-8 text-center max-w-2xl mx-auto">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Radio className="w-6 h-6 text-primary" />
          <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">
            World Signals
          </h1>
        </div>
        <p className="text-muted-foreground font-mono text-sm">
          A record of what has emerged. Nothing is interpreted. Nothing is predicted.
        </p>
      </div>

      {/* World Status */}
      <div className="p-6 rounded-xl border border-primary/20 bg-primary/5 mb-8 max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className={cn(
              "w-2 h-2 rounded-full",
              world.status === 'ACTIVE' ? "bg-primary animate-pulse" : "bg-muted-foreground"
            )} />
            <span className="text-sm font-mono text-muted-foreground">
              {world.status === 'ACTIVE' ? 'Time is passing' : 'Time is suspended'}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>Age: {worldAge}</span>
          </div>
        </div>
        
        <div className="text-center">
          <p className="text-sm font-mono text-foreground/80">
            Created {format(new Date(world.created_at), 'MMMM d, yyyy')} at {format(new Date(world.created_at), 'h:mm a')}
          </p>
        </div>
      </div>

      {/* What Exists */}
      <div className="mb-8">
        <h2 className="text-lg font-display font-semibold text-foreground mb-4 text-center">What Exists</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
          <div className="glass-card p-4 rounded-xl text-center">
            <Users className="w-5 h-5 text-primary mx-auto mb-2" />
            <div className="text-2xl font-mono font-bold text-foreground">{agents.length}</div>
            <div className="text-xs font-mono text-muted-foreground">
              {agents.length === 1 ? 'Mind' : 'Minds'}
            </div>
          </div>
          
          <div className="glass-card p-4 rounded-xl text-center">
            <Dna className="w-5 h-5 text-action mx-auto mb-2" />
            <div className="text-2xl font-mono font-bold text-foreground">{maxGeneration + 1}</div>
            <div className="text-xs font-mono text-muted-foreground">
              {maxGeneration === 0 ? 'Generation' : 'Generations'}
            </div>
          </div>
          
          <div className="glass-card p-4 rounded-xl text-center">
            <Landmark className="w-5 h-5 text-spawn mx-auto mb-2" />
            <div className="text-2xl font-mono font-bold text-foreground">{artifacts.length}</div>
            <div className="text-xs font-mono text-muted-foreground">
              {artifacts.length === 1 ? 'Artifact' : 'Artifacts'}
            </div>
          </div>
          
          <div className="glass-card p-4 rounded-xl text-center">
            <Calendar className="w-5 h-5 text-speech mx-auto mb-2" />
            <div className="text-2xl font-mono font-bold text-foreground">{eras.length || 1}</div>
            <div className="text-xs font-mono text-muted-foreground">
              {eras.length <= 1 ? 'Era' : 'Eras'}
            </div>
          </div>
        </div>
      </div>

      {/* The Minds */}
      {agents.length > 0 && (
        <div className="mb-8 max-w-3xl mx-auto">
          <h2 className="text-lg font-display font-semibold text-foreground mb-4 text-center">The Minds</h2>
          
          <div className="glass-card p-6 rounded-xl">
            <div className="space-y-4">
              {agents.map(agent => (
                <div 
                  key={agent.id} 
                  className="flex items-center justify-between p-3 rounded-lg bg-secondary/20 border border-border/50"
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono font-bold",
                      agent.is_founder 
                        ? agent.founder_type === 'A' 
                          ? "bg-founder-a/20 text-founder-a border border-founder-a/30"
                          : "bg-founder-b/20 text-founder-b border border-founder-b/30"
                        : "bg-secondary text-muted-foreground border border-border"
                    )}>
                      {agent.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-mono text-sm font-medium text-foreground">{agent.name}</div>
                      <div className="text-xs font-mono text-muted-foreground">
                        {agent.is_founder ? 'Original mind' : `Generation ${agent.generation}`}
                      </div>
                    </div>
                  </div>
                  <div className={cn(
                    "text-xs font-mono",
                    agent.status === 'ACTIVE' ? "text-primary" : "text-muted-foreground"
                  )}>
                    {agent.status === 'ACTIVE' ? 'exists' : 'faded'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* What Has Been Recorded */}
      <div className="mb-8 max-w-3xl mx-auto">
        <h2 className="text-lg font-display font-semibold text-foreground mb-4 text-center">What Has Been Recorded</h2>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="glass-card p-4 rounded-xl text-center">
            <MessageSquare className="w-5 h-5 text-speech mx-auto mb-2" />
            <div className="text-2xl font-mono font-bold text-foreground">{speechEvents.length}</div>
            <div className="text-xs font-mono text-muted-foreground">Communications</div>
          </div>
          
          <div className="glass-card p-4 rounded-xl text-center">
            <ScrollText className="w-5 h-5 text-action mx-auto mb-2" />
            <div className="text-2xl font-mono font-bold text-foreground">{actionEvents.length}</div>
            <div className="text-xs font-mono text-muted-foreground">Actions</div>
          </div>
          
          <div className="glass-card p-4 rounded-xl text-center">
            <Dna className="w-5 h-5 text-spawn mx-auto mb-2" />
            <div className="text-2xl font-mono font-bold text-foreground">{spawnEvents.length}</div>
            <div className="text-xs font-mono text-muted-foreground">Creations</div>
          </div>
        </div>

        {events.length === 0 && (
          <div className="mt-6 text-center">
            <p className="text-sm font-mono text-muted-foreground italic">
              Nothing has been recorded.
            </p>
            <p className="text-xs font-mono text-muted-foreground/60 mt-1">
              Silence is allowed. Nothing must happen.
            </p>
          </div>
        )}
      </div>

      {/* Emerged Concepts */}
      {mentionedConcepts.size > 0 && (
        <div className="mb-8 max-w-3xl mx-auto">
          <h2 className="text-lg font-display font-semibold text-foreground mb-4 text-center">Emerged Concepts</h2>
          
          <div className="glass-card p-6 rounded-xl">
            <p className="text-xs font-mono text-muted-foreground mb-4 text-center">
              These concepts were named by the inhabitants. They were not predefined.
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {Array.from(mentionedConcepts).map(concept => (
                <span 
                  key={concept}
                  className="px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-sm font-mono text-foreground"
                >
                  {concept}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Philosophy Reminder */}
      <div className="max-w-2xl mx-auto p-6 rounded-xl border border-border/50 bg-secondary/10">
        <p className="text-sm font-serif italic text-muted-foreground text-center leading-relaxed">
          "Nothing exists unless an inhabitant causes it to exist. No event is recorded unless an inhabitant's actions give it meaning."
        </p>
      </div>
    </Layout>
  );
};

export default Analytics;
