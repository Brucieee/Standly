-- 4. ENSURE UPDATE PERMISSIONS FOR TASKS
drop policy if exists "Users can update tasks." on tasks;
create policy "Users can update tasks."
  on tasks for update
  using ( auth.role() = 'authenticated' );
