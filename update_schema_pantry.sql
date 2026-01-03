-- Add Quantity and Pantry Status columns

-- 1. Add quantity column (text to allow '1kg', '2 packs', etc.)
alter table items add column if not exists quantity text;

-- 2. Add in_pantry column (boolean)
-- true = In Pantry (We have it)
-- false = Shopping List (We need to buy it)
alter table items add column if not exists in_pantry boolean default false;

-- 3. Migration: 
-- If it was 'is_completed = true' (old logic), it means we bought it -> So it is now 'in_pantry = true'
-- If 'is_completed = false', it is in the shopping list -> 'in_pantry = false'
update items set in_pantry = true where is_completed = true;
update items set in_pantry = false where is_completed = false;

-- 4. Drop old column eventually, but for now we can keep or ignore 'is_completed'. 
-- Let's just use 'in_pantry' going forward.
-- We can drop 'is_completed' if we want to be clean, but keeping it as backup is safer for now.
-- We will ignore 'is_completed' in the new UI code.
