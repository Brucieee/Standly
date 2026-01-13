-- IMPORTANT: Before running this, you must enable the pg_cron extension in your Supabase dashboard.
-- Go to Database -> Extensions, search for "cron", and enable it.

-- This command schedules the 'standup-reminder' function to run at 10:00 AM UTC every weekday.
-- You MUST replace the placeholders for your project reference and service role key.
-- You can find these in your Supabase project's API settings.

-- Cron schedule format: 'minute hour day month day-of-week'
-- '0 2 * * 1-5' means at 02:00 UTC, which is 10:00 AM in Philippine Time (UTC+8).
SELECT cron.schedule(
  'standup-reminder-job',
  '0 2 * * 1-5', -- Runs at 10:00 AM PHT, Monday to Friday.
  $$
  SELECT net.http_post(
      url:='https://<YOUR_PROJECT_REF>.supabase.co/functions/v1/standup-reminder',
      headers:='{"Authorization": "Bearer <YOUR_SERVICE_ROLE_KEY>"}'::jsonb
  )
  $$
);

-- To unschedule the job if you need to:
-- SELECT cron.unschedule('standup-reminder-job');
