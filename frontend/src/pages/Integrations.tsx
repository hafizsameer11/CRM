import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Facebook, Instagram, MessageCircle, Plus, Loader2, Check } from 'lucide-react'
import api from '@/lib/api'
import { isDemoMode, demoChannels } from '@/lib/demoData'
import { motion } from 'framer-motion'
import { useUIStore } from '@/store/uiStore'
import { useAuthStore } from '@/store/authStore'

export default function Integrations() {
  const [searchParams, setSearchParams] = useSearchParams()
  const queryClient = useQueryClient()
  const addToast = useUIStore((state) => state.addToast)
  const token = useAuthStore((state) => state.token)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const [showPageSelection, setShowPageSelection] = useState(false)
  const [selectedPages, setSelectedPages] = useState<string[]>([])
  const [selectedInstagram, setSelectedInstagram] = useState<string[]>([])
  const [selectedWhatsApp, setSelectedWhatsApp] = useState<string[]>([])
  const [oauthToken, setOauthToken] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'facebook' | 'instagram' | 'whatsapp'>('facebook')

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

  // Check for OAuth callback or errors
  useEffect(() => {
    const oauthSuccess = searchParams.get('oauth')
    const token = searchParams.get('token')
    const type = searchParams.get('type') as 'facebook' | 'instagram' | 'whatsapp' | null
    const error = searchParams.get('error')
    
    if (error) {
      addToast({
        title: 'Connection Error',
        description: error === 'unauthorized' ? 'Please login first' : 'Failed to connect. Please try again.',
        variant: 'destructive',
      })
      setSearchParams({})
      return
    }
    
    if (oauthSuccess === 'success' && token) {
      setOauthToken(token)
      setShowPageSelection(true)
      // Set active tab based on type
      if (type && ['facebook', 'instagram', 'whatsapp'].includes(type)) {
        setActiveTab(type)
      }
      // Clean URL
      setSearchParams({})
    }
  }, [searchParams, setSearchParams, addToast])

  // Fetch Facebook pages when OAuth token is available
  const { data: pages, isLoading: loadingPages } = useQuery({
    queryKey: ['meta-pages', oauthToken],
    queryFn: async () => {
      if (!oauthToken) return []
      const response = await api.get('/meta/pages', {
        params: { access_token: oauthToken }
      })
      return response.data.pages || []
    },
    enabled: !!oauthToken && showPageSelection,
  })

  // Fetch Instagram accounts
  const { data: instagramAccounts, isLoading: loadingInstagram } = useQuery({
    queryKey: ['meta-instagram', oauthToken],
    queryFn: async () => {
      if (!oauthToken) return []
      const response = await api.get('/meta/instagram-accounts', {
        params: { access_token: oauthToken }
      })
      return response.data.instagram_accounts || []
    },
    enabled: !!oauthToken && showPageSelection && activeTab === 'instagram',
  })

  // Fetch WhatsApp accounts
  const { data: whatsappAccounts, isLoading: loadingWhatsApp } = useQuery({
    queryKey: ['meta-whatsapp', oauthToken],
    queryFn: async () => {
      if (!oauthToken) return []
      const response = await api.get('/meta/whatsapp-accounts', {
        params: { access_token: oauthToken }
      })
      return response.data.whatsapp_accounts || []
    },
    enabled: !!oauthToken && showPageSelection && activeTab === 'whatsapp',
  })

  const attachPageMutation = useMutation({
    mutationFn: async (page: any) => {
      return api.post('/meta/attach/facebook', {
        page_id: page.id,
        page_name: page.name,
        page_access_token: page.access_token,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['channels'] })
    },
    onError: (error: any) => {
      addToast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to connect page',
        variant: 'destructive',
      })
    },
  })

  const attachInstagramMutation = useMutation({
    mutationFn: async (account: any) => {
      return api.post('/meta/attach/instagram', {
        instagram_account_id: account.instagram_account_id,
        username: account.username,
        access_token: account.access_token,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['channels'] })
    },
    onError: (error: any) => {
      addToast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to connect Instagram account',
        variant: 'destructive',
      })
    },
  })

  const attachWhatsAppMutation = useMutation({
    mutationFn: async (account: any) => {
      return api.post('/meta/attach/whatsapp', {
        phone_number_id: account.phone_number_id || account.id,
        phone_number: account.phone_number || account.display_phone_number || 'Unknown',
        access_token: oauthToken,
        waba_id: account.waba_id || account.business_account_id || account.id,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['channels'] })
    },
    onError: (error: any) => {
      addToast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to connect WhatsApp account',
        variant: 'destructive',
      })
    },
  })

  const handleAttachPages = async () => {
    let successCount = 0
    let errorCount = 0

    // Attach Facebook pages
    if (activeTab === 'facebook' && pages && selectedPages.length > 0) {
      const pagesToAttach = pages.filter((p: any) => selectedPages.includes(p.id))
      for (const page of pagesToAttach) {
        try {
          await attachPageMutation.mutateAsync(page)
          successCount++
        } catch {
          errorCount++
        }
      }
    }

    // Attach Instagram accounts
    if (activeTab === 'instagram' && instagramAccounts && selectedInstagram.length > 0) {
      const accountsToAttach = instagramAccounts.filter((a: any) => selectedInstagram.includes(a.instagram_account_id))
      for (const account of accountsToAttach) {
        try {
          await attachInstagramMutation.mutateAsync(account)
          successCount++
        } catch {
          errorCount++
        }
      }
    }

    // Attach WhatsApp accounts
    if (activeTab === 'whatsapp' && whatsappAccounts && selectedWhatsApp.length > 0) {
      const accountsToAttach = whatsappAccounts.filter((a: any) => selectedWhatsApp.includes(a.id || a.waba_id))
      for (const account of accountsToAttach) {
        try {
          await attachWhatsAppMutation.mutateAsync(account)
          successCount++
        } catch {
          errorCount++
        }
      }
    }

    if (successCount > 0) {
      addToast({
        title: 'Success',
        description: `Successfully connected ${successCount} ${successCount === 1 ? 'account' : 'accounts'}!`,
      })
    }

    if (errorCount > 0) {
      addToast({
        title: 'Warning',
        description: `${errorCount} ${errorCount === 1 ? 'account' : 'accounts'} failed to connect.`,
        variant: 'destructive',
      })
    }

    setShowPageSelection(false)
    setSelectedPages([])
    setSelectedInstagram([])
    setSelectedWhatsApp([])
    setOauthToken(null)
    setActiveTab('facebook')
  }

  const displayChannels = isDemoMode() ? demoChannels : channels

  const handleConnect = (type: string) => {
    // Don't allow connection in demo mode
    if (isDemoMode()) {
      addToast({
        title: 'Demo Mode',
        description: 'Please disable demo mode to connect real accounts. Set VITE_MODE environment variable.',
        variant: 'destructive',
      })
      return
    }

    // Check if user is authenticated
    if (!isAuthenticated || !token) {
      addToast({
        title: 'Please login first',
        description: 'You need to be logged in to connect accounts. Redirecting to login...',
        variant: 'destructive',
      })
      // Redirect to login after a short delay
      setTimeout(() => {
        window.location.href = '/login'
      }, 2000)
      return
    }

    // Build the OAuth URL
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
    const connectUrl = `${apiUrl}/meta/connect?token=${encodeURIComponent(token)}&type=${encodeURIComponent(type)}`
    
    console.log('Redirecting to:', connectUrl)
    
    // Redirect to OAuth (backend will validate and redirect to Meta)
    window.location.href = connectUrl
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
                      type="button"
                      variant="outline"
                      className="w-full mt-2"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handleConnect(integration.type)
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Another
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    className="w-full"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      handleConnect(integration.type)
                    }}
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

      {/* Page Selection Dialog */}
      <Dialog open={showPageSelection} onOpenChange={setShowPageSelection}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Connect Your Accounts</DialogTitle>
            <DialogDescription>
              Select which accounts you want to connect to your CRM. You can connect Facebook pages, Instagram accounts, and WhatsApp Business accounts.
            </DialogDescription>
          </DialogHeader>

          {/* Tabs */}
          <div className="flex border-b">
            <button
              className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'facebook'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setActiveTab('facebook')}
            >
              <Facebook className="h-4 w-4 inline mr-2" />
              Facebook Pages
            </button>
            <button
              className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'instagram'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setActiveTab('instagram')}
            >
              <Instagram className="h-4 w-4 inline mr-2" />
              Instagram
            </button>
            <button
              className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'whatsapp'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setActiveTab('whatsapp')}
            >
              <MessageCircle className="h-4 w-4 inline mr-2" />
              WhatsApp
            </button>
          </div>

          {/* Facebook Pages Tab */}
          {activeTab === 'facebook' && (
            <>
              {loadingPages ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <span className="ml-2">Loading your pages...</span>
                </div>
              ) : pages && pages.length > 0 ? (
                <div className="space-y-3 py-4">
                  {pages.map((page: any) => (
                    <div
                      key={page.id}
                      className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedPages.includes(page.id)
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => {
                        if (selectedPages.includes(page.id)) {
                          setSelectedPages(selectedPages.filter(id => id !== page.id))
                        } else {
                          setSelectedPages([...selectedPages, page.id])
                        }
                      }}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                          <Facebook className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold">{page.name}</p>
                          <p className="text-sm text-muted-foreground">ID: {page.id}</p>
                          {page.instagram_account && (
                            <p className="text-xs text-pink-600 dark:text-pink-400 mt-1">
                              📷 Instagram: @{page.instagram_account.username || 'Connected'}
                            </p>
                          )}
                        </div>
                      </div>
                      {selectedPages.includes(page.id) && (
                        <Check className="h-5 w-5 text-primary" />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  No Facebook pages found. Make sure you have pages associated with your account.
                </div>
              )}
            </>
          )}

          {/* Instagram Tab */}
          {activeTab === 'instagram' && (
            <>
              {loadingInstagram ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <span className="ml-2">Loading Instagram accounts...</span>
                </div>
              ) : instagramAccounts && instagramAccounts.length > 0 ? (
                <div className="space-y-3 py-4">
                  {instagramAccounts.map((account: any) => (
                    <div
                      key={account.instagram_account_id}
                      className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedInstagram.includes(account.instagram_account_id)
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => {
                        if (selectedInstagram.includes(account.instagram_account_id)) {
                          setSelectedInstagram(selectedInstagram.filter(id => id !== account.instagram_account_id))
                        } else {
                          setSelectedInstagram([...selectedInstagram, account.instagram_account_id])
                        }
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-pink-100 dark:bg-pink-900 flex items-center justify-center">
                          <Instagram className="h-6 w-6 text-pink-600 dark:text-pink-400" />
                        </div>
                        <div>
                          <p className="font-semibold">@{account.username}</p>
                          <p className="text-sm text-muted-foreground">Linked to: {account.page_name}</p>
                        </div>
                      </div>
                      {selectedInstagram.includes(account.instagram_account_id) && (
                        <Check className="h-5 w-5 text-primary" />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  No Instagram Business accounts found. Make sure your Facebook pages have linked Instagram Business accounts.
                </div>
              )}
            </>
          )}

          {/* WhatsApp Tab */}
          {activeTab === 'whatsapp' && (
            <>
              {loadingWhatsApp ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <span className="ml-2">Loading WhatsApp accounts...</span>
                </div>
              ) : whatsappAccounts && whatsappAccounts.length > 0 ? (
                <div className="space-y-3 py-4">
                  {whatsappAccounts.map((account: any) => (
                    <div
                      key={account.id || account.waba_id}
                      className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedWhatsApp.includes(account.id || account.waba_id)
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => {
                        const id = account.id || account.waba_id
                        if (selectedWhatsApp.includes(id)) {
                          setSelectedWhatsApp(selectedWhatsApp.filter(accId => accId !== id))
                        } else {
                          setSelectedWhatsApp([...selectedWhatsApp, id])
                        }
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900 flex items-center justify-center">
                          <MessageCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <p className="font-semibold">{account.name || account.display_name || 'WhatsApp Business'}</p>
                          <p className="text-sm text-muted-foreground">
                            {account.phone_number || account.display_phone_number || 'Phone number not available'}
                          </p>
                        </div>
                      </div>
                      {selectedWhatsApp.includes(account.id || account.waba_id) && (
                        <Check className="h-5 w-5 text-primary" />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  No WhatsApp Business accounts found. Make sure you have WhatsApp Business accounts set up in your Meta App.
                </div>
              )}
            </>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowPageSelection(false)
                setSelectedPages([])
                setSelectedInstagram([])
                setSelectedWhatsApp([])
                setOauthToken(null)
                setActiveTab('facebook')
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAttachPages}
              disabled={
                (activeTab === 'facebook' && selectedPages.length === 0) ||
                (activeTab === 'instagram' && selectedInstagram.length === 0) ||
                (activeTab === 'whatsapp' && selectedWhatsApp.length === 0) ||
                attachPageMutation.isPending ||
                attachInstagramMutation.isPending ||
                attachWhatsAppMutation.isPending
              }
            >
              {(attachPageMutation.isPending || attachInstagramMutation.isPending || attachWhatsAppMutation.isPending) ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                `Connect ${
                  activeTab === 'facebook' ? selectedPages.length :
                  activeTab === 'instagram' ? selectedInstagram.length :
                  selectedWhatsApp.length
                } ${activeTab === 'facebook' ? 'Page' : 'Account'}${(
                  activeTab === 'facebook' ? selectedPages.length :
                  activeTab === 'instagram' ? selectedInstagram.length :
                  selectedWhatsApp.length
                ) !== 1 ? 's' : ''}`
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

