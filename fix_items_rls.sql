
-- Disable RLS temporarily to clean up
ALTER TABLE items DISABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Household members can read items" ON items;
DROP POLICY IF EXISTS "Household members can insert items" ON items;
DROP POLICY IF EXISTS "Household members can update items" ON items;
DROP POLICY IF EXISTS "Household members can delete items" ON items;
DROP POLICY IF EXISTS "Users can manage their own items" ON items;
DROP POLICY IF EXISTS "Enable read access for all users" ON items;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON items;

-- Re-enable RLS
ALTER TABLE items ENABLE ROW LEVEL SECURITY;

-- Create comprehensive policies based on household membership

-- READ: Allow if user is in the same household
CREATE POLICY "Household members can read items"
ON items FOR SELECT
USING (
  auth.uid() IN (
    SELECT user_id FROM household_members WHERE household_id = items.household_id
  )
);

-- INSERT: Allow if user is in the same household that creates the item
CREATE POLICY "Household members can insert items"
ON items FOR INSERT
WITH CHECK (
  auth.uid() IN (
    SELECT user_id FROM household_members WHERE household_id = items.household_id
  )
);

-- UPDATE: Allow if user is in the same household
CREATE POLICY "Household members can update items"
ON items FOR UPDATE
USING (
  auth.uid() IN (
    SELECT user_id FROM household_members WHERE household_id = items.household_id
  )
);

-- DELETE: Allow if user is in the same household
CREATE POLICY "Household members can delete items"
ON items FOR DELETE
USING (
  auth.uid() IN (
    SELECT user_id FROM household_members WHERE household_id = items.household_id
  )
);
