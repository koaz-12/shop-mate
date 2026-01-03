-- ADD BARCODE SUPPORT
-- This adds memory to the scanner: Scanned items save their barcode to the catalog.

BEGIN;

-- 1. Add barcode column to 'items'
ALTER TABLE items ADD COLUMN IF NOT EXISTS barcode text;

-- 2. Add barcode column to 'household_products' (The Catalog)
ALTER TABLE household_products ADD COLUMN IF NOT EXISTS barcode text;

-- 3. Create Index for fast lookup
CREATE INDEX IF NOT EXISTS idx_products_barcode ON household_products(barcode);

-- 4. Update the Catalog Trigger to save the barcode
CREATE OR REPLACE FUNCTION update_product_catalog()
RETURNS trigger AS $$
BEGIN
  -- We now update if price OR barcode is present
  IF (NEW.price IS NOT NULL OR NEW.barcode IS NOT NULL) THEN
    INSERT INTO household_products (household_id, name, last_price, category_name, last_bought_at, times_bought, barcode)
    VALUES (
      NEW.household_id, 
      NEW.name, 
      NEW.price, 
      NEW.category, 
      NOW(), 
      1,
      NEW.barcode
    )
    ON CONFLICT (household_id, name) 
    DO UPDATE SET 
      last_price = COALESCE(EXCLUDED.last_price, household_products.last_price),
      category_name = COALESCE(EXCLUDED.category_name, household_products.category_name),
      barcode = COALESCE(EXCLUDED.barcode, household_products.barcode), -- Update barcode if new one provided
      last_bought_at = NOW(),
      times_bought = household_products.times_bought + 1;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Refresh Trigger (Ensure it fires on barcode updates too)
DROP TRIGGER IF EXISTS on_item_update_catalog ON items;

CREATE TRIGGER on_item_update_catalog
  AFTER INSERT OR UPDATE OF price, is_completed, barcode
  ON items
  FOR EACH ROW
  EXECUTE FUNCTION update_product_catalog();

COMMIT;
