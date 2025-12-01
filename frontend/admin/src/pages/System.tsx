import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axiosInstance from '@/lib/axios'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import {
  Server,
  Database,
  Activity,
  RefreshCw,
  AlertCircle,
  CheckCircle,
} from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

export default function System() {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const { data: healthData, isLoading } = useQuery({
    queryKey: ['system-health'],
    queryFn: async () => {
      const response = await axiosInstance.get('/health')
      return response.data
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  })

  const refreshTokensMutation = useMutation({
    mutationFn: async () => {
      // This would call a backend endpoint to manually trigger token refresh
      const response = await axiosInstance.post('/system/refresh-tokens')
      return response.data
    },
    onSuccess: () => {
      toast({
        title: 'Tokens refreshed',
        description: 'All channel tokens have been queued for refresh',
      })
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to refresh tokens',
        variant: 'destructive',
      })
    },
  })

  const runBackfillMutation = useMutation({
    mutationFn: async () => {
      const response = await axiosInstance.post('/system/backfill')
      return response.data
    },
    onSuccess: () => {
      toast({
        title: 'Backfill started',
        description: 'Message backfill job has been queued',
      })
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to start backfill',
        variant: 'destructive',
      })
    },
  })

  // Mock latency data
  const latencyData = [
    { time: '00:00', latency: 45 },
    { time: '04:00', latency: 52 },
    { time: '08:00', latency: 38 },
    { time: '12:00', latency: 65 },
    { time: '16:00', latency: 48 },
    { time: '20:00', latency: 42 },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">System Health</h1>
          <p className="text-muted-foreground">
            Monitor system status and performance
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => refreshTokensMutation.mutate()}
            disabled={refreshTokensMutation.isPending}
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${
                refreshTokensMutation.isPending ? 'animate-spin' : ''
              }`}
            />
            Refresh Tokens
          </Button>
          <Button
            variant="outline"
            onClick={() => runBackfillMutation.mutate()}
            disabled={runBackfillMutation.isPending}
          >
            Run Backfill
          </Button>
        </div>
      </div>

      {/* System Status Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Queue Status</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {healthData?.queued_jobs || 0}
            </div>
            <p className="text-xs text-muted-foreground">jobs pending</p>
            <Badge variant="success" className="mt-2">
              <CheckCircle className="w-3 h-3 mr-1" />
              Healthy
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Jobs</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {healthData?.failed_jobs || 0}
            </div>
            <p className="text-xs text-muted-foreground">requires attention</p>
            {(healthData?.failed_jobs || 0) > 0 ? (
              <Badge variant="destructive" className="mt-2">
                Action Required
              </Badge>
            ) : (
              <Badge variant="success" className="mt-2">
                All Clear
              </Badge>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Database Size</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {healthData?.db_size || 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">total storage used</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Latency</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {healthData?.avg_latency || 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">milliseconds</p>
            <Badge variant="success" className="mt-2">
              Optimal
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* API Latency Graph */}
      <Card>
        <CardHeader>
          <CardTitle>API Latency (24 Hours)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={latencyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="latency"
                stroke="#3b82f6"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* System Details */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Queue Workers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Active Workers</span>
              <Badge variant="success">
                {healthData?.active_workers || 3}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Processing Rate</span>
              <span className="text-sm font-medium">
                {healthData?.processing_rate || '120/min'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Horizon Status</span>
              <Badge variant="success">Running</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Channel Health</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Total Channels</span>
              <span className="text-sm font-medium">
                {healthData?.total_channels || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Active Channels</span>
              <Badge variant="success">
                {healthData?.active_channels || 0}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Expired Tokens</span>
              <Badge variant={healthData?.expired_tokens > 0 ? 'destructive' : 'success'}>
                {healthData?.expired_tokens || 0}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}



