import { useState } from 'react';
import { MessageSquare, Tag, Star, Plus, ExternalLink, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useEventAnnotations, useAddAnnotation, getStoredXHandle } from '@/hooks/useCustodianship';
import { cn } from '@/lib/utils';

interface EventAnnotationsProps {
  eventId: string;
  compact?: boolean;
}

export function EventAnnotations({ eventId, compact = false }: EventAnnotationsProps) {
  const [open, setOpen] = useState(false);
  const [annotationType, setAnnotationType] = useState<'highlight' | 'tag' | 'note'>('highlight');
  const [content, setContent] = useState('');
  
  const storedHandle = getStoredXHandle();
  const { data: annotations = [] } = useEventAnnotations(eventId);
  const addAnnotation = useAddAnnotation();
  
  const handleSubmit = async () => {
    if (!storedHandle || !content.trim()) return;
    
    try {
      await addAnnotation.mutateAsync({
        eventId,
        xHandle: storedHandle,
        annotationType,
        content: content.trim(),
      });
      setContent('');
      setOpen(false);
    } catch {
      // Error handled in mutation
    }
  };
  
  const typeConfig = {
    highlight: { icon: Star, label: 'Highlight', color: 'text-spawn' },
    tag: { icon: Tag, label: 'Tag', color: 'text-action' },
    note: { icon: MessageSquare, label: 'Note', color: 'text-primary' },
  };
  
  return (
    <div className="space-y-2">
      {/* Existing annotations */}
      {annotations.length > 0 && (
        <div className={cn("space-y-1", compact && "hidden")}>
          {annotations.map((annotation) => {
            const config = typeConfig[annotation.annotation_type];
            const Icon = config.icon;
            
            return (
              <div 
                key={annotation.id}
                className="flex items-start gap-2 p-2 rounded bg-secondary/30 text-xs"
              >
                <Icon className={cn("w-3 h-3 mt-0.5 shrink-0", config.color)} />
                <div className="flex-1 min-w-0">
                  <div className="text-foreground">{annotation.content}</div>
                  <a 
                    href={`https://x.com/${annotation.x_handle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary inline-flex items-center gap-1"
                  >
                    @{annotation.x_handle}
                    <ExternalLink className="w-2 h-2" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {/* Annotation count badge (compact mode) */}
      {compact && annotations.length > 0 && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <MessageSquare className="w-3 h-3" />
          {annotations.length}
        </div>
      )}
      
      {/* Add annotation button */}
      {storedHandle && (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm"
              className="text-xs h-auto py-1 px-2 text-muted-foreground hover:text-foreground"
            >
              <Plus className="w-3 h-3 mr-1" />
              Annotate
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="start">
            <div className="space-y-3">
              <div className="font-mono text-sm font-medium">Add Annotation</div>
              
              <Select 
                value={annotationType} 
                onValueChange={(v) => setAnnotationType(v as typeof annotationType)}
              >
                <SelectTrigger className="text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="highlight">
                    <div className="flex items-center gap-2">
                      <Star className="w-3 h-3 text-spawn" />
                      Highlight (mark as significant)
                    </div>
                  </SelectItem>
                  <SelectItem value="tag">
                    <div className="flex items-center gap-2">
                      <Tag className="w-3 h-3 text-action" />
                      Tag (add a label)
                    </div>
                  </SelectItem>
                  <SelectItem value="note">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-3 h-3 text-primary" />
                      Note (write observation)
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              
              {annotationType === 'tag' ? (
                <Input
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="e.g., First Schism, Betrayal"
                  className="text-xs"
                  maxLength={50}
                />
              ) : (
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={
                    annotationType === 'highlight'
                      ? "Why is this moment significant?"
                      : "Your observation..."
                  }
                  className="text-xs resize-none"
                  rows={3}
                  maxLength={500}
                />
              )}
              
              <Button 
                onClick={handleSubmit}
                disabled={!content.trim() || addAnnotation.isPending}
                size="sm"
                className="w-full"
              >
                {addAnnotation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Add to Record'
                )}
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
