-- ============================================================
-- ShopMate — Índices de Rendimiento para la Base de Datos
-- ============================================================
-- EJECUTAR EN: Supabase Dashboard → SQL Editor
-- PROPÓSITO: Optimizar queries para soportar 1,000+ usuarios
--            Sin estos índices, todas las queries hacen full table scan.
-- SEGURO: Todos usan "IF NOT EXISTS" — no rompe nada si ya existen.
-- ============================================================

-- Items: Las queries más críticas de la app
CREATE INDEX IF NOT EXISTS idx_items_household_id ON items(household_id);
CREATE INDEX IF NOT EXISTS idx_items_list_id ON items(list_id);
CREATE INDEX IF NOT EXISTS idx_items_deleted_at ON items(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_items_in_pantry ON items(in_pantry);
CREATE INDEX IF NOT EXISTS idx_items_created_by ON items(created_by);
CREATE INDEX IF NOT EXISTS idx_items_bought_by ON items(bought_by);
CREATE INDEX IF NOT EXISTS idx_items_household_list ON items(household_id, list_id); -- Composite

-- Household Members: Auth y presencia
CREATE INDEX IF NOT EXISTS idx_household_members_user_id ON household_members(user_id);
CREATE INDEX IF NOT EXISTS idx_household_members_household_id ON household_members(household_id);

-- Catálogo de productos
CREATE INDEX IF NOT EXISTS idx_household_products_household_id ON household_products(household_id);
CREATE INDEX IF NOT EXISTS idx_household_products_barcode ON household_products(barcode) WHERE barcode IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_household_products_name ON household_products(household_id, name); -- Búsqueda por nombre

-- Categorías
CREATE INDEX IF NOT EXISTS idx_categories_household_id ON categories(household_id);
CREATE INDEX IF NOT EXISTS idx_categories_system ON categories(is_system) WHERE is_system = true;

-- Listas y Tarjetas
CREATE INDEX IF NOT EXISTS idx_loyalty_cards_household_id ON loyalty_cards(household_id);
CREATE INDEX IF NOT EXISTS idx_lists_household_id ON lists(household_id);

-- Verificar que los índices fueron creados correctamente
SELECT
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('items', 'household_members', 'household_products', 'categories', 'loyalty_cards', 'lists')
ORDER BY tablename, indexname;
