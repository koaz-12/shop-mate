-- RESTORE RLS ON ITEMS
-- Re-enables security checks.

ALTER TABLE items ENABLE ROW LEVEL SECURITY;

-- Ensure Policy exists (just in case)
DROP POLICY IF EXISTS "Sync Items" ON items;
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
