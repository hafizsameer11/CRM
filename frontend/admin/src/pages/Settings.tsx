import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axiosInstance from '@/lib/axios'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { Save, CheckCircle } from 'lucide-react'

interface Settings {
  META_APP_ID?: string
  META_APP_SECRET?: string
  META_VERIFY_TOKEN?: string
  WHATSAPP_PHONE_ID?: string
  WHATSAPP_BUSINESS_ID?: string
  STRIPE_KEY?: string
  STRIPE_SECRET?: string
  OPENAI_API_KEY?: string
  ANTHROPIC_API_KEY?: string
  MAX_MEDIA_FILE_SIZE?: string
  DEFAULT_POSTING_WINDOW_START?: string
  DEFAULT_POSTING_WINDOW_END?: string
}

export default function Settings() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState<Settings>({})

  const { isLoading } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: async () => {
      const response = await axiosInstance.get('/settings')
      setFormData(response.data)
      return response.data
    },
  })

  const updateMutation = useMutation({
    mutationFn: async (data: Settings) => {
      const response = await axiosInstance.patch('/settings', { settings: data })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] })
      toast({
        title: 'Settings updated',
        description: 'API credentials have been saved successfully',
      })
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update settings',
        variant: 'destructive',
      })
    },
  })

  const validateConnectionMutation = useMutation({
    mutationFn: async (service: string) => {
      const response = await axiosInstance.post('/settings/validate', { service })
      return response.data
    },
    onSuccess: (data) => {
      toast({
        title: 'Connection validated',
        description: data.message || 'Connection is working correctly',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Validation failed',
        description: error.response?.data?.message || 'Could not validate connection',
        variant: 'destructive',
      })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateMutation.mutate(formData)
  }

  const handleChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold">System Settings</h1>
        <p className="text-muted-foreground">
          Manage global API credentials and configurations
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Meta API Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Meta API Credentials</CardTitle>
            <CardDescription>
              Configure Facebook, Instagram, and WhatsApp API access
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="META_APP_ID">App ID</Label>
                <Input
                  id="META_APP_ID"
                  value={formData.META_APP_ID || ''}
                  onChange={(e) => handleChange('META_APP_ID', e.target.value)}
                  placeholder="Enter Meta App ID"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="META_APP_SECRET">App Secret</Label>
                <Input
                  id="META_APP_SECRET"
                  type="password"
                  value={formData.META_APP_SECRET || ''}
                  onChange={(e) =>
                    handleChange('META_APP_SECRET', e.target.value)
                  }
                  placeholder="Enter Meta App Secret"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="META_VERIFY_TOKEN">Verify Token</Label>
                <Input
                  id="META_VERIFY_TOKEN"
                  value={formData.META_VERIFY_TOKEN || ''}
                  onChange={(e) =>
                    handleChange('META_VERIFY_TOKEN', e.target.value)
                  }
                  placeholder="Enter Webhook Verify Token"
                />
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => validateConnectionMutation.mutate('meta')}
              disabled={validateConnectionMutation.isPending}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Validate Connection
            </Button>
          </CardContent>
        </Card>

        {/* WhatsApp Business Settings */}
        <Card>
          <CardHeader>
            <CardTitle>WhatsApp Business API</CardTitle>
            <CardDescription>
              Configure WhatsApp Business API credentials
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="WHATSAPP_PHONE_ID">Phone Number ID</Label>
                <Input
                  id="WHATSAPP_PHONE_ID"
                  value={formData.WHATSAPP_PHONE_ID || ''}
                  onChange={(e) =>
                    handleChange('WHATSAPP_PHONE_ID', e.target.value)
                  }
                  placeholder="Enter Phone Number ID"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="WHATSAPP_BUSINESS_ID">Business Account ID</Label>
                <Input
                  id="WHATSAPP_BUSINESS_ID"
                  value={formData.WHATSAPP_BUSINESS_ID || ''}
                  onChange={(e) =>
                    handleChange('WHATSAPP_BUSINESS_ID', e.target.value)
                  }
                  placeholder="Enter Business Account ID"
                />
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => validateConnectionMutation.mutate('whatsapp')}
              disabled={validateConnectionMutation.isPending}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Validate Connection
            </Button>
          </CardContent>
        </Card>

        {/* Stripe Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Stripe API Credentials</CardTitle>
            <CardDescription>
              Configure Stripe payment processing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="STRIPE_KEY">Publishable Key</Label>
                <Input
                  id="STRIPE_KEY"
                  value={formData.STRIPE_KEY || ''}
                  onChange={(e) => handleChange('STRIPE_KEY', e.target.value)}
                  placeholder="pk_..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="STRIPE_SECRET">Secret Key</Label>
                <Input
                  id="STRIPE_SECRET"
                  type="password"
                  value={formData.STRIPE_SECRET || ''}
                  onChange={(e) =>
                    handleChange('STRIPE_SECRET', e.target.value)
                  }
                  placeholder="sk_..."
                />
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => validateConnectionMutation.mutate('stripe')}
              disabled={validateConnectionMutation.isPending}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Validate Connection
            </Button>
          </CardContent>
        </Card>

        {/* AI Content Generator Settings */}
        <Card>
          <CardHeader>
            <CardTitle>AI Content Generator</CardTitle>
            <CardDescription>
              Configure AI provider for content generation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="OPENAI_API_KEY">OpenAI API Key</Label>
                <Input
                  id="OPENAI_API_KEY"
                  type="password"
                  value={formData.OPENAI_API_KEY || ''}
                  onChange={(e) => handleChange('OPENAI_API_KEY', e.target.value)}
                  placeholder="sk-..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ANTHROPIC_API_KEY">Anthropic API Key (Optional)</Label>
                <Input
                  id="ANTHROPIC_API_KEY"
                  type="password"
                  value={formData.ANTHROPIC_API_KEY || ''}
                  onChange={(e) => handleChange('ANTHROPIC_API_KEY', e.target.value)}
                  placeholder="sk-ant-..."
                />
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => validateConnectionMutation.mutate('ai')}
              disabled={validateConnectionMutation.isPending}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Test AI Connection
            </Button>
          </CardContent>
        </Card>

        {/* Content Management Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Content Management</CardTitle>
            <CardDescription>
              Configure content posting limits and media settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="MAX_MEDIA_FILE_SIZE">Max Media Size (MB)</Label>
                <Input
                  id="MAX_MEDIA_FILE_SIZE"
                  type="number"
                  value={formData.MAX_MEDIA_FILE_SIZE || '50'}
                  onChange={(e) => handleChange('MAX_MEDIA_FILE_SIZE', e.target.value)}
                  placeholder="50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="DEFAULT_POSTING_WINDOW_START">Posting Window Start</Label>
                <Input
                  id="DEFAULT_POSTING_WINDOW_START"
                  type="time"
                  value={formData.DEFAULT_POSTING_WINDOW_START || '09:00'}
                  onChange={(e) => handleChange('DEFAULT_POSTING_WINDOW_START', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="DEFAULT_POSTING_WINDOW_END">Posting Window End</Label>
                <Input
                  id="DEFAULT_POSTING_WINDOW_END"
                  type="time"
                  value={formData.DEFAULT_POSTING_WINDOW_END || '22:00'}
                  onChange={(e) => handleChange('DEFAULT_POSTING_WINDOW_END', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            size="lg"
            disabled={updateMutation.isPending}
          >
            <Save className="w-4 h-4 mr-2" />
            {updateMutation.isPending ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </form>
    </div>
  )
}

