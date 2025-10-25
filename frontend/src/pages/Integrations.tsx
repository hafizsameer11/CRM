import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Facebook, Instagram, MessageCircle, Plus } from 'lucide-react'
import api from '@/lib/api'

export default function Integrations() {
  const { data: channels } = useQuery({
    queryKey: ['channels'],
    queryFn: async () => {
      const response = await api.get('/tenant/channels')
      return response.data || []
    },
  })

  const handleConnect = async (type: string) => {
    try {
      // Get the JWT token from localStorage
      const token = localStorage.getItem('token')
      if (!token) {
        alert('Please login first')
        return
      }

      // Redirect to OAuth with token in query (backend will validate and redirect to Meta)
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
      window.location.href = `${apiUrl}/meta/connect?token=${token}`
    } catch (error) {
      console.error('Connect error:', error)
    }
  }

  const integrations = [
    {
      name: 'Facebook',
      icon: Facebook,
      type: 'facebook',
      description: 'Connect your Facebook pages to manage messages',
      color: 'text-blue-600',
    },
    {
      name: 'Instagram',
      icon: Instagram,
      type: 'instagram',
      description: 'Connect Instagram accounts for DM management',
      color: 'text-pink-600',
    },
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      type: 'whatsapp',
      description: 'Connect WhatsApp Business for customer support',
      color: 'text-green-600',
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Integrations</h1>
        <p className="text-muted-foreground">Connect your messaging channels</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {integrations.map((integration) => {
          const connected = channels?.filter((c: any) => c.type === integration.type) || []

          return (
            <Card key={integration.type}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <integration.icon className={`h-10 w-10 ${integration.color}`} />
                  {connected.length > 0 && (
                    <Badge variant="default">{connected.length} Connected</Badge>
                  )}
                </div>
                <CardTitle>{integration.name}</CardTitle>
                <CardDescription>{integration.description}</CardDescription>
              </CardHeader>
              <CardContent>
                {connected.length > 0 ? (
                  <div className="space-y-2">
                    {connected.map((channel: any) => (
                      <div
                        key={channel.id}
                        className="flex items-center justify-between p-2 rounded-lg bg-muted"
                      >
                        <span className="text-sm truncate">
                          {channel.identifiers?.page_name || channel.identifiers?.username || channel.identifiers?.phone_number}
                        </span>
                        <Badge variant={channel.status === 'active' ? 'default' : 'secondary'}>
                          {channel.status}
                        </Badge>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      className="w-full mt-2"
                      onClick={() => handleConnect(integration.type)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Another
                    </Button>
                  </div>
                ) : (
                  <Button
                    className="w-full"
                    onClick={() => handleConnect(integration.type)}
                  >
                    Connect {integration.name}
                  </Button>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

