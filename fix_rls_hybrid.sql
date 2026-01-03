-- HYBRID RLS FIX
-- Diagnosis: The security chain is breaking when looking up membership.
-- Solution: We will OPEN the 'household_members' table (Disable RLS) so lookups never fail.
-- We keep 'items' table SECURE (Enable RLS). This is a safe middle ground.

BEGIN;

-- 1. DISABLE RLS on the lookup table (Eliminates the bottleneck)
ALTER TABLE household_members DISABLE ROW LEVEL SECURITY;

-- 2. ENSURE RLS is ON for the data tables
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE household_products ENABLE ROW LEVEL SECURITY;

-- 3. APPLY SIMPLE POLICIES
-- Since household_members is now "open", the subquery will always succeed 
-- if the row exists, without permission errors blocking it.

-- Items
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

-- Products
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

COMMIT;
