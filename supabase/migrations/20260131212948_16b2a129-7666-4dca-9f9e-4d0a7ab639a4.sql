-- Change scheduled cadence using cron.alter_job (no direct writes to cron.job)
DO $$
DECLARE
  tick_job_id bigint;
  summary_job_id bigint;
BEGIN
  SELECT jobid INTO tick_job_id
  FROM cron.job
  WHERE command = 'SELECT public.trigger_world_tick();'
  LIMIT 1;

  IF tick_job_id IS NOT NULL THEN
    PERFORM cron.alter_job(job_id := tick_job_id, schedule := '*/10 * * * *');
  END IF;

  SELECT jobid INTO summary_job_id
  FROM cron.job
  WHERE command = 'SELECT public.trigger_summary_generation()'
  LIMIT 1;

  IF summary_job_id IS NOT NULL THEN
    -- Run 1 minute after each tick (still every 10 minutes)
    PERFORM cron.alter_job(job_id := summary_job_id, schedule := '1-59/10 * * * *');
  END IF;
END $$;