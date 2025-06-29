-- Create the 'payments' table
CREATE TABLE public.payments (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    patient_id uuid NOT NULL,
    amount_paid numeric NOT NULL,
    payment_date date NOT NULL,
    payment_method character varying NOT NULL,
    service_description text,
    notes text,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT payments_pkey PRIMARY KEY (id),
    CONSTRAINT payments_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(id) ON DELETE CASCADE
);

-- Enable Row Level Security for the 'payments' table
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Create policies for 'payments' table
-- This is a basic policy allowing authenticated users to manage payments.
-- You should refine this based on your specific roles ('owner', 'clerk').
CREATE POLICY "Allow all access to authenticated users"
ON public.payments
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Add comments to the columns for clarity
COMMENT ON COLUMN public.payments.amount_paid IS 'The amount that was paid.';
COMMENT ON COLUMN public.payments.payment_date IS 'The date the payment was made.';
COMMENT ON COLUMN public.payments.payment_method IS 'Method of payment (e.g., cash, card, transfer).';
COMMENT ON COLUMN public.payments.service_description IS 'A brief description of the service paid for.';
