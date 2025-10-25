import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MessageSquare, Users, Plug, TrendingUp } from 'lucide-react'
import api from '@/lib/api'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function Dashboard() {
  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const response = await api.get('/tenant/dashboard/stats')
      return response.data
    },
  })

  const statsCards = [
    {
      title: 'Messages Today',
      value: stats?.messages_today || 0,
      icon: MessageSquare,
      change: '+12%',
    },
    {
      title: 'Active Conversations',
      value: stats?.active_conversations || 0,
      icon: Users,
      change: '+4%',
    },
    {
      title: 'Connected Channels',
      value: stats?.connected_channels || 0,
      icon: Plug,
      change: '0%',
    },
    {
      title: 'Response Time',
      value: stats?.avg_response_time || '2m',
      icon: TrendingUp,
      change: '-8%',
    },
  ]

  const chartData = stats?.messages_chart || [
    { name: 'Mon', messages: 24 },
    { name: 'Tue', messages: 32 },
    { name: 'Wed', messages: 28 },
    { name: 'Thu', messages: 45 },
    { name: 'Fri', messages: 38 },
    { name: 'Sat', messages: 22 },
    { name: 'Sun', messages: 18 },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's what's happening today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.change} from last week
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Messages Overview</CardTitle>
          <CardDescription>Message volume over the past 7 days</CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorMessages" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="name" className="text-sm" />
              <YAxis className="text-sm" />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="messages"
                stroke="hsl(var(--primary))"
                fillOpacity={1}
                fill="url(#colorMessages)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}

