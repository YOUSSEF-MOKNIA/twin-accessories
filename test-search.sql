-- Test specific search for your order
-- Run this in Supabase SQL Editor to test exact matching

-- Test 1: Exact match search
SELECT 
  'Test 1: Exact match' as test,
  customer_name, 
  phone, 
  id 
FROM orders 
WHERE phone = '+212690173780' 
AND customer_name = 'MOKNIAYoussef';

-- Test 2: Case-insensitive partial name match
SELECT 
  'Test 2: Case-insensitive partial' as test,
  customer_name, 
  phone, 
  id 
FROM orders 
WHERE phone = '+212690173780' 
AND customer_name ILIKE '%MOKNIAYoussef%';

-- Test 3: Case-insensitive partial name match (lowercase)
SELECT 
  'Test 3: Lowercase partial' as test,
  customer_name, 
  phone, 
  id 
FROM orders 
WHERE phone = '+212690173780' 
AND customer_name ILIKE '%mokniayoussef%';

-- Test 4: Just phone number search
SELECT 
  'Test 4: Phone only' as test,
  customer_name, 
  phone, 
  id 
FROM orders 
WHERE phone = '+212690173780';

-- Test 5: Show all orders to see the exact format
SELECT 
  'Test 5: All orders' as test,
  customer_name, 
  phone, 
  id,
  LENGTH(customer_name) as name_length,
  LENGTH(phone) as phone_length
FROM orders 
ORDER BY created_at DESC 
LIMIT 5;
