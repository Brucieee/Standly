-- 1. FIX DELETE PERMISSIONS FOR TASKS
create policy "Users can delete tasks."
  on tasks for delete
  using ( auth.role() = 'authenticated' );

-- 2. SETUP STORAGE FOR AVATARS
-- Create the bucket if it doesn't exist
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Enable RLS on objects (it usually is by default, but good to ensure)
alter table storage.objects enable row level security;

-- Policy: Everyone can view avatars
create policy "Avatar images are publicly accessible."
  on storage.objects for select
  using ( bucket_id = 'avatars' );

-- Policy: Authenticated users can upload avatars
create policy "Authenticated users can upload avatars."
  on storage.objects for insert
  with check ( bucket_id = 'avatars' and auth.role() = 'authenticated' );

-- Policy: Users can update/delete their own avatars
create policy "Users can update own avatar."
  on storage.objects for update
  using ( bucket_id = 'avatars' and auth.uid() = owner );

create policy "Users can delete own avatar."
  on storage.objects for delete
  using ( bucket_id = 'avatars' and auth.uid() = owner );
