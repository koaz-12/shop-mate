-- EMERGENCY RESTORE
-- Reverting to standard, proven policies to fix the sync block.

BEGIN;

-- 1. Drop the complex policies and function
DROP POLICY IF EXISTS "Unified Items Policy" ON items;
DROP FUNCTION IF EXISTS public.is_household_member;

-- 2. Re-create explicit, standard policies (safest method)
-- This allows anyone in the household to see/edit items.

-- ALLOW SELECT (Viewing)
CREATE POLICY "Enable read for household" ON items
FOR SELECT
USING (
  exists (
    select 1 from household_members
    where household_id = items.household_id
    and user_id = auth.uid()
  )
);

-- ALLOW INSERT (Adding)
CREATE POLICY "Enable insert for household" ON items
FOR INSERT
WITH CHECK (
  exists (
    select 1 from household_members
    where household_id = items.household_id
    and user_id = auth.uid()
  )
);

-- ALLOW UPDATE (Editing)
CREATE POLICY "Enable update for household" ON items
FOR UPDATE
USING (
  exists (
    select 1 from household_members
    where household_id = items.household_id
    and user_id = auth.uid()
  )
);

-- ALLOW DELETE (Deleting)
CREATE POLICY "Enable delete for household" ON items
FOR DELETE
USING (
  exists (
    select 1 from household_members
    where household_id = items.household_id
    and user_id = auth.uid()
  )
);

-- 3. Ensure Table Publication is Active (The "Switch")
ALTER PUBLICATION supabase_realtime ADD TABLE items;
ALTER PUBLICATION supabase_realtime ADD TABLE household_products;

COMMIT;
