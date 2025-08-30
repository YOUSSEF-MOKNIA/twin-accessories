-- Test script to verify order tracking system
-- Run this AFTER the main update script

-- ======================
-- 1. TEST TRACKING NUMBER GENERATION
-- ======================

-- Insert a test order to verify tracking number auto-generation
INSERT INTO orders (customer_name, phone, address, product_id, status)
SELECT 
  'Test Customer',
  '+212600000000',
  'Test Address, Casablanca',
  id,
  'pending'
FROM products 
LIMIT 1;

-- ======================
-- 2. VERIFY THE TEST ORDER
-- ======================

-- Check the last order with tracking number
SELECT 
  'Test order created successfully!' AS message,
  tracking_number,
  customer_name,
  status,
  created_at
FROM orders 
WHERE customer_name = 'Test Customer'
ORDER BY created_at DESC 
LIMIT 1;

-- ======================
-- 3. TEST TRACKING LOOKUP
-- ======================

-- Test looking up order by tracking number (simulate customer search)
WITH latest_order AS (
  SELECT tracking_number 
  FROM orders 
  WHERE customer_name = 'Test Customer'
  ORDER BY created_at DESC 
  LIMIT 1
)
SELECT 
  o.*,
  p.name as product_name,
  p.price as product_price
FROM orders o
JOIN products p ON o.product_id = p.id
WHERE o.tracking_number = (SELECT tracking_number FROM latest_order);

-- ======================
-- 4. CLEANUP TEST DATA (OPTIONAL)
-- ======================

-- Uncomment the line below if you want to remove the test order
-- DELETE FROM orders WHERE customer_name = 'Test Customer';

SELECT 'Order tracking system test completed!' AS result;
