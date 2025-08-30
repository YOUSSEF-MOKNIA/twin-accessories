-- STEP 3: Update existing orders with tracking numbers
-- Run this third

UPDATE orders 
SET tracking_number = generate_tracking_number()
WHERE tracking_number IS NULL;
