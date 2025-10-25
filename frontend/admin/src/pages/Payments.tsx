import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import axiosInstance from '@/lib/axios'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import DataTable from '@/components/DataTable'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import { ExternalLink } from 'lucide-react'

interface Payment {
  id: string
  tenant_name: string
  amount: number
  status: string
  invoice_url?: string
  created_at: string
  description?: string
}

export default function Payments() {
  const [currentPage, setCurrentPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-payments', currentPage],
    queryFn: async () => {
      // Mock data - replace with actual API call when backend endpoint is ready
      return {
        data: [
          {
            id: 'inv_001',
            tenant_name: 'Acme Corp',
            amount: 9900,
            status: 'paid',
            invoice_url: 'https://stripe.com/invoice/001',
            created_at: new Date().toISOString(),
            description: 'Growth Plan - Monthly',
          },
          {
            id: 'inv_002',
            tenant_name: 'Tech Startup',
            amount: 2900,
            status: 'paid',
            invoice_url: 'https://stripe.com/invoice/002',
            created_at: new Date().toISOString(),
            description: 'Starter Plan - Monthly',
          },
          {
            id: 'inv_003',
            tenant_name: 'Enterprise Inc',
            amount: 19900,
            status: 'pending',
            created_at: new Date().toISOString(),
            description: 'Pro Plan - Monthly',
          },
        ],
        total: 3,
        per_page: 10,
        current_page: 1,
        last_page: 1,
      }
    },
  })

  const columns = [
    {
      key: 'id',
      label: 'Invoice ID',
      render: (value: string) => (
        <span className="font-mono text-sm">{value}</span>
      ),
    },
    { key: 'tenant_name', label: 'Tenant' },
    {
      key: 'description',
      label: 'Description',
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (value: number) => formatCurrency(value / 100),
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => {
        const variant =
          value === 'paid'
            ? 'success'
            : value === 'pending'
            ? 'warning'
            : 'destructive'
        return (
          <Badge variant={variant as any}>
            {value.charAt(0).toUpperCase() + value.slice(1)}
          </Badge>
        )
      },
    },
    {
      key: 'created_at',
      label: 'Date',
      render: (value: string) => formatDateTime(value),
    },
    {
      key: 'invoice_url',
      label: 'Invoice',
      render: (value: string) =>
        value ? (
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-primary hover:underline"
          >
            View <ExternalLink className="w-3 h-3" />
          </a>
        ) : (
          '-'
        ),
    },
  ]

  // Calculate totals
  const totalRevenue = data?.data?.reduce(
    (sum: number, payment: Payment) => sum + payment.amount,
    0
  ) || 0

  const paidRevenue = data?.data
    ?.filter((p: Payment) => p.status === 'paid')
    .reduce((sum: number, payment: Payment) => sum + payment.amount, 0) || 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Payments</h1>
        <p className="text-muted-foreground">Stripe payments and invoices</p>
      </div>

      {/* Revenue Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalRevenue / 100)}
            </div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Paid Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(paidRevenue / 100)}
            </div>
            <p className="text-xs text-muted-foreground">Successfully collected</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">
              Pending Payments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data?.data?.filter((p: Payment) => p.status === 'pending').length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Awaiting payment</p>
          </CardContent>
        </Card>
      </div>

      {/* Payments Table */}
      {!isLoading && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              data={data?.data || []}
              columns={columns}
              pagination={{
                currentPage,
                totalPages: data?.last_page || 1,
                onPageChange: setCurrentPage,
              }}
            />
          </CardContent>
        </Card>
      )}
    </div>
  )
}


