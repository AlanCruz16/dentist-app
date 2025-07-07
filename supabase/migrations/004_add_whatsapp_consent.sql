-- Add a column to the patients table to store consent for WhatsApp reminders.
-- We are making it nullable and defaulting to FALSE for existing records.
ALTER TABLE public.patients
ADD COLUMN IF NOT EXISTS allow_whatsapp_reminders BOOLEAN DEFAULT FALSE;

-- Add a comment to the column for clarity
COMMENT ON COLUMN public.patients.allow_whatsapp_reminders IS 'Indicates if the patient has given consent to receive reminders via WhatsApp.';
