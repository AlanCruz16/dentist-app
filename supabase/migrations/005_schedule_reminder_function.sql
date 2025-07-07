-- This script schedules the 'send-reminders' edge function to be called once every day at 9:00 AM UTC.
-- You can change the cron expression to fit your needs. '0 9 * * *' means at minute 0 of hour 9 every day.

-- Ensure the pg_cron extension is enabled
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;

-- Grant usage to the postgres role if not already granted
GRANT USAGE ON SCHEMA cron TO postgres;

-- Schedule the cron job to invoke the edge function
-- The URL is constructed using your project reference ID.
-- IMPORTANT: Replace 'ihunohdxmjwpukadkxdl' with your actual project reference ID if it's different.
SELECT cron.schedule(
    'daily-reminders',
    '0 9 * * *', -- 9:00 AM UTC every day
    $$
    SELECT net.http_post(
        url:='https://ihunohdxmjwpukadkxdl.supabase.co/functions/v1/send-reminders',
        headers:='{"Content-Type":"application/json", "Authorization": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlodW5vaGR4bWp3cHVrYWRreGRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1MDA5NTIsImV4cCI6MjA2MzA3Njk1Mn0.sAO_SP0rbJNlT06ONaUHQIQ2HikBtk0e3Yhwnc0xUfM"}'::jsonb,
        body:='{}'::jsonb
    )
    $$
);

-- Note: For this to work, you must replace 'YOUR_SUPABASE_ANON_KEY' with your actual Supabase anon key.
-- It is recommended to handle the key securely. For cron jobs run by the superuser,
-- you can often use the service_role key for elevated privileges if needed, but for invoking
-- a function that uses the user's session, the anon key is appropriate.
