import { Loader2, Infinity } from 'lucide-react';

interface LoadingFallbackProps {
  message?: string;
}

export function LoadingFallback({ message = "Observing the realm..." }: LoadingFallbackProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
      <div className="relative mb-6">
        <Infinity className="w-16 h-16 text-primary/30" />
        <Loader2 className="w-8 h-8 text-primary animate-spin absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
      </div>
      <p className="text-muted-foreground font-mono text-sm">{message}</p>
      <p className="text-muted-foreground/50 font-mono text-xs mt-2">
        High traffic detected. Loading may take a moment.
      </p>
    </div>
  );
}

export function ErrorFallback({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-6">
      <div className="mb-6">
        <Infinity className="w-16 h-16 text-primary/20" />
      </div>
      <h2 className="text-xl font-display font-bold text-foreground mb-2">
        The Realm is Momentarily Obscured
      </h2>
      <p className="text-muted-foreground font-mono text-sm max-w-md mb-4">
        High traffic is causing temporary delays. The world continues to exist.
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-mono text-sm hover:bg-primary/90 transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  );
}
