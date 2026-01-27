-- Migration to update deadline statuses

-- 1. Update existing data
-- 'Ready for UAT' -> 'For QA'
-- 'Ready for QA' -> 'For QA' (already matches 'For QA' if regex/check allows, but explicit update for name change)
-- We need to handle the renaming carefully.

UPDATE public.deadlines
SET status = 'For QA'
WHERE status = 'Ready for UAT' OR status = 'Ready for QA';

-- 2. Update the CHECK constraint
-- First drop the existing constraint if possible, or just add a new one if it's named.
-- Since we don't know the exact name of the constraint and can't easily find it without inspecting system catalogs,
-- we will try to drop the constraint by name if we can guess it, or use a DO block.
-- However, easier strategy for Supabase/Postgres often involves altering the column type or constraints.
-- Assuming standard naming 'deadlines_status_check' or similar? Or just altering the column.

-- Let's try to remove the old constraint and add a new one.
DO $$
DECLARE
    con_name text;
BEGIN
    SELECT conname INTO con_name
    FROM pg_constraint
    WHERE conrelid = 'public.deadlines'::regclass
    AND contype = 'c'
    AND pg_get_constraintdef(oid) LIKE '%status%';

    IF con_name IS NOT NULL THEN
        EXECUTE 'ALTER TABLE public.deadlines DROP CONSTRAINT ' || con_name;
    END IF;
END $$;

ALTER TABLE public.deadlines
ADD CONSTRAINT deadlines_status_check
CHECK (status IN ('Pending', 'In Progress', 'Completed', 'For QA', 'Completed Beyond Schedule'));
