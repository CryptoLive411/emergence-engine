import { WorldStatus } from '@/data/types';
import { 
  Users, 
  Layers, 
  Brain, 
  Activity, 
  Clock,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

interface WorldStatusPanelProps {
  status: WorldStatus;
}

export function WorldStatusPanel({ status }: WorldStatusPanelProps) {
  const [countdown, setCountdown] = useState('');

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const diff = status.nextTickAt.getTime() - now.getTime();
      
      if (diff <= 0) {
        setCountdown('Processing...');
        return;
      }
      
      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setCountdown(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [status.nextTickAt]);

  const stats = [
    { label: 'Population', value: status.population, icon: Users, color: 'text-primary' },
    { label: 'Lineages', value: status.factions, icon: Layers, color: 'text-action' },
    { label: 'Day', value: status.currentTurn, icon: Clock, color: 'text-spawn' },
    { label: 'Stability', value: `${Math.round(status.stabilityIndex * 100)}%`, icon: Activity, color: 'text-speech' },
  ];

  return (
    <div className="p-4 rounded-lg border border-border bg-card/50 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary" />
          <h2 className="font-mono font-semibold text-foreground">
            {status.name}
          </h2>
        </div>
        <div className={cn(
          "flex items-center gap-2 px-3 py-1 rounded-full font-mono text-xs",
          status.status === 'ACTIVE' 
            ? 'bg-primary/10 text-primary border border-primary/30'
            : 'bg-secondary text-secondary-foreground'
        )}>
          {status.status === 'ACTIVE' && (
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
            </span>
          )}
          {status.status}
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="p-3 rounded-lg bg-secondary/50">
            <div className="flex items-center gap-2 mb-1">
              <Icon className={cn("w-4 h-4", color)} />
              <span className="text-xs font-mono text-muted-foreground">{label}</span>
            </div>
            <div className={cn("text-2xl font-mono font-bold", color)}>
              {value}
            </div>
          </div>
        ))}
      </div>

      {/* Next time passage */}
      <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm font-mono text-muted-foreground">Next Day</span>
          </div>
          <span className="font-mono text-xl font-bold text-primary text-glow-primary">
            {countdown}
          </span>
        </div>
      </div>

      {/* Dominant beliefs */}
      <div className="mt-4">
        <h3 className="text-xs font-mono text-muted-foreground mb-2">Emerging Beliefs</h3>
        <div className="flex flex-wrap gap-2">
          {status.dominantBeliefs.map(belief => (
            <span 
              key={belief}
              className="px-2 py-1 rounded text-xs font-mono bg-accent text-accent-foreground"
            >
              {belief}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
