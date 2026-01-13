-- Add the new column to store an array of assignee IDs
ALTER TABLE deadlines
ADD COLUMN assignee_ids UUID[];

-- Migrate the data from the old single assignee column to the new array column
-- This will create an array with a single element for each existing assignee
UPDATE deadlines
SET assignee_ids = ARRAY[assignee_id]
WHERE assignee_id IS NOT NULL;

-- Remove the old single assignee column
ALTER TABLE deadlines
DROP COLUMN assignee_id;
