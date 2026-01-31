-- Fix linter finding: ensure public view runs with invoker privileges
-- so it respects caller permissions/RLS rather than view owner's.
ALTER VIEW public.agents_public SET (security_invoker = true);