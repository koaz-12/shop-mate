-- Secure Function to Leave Household
-- Run this in Supabase SQL Editor

create or replace function leave_household(target_household_id uuid)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  member_count int;
begin
  -- 1. Check if user is member
  if not exists (select 1 from household_members where user_id = auth.uid() and household_id = target_household_id) then
    return json_build_object('success', false, 'message', 'No eres miembro de esta familia');
  end if;

  -- 2. Remove member
  delete from household_members 
  where user_id = auth.uid() 
  and household_id = target_household_id;

  -- 3. Check remaining members (Clean up orphan household if needed)
  -- For now, we will leave the household existing even if empty, or we could delete it.
  -- Let's just leave it for safety unless user wants strict cleanup.
  
  return json_build_object('success', true, 'message', 'Has salido de la familia correctamente');
end;
$$;
