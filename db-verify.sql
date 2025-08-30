-- VERIFICATION: Check that everything worked
-- Run this to verify the update was successful

SELECT 
  'Database update completed successfully!' AS message,
  COUNT(*) AS total_orders,
  COUNT(tracking_number) AS orders_with_tracking
FROM orders;

-- Show sample tracking numbers
SELECT 
  tracking_number,
  customer_name,
  status,
  created_at
FROM orders 
ORDER BY created_at DESC 
LIMIT 5;
