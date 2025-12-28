import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { MessageSquare, Shield, ArrowLeft } from 'lucide-react'

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Navigation */}
      <nav className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <MessageSquare className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                CRM SaaS
              </span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link to="/">
                <Button variant="ghost">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Home
                </Button>
              </Link>
              <Link to="/register">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-4xl">
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8 md:p-12">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-4xl font-bold">Privacy Policy</h1>
            </div>
            <p className="text-muted-foreground">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
            {/* Introduction */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
              <p className="text-muted-foreground leading-relaxed">
                CRM SaaS ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains 
                how we collect, use, disclose, and safeguard your information when you use our social media management 
                platform and services (the "Service"). Please read this Privacy Policy carefully. By using our Service, 
                you agree to the collection and use of information in accordance with this policy.
              </p>
            </section>

            {/* Information We Collect */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
              
              <h3 className="text-xl font-semibold mb-3 mt-6">2.1 Information You Provide</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We collect information that you voluntarily provide to us when you:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Register for an account (name, email address, company name, password)</li>
                <li>Subscribe to our services (billing information, payment details)</li>
                <li>Connect your social media accounts (Facebook, Instagram, WhatsApp access tokens)</li>
                <li>Contact us for support (name, email, message content)</li>
                <li>Use our platform features (post content, media files, messages)</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 mt-6">2.2 Automatically Collected Information</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                When you use our Service, we automatically collect certain information, including:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Device information (IP address, browser type, operating system)</li>
                <li>Usage data (pages visited, features used, time spent)</li>
                <li>Log data (access times, error logs, performance metrics)</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 mt-6">2.3 Information from Third-Party Services</h3>
              <p className="text-muted-foreground leading-relaxed">
                When you connect your social media accounts (Facebook, Instagram, WhatsApp), we receive information 
                from these platforms in accordance with their respective privacy policies and your authorization. 
                This includes page/account information, messages, posts, and engagement data necessary to provide 
                our services.
              </p>
            </section>

            {/* How We Use Information */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We use the collected information for the following purposes:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li><strong>To Provide and Maintain Our Service:</strong> Process your account registration, manage your subscription, and deliver the features you request</li>
                <li><strong>To Manage Social Media Accounts:</strong> Connect, manage, and interact with your connected Facebook, Instagram, and WhatsApp accounts</li>
                <li><strong>To Process Payments:</strong> Handle billing, subscription management, and payment processing through our payment providers</li>
                <li><strong>To Communicate with You:</strong> Send service-related notifications, respond to your inquiries, and provide customer support</li>
                <li><strong>To Improve Our Service:</strong> Analyze usage patterns, monitor performance, and enhance user experience</li>
                <li><strong>To Ensure Security:</strong> Detect and prevent fraud, unauthorized access, and other security threats</li>
                <li><strong>To Comply with Legal Obligations:</strong> Meet legal requirements, respond to legal processes, and protect our rights</li>
              </ul>
            </section>

            {/* Data Sharing */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">4. How We Share Your Information</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We do not sell your personal information. We may share your information only in the following circumstances:
              </p>
              
              <h3 className="text-xl font-semibold mb-3 mt-6">4.1 Service Providers</h3>
              <p className="text-muted-foreground leading-relaxed">
                We may share information with third-party service providers who perform services on our behalf, 
                such as payment processing (Stripe), cloud hosting, analytics, and customer support. These providers 
                are contractually obligated to protect your information and use it only for the purposes we specify.
              </p>

              <h3 className="text-xl font-semibold mb-3 mt-6">4.2 Social Media Platforms</h3>
              <p className="text-muted-foreground leading-relaxed">
                When you connect your social media accounts, we interact with Facebook, Instagram, and WhatsApp 
                on your behalf to provide our services. This is done using the access tokens you authorize through 
                OAuth. We do not share your information with these platforms beyond what is necessary to provide our services.
              </p>

              <h3 className="text-xl font-semibold mb-3 mt-6">4.3 Legal Requirements</h3>
              <p className="text-muted-foreground leading-relaxed">
                We may disclose your information if required by law, court order, or governmental authority, 
                or to protect our rights, property, or safety, or that of our users or others.
              </p>

              <h3 className="text-xl font-semibold mb-3 mt-6">4.4 Business Transfers</h3>
              <p className="text-muted-foreground leading-relaxed">
                In the event of a merger, acquisition, or sale of assets, your information may be transferred 
                as part of that transaction, subject to the same privacy protections.
              </p>
            </section>

            {/* Data Security */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Data Security</h2>
              <p className="text-muted-foreground leading-relaxed">
                We implement industry-standard security measures to protect your information, including:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mt-4">
                <li>Encryption of data in transit using SSL/TLS</li>
                <li>Encryption of sensitive data at rest (access tokens, passwords)</li>
                <li>Secure authentication and authorization mechanisms</li>
                <li>Regular security assessments and updates</li>
                <li>Access controls and employee training on data protection</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                However, no method of transmission over the Internet or electronic storage is 100% secure. 
                While we strive to use commercially acceptable means to protect your information, we cannot 
                guarantee absolute security.
              </p>
            </section>

            {/* Your Rights */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Your Privacy Rights</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Depending on your location, you may have the following rights regarding your personal information:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li><strong>Access:</strong> Request access to your personal information</li>
                <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
                <li><strong>Deletion:</strong> Request deletion of your personal information</li>
                <li><strong>Portability:</strong> Request transfer of your data to another service</li>
                <li><strong>Objection:</strong> Object to processing of your personal information</li>
                <li><strong>Restriction:</strong> Request restriction of processing</li>
                <li><strong>Withdraw Consent:</strong> Withdraw consent where processing is based on consent</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                To exercise these rights, please contact us using the information provided in the "Contact Us" section below.
              </p>
            </section>

            {/* Cookies */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Cookies and Tracking Technologies</h2>
              <p className="text-muted-foreground leading-relaxed">
                We use cookies and similar tracking technologies to track activity on our Service and store certain 
                information. Cookies are small files stored on your device. You can instruct your browser to refuse 
                all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, 
                you may not be able to use some portions of our Service.
              </p>
            </section>

            {/* Data Retention */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Data Retention</h2>
              <p className="text-muted-foreground leading-relaxed">
                We retain your personal information for as long as necessary to provide our services, comply with 
                legal obligations, resolve disputes, and enforce our agreements. When you delete your account, we 
                will delete or anonymize your personal information, except where we are required to retain it for 
                legal or legitimate business purposes.
              </p>
            </section>

            {/* Third-Party Links */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">9. Third-Party Links</h2>
              <p className="text-muted-foreground leading-relaxed">
                Our Service may contain links to third-party websites or services. We are not responsible for the 
                privacy practices of these third parties. We encourage you to review their privacy policies when 
                you visit their websites or use their services.
              </p>
            </section>

            {/* Children's Privacy */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">10. Children's Privacy</h2>
              <p className="text-muted-foreground leading-relaxed">
                Our Service is not intended for individuals under the age of 18. We do not knowingly collect 
                personal information from children under 18. If you become aware that a child has provided us 
                with personal information, please contact us, and we will take steps to delete such information.
              </p>
            </section>

            {/* Changes to Policy */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">11. Changes to This Privacy Policy</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting 
                the new Privacy Policy on this page and updating the "Last updated" date. You are advised to review 
                this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when 
                they are posted on this page.
              </p>
            </section>

            {/* Contact */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">12. Contact Us</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                If you have any questions about this Privacy Policy or our privacy practices, please contact us:
              </p>
              <div className="bg-muted p-6 rounded-lg">
                <p className="font-semibold mb-2">CRM SaaS</p>
                <p className="text-muted-foreground">
                  Email: <a href="mailto:privacy@your-domain.com" className="text-primary hover:underline">privacy@your-domain.com</a><br />
                  Website: <Link to="/" className="text-primary hover:underline">https://your-domain.com</Link>
                </p>
                <p className="text-sm text-muted-foreground mt-4 italic">
                  Please update the email address and website URL above with your actual contact information for privacy inquiries.
                </p>
              </div>
            </section>

            {/* Compliance */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">13. Compliance with Regulations</h2>
              <p className="text-muted-foreground leading-relaxed">
                This Privacy Policy is designed to comply with applicable data protection laws, including but not 
                limited to the General Data Protection Regulation (GDPR) for European users, the California Consumer 
                Privacy Act (CCPA) for California residents, and other relevant privacy regulations. We are committed 
                to maintaining the highest standards of data protection and privacy.
              </p>
            </section>
          </div>

          {/* Back to Home */}
          <div className="mt-12 pt-8 border-t">
            <Link to="/">
              <Button variant="outline" className="w-full sm:w-auto">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

