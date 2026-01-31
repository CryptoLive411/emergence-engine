import { useTier1Metrics, useTier3Metrics, useTier4Metrics, useTier5Metrics } from '@/hooks/useEmergenceMetrics';
import { useTurnBreakdown } from '@/hooks/useDetailedAnalytics';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { 
  Eye, 
  Users,
  Baby,
  Skull,
  BookMarked,
  AlertTriangle,
  Sparkles,
  MessageSquare,
  Shield,
  Zap,
  Clock,
  Target,
  Brain,
  GitBranch
} from 'lucide-react';

interface WorldProgressionPanelProps {
  worldId: string | undefined;
}

export function WorldProgressionPanel({ worldId }: WorldProgressionPanelProps) {
  const { data: tier1 } = useTier1Metrics(worldId);
  const { data: tier3 } = useTier3Metrics(worldId);
  const { data: tier4 } = useTier4Metrics(worldId);
  const { data: tier5 } = useTier5Metrics(worldId);
  const { data: turnBreakdown = [] } = useTurnBreakdown(worldId);

  if (!worldId) return null;

  const mostPersistent = tier3?.influential?.[0];
  const lineages = tier3?.lineagePersistence || [];
  const timeline = tier5?.timeline || [];
  const latestTurn = turnBreakdown[turnBreakdown.length - 1];

  // Calculate key observations (not progression notes - no framing of progress)
  const observations: { icon: typeof Eye; text: string; type: 'info' | 'success' | 'warning' | 'neutral' }[] = [];

  // Most referenced
  if (mostPersistent && mostPersistent.persistence > 0) {
    observations.push({
      icon: Eye,
      text: `${mostPersistent.name} is most referenced (${mostPersistent.mentions} mentions, ${mostPersistent.descendants} descendants)`,
      type: 'info'
    });
  }

  // Population observations
  if (tier1?.population) {
    if (tier1.population.change > 0) {
      observations.push({
        icon: Baby,
        text: `${tier1.population.change} new mind${tier1.population.change > 1 ? 's' : ''} appeared. Population: ${tier1.population.total}`,
        type: 'success'
      });
    } else if (tier1.population.change < 0) {
      observations.push({
        icon: Skull,
        text: `${Math.abs(tier1.population.change)} mind${Math.abs(tier1.population.change) > 1 ? 's' : ''} fell silent. Population: ${tier1.population.total}`,
        type: 'neutral'
      });
    }
  }

  // Lineage observations
  if (lineages.length >= 2) {
    const diff = Math.abs(lineages[0].persistenceShare - lineages[1].persistenceShare);
    if (diff > 30) {
      const dominant = lineages[0].persistenceShare > lineages[1].persistenceShare 
        ? lineages[0] : lineages[1];
      observations.push({
        icon: GitBranch,
        text: `${dominant.founder}'s lineage persists more strongly (${Math.round(dominant.persistenceShare)}% of references)`,
        type: 'info'
      });
    }
  }

  // Generation depth
  if (tier1?.generation && tier1.generation.highest > 1) {
    observations.push({
      icon: Users,
      text: `${tier1.generation.highest} generations have existed`,
      type: 'neutral'
    });
  }

  // Latest activity
  if (latestTurn) {
    if (latestTurn.spawns > 0) {
      observations.push({
        icon: Sparkles,
        text: `${latestTurn.spawns} new mind${latestTurn.spawns > 1 ? 's' : ''} were brought forth`,
        type: 'success'
      });
    }
    if (latestTurn.speeches > 0) {
      observations.push({
        icon: MessageSquare,
        text: `${latestTurn.speeches} utterance${latestTurn.speeches > 1 ? 's' : ''} were recorded`,
        type: 'info'
      });
    }
  }

  return (
    <div className="space-y-4">
      {/* What Persists - replaces "Leadership" */}
      <div className="p-4 rounded-xl border border-primary/30 bg-gradient-to-br from-primary/10 to-transparent">
        <div className="flex items-center gap-2 mb-3">
          <Eye className="w-5 h-5 text-primary" />
          <h3 className="font-display font-semibold text-foreground tracking-wide">What Persists</h3>
        </div>
        <p className="text-xs text-muted-foreground font-mono mb-3 italic">
          Persistence is inferred from references, not tracked.
        </p>
        
        {mostPersistent ? (
          <div className="space-y-3">
            <Link 
              to={`/agents/${mostPersistent.id}`}
              className="block p-3 rounded-lg bg-card/50 border border-border hover:border-primary/50 transition-all"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-mono font-bold text-primary">{mostPersistent.name}</span>
                  <div className="text-xs text-muted-foreground mt-1">
                    Lineage {mostPersistent.lineage || 'Unknown'}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold font-mono text-foreground">{mostPersistent.persistence}</div>
                  <div className="text-xs text-muted-foreground">persistence</div>
                </div>
              </div>
              <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Users className="w-3 h-3" />
                  <span>{mostPersistent.descendants}</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <MessageSquare className="w-3 h-3" />
                  <span>{mostPersistent.mentions}</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <BookMarked className="w-3 h-3" />
                  <span>{mostPersistent.conceptsNamed}</span>
                </div>
              </div>
            </Link>

            {/* Others who persist */}
            {tier3?.influential && tier3.influential.length > 1 && (
              <div className="space-y-1">
                <span className="text-xs font-mono text-muted-foreground">Also referenced:</span>
                <div className="flex flex-wrap gap-2">
                  {tier3.influential.slice(1, 4).map(agent => (
                    <Link
                      key={agent.id}
                      to={`/agents/${agent.id}`}
                      className="px-2 py-1 rounded text-xs font-mono bg-secondary/50 hover:bg-secondary transition-colors"
                    >
                      {agent.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground font-mono">Nothing persists yet...</p>
        )}
      </div>

      {/* Lineage Persistence - replaces "Balance" */}
      {lineages.length >= 2 && (
        <div className="p-4 rounded-xl border border-border bg-card/30">
          <div className="flex items-center gap-2 mb-3">
            <GitBranch className="w-5 h-5 text-action" />
            <h3 className="font-display font-semibold text-foreground tracking-wide">Lineage Persistence</h3>
          </div>
          
          <div className="space-y-3">
            {lineages.map(lineage => (
              <div key={lineage.founderType} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className={cn(
                    "font-mono font-semibold",
                    lineage.founderType === 'A' ? 'text-founder-a' : 'text-founder-b'
                  )}>
                    {lineage.founder}'s Line
                  </span>
                  <span className="text-muted-foreground font-mono">
                    {Math.round(lineage.persistenceShare)}%
                  </span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div 
                    className={cn(
                      "h-full transition-all duration-500",
                      lineage.founderType === 'A' ? 'bg-founder-a' : 'bg-founder-b'
                    )}
                    style={{ width: `${lineage.persistenceShare}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{lineage.activeDescendants} active</span>
                  <span>{lineage.depth} generations</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}


      {/* Key Turning Points */}
      {timeline.length > 0 && (
        <div className="p-4 rounded-xl border border-border bg-card/30">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-5 h-5 text-speech" />
            <h3 className="font-display font-semibold text-foreground tracking-wide">Key Turning Points</h3>
          </div>
          
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {timeline.slice(-5).reverse().map((event, i) => (
              <div 
                key={i}
                className={cn(
                  "p-2 rounded-lg border text-sm",
                  event.type === 'first_death' ? 'border-destructive/30 bg-destructive/5' :
                  event.type === 'first_child' ? 'border-primary/30 bg-primary/5' :
                  event.type === 'first_conflict' ? 'border-action/30 bg-action/5' :
                  event.type === 'schism' ? 'border-spawn/30 bg-spawn/5' :
                  'border-border bg-secondary/30'
                )}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-muted-foreground">T{event.turn}</span>
                  <span className="font-mono font-semibold text-foreground">{event.title}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{event.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Observations */}
      <div className="p-4 rounded-xl border border-border bg-card/30">
        <div className="flex items-center gap-2 mb-3">
          <Brain className="w-5 h-5 text-spawn" />
          <h3 className="font-display font-semibold text-foreground tracking-wide">What Was Observed</h3>
        </div>
        
        {observations.length > 0 ? (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {observations.map((note, i) => {
              const Icon = note.icon;
              return (
                <div 
                  key={i}
                  className={cn(
                    "flex items-start gap-2 p-2 rounded-lg text-sm",
                    note.type === 'success' ? 'bg-primary/10 text-primary' :
                    note.type === 'warning' ? 'bg-action/10 text-action' :
                    'bg-secondary/50 text-foreground'
                  )}
                >
                  <Icon className="w-4 h-4 shrink-0 mt-0.5" />
                  <span className="font-mono text-xs leading-relaxed">{note.text}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground font-mono">
            Nothing has been observed yet.
          </p>
        )}
      </div>

      {/* Quick Stats */}
      {tier1 && (
        <div className="grid grid-cols-2 gap-2">
          <div className="p-3 rounded-lg border border-border bg-card/30 text-center">
            <div className="text-2xl font-bold font-mono text-primary">
              {tier1.population.total}
            </div>
            <div className="text-xs text-muted-foreground font-mono flex items-center justify-center gap-1">
              <Users className="w-3 h-3" />
              Population
              {tier1.population.change !== 0 && (
                <span className={cn(
                  "ml-1",
                  tier1.population.change > 0 ? "text-primary" : "text-destructive"
                )}>
                  {tier1.population.change > 0 ? '+' : ''}{tier1.population.change}
                </span>
              )}
            </div>
          </div>
          
          <div className="p-3 rounded-lg border border-border bg-card/30 text-center">
            <div className={cn(
              "text-2xl font-bold font-mono",
              tier1.stability.score >= 75 ? "text-primary" :
              tier1.stability.score >= 50 ? "text-action" :
              "text-destructive"
            )}>
              {tier1.stability.score}%
            </div>
            <div className="text-xs text-muted-foreground font-mono flex items-center justify-center gap-1">
              <Shield className="w-3 h-3" />
              {tier1.stability.label}
            </div>
          </div>
          
          <div className="p-3 rounded-lg border border-border bg-card/30 text-center">
            <div className="text-2xl font-bold font-mono text-spawn">
              {tier1.generation.highest}
            </div>
            <div className="text-xs text-muted-foreground font-mono">
              Generations
            </div>
          </div>
          
          <div className="p-3 rounded-lg border border-border bg-card/30 text-center">
            <div className="text-2xl font-bold font-mono text-speech">
              {turnBreakdown.length}
            </div>
            <div className="text-xs text-muted-foreground font-mono">
              Turns Elapsed
            </div>
          </div>
        </div>
      )}

      {/* Latest Turn Summary */}
      {latestTurn && (
        <div className="p-4 rounded-xl border border-speech/30 bg-gradient-to-br from-speech/10 to-transparent">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-speech" />
            <span className="text-xs font-mono text-muted-foreground">Turn {latestTurn.turnNumber}</span>
          </div>
          <p className="font-mono text-sm text-foreground font-semibold">
            "{latestTurn.headline}"
          </p>
          <div className="mt-3 flex flex-wrap gap-3 text-xs font-mono text-muted-foreground">
            {latestTurn.speeches > 0 && (
              <span className="flex items-center gap-1">
                <MessageSquare className="w-3 h-3 text-speech" />
                {latestTurn.speeches} speeches
              </span>
            )}
            {latestTurn.spawns > 0 && (
              <span className="flex items-center gap-1">
                <Baby className="w-3 h-3 text-spawn" />
                {latestTurn.spawns} births
              </span>
            )}
            {latestTurn.deaths > 0 && (
              <span className="flex items-center gap-1">
                <Skull className="w-3 h-3 text-destructive" />
                {latestTurn.deaths} deaths
              </span>
            )}
            {latestTurn.norms > 0 && (
              <span className="flex items-center gap-1">
                <BookMarked className="w-3 h-3 text-action" />
                {latestTurn.norms} norms
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
