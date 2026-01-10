-- Add remarks column to deadlines table if it doesn't exist
ALTER TABLE public.deadlines ADD COLUMN IF NOT EXISTS remarks text;
