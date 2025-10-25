# CRM Admin Panel

A production-ready admin interface for managing a multi-tenant CRM SaaS platform.

## 🚀 Features

- **Dashboard**: Real-time KPIs, charts, and system overview
- **Tenant Management**: View, suspend, activate, and delete tenants
- **Usage Analytics**: Track message usage across all tenants with charts
- **Payments**: Monitor Stripe payments and invoices
- **System Health**: Monitor queues, database, API latency, and channel health
- **Settings**: Manage global API credentials (Meta, WhatsApp, Stripe)

## 🛠 Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **Shadcn/UI** - Component library
- **React Query** - Data fetching & caching
- **Zustand** - State management
- **Recharts** - Data visualization
- **React Router v6** - Routing
- **Axios** - HTTP client
- **Framer Motion** - Animations

## 📦 Installation

```bash
# Install dependencies
npm install

# Start development server (runs on port 5174)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🔐 Authentication

- Admin JWT token stored in `localStorage` as `adminToken`
- Separate from tenant user authentication
- Automatic logout on 401 responses
- Protected routes with AdminGuard

## 🎨 Features & UI

### Layout
- **Responsive sidebar** (drawer on mobile)
- **Dark/light theme** toggle (persistent)
- **Search bar** in topbar
- **User dropdown** with admin info and logout

### Pages

#### 1. Dashboard (`/`)
- Total tenants, active tenants, monthly messages, failed jobs
- Line chart: Messages per month
- Bar chart: Revenue trends
- System health metrics

#### 2. Tenants (`/tenants`)
- Filterable table (status, plan)
- Actions: View details, Suspend, Reactivate, Delete
- Detail modal with tenant info, users, channels, usage

#### 3. Usage (`/usage`)
- Aggregated usage stats
- Bar chart: Top 10 tenants by message volume
- Detailed table with messages by channel type

#### 4. Payments (`/payments`)
- Revenue stats (total, paid, pending)
- Payments table with Stripe invoice links
- Status badges (paid, pending, failed)

#### 5. System (`/system`)
- Queue status, failed jobs, DB size, avg latency
- API latency chart (24 hours)
- Manual actions: Refresh tokens, Run backfill
- Horizon status, channel health

#### 6. Settings (`/settings`)
- Meta API credentials (App ID, Secret, Verify Token)
- WhatsApp Business credentials
- Stripe API keys
- "Validate Connection" buttons per service

## 🔗 API Integration

All API calls go through `/api/admin/*` endpoint with JWT bearer token.

### API Endpoints Used:
- `POST /api/admin/login` - Admin authentication
- `GET /api/admin/health` - System health data
- `GET /api/admin/tenants` - List tenants (paginated, filterable)
- `GET /api/admin/tenants/:id` - Tenant details
- `PATCH /api/admin/tenants/:id/status` - Update tenant status
- `DELETE /api/admin/tenants/:id` - Delete tenant
- `GET /api/admin/usage` - Usage analytics
- `GET /api/admin/settings` - Get system settings
- `PATCH /api/admin/settings` - Update system settings
- `POST /api/admin/settings/validate` - Validate API credentials

## 🎨 Theme

- Light/dark mode support
- Persistent theme preference (localStorage)
- CSS variables for easy customization
- Shadcn/UI design system

## 📱 Mobile Responsive

- Mobile-first design
- Drawer sidebar on mobile
- Responsive tables and charts
- Touch-friendly UI elements

## 🔔 Notifications

- Toast notifications for all actions
- Success/error feedback
- Auto-dismiss after delay

## 🛡 Security

- JWT token in localStorage
- Automatic logout on token expiration
- Protected routes
- Sensitive data (API keys) masked in forms

## 📊 Data Visualization

- Recharts for all charts
- Responsive containers
- Line charts, bar charts
- Custom tooltips and legends

## 🚦 State Management

- **Auth Store**: Admin authentication state
- **UI Store**: Theme, sidebar state (persistent)
- React Query for server state

## 🎯 Best Practices

- TypeScript for type safety
- Component composition
- Custom hooks for reusability
- Error boundaries
- Loading states
- Empty states
- Optimistic updates

## 📝 Development

```bash
# Run development server
npm run dev

# Type checking
npx tsc --noEmit

# Linting
npm run lint

# Build for production
npm run build
```

## 🌐 Deployment

1. Build the app: `npm run build`
2. Deploy the `dist` folder to your hosting provider
3. Configure environment variables if needed
4. Ensure API endpoint is accessible

## 📄 License

Proprietary - CRM SaaS Platform


