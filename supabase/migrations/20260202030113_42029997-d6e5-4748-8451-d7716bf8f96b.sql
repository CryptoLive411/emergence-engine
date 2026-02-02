-- Revert security_invoker to allow the view to read agents table
-- The view is designed to hide sensitive columns while allowing public reads
ALTER VIEW public.agents_public SET (security_invoker = false);