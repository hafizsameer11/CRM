# CRM SaaS Frontend

Modern React + TypeScript frontend for the CRM SaaS application.

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **TailwindCSS** - Utility-first CSS
- **Shadcn/UI** - Component library
- **React Query** - Data fetching & caching
- **Zustand** - State management
- **Axios** - HTTP client
- **React Router v6** - Routing
- **Framer Motion** - Animations
- **Recharts** - Charts & graphs
- **Pusher** - Real-time events

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Setup

```bash
cp .env.example .env
```

Edit `.env`:
```env
VITE_API_URL=http://localhost:8000/api
```

### 3. Run Development Server

```bash
npm run dev
```

App will be available at `http://localhost:3000`

### 4. Build for Production

```bash
npm run build
npm run preview
```

## Features

### Authentication
- ✅ JWT-based authentication
- ✅ Login & Registration forms
- ✅ Protected routes
- ✅ Persistent auth state

### Dashboard
- ✅ Real-time statistics
- ✅ Message analytics chart
- ✅ Quick overview cards

### Inbox
- ✅ Conversation list
- ✅ Real-time messaging
- ✅ Message status indicators
- ✅ Multi-channel support

### Integrations
- ✅ Facebook Pages
- ✅ Instagram Accounts  
- ✅ WhatsApp Business
- ✅ OAuth flow
- ✅ Channel status management

### Billing
- ✅ Current subscription display
- ✅ Plan comparison
- ✅ Upgrade/downgrade
- ✅ Usage tracking

### Settings
- ✅ Profile management
- ✅ Password change
- ✅ Dark mode toggle

## Project Structure

```
src/
├── components/
│   ├── layout/          # Sidebar, Topbar, Protected routes
│   └── ui/              # Shadcn components
├── lib/
│   ├── api.ts           # Axios instance
│   └── utils.ts         # Utility functions
├── pages/               # Route components
├── store/               # Zustand stores
├── App.tsx              # Main app component
├── main.tsx             # Entry point
└── index.css            # Global styles
```

## Key Concepts

### State Management

**Auth Store** (`store/authStore.ts`):
- User authentication state
- JWT token management
- Login/logout actions

**UI Store** (`store/uiStore.ts`):
- Sidebar state
- Dark mode
- Toast notifications

### API Integration

All API calls use the configured Axios instance (`lib/api.ts`) with:
- Automatic JWT token injection
- 401 redirect to login
- Error handling

### React Query

Data fetching with automatic:
- Caching (5 min stale time)
- Background refetching
- Loading/error states

### Responsive Design

- Mobile-first approach
- Collapsible sidebar on mobile
- Responsive grid layouts
- Touch-friendly UI

## Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:8000/api` |

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

Proprietary - All rights reserved
