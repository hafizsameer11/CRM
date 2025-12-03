import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check } from 'lucide-react'
import api from '@/lib/api'
import { formatCurrency, formatDate } from '@/lib/utils'

export default function Billing() {
  const { data: subscription } = useQuery({
    queryKey: ['subscription'],
    queryFn: async () => {
      const response = await api.get('/tenant/billing/subscription')
      return response.data
    },
  })

  const { data: plans } = useQuery({
    queryKey: ['plans'],
    queryFn: async () => {
      const response = await api.get('/tenant/billing/plans')
      return response.data || []
    },
  })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Billing</h1>
        <p className="text-muted-foreground">Manage your subscription and billing</p>
      </div>

      {/* Current Plan */}
      {subscription && (
        <Card>
          <CardHeader>
            <CardTitle>Current Plan</CardTitle>
            <CardDescription>You are currently on the {subscription.plan?.name} plan</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">
                  {formatCurrency(subscription.plan?.monthly_price)}
                  <span className="text-sm text-muted-foreground">/month</span>
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Renews on {formatDate(subscription.current_period_end)}
                </p>
              </div>
              <Badge variant={subscription.status === 'active' ? 'default' : 'destructive'}>
                {subscription.status}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Plans */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Available Plans</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {(plans || []).map((plan: any) => (
            <Card key={plan.id} className={plan.id === subscription?.plan_id ? 'border-primary' : ''}>
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>
                  <span className="text-3xl font-bold">
                    {formatCurrency(plan.monthly_price)}
                  </span>
                  <span className="text-muted-foreground">/month</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span className="text-sm">
                      {plan.limits?.max_channels === -1 ? 'Unlimited' : plan.limits?.max_channels} channels
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span className="text-sm">
                      {plan.limits?.max_users === -1 ? 'Unlimited' : plan.limits?.max_users} users
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span className="text-sm">
                      {plan.limits?.max_messages_per_month === -1 ? 'Unlimited' : `${plan.limits?.max_messages_per_month} messages/mo`}
                    </span>
                  </li>
                </ul>

                <Button
                  className="w-full"
                  variant={plan.id === subscription?.plan_id ? 'outline' : 'default'}
                  disabled={plan.id === subscription?.plan_id}
                >
                  {plan.id === subscription?.plan_id ? 'Current Plan' : 'Upgrade'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

