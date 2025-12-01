import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import api from '@/lib/api'
import { Loader2, Check, Sparkles, Zap, Rocket } from 'lucide-react'
import { isDemoMode, demoPlans } from '@/lib/demoData'

export default function Register() {
  const navigate = useNavigate()
  const login = useAuthStore((state) => state.login)
  const setTenant = useAuthStore((state) => state.setTenant)
  const addToast = useUIStore((state) => state.addToast)
  
  const [step, setStep] = useState(1) // 1: Account Info, 2: Plan Selection
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company_name: '',
    password: '',
    password_confirmation: '',
    plan_id: null as number | null,
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [plans, setPlans] = useState<any[]>([])

  useEffect(() => {
    // Fetch plans
    const fetchPlans = async () => {
      if (isDemoMode()) {
        setPlans(demoPlans)
        return
      }
      try {
        const response = await api.get('/tenant/billing/plans')
        setPlans(response.data || [])
      } catch (error) {
        console.error('Failed to fetch plans:', error)
        setPlans([])
      }
    }
    fetchPlans()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault()
    if (step === 1) {
      // Validate step 1
      if (!formData.name || !formData.email || !formData.company_name || !formData.password) {
        addToast({
          title: 'Missing information',
          description: 'Please fill in all required fields',
          variant: 'destructive',
        })
        return
      }
      setStep(2)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.plan_id) {
      addToast({
        title: 'Plan required',
        description: 'Please select a plan to continue',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)
    setErrors({})

    try {
      const response = await api.post('/auth/register', {
        name: formData.name,
        email: formData.email,
        company_name: formData.company_name,
        password: formData.password,
        password_confirmation: formData.password_confirmation,
      })
      const { access_token, user } = response.data
      
      login(access_token, user)
      
      if (user.tenant) {
        setTenant(user.tenant)
      }

      // Subscribe to selected plan (if not demo)
      if (!isDemoMode() && formData.plan_id) {
        try {
          await api.post('/tenant/billing/subscribe', {
            plan_id: formData.plan_id,
            payment_method: 'pm_card_visa', // Demo payment method
          })
        } catch (subError) {
          console.error('Subscription failed:', subError)
          // Continue anyway - subscription can be done later
        }
      }
      
      addToast({
        title: 'Account created!',
        description: 'Welcome to CRM SaaS',
      })
      
      // Navigate to onboarding
      navigate('/onboarding')
    } catch (error: any) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors)
      } else {
        addToast({
          title: 'Registration failed',
          description: error.response?.data?.error || 'Please try again',
          variant: 'destructive',
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const getPlanIcon = (slug: string) => {
    switch (slug) {
      case 'starter':
        return Sparkles
      case 'growth':
        return Zap
      case 'pro':
        return Rocket
      default:
        return Check
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-5xl"
      >
        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 ${step >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 1 ? 'border-primary bg-primary text-primary-foreground' : 'border-muted'}`}>
                {step > 1 ? <Check className="h-4 w-4" /> : '1'}
              </div>
              <span className="hidden sm:block font-medium">Account</span>
            </div>
            <div className={`w-16 h-0.5 ${step >= 2 ? 'bg-primary' : 'bg-muted'}`} />
            <div className={`flex items-center gap-2 ${step >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 2 ? 'border-primary bg-primary text-primary-foreground' : 'border-muted'}`}>
                2
              </div>
              <span className="hidden sm:block font-medium">Plan</span>
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="w-full max-w-md mx-auto shadow-xl border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                <CardHeader className="space-y-1 text-center pb-6">
                  <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center mb-4">
                    <Sparkles className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    Create your account
                  </CardTitle>
                  <CardDescription className="text-base">
                    Start managing your social media conversations in minutes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleNext} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-semibold">Full Name</Label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={handleChange}
                        className="h-11"
                        required
                      />
                      {errors.name && <p className="text-sm text-destructive">{errors.name[0]}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="company_name" className="text-sm font-semibold">Company Name</Label>
                      <Input
                        id="company_name"
                        name="company_name"
                        placeholder="Acme Inc"
                        value={formData.company_name}
                        onChange={handleChange}
                        className="h-11"
                        required
                      />
                      {errors.company_name && <p className="text-sm text-destructive">{errors.company_name[0]}</p>}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-semibold">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        className="h-11"
                        required
                      />
                      {errors.email && <p className="text-sm text-destructive">{errors.email[0]}</p>}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-sm font-semibold">Password</Label>
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="h-11"
                        required
                      />
                      {errors.password && <p className="text-sm text-destructive">{errors.password[0]}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password_confirmation" className="text-sm font-semibold">Confirm Password</Label>
                      <Input
                        id="password_confirmation"
                        name="password_confirmation"
                        type="password"
                        value={formData.password_confirmation}
                        onChange={handleChange}
                        className="h-11"
                        required
                      />
                    </div>

                    <Button type="submit" className="w-full h-11 text-base font-semibold" disabled={loading}>
                      Continue to Plan Selection
                      <Zap className="ml-2 h-4 w-4" />
                    </Button>
                  </form>

                  <div className="mt-6 text-center text-sm">
                    Already have an account?{' '}
                    <Link to="/login" className="text-primary hover:underline font-semibold">
                      Sign in
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="w-full shadow-xl border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                <CardHeader className="text-center pb-6">
                  <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    Choose Your Plan
                  </CardTitle>
                  <CardDescription className="text-base">
                    Select the perfect plan for your business needs
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit}>
                    <div className="grid gap-6 md:grid-cols-3 mb-6">
                      {plans.map((plan) => {
                        const Icon = getPlanIcon(plan.slug)
                        const isSelected = formData.plan_id === plan.id
                        return (
                          <motion.div
                            key={plan.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Card
                              className={`cursor-pointer transition-all ${
                                isSelected
                                  ? 'border-primary border-2 shadow-lg scale-105'
                                  : 'border hover:border-primary/50'
                              }`}
                              onClick={() => setFormData(prev => ({ ...prev, plan_id: plan.id }))}
                            >
                              <CardHeader>
                                <div className="flex items-center justify-between mb-2">
                                  <div className={`p-2 rounded-lg ${isSelected ? 'bg-primary/10' : 'bg-muted'}`}>
                                    <Icon className={`h-5 w-5 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                                  </div>
                                  {isSelected && <Badge className="bg-primary">Selected</Badge>}
                                </div>
                                <CardTitle className="text-xl">{plan.name}</CardTitle>
                                <div className="mt-2">
                                  <span className="text-3xl font-bold">${plan.monthly_price}</span>
                                  <span className="text-muted-foreground">/month</span>
                                </div>
                              </CardHeader>
                              <CardContent>
                                <ul className="space-y-3">
                                  <li className="flex items-center gap-2 text-sm">
                                    <Check className="h-4 w-4 text-primary flex-shrink-0" />
                                    <span>{plan.limits?.channels === -1 ? 'Unlimited' : plan.limits?.channels} Channels</span>
                                  </li>
                                  <li className="flex items-center gap-2 text-sm">
                                    <Check className="h-4 w-4 text-primary flex-shrink-0" />
                                    <span>{plan.limits?.users === -1 ? 'Unlimited' : plan.limits?.users} Users</span>
                                  </li>
                                  <li className="flex items-center gap-2 text-sm">
                                    <Check className="h-4 w-4 text-primary flex-shrink-0" />
                                    <span>
                                      {plan.limits?.messages_per_month === -1
                                        ? 'Unlimited'
                                        : `${plan.limits?.messages_per_month.toLocaleString()}`} Messages/mo
                                    </span>
                                  </li>
                                  {plan.limits?.posting_limits && (
                                    <li className="flex items-center gap-2 text-sm">
                                      <Check className="h-4 w-4 text-primary flex-shrink-0" />
                                      <span>
                                        {plan.limits.posting_limits === -1
                                          ? 'Unlimited'
                                          : `${plan.limits.posting_limits}`} Posts/mo
                                      </span>
                                    </li>
                                  )}
                                </ul>
                              </CardContent>
                            </Card>
                          </motion.div>
                        )
                      })}
                    </div>

                    <div className="flex gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1 h-11"
                        onClick={() => setStep(1)}
                      >
                        Back
                      </Button>
                      <Button
                        type="submit"
                        className="flex-1 h-11 text-base font-semibold"
                        disabled={loading || !formData.plan_id}
                      >
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating...
                          </>
                        ) : (
                          <>
                            Create Account
                            <Rocket className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

