# 🎭 Demo Mode Quick Guide

## How to Enable Demo Mode

### Step 1: Create/Update Environment File

Create `frontend/.env.local` (or update existing `.env`):

```env
VITE_API_URL=http://localhost:8000/api
VITE_MODE=demo
```

### Step 2: Restart Dev Server

```bash
cd frontend
npm run dev
```

### Step 3: Verify

- Look for **"🎭 Demo Mode"** badge on pages
- All data should be dummy/demo data
- No API calls should be made

---

## How to Disable Demo Mode

### Option 1: Change to Production
```env
VITE_MODE=production
```

### Option 2: Remove Variable
```env
# Remove or comment out VITE_MODE
# VITE_MODE=demo
```

Then restart dev server.

---

## Demo Data Available

All demo data is in `frontend/src/lib/demoData.ts`:

- ✅ `demoDashboardStats` - Dashboard metrics
- ✅ `demoChannels` - Connected channels
- ✅ `demoConversations` - Inbox conversations
- ✅ `demoMessages` - Conversation messages
- ✅ `demoPosts` - Social media posts
- ✅ `demoMedia` - Media library files
- ✅ `demoInsights` - Analytics data
- ✅ `demoInsightsSummary` - Summary stats
- ✅ `demoTopPosts` - Top performing posts
- ✅ `demoComments` - Comment moderation data
- ✅ `demoPlans` - Subscription plans
- ✅ `demoSubscription` - Current subscription
- ✅ `demoUsers` - Team members

---

## Pages with Demo Mode Support

### ✅ Fully Implemented:
- **Dashboard** - Shows demo stats and charts
- **Integrations** - Shows demo channels
- **Register** - Uses demo plans for selection
- **Onboarding** - Shows demo mode message

### 🔄 Can Be Updated (Structure Ready):
- **Inbox** - Use `demoConversations` and `demoMessages`
- **Posts** - Use `demoPosts`
- **Media** - Use `demoMedia`
- **Analytics** - Use `demoInsights`, `demoInsightsSummary`, `demoTopPosts`
- **Comments** - Use `demoComments`
- **Billing** - Use `demoPlans` and `demoSubscription`

---

## Usage Example

```typescript
import { isDemoMode, demoDashboardStats } from '@/lib/demoData'

const { data: stats } = useQuery({
  queryKey: ['dashboard-stats'],
  queryFn: async () => {
    if (isDemoMode()) {
      return demoDashboardStats  // Return demo data
    }
    const response = await api.get('/tenant/dashboard/stats')
    return response.data  // Return real API data
  },
  enabled: !isDemoMode(),  // Only fetch if not demo
})
```

---

## Benefits

1. **No Backend Required** - Showcase app without API
2. **Fast Development** - Test UI without waiting for API
3. **Easy Demos** - Perfect for client presentations
4. **Consistent Data** - Same data every time for demos

---

## Notes

- Demo mode is **client-side only**
- No backend changes needed
- All demo data is static (no mutations)
- Real API calls are disabled when demo mode is active


