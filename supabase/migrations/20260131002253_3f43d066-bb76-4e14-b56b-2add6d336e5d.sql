-- First, delete the old cron jobs that don't have TICK_SECRET
SELECT cron.unschedule('world-heartbeat');
SELECT cron.unschedule('world-tick-every-10-minutes');

-- Create a new cron job that passes the TICK_SECRET from vault secrets
-- Note: We need to use a database function to get the secret at runtime
CREATE OR REPLACE FUNCTION public.trigger_world_tick()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  tick_secret text;
  result jsonb;
BEGIN
  -- Get the TICK_SECRET from vault (Supabase secrets)
  SELECT decrypted_secret INTO tick_secret
  FROM vault.decrypted_secrets
  WHERE name = 'TICK_SECRET'
  LIMIT 1;

  -- If we have a secret, make the HTTP call
  IF tick_secret IS NOT NULL THEN
    SELECT net.http_post(
      url := 'https://cshqetsefzbrvmvjkqmh.supabase.co/functions/v1/world-tick',
      headers := '{"Content-Type": "application/json"}'::jsonb,
      body := jsonb_build_object('tickSecret', tick_secret)
    ) INTO result;
  END IF;
END;
$$;

-- Schedule the cron job to call our secure function every 10 minutes
SELECT cron.schedule(
  'world-tick-secure',
  '*/10 * * * *',
  $$SELECT public.trigger_world_tick();$$
);