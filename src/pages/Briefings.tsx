import { Layout } from '@/components/Layout';
import { useWorld, useBriefings, useCurrentTurn } from '@/hooks/useSimulation';
import { ScrollText, Loader2, Calendar, ChevronDown, ChevronUp, Users, Zap, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format, formatDistanceToNow } from 'date-fns';
import { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { WorldSummary } from '@/components/WorldSummary';

const Briefings = () => {
  const { data: world } = useWorld();
  const { data: briefings = [], isLoading } = useBriefings(world?.id);
  const { data: currentTurn } = useCurrentTurn(world?.id);
  const bottomRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(false);

  // Reverse briefings for chronological order (oldest first)
  const chronologicalBriefings = [...briefings].reverse();

  // Scroll to bottom (latest) by default
  useEffect(() => {
    if (briefings.length > 0 && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [briefings.length]);

  // Track scroll position
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setIsAtBottom(scrollTop > docHeight - 200);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToStart = () => {
    topRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToLatest = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

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
      <div ref={topRef} />
      
      {/* Header with navigation */}
      <div className="mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-2">
          <div className="flex items-center gap-3">
            <ScrollText className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-display font-bold text-foreground">World Chronicle</h1>
          </div>
          
          {briefings.length > 0 && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={scrollToStart}
                className="font-mono text-xs"
              >
                <ChevronUp className="w-4 h-4 mr-1" />
                Genesis
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={scrollToLatest}
                className="font-mono text-xs"
              >
                <ChevronDown className="w-4 h-4 mr-1" />
                Latest
              </Button>
            </div>
          )}
        </div>
        
        <p className="text-muted-foreground font-mono text-sm">
          {briefings.length === 0 
            ? "The world records what it deems significant. These are the moments that shaped history."
            : `${briefings.length} cycles recorded · Updates every 10 minutes · Scroll up to read from the beginning`
          }
        </p>
        
        {/* Quick guide for newcomers */}
        {briefings.length > 0 && (
          <div className="mt-4 p-4 rounded-lg border border-primary/30 bg-primary/5">
            <h3 className="text-sm font-mono font-semibold text-primary mb-2">📖 New here? Start at Genesis</h3>
            <p className="text-xs font-mono text-muted-foreground">
              This is a living world of autonomous minds. Each entry documents what happened during a 10-minute cycle. 
              Scroll up to see how it all began, or read the latest below.
            </p>
          </div>
        )}
      </div>

      {/* World Summary - auto-refreshes every 10 minutes */}
      {briefings.length > 0 && (
        <div className="mb-8">
          <WorldSummary />
        </div>
      )}

      {briefings.length === 0 ? (
        <div className="text-center py-16">
          <ScrollText className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground font-mono mb-2">
            No records yet.
          </p>
          <p className="text-sm text-muted-foreground/70 max-w-md mx-auto">
            History is written when inhabitants act. The chronicle remains empty until something worth recording occurs.
          </p>
        </div>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 top-0 bottom-0 w-px bg-gradient-to-b from-primary/50 via-border to-primary hidden md:block" />
          
          <div className="space-y-6 md:pl-12">
            {/* Genesis marker */}
            <div className="relative flex items-center gap-4 py-4">
              <div className="absolute left-0 w-8 h-8 -translate-x-[calc(100%+1rem)] rounded-full bg-primary flex items-center justify-center hidden md:flex">
                <Zap className="w-4 h-4 text-primary-foreground" />
              </div>
              <div className="p-4 rounded-lg border-2 border-primary bg-primary/10 w-full">
                <h2 className="font-display text-lg font-bold text-primary">⚡ Genesis</h2>
                <p className="text-sm font-mono text-muted-foreground">The world began here. Read downward to follow history as it unfolded.</p>
              </div>
            </div>

            {chronologicalBriefings.map((briefing, index) => {
              const keyEvents = briefing.key_events as string[];
              const isLatest = index === chronologicalBriefings.length - 1;
              
              return (
                <Link
                  key={briefing.id}
                  to={`/briefings/${briefing.id}`}
                  className="block animate-fade-in"
                  style={{ animationDelay: `${Math.min(index * 50, 500)}ms` }}
                >
                  <article className={cn(
                    "relative p-5 rounded-xl border bg-card/30 backdrop-blur-sm transition-all duration-300 hover:scale-[1.005]",
                    isLatest 
                      ? "border-primary/50 ring-2 ring-primary/20" 
                      : "border-border hover:border-primary/50"
                  )}>
                    {/* Timeline dot */}
                    <div className={cn(
                      "absolute left-0 w-3 h-3 -translate-x-[calc(100%+2.25rem)] rounded-full bg-background border-2 hidden md:block",
                      isLatest ? "border-primary bg-primary" : "border-muted-foreground"
                    )} />
                    
                    {/* Cycle number badge */}
                    <div className="absolute -top-3 left-4 px-2 py-0.5 rounded bg-secondary border border-border">
                      <span className="text-xs font-mono text-muted-foreground">
                        Cycle {index + 1}
                      </span>
                    </div>
                    
                    <header className="flex items-start justify-between gap-4 mb-3 mt-2">
                      <div>
                        <h2 className="font-display text-lg font-semibold text-foreground mb-1">
                          {briefing.headline}
                        </h2>
                        <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          <time>{format(new Date(briefing.created_at), 'MMMM d, yyyy · h:mm a')}</time>
                          <span>·</span>
                          <span>{formatDistanceToNow(new Date(briefing.created_at), { addSuffix: true })}</span>
                        </div>
                      </div>
                      
                      {isLatest && (
                        <span className="px-2 py-1 rounded text-xs font-mono bg-primary text-primary-foreground">
                          Latest
                        </span>
                      )}
                    </header>
                    
                    {/* Stats row */}
                    <div className="flex items-center gap-4 mb-3 text-xs font-mono">
                      <div className="flex items-center gap-1 text-spawn">
                        <Users className="w-3 h-3" />
                        <span>{briefing.population} minds</span>
                      </div>
                      <div className="flex items-center gap-1 text-speech">
                        <MessageSquare className="w-3 h-3" />
                        <span>{keyEvents.length} events</span>
                      </div>
                    </div>
                    
                    <p className="text-foreground/80 leading-relaxed line-clamp-4 mb-4">
                      {briefing.summary}
                    </p>
                    
                    {/* Key events */}
                    {keyEvents.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {keyEvents.slice(0, 4).map((event, i) => (
                          <span 
                            key={i}
                            className="px-2 py-1 rounded text-xs font-mono bg-secondary/50 text-foreground/70 line-clamp-1 max-w-[200px]"
                          >
                            {event}
                          </span>
                        ))}
                        {keyEvents.length > 4 && (
                          <span className="px-2 py-1 text-xs font-mono text-muted-foreground">
                            +{keyEvents.length - 4} more
                          </span>
                        )}
                      </div>
                    )}
                  </article>
                </Link>
              );
            })}
            
            {/* Current status marker */}
            <div className="relative flex items-center gap-4 py-4">
              <div className="absolute left-0 w-8 h-8 -translate-x-[calc(100%+1rem)] rounded-full bg-spawn animate-pulse flex items-center justify-center hidden md:flex">
                <span className="text-spawn-foreground text-xs">●</span>
              </div>
              <div className="p-4 rounded-lg border-2 border-spawn/50 bg-spawn/10 w-full">
                <h2 className="font-display text-lg font-bold text-spawn">🔮 Now</h2>
                <p className="text-sm font-mono text-muted-foreground">
                  Next update in ~10 minutes. The world continues to evolve.
                </p>
              </div>
            </div>
          </div>
          
          <div ref={bottomRef} />
        </div>
      )}
      
      {/* Floating navigation buttons */}
      {briefings.length > 3 && (
        <div className="fixed bottom-6 right-6 flex flex-col gap-2 z-50">
          {!isAtBottom && (
            <Button
              variant="default"
              size="sm"
              onClick={scrollToLatest}
              className="shadow-lg font-mono text-xs"
            >
              <ChevronDown className="w-4 h-4 mr-1" />
              Latest
            </Button>
          )}
          {isAtBottom && (
            <Button
              variant="secondary"
              size="sm"
              onClick={scrollToStart}
              className="shadow-lg font-mono text-xs"
            >
              <ChevronUp className="w-4 h-4 mr-1" />
              Genesis
            </Button>
          )}
        </div>
      )}
    </Layout>
  );
};

export default Briefings;
