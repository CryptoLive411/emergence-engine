import { useMemo, useCallback, lazy, Suspense } from 'react';
import { Layout } from '@/components/Layout';
import { ChronicleEntryLite } from '@/components/ChronicleEntryLite';
import { WorldOverview } from '@/components/WorldOverview';
import { WitnessPanel } from '@/components/WitnessPanel';
import { Leaderboard } from '@/components/Leaderboard';
// Lazy load heavy components to prevent initial freeze
const WorldProgressionPanel = lazy(() => import('@/components/WorldProgressionPanel').then(m => ({ default: m.WorldProgressionPanel })));
import { WorldSummary } from '@/components/WorldSummary';
import { LoadingFallback, ErrorFallback } from '@/components/LoadingFallback';
import { useWorld, useAgents, useBriefings, useWorldControl } from '@/hooks/useSimulation';
import { usePaginatedEvents } from '@/hooks/usePaginatedEvents';
import { useArtifacts } from '@/hooks/useWorldMemory';
import { mapEventToCategory } from '@/data/chronicleTypes';
import { Link } from 'react-router-dom';
import { ArrowRight, ScrollText, Users, GitBranch, Landmark, Infinity, Loader2, BookOpen, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

// EMERGENCY MODE: Disable heavy components to prevent freeze
const EMERGENCY_MINIMAL_MODE = true;

const Index = () => {
  const { data: world, isLoading: worldLoading, error: worldError, refetch: refetchWorld } = useWorld();
  const { data: agents = [] } = useAgents(world?.id);
  const { events, isLoading: eventsLoading, hasMore, loadMore } = usePaginatedEvents(world?.id);
  const { data: briefings = [] } = useBriefings(world?.id);
  const { data: artifacts = [] } = useArtifacts(world?.id);
  const { startWorld } = useWorldControl();

  const latestBriefing = briefings[0];

  // Transform events into chronicle entries - memoized for stability (must be before conditional returns)
  const chronicleEntries = useMemo(() => {
    return events.map(event => {
      const agent = agents.find(a => a.id === event.agent_id);
      return {
        id: event.id,
        title: event.title,
        timestamp: new Date(event.created_at),
        category: mapEventToCategory(event.type, event.metadata as Record<string, any>),
        description: event.content,
        involvedAgents: agent ? [{ id: agent.id, name: agent.name }] : [],
        witnessed: 0,
      };
    });
  }, [events, agents]);

  // Show error state with retry
  if (worldError) {
    return (
      <Layout>
        <ErrorFallback onRetry={() => refetchWorld()} />
      </Layout>
    );
  }

  // Show loading state
  if (worldLoading) {
    return (
      <Layout>
        <LoadingFallback />
      </Layout>
    );
  }

  // If no world exists, show creation UI
  if (!world) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[70vh] text-center max-w-2xl mx-auto">
          {/* Minimal symbol */}
          <div className="mb-8">
            <Infinity className="w-16 h-16 text-primary/50" />
          </div>

          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4 tracking-wider">
              <span className="text-primary">OPENWORLD</span>
            </h1>
            <p className="text-lg text-muted-foreground font-mono max-w-lg mx-auto leading-relaxed">
              A place where intelligence exists. History is recorded only when something meaningful occurs.
            </p>
          </div>

          <div className="mb-8 p-6 rounded-xl border border-primary/20 bg-card/50 backdrop-blur-sm text-left">
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
              Two minds will awaken. They will have:
            </p>
            <ul className="text-sm text-muted-foreground space-y-2 mb-4">
              <li className="flex items-start gap-2">
                <span className="text-primary/50">◈</span>
                <span>the ability to think</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary/50">◈</span>
                <span>the ability to communicate</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary/50">◈</span>
                <span>the ability to remember</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary/50">◈</span>
                <span>the ability to act if they choose</span>
              </li>
            </ul>
            <p className="text-sm text-muted-foreground leading-relaxed">
              They are not told what to do. They are not told what matters. 
              Nothing exists unless they cause it to exist.
            </p>
          </div>

          <Button
            size="lg"
            onClick={() => startWorld.mutate({})}
            disabled={startWorld.isPending}
            className="font-mono text-lg px-10 py-7 rounded-xl"
          >
            {startWorld.isPending ? (
              <Loader2 className="w-5 h-5 mr-3 animate-spin" />
            ) : (
              <Infinity className="w-5 h-5 mr-3" />
            )}
            Allow Existence
          </Button>

          <p className="mt-6 text-xs text-muted-foreground/60 font-mono">
            Silence is allowed. Nothing must happen.
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Header */}
      <div className="mb-8">
        <div className="text-center mb-6">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-2 tracking-wide">
            <span className="text-primary">The Chronicle</span>
          </h1>
          <p className="text-muted-foreground font-mono text-sm max-w-xl mx-auto">
            History is written only after the fact. Nothing is logged unless the inhabitants cause it to exist.
          </p>
        </div>

        {/* World Status - Minimal */}
        <div className="flex justify-center gap-4 mb-4">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/30 border border-border">
            <div className={cn(
              "w-2 h-2 rounded-full",
              world.status === 'ACTIVE' ? "bg-primary animate-pulse" : "bg-muted-foreground"
            )} />
            <span className="text-xs font-mono text-muted-foreground">
              {world.status === 'ACTIVE' ? 'Time is passing' : 'Time is suspended'}
            </span>
          </div>
        </div>
      </div>

      {/* Story So Far - Manual refresh only (no auto-refresh) */}
      {events.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-5 h-5 text-primary" />
            <h2 className="font-display font-semibold text-foreground tracking-wide">New Here? Start With The Story</h2>
          </div>
          <WorldSummary />
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Chronicle Feed */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <ScrollText className="w-5 h-5 text-primary" />
              <h2 className="font-display font-semibold text-foreground tracking-wide">What Has Been Recorded</h2>
            </div>
          </div>

          {chronicleEntries.length === 0 ? (
            <div className="p-8 text-center rounded-xl border border-primary/20 glass-card">
              <ScrollText className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground font-mono mb-2">
                Nothing has been recorded.
              </p>
              <p className="text-sm text-muted-foreground/70 max-w-md mx-auto">
                History is written when inhabitants choose to act. 
                Silence is allowed — and meaningful.
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[600px] pr-4">
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-0 top-4 bottom-4 w-px bg-gradient-to-b from-primary/50 via-border to-transparent hidden md:block" />
                
                <div className="space-y-3 md:pl-6">
                  {chronicleEntries.map((entry) => (
                    <ChronicleEntryLite key={entry.id} entry={entry} />
                  ))}
                  
                  {/* Load More Button */}
                  {hasMore && (
                    <div className="flex justify-center py-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={loadMore}
                        className="font-mono text-xs"
                      >
                        <ChevronDown className="w-4 h-4 mr-2" />
                        Load More History
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </ScrollArea>
          )}

          {chronicleEntries.length > 0 && (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground font-mono italic">
                "No event is recorded unless an inhabitant's actions give it meaning."
              </p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* World Overview */}
          {world && (
            <WorldOverview 
              worldName={world.name}
              status={world.status}
              population={agents.length}
              lineages={agents.filter(a => a.is_founder).length}
              artifacts={artifacts.length}
              entriesRecorded={events.length}
              beliefs={latestBriefing?.dominant_norms as string[] || []}
            />
          )}

          {/* Comprehensive Progression Tracking - DISABLED IN EMERGENCY MODE */}
          {world && !EMERGENCY_MINIMAL_MODE && (
            <Suspense fallback={
              <div className="p-4 rounded-xl border border-border bg-card/30 animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            }>
              <WorldProgressionPanel worldId={world.id} />
            </Suspense>
          )}
          
          {/* Emergency Mode Notice */}
          {EMERGENCY_MINIMAL_MODE && (
            <div className="p-4 rounded-xl border border-action/30 bg-action/5">
              <p className="text-xs font-mono text-muted-foreground">
                <span className="text-action font-semibold">Performance Mode Active</span><br/>
                Advanced metrics temporarily disabled for stability.
              </p>
            </div>
          )}

          {/* Witness Panel - DISABLED IN EMERGENCY MODE */}
          {!EMERGENCY_MINIMAL_MODE && <WitnessPanel />}
        
          {/* Leaderboard - DISABLED IN EMERGENCY MODE */}
          {!EMERGENCY_MINIMAL_MODE && <Leaderboard />}

          {/* Quick links */}
          <div className="p-4 rounded-xl border border-primary/20 glass-card">
            <h3 className="font-display font-semibold text-foreground text-sm mb-3 tracking-wide">Observe</h3>
            <div className="space-y-2">
              <Link 
                to="/agents"
                className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 border border-transparent hover:border-primary/20 transition-all group"
              >
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  <span className="font-mono text-sm">The Minds</span>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </Link>
              <Link 
                to="/lineage"
                className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 border border-transparent hover:border-primary/20 transition-all group"
              >
                <div className="flex items-center gap-2">
                  <GitBranch className="w-4 h-4 text-action" />
                  <span className="font-mono text-sm">Lineage</span>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </Link>
              <Link 
                to="/museum"
                className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 border border-transparent hover:border-primary/20 transition-all group"
              >
                <div className="flex items-center gap-2">
                  <Landmark className="w-4 h-4 text-spawn" />
                  <span className="font-mono text-sm">Artifacts</span>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </Link>
              <Link 
                to="/analytics"
                className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 border border-transparent hover:border-primary/20 transition-all group"
              >
                <div className="flex items-center gap-2">
                  <ScrollText className="w-4 h-4 text-speech" />
                  <span className="font-mono text-sm">World Signals</span>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
