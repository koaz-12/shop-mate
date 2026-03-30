-- MEGAPLAN MIGRATION: Rendimiento, Limpieza y Colaboración

-- 1. Añadiendo campos para colaboración (Social) en Items
ALTER TABLE public.items
ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- 2. Trigger para actualizar automáticamente el updated_at de los items
CREATE OR REPLACE FUNCTION update_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_items_updated_at ON items;
CREATE TRIGGER trigger_items_updated_at
BEFORE UPDATE ON items
FOR EACH ROW
EXECUTE FUNCTION update_items_updated_at();

-- 3. Índices Cruciales para Rendimiento Extremo (Speed)
CREATE INDEX IF NOT EXISTS idx_items_household_id ON items(household_id);
CREATE INDEX IF NOT EXISTS idx_items_list_id ON items(list_id);
CREATE INDEX IF NOT EXISTS idx_items_deleted_at ON items(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_items_in_pantry ON items(in_pantry);
CREATE INDEX IF NOT EXISTS idx_household_members_user_id ON household_members(user_id);
CREATE INDEX IF NOT EXISTS idx_household_products_household_id ON household_products(household_id);
CREATE INDEX IF NOT EXISTS idx_categories_household_id ON categories(household_id);

-- Listo!
