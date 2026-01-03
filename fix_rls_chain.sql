-- CHAIN OF TRUST UPDATE
-- The issue: "Items" policy checks "Household Members".
-- If "Household Members" blocks read access, "Items" implicitly blocks access too!

BEGIN;

-- 1. UNLOCK THE KEY (Household Members)
ALTER TABLE household_members ENABLE ROW LEVEL SECURITY;

-- Ensure users can ALWAYS see their own membership rows.
-- Without this, the check "Am I a member?" returns "I don't know" (Empty), causing failure.
DROP POLICY IF EXISTS "User view own membership" ON household_members;
CREATE POLICY "User view own membership" ON household_members
    FOR SELECT
    TO authenticated
    USING ( user_id = auth.uid() );

-- 2. RESET ITEMS POLICY (Standard Subquery)
-- Now that step 1 is fixed, this standard query will work.
DROP POLICY IF EXISTS "Sync Items" ON items;
DROP POLICY IF EXISTS "Items Policy" ON items;

ALTER TABLE items ENABLE ROW LEVEL SECURITY;

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

-- 3. APPLY SAME LOGIC TO LISTS & PRODUCTS
DROP POLICY IF EXISTS "Sync Lists" ON lists;
CREATE POLICY "Sync Lists" ON lists
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM household_members
            WHERE household_members.household_id = lists.household_id
            AND household_members.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Sync Catalog" ON household_products;
CREATE POLICY "Sync Catalog" ON household_products
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM household_members
            WHERE household_members.household_id = household_products.household_id
            AND household_members.user_id = auth.uid()
        )
    );

COMMIT;
