import { memo, useState } from 'react';
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
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { ChronicleCategory, CHRONICLE_CATEGORIES } from '@/data/chronicleTypes';

interface ChronicleEntryLiteProps {
  entry: {
    id: string;
    title: string;
    timestamp: Date;
    category: ChronicleCategory;
    description: string;
    involvedAgents?: { id: string; name: string }[];
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

/**
 * Lightweight ChronicleEntry without annotations or extra queries.
 * Used on Index page for performance - no N+1 queries.
 */
function ChronicleEntryLiteComponent({ entry }: ChronicleEntryLiteProps) {
  const Icon = categoryIcons[entry.category];
  const config = CHRONICLE_CATEGORIES[entry.category];
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Check if description is long enough to need expansion
  const isLongDescription = entry.description.length > 150;
  
  return (
    <article className={cn(
      "relative p-4 rounded-xl border transition-all duration-300 hover:scale-[1.002]",
      "bg-card/30 backdrop-blur-sm",
      categoryColors[entry.category]
    )}>
      {/* Timeline dot */}
      <div className="absolute left-0 top-5 w-2 h-2 -translate-x-1/2 rounded-full bg-background border-2 border-primary hidden md:block" />
      
      {/* Header */}
      <header className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-start gap-2 min-w-0">
          {/* Category icon */}
          <div className={cn(
            "p-2 rounded-lg border shrink-0",
            categoryColors[entry.category]
          )}>
            <Icon className={cn("w-4 h-4", categoryTextColors[entry.category])} />
          </div>
          
          <div className="min-w-0">
            {/* Category label */}
            <span className={cn(
              "text-[10px] font-mono uppercase tracking-wider",
              categoryTextColors[entry.category]
            )}>
              {config.label}
            </span>
            
            {/* Title */}
            <h2 className="font-display text-sm font-semibold text-foreground leading-snug truncate">
              {entry.title}
            </h2>
          </div>
        </div>
        
        {/* Timestamp */}
        <time className="text-[10px] font-mono text-muted-foreground shrink-0">
          {formatDistanceToNow(entry.timestamp, { addSuffix: true })}
        </time>
      </header>

      {/* Description - expandable if long */}
      <div className="pl-10">
        <div className={cn(
          "text-foreground/80 text-sm leading-relaxed overflow-hidden transition-all duration-300",
          !isExpanded && isLongDescription && "max-h-[4.5rem]"
        )}>
          <p className="whitespace-pre-wrap">
            {entry.description}
          </p>
        </div>
        
        {/* Expand/Collapse button for long descriptions */}
        {isLongDescription && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-1 flex items-center gap-1 text-xs font-mono text-primary hover:text-primary/80 transition-colors"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="w-3 h-3" />
                <span>Show less</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-3 h-3" />
                <span>Read more</span>
              </>
            )}
          </button>
        )}
      </div>
      
      {/* Involved entities */}
      {entry.involvedAgents && entry.involvedAgents.length > 0 && (
        <div className="mt-2 flex items-center gap-1 flex-wrap pl-10">
          {entry.involvedAgents.slice(0, 2).map(agent => (
            <Link
              key={agent.id}
              to={`/agents/${agent.id}`}
              className={cn(
                "px-1.5 py-0.5 rounded text-[10px] font-mono",
                "bg-secondary/50 text-foreground hover:bg-secondary transition-colors"
              )}
            >
              {agent.name}
            </Link>
          ))}
          {entry.involvedAgents.length > 2 && (
            <span className="text-[10px] font-mono text-muted-foreground">
              +{entry.involvedAgents.length - 2}
            </span>
          )}
        </div>
      )}
    </article>
  );
}

// Memoize to prevent unnecessary re-renders in lists
export const ChronicleEntryLite = memo(ChronicleEntryLiteComponent);
