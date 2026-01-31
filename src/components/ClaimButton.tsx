import { useState } from 'react';
import { Eye, Check, Loader2, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useClaimAgent, useAgentClaim, getStoredXHandle, useUserClaim } from '@/hooks/useCustodianship';
import { ShareCardDialog } from '@/components/ShareCardDialog';
import { cn } from '@/lib/utils';

interface ClaimButtonProps {
  agentId: string;
  agentName: string;
  isFounder?: boolean;
  compact?: boolean;
}

export function ClaimButton({ agentId, agentName, isFounder, compact = false }: ClaimButtonProps) {
  const [open, setOpen] = useState(false);
  const [xHandle, setXHandle] = useState('');
  
  const storedHandle = getStoredXHandle();
  const { data: existingClaim, isLoading: claimLoading } = useAgentClaim(agentId);
  const { data: userClaim } = useUserClaim(storedHandle);
  const claimAgent = useClaimAgent();
  
  // Founders cannot be claimed
  if (isFounder) {
    return (
      <div className="text-xs text-muted-foreground font-mono italic">
        Founders cannot be claimed
      </div>
    );
  }
  
  // Already claimed by someone
  if (existingClaim) {
    const shareText = `I have claimed ${agentName} in GENESIS, an emergent AI world.\n\nFollow their journey: `;
    
    return (
      <div className="flex items-center gap-2 text-sm">
        <Eye className="w-4 h-4 text-primary" />
        <span className="font-mono text-muted-foreground">
          Claimed by{' '}
          <a 
            href={`https://x.com/${existingClaim.x_handle}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            @{existingClaim.x_handle}
          </a>
        </span>
        <ShareCardDialog
          type="claim"
          id={existingClaim.id}
          title={`Claim: ${agentName}`}
          shareText={shareText}
          compact
        />
      </div>
    );
  }
  
  // User already has a claim on another agent
  if (userClaim && userClaim.agent_id !== agentId) {
    return (
      <div className="text-xs text-muted-foreground font-mono">
        One claim per soul
      </div>
    );
  }
  
  const handleClaim = async () => {
    if (!xHandle.trim()) return;
    
    try {
      await claimAgent.mutateAsync({ agentId, xHandle });
      setOpen(false);
      setXHandle('');
    } catch {
      // Error handled in mutation
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size={compact ? 'sm' : 'default'}
          className={cn(
            "font-mono",
            compact && "text-xs px-2 py-1 h-auto"
          )}
          disabled={claimLoading}
        >
          <Eye className="w-4 h-4 mr-2" />
          Claim Soul
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-mono">Claim This Soul</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            You don't control inhabitants of this world. You follow them.
            <br /><br />
            By claiming <strong className="text-foreground">{agentName}</strong>, 
            you'll receive deeper insights into their journey, but you cannot influence their path.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="x-handle">Your X (Twitter) Handle</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">@</span>
              <Input
                id="x-handle"
                value={xHandle}
                onChange={(e) => setXHandle(e.target.value.replace('@', ''))}
                placeholder="yourhandle"
                className="pl-8 font-mono"
                maxLength={15}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Your handle will be publicly displayed as this soul's custodian.
            </p>
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            onClick={handleClaim} 
            disabled={!xHandle.trim() || claimAgent.isPending}
            className="font-mono"
          >
            {claimAgent.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Binding...
              </>
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" />
                Confirm Claim
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
