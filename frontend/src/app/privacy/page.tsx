'use client';

import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Shield, Lock, Eye, Server, FileText, AlertCircle } from 'lucide-react';

const sections = [
  {
    id: 'overview',
    title: '1. Overview',
    content: `SRP AI Labs ("Company", "we", "us", "our") operates the SRP Education AI platform ("Platform"). This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Platform.

We are committed to protecting the privacy of students, teachers, parents, and institutional administrators. We adhere to data minimization principles and collect only what is necessary to provide and improve our services.`,
  },
  {
    id: 'information-collected',
    title: '2. Information We Collect',
    content: `We collect the following categories of information:

Personal Information (provided directly by you):
• Name, email address, and phone number during registration
• Institution name and role (for institutional users)
• Profile information (grade, board, subjects, preferred language)
• Payment information (processed securely via Razorpay/Stripe — we do not store card details)

Usage Data (collected automatically):
• Device information (browser type, operating system, device type)
• IP address and approximate geographic location
• Pages visited, features used, and time spent on the Platform
• Learning activity data (quizzes taken, scores, study time)

AI Interaction Data:
• Questions asked to the AI tutor
• Study materials uploaded for AI processing
• AI-generated content preferences and feedback

Institutional Data (for B2B users):
• Student enrollment data as provided by the institution
• Attendance records, grades, and academic performance data
• Administrative actions and configuration changes`,
  },
  {
    id: 'how-we-use',
    title: '3. How We Use Your Information',
    content: `We use collected information for the following purposes:

• Providing Services: To operate, maintain, and deliver the educational features of the Platform
• Personalization: To personalize your learning experience, including AI-generated study plans and content recommendations
• Analytics: To generate learning analytics, progress reports, and performance insights
• Communication: To send important updates, security alerts, billing notifications, and support responses
• Platform Improvement: To analyze usage patterns and improve the Platform's features and performance
• Security: To detect, prevent, and address technical issues, fraud, and security vulnerabilities
• Legal Compliance: To comply with applicable laws, regulations, and legal proceedings

We do NOT:
• Sell your personal data to third parties
• Use student data for advertising or marketing purposes
• Share personal data with unauthorized third parties
• Create student profiles for non-educational purposes`,
  },
  {
    id: 'data-security',
    title: '4. Data Security',
    content: `We implement comprehensive security measures to protect your data:

• Encryption: All data is encrypted in transit (TLS 1.3) and at rest (AES-256)
• Access Controls: Role-based access controls (RBAC) ensure users only access data they're authorized to see
• Audit Logging: Complete audit logs track all data access and modification events
• Infrastructure: Hosted on secure cloud infrastructure with regular security assessments
• Password Security: User passwords are hashed using Argon2id, the industry-leading password hashing algorithm
• Token Security: JWT-based authentication with short-lived access tokens (15 minutes) and secure refresh tokens (7 days)
• Rate Limiting: API rate limiting to prevent abuse and brute-force attacks
• Regular Backups: Automated daily backups with point-in-time recovery capabilities

No system is 100% secure. While we strive to protect your data, we cannot guarantee absolute security. We will promptly notify affected users in the event of a data breach.`,
  },
  {
    id: 'data-sharing',
    title: '5. Data Sharing & Disclosure',
    content: `We share your information only in the following circumstances:

• Institution Administrators: For B2B users, student and teacher data is accessible to authorized institution administrators as required for educational purposes
• Service Providers: We use select third-party services (hosting, payment processing, email delivery) that process data on our behalf under strict data processing agreements
• AI Processing: Your queries to the AI tutor are processed through AI model providers (e.g., OpenRouter). These queries are anonymized and not used to train third-party models
• Legal Requirements: We may disclose information if required by law, regulation, or legal process
• Business Transfer: In the event of a merger, acquisition, or asset sale, user data may be transferred. We will notify users of any such change

We do NOT share individual student learning data with other students, institutions they don't belong to, or unauthorized third parties.`,
  },
  {
    id: 'your-rights',
    title: '6. Your Rights',
    content: `You have the following rights regarding your personal data:

• Access: You can request a copy of the personal data we hold about you
• Correction: You can update or correct your personal data through your account settings or by contacting support
• Deletion: You can request deletion of your account and associated personal data. We will process deletion requests within 30 days
• Data Portability: You can request an export of your data in a machine-readable format
• Opt-Out: You can opt out of non-essential communications and analytics cookies
• Restriction: You can request that we restrict processing of your personal data in certain circumstances

For institutional users, data rights are managed in coordination with the institution administrator.

To exercise any of these rights, contact us at support@srpailabs.com.`,
  },
  {
    id: 'cookies',
    title: '7. Cookies & Tracking',
    content: `We use the following types of cookies:

Essential Cookies:
• Authentication tokens (required for login and session management)
• Security cookies (CSRF protection, rate limiting)
• User preference cookies (language, theme)

Analytics Cookies (optional):
• Usage analytics to understand how the Platform is used
• Performance monitoring to identify and fix issues

We do NOT use:
• Third-party advertising cookies
• Cross-site tracking cookies
• Social media tracking pixels

You can manage cookie preferences through your browser settings. Disabling essential cookies may impact Platform functionality.`,
  },
  {
    id: 'data-retention',
    title: '8. Data Retention',
    content: `We retain your data for as long as necessary to provide our services and fulfill the purposes outlined in this policy:

• Active Accounts: Data is retained while your account is active
• Deleted Accounts: Personal data is deleted within 30 days of account deletion. Anonymized analytics data may be retained
• Institutional Data: Retained for the duration of the institution's subscription plus 30 days for data export
• Backup Data: Retained for up to 90 days after deletion for disaster recovery purposes
• Legal Obligations: Some data may be retained longer if required by law or regulation`,
  },
  {
    id: 'children',
    title: '9. Children\'s Privacy & Student Safety',
    content: `Our Platform is designed for educational use, which includes use by minors. For users under 18:

• Institutional accounts are managed by the institution, which is responsible for obtaining necessary parental consents
• B2C student accounts for users under 18 require parental consent during registration
• We do not knowingly collect personal information from children under 13 without verifiable parental consent
• Parents and guardians can contact us to review, update, or delete their child's information
• All AI-generated content is filtered through multiple safety layers to ensure age-appropriate responses
• We do not display advertisements or promotional content to minor users
• Student data is never used for profiling, targeted marketing, or any non-educational purpose
• Our AI systems are programmed to refuse inappropriate, harmful, violent, or sexually explicit content requests
• We encourage parents and guardians to actively participate in their child's use of the Platform`,
  },
  {
    id: 'ai-data',
    title: '10. AI Interaction & Content Data',
    content: `When you interact with our AI features, the following applies:

Data Processing:
• Your questions and prompts are sent to AI model providers (via OpenRouter) for processing. These are transmitted securely over encrypted connections.
• We do NOT store your queries for training third-party AI models. Your educational queries remain private.
• AI-generated responses are stored in your account for your convenience (chat history, saved notes).

Content Safety:
• All AI inputs are filtered for prohibited content (violence, abuse, explicit material, self-harm).
• We maintain audit logs of AI interactions for safety monitoring and platform improvement.
• Content flagged by safety filters is logged and reviewed. Repeated violations may result in account suspension.

Current Affairs & News Content:
• Our current affairs module synthesises publicly available information. We do NOT reproduce or copy copyrighted newspaper articles.
• Facts and events are not copyrightable — our AI provides educational analysis and summaries in its own words.
• References to news sources are for educational citation only, consistent with fair dealing under the Indian Copyright Act, 1957 (Section 52).

What We Do NOT Do:
• We do NOT sell your learning data or AI interaction data to any third party
• We do NOT use your data for advertising, profiling, or non-educational purposes
• We do NOT share individual student queries with other users or institutions (except the student's own institution admin for B2B accounts)`,
  },
  {
    id: 'changes',
    title: '11. Changes to This Policy',
    content: `We may update this Privacy Policy from time to time. Changes will be communicated through:

• Email notification to your registered email address
• A prominent notice on the Platform
• Updated "Last Modified" date on this page

Material changes will be communicated at least 30 days before they take effect. Your continued use of the Platform after the effective date constitutes acceptance of the updated policy.`,
  },
  {
    id: 'contact',
    title: '12. Contact Us',
    content: `For privacy concerns, questions, or data requests, contact us:

• Email: support@srpailabs.com
• Website: srpailabs.com
• Response Time: Within 2 business days for privacy-related inquiries

For urgent privacy or security concerns, include "URGENT: Privacy" in your email subject line for expedited handling.`,
  },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-50/40 via-white to-white" />
        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-100/80 text-emerald-700 rounded-full text-sm font-semibold mb-6 border border-emerald-200/50">
            <Shield className="w-4 h-4" />
            Privacy
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-gray-500 text-sm">
            Last updated: {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </section>

      {/* Security highlights */}
      <section className="max-w-3xl mx-auto px-6 mb-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Lock, label: 'AES-256 Encryption', color: 'bg-brand-50 text-brand-600' },
            { icon: Shield, label: 'RBAC Controls', color: 'bg-emerald-50 text-emerald-600' },
            { icon: Eye, label: 'Full Audit Logs', color: 'bg-violet-50 text-violet-600' },
            { icon: Server, label: 'Secure Cloud', color: 'bg-amber-50 text-amber-600' },
          ].map((item) => (
            <div key={item.label} className="card-elevated text-center py-4">
              <div className={`w-10 h-10 ${item.color} rounded-xl flex items-center justify-center mx-auto mb-2`}>
                <item.icon className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-gray-700">{item.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Table of Contents */}
      <section className="max-w-3xl mx-auto px-6 mb-12">
        <div className="card-elevated">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-brand-600" />
            <h2 className="text-sm font-bold text-gray-900">Table of Contents</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {sections.map((s) => (
              <a key={s.id} href={`#${s.id}`} className="text-sm text-brand-600 hover:text-brand-700 hover:underline transition-colors">
                {s.title}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-6 pb-24">
        <div className="space-y-10">
          {sections.map((s) => (
            <section key={s.id} id={s.id} className="scroll-mt-24">
              <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">{s.title}</h2>
              <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{s.content}</div>
            </section>
          ))}
        </div>

        {/* Notice */}
        <div className="mt-16 p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-emerald-900">Your Privacy Matters</p>
              <p className="text-sm text-emerald-700 mt-1">
                We are committed to transparency and protecting your data. If you have any questions about our privacy practices,
                contact us at <a href="mailto:support@srpailabs.com" className="font-medium underline">support@srpailabs.com</a>.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
