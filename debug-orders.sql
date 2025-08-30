-- Debug script to check your existing orders data
-- Run this in Supabase SQL Editor to see what data you have

-- Check all orders with their phone numbers and customer names
SELECT 
  id,
  customer_name,
  phone,
  status,
  created_at,
  LENGTH(phone) as phone_length,
  LENGTH(customer_name) as name_length
FROM orders 
ORDER BY created_at DESC;

-- Check for common phone number format issues
SELECT 
  'Phone number formats in database:' as info,
  phone,
  customer_name,
  COUNT(*) as count
FROM orders 
GROUP BY phone, customer_name
ORDER BY count DESC;

-- Check if there are any special characters or spaces
SELECT 
  customer_name,
  phone,
  ASCII(SUBSTRING(phone, 1, 1)) as first_char_ascii,
  ASCII(SUBSTRING(customer_name, 1, 1)) as name_first_char_ascii
FROM orders 
LIMIT 5;
