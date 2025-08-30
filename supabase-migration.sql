-- Add images column to products table to support multiple images
ALTER TABLE products ADD COLUMN IF NOT EXISTS images TEXT[];

-- Add some sample data with multiple images for testing
-- Update existing products to have multiple images
UPDATE products 
SET images = ARRAY[
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop',
  'https://images.unsplash.com/photo-1594534475808-b18fc33b045e?w=600&h=600&fit=crop',
  'https://images.unsplash.com/photo-1609081219090-a6d81d3085bf?w=600&h=600&fit=crop'
]
WHERE id = (SELECT id FROM products LIMIT 1);

-- If no products exist, create sample products with multiple images
INSERT INTO products (name, description, price, image_url, images) 
SELECT 
  'Montre Classique Élégante',
  'Une montre intemporelle alliant tradition et modernité. Mouvement suisse de précision, boîtier en acier inoxydable et bracelet en cuir véritable.',
  1299.00,
  'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600&h=600&fit=crop',
  ARRAY[
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1594534475808-b18fc33b045e?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1609081219090-a6d81d3085bf?w=600&h=600&fit=crop'
  ]
WHERE NOT EXISTS (SELECT 1 FROM products);

INSERT INTO products (name, description, price, image_url, images) 
SELECT 
  'Montre Sport Moderne',
  'Conçue pour l\'homme actif, cette montre sport offre résistance à l\'eau et fonctionnalités avancées. Parfaite pour toutes vos aventures.',
  899.00,
  'https://images.unsplash.com/photo-1434056886845-dac89ffe9b56?w=600&h=600&fit=crop',
  ARRAY[
    'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1585123334904-845d60e97b29?w=600&h=600&fit=crop'
  ]
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Montre Sport Moderne');

INSERT INTO products (name, description, price, image_url, images) 
SELECT 
  'Montre de Luxe Prestige',
  'L\'expression ultime du raffinement horloger. Mécanisme visible, matériaux nobles et finitions exceptionnelles pour les connaisseurs.',
  2499.00,
  'https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=600&h=600&fit=crop',
  ARRAY[
    'https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1533139502658-0198f920d8e8?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1606088842391-2d1c9b5456ac?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1564466809058-bf4114613495?w=600&h=600&fit=crop'
  ]
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Montre de Luxe Prestige');
