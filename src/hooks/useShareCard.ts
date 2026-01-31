import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { generateShareCardCanvas, getCardDataForType, ShareCardData } from '@/lib/generateShareCard';

export type ShareCardType = 'quote' | 'artifact' | 'era' | 'claim';

interface ShareCardResult {
  success: boolean;
  imageUrl?: string;
  error?: string;
}

export function useShareCard() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const generateCard = async (type: ShareCardType, id: string): Promise<ShareCardResult> => {
    setIsGenerating(true);
    setGeneratedImage(null);

    try {
      // Fetch the data we need based on type
      let cardData: ShareCardData;

      switch (type) {
        case 'quote': {
          const { data: quote } = await supabase
            .from('cycle_quotes')
            .select('*, agents(name)')
            .eq('id', id)
            .single();
          
          if (!quote) throw new Error('Quote not found');
          
          cardData = getCardDataForType('quote', {
            agentName: (quote.agents as any)?.name,
            quote: quote.quote,
          });
          break;
        }

        case 'artifact': {
          const { data: artifact } = await supabase
            .from('artifacts')
            .select('*, agents:creator_agent_id(name)')
            .eq('id', id)
            .single();
          
          if (!artifact) throw new Error('Artifact not found');
          
          cardData = getCardDataForType('artifact', {
            artifactName: artifact.name,
            artifactType: artifact.artifact_type,
            artifactStatus: artifact.status,
            artifactContent: artifact.content,
            creatorName: (artifact.agents as any)?.name,
            originTurn: artifact.origin_turn,
          });
          break;
        }

        case 'era': {
          const { data: era } = await supabase
            .from('eras')
            .select('*')
            .eq('id', id)
            .single();
          
          if (!era) throw new Error('Era not found');
          
          const cycleRange = era.ended_turn 
            ? `Day ${era.started_turn}–${era.ended_turn}`
            : `Day ${era.started_turn}–Present`;
          
          cardData = getCardDataForType('era', {
            eraName: era.name,
            eraNumber: era.era_number,
            cycleRange,
            triggerReason: era.trigger_reason,
          });
          break;
        }

        case 'claim': {
          const { data: claim } = await supabase
            .from('claims')
            .select('*, agents(name, generation, purpose)')
            .eq('id', id)
            .single();
          
          if (!claim) throw new Error('Claim not found');
          
          cardData = getCardDataForType('claim', {
            xHandle: claim.x_handle,
            agentName: (claim.agents as any)?.name,
            generation: (claim.agents as any)?.generation,
          });
          break;
        }

        default:
          throw new Error('Invalid card type');
      }

      // Generate the image client-side
      const imageUrl = await generateShareCardCanvas(cardData);
      setGeneratedImage(imageUrl);
      return { success: true, imageUrl };

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate share card';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = (imageUrl: string, filename: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyImageToClipboard = async (imageUrl: string) => {
    try {
      // Convert data URL to blob
      const res = await fetch(imageUrl);
      const blob = await res.blob();
      
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
      
      toast.success('Image copied to clipboard');
    } catch {
      toast.error('Failed to copy image');
    }
  };

  const shareToTwitter = (text: string) => {
    const tweetText = encodeURIComponent(text);
    const url = `https://twitter.com/intent/tweet?text=${tweetText}`;
    window.open(url, '_blank');
  };

  return {
    isGenerating,
    generatedImage,
    generateCard,
    downloadImage,
    copyImageToClipboard,
    shareToTwitter,
    clearImage: () => setGeneratedImage(null),
  };
}
