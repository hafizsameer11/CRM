import { useQuery } from '@tanstack/react-query'
import axiosInstance from '@/lib/axios'
import StatCard from '@/components/StatCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Activity, DollarSign, AlertCircle, FileText, CheckCircle, Clock, XCircle } from 'lucide-react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

export default function Dashboard() {
  const { data: healthData } = useQuery({
    queryKey: ['admin-health'],
    queryFn: async () => {
      const response = await axiosInstance.get('/health')
      return response.data
    },
  })

  const { data: tenantsData } = useQuery({
    queryKey: ['admin-tenants-stats'],
    queryFn: async () => {
      const response = await axiosInstance.get('/tenants?per_page=1')
      return response.data
    },
  })

  const { data: usageData } = useQuery({
    queryKey: ['admin-usage-stats'],
    queryFn: async () => {
      const response = await axiosInstance.get('/usage')
      return response.data
    },
  })

  const { data: contentStats } = useQuery({
    queryKey: ['admin-content-stats'],
    queryFn: async () => {
      const response = await axiosInstance.get('/content-stats')
      return response.data
    },
  })

  // Mock data for charts
  const messagesData = [
    { month: 'Jan', messages: 4000 },
    { month: 'Feb', messages: 3000 },
    { month: 'Mar', messages: 5000 },
    { month: 'Apr', messages: 4500 },
    { month: 'May', messages: 6000 },
    { month: 'Jun', messages: 5500 },
  ]

  const revenueData = [
    { month: 'Jan', revenue: 2400 },
    { month: 'Feb', revenue: 1398 },
    { month: 'Mar', revenue: 9800 },
    { month: 'Apr', revenue: 3908 },
    { month: 'May', revenue: 4800 },
    { month: 'Jun', revenue: 3800 },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">System overview and analytics</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Tenants"
          value={tenantsData?.total || 0}
          icon={Users}
          description="All registered tenants"
          trend={{ value: 12.5, isPositive: true }}
        />
        <StatCard
          title="Active Tenants"
          value={tenantsData?.data?.filter((t: any) => t.status === 'active').length || 0}
          icon={Activity}
          description="Currently active"
          trend={{ value: 8.2, isPositive: true }}
        />
        <StatCard
          title="Messages (Monthly)"
          value={usageData?.total_messages || 0}
          icon={Activity}
          description="Messages processed"
          trend={{ value: 23.1, isPositive: true }}
        />
        <StatCard
          title="Failed Jobs"
          value={healthData?.failed_jobs || 0}
          icon={AlertCircle}
          description="Requires attention"
          trend={{ value: -5.4, isPositive: false }}
        />
      </div>

      {/* Content Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Content Publishing Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Clock className="h-6 w-6 text-blue-600 dark:text-blue-300" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Scheduled Posts</p>
                <p className="text-2xl font-bold">{contentStats?.scheduled || 0}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-300" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Published</p>
                <p className="text-2xl font-bold">{contentStats?.published || 0}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-100 dark:bg-red-900 rounded-lg">
                <XCircle className="h-6 w-6 text-red-600 dark:text-red-300" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Failed Posts</p>
                <p className="text-2xl font-bold">{contentStats?.failed || 0}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <FileText className="h-6 w-6 text-gray-600 dark:text-gray-300" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Posts</p>
                <p className="text-2xl font-bold">{contentStats?.total || 0}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Messages Per Month</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={messagesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="messages"
                  stroke="#3b82f6"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="revenue" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* System Health */}
      {healthData && (
        <Card>
          <CardHeader>
            <CardTitle>System Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Queue Status
                </p>
                <p className="text-2xl font-bold">
                  {healthData.queued_jobs || 0}
                </p>
                <p className="text-xs text-muted-foreground">jobs pending</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Database Size
                </p>
                <p className="text-2xl font-bold">
                  {healthData.db_size || 'N/A'}
                </p>
                <p className="text-xs text-muted-foreground">total size</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Average Latency
                </p>
                <p className="text-2xl font-bold">
                  {healthData.avg_latency || 'N/A'}
                </p>
                <p className="text-xs text-muted-foreground">milliseconds</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

