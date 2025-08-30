<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# TwinWatches E-commerce Project

This is a mobile-friendly e-commerce website for selling men's watches built with:

- **Frontend**: React + TypeScript + TailwindCSS + Vite
- **Backend**: Supabase (Database + Authentication + API)
- **Routing**: React Router DOM
- **Forms**: React Hook Form
- **Icons**: Lucide React

## Project Structure

### Public Store (No Authentication Required)

- `/` - Home page with hero section and features
- `/catalog` - Product catalog with grid layout
- `/product/:id` - Product detail page
- `/order` - Order form with validation

### Admin Panel (Authentication Required)

- `/admin/login` - Admin login page
- `/admin/dashboard` - Admin dashboard with statistics
- `/admin/orders` - Order management with status updates
- `/admin/products` - Product management (CRUD operations)

## Database Schema

### Tables:

- `products`: id, name, description, price, image_url, created_at
- `orders`: id, customer_name, phone, address, product_id, status, created_at

### Security:

- Row Level Security (RLS) enabled
- Public read access for products
- Admin-only access for order management
- Anyone can create orders (customer orders)

## Key Features

### Mobile-First Design

- Responsive layout using TailwindCSS
- Touch-friendly interface
- Optimized for mobile admin management

### Security

- Protected admin routes with authentication
- Input validation on all forms
- XSS/CSRF protection
- Secure environment variable handling

### User Experience

- Loading states and error handling
- Form validation with helpful messages
- Confirmation messages for actions
- Image fallbacks for broken URLs

## Development Guidelines

1. Use TypeScript for type safety
2. Follow mobile-first responsive design
3. Implement proper error handling
4. Add loading states for async operations
5. Validate all user inputs
6. Use semantic HTML and accessibility features
7. Optimize images and performance

## Environment Setup

1. Copy `.env.example` to `.env.local`
2. Add your Supabase project URL and anon key
3. Run the SQL schema in Supabase SQL Editor
4. Create an admin user in Supabase Auth

## Deployment

- Frontend: Vercel (configured with vercel.json)
- Backend: Supabase (free tier)
- Environment variables configured in Vercel dashboard
