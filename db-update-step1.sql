-- STEP 1: Add tracking_number column
-- Run this first

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'tracking_number'
  ) THEN
    ALTER TABLE orders ADD COLUMN tracking_number TEXT;
    RAISE NOTICE 'tracking_number column added';
  ELSE
    RAISE NOTICE 'tracking_number column already exists';
  END IF;
END $$;
