import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import axiosInstance from '@/lib/axios'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import DataTable from '@/components/DataTable'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { formatNumber } from '@/lib/utils'

export default function Usage() {
  const [currentPage, setCurrentPage] = useState(1)

  const { data: usageData, isLoading } = useQuery({
    queryKey: ['admin-usage', currentPage],
    queryFn: async () => {
      const response = await axiosInstance.get(`/usage?page=${currentPage}`)
      return response.data
    },
  })

  // Transform data for chart
  const chartData = usageData?.tenants?.slice(0, 10).map((item: any) => ({
    name: item.tenant_name,
    messages: item.total_messages,
  })) || []

  const columns = [
    { key: 'tenant_name', label: 'Tenant' },
    {
      key: 'total_messages',
      label: 'Total Messages',
      render: (value: number) => formatNumber(value),
    },
    {
      key: 'monthly_messages',
      label: 'This Month',
      render: (value: number) => formatNumber(value),
    },
    {
      key: 'facebook_messages',
      label: 'Facebook',
      render: (value: number) => formatNumber(value || 0),
    },
    {
      key: 'instagram_messages',
      label: 'Instagram',
      render: (value: number) => formatNumber(value || 0),
    },
    {
      key: 'whatsapp_messages',
      label: 'WhatsApp',
      render: (value: number) => formatNumber(value || 0),
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Usage Analytics</h1>
        <p className="text-muted-foreground">
          Message usage across all tenants
        </p>
      </div>

      {/* Total Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">
              Total Messages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(usageData?.total_messages || 0)}
            </div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">
              This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(usageData?.monthly_messages || 0)}
            </div>
            <p className="text-xs text-muted-foreground">Current billing period</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">
              Active Channels
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {usageData?.active_channels || 0}
            </div>
            <p className="text-xs text-muted-foreground">Across all tenants</p>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Top 10 Tenants by Message Volume</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="messages" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Detailed Table */}
      {!isLoading && usageData?.tenants && (
        <Card>
          <CardHeader>
            <CardTitle>Usage by Tenant</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              data={usageData.tenants}
              columns={columns}
              pagination={{
                currentPage,
                totalPages: usageData.last_page || 1,
                onPageChange: setCurrentPage,
              }}
            />
          </CardContent>
        </Card>
      )}
    </div>
  )
}



