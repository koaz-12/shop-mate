-- Add Budget Columns to Households
alter table households 
add column if not exists budget numeric default 0,
add column if not exists currency text default 'USD';

-- Update RLS to ensure members can update these columns
-- (Existing policy "Members can view their household" and "Users can create households" exists)
-- We need to check if there is an UPDATE policy for households.
-- Looking at supabase_schema.sql, there was NO update policy for households!
-- "Members can view their household" and "Users can create households" were there.
-- Let's add an Update policy.

create policy "Members can update their household" on households
  for update using (
    id in (select get_auth_user_households())
  );
