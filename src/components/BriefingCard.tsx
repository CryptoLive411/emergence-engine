import { Briefing } from '@/data/types';
import { FileText, Users, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

interface BriefingCardProps {
  briefing: Briefing;
  compact?: boolean;
}

export function BriefingCard({ briefing, compact = false }: BriefingCardProps) {
  return (
    <Link
      to={`/briefings/${briefing.id}`}
      className="block p-4 rounded-lg border border-border bg-card/50 backdrop-blur-sm transition-all duration-300 hover:scale-[1.01] hover:border-primary/50"
    >
      <div className="flex items-start gap-3 mb-3">
        <div className="p-2 rounded-lg bg-primary/10 border border-primary/30">
          <FileText className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-sm text-primary">Turn {briefing.turnNumber}</span>
            <span className="text-xs text-muted-foreground">·</span>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(briefing.createdAt, { addSuffix: true })}
            </span>
          </div>
          <h3 className="font-semibold text-foreground line-clamp-2">
            {briefing.headline}
          </h3>
        </div>
      </div>

      {!compact && (
        <>
          <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
            {briefing.summary}
          </p>

          <div className="flex items-center justify-between text-xs font-mono text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              <span>Pop: {briefing.population}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{briefing.keyEvents.length} key events</span>
            </div>
          </div>
        </>
      )}
    </Link>
  );
}
