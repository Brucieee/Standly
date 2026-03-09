-- Migration to update 'For Approval' to 'Submitted for Approval' in deadline statuses

-- Update the CHECK constraint
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

-- Update existing records
UPDATE public.deadlines
SET status = 'Submitted for Approval'
WHERE status = 'For Approval';

ALTER TABLE public.deadlines
ADD CONSTRAINT deadlines_status_check
CHECK (status IN ('Pending', 'In Progress', 'Completed', 'For QA', 'Completed Beyond Schedule', 'Submitted for Approval'));
