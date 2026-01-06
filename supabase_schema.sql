-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES TABLE
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  name text,
  avatar text,
  role text default 'Developer',
  is_admin boolean default false,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Policies
create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- 2. STANDUPS TABLE
create table public.standups (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  date text not null, -- Storing as ISO string YYYY-MM-DD
  yesterday text,
  today text,
  blockers text,
  mood text check (mood in ('happy', 'neutral', 'stressed')),
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table public.standups enable row level security;

create policy "Standups are viewable by everyone."
  on standups for select
  using ( true );

create policy "Users can create their own standups."
  on standups for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own standups."
  on standups for update
  using ( auth.uid() = user_id );

create policy "Users can delete their own standups."
  on standups for delete
  using ( auth.uid() = user_id );

-- 3. TASKS TABLE
create table public.tasks (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  status text check (status in ('todo', 'in-progress', 'done')) default 'todo',
  creator_id uuid references public.profiles(id) not null,
  assignee_id uuid references public.profiles(id),
  due_date text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table public.tasks enable row level security;

create policy "Tasks are viewable by everyone."
  on tasks for select
  using ( true );

create policy "Authenticated users can create tasks."
  on tasks for insert
  with check ( auth.role() = 'authenticated' );

create policy "Users can update tasks."
  on tasks for update
  using ( auth.role() = 'authenticated' );

-- 4. TRIGGER FOR NEW USER CREATION (Fixes "Database error saving new user")
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, name, avatar)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'full_name', new.email),
    coalesce(new.raw_user_meta_data->>'avatar_url', '')
  );
  return new;
end;
$$;

-- Drop existing trigger if it exists to avoid conflicts
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
