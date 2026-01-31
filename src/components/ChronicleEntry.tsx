import { memo } from 'react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow, format } from 'date-fns';
import { Link } from 'react-router-dom';
import { 
  Globe, 
  Brain, 
  Wheat, 
  Building2, 
  Dna, 
  ScrollText, 
  Swords,
  Users
} from 'lucide-react';
import { ChronicleCategory, CHRONICLE_CATEGORIES } from '@/data/chronicleTypes';
import { EventAnnotations } from './EventAnnotations';
import { SimplifyButton } from './SimplifyButton';

interface ChronicleEntryProps {
  entry: {
    id: string;
    title: string;
    timestamp: Date;
    category: ChronicleCategory;
    description: string;
    involvedAgents?: { id: string; name: string }[];
    witnessed?: number;
  };
}

const categoryIcons: Record<ChronicleCategory, typeof Globe> = {
  SOCIETAL: Globe,
  CULTURAL: Brain,
  ECONOMIC: Wheat,
  INSTITUTIONAL: Building2,
  LINEAGE: Dna,
  ARTIFACT: ScrollText,
  CONFLICT: Swords,
};

const categoryColors: Record<ChronicleCategory, string> = {
  SOCIETAL: 'border-primary/40 bg-primary/5',
  CULTURAL: 'border-speech/40 bg-speech/5',
  ECONOMIC: 'border-spawn/40 bg-spawn/5',
  INSTITUTIONAL: 'border-action/40 bg-action/5',
  LINEAGE: 'border-founder-a/40 bg-founder-a/5',
  ARTIFACT: 'border-primary/40 bg-primary/5',
  CONFLICT: 'border-destructive/40 bg-destructive/5',
};

const categoryTextColors: Record<ChronicleCategory, string> = {
  SOCIETAL: 'text-primary',
  CULTURAL: 'text-speech',
  ECONOMIC: 'text-spawn',
  INSTITUTIONAL: 'text-action',
  LINEAGE: 'text-founder-a',
  ARTIFACT: 'text-primary',
  CONFLICT: 'text-destructive',
};

function ChronicleEntryComponent({ entry }: ChronicleEntryProps) {
  const Icon = categoryIcons[entry.category];
  const config = CHRONICLE_CATEGORIES[entry.category];
  
  return (
    <article className={cn(
      "relative p-5 rounded-xl border transition-all duration-300 hover:scale-[1.005]",
      "bg-card/30 backdrop-blur-sm",
      categoryColors[entry.category]
    )}>
      {/* Timeline dot */}
      <div className="absolute left-0 top-6 w-3 h-3 -translate-x-1/2 rounded-full bg-background border-2 border-primary hidden md:block" />
      
      {/* Header */}
      <header className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-start gap-3">
          {/* Category icon */}
          <div className={cn(
            "p-2.5 rounded-lg border",
            categoryColors[entry.category]
          )}>
            <Icon className={cn("w-5 h-5", categoryTextColors[entry.category])} />
          </div>
          
          <div>
            {/* Category label */}
            <div className="flex items-center gap-2 mb-1">
              <span className={cn(
                "text-xs font-mono uppercase tracking-wider",
                categoryTextColors[entry.category]
              )}>
                {config.label}
              </span>
            </div>
            
            {/* Title */}
            <h2 className="font-display text-lg font-semibold text-foreground leading-snug">
              {entry.title}
            </h2>
          </div>
        </div>
        
        {/* Timestamp */}
        <div className="text-right shrink-0">
          <time className="text-xs font-mono text-muted-foreground block">
            {format(entry.timestamp, 'MMM d, yyyy')}
          </time>
          <span className="text-xs text-muted-foreground/70">
            {formatDistanceToNow(entry.timestamp, { addSuffix: true })}
          </span>
        </div>
      </header>

      {/* Description - written like history */}
      <div className="pl-14">
        <p className="text-foreground/90 leading-relaxed font-serif italic">
          "{entry.description}"
        </p>
        
        {/* Involved entities */}
        {entry.involvedAgents && entry.involvedAgents.length > 0 && (
          <div className="mt-4 flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono text-muted-foreground">Involved:</span>
            {entry.involvedAgents.map(agent => (
              <Link
                key={agent.id}
                to={`/agents/${agent.id}`}
                className={cn(
                  "px-2 py-0.5 rounded text-xs font-mono",
                  "bg-secondary/50 text-foreground hover:bg-secondary transition-colors"
                )}
              >
                {agent.name}
              </Link>
            ))}
          </div>
        )}
        
        {/* Witnessed count */}
        {entry.witnessed !== undefined && entry.witnessed > 0 && (
          <div className="mt-3 flex items-center gap-1.5 text-xs font-mono text-muted-foreground">
            <Users className="w-3 h-3" />
            <span>Observed by {entry.witnessed} {entry.witnessed === 1 ? 'witness' : 'witnesses'}</span>
          </div>
        )}
        
        {/* Simplify button */}
        <SimplifyButton 
          eventId={entry.id}
          title={entry.title}
          content={entry.description}
          eventType={entry.category}
        />
        
        {/* Annotations */}
        <div className="mt-4 border-t border-border/30 pt-3">
          <EventAnnotations eventId={entry.id} />
        </div>
      </div>
    </article>
  );
}

// Memoize to prevent unnecessary re-renders in lists
export const ChronicleEntry = memo(ChronicleEntryComponent);
