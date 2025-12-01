import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axiosInstance from '@/lib/axios'
import DataTable from '@/components/DataTable'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { formatDate } from '@/lib/utils'
import { Eye, Trash, Ban, CheckCircle } from 'lucide-react'

interface Tenant {
  id: number
  name: string
  email: string
  plan: string
  status: string
  created_at: string
  users_count?: number
  channels_count?: number
}

export default function Tenants() {
  const [currentPage, setCurrentPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['tenants', currentPage, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        per_page: '10',
      })
      if (statusFilter !== 'all') {
        params.append('status', statusFilter)
      }
      const response = await axiosInstance.get(`/tenants?${params}`)
      return response.data
    },
  })

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      await axiosInstance.patch(`/tenants/${id}/status`, { status })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] })
      toast({
        title: 'Status updated',
        description: 'Tenant status has been updated successfully',
      })
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update tenant status',
        variant: 'destructive',
      })
    },
  })

  const deleteTenantMutation = useMutation({
    mutationFn: async (id: number) => {
      await axiosInstance.delete(`/tenants/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] })
      toast({
        title: 'Tenant deleted',
        description: 'Tenant has been deleted successfully',
      })
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to delete tenant',
        variant: 'destructive',
      })
    },
  })

  const viewDetails = async (tenant: Tenant) => {
    const response = await axiosInstance.get(`/tenants/${tenant.id}`)
    setSelectedTenant(response.data)
    setDetailModalOpen(true)
  }

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    {
      key: 'plan',
      label: 'Plan',
      render: (value: string) => (
        <Badge variant="outline">{value || 'Free'}</Badge>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => {
        const variant =
          value === 'active'
            ? 'success'
            : value === 'suspended'
            ? 'destructive'
            : 'warning'
        return <Badge variant={variant as any}>{value}</Badge>
      },
    },
    {
      key: 'created_at',
      label: 'Created',
      render: (value: string) => formatDate(value),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: any, row: Tenant) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => viewDetails(row)}
          >
            <Eye className="w-4 h-4" />
          </Button>
          {row.status === 'active' ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                updateStatusMutation.mutate({ id: row.id, status: 'suspended' })
              }
            >
              <Ban className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                updateStatusMutation.mutate({ id: row.id, status: 'active' })
              }
            >
              <CheckCircle className="w-4 h-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (confirm('Are you sure you want to delete this tenant?')) {
                deleteTenantMutation.mutate(row.id)
              }
            }}
          >
            <Trash className="w-4 h-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tenants</h1>
          <p className="text-muted-foreground">Manage all tenant accounts</p>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
            <SelectItem value="restricted">Restricted</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <DataTable
          data={data?.data || []}
          columns={columns}
          pagination={{
            currentPage,
            totalPages: data?.last_page || 1,
            onPageChange: setCurrentPage,
          }}
        />
      )}

      {/* Tenant Detail Modal */}
      <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedTenant?.name}</DialogTitle>
            <DialogDescription>{selectedTenant?.email}</DialogDescription>
          </DialogHeader>
          {selectedTenant && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Status
                  </p>
                  <Badge
                    variant={
                      selectedTenant.status === 'active' ? 'success' : 'destructive'
                    }
                  >
                    {selectedTenant.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Plan</p>
                  <p className="font-medium">{selectedTenant.plan || 'Free'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Users
                  </p>
                  <p className="font-medium">{selectedTenant.users_count || 0}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Channels
                  </p>
                  <p className="font-medium">
                    {selectedTenant.channels_count || 0}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Created At
                  </p>
                  <p className="font-medium">
                    {formatDate(selectedTenant.created_at)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}



