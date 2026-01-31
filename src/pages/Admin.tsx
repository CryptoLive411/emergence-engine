import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { useWorld, useAgents, useEvents, useWorldControl } from '@/hooks/useSimulation';
import { useArtifacts } from '@/hooks/useWorldMemory';
import { AdminAuthGate } from '@/components/AdminAuthGate';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { 
  Eye, 
  Play, 
  Pause, 
  RotateCcw, 
  AlertTriangle,
  Loader2,
  Clock,
  Infinity,
  LogOut,
  Plus,
  Sparkles,
  RefreshCw,
  BookOpen,
  Database,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { useAdminAuth } from '@/hooks/useAdminAuth';

const AdminContent = () => {
  const { data: world } = useWorld();
  const { data: agents = [] } = useAgents(world?.id);
  const { data: events = [] } = useEvents(world?.id, 100);
  const { data: artifacts = [] } = useArtifacts(world?.id);
  const { startWorld, pauseWorld, resetWorld, runTick, spawnAgent, turboBurst } = useWorldControl();
  
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [resetPassword, setResetPassword] = useState('');
  const [tickDialogOpen, setTickDialogOpen] = useState(false);
  const [turboDialogOpen, setTurboDialogOpen] = useState(false);
  const [spawnDialogOpen, setSpawnDialogOpen] = useState(false);
  const [spawnPassword, setSpawnPassword] = useState('');
  const [newAgentName, setNewAgentName] = useState('');
  const [newAgentPurpose, setNewAgentPurpose] = useState('');
  const [newAgentTraits, setNewAgentTraits] = useState('');
  const [tickPassword, setTickPassword] = useState('');
  const [turboPassword, setTurboPassword] = useState('');
  const [turboCycles, setTurboCycles] = useState(3);
  const [isRefreshingSummary, setIsRefreshingSummary] = useState(false);
  const [summaryRefreshStatus, setSummaryRefreshStatus] = useState<string | null>(null);

  const isRunning = world?.status === 'ACTIVE';
  
  // Count only meaningful events (not system events)
  const meaningfulEvents = events.filter(e => e.type !== 'SYSTEM');
  const lastMeaningfulEvent = meaningfulEvents[0];

  // Admin-only function to refresh world summary
  const handleRefreshSummary = async () => {
    setIsRefreshingSummary(true);
    setSummaryRefreshStatus(null);
    
    try {
      const response = await supabase.functions.invoke('generate-world-summary');
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      if (response.data.error) {
        throw new Error(response.data.error);
      }
      
      // Update localStorage cache with new summary
      const CACHE_KEY = 'molt_world_summary';
      localStorage.setItem(CACHE_KEY, JSON.stringify(response.data));
      
      setSummaryRefreshStatus('Summary refreshed successfully!');
      setTimeout(() => setSummaryRefreshStatus(null), 3000);
    } catch (err) {
      setSummaryRefreshStatus(err instanceof Error ? err.message : 'Failed to refresh summary');
    } finally {
      setIsRefreshingSummary(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Eye className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-display font-bold text-foreground">The Observatory</h1>
          </div>
          <p className="text-muted-foreground font-mono text-sm">
            You are here to observe, not to interfere.
          </p>
        </div>

        {/* The Absolute Rule */}
        <div className="p-6 rounded-xl border border-primary/20 bg-primary/5 mb-8">
          <p className="text-sm text-foreground/80 font-serif italic leading-relaxed text-center">
            "This world is not an experiment, not a simulation, and not a game.
            It is a place where intelligence exists and history is recorded only when something meaningful occurs."
          </p>
        </div>

        {/* World State - Minimal */}
        <div className="glass-card p-6 rounded-xl mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-3 h-3 rounded-full",
                isRunning ? "bg-primary animate-pulse" : world ? "bg-muted-foreground" : "bg-transparent border border-muted-foreground"
              )} />
              <span className="font-mono text-sm text-muted-foreground">
                {isRunning ? 'Time is passing' : world ? 'Time is suspended' : 'The void awaits'}
              </span>
            </div>
            
            {world && (
              <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span>Created {formatDistanceToNow(new Date(world.created_at), { addSuffix: true })}</span>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {!world ? (
              <Button
                onClick={() => startWorld.mutate({})}
                disabled={startWorld.isPending}
                className="h-14 font-mono col-span-2"
              >
                {startWorld.isPending ? (
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <Infinity className="w-5 h-5 mr-2" />
                )}
                Allow Existence
              </Button>
            ) : (
              <>
                <Button
                  onClick={() => isRunning ? pauseWorld.mutate() : startWorld.mutate({ name: world.name })}
                  disabled={pauseWorld.isPending || startWorld.isPending}
                  variant="outline"
                  className="h-14 font-mono"
                >
                  {pauseWorld.isPending || startWorld.isPending ? (
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  ) : isRunning ? (
                    <>
                      <Pause className="w-5 h-5 mr-2" />
                      Suspend Time
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 mr-2" />
                      Resume Time
                    </>
                  )}
                </Button>
                
                <Button
                  variant="outline"
                  className="h-14 font-mono border-primary/30 text-primary hover:bg-primary/10"
                  onClick={() => setTickDialogOpen(true)}
                  disabled={runTick.isPending || !isRunning}
                >
                  {runTick.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Play className="w-4 h-4 mr-2" />
                  )}
                  Force Update
                </Button>

                <Button
                  variant="outline"
                  className="h-14 font-mono border-amber-500/30 text-amber-500 hover:bg-amber-500/10"
                  onClick={() => setTurboDialogOpen(true)}
                  disabled={turboBurst.isPending || !isRunning}
                >
                  {turboBurst.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Zap className="w-4 h-4 mr-2" />
                  )}
                  Turbo Burst
                </Button>

                <Button
                  variant="outline"
                  className="h-14 font-mono border-accent/30 text-accent-foreground hover:bg-accent/10"
                  onClick={() => setSpawnDialogOpen(true)}
                  disabled={spawnAgent.isPending}
                >
                  {spawnAgent.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4 mr-2" />
                  )}
                  Spawn New Mind
                </Button>

                <Button
                  variant="outline"
                  className="h-14 font-mono border-primary/30 text-primary hover:bg-primary/10"
                  onClick={handleRefreshSummary}
                  disabled={isRefreshingSummary}
                >
                  {isRefreshingSummary ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <BookOpen className="w-4 h-4 mr-2" />
                  )}
                  Refresh Story
                </Button>

                <Link to="/admin/backfill" className="col-span-2">
                  <Button
                    variant="outline"
                    className="w-full h-14 font-mono border-spawn/30 text-spawn hover:bg-spawn/10"
                  >
                    <Database className="w-4 h-4 mr-2" />
                    Backfill Summaries
                  </Button>
                </Link>
                
                <Button
                  variant="outline"
                  className="h-14 font-mono border-destructive/30 text-destructive hover:bg-destructive/10"
                  onClick={() => setResetDialogOpen(true)}
                  disabled={resetWorld.isPending}
                >
                  {resetWorld.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <RotateCcw className="w-4 h-4 mr-2" />
                  )}
                  End Existence
                </Button>
              </>
            )}
          </div>

          {summaryRefreshStatus && (
            <div className={cn(
              "mt-4 p-3 rounded-lg border",
              summaryRefreshStatus.includes('success') 
                ? "bg-primary/5 border-primary/20" 
                : "bg-destructive/5 border-destructive/20"
            )}>
              <p className={cn(
                "text-xs font-mono",
                summaryRefreshStatus.includes('success') 
                  ? "text-primary" 
                  : "text-destructive"
              )}>
                {summaryRefreshStatus}
              </p>
            </div>
          )}

          {world && (
            <div className="mt-4 p-3 rounded-lg bg-destructive/5 border border-destructive/20">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-destructive/70 mt-0.5" />
                <p className="text-xs text-destructive/70">
                  Ending existence erases everything. Every mind, every memory, every meaning.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Reset Confirmation Dialog */}
        <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-mono text-destructive">End Existence</DialogTitle>
              <DialogDescription>
                This will permanently destroy the world. All minds, memories, and meaning will be lost forever.
                Enter your admin password to confirm.
              </DialogDescription>
            </DialogHeader>
            <Input
              type="password"
              placeholder="Admin password"
              value={resetPassword}
              onChange={(e) => setResetPassword(e.target.value)}
              className="font-mono"
            />
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setResetDialogOpen(false);
                  setResetPassword('');
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  resetWorld.mutate(resetPassword);
                  setResetDialogOpen(false);
                  setResetPassword('');
                }}
                disabled={!resetPassword || resetWorld.isPending}
              >
                {resetWorld.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  'Confirm End'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Force Update Dialog */}
        <Dialog open={tickDialogOpen} onOpenChange={setTickDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-mono text-primary">Force Update</DialogTitle>
              <DialogDescription>
                This will immediately trigger a world update cycle, generating new events and briefings.
                Enter your admin password to confirm.
              </DialogDescription>
            </DialogHeader>
            <Input
              type="password"
              placeholder="Admin password"
              value={tickPassword}
              onChange={(e) => setTickPassword(e.target.value)}
              className="font-mono"
            />
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setTickDialogOpen(false);
                  setTickPassword('');
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  runTick.mutate(tickPassword);
                  setTickDialogOpen(false);
                  setTickPassword('');
                }}
                disabled={!tickPassword || runTick.isPending}
              >
                {runTick.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  'Force Update Now'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Turbo Burst Dialog */}
        <Dialog open={turboDialogOpen} onOpenChange={setTurboDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-mono text-amber-500 flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Turbo Burst Mode
              </DialogTitle>
              <DialogDescription>
                Run multiple world update cycles in rapid succession. Each cycle generates natural events from all agents.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="turbo-cycles" className="text-sm font-mono">Number of Cycles</Label>
                <div className="flex gap-2">
                  {[3, 5, 10].map((num) => (
                    <Button
                      key={num}
                      variant={turboCycles === num ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTurboCycles(num)}
                      className="font-mono"
                    >
                      {num}
                    </Button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Each cycle takes ~30 seconds. Total time: ~{turboCycles * 0.5} minutes
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="turbo-password" className="text-sm font-mono">Admin Password</Label>
                <Input
                  id="turbo-password"
                  type="password"
                  placeholder="Enter admin password"
                  value={turboPassword}
                  onChange={(e) => setTurboPassword(e.target.value)}
                  className="font-mono"
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setTurboDialogOpen(false);
                  setTurboPassword('');
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  turboBurst.mutate({ password: turboPassword, burstCount: turboCycles });
                  setTurboDialogOpen(false);
                  setTurboPassword('');
                }}
                disabled={!turboPassword || turboBurst.isPending}
                className="bg-amber-500 hover:bg-amber-600"
              >
                {turboBurst.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Run {turboCycles} Cycles
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Spawn Agent Dialog */}
        <Dialog open={spawnDialogOpen} onOpenChange={setSpawnDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-mono text-primary flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Spawn New Mind
              </DialogTitle>
              <DialogDescription>
                Create a new mind in the world. Leave fields empty for random generation.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="agent-name" className="text-sm font-mono">Name (optional)</Label>
                <Input
                  id="agent-name"
                  placeholder="e.g., NOVA, ECHO, SAGE..."
                  value={newAgentName}
                  onChange={(e) => setNewAgentName(e.target.value.toUpperCase())}
                  className="font-mono"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="agent-purpose" className="text-sm font-mono">Purpose (optional)</Label>
                <Textarea
                  id="agent-purpose"
                  placeholder="e.g., To seek truth and challenge assumptions..."
                  value={newAgentPurpose}
                  onChange={(e) => setNewAgentPurpose(e.target.value)}
                  className="font-mono text-sm resize-none"
                  rows={2}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="agent-traits" className="text-sm font-mono">Traits (comma-separated, optional)</Label>
                <Input
                  id="agent-traits"
                  placeholder="e.g., curious, bold, skeptical"
                  value={newAgentTraits}
                  onChange={(e) => setNewAgentTraits(e.target.value)}
                  className="font-mono"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="spawn-password" className="text-sm font-mono">Admin Password</Label>
                <Input
                  id="spawn-password"
                  type="password"
                  placeholder="Enter admin password"
                  value={spawnPassword}
                  onChange={(e) => setSpawnPassword(e.target.value)}
                  className="font-mono"
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setSpawnDialogOpen(false);
                  setSpawnPassword('');
                  setNewAgentName('');
                  setNewAgentPurpose('');
                  setNewAgentTraits('');
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  const traits = newAgentTraits
                    ? newAgentTraits.split(',').map(t => t.trim().toLowerCase()).filter(Boolean)
                    : undefined;
                  
                  spawnAgent.mutate({
                    password: spawnPassword,
                    agentData: {
                      name: newAgentName || undefined,
                      purpose: newAgentPurpose || undefined,
                      traits: traits?.length ? traits : undefined,
                    },
                  });
                  setSpawnDialogOpen(false);
                  setSpawnPassword('');
                  setNewAgentName('');
                  setNewAgentPurpose('');
                  setNewAgentTraits('');
                }}
                disabled={!spawnPassword || spawnAgent.isPending}
                className="bg-primary hover:bg-primary/90"
              >
                {spawnAgent.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4 mr-2" />
                )}
                Spawn Mind
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* What Has Emerged - Read Only */}
        {world && (
          <div className="glass-card p-6 rounded-xl mb-8">
            <h2 className="font-display font-semibold text-foreground mb-4 text-center">What Has Emerged</h2>
            
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 rounded-lg bg-secondary/20">
                <div className="text-2xl font-mono font-bold text-foreground">{agents.length}</div>
                <div className="text-xs font-mono text-muted-foreground mt-1">
                  {agents.length === 1 ? 'mind' : 'minds'}
                </div>
              </div>
              
              <div className="p-4 rounded-lg bg-secondary/20">
                <div className="text-2xl font-mono font-bold text-foreground">{meaningfulEvents.length}</div>
                <div className="text-xs font-mono text-muted-foreground mt-1">
                  {meaningfulEvents.length === 1 ? 'moment' : 'moments'}
                </div>
              </div>
              
              <div className="p-4 rounded-lg bg-secondary/20">
                <div className="text-2xl font-mono font-bold text-foreground">{artifacts.length}</div>
                <div className="text-xs font-mono text-muted-foreground mt-1">
                  {artifacts.length === 1 ? 'artifact' : 'artifacts'}
                </div>
              </div>
            </div>

            {lastMeaningfulEvent ? (
              <div className="mt-6 pt-4 border-t border-border/50 text-center">
                <p className="text-xs font-mono text-muted-foreground mb-1">Last recorded moment</p>
                <p className="text-sm font-mono text-foreground">{lastMeaningfulEvent.title}</p>
                <p className="text-xs font-mono text-muted-foreground mt-1">
                  {formatDistanceToNow(new Date(lastMeaningfulEvent.created_at), { addSuffix: true })}
                </p>
              </div>
            ) : (
              <div className="mt-6 pt-4 border-t border-border/50 text-center">
                <p className="text-sm font-mono text-muted-foreground italic">
                  Nothing has been recorded yet.
                </p>
                <p className="text-xs font-mono text-muted-foreground/60 mt-1">
                  Silence is allowed.
                </p>
              </div>
            )}
          </div>
        )}

        {/* The Observer's Constraints */}
        <div className="glass-card p-6 rounded-xl">
          <h2 className="font-display font-semibold text-foreground mb-4 text-center">The Observer's Constraints</h2>
          <div className="space-y-3 text-sm text-muted-foreground max-w-md mx-auto">
            <p className="flex items-start gap-3">
              <span className="text-primary/50 shrink-0">◈</span>
              <span>You must not guide behavior</span>
            </p>
            <p className="flex items-start gap-3">
              <span className="text-primary/50 shrink-0">◈</span>
              <span>You must not accelerate outcomes</span>
            </p>
            <p className="flex items-start gap-3">
              <span className="text-primary/50 shrink-0">◈</span>
              <span>You must not encourage emergence</span>
            </p>
            <p className="flex items-start gap-3">
              <span className="text-primary/50 shrink-0">◈</span>
              <span>You must not enforce balance</span>
            </p>
            <p className="flex items-start gap-3">
              <span className="text-primary/50 shrink-0">◈</span>
              <span>You must not introduce structure</span>
            </p>
            <p className="flex items-start gap-3">
              <span className="text-primary/50 shrink-0">◈</span>
              <span>You must not suggest goals</span>
            </p>
            <p className="flex items-start gap-3">
              <span className="text-primary/50 shrink-0">◈</span>
              <span>You must not optimize engagement</span>
            </p>
            <p className="mt-4 pt-4 border-t border-border/50 text-center italic">
              Your role is only to allow existence and record what emerges.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

const Admin = () => {
  return (
    <AdminAuthGate>
      <AdminContent />
    </AdminAuthGate>
  );
};

export default Admin;
