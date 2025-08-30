-- TrioWatches Order Tracking System Database Update
-- Run this script in your Supabase SQL Editor

-- ======================
-- 1. ADD TRACKING NUMBER COLUMN
-- ======================

-- Add tracking_number column if it doesn't exist
DO $$ 
BEGIN
  -- Check if tracking_number column exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'tracking_number'
  ) THEN
    -- Add the column with a default value generator
    ALTER TABLE orders ADD COLUMN tracking_number TEXT;
    
    -- Create a function to generate tracking numbers
    CREATE OR REPLACE FUNCTION generate_tracking_number()
    RETURNS TEXT AS $func$
    BEGIN
      RETURN 'TW' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    END;
    $func$ LANGUAGE plpgsql;
    
    -- Update existing orders with tracking numbers
    UPDATE orders 
    SET tracking_number = generate_tracking_number()
    WHERE tracking_number IS NULL;
    
    -- Add NOT NULL constraint after updating existing records
    ALTER TABLE orders ALTER COLUMN tracking_number SET NOT NULL;
    
    -- Add unique constraint
    ALTER TABLE orders ADD CONSTRAINT orders_tracking_number_unique UNIQUE (tracking_number);
    
    RAISE NOTICE 'tracking_number column added successfully';
  ELSE
    RAISE NOTICE 'tracking_number column already exists';
  END IF;
END $$;

-- ======================
-- 2. CREATE TRACKING NUMBER INDEX
-- ======================

-- Add index for tracking number lookups
CREATE INDEX IF NOT EXISTS idx_orders_tracking_number ON orders(tracking_number);

-- ======================
-- 3. UPDATE ROW LEVEL SECURITY POLICIES
-- ======================

-- Drop and recreate order policies to include tracking functionality
DROP POLICY IF EXISTS "Anyone can create orders" ON orders;
DROP POLICY IF EXISTS "Anyone can view orders by tracking number" ON orders;
DROP POLICY IF EXISTS "Authenticated users can view orders" ON orders;
DROP POLICY IF EXISTS "Authenticated users can update orders" ON orders;
DROP POLICY IF EXISTS "Authenticated users can delete orders" ON orders;

-- Allow anyone to create orders (customers placing orders)
CREATE POLICY "Anyone can create orders" ON orders
  FOR INSERT TO public WITH CHECK (true);

-- Allow anyone to view orders by tracking number (for order tracking)
CREATE POLICY "Anyone can view orders by tracking number" ON orders
  FOR SELECT TO public USING (true);

-- Allow authenticated users (admins) to view all orders
CREATE POLICY "Authenticated users can view orders" ON orders
  FOR SELECT TO authenticated USING (true);

-- Allow authenticated users (admins) to update orders
CREATE POLICY "Authenticated users can update orders" ON orders
  FOR UPDATE TO authenticated USING (true);

-- Allow authenticated users (admins) to delete orders
CREATE POLICY "Authenticated users can delete orders" ON orders
  FOR DELETE TO authenticated USING (true);

-- ======================
-- 4. CREATE TRIGGER FOR AUTO-GENERATING TRACKING NUMBERS
-- ======================

-- Create or replace function for new order tracking numbers
CREATE OR REPLACE FUNCTION set_tracking_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.tracking_number IS NULL THEN
    NEW.tracking_number := 'TW' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    
    -- Ensure uniqueness (retry if duplicate)
    WHILE EXISTS (SELECT 1 FROM orders WHERE tracking_number = NEW.tracking_number) LOOP
      NEW.tracking_number := 'TW' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-generating tracking numbers on insert
DROP TRIGGER IF EXISTS orders_set_tracking_number ON orders;
CREATE TRIGGER orders_set_tracking_number
  BEFORE INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION set_tracking_number();

-- ======================
-- 5. VERIFICATION QUERIES
-- ======================

-- Check if everything is working
SELECT 
  'Database update completed successfully!' AS message,
  COUNT(*) AS total_orders,
  COUNT(tracking_number) AS orders_with_tracking
FROM orders;

-- Show sample of updated orders
SELECT 
  id,
  tracking_number,
  customer_name,
  status,
  created_at
FROM orders 
ORDER BY created_at DESC 
LIMIT 5;

-- Final success message
DO $$
BEGIN
  RAISE NOTICE 'Order tracking system update completed successfully!';
END $$;
