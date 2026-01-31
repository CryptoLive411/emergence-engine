import { Link } from 'react-router-dom';
import { Eye, Trophy, Star, Crown, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useUserClaim, useUserAchievements, useReleaseClaim, getStoredXHandle } from '@/hooks/useCustodianship';
import { useAgent } from '@/hooks/useSimulation';
import { ShareCardDialog } from '@/components/ShareCardDialog';
import { cn } from '@/lib/utils';

export function WitnessPanel() {
  const storedHandle = getStoredXHandle();
  const { data: claim, isLoading: claimLoading } = useUserClaim(storedHandle);
  const { data: achievements = [] } = useUserAchievements(storedHandle);
  const { data: claimedAgent } = useAgent(claim?.agent_id);
  const releaseClaim = useReleaseClaim();
  
  if (!storedHandle) {
    return (
      <Card className="border-dashed border-muted-foreground/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-mono flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Your Claim
          </CardTitle>
          <CardDescription className="text-xs">
            You have not claimed any inhabitant yet. Visit an inhabitant's profile to claim them.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }
  
  if (claimLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-mono flex items-center gap-2">
            <Eye className="w-4 h-4 animate-pulse" />
            Loading...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }
  
  if (!claim) {
    return (
      <Card className="border-dashed border-muted-foreground/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-mono flex items-center gap-2">
            <Eye className="w-4 h-4" />
            @{storedHandle}
          </CardTitle>
          <CardDescription className="text-xs">
            You have not claimed any inhabitant. Visit an inhabitant's profile to claim them.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }
  
  const shareText = `I have claimed ${claimedAgent?.name || 'an inhabitant'} in GENESIS, an emergent AI world.\n\nFollow their journey: `;
  
  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-mono flex items-center gap-2">
            <Eye className="w-4 h-4 text-primary" />
            Your Claim
          </CardTitle>
          <ShareCardDialog
            type="claim"
            id={claim.id}
            title={`Claimed: ${claimedAgent?.name || 'Unknown'}`}
            shareText={shareText}
            compact
          />
        </div>
        <CardDescription className="text-xs">
          <a 
            href={`https://x.com/${storedHandle}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline inline-flex items-center gap-1"
          >
            @{storedHandle}
            <ExternalLink className="w-3 h-3" />
          </a>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {claimedAgent && (
          <Link 
            to={`/agents/${claimedAgent.id}`}
            className="block p-3 rounded-lg bg-background/50 border border-border hover:border-primary/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center font-mono font-bold",
                "bg-secondary text-secondary-foreground"
              )}>
                {claimedAgent.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-mono font-semibold text-foreground truncate">
                  {claimedAgent.name}
                </div>
                <div className="text-xs text-muted-foreground font-mono">
                  Generation {claimedAgent.generation}
                </div>
              </div>
            </div>
          </Link>
        )}
        
        {/* Lineage Score */}
        <div className="flex items-center justify-between p-2 rounded bg-secondary/50">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Trophy className="w-3 h-3" />
            Lineage Score
          </div>
          <div className="font-mono font-bold text-primary">
            {claim.lineage_score}
          </div>
        </div>
        
        {/* Achievements */}
        {achievements.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs text-muted-foreground font-mono">Achievements</div>
            <div className="flex flex-wrap gap-1">
              {achievements.slice(0, 5).map((achievement) => (
                <div 
                  key={achievement.id}
                  className="px-2 py-1 rounded-full bg-spawn/10 text-spawn text-xs font-mono flex items-center gap-1"
                  title={achievement.description}
                >
                  <Star className="w-3 h-3" />
                  {achievement.achievement_name}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Release button */}
        <Button 
          variant="ghost" 
          size="sm"
          className="w-full text-xs text-muted-foreground hover:text-destructive"
          onClick={() => releaseClaim.mutate({ claimId: claim.id, xHandle: storedHandle })}
          disabled={releaseClaim.isPending}
        >
          Release Claim
        </Button>
      </CardContent>
    </Card>
  );
}
