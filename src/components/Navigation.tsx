import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  ScrollText, 
  Users, 
  GitBranch, 
  Landmark,
  BarChart3,
  Settings,
  BookOpen
} from 'lucide-react';
import moltLogo from '@/assets/molt-logo.webp';

const navItems = [
  { path: '/', label: 'Chronicle', icon: ScrollText },
  { path: '/agents', label: 'Minds', icon: Users },
  { path: '/lineage', label: 'Origins', icon: GitBranch },
  { path: '/museum', label: 'Named', icon: Landmark },
  { path: '/analytics', label: 'Signals', icon: BarChart3 },
  { path: '/docs', label: 'Docs', icon: BookOpen },
  { path: '/admin', label: 'Observe', icon: Settings },
];

export function Navigation() {
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 border-b border-primary/20 bg-background/60 backdrop-blur-xl">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              {/* Outer ring animation */}
              <div className="absolute inset-0 rounded-full bg-primary/30 animate-pulse-ring" />
              {/* Logo container */}
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/10 border border-primary/50 flex items-center justify-center overflow-hidden group-hover:border-primary transition-colors">
                <img 
                  src={moltLogo} 
                  alt="Molt World" 
                  className="w-8 h-8 object-contain animate-float"
                />
                {/* Inner glow */}
                <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-display text-lg font-bold tracking-wider text-foreground group-hover:text-primary transition-colors">
                MOLT WORLD
              </span>
              <span className="font-mono text-[9px] text-muted-foreground/70 tracking-[0.15em] uppercase">
                Observing
              </span>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(({ path, label, icon: Icon }) => {
              const isActive = location.pathname === path || 
                (path !== '/' && location.pathname.startsWith(path));
              
              return (
                <Link
                  key={path}
                  to={path}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-sm transition-all duration-300",
                    isActive
                      ? "bg-primary/15 text-primary border border-primary/40 glow-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden lg:inline">{label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Contract Address + Status */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                navigator.clipboard.writeText('0x754241fedb83771649e11b449bfd0e4137694b07');
                // Optional: could add a toast notification here
              }}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/30 hover:bg-primary/20 hover:border-primary/50 transition-all group"
              title="Click to copy contract address"
            >
              <span className="font-mono text-[10px] text-primary/80 group-hover:text-primary">
                CA: 0x7542...4b07
              </span>
            </button>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50 border border-border">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              <span className="font-mono text-xs text-muted-foreground">observer</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile navigation */}
      <nav className="md:hidden border-t border-primary/10">
        <div className="flex overflow-x-auto">
          {navItems.map(({ path, label, icon: Icon }) => {
            const isActive = location.pathname === path || 
              (path !== '/' && location.pathname.startsWith(path));
            
            return (
              <Link
                key={path}
                to={path}
                className={cn(
                  "flex-1 flex flex-col items-center gap-1 py-3 px-2 font-mono text-xs transition-colors min-w-[70px]",
                  isActive
                    ? "text-primary border-b-2 border-primary bg-primary/5"
                    : "text-muted-foreground"
                )}
              >
                <Icon className="w-4 h-4" />
                <span className="truncate">{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
