import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Facebook, Instagram, MessageCircle, Plus } from 'lucide-react'
import api from '@/lib/api'
import { isDemoMode, demoChannels } from '@/lib/demoData'
import { motion } from 'framer-motion'

export default function Integrations() {
  const { data: channels } = useQuery({
    queryKey: ['channels'],
    queryFn: async () => {
      if (isDemoMode()) {
        return demoChannels
      }
      const response = await api.get('/tenant/channels')
      return response.data || []
    },
    enabled: !isDemoMode(),
  })

  const displayChannels = isDemoMode() ? demoChannels : channels

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
            Integrations
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">Connect your messaging channels</p>
        </div>
        {isDemoMode() && (
          <div className="px-4 py-2 rounded-full bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700">
            <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-200">
              🎭 Demo Mode
            </p>
          </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {integrations.map((integration, index) => {
          const connected = displayChannels?.filter((c: any) => c.type === integration.type) || []

          return (
            <motion.div
              key={integration.type}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className={`p-3 rounded-xl ${integration.color.replace('text-', 'bg-')} bg-opacity-10 group-hover:scale-110 transition-transform`}>
                      <integration.icon className={`h-8 w-8 ${integration.color}`} />
                    </div>
                    {connected.length > 0 && (
                      <Badge variant="default" className="font-semibold">{connected.length} Connected</Badge>
                    )}
                  </div>
                  <CardTitle className="text-xl mt-4">{integration.name}</CardTitle>
                  <CardDescription className="text-base">{integration.description}</CardDescription>
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
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

