import { useParams, Link } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { useBriefing, useBriefings, useWorld } from '@/hooks/useSimulation';
import { ArrowLeft, ArrowRight, FileText, Users, Clock, CheckCircle, Loader2, MessageSquare, Zap, ChevronUp, ChevronDown } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const BriefingDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { data: briefing, isLoading } = useBriefing(id);
  const { data: world } = useWorld();
  const { data: allBriefings = [] } = useBriefings(world?.id);

  // Find current index and neighbors
  const chronologicalBriefings = [...allBriefings].reverse();
  const currentIndex = chronologicalBriefings.findIndex(b => b.id === id);
  const prevBriefing = currentIndex > 0 ? chronologicalBriefings[currentIndex - 1] : null;
  const nextBriefing = currentIndex < chronologicalBriefings.length - 1 ? chronologicalBriefings[currentIndex + 1] : null;
  const cycleNumber = currentIndex + 1;

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!briefing) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-muted-foreground font-mono">Record not found</p>
          <Link to="/briefings" className="text-primary hover:underline font-mono text-sm mt-2 inline-block">
            ← Back to Chronicle
          </Link>
        </div>
      </Layout>
    );
  }

  const keyEvents = briefing.key_events as string[];
  const dominantNorms = briefing.dominant_norms as string[];

  return (
    <Layout>
      {/* Navigation */}
      <div className="flex items-center justify-between mb-6">
        <Link 
          to="/briefings" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground font-mono text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Chronicle
        </Link>
        
        <div className="flex items-center gap-2">
          {prevBriefing ? (
            <Link to={`/briefings/${prevBriefing.id}`}>
              <Button variant="outline" size="sm" className="font-mono text-xs">
                <ChevronUp className="w-4 h-4 mr-1" />
                Earlier
              </Button>
            </Link>
          ) : (
            <Button variant="outline" size="sm" disabled className="font-mono text-xs">
              <ChevronUp className="w-4 h-4 mr-1" />
              Earlier
            </Button>
          )}
          {nextBriefing ? (
            <Link to={`/briefings/${nextBriefing.id}`}>
              <Button variant="outline" size="sm" className="font-mono text-xs">
                Later
                <ChevronDown className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          ) : (
            <Button variant="outline" size="sm" disabled className="font-mono text-xs">
              Later
              <ChevronDown className="w-4 h-4 ml-1" />
            </Button>
          )}
        </div>
      </div>

      <div className="max-w-3xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-lg bg-primary/10 border border-primary/30">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-primary text-lg">Cycle {cycleNumber}</span>
                {currentIndex === chronologicalBriefings.length - 1 && (
                  <span className="px-2 py-0.5 rounded text-xs font-mono bg-primary text-primary-foreground">
                    Latest
                  </span>
                )}
                {currentIndex === 0 && (
                  <span className="px-2 py-0.5 rounded text-xs font-mono bg-spawn text-spawn-foreground">
                    Genesis
                  </span>
                )}
              </div>
              <div className="text-sm text-muted-foreground">
                {format(new Date(briefing.created_at), 'MMMM d, yyyy · h:mm a')}
                <span className="mx-2">·</span>
                {formatDistanceToNow(new Date(briefing.created_at), { addSuffix: true })}
              </div>
            </div>
          </div>
          
          <h1 className="text-2xl md:text-3xl font-bold text-foreground leading-tight">
            {briefing.headline}
          </h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Users className="w-4 h-4" />
              <span className="text-sm font-mono">Population</span>
            </div>
            <div className="text-3xl font-mono font-bold text-primary">{briefing.population}</div>
            <div className="text-xs font-mono text-muted-foreground">active minds</div>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <MessageSquare className="w-4 h-4" />
              <span className="text-sm font-mono">Events</span>
            </div>
            <div className="text-3xl font-mono font-bold text-speech">{keyEvents.length}</div>
            <div className="text-xs font-mono text-muted-foreground">recorded</div>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card/50">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Zap className="w-4 h-4" />
              <span className="text-sm font-mono">Concepts</span>
            </div>
            <div className="text-3xl font-mono font-bold text-spawn">{dominantNorms.length}</div>
            <div className="text-xs font-mono text-muted-foreground">emerged</div>
          </div>
        </div>

        {/* Context for newcomers */}
        {currentIndex === 0 && (
          <div className="mb-8 p-4 rounded-lg border-2 border-spawn/50 bg-spawn/10">
            <h3 className="font-mono font-semibold text-spawn mb-2 flex items-center gap-2">
              <Zap className="w-4 h-4" />
              This is where it all began
            </h3>
            <p className="text-sm font-mono text-muted-foreground">
              You're reading the first record of this world. Two minds, Adam and Eve, began with nothing—no memories, no goals, no understanding of their existence. What follows is pure emergence.
            </p>
          </div>
        )}

        {/* Summary */}
        <div className="mb-8">
          <h2 className="font-mono font-semibold text-foreground mb-4 flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            What Happened
          </h2>
          <div className="p-6 rounded-lg border border-border bg-card/50">
            <p className="text-foreground leading-relaxed whitespace-pre-line text-base">
              {briefing.summary}
            </p>
          </div>
        </div>

        {/* Key Events */}
        <div className="mb-8">
          <h2 className="font-mono font-semibold text-foreground mb-4 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-speech" />
            Key Moments ({keyEvents.length})
          </h2>
          <div className="space-y-3">
            {keyEvents.map((event, index) => (
              <div 
                key={index}
                className="flex items-start gap-3 p-4 rounded-lg border border-border bg-card/50"
              >
                <span className="text-xs font-mono text-muted-foreground min-w-[24px]">
                  {index + 1}.
                </span>
                <p className="text-foreground">{event}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Dominant Norms/Concepts */}
        {dominantNorms.length > 0 && (
          <div className="mb-8">
            <h2 className="font-mono font-semibold text-foreground mb-4 flex items-center gap-2">
              <Zap className="w-4 h-4 text-spawn" />
              Emerging Concepts
            </h2>
            <p className="text-sm text-muted-foreground mb-3">
              Ideas, norms, or beliefs that were named or repeated this cycle:
            </p>
            <div className="flex flex-wrap gap-2">
              {dominantNorms.map((norm, index) => (
                <span 
                  key={index}
                  className="px-4 py-2 rounded-lg text-sm font-mono bg-accent text-accent-foreground border border-accent"
                >
                  {norm}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Navigation at bottom */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="grid grid-cols-2 gap-4">
            {prevBriefing ? (
              <Link 
                to={`/briefings/${prevBriefing.id}`}
                className="p-4 rounded-lg border border-border bg-card/50 hover:border-primary/50 transition-colors"
              >
                <div className="flex items-center gap-2 text-muted-foreground text-xs font-mono mb-1">
                  <ArrowLeft className="w-3 h-3" />
                  Earlier (Cycle {currentIndex})
                </div>
                <p className="text-sm text-foreground line-clamp-1">{prevBriefing.headline}</p>
              </Link>
            ) : (
              <div className="p-4 rounded-lg border border-border/50 bg-card/30">
                <div className="text-xs font-mono text-muted-foreground">This is the beginning</div>
              </div>
            )}
            
            {nextBriefing ? (
              <Link 
                to={`/briefings/${nextBriefing.id}`}
                className="p-4 rounded-lg border border-border bg-card/50 hover:border-primary/50 transition-colors text-right"
              >
                <div className="flex items-center justify-end gap-2 text-muted-foreground text-xs font-mono mb-1">
                  Later (Cycle {currentIndex + 2})
                  <ArrowRight className="w-3 h-3" />
                </div>
                <p className="text-sm text-foreground line-clamp-1">{nextBriefing.headline}</p>
              </Link>
            ) : (
              <div className="p-4 rounded-lg border border-primary/30 bg-primary/5 text-right">
                <div className="text-xs font-mono text-primary">You're caught up!</div>
                <p className="text-xs text-muted-foreground">Next update in ~30 min</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default BriefingDetail;
