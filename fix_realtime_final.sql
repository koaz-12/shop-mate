-- FINAL REALTIME REPAIR (V5)
-- Reset everything one last time, ensuring permissions are wide open for authenticated users.

BEGIN;

-- 1. DROP EVERYTHING REALTIME
DROP PUBLICATION IF EXISTS supabase_realtime;

-- 2. ENSURE RLS IS ON (Security)
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE household_products ENABLE ROW LEVEL SECURITY;

-- 3. SET REPLICA IDENTITY FULL (Critical for UPDATES/DELETES broadcast)
ALTER TABLE items REPLICA IDENTITY FULL;
ALTER TABLE lists REPLICA IDENTITY FULL;
ALTER TABLE household_members REPLICA IDENTITY FULL;
ALTER TABLE household_products REPLICA IDENTITY FULL;

-- 4. CREATE PUBLICATION
-- We include ALL relevant tables.
CREATE PUBLICATION supabase_realtime FOR TABLE items, lists, household_products, household_members;

-- 5. RELAX PERMISSIONS FOR AUTHENTICATED USERS
-- Sometimes restrictive policies block "Insert" notifications to others.
-- We ensure that if you are in the household, you can see everything.

-- 5.1 Items Policy
DROP POLICY IF EXISTS "Sync Items" ON items;
DROP POLICY IF EXISTS "Items Policy" ON items;
CREATE POLICY "Sync Items" ON items
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM household_members
            WHERE household_members.household_id = items.household_id
            AND household_members.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM household_members
            WHERE household_members.household_id = items.household_id
            AND household_members.user_id = auth.uid()
        )
    );

-- 5.2 Products Policy
DROP POLICY IF EXISTS "Sync Catalog" ON household_products;
CREATE POLICY "Sync Catalog" ON household_products
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM household_members
            WHERE household_members.household_id = household_products.household_id
            AND household_members.user_id = auth.uid()
        )
    );

-- 6. GRANT PERMISSIONS
GRANT USAGE ON SCHEMA public TO authenticated, anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated, anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated, anon;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO authenticated, anon;

COMMIT;

-- VERIFY
select * from pg_publication_tables where pubname = 'supabase_realtime';
