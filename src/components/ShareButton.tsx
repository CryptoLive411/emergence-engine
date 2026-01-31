import { memo, useState } from 'react';
import { Share2, Twitter, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface ShareButtonProps {
  title: string;
  description: string;
  url?: string;
}

/**
 * Share button for viral growth
 * Allows users to share interesting moments on social media
 */
function ShareButtonComponent({ title, description, url }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  
  const shareUrl = url || window.location.href;
  const shareText = `${title}\n\n${description}\n\n`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`${shareText}${shareUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleTwitterShare = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterUrl, '_blank', 'width=550,height=420');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url: shareUrl,
        });
      } catch (error) {
        // User cancelled or error occurred
        console.log('Share cancelled');
      }
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs font-mono text-muted-foreground hover:text-foreground"
        >
          <Share2 className="w-3 h-3 mr-1" />
          Share
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {navigator.share && (
          <DropdownMenuItem onClick={handleNativeShare}>
            <Share2 className="w-4 h-4 mr-2" />
            Share...
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={handleTwitterShare}>
          <Twitter className="w-4 h-4 mr-2" />
          Share on Twitter
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleCopy}>
          {copied ? (
            <>
              <Check className="w-4 h-4 mr-2 text-primary" />
              <span className="text-primary">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 mr-2" />
              Copy link
            </>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export const ShareButton = memo(ShareButtonComponent);
