-- Create Categories Table
create table if not exists categories (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  icon text, -- Emoji or lucide icon name
  keywords text[] default '{}', -- For auto-categorization
  household_id uuid references households(id), -- Null for system/global categories
  is_system boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable RLS
alter table categories enable row level security;

-- Policies

-- Drop policies if they exist (to allow re-running script)
drop policy if exists "View system categories" on categories;
drop policy if exists "View household categories" on categories;
drop policy if exists "Create household categories" on categories;
drop policy if exists "Update household categories" on categories;
drop policy if exists "Delete household categories" on categories;

-- 1. Everyone can view system categories
create policy "View system categories" on categories
  for select using (is_system = true);

-- 2. Members can view their household categories
create policy "View household categories" on categories
  for select using (
    household_id in (select get_auth_user_households())
  );

-- 3. Members can create categories for their household
create policy "Create household categories" on categories
  for insert with check (
    household_id in (select get_auth_user_households())
  );

-- 4. Members can update their household categories
create policy "Update household categories" on categories
  for update using (
    household_id in (select get_auth_user_households())
  );

-- 5. Members can delete their household categories
create policy "Delete household categories" on categories
  for delete using (
    household_id in (select get_auth_user_households())
  );

-- Reseed System Categories (Refresh defaults)
delete from categories where is_system = true;

insert into categories (name, icon, keywords, is_system) values
  ('Frutas y Verduras', '🥑', ARRAY['manzana', 'platano', 'banana', 'guineo', 'tomate', 'lechuga', 'cebolla', 'ajo', 'patata', 'papa', 'zanahoria', 'aguacate', 'palta', 'brocoli', 'pepino', 'pimiento', 'limon', 'naranja', 'uva', 'fresa', 'fruta', 'verdura', 'cilantro', 'perejil', 'espinaca'], true),
  ('Carnes y Pescados', '🥩', ARRAY['pollo', 'pechuga', 'muslo', 'carne', 'ternera', 'res', 'molida', 'cerdo', 'chuleta', 'pescado', 'salmon', 'atun', 'marisco', 'gamba', 'camaron', 'hamburguesa', 'bacon', 'tocino', 'salchicha', 'chorizo', 'pavo', 'bistec'], true),
  ('Lácteos y Charcutería', '🧀', ARRAY['leche', 'queso', 'yogur', 'yogurt', 'mantequilla', 'margarina', 'huevos', 'nata', 'crema', 'jamon', 'pavo', 'mortadela', 'salami', 'fiambreria'], true),
  ('Panadería y Desayuno', '🥖', ARRAY['pan', 'barra', 'molde', 'tostadas', 'galletas', 'bollo', 'croissant', 'harina', 'azucar', 'cereal', 'avena', 'granola', 'tortitas', 'pancake', 'miel', 'mermelada', 'cafe molido'], true),
  ('Despensa y Conservas', '🥫', ARRAY['aceite', 'oliva', 'vinagre', 'sal', 'pimienta', 'especias', 'salsa', 'mayonesa', 'ketchup', 'mostaza', 'atun lata', 'maiz', 'aceitunas', 'conserva', 'sopa', 'caldo', 'pure'], true),
  ('Pasta, Arroz y Legumbres', '🍝', ARRAY['arroz', 'pasta', 'espaguetis', 'macarrones', 'fideos', 'lentejas', 'garbanzos', 'frijoles', 'habichuelas'], true),
  ('Snacks y Dulces', '🍫', ARRAY['chocolate', 'papas', 'chips', 'doritos', 'frutos secos', 'nueces', 'almendras', 'chicle', 'caramelos', 'turron', 'bombones'], true),
  ('Congelados', '❄️', ARRAY['helado', 'pizza', 'hielo', 'verduras congeladas', 'patatas congeladas', 'nuggets', 'lasaña'], true),
  ('Bebidas', '🥤', ARRAY['agua', 'coca', 'cola', 'pepsi', 'refresco', 'soda', 'cerveza', 'vino', 'alcohol', 'zumo', 'jugo', 'te', 'infusion', 'energetica'], true),
  ('Limpieza y Hogar', '🧹', ARRAY['detergente', 'jabon ropa', 'suavizante', 'lejia', 'cloro', 'fregasuelos', 'lavavajillas', 'pastillas', 'papel higienico', 'papel cocina', 'servilletas', 'basura', 'bolsas', 'estropajo', 'esponja', 'ambientador', 'aluminio', 'film', 'pilas', 'bombilla'], true),
  ('Higiene Personal', '🧴', ARRAY['champu', 'shampoo', 'gel', 'jabon cuerpo', 'desodorante', 'pasta dientes', 'cepillo', 'crema', 'afeitado', 'cuchilla', 'toallitas', 'compresas', 'tampones'], true),
  ('Farmacia y Salud', '�', ARRAY['paracetamol', 'ibuprofeno', 'aspirina', 'jarabe', 'medicina', 'tiritas', 'alcohol cura', 'venda', 'vitaminas', 'suplemento'], true),
  ('Otros', '📦', ARRAY['varios', 'otros'], true);
