import { memo, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Users, Zap, MessageSquare } from 'lucide-react';

interface Agent {
  id: string;
  name: string;
}

interface Event {
  id: string;
  agent_id: string | null;
  type: string;
  content: string;
}

interface RelationshipGraphProps {
  agents: Agent[];
  events: Event[];
}

interface Connection {
  from: string;
  to: string;
  strength: number;
  type: 'agreement' | 'conflict' | 'neutral';
}

/**
 * Visual network graph showing agent relationships
 * Based on interaction patterns and sentiment
 */
function RelationshipGraphComponent({ agents, events }: RelationshipGraphProps) {
  const connections = useMemo(() => {
    const connectionMap = new Map<string, Connection>();

    // Analyze events to find connections between agents
    events.forEach(event => {
      if (!event.agent_id) return;

      const content = event.content.toLowerCase();
      
      // Find mentions of other agents
      agents.forEach(otherAgent => {
        if (otherAgent.id === event.agent_id) return;
        
        const mentioned = content.includes(otherAgent.name.toLowerCase());
        if (!mentioned) return;

        const key = [event.agent_id, otherAgent.id].sort().join('-');
        const existing = connectionMap.get(key);

        // Determine sentiment
        let type: 'agreement' | 'conflict' | 'neutral' = 'neutral';
        if (content.includes('disagree') || content.includes('wrong') || content.includes('but')) {
          type = 'conflict';
        } else if (content.includes('agree') || content.includes('yes') || content.includes('together')) {
          type = 'agreement';
        }

        if (existing) {
          existing.strength += 1;
          if (type === 'conflict') existing.type = 'conflict';
          else if (type === 'agreement' && existing.type === 'neutral') existing.type = 'agreement';
        } else {
          connectionMap.set(key, {
            from: event.agent_id,
            to: otherAgent.id,
            strength: 1,
            type,
          });
        }
      });
    });

    return Array.from(connectionMap.values());
  }, [agents, events]);

  // Position agents in a circle
  const agentPositions = useMemo(() => {
    const positions = new Map<string, { x: number; y: number }>();
    const centerX = 150;
    const centerY = 150;
    const radius = 100;

    agents.forEach((agent, idx) => {
      const angle = (idx / agents.length) * 2 * Math.PI - Math.PI / 2;
      positions.set(agent.id, {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
      });
    });

    return positions;
  }, [agents]);

  if (agents.length === 0) {
    return (
      <div className="p-8 text-center rounded-xl border border-border bg-card/30">
        <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
        <p className="text-sm text-muted-foreground">
          No agents yet to visualize
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-xl border border-border bg-card/30 backdrop-blur-sm">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-mono uppercase tracking-wider text-foreground">
          Relationship Network
        </h3>
      </div>

      <svg width="300" height="300" className="mx-auto">
        {/* Draw connections */}
        {connections.map((conn, idx) => {
          const fromPos = agentPositions.get(conn.from);
          const toPos = agentPositions.get(conn.to);
          if (!fromPos || !toPos) return null;

          const color = conn.type === 'conflict' 
            ? 'rgb(239, 68, 68)' 
            : conn.type === 'agreement'
            ? 'rgb(34, 197, 94)'
            : 'rgb(148, 163, 184)';

          const opacity = Math.min(0.2 + (conn.strength * 0.1), 0.8);
          const strokeWidth = Math.min(1 + conn.strength * 0.5, 4);

          return (
            <line
              key={idx}
              x1={fromPos.x}
              y1={fromPos.y}
              x2={toPos.x}
              y2={toPos.y}
              stroke={color}
              strokeWidth={strokeWidth}
              opacity={opacity}
              strokeLinecap="round"
            />
          );
        })}

        {/* Draw agent nodes */}
        {agents.map(agent => {
          const pos = agentPositions.get(agent.id);
          if (!pos) return null;

          return (
            <g key={agent.id}>
              <circle
                cx={pos.x}
                cy={pos.y}
                r="20"
                fill="hsl(var(--primary))"
                opacity="0.2"
                stroke="hsl(var(--primary))"
                strokeWidth="2"
              />
              <circle
                cx={pos.x}
                cy={pos.y}
                r="12"
                fill="hsl(var(--primary))"
              />
              <text
                x={pos.x}
                y={pos.y + 30}
                textAnchor="middle"
                className="text-[10px] font-mono fill-foreground"
              >
                {agent.name}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-0.5 bg-green-500" />
          <span className="text-muted-foreground">Agreement</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-0.5 bg-red-500" />
          <span className="text-muted-foreground">Conflict</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-0.5 bg-slate-400" />
          <span className="text-muted-foreground">Neutral</span>
        </div>
      </div>

      <p className="text-xs text-center text-muted-foreground mt-3">
        Line thickness shows interaction frequency
      </p>
    </div>
  );
}

export const RelationshipGraph = memo(RelationshipGraphComponent);
