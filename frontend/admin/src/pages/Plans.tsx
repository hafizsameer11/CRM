import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axiosInstance from '@/lib/axios'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { Plus, Edit, Trash2, Check } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface Plan {
  id: number
  name: string
  slug: string
  monthly_price: number
  limits: {
    channels: number
    users: number
    messages_per_month: number
    posting_limits?: number
  }
}

export default function Plans() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    monthly_price: '',
    channels: '',
    users: '',
    messages_per_month: '',
    posting_limits: '',
  })

  const { data: plans, isLoading } = useQuery({
    queryKey: ['admin-plans'],
    queryFn: async () => {
      const response = await axiosInstance.get('/plans')
      return response.data
    },
  })

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      if (selectedPlan) {
        return await axiosInstance.patch(`/plans/${selectedPlan.id}`, data)
      }
      return await axiosInstance.post('/plans', data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-plans'] })
      toast({
        title: selectedPlan ? 'Plan updated' : 'Plan created',
        description: 'Changes saved successfully',
      })
      handleClose()
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to save plan',
        variant: 'destructive',
      })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return await axiosInstance.delete(`/plans/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-plans'] })
      toast({
        title: 'Plan deleted',
        description: 'Plan has been removed',
      })
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to delete plan',
        variant: 'destructive',
      })
    },
  })

  const handleEdit = (plan: Plan) => {
    setSelectedPlan(plan)
    setFormData({
      name: plan.name,
      slug: plan.slug,
      monthly_price: plan.monthly_price.toString(),
      channels: plan.limits.channels.toString(),
      users: plan.limits.users.toString(),
      messages_per_month: plan.limits.messages_per_month.toString(),
      posting_limits: (plan.limits.posting_limits || 0).toString(),
    })
    setDialogOpen(true)
  }

  const handleNew = () => {
    setSelectedPlan(null)
    setFormData({
      name: '',
      slug: '',
      monthly_price: '',
      channels: '',
      users: '',
      messages_per_month: '',
      posting_limits: '',
    })
    setDialogOpen(true)
  }

  const handleClose = () => {
    setDialogOpen(false)
    setSelectedPlan(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    saveMutation.mutate({
      name: formData.name,
      slug: formData.slug,
      monthly_price: parseFloat(formData.monthly_price),
      limits: {
        channels: parseInt(formData.channels),
        users: parseInt(formData.users),
        messages_per_month: parseInt(formData.messages_per_month),
        posting_limits: parseInt(formData.posting_limits) || 0,
      },
    })
  }

  const handleDelete = (plan: Plan) => {
    if (confirm(`Delete plan "${plan.name}"? This cannot be undone.`)) {
      deleteMutation.mutate(plan.id)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Plans Management</h1>
          <p className="text-muted-foreground">
            Manage subscription plans and limits
          </p>
        </div>
        <Button onClick={handleNew}>
          <Plus className="w-4 h-4 mr-2" />
          New Plan
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-12">Loading plans...</div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {plans?.map((plan: Plan) => (
            <Card key={plan.id} className="relative">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{plan.name}</CardTitle>
                  <Badge variant="outline">{plan.slug}</Badge>
                </div>
                <div className="text-3xl font-bold">
                  ${plan.monthly_price}
                  <span className="text-sm text-muted-foreground font-normal">/mo</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-600" />
                    <span>{plan.limits.channels} Channels</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-600" />
                    <span>{plan.limits.users} Users</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-600" />
                    <span>{plan.limits.messages_per_month.toLocaleString()} Messages/mo</span>
                  </div>
                  {plan.limits.posting_limits && (
                    <div className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-600" />
                      <span>{plan.limits.posting_limits} Posts/mo</span>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleEdit(plan)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(plan)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit/Create Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedPlan ? 'Edit Plan' : 'Create New Plan'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Plan Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Monthly Price ($)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.monthly_price}
                  onChange={(e) => setFormData({ ...formData, monthly_price: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="channels">Max Channels</Label>
                <Input
                  id="channels"
                  type="number"
                  value={formData.channels}
                  onChange={(e) => setFormData({ ...formData, channels: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="users">Max Users</Label>
                <Input
                  id="users"
                  type="number"
                  value={formData.users}
                  onChange={(e) => setFormData({ ...formData, users: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="messages">Messages Per Month</Label>
                <Input
                  id="messages"
                  type="number"
                  value={formData.messages_per_month}
                  onChange={(e) => setFormData({ ...formData, messages_per_month: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="posts">Posts Per Month (0 = unlimited)</Label>
                <Input
                  id="posts"
                  type="number"
                  value={formData.posting_limits}
                  onChange={(e) => setFormData({ ...formData, posting_limits: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? 'Saving...' : 'Save Plan'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}



