// Demo data for MODE='demo'
export const isDemoMode = () => {
  return import.meta.env.VITE_MODE === 'demo'
}

// Dashboard Stats
export const demoDashboardStats = {
  messages_today: 47,
  active_conversations: 12,
  connected_channels: 3,
  avg_response_time: '2m 15s',
  messages_chart: [
    { name: 'Mon', messages: 24 },
    { name: 'Tue', messages: 32 },
    { name: 'Wed', messages: 28 },
    { name: 'Thu', messages: 45 },
    { name: 'Fri', messages: 38 },
    { name: 'Sat', messages: 22 },
    { name: 'Sun', messages: 18 },
  ],
}

// Channels
export const demoChannels = [
  {
    id: 1,
    type: 'facebook',
    status: 'active',
    identifiers: {
      page_id: '123456789',
      page_name: 'Acme Corporation',
    },
    created_at: '2024-01-15T10:00:00Z',
  },
  {
    id: 2,
    type: 'instagram',
    status: 'active',
    identifiers: {
      instagram_account_id: '987654321',
      username: 'acme_corp',
    },
    created_at: '2024-01-16T14:30:00Z',
  },
  {
    id: 3,
    type: 'whatsapp',
    status: 'active',
    identifiers: {
      phone_number_id: '1122334455',
      phone_number: '+1234567890',
    },
    created_at: '2024-01-17T09:15:00Z',
  },
]

// Conversations
export const demoConversations = [
  {
    id: 1,
    channel_id: 1,
    channel_type: 'facebook',
    customer_name: 'John Smith',
    customer_id: 'fb_123',
    last_message: 'Thank you for your help!',
    last_message_at: '2024-01-20T15:30:00Z',
    unread_count: 2,
    status: 'open',
    assigned_to: null,
  },
  {
    id: 2,
    channel_id: 2,
    channel_type: 'instagram',
    customer_name: 'Sarah Johnson',
    customer_id: 'ig_456',
    last_message: 'When will my order ship?',
    last_message_at: '2024-01-20T14:20:00Z',
    unread_count: 0,
    status: 'open',
    assigned_to: null,
  },
  {
    id: 3,
    channel_id: 3,
    channel_type: 'whatsapp',
    customer_name: 'Mike Davis',
    customer_id: 'wa_789',
    last_message: 'I need to update my address',
    last_message_at: '2024-01-20T13:10:00Z',
    unread_count: 1,
    status: 'open',
    assigned_to: null,
  },
]

// Messages
export const demoMessages = [
  {
    id: 1,
    conversation_id: 1,
    sender_id: 'fb_123',
    sender_name: 'John Smith',
    text: 'Hello, I have a question about my order',
    direction: 'inbound',
    created_at: '2024-01-20T15:00:00Z',
  },
  {
    id: 2,
    conversation_id: 1,
    sender_id: 'system',
    sender_name: 'You',
    text: 'Hi John! I\'d be happy to help. What\'s your order number?',
    direction: 'outbound',
    created_at: '2024-01-20T15:05:00Z',
  },
  {
    id: 3,
    conversation_id: 1,
    sender_id: 'fb_123',
    sender_name: 'John Smith',
    text: 'Thank you for your help!',
    direction: 'inbound',
    created_at: '2024-01-20T15:30:00Z',
  },
]

// Posts
export const demoPosts = [
  {
    id: 1,
    caption: 'Excited to announce our new product launch! 🚀',
    media: [1, 2],
    status: 'published',
    scheduled_for: null,
    published_at: '2024-01-18T10:00:00Z',
    channel: {
      id: 1,
      type: 'facebook',
      identifiers: { page_name: 'Acme Corporation' },
    },
    likes_count: 234,
    comments_count: 18,
    shares_count: 12,
    reach: 1250,
  },
  {
    id: 2,
    caption: 'Behind the scenes at our office!',
    media: [3],
    status: 'scheduled',
    scheduled_for: '2024-01-22T14:00:00Z',
    published_at: null,
    channel: {
      id: 2,
      type: 'instagram',
      identifiers: { username: 'acme_corp' },
    },
    likes_count: 0,
    comments_count: 0,
    shares_count: 0,
  },
  {
    id: 3,
    caption: 'Check out our latest blog post...',
    media: [],
    status: 'draft',
    scheduled_for: null,
    published_at: null,
    channel: {
      id: 1,
      type: 'facebook',
      identifiers: { page_name: 'Acme Corporation' },
    },
    likes_count: 0,
    comments_count: 0,
    shares_count: 0,
  },
]

