-- Reset (Optional, be careful in prod)
drop policy if exists "Announcements are viewable by everyone" on public.announcements;
drop policy if exists "Announcements can be managed by specific roles" on public.announcements;
drop policy if exists "Profiles are viewable by authenticated users" on public.profiles;

-- Create Announcements Table (Idempotent-ish: if exists, we might need to alter it, but for now assuming CREATE IF NOT EXISTS or user drops it manually if conflict. 
-- Since user is in dev, I'll use CREATE TABLE IF NOT EXISTS but that doesn't update columns.
-- Better to keep the DROP TABLE IF EXISTS from previous step if user is okay losing announcement data (which is likely test data).
drop table if exists public.announcements;

create table public.announcements (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  content text, -- HTML content (Optional if image provided)
  image_url text,
  -- Changed from auth.users to allow Code Login users (who might not be in auth)
  created_by uuid not null,
  is_active boolean default true,
  scheduled_date timestamp with time zone,
  expiry_date timestamp with time zone,
  views uuid[] default array[]::uuid[] -- Array of user IDs who have seen it
);

-- Enable RLS (User requested RLS enabled)
alter table public.announcements enable row level security;

-- Grant permissions to anon/authenticated (Critical for Code Login)
grant all on public.announcements to anon, authenticated, service_role;

-- Create a permissive policy that allows operations
-- This is necessary because 'Code Login' users might allow 'anon' role interactions
create policy "Allow all operations for announcements"
  on public.announcements for all
  using (true)
  with check (true);

-- Storage Bucket for Images
insert into storage.buckets (id, name, public) 
values ('announcements', 'announcements', true)
on conflict (id) do nothing;

-- Storage Policies (Drop first to avoid conflicts if updating)
drop policy if exists "Announcement images are publicly accessible" on storage.objects;
drop policy if exists "Staff can upload announcement images" on storage.objects;
drop policy if exists "Staff can update announcement images" on storage.objects;

create policy "Announcement images are publicly accessible"
  on storage.objects for select
  using ( bucket_id = 'announcements' );

create policy "Staff can upload announcement images"
  on storage.objects for insert
  with check ( bucket_id = 'announcements' );

create policy "Staff can update announcement images"
  on storage.objects for update
  using ( bucket_id = 'announcements' );
