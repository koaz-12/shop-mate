-- Fix RLS and Visibility for Households

-- 1. Add created_by to households if key missing (to allow "read your own writes" before membership)
alter table households add column if not exists created_by uuid references auth.users default auth.uid();

-- 2. Ensure RLS policies are clean
drop policy if exists "Members can view their household" on households;
drop policy if exists "Users can create households" on households;

-- 3. New Household Policies
create policy "Members and Creators can view households" on households for select using (
  auth.uid() = created_by or 
  id in (select get_auth_user_households())
);

create policy "Users can create households" on households for insert with check (
  auth.uid() = created_by
);

-- Ensure Household Members policies exist
drop policy if exists "Users can join households" on household_members;
create policy "Users can join households" on household_members for insert with check (
  auth.uid() = user_id
);
