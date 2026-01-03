-- ROBUST RLS FIX (SECURITY DEFINER)
-- This approach uses a privileged function to check membership, bypassing
-- any potential RLS recursion or permission locking on the 'household_members' table.

BEGIN;

-- 1. Create Helper Function (SECURITY DEFINER = Runs as Admin)
CREATE OR REPLACE FUNCTION public.is_household_member(_household_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public -- Security best practice
AS $$
BEGIN
    -- Check if the current user (auth.uid()) is a member of the given household
    RETURN EXISTS (
        SELECT 1
        FROM household_members
        WHERE household_id = _household_id
        AND user_id = auth.uid()
    );
END;
$$;

-- 2. Re-Enable RLS (If user disabled it)
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE household_products ENABLE ROW LEVEL SECURITY;

-- 3. Update Policy for ITEMS
DROP POLICY IF EXISTS "Sync Items" ON items;
DROP POLICY IF EXISTS "Items Policy" ON items;

CREATE POLICY "Sync Items" ON items
    FOR ALL
    TO authenticated
    USING ( is_household_member(household_id) )
    WITH CHECK ( is_household_member(household_id) );

-- 4. Update Policy for PRODUCTS
DROP POLICY IF EXISTS "Sync Catalog" ON household_products;
CREATE POLICY "Sync Catalog" ON household_products
    FOR ALL
    TO authenticated
    USING ( is_household_member(household_id) );

-- 5. Update Policy for LISTS
DROP POLICY IF EXISTS "Sync Lists" ON lists;
CREATE POLICY "Sync Lists" ON lists
    FOR ALL
    TO authenticated
    USING ( is_household_member(household_id) );

-- 6. Grant execute permission
GRANT EXECUTE ON FUNCTION public.is_household_member TO authenticated, anon;

COMMIT;

-- Verify
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'items';
