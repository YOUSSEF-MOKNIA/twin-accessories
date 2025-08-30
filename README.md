# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

# TwinWatches - E-commerce Website

A modern, mobile-friendly e-commerce website for selling men's watches. Built with React, TypeScript, TailwindCSS, and Supabase.

## 🚀 Features

### Public Store

- **Home Page**: Hero section with call-to-action and feature highlights
- **Product Catalog**: Grid layout of watches with search and filtering
- **Product Details**: Detailed product pages with high-quality images
- **Order Form**: Simple order placement with customer information

### Admin Panel

- **Dashboard**: Overview of orders, products, and revenue statistics
- **Order Management**: View and update order status (new/confirmed/delivered)
- **Product Management**: Full CRUD operations for watch catalog
- **Authentication**: Secure login system for admin access

### Mobile-First Design

- Responsive layout optimized for mobile devices
- Touch-friendly interface elements
- Fast loading and smooth animations
- Accessible design following best practices

## 🛠 Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: TailwindCSS
- **Routing**: React Router DOM
- **Forms**: React Hook Form
- **Icons**: Lucide React
- **Backend**: Supabase (Database + Auth + API)
- **Deployment**: Vercel

## 📦 Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd TwinWatches
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` and add your Supabase credentials:

   ```
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up Supabase database**

   - Create a new Supabase project
   - Run the SQL schema from `supabase-schema.sql` in the SQL Editor
   - The schema will create tables and insert sample products

5. **Start the development server**
   ```bash
   npm run dev
   ```

## 🗄 Database Schema

### Products Table

```sql
- id (UUID, Primary Key)
- name (VARCHAR, NOT NULL)
- description (TEXT, NOT NULL)
- price (DECIMAL, NOT NULL)
- image_url (TEXT, NOT NULL)
- created_at (TIMESTAMP)
```

### Orders Table

```sql
- id (UUID, Primary Key)
- customer_name (VARCHAR, NOT NULL)
- phone (VARCHAR, NOT NULL)
- address (TEXT, NOT NULL)
- product_id (UUID, Foreign Key)
- status (ENUM: 'new', 'confirmed', 'delivered')
- created_at (TIMESTAMP)
```

## 🔐 Security

### Row Level Security (RLS)

- **Products**: Public read access, admin-only write access
- **Orders**: Admin-only read access, public insert access, admin-only update/delete

### Authentication

- Supabase Auth with email/password
- Protected admin routes
- Session management with automatic refresh

### Input Validation

- Client-side validation with React Hook Form
- Server-side validation through Supabase
- XSS protection and secure data handling

## 🚀 Deployment

### Frontend (Vercel)

1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Deploy with automatic builds on git push

### Backend (Supabase)

1. Create a Supabase project
2. Run the provided SQL schema
3. Configure authentication settings
4. Set up Row Level Security policies

## 📱 Usage

### For Customers

1. Browse the catalog at `/catalog`
2. View product details at `/product/:id`
3. Place orders at `/order` (no login required)
4. Receive confirmation message

### For Admins

1. Login at `/admin/login`
2. Access dashboard at `/admin/dashboard`
3. Manage orders at `/admin/orders`
4. Manage products at `/admin/products`

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Project Structure

```
src/
├── components/          # Reusable components
├── contexts/           # React contexts (Auth)
├── pages/              # Page components
│   ├── admin/         # Admin panel pages
│   └── ...            # Public pages
├── lib/               # Utilities and configurations
└── types/             # TypeScript type definitions
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, please contact [your-email@example.com] or create an issue in the GitHub repository.

---

Built with ❤️ for modern e-commerce

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from "eslint-plugin-react-x";
import reactDom from "eslint-plugin-react-dom";

export default tseslint.config([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs["recommended-typescript"],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```
