-- STEP 5: Update RLS policies
-- Run this fifth

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can create orders" ON orders;
DROP POLICY IF EXISTS "Anyone can view orders by tracking number" ON orders;
DROP POLICY IF EXISTS "Authenticated users can view orders" ON orders;
DROP POLICY IF EXISTS "Authenticated users can update orders" ON orders;
DROP POLICY IF EXISTS "Authenticated users can delete orders" ON orders;

-- Create new policies
CREATE POLICY "Anyone can create orders" ON orders
  FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Anyone can view orders by tracking number" ON orders
  FOR SELECT TO public USING (true);

CREATE POLICY "Authenticated users can view orders" ON orders
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can update orders" ON orders
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete orders" ON orders
  FOR DELETE TO authenticated USING (true);
