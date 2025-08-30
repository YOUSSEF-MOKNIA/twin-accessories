-- TwinWatches Database Schema Setup
-- Run this script in your Supabase SQL Editor

-- ======================
-- 1. PRODUCTS TABLE
-- ======================

-- Create products table if it doesn't exist
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL CHECK (price > 0),
  image_url TEXT NOT NULL,
  images TEXT[] DEFAULT '{}', -- Array of image URLs for gallery
  has_color_variants BOOLEAN DEFAULT FALSE, -- Whether this product has multiple colors
  colors JSONB DEFAULT '[]', -- Array of color objects: [{"name": "Noir", "hex": "#000000", "images": ["url1", "url2"]}]
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add new columns if they don't exist (for existing tables)
DO $$ 
BEGIN
  -- Add images column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'images'
  ) THEN
    ALTER TABLE products ADD COLUMN images TEXT[] DEFAULT '{}';
  END IF;
  
  -- Add has_color_variants column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'has_color_variants'
  ) THEN
    ALTER TABLE products ADD COLUMN has_color_variants BOOLEAN DEFAULT FALSE;
  END IF;
  
  -- Add colors column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'colors'
  ) THEN
    ALTER TABLE products ADD COLUMN colors JSONB DEFAULT '[]';
  END IF;
END $$;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);

-- ======================
-- 2. ORDERS TABLE
-- ======================

-- Create orders table if it doesn't exist
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tracking_number TEXT UNIQUE NOT NULL DEFAULT 'TW' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0'),
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  selected_color TEXT, -- Color name selected by customer (null if no color variants)
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add selected_color column if it doesn't exist (for existing tables)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'selected_color'
  ) THEN
    ALTER TABLE orders ADD COLUMN selected_color TEXT;
  END IF;
  
  -- Add tracking_number column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'tracking_number'
  ) THEN
    ALTER TABLE orders ADD COLUMN tracking_number TEXT UNIQUE NOT NULL DEFAULT 'TW' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  END IF;
END $$;

-- Add indexes for orders
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_product_id ON orders(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_tracking_number ON orders(tracking_number);

-- ======================
-- 3. ROW LEVEL SECURITY (RLS)
-- ======================

-- Enable RLS on products table
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Enable RLS on orders table
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- ======================
-- 4. PRODUCTS POLICIES
-- ======================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public can view products" ON products;
DROP POLICY IF EXISTS "Authenticated users can insert products" ON products;
DROP POLICY IF EXISTS "Authenticated users can update products" ON products;
DROP POLICY IF EXISTS "Authenticated users can delete products" ON products;

-- Allow public read access to products
CREATE POLICY "Public can view products" ON products
  FOR SELECT TO public USING (true);

-- Allow authenticated users (admins) to insert products
CREATE POLICY "Authenticated users can insert products" ON products
  FOR INSERT TO authenticated WITH CHECK (true);

-- Allow authenticated users (admins) to update products
CREATE POLICY "Authenticated users can update products" ON products
  FOR UPDATE TO authenticated USING (true);

-- Allow authenticated users (admins) to delete products
CREATE POLICY "Authenticated users can delete products" ON products
  FOR DELETE TO authenticated USING (true);

-- ======================
-- 5. ORDERS POLICIES
-- ======================

-- Drop existing order policies if they exist
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
-- 6. STORAGE BUCKET SETUP
-- ======================

-- Create product-images bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images', 
  'product-images', 
  true, 
  52428800, -- 50MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ======================
-- 7. STORAGE POLICIES
-- ======================

-- Enable RLS on storage.objects (should already be enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing storage policies if they exist
DROP POLICY IF EXISTS "Public can view product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete images" ON storage.objects;

-- Allow public access to view product images
CREATE POLICY "Public can view product images" ON storage.objects
  FOR SELECT TO public USING (bucket_id = 'product-images');

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload images" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (
    bucket_id = 'product-images' AND 
    auth.role() = 'authenticated'
  );

-- Allow authenticated users to update images
CREATE POLICY "Authenticated users can update images" ON storage.objects
  FOR UPDATE TO authenticated USING (
    bucket_id = 'product-images' AND 
    auth.role() = 'authenticated'
  );

-- Allow authenticated users to delete images
CREATE POLICY "Authenticated users can delete images" ON storage.objects
  FOR DELETE TO authenticated USING (
    bucket_id = 'product-images' AND 
    auth.role() = 'authenticated'
  );

-- ======================
-- 8. SAMPLE DATA (OPTIONAL)
-- ======================

-- Uncomment below to insert sample products for testing
/*
-- Sample product without color variants
INSERT INTO products (name, description, price, image_url, images, has_color_variants) VALUES
(
  'Montre Classic Simple',
  'Une montre élégante avec un design intemporel, disponible en une seule couleur.',
  2200.00,
  'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600&h=600&fit=crop',
  ARRAY[
    'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop'
  ],
  FALSE
);

-- Sample product with color variants
INSERT INTO products (name, description, price, image_url, images, has_color_variants, colors) VALUES
(
  'Montre Elite Collection',
  'Montre de luxe disponible en plusieurs couleurs. Chaque couleur apporte son propre caractère à cette pièce d''exception.',
  3500.00,
  'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600&h=600&fit=crop',
  ARRAY[
    'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1533139502658-0198f920d8e8?w=600&h=600&fit=crop'
  ],
  TRUE,
  '[
    {
      "name": "Noir",
      "hex": "#000000",
      "images": [
        "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600&h=600&fit=crop"
      ]
    },
    {
      "name": "Or",
      "hex": "#FFD700",
      "images": [
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop"
      ]
    },
    {
      "name": "Argent",
      "hex": "#C0C0C0",
      "images": [
        "https://images.unsplash.com/photo-1533139502658-0198f920d8e8?w=600&h=600&fit=crop"
      ]
    }
  ]'::jsonb
);
*/

-- ======================
-- 9. VERIFICATION QUERIES
-- ======================

-- Run these queries to verify everything is set up correctly

-- Check products table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'products' 
ORDER BY ordinal_position;

-- Check orders table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'orders' 
ORDER BY ordinal_position;

-- Check storage bucket
SELECT * FROM storage.buckets WHERE id = 'product-images';

-- Check policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename IN ('products', 'orders') 
   OR (schemaname = 'storage' AND tablename = 'objects');

-- Success message
SELECT 'TwinWatches database schema setup completed successfully!' AS message;
