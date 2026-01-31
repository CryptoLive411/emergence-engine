-- Create a public view of agents that excludes sensitive identity_prompt
-- This view will be used for all client queries instead of the agents table directly

CREATE VIEW public.agents_public
WITH (security_invoker=on) AS
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

-- Grant SELECT on the view to anon and authenticated roles
GRANT SELECT ON public.agents_public TO anon;
GRANT SELECT ON public.agents_public TO authenticated;

-- Update the RLS policy on agents table to deny direct SELECT access
-- This forces all queries to go through the view
DROP POLICY IF EXISTS "Anyone can view agents" ON public.agents;

CREATE POLICY "No direct SELECT access to agents"
ON public.agents FOR SELECT
USING (
  -- Only service_role can access agents directly (for edge functions)
  (current_setting('request.jwt.claims', true)::json->>'role') = 'service_role'
);