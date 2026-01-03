-- DEBUG: DISABLE RLS ON ITEMS
-- This turns off all security checks for the items table.
-- WARNING: Only use this for debugging. Anyone can see/edit items while this is active.

ALTER TABLE items DISABLE ROW LEVEL SECURITY;

-- Verify it's off
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'items';
