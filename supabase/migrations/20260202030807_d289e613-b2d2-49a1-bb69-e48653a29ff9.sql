-- Create an internal secrets table the backend scheduler can read (kept private via RLS)
CREATE TABLE IF NOT EXISTS public.internal_secrets (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.internal_secrets ENABLE ROW LEVEL SECURITY;

-- Replace policy deterministically (idempotent)
DROP POLICY IF EXISTS "Service role can manage internal secrets" ON public.internal_secrets;
CREATE POLICY "Service role can manage internal secrets"
  ON public.internal_secrets
  FOR ALL
  USING (((current_setting('request.jwt.claims'::text, true))::json ->> 'role'::text) = 'service_role'::text)
  WITH CHECK (((current_setting('request.jwt.claims'::text, true))::json ->> 'role'::text) = 'service_role'::text);

-- Timestamp helper (safe to CREATE OR REPLACE)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $fn$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$fn$ LANGUAGE plpgsql SET search_path = public;

-- Keep updated_at fresh
DROP TRIGGER IF EXISTS update_internal_secrets_updated_at ON public.internal_secrets;
CREATE TRIGGER update_internal_secrets_updated_at
BEFORE UPDATE ON public.internal_secrets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Ensure a tick secret exists (generated in-db; never exposed publicly)
INSERT INTO public.internal_secrets (key, value)
VALUES ('tick_secret', gen_random_uuid()::text)
ON CONFLICT (key) DO NOTHING;

-- Update the scheduler trigger so it can read the secret reliably and invoke world-tick
CREATE OR REPLACE FUNCTION public.trigger_world_tick()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  tick_secret text;
  result jsonb;
BEGIN
  SELECT value INTO tick_secret
  FROM public.internal_secrets
  WHERE key = 'tick_secret'
  LIMIT 1;

  IF tick_secret IS NOT NULL THEN
    SELECT net.http_post(
      url := 'https://cshqetsefzbrvmvjkqmh.supabase.co/functions/v1/world-tick',
      headers := '{"Content-Type": "application/json"}'::jsonb,
      body := jsonb_build_object('tickSecret', tick_secret)
    ) INTO result;
  END IF;
END;
$function$;