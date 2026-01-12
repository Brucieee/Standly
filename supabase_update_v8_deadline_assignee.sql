ALTER TABLE deadlines 
ADD COLUMN assignee_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
