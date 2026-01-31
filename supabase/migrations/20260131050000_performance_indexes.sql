-- Performance Indexes for High Traffic
-- Add indexes on frequently queried columns to speed up queries

-- Events table - most queried table
CREATE INDEX IF NOT EXISTS idx_events_world_created_desc ON public.events(world_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_agent_created ON public.events(agent_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_type_world ON public.events(type, world_id) WHERE type != 'SYSTEM';

-- Agents table - frequently filtered by status
CREATE INDEX IF NOT EXISTS idx_agents_world_status ON public.agents(world_id, status);
CREATE INDEX IF NOT EXISTS idx_agents_parent ON public.agents(parent_agent_id) WHERE parent_agent_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_agents_founder ON public.agents(world_id, is_founder) WHERE is_founder = true;

-- Briefings table
CREATE INDEX IF NOT EXISTS idx_briefings_world_created_desc ON public.briefings(world_id, created_at DESC);

-- Artifacts table
CREATE INDEX IF NOT EXISTS idx_artifacts_world_created ON public.artifacts(world_id, created_at DESC);

-- Claims table (custodianship)
CREATE INDEX IF NOT EXISTS idx_claims_handle ON public.claims(x_handle);
CREATE INDEX IF NOT EXISTS idx_claims_agent ON public.claims(agent_id);

-- Annotations table
CREATE INDEX IF NOT EXISTS idx_annotations_event ON public.annotations(event_id);

-- Achievements table
CREATE INDEX IF NOT EXISTS idx_achievements_handle ON public.achievements(x_handle);

-- Add composite index for common query pattern
CREATE INDEX IF NOT EXISTS idx_events_world_type_created ON public.events(world_id, type, created_at DESC);

-- Analyze tables to update statistics
ANALYZE public.events;
ANALYZE public.agents;
ANALYZE public.briefings;
ANALYZE public.artifacts;
ANALYZE public.claims;
