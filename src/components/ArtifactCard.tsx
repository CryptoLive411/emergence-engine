import { Link } from 'react-router-dom';
import { Scroll, ExternalLink } from 'lucide-react';
import { Artifact, ARTIFACT_TYPE_CONFIG, ARTIFACT_STATUS_CONFIG } from '@/hooks/useWorldMemory';
import { useAgents, useWorld } from '@/hooks/useSimulation';
import { ShareCardDialog } from '@/components/ShareCardDialog';
import { cn } from '@/lib/utils';

interface ArtifactCardProps {
  artifact: Artifact;
  compact?: boolean;
}

export function ArtifactCard({ artifact, compact = false }: ArtifactCardProps) {
  const { data: world } = useWorld();
  const { data: agents = [] } = useAgents(world?.id);
  
  const creator = agents.find(a => a.id === artifact.creator_agent_id);
  const typeConfig = ARTIFACT_TYPE_CONFIG[artifact.artifact_type];
  const statusConfig = ARTIFACT_STATUS_CONFIG[artifact.status];
  
  const shareText = `${artifact.name}\n\n"${artifact.content}"\n\n— Created by ${creator?.name || 'Unknown'} on Day ${artifact.origin_turn}\n\nFrom the Museum of GENESIS`;
  
  if (compact) {
    return (
      <div className="p-3 rounded-lg border border-border bg-card/50 hover:border-primary/30 transition-colors">
        <div className="flex items-start gap-2">
          <span className="text-lg">{typeConfig.icon}</span>
          <div className="flex-1 min-w-0">
            <div className="font-mono font-semibold text-sm text-foreground truncate">
              {artifact.name}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className={statusConfig.color}>{statusConfig.label}</span>
              <span>·</span>
              <span>{artifact.reference_count} references</span>
            </div>
          </div>
          <ShareCardDialog
            type="artifact"
            id={artifact.id}
            title={artifact.name}
            shareText={shareText}
            compact
          />
        </div>
      </div>
    );
  }
  
  return (
    <div className={cn(
      "p-4 rounded-lg border bg-card/50 transition-all hover:scale-[1.01]",
      artifact.status === 'canonized' && "border-primary/30 bg-primary/5",
      artifact.status === 'mythic' && "border-spawn/30 bg-spawn/5",
      artifact.status === 'forgotten' && "border-muted opacity-60",
      artifact.status === 'contested' && "border-action/30",
      artifact.status === 'emerging' && "border-border"
    )}>
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <div className="text-2xl">{typeConfig.icon}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-mono font-bold text-foreground">
              {artifact.name}
            </h3>
            <span className={cn(
              "px-2 py-0.5 rounded-full text-xs font-mono",
              statusConfig.color,
              "bg-secondary/50"
            )}>
              {statusConfig.label}
            </span>
          </div>
          <div className="text-xs text-muted-foreground font-mono">
            {typeConfig.label} · Origin: Day {artifact.origin_turn}
          </div>
        </div>
        <ShareCardDialog
          type="artifact"
          id={artifact.id}
          title={artifact.name}
          shareText={shareText}
          compact
        />
      </div>
      
      {/* Content excerpt */}
      <div className="mb-3 p-3 rounded bg-secondary/30 border-l-2 border-primary/30">
        <p className="text-sm text-foreground/90 italic line-clamp-3">
          "{artifact.content}"
        </p>
      </div>
      
      {/* Footer */}
      <div className="flex items-center justify-between text-xs">
        {creator ? (
          <Link 
            to={`/agents/${creator.id}`}
            className="font-mono text-primary hover:underline inline-flex items-center gap-1"
          >
            Created by {creator.name}
            <ExternalLink className="w-3 h-3" />
          </Link>
        ) : (
          <span className="font-mono text-muted-foreground">
            Creator unknown
          </span>
        )}
        
        <div className="flex items-center gap-3 text-muted-foreground font-mono">
          <span>{artifact.reference_count} references</span>
          <span>Last: Day {artifact.last_referenced_turn}</span>
        </div>
      </div>
    </div>
  );
}
