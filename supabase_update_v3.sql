-- 1. ADD TYPE COLUMN TO TASKS
alter table public.tasks 
add column if not exists type text default 'task' check (type in ('task', 'deadline'));

-- 2. ENSURE DELETE PERMISSIONS (Re-run safe)
drop policy if exists "Users can delete tasks." on tasks;
create policy "Users can delete tasks."
  on tasks for delete
  using ( auth.role() = 'authenticated' );

-- 3. ENSURE STORAGE PERMISSIONS (Re-run safe)
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

drop policy if exists "Authenticated users can upload avatars." on storage.objects;
create policy "Authenticated users can upload avatars."
  on storage.objects for insert
  with check ( bucket_id = 'avatars' and auth.role() = 'authenticated' );

drop policy if exists "Users can update own avatar." on storage.objects;
create policy "Users can update own avatar."
  on storage.objects for update
  using ( bucket_id = 'avatars' and auth.uid() = owner );
