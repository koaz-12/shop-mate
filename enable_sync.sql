-- Enable Realtime for key tables
-- You must run this in the Supabase SQL Editor

begin;

-- Add tables to the publication used by Realtime
alter publication supabase_realtime add table items;
alter publication supabase_realtime add table lists;
alter publication supabase_realtime add table household_products;

-- Ensure we can listen to these
comment on table items is 'Realtime Enabled';

commit;
