# TwinWatches - Store Updates

## New Features Added

### 🖼️ **Hero Image**

- Updated hero section to use `/public/HERO.png`
- Make sure to place your watch image with transparent background in `public/HERO.png`

### 🎨 **Multiple Product Images**

- Products now support multiple images in different angles/positions
- Image gallery with navigation arrows and thumbnails
- Smooth transitions between images
- Responsive design for mobile and desktop

### 📞 **Contact Footer**

- Beautiful footer with brand information
- Phone number: +33 1 23 45 67 89
- Instagram: @twinwatches
- Quick navigation links

## Database Schema Update

The `products` table now includes an `images` column:

```sql
ALTER TABLE products ADD COLUMN IF NOT EXISTS images TEXT[];
```

### Adding Multiple Images to Products

When adding products via the admin panel or database, you can now include multiple images:

```sql
INSERT INTO products (name, description, price, image_url, images) VALUES (
  'Nom de la Montre',
  'Description...',
  1299.00,
  'url_image_principale.jpg',
  ARRAY['image1.jpg', 'image2.jpg', 'image3.jpg']
);
```

## Image Gallery Features

- **Main Image Display**: Large image with navigation
- **Thumbnail Strip**: Click to switch between images
- **Navigation Arrows**: Previous/Next buttons
- **Image Indicators**: Dots showing current image position
- **Mobile Responsive**: Touch-friendly navigation

## Contact Information

Update the footer contact details in `src/pages/HomeTemp.tsx`:

```tsx
// Phone number
<a href="tel:+212 617-373442">+212 617-373442</a>

// Instagram
<a href="https://instagram.com/twinwatches">@twinwatches</a>
```

## Files Modified

1. `src/pages/HomeTemp.tsx` - Added image gallery, footer, hero image
2. `src/lib/supabase.ts` - Updated types for images array
3. `supabase-migration.sql` - Database schema update

## Usage

1. Place your hero watch image in `public/HERO.png`
2. Run the SQL migration in Supabase to add the images column
3. Add products with multiple images through the admin panel
4. Update contact information in the footer as needed

The gallery automatically handles:

- Single image products (no navigation shown)
- Multiple image products (full gallery experience)
- Fallback to default image if none provided
