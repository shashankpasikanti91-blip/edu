'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  Sparkles, Check, ArrowRight, Building2, GraduationCap,
  Shield, BarChart3, Users, Zap, Globe, HeadphonesIcon,
  ChevronDown, ChevronUp, Star, Clock, CreditCard, Puzzle,
  Menu, X, Mail, Phone,
} from 'lucide-react';

type BillingInterval = 'monthly' | 'yearly';

const navLinks = [
  { label: 'Features', href: '/#features' },
  { label: 'Solutions', href: '/#solutions' },
  { label: 'Analytics', href: '/#analytics' },
  { label: 'Academics', href: '/#academics' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

const studentPlans = [
  {
    name: 'Student Free',
    slug: 'student-free',
    price: 0,
    yearlyPrice: 0,
    description: 'Get started with basic learning tools',
    features: [
      'Basic dashboard',
      'Limited AI help',
      '3 quizzes/month',
      'Notes storage (100MB)',
      'Community support',
    ],
    cta: 'Start Free',
    href: '/signup',
    popular: false,
    badge: null,
  },
  {
    name: 'Student Pro',
    slug: 'student-pro',
    price: 149,
    yearlyPrice: 1490,
    description: 'Full-powered AI learning experience',
    features: [
      'Full AI tutor access',
      'Unlimited quizzes',
      'Smart study planner',
      'Revision tools',
      'Progress analytics',
      'Priority support',
      'Notes storage (1GB)',
    ],
    cta: 'Get Pro',
    href: '/signup?plan=student-pro',
    popular: true,
    badge: 'Most Popular',
  },
  {
    name: 'Career Premium',
    slug: 'career-premium',
    price: 399,
    yearlyPrice: 3990,
    description: 'IELTS, GRE, placement & career prep',
    features: [
      'Everything in Pro',
      'IELTS / GRE prep modules',
      'Resume AI builder',
      'Interview prep simulator',
      'Career mentoring tools',
      'Placement preparation',
      'Premium support',
      'Notes storage (5GB)',
    ],
    cta: 'Get Premium',
    href: '/signup?plan=career-premium',
    popular: false,
    badge: 'Career Ready',
  },
];

const institutionPlans = [
  {
    name: 'School Starter',
    slug: 'school-starter',
    price: 9999,
    yearlyPrice: 99990,
    users: 'Up to 300 users',
    description: 'Essential tools for growing schools',
    features: [
      'Institution dashboard',
      'Student & Teacher login',
      'Attendance tracking',
      'Notice board',
      'Basic reports',
      'Standard branded logo upload',
      'Email support',
    ],
    branding: ['Upload institution logo', 'Logo on login page + dashboard'],
    cta: 'Start Trial',
    href: '/signup?plan=school-starter',
    popular: false,
    badge: null,
  },
  {
    name: 'Campus Growth',
    slug: 'campus-growth',
    price: 24999,
    yearlyPrice: 249990,
    users: 'Up to 1,000 users',
    description: 'Scale with AI-powered learning tools',
    features: [
      'Everything in Starter',
      'AI learning tools',
      'Parent portal',
      'Advanced analytics',
      'Content library with approvals',
      'Priority support',
      'Custom institution logo',
      'Custom color branding',
      'Subdomain option',
    ],
    branding: ['Logo + brand color theme', 'Branded reports', 'Subdomain (schoolname.srpedu.ai)'],
    cta: 'Start Trial',
    href: '/signup?plan=campus-growth',
    popular: true,
    badge: 'Best Value',
  },
  {
    name: 'University Pro',
    slug: 'university-pro',
    price: 79999,
    yearlyPrice: 799990,
    users: 'Up to 5,000 users',
    description: 'Enterprise-grade for universities',
    features: [
      'Everything in Growth',
      'Multi-department access',
      'API integrations',
      'Multi-campus controls',
      'SSO ready',
      'Dedicated support',
      'Premium logo branding',
      'White-label dashboard',
      'Dedicated onboarding',
    ],
    branding: ['Full white-label option', 'Custom login page branding', 'PDF certificates with logo', 'Institution email templates'],
    cta: 'Start Trial',
    href: '/signup?plan=university-pro',
    popular: false,
    badge: 'Premium',
  },
  {
    name: 'Enterprise',
    slug: 'enterprise',
    price: -1,
    yearlyPrice: -1,
    users: 'Unlimited users',
    description: 'Custom solution for large organizations',
    features: [
      'Everything in University Pro',
      'Unlimited users & storage',
      'Custom integrations',
      'Dedicated account manager',
      'SLA guarantee',
      '24/7 phone support',
      'On-premise deployment option',
      'Custom contracts',
    ],
    branding: ['Complete white-label', 'Custom domain', 'Fully branded experience'],
    cta: 'Contact Sales',
    href: '/contact',
    popular: false,
    badge: 'Custom',
  },
];

const addOnModules = [
  { slug: 'ATTENDANCE', name: 'Attendance Tracker', monthlyPrice: 499, yearlyPrice: 4999, description: 'Digital attendance with reports' },
  { slug: 'BILLING_FINANCE', name: 'Billing & Finance', monthlyPrice: 999, yearlyPrice: 9999, description: 'Fee management, invoicing, receipts' },
  { slug: 'PARENT_PORTAL', name: 'Parent Portal', monthlyPrice: 299, yearlyPrice: 2999, description: 'Parent access to student data' },
  { slug: 'TRANSPORT', name: 'Transport Manager', monthlyPrice: 399, yearlyPrice: 3999, description: 'Route management, tracking' },
  { slug: 'FEE_REMINDER', name: 'Fee Reminder', monthlyPrice: 199, yearlyPrice: 1999, description: 'Automated fee notifications' },
  { slug: 'WHATSAPP', name: 'WhatsApp Integration', monthlyPrice: 599, yearlyPrice: 5999, description: 'WhatsApp messaging and alerts' },
  { slug: 'LMS', name: 'LMS Module', monthlyPrice: 799, yearlyPrice: 7999, description: 'Full learning management system' },
  { slug: 'AI_ANALYTICS', name: 'AI Analytics', monthlyPrice: 699, yearlyPrice: 6999, description: 'AI-powered institutional insights' },
];

const comparisonFeatures = [
  { category: 'Core', features: [
    { name: 'AI Tutor', free: 'Limited', pro: 'Full', career: 'Full', starter: 'Basic', growth: '✓', university: '✓', enterprise: '✓' },
    { name: 'Quizzes', free: '3/mo', pro: 'Unlimited', career: 'Unlimited', starter: 'Unlimited', growth: 'Unlimited', university: 'Unlimited', enterprise: 'Unlimited' },
    { name: 'Study Planner', free: '—', pro: '✓', career: '✓', starter: '—', growth: '✓', university: '✓', enterprise: '✓' },
    { name: 'Analytics', free: 'Basic', pro: 'Advanced', career: 'Advanced', starter: 'Basic', growth: 'Advanced', university: 'Advanced', enterprise: 'Custom' },
  ]},
  { category: 'Institution', features: [
    { name: 'Multi-user Management', free: '—', pro: '—', career: '—', starter: '300', growth: '1,000', university: '5,000', enterprise: 'Unlimited' },
    { name: 'Parent Portal', free: '—', pro: '—', career: '—', starter: '—', growth: '✓', university: '✓', enterprise: '✓' },
    { name: 'Attendance', free: '—', pro: '—', career: '—', starter: '✓', growth: '✓', university: '✓', enterprise: '✓' },
    { name: 'SSO', free: '—', pro: '—', career: '—', starter: '—', growth: '—', university: '✓', enterprise: '✓' },
  ]},
  { category: 'Branding', features: [
    { name: 'Logo Upload', free: '—', pro: '—', career: '—', starter: '✓', growth: '✓', university: '✓', enterprise: '✓' },
    { name: 'Custom Colors', free: '—', pro: '—', career: '—', starter: '—', growth: '✓', university: '✓', enterprise: '✓' },
    { name: 'Subdomain', free: '—', pro: '—', career: '—', starter: '—', growth: '✓', university: '✓', enterprise: '✓' },
    { name: 'White-label', free: '—', pro: '—', career: '—', starter: '—', growth: '—', university: '✓', enterprise: '✓' },
  ]},
  { category: 'Support', features: [
    { name: 'Email Support', free: '✓', pro: '✓', career: '✓', starter: '✓', growth: '✓', university: '✓', enterprise: '✓' },
    { name: 'Priority Support', free: '—', pro: '✓', career: '✓', starter: '—', growth: '✓', university: '✓', enterprise: '✓' },
    { name: 'Dedicated Support', free: '—', pro: '—', career: '—', starter: '—', growth: '—', university: '✓', enterprise: '✓' },
    { name: '24/7 Phone', free: '—', pro: '—', career: '—', starter: '—', growth: '—', university: '—', enterprise: '✓' },
  ]},
];

const faqs = [
  {
    q: 'Can I switch plans later?',
    a: 'Yes! You can upgrade or downgrade at any time. When upgrading, you only pay the prorated difference. Downgrade takes effect at the end of your billing cycle.',
  },
  {
    q: 'Is there a free trial for institutions?',
    a: 'Yes, all institution plans include a 14-day free trial with full access. No credit card required.',
  },
  {
    q: 'Do you support GST invoicing?',
    a: 'Absolutely. All payments include GST-compliant invoices with your GSTIN. Invoices are auto-generated and available in your billing dashboard.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept UPI, credit/debit cards, net banking, and wallets via Razorpay for India. International payments are processed via Stripe.',
  },
  {
    q: 'What happens when my subscription expires?',
    a: 'We send reminders at 30, 15, 7, and 3 days before expiry. After expiry, premium features are paused but your data is safe. Renew anytime to restore access.',
  },
  {
    q: 'Can I get a refund?',
    a: 'We offer a 7-day money-back guarantee for first-time subscribers. Contact support for refund requests.',
  },
  {
    q: 'Is student data secure?',
    a: 'Yes. We use industry-standard encryption, role-based access controls, complete audit logs, and regular backups. No fake analytics, no misleading data — ever.',
  },
  {
    q: 'Do you offer discounts for annual billing?',
    a: 'Yes! Annual billing saves you 2 months — that\'s effectively ~17% off compared to monthly billing.',
  },
];

function formatPrice(price: number): string {
  if (price === -1) return 'Custom';
  if (price === 0) return '0';
  return price.toLocaleString('en-IN');
}

export default function PricingPage() {
  const [billing, setBilling] = useState<BillingInterval>('monthly');
  const [showComparison, setShowComparison] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50 via-white to-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-gray-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-600 to-violet-600 flex items-center justify-center shadow-md">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight">
                SRP <span className="gradient-text">Education AI</span>
              </span>
            </Link>

            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link key={link.label} href={link.href} className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${link.label === 'Pricing' ? 'text-brand-600' : 'text-gray-600 hover:text-brand-600'}`}>
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="hidden lg:flex items-center gap-3">
              <Link href="/login" className="text-sm font-medium text-gray-700 hover:text-brand-600 transition-colors">Log in</Link>
              <Link href="/signup" className="btn-primary text-sm !py-2 !px-5">
                Get Started Free <ArrowRight className="w-4 h-4 ml-1 inline" />
              </Link>
            </div>

            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden p-2 rounded-lg hover:bg-gray-100">
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200/60 bg-white/95 backdrop-blur-xl">
            <div className="px-4 py-4 space-y-1">
              {navLinks.map((link) => (
                <Link key={link.label} href={link.href} className="block px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-brand-50 hover:text-brand-600 rounded-lg" onClick={() => setMobileMenuOpen(false)}>
                  {link.label}
                </Link>
              ))}
              <div className="pt-3 border-t border-gray-100 space-y-2">
                <Link href="/login" className="block text-center py-2.5 text-sm font-medium text-gray-700">Log in</Link>
                <Link href="/signup" className="block text-center btn-primary text-sm">Get Started Free</Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="relative px-6 pt-32 pb-12 max-w-7xl mx-auto text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-50/60 via-white to-white -z-10" />
        <div className="absolute top-20 left-1/3 w-72 h-72 bg-violet-200/20 rounded-full blur-3xl -z-10" />
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-100/80 text-brand-700 rounded-full text-sm font-semibold mb-6 border border-brand-200/50">
          <Sparkles className="w-4 h-4" />
          Transparent Pricing
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-4 tracking-tight">
          Flexible plans for every
          <br className="hidden md:block" />
          <span className="gradient-text">learner and institution</span>
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8">
          From single students to large universities — choose a secure AI-powered education platform that grows with you.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
          <Link href="/signup" className="btn-primary px-8 py-3 text-base">
            Start Free Trial <ArrowRight className="w-4 h-4 ml-2 inline" />
          </Link>
          <Link href="/contact" className="btn-secondary px-8 py-3 text-base">
            Book Demo
          </Link>
          <button
            onClick={() => setShowComparison(true)}
            className="text-brand-600 font-medium hover:text-brand-700 transition-colors"
          >
            Compare Plans →
          </button>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="px-6 py-6 max-w-5xl mx-auto">
        <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-gray-500">
          <div className="flex items-center gap-2"><Shield className="w-4 h-4" /> Secure & Encrypted</div>
          <div className="flex items-center gap-2"><Users className="w-4 h-4" /> Built for Schools</div>
          <div className="flex items-center gap-2"><BarChart3 className="w-4 h-4" /> Real Analytics</div>
          <div className="flex items-center gap-2"><Clock className="w-4 h-4" /> High Availability</div>
          <div className="flex items-center gap-2"><CreditCard className="w-4 h-4" /> GST Invoicing</div>
        </div>
      </section>

      {/* Billing Toggle */}
      <section className="px-6 pb-4 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center bg-gray-100 rounded-xl p-1">
          <button
            onClick={() => setBilling('monthly')}
            className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
              billing === 'monthly'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBilling('yearly')}
            className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
              billing === 'yearly'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Yearly
            <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
              Save 2 months
            </span>
          </button>
        </div>
      </section>

      {/* Student Plans */}
      <section className="px-6 pt-12 pb-16 max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-brand-100 text-brand-700 text-sm font-medium px-4 py-1.5 rounded-full mb-4">
            <GraduationCap className="w-4 h-4" /> For Individual Learners
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Student Plans</h2>
          <p className="text-gray-600">Affordable AI-powered learning for every student</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {studentPlans.map((plan) => {
            const price = billing === 'yearly' ? plan.yearlyPrice : plan.price;
            return (
              <div
                key={plan.slug}
                className={`relative rounded-2xl p-8 transition-all duration-200 ${
                  plan.popular
                    ? 'bg-brand-600 text-white ring-4 ring-brand-200 scale-[1.03] shadow-elevated'
                    : 'bg-white border border-gray-200 hover:shadow-elevated hover:border-brand-200'
                }`}
              >
                {plan.badge && (
                  <span className={`absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold px-4 py-1 rounded-full ${
                    plan.popular ? 'bg-white text-brand-600' : 'bg-brand-100 text-brand-700'
                  }`}>
                    {plan.badge}
                  </span>
                )}
                <h3 className={`text-xl font-bold ${plan.popular ? 'text-white' : 'text-gray-900'}`}>
                  {plan.name}
                </h3>
                <p className={`text-sm mt-1 ${plan.popular ? 'text-brand-100' : 'text-gray-500'}`}>
                  {plan.description}
                </p>
                <div className="mt-6 mb-8">
                  <span className={`text-4xl font-bold ${plan.popular ? 'text-white' : 'text-gray-900'}`}>
                    ₹{formatPrice(price)}
                  </span>
                  <span className={`text-sm ml-1 ${plan.popular ? 'text-brand-200' : 'text-gray-500'}`}>
                    {price === 0 ? '/forever' : billing === 'yearly' ? '/year' : '/month'}
                  </span>
                  {billing === 'yearly' && plan.price > 0 && (
                    <div className={`text-xs mt-1 ${plan.popular ? 'text-brand-200' : 'text-gray-400'}`}>
                      ₹{Math.round(plan.yearlyPrice / 12).toLocaleString('en-IN')}/mo billed annually
                    </div>
                  )}
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${plan.popular ? 'text-brand-200' : 'text-green-500'}`} />
                      <span className={plan.popular ? 'text-brand-50' : 'text-gray-600'}>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={plan.href}
                  className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium text-sm transition-colors ${
                    plan.popular
                      ? 'bg-white text-brand-600 hover:bg-brand-50'
                      : 'bg-brand-600 text-white hover:bg-brand-700'
                  }`}
                >
                  {plan.cta}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* Institution Plans */}
      <section className="px-6 py-16 max-w-7xl mx-auto bg-surface-tertiary rounded-3xl">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-brand-100 text-brand-700 text-sm font-medium px-4 py-1.5 rounded-full mb-4">
            <Building2 className="w-4 h-4" /> For Institutions
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Institution Plans</h2>
          <p className="text-gray-600">Modern AI infrastructure for growing institutions</p>
        </div>

        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {institutionPlans.map((plan) => {
            const price = billing === 'yearly' ? plan.yearlyPrice : plan.price;
            return (
              <div
                key={plan.slug}
                className={`relative rounded-2xl p-6 transition-all duration-200 ${
                  plan.popular
                    ? 'bg-brand-600 text-white ring-4 ring-brand-200 shadow-elevated'
                    : 'bg-white border border-gray-200 hover:shadow-elevated hover:border-brand-200'
                }`}
              >
                {plan.badge && (
                  <span className={`absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold px-4 py-1 rounded-full whitespace-nowrap ${
                    plan.popular ? 'bg-white text-brand-600' : 'bg-brand-100 text-brand-700'
                  }`}>
                    {plan.badge}
                  </span>
                )}
                <h3 className={`text-lg font-bold ${plan.popular ? 'text-white' : 'text-gray-900'}`}>
                  {plan.name}
                </h3>
                <p className={`text-xs mt-1 font-medium ${plan.popular ? 'text-brand-200' : 'text-brand-600'}`}>
                  {plan.users}
                </p>
                <p className={`text-xs mt-1 ${plan.popular ? 'text-brand-100' : 'text-gray-500'}`}>
                  {plan.description}
                </p>
                <div className="mt-4 mb-6">
                  {price === -1 ? (
                    <span className={`text-3xl font-bold ${plan.popular ? 'text-white' : 'text-gray-900'}`}>
                      Custom
                    </span>
                  ) : (
                    <>
                      <span className={`text-3xl font-bold ${plan.popular ? 'text-white' : 'text-gray-900'}`}>
                        ₹{formatPrice(price)}
                      </span>
                      <span className={`text-sm ml-1 ${plan.popular ? 'text-brand-200' : 'text-gray-500'}`}>
                        {billing === 'yearly' ? '/year' : '/month'}
                      </span>
                      {billing === 'yearly' && (
                        <div className={`text-xs mt-1 ${plan.popular ? 'text-brand-200' : 'text-gray-400'}`}>
                          ₹{Math.round(plan.yearlyPrice / 12).toLocaleString('en-IN')}/mo billed annually
                        </div>
                      )}
                    </>
                  )}
                </div>
                <ul className="space-y-2 mb-4">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-xs">
                      <Check className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${plan.popular ? 'text-brand-200' : 'text-green-500'}`} />
                      <span className={plan.popular ? 'text-brand-50' : 'text-gray-600'}>{f}</span>
                    </li>
                  ))}
                </ul>

                {/* Branding features */}
                <div className={`border-t pt-3 mb-6 ${plan.popular ? 'border-brand-500' : 'border-gray-100'}`}>
                  <p className={`text-xs font-semibold mb-2 ${plan.popular ? 'text-brand-200' : 'text-gray-900'}`}>
                    Branding Includes:
                  </p>
                  <ul className="space-y-1.5">
                    {plan.branding.map((b) => (
                      <li key={b} className="flex items-start gap-2 text-xs">
                        <Star className={`w-3 h-3 mt-0.5 flex-shrink-0 ${plan.popular ? 'text-yellow-300' : 'text-yellow-500'}`} />
                        <span className={plan.popular ? 'text-brand-100' : 'text-gray-500'}>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  href={plan.href}
                  className={`w-full flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-medium text-sm transition-colors ${
                    plan.popular
                      ? 'bg-white text-brand-600 hover:bg-brand-50'
                      : 'bg-brand-600 text-white hover:bg-brand-700'
                  }`}
                >
                  {plan.cta}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* Add-On Modules */}
      <section className="px-6 py-16 max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-brand-100 text-brand-700 text-sm font-medium px-4 py-1.5 rounded-full mb-4">
            <Puzzle className="w-4 h-4" /> Modular Add-Ons
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Extend Your Platform</h2>
          <p className="text-gray-600">Add powerful modules to any institution plan. 14-day free trial on each.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {addOnModules.map((mod) => {
            const price = billing === 'yearly' ? mod.yearlyPrice : mod.monthlyPrice;
            return (
              <div key={mod.slug} className="card p-5 hover:shadow-elevated transition-all">
                <h3 className="text-base font-semibold text-gray-900 mb-1">{mod.name}</h3>
                <p className="text-xs text-gray-500 mb-3">{mod.description}</p>
                <div className="mb-4">
                  <span className="text-2xl font-bold text-gray-900">₹{price.toLocaleString('en-IN')}</span>
                  <span className="text-xs text-gray-500 ml-1">{billing === 'yearly' ? '/year' : '/month'}</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <Check className="w-3.5 h-3.5" /> 14-day free trial
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="px-6 py-16 max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Compare All Features</h2>
          <p className="text-gray-600">See exactly what you get with each plan</p>
          <button
            onClick={() => setShowComparison(!showComparison)}
            className="mt-4 inline-flex items-center gap-2 text-brand-600 font-medium hover:text-brand-700"
          >
            {showComparison ? 'Hide' : 'Show'} comparison table
            {showComparison ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {showComparison && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 min-w-[200px]">Feature</th>
                  <th className="text-center py-3 px-3 font-semibold text-gray-600 min-w-[80px]">Free</th>
                  <th className="text-center py-3 px-3 font-semibold text-gray-600 min-w-[80px]">Pro</th>
                  <th className="text-center py-3 px-3 font-semibold text-gray-600 min-w-[80px]">Career</th>
                  <th className="text-center py-3 px-3 font-semibold text-gray-600 min-w-[80px]">Starter</th>
                  <th className="text-center py-3 px-3 font-semibold text-brand-600 min-w-[80px]">Growth</th>
                  <th className="text-center py-3 px-3 font-semibold text-gray-600 min-w-[80px]">Univ.</th>
                  <th className="text-center py-3 px-3 font-semibold text-gray-600 min-w-[80px]">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {comparisonFeatures.map((group) => (
                  <>
                    <tr key={group.category}>
                      <td colSpan={8} className="py-3 px-4 font-semibold text-gray-900 bg-gray-50">
                        {group.category}
                      </td>
                    </tr>
                    {group.features.map((feature) => (
                      <tr key={feature.name} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-2.5 px-4 text-gray-700">{feature.name}</td>
                        <td className="text-center py-2.5 px-3 text-gray-500">{feature.free}</td>
                        <td className="text-center py-2.5 px-3 text-gray-500">{feature.pro}</td>
                        <td className="text-center py-2.5 px-3 text-gray-500">{feature.career}</td>
                        <td className="text-center py-2.5 px-3 text-gray-500">{feature.starter}</td>
                        <td className="text-center py-2.5 px-3 text-brand-600 font-medium">{feature.growth}</td>
                        <td className="text-center py-2.5 px-3 text-gray-500">{feature.university}</td>
                        <td className="text-center py-2.5 px-3 text-gray-500">{feature.enterprise}</td>
                      </tr>
                    ))}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Why Choose Us */}
      <section className="px-6 py-16 max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Why Choose SRP Education AI?</h2>
          <p className="text-gray-600">Built for the Indian education ecosystem</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {[
            {
              icon: Shield,
              title: 'No Fake Data — Ever',
              desc: 'No fake analytics, no fake attendance, no fake progress bars. Every metric is real and auditable.',
            },
            {
              icon: Globe,
              title: 'Built for India',
              desc: 'Razorpay payments, GST invoicing, INR pricing, and designed for Indian schools, colleges, and universities.',
            },
            {
              icon: Zap,
              title: 'AI That Actually Helps',
              desc: 'No misleading AI answers. Our AI tutor provides accurate, curriculum-aligned responses with source references.',
            },
            {
              icon: CreditCard,
              title: 'Transparent Billing',
              desc: 'No hidden charges. Clear pricing, GST invoices, usage dashboards, and proactive renewal reminders.',
            },
            {
              icon: HeadphonesIcon,
              title: 'Real Support',
              desc: 'Dedicated support for institutions. Priority response for paid plans. No chatbot runaround.',
            },
            {
              icon: BarChart3,
              title: 'Audit-Ready',
              desc: 'Complete audit logs, data backups, and compliance-ready infrastructure for institutional requirements.',
            },
          ].map((item) => (
            <div key={item.title} className="card p-6">
              <item.icon className="w-8 h-8 text-brand-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-sm text-gray-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="px-6 py-16 max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-10">Frequently Asked Questions</h2>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="card p-0 overflow-hidden">
              <button
                onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors"
              >
                <span className="font-medium text-gray-900 pr-4">{faq.q}</span>
                {expandedFaq === i ? (
                  <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                )}
              </button>
              {expandedFaq === i && (
                <div className="px-5 pb-5 text-sm text-gray-600 border-t border-gray-100 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Billing / GST Info */}
      <section className="px-6 py-12 max-w-5xl mx-auto">
        <div className="bg-brand-50 rounded-2xl p-8 text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-3">Billing & Payment Information</h3>
          <div className="grid md:grid-cols-3 gap-6 text-sm text-gray-600 mt-6">
            <div>
              <p className="font-semibold text-gray-900 mb-1">Payment Methods</p>
              <p>UPI, Cards, Net Banking, Wallets (India via Razorpay). International via Stripe.</p>
            </div>
            <div>
              <p className="font-semibold text-gray-900 mb-1">GST Compliant</p>
              <p>18% GST applicable. GSTIN on all invoices. Auto-generated tax invoices for every payment.</p>
            </div>
            <div>
              <p className="font-semibold text-gray-900 mb-1">Secure & Transparent</p>
              <p>No hidden charges. Cancel anytime. Data backups included. Full payment history in dashboard.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="px-6 py-16 max-w-7xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Ready to Transform Your Learning Experience?
        </h2>
        <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
          Join institutions across India using SRP Education AI to deliver modern, AI-powered education.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link href="/signup" className="btn-primary px-8 py-3 text-base">
            Start Free Trial <ArrowRight className="w-4 h-4 ml-2 inline" />
          </Link>
          <Link href="/contact" className="btn-secondary px-8 py-3 text-base">
            Book a Demo
          </Link>
        </div>
        <p className="text-xs text-gray-400 mt-4">
          No credit card required for free trial. Cancel anytime.
        </p>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <Link href="/" className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-violet-500 flex items-center justify-center">
                  <GraduationCap className="w-4 h-4 text-white" />
                </div>
                <span className="text-white font-bold text-sm">SRP Education AI</span>
              </Link>
              <p className="text-sm text-gray-500 mb-4">AI-powered education platform for students and institutions across every academic stream.</p>
              <div className="flex items-center gap-3">
                <a href="mailto:support@srpailabs.com" className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center hover:bg-gray-700 transition-colors">
                  <Mail className="w-4 h-4" />
                </a>
                <a href="tel:+919876543210" className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center hover:bg-gray-700 transition-colors">
                  <Phone className="w-4 h-4" />
                </a>
              </div>
            </div>
            <div>
              <h4 className="text-white text-sm font-semibold mb-4">Product</h4>
              <ul className="space-y-2.5 text-sm">
                <li><Link href="/#features" className="text-gray-500 hover:text-white transition-colors">Features</Link></li>
                <li><Link href="/pricing" className="text-gray-500 hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="/#analytics" className="text-gray-500 hover:text-white transition-colors">Analytics</Link></li>
                <li><Link href="/#academics" className="text-gray-500 hover:text-white transition-colors">Exam Prep</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white text-sm font-semibold mb-4">Solutions</h4>
              <ul className="space-y-2.5 text-sm">
                <li><Link href="/#solutions" className="text-gray-500 hover:text-white transition-colors">For Students</Link></li>
                <li><Link href="/#solutions" className="text-gray-500 hover:text-white transition-colors">For Institutions</Link></li>
                <li><Link href="/#solutions" className="text-gray-500 hover:text-white transition-colors">For Teachers</Link></li>
                <li><Link href="/contact" className="text-gray-500 hover:text-white transition-colors">Enterprise</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white text-sm font-semibold mb-4">Company</h4>
              <ul className="space-y-2.5 text-sm">
                <li><Link href="/about" className="text-gray-500 hover:text-white transition-colors">About Us</Link></li>
                <li><Link href="/contact" className="text-gray-500 hover:text-white transition-colors">Contact</Link></li>
                <li><Link href="/privacy" className="text-gray-500 hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="text-gray-500 hover:text-white transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white text-sm font-semibold mb-4">Support</h4>
              <ul className="space-y-2.5 text-sm">
                <li><Link href="/contact" className="text-gray-500 hover:text-white transition-colors">Help Center</Link></li>
                <li><a href="mailto:support@srpailabs.com" className="text-gray-500 hover:text-white transition-colors">support@srpailabs.com</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-600">&copy; {new Date().getFullYear()} SRP AI Labs. All rights reserved.</p>
            <div className="flex items-center gap-6 text-xs text-gray-600">
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
              <Link href="/contact" className="hover:text-white transition-colors">Support</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
