-- FIX ALL PERMISSIONS V2 (Robust Publication Fix)

BEGIN;

-- 1. FIX HOUSEHOLD_MEMBERS PERMISSIONS
-- Ensure users can check if they are members (Crucial for other policies)
ALTER TABLE household_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members can view their own data" ON household_members;
CREATE POLICY "Members can view their own data"
ON household_members FOR SELECT
USING ( auth.uid() = user_id );

-- 2. SET REPLICA IDENTITY (Robust Broadcasts)
ALTER TABLE items REPLICA IDENTITY FULL;
ALTER TABLE lists REPLICA IDENTITY FULL;

-- 3. RESET PUBLICATION (The "Force Set" Switch)
-- Instead of ADD/DROP (which fails if not present), we set the EXACT list of tables we want.
ALTER PUBLICATION supabase_realtime SET TABLE items, lists, household_products;

-- 4. VERIFY ITEMS POLICIES
ALTER TABLE items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read for household" ON items;
CREATE POLICY "Enable read for household" ON items FOR SELECT
USING ( exists (select 1 from household_members where household_id = items.household_id and user_id = auth.uid()) );

DROP POLICY IF EXISTS "Enable insert for household" ON items;
CREATE POLICY "Enable insert for household" ON items FOR INSERT
WITH CHECK ( exists (select 1 from household_members where household_id = items.household_id and user_id = auth.uid()) );

DROP POLICY IF EXISTS "Enable update for household" ON items;
CREATE POLICY "Enable update for household" ON items FOR UPDATE
USING ( exists (select 1 from household_members where household_id = items.household_id and user_id = auth.uid()) );

DROP POLICY IF EXISTS "Enable delete for household" ON items;
CREATE POLICY "Enable delete for household" ON items FOR DELETE
USING ( exists (select 1 from household_members where household_id = items.household_id and user_id = auth.uid()) );

COMMIT;
