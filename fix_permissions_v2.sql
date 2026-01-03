-- Fix Permissions V2: The "Bulletproof" Approach
-- We will use a secure function to check permissions, avoiding any "table recursion" or read issues.

BEGIN;

-- 1. Create a helper function that bypasses RLS on household_members
-- "SECURITY DEFINER" means this function runs with admin privileges (internal), 
-- so it can always read household_members to check if you belong.
CREATE OR REPLACE FUNCTION public.is_household_member(check_household_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM household_members 
    WHERE household_id = check_household_id 
    AND user_id = auth.uid()
  );
END;
$$;

-- 2. Clean up old policies on 'items'
DROP POLICY IF EXISTS "Household members can view items" ON items;
DROP POLICY IF EXISTS "Household members can insert items" ON items;
DROP POLICY IF EXISTS "Household members can update items" ON items;
DROP POLICY IF EXISTS "Household members can delete items" ON items;
DROP POLICY IF EXISTS "Items Policy" ON items;

-- 3. Apply the simple, unified policy using the secure function
CREATE POLICY "Unified Items Policy"
ON items
FOR ALL
USING ( is_household_member(household_id) )
WITH CHECK ( is_household_member(household_id) );

-- 4. Do the same for 'lists' table (just in case)
ALTER TABLE lists ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Lists Policy" ON lists;
CREATE POLICY "Lists Policy"
ON lists
FOR ALL
USING ( is_household_member(household_id) )
WITH CHECK ( is_household_member(household_id) );

COMMIT;
