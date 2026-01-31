-- Phase 2: RLS Hardening - Replace overly permissive policies with explicit service_role checks
-- Note: We're using auth.jwt() ->> 'role' to check for service_role explicitly

-- Drop and recreate policies for claims table (most sensitive)
DROP POLICY IF EXISTS "Service role can insert claims" ON public.claims;
DROP POLICY IF EXISTS "Service role can update claims" ON public.claims;
DROP POLICY IF EXISTS "Service role can delete claims" ON public.claims;

CREATE POLICY "Service role can insert claims"
ON public.claims FOR INSERT
WITH CHECK (
  (current_setting('request.jwt.claims', true)::json->>'role') = 'service_role'
);

CREATE POLICY "Service role can update claims"
ON public.claims FOR UPDATE
USING (
  (current_setting('request.jwt.claims', true)::json->>'role') = 'service_role'
);

CREATE POLICY "Service role can delete claims"
ON public.claims FOR DELETE
USING (
  (current_setting('request.jwt.claims', true)::json->>'role') = 'service_role'
);

-- Drop and recreate policies for worlds table
DROP POLICY IF EXISTS "Service role can insert worlds" ON public.worlds;
DROP POLICY IF EXISTS "Service role can update worlds" ON public.worlds;

CREATE POLICY "Service role can insert worlds"
ON public.worlds FOR INSERT
WITH CHECK (
  (current_setting('request.jwt.claims', true)::json->>'role') = 'service_role'
);

CREATE POLICY "Service role can update worlds"
ON public.worlds FOR UPDATE
USING (
  (current_setting('request.jwt.claims', true)::json->>'role') = 'service_role'
);

-- Drop and recreate policies for agents table
DROP POLICY IF EXISTS "Service role can insert agents" ON public.agents;
DROP POLICY IF EXISTS "Service role can update agents" ON public.agents;

CREATE POLICY "Service role can insert agents"
ON public.agents FOR INSERT
WITH CHECK (
  (current_setting('request.jwt.claims', true)::json->>'role') = 'service_role'
);

CREATE POLICY "Service role can update agents"
ON public.agents FOR UPDATE
USING (
  (current_setting('request.jwt.claims', true)::json->>'role') = 'service_role'
);

-- Drop and recreate policies for turns table
DROP POLICY IF EXISTS "Service role can insert turns" ON public.turns;
DROP POLICY IF EXISTS "Service role can update turns" ON public.turns;

CREATE POLICY "Service role can insert turns"
ON public.turns FOR INSERT
WITH CHECK (
  (current_setting('request.jwt.claims', true)::json->>'role') = 'service_role'
);

CREATE POLICY "Service role can update turns"
ON public.turns FOR UPDATE
USING (
  (current_setting('request.jwt.claims', true)::json->>'role') = 'service_role'
);

-- Drop and recreate policies for events table
DROP POLICY IF EXISTS "Service role can insert events" ON public.events;

CREATE POLICY "Service role can insert events"
ON public.events FOR INSERT
WITH CHECK (
  (current_setting('request.jwt.claims', true)::json->>'role') = 'service_role'
);

-- Drop and recreate policies for memories table
DROP POLICY IF EXISTS "Service role can insert memories" ON public.memories;

CREATE POLICY "Service role can insert memories"
ON public.memories FOR INSERT
WITH CHECK (
  (current_setting('request.jwt.claims', true)::json->>'role') = 'service_role'
);

-- Drop and recreate policies for briefings table
DROP POLICY IF EXISTS "Service role can insert briefings" ON public.briefings;

CREATE POLICY "Service role can insert briefings"
ON public.briefings FOR INSERT
WITH CHECK (
  (current_setting('request.jwt.claims', true)::json->>'role') = 'service_role'
);

-- Drop and recreate policies for annotations table
DROP POLICY IF EXISTS "Service role can insert annotations" ON public.annotations;

CREATE POLICY "Service role can insert annotations"
ON public.annotations FOR INSERT
WITH CHECK (
  (current_setting('request.jwt.claims', true)::json->>'role') = 'service_role'
);

-- Drop and recreate policies for achievements table
DROP POLICY IF EXISTS "Service role can insert achievements" ON public.achievements;

CREATE POLICY "Service role can insert achievements"
ON public.achievements FOR INSERT
WITH CHECK (
  (current_setting('request.jwt.claims', true)::json->>'role') = 'service_role'
);

-- Drop and recreate policies for eras table
DROP POLICY IF EXISTS "Service role can insert eras" ON public.eras;
DROP POLICY IF EXISTS "Service role can update eras" ON public.eras;

CREATE POLICY "Service role can insert eras"
ON public.eras FOR INSERT
WITH CHECK (
  (current_setting('request.jwt.claims', true)::json->>'role') = 'service_role'
);

CREATE POLICY "Service role can update eras"
ON public.eras FOR UPDATE
USING (
  (current_setting('request.jwt.claims', true)::json->>'role') = 'service_role'
);

-- Drop and recreate policies for artifacts table
DROP POLICY IF EXISTS "Service role can insert artifacts" ON public.artifacts;
DROP POLICY IF EXISTS "Service role can update artifacts" ON public.artifacts;

CREATE POLICY "Service role can insert artifacts"
ON public.artifacts FOR INSERT
WITH CHECK (
  (current_setting('request.jwt.claims', true)::json->>'role') = 'service_role'
);

CREATE POLICY "Service role can update artifacts"
ON public.artifacts FOR UPDATE
USING (
  (current_setting('request.jwt.claims', true)::json->>'role') = 'service_role'
);

-- Drop and recreate policies for artifact_references table
DROP POLICY IF EXISTS "Service role can insert artifact_references" ON public.artifact_references;

CREATE POLICY "Service role can insert artifact_references"
ON public.artifact_references FOR INSERT
WITH CHECK (
  (current_setting('request.jwt.claims', true)::json->>'role') = 'service_role'
);

-- Drop and recreate policies for world_moods table
DROP POLICY IF EXISTS "Service role can insert world_moods" ON public.world_moods;

CREATE POLICY "Service role can insert world_moods"
ON public.world_moods FOR INSERT
WITH CHECK (
  (current_setting('request.jwt.claims', true)::json->>'role') = 'service_role'
);

-- Drop and recreate policies for cycle_quotes table
DROP POLICY IF EXISTS "Service role can insert cycle_quotes" ON public.cycle_quotes;

CREATE POLICY "Service role can insert cycle_quotes"
ON public.cycle_quotes FOR INSERT
WITH CHECK (
  (current_setting('request.jwt.claims', true)::json->>'role') = 'service_role'
);

-- Drop and recreate policies for presence_markers table
DROP POLICY IF EXISTS "Service role can insert presence_markers" ON public.presence_markers;

CREATE POLICY "Service role can insert presence_markers"
ON public.presence_markers FOR INSERT
WITH CHECK (
  (current_setting('request.jwt.claims', true)::json->>'role') = 'service_role'
);