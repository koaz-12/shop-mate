-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Table: Profiles (Public profile data for users)
create table profiles (
  id uuid references auth.users not null primary key,
  full_name text,
  avatar_url text,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Table: Households (Family groups)
create table households (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  invite_code text unique not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Table: Household Members (Link users to households)
create table household_members (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) not null,
  household_id uuid references households(id) not null,
  role text default 'member', -- member, admin
  joined_at timestamp with time zone default timezone('utc'::text, now()),
  unique(user_id, household_id)
);

-- Table: Items (Shopping list items)
create table items (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  is_completed boolean default false,
  category text default 'Uncategorized',
  created_by uuid references profiles(id),
  household_id uuid references households(id) not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Realtime subscriptions
begin;
  drop publication if exists supabase_realtime;
  create publication supabase_realtime for table items;
commit;

-- Security Policies (RLS)

-- Profiles
alter table profiles enable row level security;
create policy "Public profiles are viewable by everyone" on profiles for select using (true);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

-- Helper function to get user's households (Avoids infinite recursion in RLS)
create or replace function get_auth_user_households()
returns setof uuid
language sql
security definer
set search_path = public
stable
as $$
  select household_id from household_members where user_id = auth.uid()
$$;

-- Households
alter table households enable row level security;
create policy "Members can view their household" on households for select using (
  id in (select get_auth_user_households())
);
create policy "Users can create households" on households for insert with check (true);

-- Household Members
alter table household_members enable row level security;
create policy "Members can view other members" on household_members for select using (
  household_id in (select get_auth_user_households())
);
-- Allow users to join a household (insert their own row)
create policy "Users can join households" on household_members for insert with check (
  auth.uid() = user_id
);

-- Items
alter table items enable row level security;
create policy "Household members can view items" on items for select using (
  household_id in (select get_auth_user_households())
);
create policy "Household members can insert items" on items for insert with check (
  household_id in (select get_auth_user_households())
);
create policy "Household members can update items" on items for update using (
  household_id in (select get_auth_user_households())
);
create policy "Household members can delete items" on items for delete using (
  household_id in (select get_auth_user_households())
);

-- Functions to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
