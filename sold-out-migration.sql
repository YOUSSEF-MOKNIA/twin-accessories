-- Twin Accessories - Sold Out Feature Migration
-- Run this script in your Supabase SQL Editor

-- ======================
-- 1. ADD SOLD OUT COLUMNS
-- ======================

-- Add is_sold_out column to products table
DO $$ 
BEGIN
  -- Add is_sold_out column for entire product
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'is_sold_out'
  ) THEN
    ALTER TABLE products ADD COLUMN is_sold_out BOOLEAN DEFAULT FALSE;
    RAISE NOTICE 'is_sold_out column added to products table';
  ELSE
    RAISE NOTICE 'is_sold_out column already exists in products table';
  END IF;

  -- Add stock_quantity column for inventory tracking (optional)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'stock_quantity'
  ) THEN
    ALTER TABLE products ADD COLUMN stock_quantity INTEGER DEFAULT NULL;
    RAISE NOTICE 'stock_quantity column added to products table';
  ELSE
    RAISE NOTICE 'stock_quantity column already exists in products table';
  END IF;
END $$;

-- ======================
-- 2. UPDATE COLOR VARIANTS SCHEMA
-- ======================

-- Update the colors JSONB structure to include sold_out status for each color
-- Example structure:
-- colors: [
--   {
--     "name": "Black",
--     "hex": "#000000", 
--     "images": ["url1", "url2"],
--     "is_sold_out": false,
--     "stock_quantity": 10
--   }
-- ]

-- ======================
-- 3. UTILITY FUNCTIONS
-- ======================

-- Function to check if a product is completely sold out
CREATE OR REPLACE FUNCTION is_product_completely_sold_out(product_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  product_record RECORD;
  color_variant JSONB;
  has_available_colors BOOLEAN := FALSE;
BEGIN
  -- Get the product
  SELECT * INTO product_record FROM products WHERE id = product_id;
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- If product is marked as sold out, return true
  IF product_record.is_sold_out = TRUE THEN
    RETURN TRUE;
  END IF;
  
  -- If product doesn't have color variants, check overall availability
  IF product_record.has_color_variants = FALSE OR product_record.colors IS NULL THEN
    RETURN COALESCE(product_record.is_sold_out, FALSE);
  END IF;
  
  -- Check if any color variant is available
  FOR color_variant IN SELECT jsonb_array_elements(product_record.colors)
  LOOP
    IF (color_variant->>'is_sold_out')::BOOLEAN IS NOT TRUE THEN
      has_available_colors := TRUE;
      EXIT;
    END IF;
  END LOOP;
  
  RETURN NOT has_available_colors;
END;
$$ LANGUAGE plpgsql;

-- Function to get available colors for a product
CREATE OR REPLACE FUNCTION get_available_colors(product_id UUID)
RETURNS JSONB AS $$
DECLARE
  product_record RECORD;
  available_colors JSONB := '[]'::JSONB;
  color_variant JSONB;
BEGIN
  -- Get the product
  SELECT * INTO product_record FROM products WHERE id = product_id;
  
  IF NOT FOUND OR product_record.has_color_variants = FALSE THEN
    RETURN '[]'::JSONB;
  END IF;
  
  -- Filter available colors
  FOR color_variant IN SELECT jsonb_array_elements(product_record.colors)
  LOOP
    IF (color_variant->>'is_sold_out')::BOOLEAN IS NOT TRUE THEN
      available_colors := available_colors || color_variant;
    END IF;
  END LOOP;
  
  RETURN available_colors;
END;
$$ LANGUAGE plpgsql;

-- ======================
-- 4. UPDATE EXISTING DATA
-- ======================

-- Set default values for existing products
UPDATE products 
SET is_sold_out = FALSE 
WHERE is_sold_out IS NULL;

-- Update existing color variants to include sold out status
UPDATE products 
SET colors = (
  SELECT jsonb_agg(
    color_variant || '{"is_sold_out": false, "stock_quantity": null}'::jsonb
  )
  FROM jsonb_array_elements(colors) AS color_variant
)
WHERE has_color_variants = TRUE 
  AND colors IS NOT NULL 
  AND colors != '[]'::jsonb
  AND NOT EXISTS (
    SELECT 1 
    FROM jsonb_array_elements(colors) AS color_variant 
    WHERE color_variant ? 'is_sold_out'
  );

-- ======================
-- 5. CREATE INDEXES
-- ======================

-- Add index for sold out status for faster filtering
CREATE INDEX IF NOT EXISTS idx_products_is_sold_out ON products(is_sold_out);

-- Add index for stock quantity
CREATE INDEX IF NOT EXISTS idx_products_stock_quantity ON products(stock_quantity);

-- ======================
-- 6. VERIFICATION QUERIES
-- ======================

-- Check the updated schema
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'products' 
  AND column_name IN ('is_sold_out', 'stock_quantity')
ORDER BY column_name;

-- Check sample product with colors
SELECT id, name, is_sold_out, has_color_variants, 
       jsonb_pretty(colors) as colors_formatted
FROM products 
WHERE has_color_variants = TRUE 
LIMIT 1;

-- Test utility functions
SELECT id, name, 
       is_product_completely_sold_out(id) as completely_sold_out,
       jsonb_pretty(get_available_colors(id)) as available_colors
FROM products 
LIMIT 3;

SELECT 'Sold out feature migration completed successfully!' AS message;
