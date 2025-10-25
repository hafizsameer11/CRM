# API Reference

## Base URL
```
http://localhost:8000/api
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer {token}
```

### Token Types
- **Tenant Token**: Obtained via `/auth/login` or `/auth/register`
- **Admin Token**: Obtained via `/admin/login`

---

## Public Endpoints

### Health Check
```http
GET /health
```

**Response:**
```json
{
  "ok": true,
  "timestamp": "2025-10-22T10:30:00Z"
}
```

---

## Authentication Endpoints

### Register Tenant
```http
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "password_confirmation": "password123",
  "company_name": "Acme Inc"
}
```

**Response:**
```json
{
  "message": "Registration successful",
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "bearer",
  "expires_in": 86400,
  "user": {
    "id": 1,
    "tenant_id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "owner"
  }
}
```

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "bearer",
  "expires_in": 86400,
  "user": { ... }
}
```

---

## Tenant Endpoints

### Get Current User
```http
GET /tenant/me
Authorization: Bearer {tenant_token}
```

**Response:**
```json
{
  "id": 1,
  "tenant_id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "role": "owner",
  "tenant": {
    "id": 1,
    "name": "Acme Inc",
    "status": "active"
  }
}
```

### List Users
```http
GET /tenant/users
Authorization: Bearer {tenant_token}
```

**Required Role:** owner, manager

**Response:**
```json
[
  {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "owner",
    "last_login_at": "2025-10-22T10:00:00Z"
  }
]
```

### Create User
```http
POST /tenant/users
Authorization: Bearer {tenant_token}
Content-Type: application/json

{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "password": "password123",
  "password_confirmation": "password123",
  "role": "agent"
}
```

**Required Role:** owner, manager

### List Channels
```http
GET /tenant/channels?type=facebook&status=active
Authorization: Bearer {tenant_token}
```

**Query Parameters:**
- `type`: facebook, instagram, whatsapp (optional)
- `status`: active, expired, revoked, error (optional)

**Response:**
```json
[
  {
    "id": 1,
    "type": "facebook",
    "identifiers": {
      "page_id": "123456789",
      "page_name": "Acme Inc Page"
    },
    "status": "active",
    "expires_at": "2025-12-22T00:00:00Z"
  }
]
```

### List Conversations
```http
GET /tenant/conversations?status=open&per_page=20
Authorization: Bearer {tenant_token}
```

**Query Parameters:**
- `status`: open, closed, pending (optional)
- `channel_id`: filter by channel (optional)
- `assigned_to`: user ID (optional)
- `per_page`: pagination (default: 20)
- `sort_by`: last_message_at, created_at (default: last_message_at)
- `sort_order`: asc, desc (default: desc)

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "channel_id": 1,
      "peer_id": "987654321",
      "status": "open",
      "assigned_to": 2,
      "last_message_at": "2025-10-22T09:30:00Z",
      "channel": { ... },
      "assigned_user": { ... }
    }
  ],
  "current_page": 1,
  "last_page": 5,
  "per_page": 20,
  "total": 95
}
```

### Get Conversation with Messages
```http
GET /tenant/conversations/1
Authorization: Bearer {tenant_token}
```

**Response:**
```json
{
  "id": 1,
  "status": "open",
  "messages": [
    {
      "id": 1,
      "direction": "in",
      "body": "Hello, I need help",
      "type": "text",
      "created_at": "2025-10-22T09:30:00Z"
    }
  ]
}
```

### Send Message
```http
POST /tenant/conversations/1/messages
Authorization: Bearer {tenant_token}
Content-Type: application/json
Rate-Limit: 60 requests per minute

{
  "body": "Hello! How can I help you?",
  "type": "text"
}
```

**With Media:**
```json
{
  "body": "Check this out",
  "media": [
    {
      "url": "https://example.com/image.jpg",
      "type": "image"
    }
  ],
  "type": "image"
}
```

### Update Conversation
```http
PATCH /tenant/conversations/1
Authorization: Bearer {tenant_token}
Content-Type: application/json

{
  "status": "closed",
  "assigned_to": 3
}
```

---

## Billing Endpoints

### List Plans
```http
GET /tenant/billing/plans
Authorization: Bearer {tenant_token}
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "Starter",
    "slug": "starter",
    "monthly_price": 2900,
    "limits": {
      "max_channels": 3,
      "max_users": 5,
      "max_messages_per_month": 1000
    }
  }
]
```

### Subscribe
```http
POST /tenant/billing/subscribe
Authorization: Bearer {tenant_token}
Content-Type: application/json

{
  "plan_id": 1,
  "payment_method": "pm_card_visa"
}
```

**Required Role:** owner

### Get Current Subscription
```http
GET /tenant/billing/subscription
Authorization: Bearer {tenant_token}
```

**Required Role:** owner

### Cancel Subscription
```http
POST /tenant/billing/subscription/cancel
Authorization: Bearer {tenant_token}
```

**Required Role:** owner

### List Invoices
```http
GET /tenant/billing/invoices
Authorization: Bearer {tenant_token}
```

**Required Role:** owner

---

## Meta OAuth Endpoints

### Initiate OAuth Flow
```http
GET /meta/connect
Authorization: Bearer {tenant_token}
```

Redirects to Facebook OAuth page.

### Get User Pages
```http
GET /meta/pages
Authorization: Bearer {tenant_token}
```

**Response:**
```json
{
  "pages": [
    {
      "id": "123456789",
      "name": "Acme Inc Page",
      "access_token": "EAABwz..."
    }
  ]
}
```

