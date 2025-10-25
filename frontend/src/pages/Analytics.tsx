import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { TrendingUp, Users, Eye, Heart, MessageCircle } from 'lucide-react'
import { formatNumber } from '@/lib/utils'

export default function Analytics() {
  const [channelId, setChannelId] = useState<string>('all')
  const [period, setPeriod] = useState<string>('7d')

  const { data: channels } = useQuery({
    queryKey: ['channels'],
    queryFn: async () => {
      const response = await api.get('/tenant/channels')
      return response.data
    },
  })

  const { data: summary } = useQuery({
    queryKey: ['insights', 'summary', channelId, period],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (channelId !== 'all') params.append('channel_id', channelId)
      params.append('period', period)
      const response = await api.get(`/tenant/insights/summary?${params}`)
      return response.data
    },
  })

  const { data: insights } = useQuery({
    queryKey: ['insights', channelId, period],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (channelId !== 'all') params.append('channel_id', channelId)
      params.append('period', period)
      const response = await api.get(`/tenant/insights?${params}`)
      return response.data
    },
  })

  const { data: topPosts } = useQuery({
    queryKey: ['insights', 'top-posts', channelId, period],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (channelId !== 'all') params.append('channel_id', channelId)
      params.append('period', period)
      const response = await api.get(`/tenant/insights/top-posts?${params}`)
      return response.data
    },
  })

  const kpiData = [
    {
      title: 'Followers',
      value: summary?.followers || 0,
      change: summary?.followers_growth || 0,
      icon: Users,
    },
    {
      title: 'Reach',
      value: summary?.reach || 0,
      change: summary?.reach_growth || 0,
      icon: Eye,
    },
    {
      title: 'Engagement',
      value: summary?.engagement || 0,
      change: summary?.engagement_growth || 0,
      icon: Heart,
    },
    {
      title: 'Comments',
      value: summary?.comments || 0,
      change: summary?.comments_growth || 0,
      icon: MessageCircle,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">Track your social media performance</p>
        </div>
        <div className="flex gap-2">
          <Select value={channelId} onValueChange={setChannelId}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Channels" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Channels</SelectItem>
              {channels?.map((channel: any) => (
                <SelectItem key={channel.id} value={channel.id.toString()}>
                  {channel.type.toUpperCase()} - {channel.identifiers?.page_name || channel.identifiers?.username}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiData.map((kpi) => {
          const Icon = kpi.icon
          const isPositive = kpi.change >= 0
          return (
            <Card key={kpi.title} className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">{kpi.title}</p>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex items-baseline gap-2">
                <h3 className="text-2xl font-bold">{formatNumber(kpi.value)}</h3>
                <span className={`text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {isPositive ? '+' : ''}{kpi.change}%
                </span>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Followers Growth */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Followers Growth
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={insights?.followers_timeline || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="count" stroke="#8884d8" name="Followers" />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Engagement by Type */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Engagement by Type</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={insights?.engagement_by_type || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="type" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#82ca9d" name="Engagement" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Top Posts */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Top Performing Posts</h3>
        <div className="space-y-4">
          {topPosts?.data?.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No posts data available</p>
          ) : (
            topPosts?.data?.map((post: any) => (
              <div key={post.id} className="flex items-center gap-4 p-4 border rounded-lg">
                <div className="flex-1">
                  <p className="font-medium line-clamp-2">{post.caption}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(post.published_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-4 text-sm">
                  <div className="text-center">
                    <p className="font-semibold">{formatNumber(post.likes || 0)}</p>
                    <p className="text-muted-foreground">Likes</p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold">{formatNumber(post.comments || 0)}</p>
                    <p className="text-muted-foreground">Comments</p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold">{formatNumber(post.reach || 0)}</p>
                    <p className="text-muted-foreground">Reach</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  )
}
