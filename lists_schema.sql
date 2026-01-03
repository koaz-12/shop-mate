-- 1. Create lists table
CREATE TABLE IF NOT EXISTS lists (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    icon TEXT,
    household_id UUID REFERENCES households(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by UUID REFERENCES auth.users(id)
);

-- 2. Enable RLS
ALTER TABLE lists ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies
CREATE POLICY "Households members can view lists"
ON lists FOR SELECT
USING (
    household_id IN (
        SELECT household_id FROM household_members WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Household members can create lists"
ON lists FOR INSERT
WITH CHECK (
    household_id IN (
        SELECT household_id FROM household_members WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Household members can update lists"
ON lists FOR UPDATE
USING (
    household_id IN (
        SELECT household_id FROM household_members WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Household members can delete lists"
ON lists FOR DELETE
USING (
    household_id IN (
        SELECT household_id FROM household_members WHERE user_id = auth.uid()
    )
);

-- 4. Add list_id to items
ALTER TABLE items ADD COLUMN IF NOT EXISTS list_id UUID REFERENCES lists(id) ON DELETE CASCADE;

-- 5. Migration: Create default 'General' list for existing households and duplicate items? 
-- Actually we just want to assign existing items to a new list.

DO $$
DECLARE
    h_record RECORD;
    new_list_id UUID;
BEGIN
    FOR h_record IN SELECT id FROM households LOOP
        -- Check if household already has a list (idempotency mostly for re-runs)
        IF NOT EXISTS (SELECT 1 FROM lists WHERE household_id = h_record.id AND name = 'General') THEN
            -- Create 'General' list
            INSERT INTO lists (name, icon, household_id)
            VALUES ('General', 'LayoutGrid', h_record.id)
            RETURNING id INTO new_list_id;

            -- Update existing items for this household to match this list
            UPDATE items 
            SET list_id = new_list_id 
            WHERE household_id = h_record.id AND list_id IS NULL;
        END IF;
    END LOOP;
END $$;
