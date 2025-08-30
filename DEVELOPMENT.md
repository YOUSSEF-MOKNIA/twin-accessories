# Development Guidelines

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account
- Git

### Initial Setup

1. Clone the repository
2. Run `npm install`
3. Copy `.env.example` to `.env.local`
4. Set up Supabase project and add credentials
5. Run `npm run dev`

## Code Standards

### TypeScript

- Use strict TypeScript configuration
- Define proper types for all props and data
- Avoid `any` type - use proper type definitions
- Use type imports where possible

### React Best Practices

- Use functional components with hooks
- Implement proper error boundaries
- Use React.memo for performance optimization where needed
- Handle loading and error states consistently

### TailwindCSS

- Use utility classes for styling
- Follow mobile-first responsive design
- Use custom utilities in `tailwind.config.js` for brand colors
- Avoid inline styles - use Tailwind classes

### File Organization

```
src/
├── components/          # Reusable UI components
├── contexts/           # React contexts
├── pages/              # Page components
│   ├── admin/         # Admin-specific pages
│   └── ...            # Public pages
├── lib/               # Utilities and configurations
├── types/             # TypeScript type definitions
└── hooks/             # Custom React hooks (if needed)
```

## Component Guidelines

### Component Structure

```tsx
import React from "react";
import { ComponentProps } from "./types";

interface Props {
  // Define prop types
}

const ComponentName: React.FC<Props> = ({ prop1, prop2 }) => {
  // Component logic

  return <div className="tailwind-classes">{/* JSX content */}</div>;
};

export default ComponentName;
```

### Props Naming

- Use descriptive prop names
- Boolean props should start with `is`, `has`, `can`, `should`
- Event handlers should start with `on`
- Use proper TypeScript interfaces for complex props

### State Management

- Use `useState` for local component state
- Use Context API for shared state (like authentication)
- Consider Zustand for complex global state management
- Keep state as close to where it's used as possible

## Form Handling

### React Hook Form Pattern

```tsx
import { useForm } from "react-hook-form";

interface FormData {
  // Define form fields
}

const MyForm: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    // Handle form submission
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Form fields with validation */}
    </form>
  );
};
```

### Validation Rules

- Always validate required fields
- Use appropriate validation patterns
- Provide helpful error messages
- Validate on both client and server side

## Data Fetching

### Supabase Patterns

```tsx
const [data, setData] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

useEffect(() => {
  const fetchData = async () => {
    try {
      const { data, error } = await supabase.from("table").select("*");

      if (error) throw error;
      setData(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, []);
```

### Error Handling

- Always handle errors gracefully
- Provide user-friendly error messages
- Log errors for debugging
- Implement retry mechanisms where appropriate

## Performance Optimization

### Image Optimization

- Use appropriate image formats (WebP when possible)
- Implement lazy loading for images
- Provide fallback images for broken URLs
- Use responsive images with proper sizing

### Code Splitting

- Use dynamic imports for large components
- Implement route-based code splitting
- Lazy load admin components

### Bundle Optimization

- Analyze bundle size regularly
- Remove unused dependencies
- Use tree shaking effectively
- Optimize import statements

## Security Best Practices

### Input Sanitization

- Validate all user inputs
- Use parameterized queries
- Escape special characters
- Implement rate limiting where needed

### Authentication

- Never store sensitive data in localStorage
- Use secure session management
- Implement proper logout functionality
- Check authentication state consistently

### Data Protection

- Follow principle of least privilege
- Implement proper RLS policies
- Validate data on server side
- Use HTTPS for all communications

## Testing Strategy

### Unit Testing (Recommended)

```bash
npm install -D @testing-library/react @testing-library/jest-dom vitest
```

### Testing Components

- Test user interactions
- Test error states
- Test loading states
- Mock external dependencies

### E2E Testing (Optional)

- Use Playwright or Cypress
- Test critical user flows
- Test admin functionality
- Test mobile responsiveness

## Mobile Development

### Responsive Design

- Use mobile-first approach
- Test on various screen sizes
- Ensure touch targets are large enough
- Optimize for one-handed use

### Performance on Mobile

- Minimize bundle size
- Optimize images for mobile
- Use appropriate loading strategies
- Test on slower networks

## Git Workflow

### Commit Messages

```
feat: add product search functionality
fix: resolve order form validation issue
docs: update deployment guide
style: improve mobile responsive design
refactor: optimize product fetching logic
```

### Branch Naming

- `feature/product-search`
- `fix/order-validation`
- `docs/deployment-guide`

### Pull Request Process

1. Create feature branch from main
2. Implement changes with tests
3. Update documentation if needed
4. Create pull request with description
5. Review and merge after approval

## Environment Management

### Development

- Use `.env.local` for local development
- Never commit environment files
- Use proper fallbacks for missing variables

### Production

- Set environment variables in deployment platform
- Use secure variable management
- Monitor for missing configurations

## Debugging

### Browser DevTools

- Use React Developer Tools
- Monitor network requests
- Check console for errors
- Analyze performance metrics

### Supabase Debugging

- Check database logs
- Monitor API usage
- Verify RLS policies
- Test queries in SQL editor

## Documentation

### Code Documentation

- Add JSDoc comments for complex functions
- Document component props
- Explain business logic
- Keep README.md updated

### API Documentation

- Document all database functions
- Explain RLS policies
- Document authentication flow
- Maintain schema documentation

## Deployment Checklist

Before deploying:

- [ ] All tests pass
- [ ] Build completes successfully
- [ ] Environment variables are set
- [ ] Database migrations are applied
- [ ] Security audit is clean
- [ ] Performance metrics are acceptable
- [ ] Mobile responsiveness is verified
- [ ] Admin functionality is tested

## Performance Monitoring

### Metrics to Track

- Page load times
- Bundle size
- Database query performance
- Error rates
- User engagement

### Tools

- Vercel Analytics
- Browser DevTools
- Supabase Dashboard
- Lighthouse scores

## Future Enhancements

### Potential Features

- Product search and filtering
- Customer reviews and ratings
- Inventory management
- Email notifications
- Payment processing integration
- Multi-language support
- Advanced analytics dashboard

### Technical Improvements

- Implement caching strategies
- Add offline support
- Optimize bundle splitting
- Implement automated testing
- Add monitoring and logging
- Enhance security measures
