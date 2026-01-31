import { memo, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Brain, Sparkles } from 'lucide-react';

interface ConceptMapProps {
  beliefs: string[];
  artifacts: Array<{ name: string }>;
}

/**
 * Visual map of concepts, beliefs, and artifacts
 * Shows what the world has created and named
 */
function ConceptMapComponent({ beliefs, artifacts }: ConceptMapProps) {
  const allConcepts = useMemo(() => {
    const concepts = [
      ...beliefs.map(b => ({ name: b, type: 'belief' as const })),
      ...artifacts.map(a => ({ name: a.name, type: 'artifact' as const })),
    ];
    
    // Shuffle for visual variety
    return concepts.sort(() => Math.random() - 0.5).slice(0, 20);
  }, [beliefs, artifacts]);

  if (allConcepts.length === 0) {
    return (
      <div className="p-8 text-center rounded-xl border border-border bg-card/30">
        <Brain className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
        <p className="text-sm text-muted-foreground">
          No concepts named yet
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-xl border border-border bg-card/30 backdrop-blur-sm">
      <div className="flex items-center gap-2 mb-4">
        <Brain className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-mono uppercase tracking-wider text-foreground">
          Concept Map
        </h3>
      </div>

      <div className="relative h-[300px] overflow-hidden rounded-lg bg-muted/10">
        {/* Floating concept bubbles */}
        <div className="absolute inset-0 flex flex-wrap items-center justify-center gap-2 p-4">
          {allConcepts.map((concept, idx) => {
            // Vary sizes for visual interest
            const sizes = ['text-xs px-3 py-1.5', 'text-sm px-4 py-2', 'text-base px-5 py-2.5'];
            const size = sizes[idx % 3];
            
            // Position with slight randomness
            const positions = [
              'self-start',
              'self-center',
              'self-end',
            ];
            const position = positions[idx % 3];

            return (
              <div
                key={idx}
                className={cn(
                  "rounded-full border-2 font-medium whitespace-nowrap transition-all duration-300 hover:scale-110 cursor-pointer",
                  size,
                  position,
                  concept.type === 'belief'
                    ? "bg-speech/10 border-speech/30 text-speech hover:bg-speech/20"
                    : "bg-spawn/10 border-spawn/30 text-spawn hover:bg-spawn/20"
                )}
                style={{
                  animation: `float ${3 + (idx % 3)}s ease-in-out infinite`,
                  animationDelay: `${idx * 0.2}s`,
                }}
              >
                {concept.name}
              </div>
            );
          })}
        </div>

        {/* Connecting lines (subtle) */}
        <svg className="absolute inset-0 pointer-events-none opacity-10">
          {allConcepts.slice(0, 10).map((_, idx) => (
            <line
              key={idx}
              x1={`${(idx * 10) % 100}%`}
              y1={`${(idx * 15) % 100}%`}
              x2={`${((idx + 1) * 10) % 100}%`}
              y2={`${((idx + 1) * 15) % 100}%`}
              stroke="currentColor"
              strokeWidth="1"
              className="text-primary"
            />
          ))}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-speech/20 border-2 border-speech/30" />
          <span className="text-muted-foreground">Beliefs</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-spawn/20 border-2 border-spawn/30" />
          <span className="text-muted-foreground">Artifacts</span>
        </div>
      </div>

      <p className="text-xs text-center text-muted-foreground mt-3">
        {allConcepts.length} concepts named • Hover to explore
      </p>

      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
      `}</style>
    </div>
  );
}

export const ConceptMap = memo(ConceptMapComponent);
