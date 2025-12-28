import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { 
  MessageSquare, 
  BarChart3, 
  Zap, 
  Shield, 
  Globe, 
  Users, 
  CheckCircle2,
  ArrowRight,
  Facebook,
  Instagram,
  MessageCircle
} from 'lucide-react'

export default function Landing() {
  const features = [
    {
      icon: MessageSquare,
      title: 'Unified Inbox',
      description: 'Manage all your social media messages from Facebook, Instagram, and WhatsApp in one place.',
    },
    {
      icon: BarChart3,
      title: 'Analytics & Insights',
      description: 'Track engagement, monitor performance, and get detailed insights across all your channels.',
    },
    {
      icon: Zap,
      title: 'Schedule Posts',
      description: 'Plan and schedule your social media content in advance. Save time and maintain consistency.',
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Work together with your team. Assign conversations, manage roles, and streamline workflows.',
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Enterprise-grade security with encrypted data storage and secure API connections.',
    },
    {
      icon: Globe,
      title: 'Multi-Channel',
      description: 'Connect and manage Facebook Pages, Instagram Business accounts, and WhatsApp Business.',
    },
  ]

  const platforms = [
    { name: 'Facebook', icon: Facebook, color: 'text-blue-600' },
    { name: 'Instagram', icon: Instagram, color: 'text-pink-600' },
    { name: 'WhatsApp', icon: MessageCircle, color: 'text-green-600' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Navigation */}
      <nav className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                CRM SaaS
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/privacy-policy">
                <Button variant="ghost">Privacy Policy</Button>
              </Link>
              <Link to="/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link to="/register">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto"
        >
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Manage All Your Social Media
            <br />
            in One Powerful Platform
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Connect Facebook, Instagram, and WhatsApp. Manage messages, schedule posts, track analytics, 
            and grow your social media presence—all from a single dashboard.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" className="text-lg px-8">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="text-lg px-8">
                Sign In
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Platform Icons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex justify-center items-center gap-8 mt-12"
        >
          {platforms.map((platform) => {
            const Icon = platform.icon
            return (
              <div key={platform.name} className="flex flex-col items-center">
                <div className={`p-4 rounded-xl bg-white dark:bg-gray-800 shadow-lg ${platform.color}`}>
                  <Icon className="h-8 w-8" />
                </div>
                <span className="mt-2 text-sm font-medium text-muted-foreground">{platform.name}</span>
              </div>
            )
          })}
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Everything You Need to Manage Social Media
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Powerful features designed to streamline your social media management workflow
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="p-6 rounded-xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="p-3 rounded-lg bg-primary/10 w-fit mb-4">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-white dark:bg-gray-900 border-t border-b py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">
              Why Choose Our Platform?
            </h2>
            <div className="space-y-6">
              {[
                'Real-time message synchronization across all channels',
                'Advanced analytics and performance tracking',
                'Secure data encryption and privacy protection',
                'Scalable pricing plans for businesses of all sizes',
                '24/7 customer support and regular updates',
                'Easy team collaboration and role management',
              ].map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex items-start gap-4"
                >
                  <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                  <p className="text-lg text-muted-foreground">{benefit}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-primary to-indigo-600 rounded-2xl p-12 text-center text-white"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of businesses managing their social media more efficiently. 
            Start your free trial today.
          </p>
          <Link to="/register">
            <Button size="lg" variant="secondary" className="text-lg px-8">
              Create Free Account
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white dark:bg-gray-900 py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <MessageSquare className="h-6 w-6 text-primary" />
                <span className="text-lg font-bold">CRM SaaS</span>
              </div>
              <p className="text-muted-foreground">
                The all-in-one social media management platform for modern businesses.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/privacy-policy" className="text-muted-foreground hover:text-primary">
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Get Started</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/register" className="text-muted-foreground hover:text-primary">
                    Sign Up
                  </Link>
                </li>
                <li>
                  <Link to="/login" className="text-muted-foreground hover:text-primary">
                    Sign In
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} CRM SaaS. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}


