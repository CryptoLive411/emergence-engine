-- Eras: Named periods in world history
CREATE TABLE public.eras (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  world_id UUID NOT NULL REFERENCES public.worlds(id) ON DELETE CASCADE,
  era_number INTEGER NOT NULL,
  name TEXT NOT NULL,
  started_turn INTEGER NOT NULL,
  ended_turn INTEGER,
  trigger_reason TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Artifacts: Things agents create and name
CREATE TABLE public.artifacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  world_id UUID NOT NULL REFERENCES public.worlds(id) ON DELETE CASCADE,
  creator_agent_id UUID REFERENCES public.agents(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  artifact_type TEXT NOT NULL CHECK (artifact_type IN ('text', 'concept', 'institution', 'symbol', 'place')),
  content TEXT NOT NULL,
  origin_turn INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'emerging' CHECK (status IN ('emerging', 'contested', 'canonized', 'forgotten', 'mythic')),
  reference_count INTEGER NOT NULL DEFAULT 1,
  last_referenced_turn INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Artifact references: Track when artifacts are mentioned
CREATE TABLE public.artifact_references (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  artifact_id UUID NOT NULL REFERENCES public.artifacts(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES public.agents(id) ON DELETE SET NULL,
  turn_id UUID NOT NULL REFERENCES public.turns(id) ON DELETE CASCADE,
  context TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- World moods: Periodic mood snapshots
CREATE TABLE public.world_moods (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  world_id UUID NOT NULL REFERENCES public.worlds(id) ON DELETE CASCADE,
  turn_id UUID NOT NULL REFERENCES public.turns(id) ON DELETE CASCADE,
  mood TEXT NOT NULL CHECK (mood IN ('calm', 'uneasy', 'fragmenting', 'volatile', 'collapsing', 'reorganizing')),
  stability_score REAL NOT NULL,
  conflict_rate REAL NOT NULL,
  belief_entropy REAL NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(turn_id)
);

-- Quotes of the cycle: Notable utterances
CREATE TABLE public.cycle_quotes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  world_id UUID NOT NULL REFERENCES public.worlds(id) ON DELETE CASCADE,
  turn_id UUID NOT NULL REFERENCES public.turns(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES public.agents(id) ON DELETE SET NULL,
  quote TEXT NOT NULL,
  impact_score REAL NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(turn_id)
);

-- Presence markers: Track who was present for moments
CREATE TABLE public.presence_markers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  x_handle TEXT NOT NULL,
  witnessed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(event_id, x_handle)
);

-- Enable RLS
ALTER TABLE public.eras ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artifacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artifact_references ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.world_moods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cycle_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.presence_markers ENABLE ROW LEVEL SECURITY;

-- Read policies (public viewing)
CREATE POLICY "Anyone can view eras" ON public.eras FOR SELECT USING (true);
CREATE POLICY "Anyone can view artifacts" ON public.artifacts FOR SELECT USING (true);
CREATE POLICY "Anyone can view artifact_references" ON public.artifact_references FOR SELECT USING (true);
CREATE POLICY "Anyone can view world_moods" ON public.world_moods FOR SELECT USING (true);
CREATE POLICY "Anyone can view cycle_quotes" ON public.cycle_quotes FOR SELECT USING (true);
CREATE POLICY "Anyone can view presence_markers" ON public.presence_markers FOR SELECT USING (true);

-- Write policies (service role only)
CREATE POLICY "Service role can insert eras" ON public.eras FOR INSERT WITH CHECK (true);
CREATE POLICY "Service role can update eras" ON public.eras FOR UPDATE USING (true);
CREATE POLICY "Service role can insert artifacts" ON public.artifacts FOR INSERT WITH CHECK (true);
CREATE POLICY "Service role can update artifacts" ON public.artifacts FOR UPDATE USING (true);
CREATE POLICY "Service role can insert artifact_references" ON public.artifact_references FOR INSERT WITH CHECK (true);
CREATE POLICY "Service role can insert world_moods" ON public.world_moods FOR INSERT WITH CHECK (true);
CREATE POLICY "Service role can insert cycle_quotes" ON public.cycle_quotes FOR INSERT WITH CHECK (true);
CREATE POLICY "Service role can insert presence_markers" ON public.presence_markers FOR INSERT WITH CHECK (true);

-- Add soft mortality status to agents
ALTER TABLE public.agents 
  ALTER COLUMN status TYPE TEXT,
  ADD CONSTRAINT agent_status_check CHECK (status IN ('ACTIVE', 'INACTIVE', 'DORMANT', 'REMEMBERED', 'MYTHIC'));

-- Update the agent_status enum (drop and recreate)
DROP TYPE IF EXISTS public.agent_status CASCADE;

-- Indexes for performance
CREATE INDEX idx_artifacts_world_status ON public.artifacts(world_id, status);
CREATE INDEX idx_artifacts_reference_count ON public.artifacts(reference_count DESC);
CREATE INDEX idx_eras_world ON public.eras(world_id, era_number);
CREATE INDEX idx_world_moods_turn ON public.world_moods(turn_id);
CREATE INDEX idx_cycle_quotes_turn ON public.cycle_quotes(turn_id);