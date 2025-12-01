import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MessageSquare, Users, Plug, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import api from '@/lib/api'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { isDemoMode, demoDashboardStats } from '@/lib/demoData'
import { motion } from 'framer-motion'

export default function Dashboard() {
  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      if (isDemoMode()) {
        return demoDashboardStats
      }
      const response = await api.get('/tenant/dashboard/stats')
      return response.data
    },
    enabled: !isDemoMode(),
  })

  const displayStats = isDemoMode() ? demoDashboardStats : stats

  const statsCards = [
    {
      title: 'Messages Today',
      value: displayStats?.messages_today || 0,
      icon: MessageSquare,
      change: '+12%',
      trend: 'up',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950',
    },
    {
      title: 'Active Conversations',
      value: displayStats?.active_conversations || 0,
      icon: Users,
      change: '+4%',
      trend: 'up',
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-950',
    },
    {
      title: 'Connected Channels',
      value: displayStats?.connected_channels || 0,
      icon: Plug,
      change: '0%',
      trend: 'neutral',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-950',
    },
    {
      title: 'Avg Response Time',
      value: displayStats?.avg_response_time || '2m',
      icon: TrendingUp,
      change: '-8%',
      trend: 'down',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-950',
    },
  ]

  const chartData = displayStats?.messages_chart || [
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Welcome back! Here's what's happening today.
          </p>
        </div>
        {isDemoMode() && (
          <div className="px-4 py-2 rounded-full bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700">
            <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-200">
              🎭 Demo Mode
            </p>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
              <div className={`${stat.bgColor} p-1`}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 pt-4">
                  <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2 rounded-lg ${stat.bgColor} group-hover:scale-110 transition-transform`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="flex items-baseline justify-between">
                    <div className="text-3xl font-bold tracking-tight">{stat.value}</div>
                    <div className={`flex items-center gap-1 text-xs font-semibold ${
                      stat.trend === 'up' ? 'text-green-600' :
                      stat.trend === 'down' ? 'text-red-600' :
                      'text-muted-foreground'
                    }`}>
                      {stat.trend === 'up' && <ArrowUpRight className="h-3 w-3" />}
                      {stat.trend === 'down' && <ArrowDownRight className="h-3 w-3" />}
                      {stat.change}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    from last week
                  </p>
                </CardContent>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold">Messages Overview</CardTitle>
                <CardDescription className="text-base mt-1">
                  Message volume over the past 7 days
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorMessages" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="name" 
                  className="text-sm"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis 
                  className="text-sm"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="messages"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorMessages)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