// Media
export const demoMedia = [
  {
    id: 1,
    original_name: 'product-launch.jpg',
    mime_type: 'image/jpeg',
    size: 245678,
    url: 'https://images.unsplash.com/photo-1556740758-90de374c12ad?w=800',
    type: 'image',
    created_at: '2024-01-18T09:00:00Z',
  },
  {
    id: 2,
    original_name: 'office-tour.jpg',
    mime_type: 'image/jpeg',
    size: 312456,
    url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
    type: 'image',
    created_at: '2024-01-19T11:00:00Z',
  },
  {
    id: 3,
    original_name: 'team-video.mp4',
    mime_type: 'video/mp4',
    size: 2456789,
    url: 'https://example.com/video.mp4',
    type: 'video',
    created_at: '2024-01-20T10:00:00Z',
  },
]

// Analytics/Insights
export const demoInsights = [
  {
    id: 1,
    metric: 'followers',
    value: 12500,
    collected_at: '2024-01-20T00:00:00Z',
  },
  {
    id: 2,
    metric: 'reach',
    value: 8500,
    collected_at: '2024-01-20T00:00:00Z',
  },
  {
    id: 3,
    metric: 'engagement',
    value: 1250,
    collected_at: '2024-01-20T00:00:00Z',
  },
]

export const demoInsightsSummary = {
  followers: { current: 12500, previous: 11800, growth: 5.93 },
  reach: { current: 8500, previous: 7200, growth: 18.06 },
  engagement: { current: 1250, previous: 1100, growth: 13.64 },
  comments: { current: 45, previous: 38, growth: 18.42 },
}

export const demoTopPosts = [
  {
    id: 1,
    caption: 'Excited to announce our new product launch! 🚀',
    channel_type: 'facebook',
    likes_count: 234,
    comments_count: 18,
    media_url: 'https://images.unsplash.com/photo-1556740758-90de374c12ad?w=200',
  },
  {
    id: 2,
    caption: 'Thank you to all our customers!',
    channel_type: 'instagram',
    likes_count: 189,
    comments_count: 12,
    media_url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=200',
  },
]

// Comments
export const demoComments = [
  {
    id: 1,
    channel_id: 1,
    post_id: 1,
    provider_comment_id: 'cmt_123',
    text: 'This looks amazing! When can I order?',
    author_name: 'Jane Doe',
    author_id: 'user_123',
    status: 'visible',
    created_at: '2024-01-18T11:00:00Z',
    channel: {
      type: 'facebook',
      identifiers: { page_name: 'Acme Corporation' },
    },
    post: {
      caption: 'Excited to announce our new product launch! 🚀',
    },
  },
  {
    id: 2,
    channel_id: 2,
    post_id: 2,
    provider_comment_id: 'cmt_456',
    text: 'Love this! ❤️',
    author_name: 'Bob Wilson',
    author_id: 'user_456',
    status: 'visible',
    created_at: '2024-01-19T15:30:00Z',
    channel: {
      type: 'instagram',
      identifiers: { username: 'acme_corp' },
    },
    post: {
      caption: 'Behind the scenes at our office!',
    },
  },
]

// Plans
export const demoPlans = [
  {
    id: 1,
    name: 'Starter',
    slug: 'starter',
    monthly_price: 29,
    limits: {
      channels: 3,
      users: 2,
      messages_per_month: 1000,
      posting_limits: 30,
    },
  },
  {
    id: 2,
    name: 'Growth',
    slug: 'growth',
    monthly_price: 99,
    limits: {
      channels: 10,
      users: 5,
      messages_per_month: 10000,
      posting_limits: 100,
    },
  },
  {
    id: 3,
    name: 'Pro',
    slug: 'pro',
    monthly_price: 299,
    limits: {
      channels: -1,
      users: -1,
      messages_per_month: -1,
      posting_limits: -1,
    },
  },
]

// Subscription
export const demoSubscription = {
  id: 1,
  plan_id: 2,
  status: 'active',
  current_period_start: '2024-01-01T00:00:00Z',
  current_period_end: '2024-02-01T00:00:00Z',
  plan: demoPlans[1],
}

// Users
export const demoUsers = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    role: 'owner',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'manager',
    created_at: '2024-01-05T00:00:00Z',
  },
]

