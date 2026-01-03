-- Fix RLS policies to ensure Realtime works for all household members

-- 1. Drop existing policies to be clean (optional, but safer to avoid conflicts)
drop policy if exists "Household members can view items" on items;
drop policy if exists "Household members can insert items" on items;
drop policy if exists "Household members can update items" on items;
drop policy if exists "Household members can delete items" on items;

-- 2. Re-create robust policies

-- VIEW: Vital for Realtime. You must be able to SELECT the row to get the notification.
create policy "Household members can view items"
on items for select
using (
  household_id in (
    select household_id from household_members where user_id = auth.uid()
  )
);

-- INSERT
create policy "Household members can insert items"
on items for insert
with check (
  household_id in (
    select household_id from household_members where user_id = auth.uid()
  )
);

-- UPDATE
create policy "Household members can update items"
on items for update
using (
  household_id in (
    select household_id from household_members where user_id = auth.uid()
  )
);

-- DELETE
create policy "Household members can delete items"
on items for delete
using (
  household_id in (
    select household_id from household_members where user_id = auth.uid()
  )
);

-- Enable RLS just in case
alter table items enable row level security;
