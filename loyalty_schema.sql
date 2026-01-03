-- Create Loyalty Cards Table
create table if not exists loyalty_cards (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  name text not null,
  code text not null,
  color text default 'emerald', -- tailwind color name or hex
  household_id uuid references households(id) on delete cascade not null,
  created_by uuid references profiles(id)
);

-- Enable RLS
alter table loyalty_cards enable row level security;

-- Policies
create policy "Members can view loyalty cards"
  on loyalty_cards for select
  using (
    household_id in (select get_auth_user_households())
  );

create policy "Members can create loyalty cards"
  on loyalty_cards for insert
  with check (
    household_id in (select get_auth_user_households())
  );

create policy "Members can update loyalty cards"
  on loyalty_cards for update
  using (
    household_id in (select get_auth_user_households())
  );

create policy "Members can delete loyalty cards"
  on loyalty_cards for delete
  using (
    household_id in (select get_auth_user_households())
  );
