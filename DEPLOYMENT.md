# Deployment Guide

## Supabase Setup

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new account or sign in
3. Create a new project
4. Choose your organization and set up the project details

### 2. Database Setup

1. Go to the SQL Editor in your Supabase dashboard
2. Copy and paste the contents of `supabase-schema.sql`
3. Run the script to create tables, policies, and sample data

### 3. Get Your Keys

1. Go to Settings > API in your Supabase dashboard
2. Copy your `Project URL` and `anon` key
3. These will be used in your environment variables

### 4. Configure Authentication

1. Go to Authentication > Settings
2. Configure your site URL (e.g., `https://yoursite.vercel.app`)
3. Add redirect URLs for auth callbacks

## Vercel Deployment

### 1. Prepare Your Repository

1. Push your code to GitHub
2. Make sure `.env.local` is in `.gitignore` (it already is)
3. Ensure your `vercel.json` configuration is correct

### 2. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Vercel will auto-detect it's a Vite project

### 3. Configure Environment Variables

In your Vercel dashboard, go to Settings > Environment Variables and add:

- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anon key

### 4. Deploy

1. Vercel will automatically deploy your app
2. You'll get a URL like `https://your-app.vercel.app`
3. Update your Supabase site URL to match your deployed URL

## Admin User Setup

### Create Your First Admin User

1. Go to your Supabase dashboard
2. Navigate to Authentication > Users
3. Click "Add User"
4. Enter email and password for your admin account
5. This user will be able to access `/admin/login`

## Testing Your Deployment

### Public Store Testing

1. Visit your deployed URL
2. Navigate through the catalog
3. View product details
4. Test the order form (orders will be saved to database)

### Admin Panel Testing

1. Go to `/admin/login`
2. Sign in with your admin credentials
3. Test the dashboard, orders, and products sections
4. Try adding, editing, and deleting products
5. Test order status updates

## Custom Domain (Optional)

### 1. Purchase a Domain

- Buy a domain from providers like Namecheap, GoDaddy, etc.

### 2. Configure in Vercel

1. Go to your project settings in Vercel
2. Navigate to Domains
3. Add your custom domain
4. Follow the DNS configuration instructions

### 3. Update Supabase Settings

- Update your site URL in Supabase to use your custom domain

## SSL Certificate

- Vercel automatically provides SSL certificates
- Your site will be accessible via HTTPS

## Monitoring and Maintenance

### Vercel Analytics

- Enable Vercel Analytics for visitor insights
- Monitor performance and usage

### Supabase Monitoring

- Monitor database usage in Supabase dashboard
- Set up alerts for usage limits

### Backups

- Supabase automatically backs up your database
- Consider setting up regular data exports for critical data

## Environment Variables Reference

```bash
# Required for frontend
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## Troubleshooting

### Build Errors

- Check that all environment variables are set correctly
- Ensure TypeScript compilation passes locally
- Verify all dependencies are installed

### Authentication Issues

- Verify Supabase Auth settings
- Check redirect URLs configuration
- Ensure admin user exists in Supabase Auth

### Database Errors

- Verify RLS policies are set up correctly
- Check that the schema was applied properly
- Ensure foreign key relationships are intact

### Performance Issues

- Monitor Vercel analytics
- Optimize images for web
- Consider implementing caching strategies

## Security Checklist

- [ ] Environment variables are properly configured
- [ ] Supabase RLS policies are enabled
- [ ] Admin routes are protected
- [ ] Input validation is implemented
- [ ] HTTPS is enforced
- [ ] Sensitive data is not exposed in client code

## Cost Considerations

### Supabase Free Tier Limits

- 500MB database storage
- 2GB bandwidth per month
- 50,000 monthly active users

### Vercel Free Tier Limits

- 100GB bandwidth per month
- 6,000 build execution hours
- Unlimited static sites

Both platforms offer paid plans for higher usage needs.
