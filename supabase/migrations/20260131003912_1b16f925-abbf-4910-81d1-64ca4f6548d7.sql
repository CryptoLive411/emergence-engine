-- Drop the old view
DROP VIEW IF EXISTS public.agents_public;

-- Recreate view WITHOUT security_invoker (so it uses definer's permissions)
-- This is safe because the view excludes the sensitive identity_prompt field
CREATE VIEW public.agents_public AS
  SELECT 
    id,
    world_id,
    name,
    generation,
    parent_agent_id,
    traits,
    purpose,
    loyalty,
    energy,
    influence_points,
    status,
    is_founder,
    founder_type,
    created_turn,
    created_at
  FROM public.agents;

-- Grant SELECT on the view to anon and authenticated users
GRANT SELECT ON public.agents_public TO anon, authenticated;

-- Keep the restrictive policy on the base agents table to protect identity_prompt
-- (Already exists from previous migration)