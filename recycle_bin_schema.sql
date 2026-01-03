-- 1. Add deleted_at column to items for Soft Delete
ALTER TABLE items ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- 2. Update RLS (Optional - usually standard RLS allows viewing own deleted items if we want to restore them)
-- But we typically filter them out in the frontend query unless asking for trash.

-- Note: We assume existing RLS checks household_id, which is still valid.
-- The query logic in the app will be responsible for filtering `deleted_at IS NULL` for the main list
-- and `deleted_at IS NOT NULL` for the Recycle Bin.
