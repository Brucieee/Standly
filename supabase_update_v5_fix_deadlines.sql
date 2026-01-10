DO $$
BEGIN
    -- 1. DROP POTENTIAL EXISTING CONSTRAINTS
    -- We try to drop variations of the constraint name to be safe
    BEGIN
        ALTER TABLE public.deadlines DROP CONSTRAINT IF EXISTS deadlines_status_check;
    EXCEPTION WHEN OTHERS THEN NULL; END;
    
    BEGIN
        ALTER TABLE public.deadlines DROP CONSTRAINT IF EXISTS deadlines_status_check1;
    EXCEPTION WHEN OTHERS THEN NULL; END;

    -- 2. REMOVE OLD DEFAULT VALUE
    -- If the default is still 'todo', it might cause issues for new inserts if the client doesn't send a status
    ALTER TABLE public.deadlines ALTER COLUMN status DROP DEFAULT;

    -- 3. MIGRATE DATA
    -- Normalize existing known values
    UPDATE public.deadlines SET status = 'Pending' WHERE status = 'todo';
    UPDATE public.deadlines SET status = 'In Progress' WHERE status = 'in-progress';
    UPDATE public.deadlines SET status = 'Completed' WHERE status = 'done';

    -- Clean up ANY remaining invalid data (e.g. nulls, typos, old testing data)
    -- This ensures the subsequent ADD CONSTRAINT will succeed 100%
    UPDATE public.deadlines 
    SET status = 'Pending' 
    WHERE status NOT IN ('Pending', 'In Progress', 'Completed') OR status IS NULL;

    -- 4. ADD NEW CONSTRAINT
    ALTER TABLE public.deadlines ADD CONSTRAINT deadlines_status_check CHECK (status IN ('Pending', 'In Progress', 'Completed'));

    -- 5. SET NEW DEFAULT
    ALTER TABLE public.deadlines ALTER COLUMN status SET DEFAULT 'Pending';

END $$;