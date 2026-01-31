import { LineageNode } from '@/data/types';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { ChevronDown, Crown } from 'lucide-react';
import { useState } from 'react';

interface LineageTreeNodeProps {
  node: LineageNode;
  level: number;
}

function LineageTreeNode({ node, level }: LineageTreeNodeProps) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = node.children.length > 0;
  
  const founderColor = node.founderType === 'A' ? 'founder-a' : 'founder-b';
  const isFounder = node.generation === 0;

  return (
    <div className="relative">
      {/* Connection line from parent */}
      {level > 0 && (
        <div className="absolute -top-4 left-5 w-px h-4 bg-border" />
      )}
      
      <div className="flex items-start gap-2">
        {/* Expand/collapse button */}
        {hasChildren ? (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-2 p-1 rounded hover:bg-secondary transition-colors"
          >
            <ChevronDown 
              className={cn(
                "w-4 h-4 text-muted-foreground transition-transform",
                !expanded && "-rotate-90"
              )} 
            />
          </button>
        ) : (
          <div className="w-6" />
        )}
        
        {/* Node */}
        <Link
          to={`/agents/${node.id}`}
          className={cn(
            "flex items-center gap-3 p-3 rounded-lg border transition-all duration-200",
            "hover:scale-[1.02]",
            isFounder 
              ? `border-${founderColor}/50 bg-${founderColor}/10 hover:border-${founderColor}`
              : "border-border bg-card/50 hover:border-primary/50"
          )}
        >
          {/* Avatar */}
          <div className={cn(
            "relative w-10 h-10 rounded-lg flex items-center justify-center font-mono font-bold",
            isFounder 
              ? node.founderType === 'A'
                ? 'bg-founder-a/20 text-founder-a'
                : 'bg-founder-b/20 text-founder-b'
              : 'bg-secondary text-secondary-foreground'
          )}>
            {node.name.charAt(0)}
            {isFounder && (
              <Crown className="absolute -top-1 -right-1 w-3 h-3 text-spawn" />
            )}
          </div>
          
          <div>
            <div className="flex items-center gap-2">
              <span className={cn(
                "font-mono font-semibold",
                isFounder 
                  ? node.founderType === 'A' ? 'text-founder-a' : 'text-founder-b'
                  : 'text-foreground'
              )}>
                {node.name}
              </span>
              <span className="text-xs font-mono text-muted-foreground">
                G{node.generation}
              </span>
            </div>
            {node.purpose && (
              <p className="text-xs text-muted-foreground line-clamp-1 max-w-[200px]">
                {node.purpose}
              </p>
            )}
          </div>
        </Link>
      </div>

      {/* Children */}
      {hasChildren && expanded && (
        <div className="ml-6 mt-2 pl-4 border-l border-border space-y-2">
          {node.children.map(child => (
            <LineageTreeNode key={child.id} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

interface LineageTreeProps {
  tree: LineageNode[];
}

export function LineageTree({ tree }: LineageTreeProps) {
  if (tree.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground font-mono">
          No lineage data available.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tree.map(root => (
        <LineageTreeNode key={root.id} node={root} level={0} />
      ))}
    </div>
  );
}