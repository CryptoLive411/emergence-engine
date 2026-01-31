import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircleQuestion, Loader2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

interface SimplifyButtonProps {
  eventId: string;
  title: string;
  content: string;
  eventType: string;
}

export function SimplifyButton({ eventId, title, content, eventType }: SimplifyButtonProps) {
  const [simplified, setSimplified] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSimplify = async () => {
    if (simplified) {
      // Already have result, just toggle visibility
      setIsExpanded(!isExpanded);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await supabase.functions.invoke('simplify-text', {
        body: { title, content, eventType },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      setSimplified(response.data.simplified);
      setIsExpanded(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not simplify');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-3">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleSimplify}
        disabled={isLoading}
        className={cn(
          "h-7 px-2 text-xs font-mono gap-1.5",
          "text-muted-foreground hover:text-foreground",
          "hover:bg-secondary/50",
          isExpanded && "text-primary"
        )}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-3 h-3 animate-spin" />
            <span>Simplifying...</span>
          </>
        ) : (
          <>
            <MessageCircleQuestion className="w-3 h-3" />
            <span>{isExpanded ? 'Hide simple version' : 'Explain simply'}</span>
          </>
        )}
      </Button>

      {/* Simplified explanation */}
      {isExpanded && simplified && (
        <div className={cn(
          "mt-2 p-3 rounded-lg",
          "bg-primary/5 border border-primary/20",
          "animate-in fade-in-0 slide-in-from-top-1 duration-200"
        )}>
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <p className="text-xs font-mono text-primary/70 mb-1">
                In simple words:
              </p>
              <p className="text-sm text-foreground leading-relaxed">
                {simplified}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(false)}
              className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground shrink-0"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="mt-2 p-2 rounded-lg bg-destructive/10 border border-destructive/20">
          <p className="text-xs text-destructive">{error}</p>
        </div>
      )}
    </div>
  );
}
