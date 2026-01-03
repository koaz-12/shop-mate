-- Add recurrence columns to household_products
ALTER TABLE household_products 
ADD COLUMN recurrence_interval INTEGER DEFAULT NULL, -- Number of days
ADD COLUMN next_occurrence TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Create index for faster automation checks
CREATE INDEX idx_products_next_occurrence ON household_products(next_occurrence) 
WHERE next_occurrence IS NOT NULL;
