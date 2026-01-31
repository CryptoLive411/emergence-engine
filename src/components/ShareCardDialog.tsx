import { useState } from 'react';
import { Share2, Download, Copy, Twitter, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useShareCard, ShareCardType } from '@/hooks/useShareCard';
import { cn } from '@/lib/utils';

interface ShareCardDialogProps {
  type: ShareCardType;
  id: string;
  title: string;
  shareText: string;
  trigger?: React.ReactNode;
  compact?: boolean;
}

export function ShareCardDialog({ 
  type, 
  id, 
  title, 
  shareText,
  trigger,
  compact = false 
}: ShareCardDialogProps) {
  const [open, setOpen] = useState(false);
  const { 
    isGenerating, 
    generatedImage, 
    generateCard, 
    downloadImage, 
    copyImageToClipboard,
    shareToTwitter,
    clearImage 
  } = useShareCard();

  const handleOpen = async (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen && !generatedImage) {
      await generateCard(type, id);
    }
    if (!isOpen) {
      clearImage();
    }
  };

  const defaultTrigger = compact ? (
    <Button variant="ghost" size="icon" className="h-8 w-8">
      <Share2 className="w-4 h-4" />
    </Button>
  ) : (
    <Button variant="outline" size="sm" className="gap-2 font-mono">
      <Share2 className="w-4 h-4" />
      Share
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-mono">Share: {title}</DialogTitle>
          <DialogDescription>
            Generate a shareable image card for social media.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Preview area */}
          <div className={cn(
            "relative aspect-video rounded-lg border border-border overflow-hidden",
            "bg-secondary/30 flex items-center justify-center"
          )}>
            {isGenerating ? (
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <Loader2 className="w-8 h-8 animate-spin" />
                <span className="text-sm font-mono">Generating card...</span>
              </div>
            ) : generatedImage ? (
              <img 
                src={generatedImage} 
                alt={title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-muted-foreground text-sm font-mono">
                Click to generate preview
              </div>
            )}
          </div>

          {/* Actions */}
          {generatedImage && (
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2 font-mono flex-1"
                onClick={() => downloadImage(generatedImage, `genesis-${type}-${id}.png`)}
              >
                <Download className="w-4 h-4" />
                Download
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2 font-mono flex-1"
                onClick={() => copyImageToClipboard(generatedImage)}
              >
                <Copy className="w-4 h-4" />
                Copy
              </Button>
              <Button 
                variant="default" 
                size="sm" 
                className="gap-2 font-mono flex-1"
                onClick={() => shareToTwitter(shareText)}
              >
                <Twitter className="w-4 h-4" />
                Post to X
              </Button>
            </div>
          )}

          {/* Regenerate */}
          {generatedImage && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full text-muted-foreground font-mono"
              onClick={() => generateCard(type, id)}
              disabled={isGenerating}
            >
              {isGenerating ? 'Regenerating...' : 'Regenerate Card'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
