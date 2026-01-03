-- Schedule the process-follow-ups function to run every 5 minutes
SELECT cron.schedule(
  'process-follow-ups-every-5-min',
  '*/5 * * * *',
  $$
  SELECT
    net.http_post(
        url:='https://syqawvakxxfaohcgrenn.supabase.co/functions/v1/process-follow-ups',
        headers:=jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5cWF3dmFreHhmYW9oY2dyZW5uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1NjQ5NzMsImV4cCI6MjA4MTE0MDk3M30.KGF1oh3uEybutkDklVgmbHO_mWC6lZ1vBDhCg0f1vZA'
        ),
        body:=jsonb_build_object('time', now())
    ) as request_id;
  $$
);