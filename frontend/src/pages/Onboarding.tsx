import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Facebook, Instagram, MessageCircle, Check, ArrowRight, Sparkles, MessageSquare, BarChart3, Calendar, Loader2 } from 'lucide-react'
import { useUIStore } from '@/store/uiStore'
import api from '@/lib/api'
import { isDemoMode, demoChannels } from '@/lib/demoData'

export default function Onboarding() {
  const navigate = useNavigate()
  const addToast = useUIStore((state) => state.addToast)
  const [step, setStep] = useState(1)
  const [connecting, setConnecting] = useState<string | null>(null)

  const steps = [
    {
      title: 'Welcome to Your CRM',
      description: 'Let\'s get you set up in just a few steps',
      icon: Sparkles,
    },
    {
      title: 'Connect Your Channels',
      description: 'Connect your social media accounts to start managing conversations',
      icon: MessageCircle,
    },
  ]

  const channels = [
    {
      type: 'facebook',
      name: 'Facebook',
      icon: Facebook,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950',
      description: 'Connect Facebook pages to manage messages and posts',
    },
    {
      type: 'instagram',
      name: 'Instagram',
      icon: Instagram,
      color: 'text-pink-600',
      bgColor: 'bg-pink-50 dark:bg-pink-950',
      description: 'Connect Instagram accounts for DM management',
    },
    {
      type: 'whatsapp',
      name: 'WhatsApp',
      icon: MessageCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-950',
      description: 'Connect WhatsApp Business for customer support',
    },
  ]

  const handleConnect = async (type: string) => {
    if (isDemoMode()) {
      addToast({
        title: 'Demo Mode',
        description: 'In demo mode, channels are simulated. Connect real accounts in production.',
      })
      setTimeout(() => {
        setStep(2)
      }, 1000)
      return
    }

    setConnecting(type)
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        addToast({
          title: 'Please login first',
          variant: 'destructive',
        })
        return
      }

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
      window.location.href = `${apiUrl}/meta/connect?token=${token}`
    } catch (error) {
      addToast({
        title: 'Connection failed',
        description: 'Please try again',
        variant: 'destructive',
      })
    } finally {
      setConnecting(null)
    }
  }

  const handleSkip = () => {
    navigate('/dashboard')
  }

  const handleComplete = () => {
    addToast({
      title: 'Setup Complete!',
      description: 'Welcome to your CRM dashboard',
    })
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl"
      >
        {/* Progress */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center gap-4">
            {steps.map((s, index) => (
              <div key={index} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                    step > index + 1
                      ? 'border-primary bg-primary text-primary-foreground'
                      : step === index + 1
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-muted text-muted-foreground'
                  }`}
                >
                  {step > index + 1 ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <s.icon className="h-5 w-5" />
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-16 h-0.5 transition-all ${
                      step > index + 1 ? 'bg-primary' : 'bg-muted'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="shadow-xl border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                <CardHeader className="text-center pb-6">
                  <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center mb-6">
                    <Sparkles className="h-10 w-10 text-white" />
                  </div>
                  <CardTitle className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent mb-2">
                    Welcome to Your CRM!
                  </CardTitle>
                  <CardDescription className="text-lg">
                    You're all set! Let's connect your social media accounts to get started.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-3">
                    {[
                      { icon: MessageSquare, title: 'Unified Inbox', desc: 'All messages in one place' },
                      { icon: BarChart3, title: 'Analytics', desc: 'Track performance' },
                      { icon: Calendar, title: 'Schedule Posts', desc: 'Plan your content' },
                    ].map((feature, i) => (
                      <div key={i} className="text-center p-4 rounded-lg bg-muted/50">
                        <feature.icon className="h-8 w-8 mx-auto mb-2 text-primary" />
                        <h3 className="font-semibold mb-1">{feature.title}</h3>
                        <p className="text-sm text-muted-foreground">{feature.desc}</p>
                      </div>
                    ))}
                  </div>
                  <Button
                    onClick={() => setStep(2)}
                    className="w-full h-12 text-base font-semibold"
                    size="lg"
                  >
                    Get Started
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="connect"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="shadow-xl border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                <CardHeader className="text-center pb-6">
                  <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent mb-2">
                    Connect Your Channels
                  </CardTitle>
                  <CardDescription className="text-lg">
                    Connect at least one channel to start managing conversations
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    {channels.map((channel) => {
                      const Icon = channel.icon
                      const isConnecting = connecting === channel.type
                      return (
                        <motion.div
                          key={channel.type}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Card className={`${channel.bgColor} border-2 hover:border-primary/50 transition-all cursor-pointer`}>
                            <CardContent className="p-6 text-center">
                              <div className={`mx-auto w-16 h-16 rounded-full ${channel.bgColor} flex items-center justify-center mb-4`}>
                                <Icon className={`h-8 w-8 ${channel.color}`} />
                              </div>
                              <h3 className="font-semibold text-lg mb-2">{channel.name}</h3>
                              <p className="text-sm text-muted-foreground mb-4">{channel.description}</p>
                              <Button
                                onClick={() => handleConnect(channel.type)}
                                disabled={isConnecting}
                                className="w-full"
                                variant={isConnecting ? 'outline' : 'default'}
                              >
                                {isConnecting ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Connecting...
                                  </>
                                ) : (
                                  <>
                                    Connect {channel.name}
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                  </>
                                )}
                              </Button>
                            </CardContent>
                          </Card>
                        </motion.div>
                      )
                    })}
                  </div>
                  <div className="flex gap-4 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setStep(1)}
                      className="flex-1"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={handleComplete}
                      className="flex-1 h-11 text-base font-semibold"
                    >
                      Complete Setup
                      <Check className="ml-2 h-5 w-5" />
                    </Button>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={handleSkip}
                    className="w-full"
                  >
                    Skip for now
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

