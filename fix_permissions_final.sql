-- Comprehensive RLS Fix for ShopMate
-- Run this entire script to reset and fix all permissions

-- 1. Helper Function (Security Definer to bypass RLS recursion)
create or replace function get_auth_user_households()
returns setof uuid
language sql
security definer
set search_path = public
stable
as $$
  select household_id from household_members where user_id = auth.uid()
$$;

-- 2. Reset Items Table
alter table items enable row level security;
drop policy if exists "Household members can view items" on items;
drop policy if exists "Household members can insert items" on items;
drop policy if exists "Household members can update items" on items;
drop policy if exists "Household members can delete items" on items;

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

-- 3. Reset Households Table (incorporating 'created_by' fix)
alter table households enable row level security;
-- Add column if missing (idempotent)
do $$ 
begin 
    if not exists (select 1 from information_schema.columns where table_name = 'households' and column_name = 'created_by') then
        alter table households add column created_by uuid references auth.users default auth.uid();
    end if;
end $$;

drop policy if exists "Members can view their household" on households;
drop policy if exists "Members and Creators can view households" on households;
drop policy if exists "Users can create households" on households;

create policy "Members and Creators can view households" on households for select using (
  auth.uid() = created_by or 
  id in (select get_auth_user_households())
);
create policy "Users can create households" on households for insert with check (
  auth.uid() = created_by
);

-- 4. Reset Household Members Table
alter table household_members enable row level security;
drop policy if exists "Members can view other members" on household_members;
drop policy if exists "Users can join households" on household_members;

create policy "Members can view other members" on household_members for select using (
  household_id in (select get_auth_user_households())
);
create policy "Users can join households" on household_members for insert with check (
  auth.uid() = user_id
);

-- 5. Profiles (Public read)
alter table profiles enable row level security;
drop policy if exists "Public profiles are viewable by everyone" on profiles;
create policy "Public profiles are viewable by everyone" on profiles for select using (true);
drop policy if exists "Users can update own profile" on profiles;
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
