-- TwinWatches Database Schema
-- Run this in your Supabase SQL Editor

-- Create products table
CREATE TABLE public.products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL CHECK (price > 0),
    image_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create orders table
CREATE TABLE public.orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    address TEXT NOT NULL,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
    status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'confirmed', 'delivered')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_products_created_at ON public.products(created_at DESC);
CREATE INDEX idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_product_id ON public.orders(product_id);

-- Row Level Security (RLS) Policies

-- Enable RLS on tables
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Products policies
-- Allow anyone to read products (for public catalog)
CREATE POLICY "Anyone can view products" ON public.products
    FOR SELECT USING (true);

-- Only authenticated users (admins) can insert/update/delete products
CREATE POLICY "Only admins can manage products" ON public.products
    FOR ALL USING (auth.role() = 'authenticated');

-- Orders policies
-- Only authenticated users (admins) can read orders
CREATE POLICY "Only admins can view orders" ON public.orders
    FOR SELECT USING (auth.role() = 'authenticated');

-- Anyone can insert orders (for customer orders)
CREATE POLICY "Anyone can create orders" ON public.orders
    FOR INSERT WITH CHECK (true);

-- Only authenticated users (admins) can update orders
CREATE POLICY "Only admins can update orders" ON public.orders
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Only authenticated users (admins) can delete orders
CREATE POLICY "Only admins can delete orders" ON public.orders
    FOR DELETE USING (auth.role() = 'authenticated');

-- Insert sample products
INSERT INTO public.products (name, description, price, image_url) VALUES
(
    'Classic Chronograph',
    'A timeless chronograph watch featuring a stainless steel case, leather strap, and Swiss quartz movement. Perfect for both business and casual occasions.',
    299.99,
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop&crop=center'
),
(
    'Sport Titanium',
    'Lightweight titanium sports watch with water resistance up to 200m. Features a robust design perfect for active lifestyles and outdoor adventures.',
    459.99,
    'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=500&h=500&fit=crop&crop=center'
),
(
    'Executive Gold',
    'Luxury gold-plated dress watch with genuine leather strap. Elegant design with Roman numerals and date display. Perfect for formal occasions.',
    799.99,
    'https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=500&h=500&fit=crop&crop=center'
),
(
    'Diver Professional',
    'Professional diving watch with rotating bezel and luminous markers. Water resistant to 300m with automatic movement and steel bracelet.',
    649.99,
    'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=500&h=500&fit=crop&crop=center'
),
(
    'Vintage Aviator',
    'Classic aviator-style watch inspired by military timepieces. Features large easy-to-read numerals and a genuine leather strap.',
    349.99,
    'https://images.unsplash.com/photo-1533139502658-0198f920d8e8?w=500&h=500&fit=crop&crop=center'
),
(
    'Smart Hybrid',
    'Modern hybrid smartwatch combining traditional analog display with smart features. Tracks fitness, notifications, and has 6-month battery life.',
    399.99,
    'https://images.unsplash.com/photo-1579586337278-3f436f25d4d6?w=500&h=500&fit=crop&crop=center'
);

-- Create a function to get order statistics (for admin dashboard)
CREATE OR REPLACE FUNCTION get_order_stats()
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_orders', (SELECT COUNT(*) FROM orders),
        'new_orders', (SELECT COUNT(*) FROM orders WHERE status = 'new'),
        'confirmed_orders', (SELECT COUNT(*) FROM orders WHERE status = 'confirmed'),
        'delivered_orders', (SELECT COUNT(*) FROM orders WHERE status = 'delivered'),
        'total_revenue', (
            SELECT COALESCE(SUM(p.price), 0)
            FROM orders o
            JOIN products p ON o.product_id = p.id
        )
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
