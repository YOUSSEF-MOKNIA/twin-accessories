-- STEP 4: Add constraints and indexes
-- Run this fourth

-- Add NOT NULL constraint
ALTER TABLE orders ALTER COLUMN tracking_number SET NOT NULL;

-- Add unique constraint
ALTER TABLE orders ADD CONSTRAINT orders_tracking_number_unique UNIQUE (tracking_number);

-- Add index for fast lookups
CREATE INDEX IF NOT EXISTS idx_orders_tracking_number ON orders(tracking_number);
