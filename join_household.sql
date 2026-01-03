-- Secure Function to Join Household via Invite Code
-- Run this in Supabase SQL Editor

create or replace function join_household(invite_code_input text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  target_household_id uuid;
  target_household_name text;
begin
  -- 1. Find household
  select id, name into target_household_id, target_household_name
  from households
  where invite_code = upper(trim(invite_code_input));

  if target_household_id is null then
    return json_build_object('success', false, 'message', 'Código de invitación inválido');
  end if;

  -- 2. Check if already member
  if exists (select 1 from household_members where user_id = auth.uid() and household_id = target_household_id) then
     return json_build_object('success', false, 'message', 'Ya eres miembro de esta familia');
  end if;

  -- 3. Insert member
  insert into household_members (user_id, household_id, role)
  values (auth.uid(), target_household_id, 'member');

  return json_build_object('success', true, 'household_id', target_household_id, 'name', target_household_name);
end;
$$;
