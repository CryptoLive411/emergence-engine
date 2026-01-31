-- Claims table: links X handles to inhabitants
CREATE TABLE public.claims (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  x_handle TEXT NOT NULL,
  claimed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  lineage_score INTEGER NOT NULL DEFAULT 0,
  UNIQUE(agent_id),
  UNIQUE(x_handle)
);

-- Event annotations by witnesses
CREATE TABLE public.annotations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  x_handle TEXT NOT NULL,
  annotation_type TEXT NOT NULL CHECK (annotation_type IN ('highlight', 'tag', 'note')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Achievements earned by witnesses
CREATE TABLE public.achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  x_handle TEXT NOT NULL,
  achievement_type TEXT NOT NULL,
  achievement_name TEXT NOT NULL,
  description TEXT NOT NULL,
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE(x_handle, achievement_type)
);

-- Enable RLS
ALTER TABLE public.claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.annotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

-- Claims: anyone can view, service role inserts
CREATE POLICY "Anyone can view claims" ON public.claims FOR SELECT USING (true);
CREATE POLICY "Service role can insert claims" ON public.claims FOR INSERT WITH CHECK (true);
CREATE POLICY "Service role can update claims" ON public.claims FOR UPDATE USING (true);
CREATE POLICY "Service role can delete claims" ON public.claims FOR DELETE USING (true);

-- Annotations: anyone can view, service role inserts
CREATE POLICY "Anyone can view annotations" ON public.annotations FOR SELECT USING (true);
CREATE POLICY "Service role can insert annotations" ON public.annotations FOR INSERT WITH CHECK (true);

-- Achievements: anyone can view, service role inserts
CREATE POLICY "Anyone can view achievements" ON public.achievements FOR SELECT USING (true);
CREATE POLICY "Service role can insert achievements" ON public.achievements FOR INSERT WITH CHECK (true);