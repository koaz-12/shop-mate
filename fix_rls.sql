-- Fix for Infinite Recursion in RLS Policies

-- 1. Create helper function to safely get user's households
create or replace function get_auth_user_households()
returns setof uuid
language sql
security definer
set search_path = public
stable
as $$
  select household_id from household_members where user_id = auth.uid()
$$;

-- 2. Drop existing recursive policies
drop policy if exists "Members can view their household" on households;
drop policy if exists "Members can view other members" on household_members;
drop policy if exists "Household members can view items" on items;
drop policy if exists "Household members can insert items" on items;
drop policy if exists "Household members can update items" on items;
drop policy if exists "Household members can delete items" on items;

-- 3. Re-create policies using the helper function

-- Households
create policy "Members can view their household" on households for select using (
  id in (select get_auth_user_households())
);

-- Household Members
create policy "Members can view other members" on household_members for select using (
  household_id in (select get_auth_user_households())
);

-- Items
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
