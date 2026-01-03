-- RE-APPLYING PERMISSIONS FIX (V3)
-- This script ensures RLS is correct and Realtime is enabled for all tables.

BEGIN;

-- 1. FIX HOUSEHOLD MEMBERS RLS (Prerequisite for Items RLS)
ALTER TABLE household_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members can view their own membership" ON household_members;
CREATE POLICY "Members can view their own membership" 
ON household_members FOR SELECT 
USING (user_id = auth.uid());

-- 2. FIX ITEMS RLS
ALTER TABLE items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Household members can view items" ON items;
CREATE POLICY "Household members can view items" 
ON items FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM household_members 
        WHERE household_members.household_id = items.household_id 
        AND household_members.user_id = auth.uid()
    )
);

DROP POLICY IF EXISTS "Household members can insert items" ON items;
CREATE POLICY "Household members can insert items" 
ON items FOR INSERT 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM household_members 
        WHERE household_members.household_id = items.household_id 
        AND household_members.user_id = auth.uid()
    )
);

DROP POLICY IF EXISTS "Household members can update items" ON items;
CREATE POLICY "Household members can update items" 
ON items FOR UPDATE 
USING (
    EXISTS (
        SELECT 1 FROM household_members 
        WHERE household_members.household_id = items.household_id 
        AND household_members.user_id = auth.uid()
    )
);

DROP POLICY IF EXISTS "Household members can delete items" ON items;
CREATE POLICY "Household members can delete items" 
ON items FOR DELETE 
USING (
    EXISTS (
        SELECT 1 FROM household_members 
        WHERE household_members.household_id = items.household_id 
        AND household_members.user_id = auth.uid()
    )
);

-- 3. ENSURE REPLICA IDENTITY (Crucial for Realtime DELETE/UPDATE)
ALTER TABLE items REPLICA IDENTITY FULL;
-- Also for lists/household_products just in case
ALTER TABLE lists REPLICA IDENTITY FULL;
ALTER TABLE household_products REPLICA IDENTITY FULL;

-- 4. REFRESH PUBLICATION
-- Remove and re-add tables to kickstart the publication
ALTER PUBLICATION supabase_realtime DROP TABLE items, lists, household_products;
ALTER PUBLICATION supabase_realtime ADD TABLE items, lists, household_products;

COMMIT;
