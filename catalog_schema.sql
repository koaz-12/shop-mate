-- Create Household Products Catalog (The "Brain" of the house)
create table if not exists household_products (
  id uuid default uuid_generate_v4() primary key,
  household_id uuid references households(id) not null,
  name text not null,
  last_price numeric,
  category_name text,
  last_bought_at timestamp with time zone default now(),
  times_bought integer default 1,
  
  -- Prevent duplicates per household (case insensitive name?)
  -- For now, allow exact name matches or handle via app logic. 
  -- Best to have a unique constraint to enable upsert.
  constraint unique_product_per_household unique (household_id, name)
);

-- Enable RLS
alter table household_products enable row level security;

-- Policies
drop policy if exists "Users can view their household products" on household_products;
drop policy if exists "Users can insert their household products" on household_products;
drop policy if exists "Users can update their household products" on household_products;

create policy "Users can view their household products" on household_products
  for select using (household_id in (select get_auth_user_households()));

create policy "Users can insert their household products" on household_products
  for insert with check (household_id in (select get_auth_user_households()));

create policy "Users can update their household products" on household_products
  for update using (household_id in (select get_auth_user_households()));

-- Trigger Function to Auto-Update Catalog
create or replace function update_product_catalog()
returns trigger as $$
begin
  -- Only update if price is provided or it's a new item completion
  if (NEW.price is not null) then
    insert into household_products (household_id, name, last_price, category_name, last_bought_at, times_bought)
    values (
      NEW.household_id, 
      NEW.name, 
      NEW.price, 
      NEW.category, 
      now(), 
      1
    )
    on conflict (household_id, name) 
    do update set 
      last_price = EXCLUDED.last_price,
      category_name = COALESCE(EXCLUDED.category_name, household_products.category_name),
      last_bought_at = now(),
      times_bought = household_products.times_bought + 1;
  end if;
  return NEW;
end;
$$ language plpgsql;

-- Trigger
drop trigger if exists on_item_update_catalog on items;
create trigger on_item_update_catalog
  after insert or update of price, is_completed
  on items
  for each row
  execute function update_product_catalog();
