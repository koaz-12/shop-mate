-- Add bought_by column to items table
-- This tracks who moved the item to the pantry (checked it off).

ALTER TABLE items 
ADD COLUMN IF NOT EXISTS bought_by UUID REFERENCES auth.users(id);

-- Optional: Add index for performance if needed later (premature optimization for now)
-- CREATE INDEX IF NOT EXISTS idx_items_bought_by ON items(bought_by);