### Attach Facebook Page
```http
POST /meta/attach/facebook
Authorization: Bearer {tenant_token}
Content-Type: application/json

{
  "page_id": "123456789",
  "page_name": "Acme Inc Page",
  "page_access_token": "EAABwz..."
}
```

### Attach Instagram Account
```http
POST /meta/attach/instagram
Authorization: Bearer {tenant_token}
Content-Type: application/json

{
  "instagram_account_id": "987654321",
  "username": "acme_inc",
  "access_token": "EAABwz..."
}
```

### Attach WhatsApp Number
```http
POST /meta/attach/whatsapp
Authorization: Bearer {tenant_token}
Content-Type: application/json

{
  "phone_number_id": "111222333",
  "phone_number": "+1234567890",
  "waba_id": "444555666",
  "access_token": "EAABwz..."
}
```

---

## Admin Endpoints

### Admin Login
```http
POST /admin/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "password"
}
```

**Response:**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "bearer",
  "expires_in": 86400,
  "admin": {
    "id": 1,
    "name": "Super Admin",
    "email": "admin@example.com"
  }
}
```

### System Health
```http
GET /admin/health
Authorization: Bearer {admin_token}
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-10-22T10:30:00Z",
  "database": {
    "status": "connected",
    "size_mb": 125.5
  },
  "redis": {
    "status": "connected"
  },
  "queue": {
    "pending_webhooks": 5,
    "processing_webhooks": 2,
    "failed_webhooks_last_hour": 0
  },
  "system": {
    "total_tenants": 150,
    "active_tenants": 140,
    "total_channels": 450,
    "messages_today": 1234
  }
}
```

### List Tenants
```http
GET /admin/tenants?status=active&search=acme&per_page=15
Authorization: Bearer {admin_token}
```

**Query Parameters:**
- `status`: active, restricted, suspended (optional)
- `search`: search name, email, slug (optional)
- `per_page`: pagination (default: 15)
- `sort_by`: created_at, name (default: created_at)
- `sort_order`: asc, desc (default: desc)

### Get Tenant Details
```http
GET /admin/tenants/1
Authorization: Bearer {admin_token}
```

**Response:**
```json
{
  "id": 1,
  "name": "Acme Inc",
  "email": "john@example.com",
  "status": "active",
  "users": [...],
  "channels": [...],
  "subscriptions": [...],
  "usage_records": [...]
}
```

### Update Tenant Status
```http
PATCH /admin/tenants/1/status
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "status": "suspended",
  "reason": "Payment overdue"
}
```

### Get Usage Statistics
```http
GET /admin/usage?start_date=2025-10-01&end_date=2025-10-31
Authorization: Bearer {admin_token}
```

### Get System Settings
```http
GET /admin/settings
Authorization: Bearer {admin_token}
```

### Update System Settings
```http
PATCH /admin/settings
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "settings": {
    "META_APP_ID": "your_app_id",
    "META_APP_SECRET": "your_app_secret",
    "META_VERIFY_TOKEN": "your_verify_token"
  }
}
```

---

## Webhook Endpoints

### Meta Webhook Verification (GET)
```http
GET /webhooks/meta?hub.mode=subscribe&hub.verify_token=YOUR_TOKEN&hub.challenge=CHALLENGE
```

### Meta Webhook Handler (POST)
```http
POST /webhooks/meta
X-Hub-Signature-256: sha256=...
Content-Type: application/json

{
  "object": "page",
  "entry": [...]
}
```

### WhatsApp Webhook Verification (GET)
```http
GET /webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=YOUR_TOKEN&hub.challenge=CHALLENGE
```

### WhatsApp Webhook Handler (POST)
```http
POST /webhooks/whatsapp
X-Hub-Signature-256: sha256=...
Content-Type: application/json

{
  "object": "whatsapp_business_account",
  "entry": [...]
}
```

### Stripe Webhook Handler
```http
POST /webhooks/stripe
Stripe-Signature: t=...
Content-Type: application/json

{
  "id": "evt_...",
  "type": "customer.subscription.updated",
  "data": { ... }
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "OAuth authorization failed",
  "message": "User denied access"
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthenticated"
}
```

### 403 Forbidden
```json
{
  "error": "Forbidden",
  "message": "You do not have permission to perform this action."
}
```

### 422 Validation Error
```json
{
  "errors": {
    "email": ["The email field is required."],
    "password": ["The password must be at least 8 characters."]
  }
}
```

### 429 Rate Limit
```json
{
  "error": "Too Many Requests",
  "message": "Rate limit exceeded. Please try again later."
}
```

### 500 Internal Server Error
```json
{
  "error": "Failed to process request",
  "message": "An unexpected error occurred"
}
```

---

## Rate Limits

- **Messages**: 60 per minute per tenant
- **General API**: 100 requests per minute per IP
- **Admin API**: 200 requests per minute per IP

---

## Pagination

Paginated responses follow this structure:

```json
{
  "data": [...],
  "current_page": 1,
  "first_page_url": "http://localhost:8000/api/tenants?page=1",
  "from": 1,
  "last_page": 5,
  "last_page_url": "http://localhost:8000/api/tenants?page=5",
  "next_page_url": "http://localhost:8000/api/tenants?page=2",
  "path": "http://localhost:8000/api/tenants",
  "per_page": 15,
  "prev_page_url": null,
  "to": 15,
  "total": 75
}
```

---

## Testing with cURL

### Register and Login
```bash
# Register
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "password_confirmation": "password123",
    "company_name": "Acme Inc"
  }'

# Save the token
export TOKEN="eyJ0eXAiOiJKV1QiLCJhbGc..."

# Use the token
curl http://localhost:8000/api/tenant/me \
  -H "Authorization: Bearer $TOKEN"
```

---

For more details, see the full `README.md` documentation.

