-- Add price column to items table
ALTER TABLE items 
ADD COLUMN price numeric(10, 2) DEFAULT null;

-- Update RLS policies if necessary (usually unrelated to specific columns, but good to check)
-- Existing policies cover the whole table, so no change needed.
