-- RESTORE FINAL (Fixing Dependency Error)

BEGIN;

-- 1. Force drop the function and everything that uses it (including the faulty List policy)
DROP FUNCTION IF EXISTS public.is_household_member CASCADE;

-- 2. Drop any lingering items policies just in case
DROP POLICY IF EXISTS "Unified Items Policy" ON items;
DROP POLICY IF EXISTS "Enable read for household" ON items;
DROP POLICY IF EXISTS "Enable insert for household" ON items;
DROP POLICY IF EXISTS "Enable update for household" ON items;
DROP POLICY IF EXISTS "Enable delete for household" ON items;

-- 3. Re-create STANDARD Policies for ITEMS

create policy "Enable read for household" on items for select
using ( exists (select 1 from household_members where household_id = items.household_id and user_id = auth.uid()) );

create policy "Enable insert for household" on items for insert
with check ( exists (select 1 from household_members where household_id = items.household_id and user_id = auth.uid()) );

create policy "Enable update for household" on items for update
using ( exists (select 1 from household_members where household_id = items.household_id and user_id = auth.uid()) );

create policy "Enable delete for household" on items for delete
using ( exists (select 1 from household_members where household_id = items.household_id and user_id = auth.uid()) );

-- 4. Re-create STANDARD Policies for LISTS (Since we deleted the old one via Cascade)

ALTER TABLE lists ENABLE ROW LEVEL SECURITY;

create policy "Enable read for lists" on lists for select
using ( exists (select 1 from household_members where household_id = lists.household_id and user_id = auth.uid()) );

create policy "Enable insert for lists" on lists for insert
with check ( exists (select 1 from household_members where household_id = lists.household_id and user_id = auth.uid()) );

create policy "Enable update for lists" on lists for update
using ( exists (select 1 from household_members where household_id = lists.household_id and user_id = auth.uid()) );

COMMIT;
