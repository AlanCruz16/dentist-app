-- Add columns for recurring appointments, checking if they exist first
ALTER TABLE public.appointments
ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS recurrence_rule TEXT;

-- Optional: Add an index if you expect to query for recurring appointments frequently
-- The IF NOT EXISTS clause prevents errors if the index already exists.
CREATE INDEX IF NOT EXISTS idx_appointments_is_recurring ON public.appointments (is_recurring);
