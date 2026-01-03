-- DEEP REALTIME FIX (V4)
-- This script completely resets the Realtime configuration.

BEGIN;

---------------------------------------------------
-- 1. RESET PUBLICATION (The Broadcast Channel)
---------------------------------------------------
-- We drop and recreate to ensure no stale state.
DROP PUBLICATION IF EXISTS supabase_realtime;
CREATE PUBLICATION supabase_realtime FOR TABLE items, lists, household_products, household_members;

---------------------------------------------------
-- 2. ENSURE REPLICA IDENTITY (The Data Payload)
---------------------------------------------------
-- "FULL" ensures the "old" data is sent in updates, critical for frontend logic.
ALTER TABLE items REPLICA IDENTITY FULL;
ALTER TABLE lists REPLICA IDENTITY FULL;
ALTER TABLE household_products REPLICA IDENTITY FULL;
ALTER TABLE household_members REPLICA IDENTITY FULL;

---------------------------------------------------
-- 3. PERMISSIONS & RLS (The Access Control)
---------------------------------------------------
-- Ensure RLS is ON
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE household_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE household_products ENABLE ROW LEVEL SECURITY;

-- 3.1. HOUSEHOLD MEMBERS
-- We use a simple policy to avoid recusion/complexity.
DROP POLICY IF EXISTS "Access own membership" ON household_members;
CREATE POLICY "Access own membership" ON household_members
    USING (user_id = auth.uid());

-- 3.2. ITEMS (The shopping list)
DROP POLICY IF EXISTS "Sync Items" ON items;
CREATE POLICY "Sync Items" ON items
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM household_members
            WHERE household_members.household_id = items.household_id
            AND household_members.user_id = auth.uid()
        )
    );

-- 3.3. HOUSEHOLD PRODUCTS (The Catalog)
DROP POLICY IF EXISTS "Sync Catalog" ON household_products;
CREATE POLICY "Sync Catalog" ON household_products
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM household_members
            WHERE household_members.household_id = household_products.household_id
            AND household_members.user_id = auth.uid()
        )
    );

COMMIT;

-- Verify
select * from pg_publication_tables where pubname = 'supabase_realtime';
