-- Create enums for the simulation
CREATE TYPE public.agent_status AS ENUM ('ACTIVE', 'INACTIVE');
CREATE TYPE public.agent_loyalty AS ENUM ('PARENT', 'INDEPENDENT', 'REBELLIOUS');
CREATE TYPE public.event_type AS ENUM ('SPEECH', 'ACTION', 'SPAWN', 'SYSTEM');
CREATE TYPE public.world_status AS ENUM ('ACTIVE', 'PAUSED', 'ENDED');

-- Create worlds table
CREATE TABLE public.worlds (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL DEFAULT 'Genesis Experiment',
  status public.world_status NOT NULL DEFAULT 'PAUSED',
  tick_interval_minutes INTEGER NOT NULL DEFAULT 30,
  max_active_agents INTEGER NOT NULL DEFAULT 50,
  spawn_cost_energy INTEGER NOT NULL DEFAULT 25,
  chaos_factor REAL NOT NULL DEFAULT 0.15,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create turns table
CREATE TABLE public.turns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  world_id UUID NOT NULL REFERENCES public.worlds(id) ON DELETE CASCADE,
  turn_number INTEGER NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(world_id, turn_number)
);

-- Create agents table
CREATE TABLE public.agents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  world_id UUID NOT NULL REFERENCES public.worlds(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  generation INTEGER NOT NULL DEFAULT 0,
  parent_agent_id UUID REFERENCES public.agents(id) ON DELETE SET NULL,
  identity_prompt TEXT,
  traits JSONB NOT NULL DEFAULT '[]',
  purpose TEXT NOT NULL,
  loyalty public.agent_loyalty NOT NULL DEFAULT 'INDEPENDENT',
  energy INTEGER NOT NULL DEFAULT 100,
  influence_points INTEGER NOT NULL DEFAULT 0,
  status public.agent_status NOT NULL DEFAULT 'ACTIVE',
  is_founder BOOLEAN NOT NULL DEFAULT false,
  founder_type TEXT CHECK (founder_type IS NULL OR founder_type IN ('A', 'B')),
  created_turn INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create events table
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  world_id UUID NOT NULL REFERENCES public.worlds(id) ON DELETE CASCADE,
  turn_id UUID NOT NULL REFERENCES public.turns(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES public.agents(id) ON DELETE SET NULL,
  type public.event_type NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create memories table (private thoughts for agents)
CREATE TABLE public.memories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  world_id UUID NOT NULL REFERENCES public.worlds(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  turn_id UUID NOT NULL REFERENCES public.turns(id) ON DELETE CASCADE,
  private_thought TEXT NOT NULL,
  memory_summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create briefings table
CREATE TABLE public.briefings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  world_id UUID NOT NULL REFERENCES public.worlds(id) ON DELETE CASCADE,
  turn_id UUID NOT NULL REFERENCES public.turns(id) ON DELETE CASCADE,
  headline TEXT NOT NULL,
  summary TEXT NOT NULL,
  key_events JSONB NOT NULL DEFAULT '[]',
  population INTEGER NOT NULL DEFAULT 0,
  dominant_norms JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(turn_id)
);

-- Create indexes for performance
CREATE INDEX idx_agents_world ON public.agents(world_id);
CREATE INDEX idx_agents_parent ON public.agents(parent_agent_id);
CREATE INDEX idx_agents_status ON public.agents(status);
CREATE INDEX idx_events_world ON public.events(world_id);
CREATE INDEX idx_events_turn ON public.events(turn_id);
CREATE INDEX idx_events_agent ON public.events(agent_id);
CREATE INDEX idx_events_created ON public.events(created_at DESC);
CREATE INDEX idx_turns_world ON public.turns(world_id);
CREATE INDEX idx_briefings_world ON public.briefings(world_id);

-- Enable RLS on all tables
ALTER TABLE public.worlds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.turns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.briefings ENABLE ROW LEVEL SECURITY;

-- Public read policies (this is a spectator-first app)
CREATE POLICY "Anyone can view worlds" ON public.worlds FOR SELECT USING (true);
CREATE POLICY "Anyone can view turns" ON public.turns FOR SELECT USING (true);
CREATE POLICY "Anyone can view agents" ON public.agents FOR SELECT USING (true);
CREATE POLICY "Anyone can view events" ON public.events FOR SELECT USING (true);
CREATE POLICY "Anyone can view briefings" ON public.briefings FOR SELECT USING (true);

-- Memories are private - only viewable by service role (edge functions)
CREATE POLICY "Memories are private" ON public.memories FOR SELECT USING (false);

-- Service role write policies (edge functions will use service role)
CREATE POLICY "Service role can insert worlds" ON public.worlds FOR INSERT WITH CHECK (true);
CREATE POLICY "Service role can update worlds" ON public.worlds FOR UPDATE USING (true);
CREATE POLICY "Service role can insert turns" ON public.turns FOR INSERT WITH CHECK (true);
CREATE POLICY "Service role can update turns" ON public.turns FOR UPDATE USING (true);
CREATE POLICY "Service role can insert agents" ON public.agents FOR INSERT WITH CHECK (true);
CREATE POLICY "Service role can update agents" ON public.agents FOR UPDATE USING (true);
CREATE POLICY "Service role can insert events" ON public.events FOR INSERT WITH CHECK (true);
CREATE POLICY "Service role can insert memories" ON public.memories FOR INSERT WITH CHECK (true);
CREATE POLICY "Service role can insert briefings" ON public.briefings FOR INSERT WITH CHECK (true);

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Trigger for worlds updated_at
CREATE TRIGGER update_worlds_updated_at
  BEFORE UPDATE ON public.worlds
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();