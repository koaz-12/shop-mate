-- FIX ALL PERMISSIONS (The Root Cause Solution)

BEGIN;

-- 1. FIX HOUSEHOLD_MEMBERS PERMISSIONS
-- The Check: "Are you in this household?" FAILED if you couldn't read the membership table.
ALTER TABLE household_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members can view their own data" ON household_members;
CREATE POLICY "Members can view their own data"
ON household_members FOR SELECT
USING ( auth.uid() = user_id );

-- 2. SET REPLICA IDENTITY (Required for DELETE/UPDATE sync)
-- Without this, Supabase sometimes sends empty 'old' records for deletions.
ALTER TABLE items REPLICA IDENTITY FULL;
ALTER TABLE lists REPLICA IDENTITY FULL;

-- 3. REFRESH REALTIME PUBLICATION (The "On/Off" Switch)
-- We toggle it to ensure the new Replica Identity settings take effect.
ALTER PUBLICATION supabase_realtime DROP TABLE items;
ALTER PUBLICATION supabase_realtime ADD TABLE items;

ALTER PUBLICATION supabase_realtime DROP TABLE lists;
ALTER PUBLICATION supabase_realtime ADD TABLE lists;

-- 4. VERIFY ITEMS POLICIES (Re-apply standard just to be safe)
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
