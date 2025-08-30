# Supabase Storage Setup for TwinWatches

This guide explains how to set up Supabase Storage for image uploads in the TwinWatches admin panel.

## Quick Setup (Recommended)

**The easiest way to set up everything is to run the complete SQL script:**

1. Open your Supabase project dashboard
2. Go to **SQL Editor**
3. Create a new query and paste the content from `database-schema.sql`
4. Click **Run** to execute the complete setup

This will create all tables, policies, and storage configuration automatically.

## Manual Setup (Alternative)

If you prefer to set up manually, follow these steps:

### 1. Create Storage Bucket

1. Go to your Supabase project dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **Create a new bucket**
4. Set the following configuration:
   - **Bucket name**: `product-images`
   - **Public bucket**: ✅ Enable (so images can be accessed publicly)
   - **File size limit**: 50MB
   - **Allowed MIME types**: `image/jpeg,image/jpg,image/png,image/webp`

### 2. Database Schema

Run this SQL in your Supabase SQL Editor to create/update the products table:

```sql
-- Add images column to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}';

-- Update existing products to have empty images array
UPDATE products SET images = '{}' WHERE images IS NULL;
```

Complete table structure:

- `id` (UUID, Primary Key)
- `name` (TEXT, NOT NULL)
- `description` (TEXT, NOT NULL)
- `price` (DECIMAL, NOT NULL, > 0)
- `image_url` (TEXT, NOT NULL) - Main product image
- `images` (TEXT[], Default: '{}') - Array of all product images
- `created_at` (TIMESTAMP, Default: NOW())

### 3. Set Up Bucket Policies

Go to **Storage** → **Policies** and create the following policies:

#### Policy 1: Public Read Access

```sql
CREATE POLICY "Public can view product images" ON storage.objects
FOR SELECT TO public USING (bucket_id = 'product-images');
```

#### Policy 2: Admin Upload Access

```sql
CREATE POLICY "Authenticated users can upload images" ON storage.objects
FOR INSERT TO authenticated WITH CHECK (
  bucket_id = 'product-images' AND auth.role() = 'authenticated'
);
```

#### Policy 3: Admin Update Access

```sql
CREATE POLICY "Authenticated users can update images" ON storage.objects
FOR UPDATE TO authenticated USING (
  bucket_id = 'product-images' AND auth.role() = 'authenticated'
);
```

#### Policy 4: Admin Delete Access

```sql
CREATE POLICY "Authenticated users can delete images" ON storage.objects
FOR DELETE TO authenticated USING (
  bucket_id = 'product-images' AND auth.role() = 'authenticated'
);
```

### 4. Admin Authentication

Make sure your admin users have proper authentication. The image upload functionality requires authenticated users.

## Features Implemented

✅ **Multiple Image Upload**: Drag and drop multiple images from device
✅ **Image Preview**: Preview selected images before upload
✅ **Image Management**: Remove images from the selection
✅ **Automatic Resize**: Images are stored in Supabase Storage
✅ **MAD Currency**: All prices now display in Moroccan Dirham (MAD)
✅ **French Interface**: Admin panel is now in French
✅ **Validation**: File type and size validation (max 5MB per image)

## Usage

1. Go to Admin → Products
2. Click "Ajouter un Produit" (Add Product)
3. Fill in product name, description, and price in MAD
4. Select multiple images using the file input
5. Preview and remove images as needed
6. Submit to upload images and create the product

The first uploaded image becomes the main product image (`image_url`), and all images are stored in the `images` array for the gallery view.
