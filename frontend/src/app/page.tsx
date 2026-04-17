'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Brain,
  Building2,
  Calendar,
  Check,
  CheckCircle,
  ChevronRight,
  Clock,
  FileText,
  Globe,
  GraduationCap,
  Layers,
  Library,
  LineChart,
  Lock,
  Mail,
  Menu,
  Phone,
  PieChart,
  Rocket,
  School,
  Shield,
  ShieldCheck,
  Sparkles,
  Star,
  Stethoscope,
  Target,
  TrendingUp,
  Trophy,
  Users,
  X,
  Zap,
} from 'lucide-react';

/* ---- DATA ---- */

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'Solutions', href: '#solutions' },
  { label: 'Analytics', href: '#analytics' },
  { label: 'Academics', href: '#academics' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

const capabilities = [
  { icon: Brain, title: 'AI Study Assistant', desc: 'Context-aware tutoring powered by advanced AI models. Get instant explanations, step-by-step solutions, and personalized guidance.' },
  { icon: Target, title: 'Smart Exam Prep', desc: 'Adaptive question banks with difficulty scaling. Practice with real exam patterns across NEET, JEE, GATE, CA, and more.' },
  { icon: BarChart3, title: 'Learning Analytics', desc: 'Deep performance insights with topic-wise breakdowns, time tracking, and predictive scoring to optimize study outcomes.' },
  { icon: Calendar, title: 'AI Study Planner', desc: 'Personalized study schedules that adapt to your pace, deadlines, and weak areas -- powered by learning science.' },
  { icon: FileText, title: 'Notes & Resources', desc: 'Upload, organize, and AI-summarize study materials. Smart search across your entire knowledge base instantly.' },
  { icon: Users, title: 'Multi-Tenant Platform', desc: 'White-label ready for institutions. Custom branding, sub-user management, and centralized admin controls.' },
  { icon: Shield, title: 'Enterprise Security', desc: 'Role-based access, audit logging, data encryption at rest and in transit. SOC 2 aligned practices.' },
  { icon: Globe, title: 'Multi-Language Support', desc: 'Study in your preferred language with seamless translation and cross-language content delivery.' },
  { icon: Layers, title: 'Add-on Marketplace', desc: 'Extend with specialized modules -- advanced analytics, premium content packs, extra AI credits, and more.' },
  { icon: Rocket, title: 'Real-time Collaboration', desc: 'Teachers can assign content, track progress, create assessments, and communicate -- all in one platform.' },
];

const studentBenefits = [
  'AI-powered personalized study plans',
  'Exam prep for NEET, JEE, GATE, CA, NExT & more',
  'Smart flashcards & adaptive quizzes',
  'Performance analytics with weak-area detection',
  'Multi-language content support',
  'Upload & AI-summarize your notes',
];

const institutionBenefits = [
  'White-label branding with custom domain',
  'Centralized student & teacher management',
  'Role-based access control (RBAC)',
  'Institution-wide analytics dashboard',
  'Bulk user onboarding & management',
  'Custom content publishing & delivery',
];

const analyticsFeatures = [
  { label: 'Student Performance', value: '94%', sub: 'accuracy tracking', icon: TrendingUp, color: 'from-brand-500 to-violet-500' },
  { label: 'Topic Mastery', value: '847', sub: 'topics analyzed', icon: PieChart, color: 'from-cyan-500 to-brand-500' },
  { label: 'Study Hours', value: '12.4K', sub: 'hours this month', icon: Clock, color: 'from-emerald-500 to-cyan-500' },
  { label: 'Active Learners', value: '2,340', sub: 'across institutions', icon: Users, color: 'from-violet-500 to-rose-500' },
];

const analyticsPanelRows = [
  { subject: 'Physics -- Mechanics', score: 87, trend: '+12%', bar: 'w-[87%]' },
  { subject: 'Chemistry -- Organic', score: 72, trend: '+8%', bar: 'w-[72%]' },
  { subject: 'Mathematics -- Calculus', score: 94, trend: '+5%', bar: 'w-[94%]' },
  { subject: 'Biology -- Genetics', score: 68, trend: '+15%', bar: 'w-[68%]' },
];

const academicStreams = [
  { icon: School, title: 'School (K-12)', desc: 'CBSE, ICSE, State Boards' },
  { icon: Rocket, title: 'Engineering', desc: 'JEE Main/Advanced, GATE, ESE' },
  { icon: Stethoscope, title: 'Medical', desc: 'NEET UG/PG, NExT, FMGE' },
  { icon: Library, title: 'Nursing & Pharmacy', desc: 'NORCET, GPAT, RGUHS' },
  { icon: BookOpen, title: 'Commerce & CA', desc: 'CA Foundation/Inter/Final, CMA' },
  { icon: GraduationCap, title: 'University Exams', desc: 'Semester, Internal, Competitive' },
  { icon: Trophy, title: 'Competitive Exams', desc: 'UPSC, SSC, Banking, Railways' },
  { icon: Globe, title: 'Global Curricula', desc: 'IB, Cambridge, AP, SAT, GRE' },
];

const trustStats = [
  { value: '50+', label: 'Institutions' },
  { value: '25,000+', label: 'Active Learners' },
  { value: '1.2M+', label: 'Questions Practiced' },
  { value: '98%', label: 'Uptime SLA' },
];

const testimonials = [
  { name: 'Dr. Priya Sharma', role: 'Dean, ABC Medical College', text: 'SRP Education AI transformed how our students prepare for NExT. The analytics give us visibility we never had before.', avatar: 'PS' },
  { name: 'Rahul Verma', role: 'JEE Advanced -- AIR 342', text: 'The AI study planner and adaptive exam prep helped me focus on exactly what I needed. Game changer for my preparation.', avatar: 'RV' },
  { name: 'Prof. Anita Desai', role: 'HOD, Engineering Dept', text: 'White-label deployment was seamless. Our institution now has its own branded platform with full analytics.', avatar: 'AD' },
];

const footerLinks: Record<string, { label: string; href: string }[]> = {
  Product: [
    { label: 'Features', href: '#features' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Analytics', href: '#analytics' },
    { label: 'Exam Prep', href: '#academics' },
    { label: 'AI Assistant', href: '#features' },
    { label: 'Study Planner', href: '#features' },
  ],
  Solutions: [
    { label: 'For Students', href: '#solutions' },
    { label: 'For Institutions', href: '#solutions' },
    { label: 'For Teachers', href: '#solutions' },
    { label: 'Enterprise', href: '#enterprise' },
    { label: 'White Label', href: '#enterprise' },
    { label: 'API Access', href: '/contact' },
  ],
  Resources: [
    { label: 'Documentation', href: '/about' },
    { label: 'Blog', href: '/about' },
    { label: 'Help Center', href: '/contact' },
    { label: 'Status Page', href: '/contact' },
    { label: 'Community', href: '/about' },
    { label: 'Changelog', href: '/about' },
  ],
  Company: [
    { label: 'About Us', href: '/about' },
    { label: 'Contact', href: '/contact' },
    { label: 'Careers', href: '/about' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Security', href: '/about' },
  ],
};

/* ---- COMPONENTS ---- */

function GradientBlob({ className }: { className: string }) {
  return <div className={`absolute rounded-full blur-3xl opacity-20 pointer-events-none ${className}`} />;
}

function SectionBadge({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-sm font-medium mb-6">
      {children}
    </div>
  );
}

/* ---- PAGE ---- */

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden">

      {/* NAV */}
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
                <Link key={link.label} href={link.href} className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-brand-600 rounded-lg transition-colors">
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

      {/* HERO */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden">
        <GradientBlob className="w-[600px] h-[600px] bg-brand-400 -top-40 -right-40" />
        <GradientBlob className="w-[500px] h-[500px] bg-violet-400 -bottom-20 -left-32" />
        <GradientBlob className="w-[300px] h-[300px] bg-cyan-400 top-1/2 left-1/3" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-sm font-medium mb-8 animate-fade-in">
              <Sparkles className="w-4 h-4" />
              AI-Powered Education Platform for India &amp; Beyond
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] mb-6 animate-fade-in">
              Transform Learning with{' '}
              <span className="gradient-text">Intelligent</span>{' '}
              Study Tools &amp;{' '}
              <span className="gradient-text">Deep Analytics</span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in">
              Personalized AI tutoring, adaptive exam preparation, and institution-grade analytics --
              built for students, teachers, and educational institutions across every academic stream.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-in">
              <Link href="/signup" className="btn-primary text-base !py-3.5 !px-8 shadow-glow">
                Start Learning Free <ArrowRight className="w-5 h-5 ml-2 inline" />
              </Link>
              <Link href="#solutions" className="btn-secondary text-base !py-3.5 !px-8">
                <Building2 className="w-5 h-5 mr-2 inline" /> For Institutions
              </Link>
            </div>
          </div>

          {/* Hero Dashboard Preview */}
          <div className="relative max-w-5xl mx-auto animate-fade-in">
            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent z-10 pointer-events-none" />
            <div className="rounded-2xl border border-gray-200 shadow-elevated bg-white overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-200">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 mx-4">
                  <div className="bg-white rounded-md px-3 py-1 text-xs text-gray-400 border border-gray-200 max-w-xs mx-auto text-center">
                    edu.srpailabs.com/dashboard
                  </div>
                </div>
              </div>
              <div className="p-6 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  {[
                    { label: 'Active Students', val: '2,340', change: '+12%', color: 'from-brand-500 to-brand-600' },
                    { label: 'Avg. Score', val: '78.4%', change: '+5.2%', color: 'from-emerald-500 to-emerald-600' },
                    { label: 'Study Hours', val: '12.4K', change: '+18%', color: 'from-violet-500 to-violet-600' },
                    { label: 'Pass Rate', val: '94.2%', change: '+3.1%', color: 'from-cyan-500 to-cyan-600' },
                  ].map((s, i) => (
                    <div key={i} className="bg-gray-800/80 rounded-xl p-4 border border-gray-700/50">
                      <p className="text-gray-400 text-xs mb-1">{s.label}</p>
                      <p className="text-white text-xl font-bold">{s.val}</p>
                      <p className="text-emerald-400 text-xs mt-1">{s.change} this month</p>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="lg:col-span-2 bg-gray-800/80 rounded-xl p-4 border border-gray-700/50">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-white text-sm font-medium">Performance Trend</p>
                      <div className="flex gap-2">
                        <span className="text-xs px-2 py-0.5 rounded bg-brand-500/20 text-brand-400">Weekly</span>
                        <span className="text-xs px-2 py-0.5 rounded bg-gray-700 text-gray-400">Monthly</span>
                      </div>
                    </div>
                    <div className="flex items-end gap-2 h-32">
                      {[40, 55, 45, 65, 58, 72, 68, 78, 72, 85, 80, 92].map((h, i) => (
                        <div key={i} className="flex-1 bg-gradient-to-t from-brand-600 to-violet-500 rounded-t-sm opacity-80" style={{ height: `${h}%` }} />
                      ))}
                    </div>
                  </div>
                  <div className="bg-gray-800/80 rounded-xl p-4 border border-gray-700/50">
                    <p className="text-white text-sm font-medium mb-4">Subject Breakdown</p>
                    <div className="space-y-3">
                      {[
                        { name: 'Physics', pct: 85, color: 'bg-brand-500' },
                        { name: 'Chemistry', pct: 72, color: 'bg-violet-500' },
                        { name: 'Biology', pct: 91, color: 'bg-emerald-500' },
                        { name: 'Mathematics', pct: 68, color: 'bg-cyan-500' },
                      ].map((s, i) => (
                        <div key={i}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-300">{s.name}</span>
                            <span className="text-gray-400">{s.pct}%</span>
                          </div>
                          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${s.color}`} style={{ width: `${s.pct}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST BAR */}
      <section className="py-12 bg-gray-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {trustStats.map((stat, i) => (
              <div key={i}>
                <p className="text-3xl sm:text-4xl font-extrabold gradient-text">{stat.value}</p>
                <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <SectionBadge><Zap className="w-4 h-4" /> Platform Capabilities</SectionBadge>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
              Everything You Need to{' '}
              <span className="gradient-text">Excel Academically</span>
            </h2>
            <p className="text-gray-600 text-lg">
              A complete AI-powered education suite -- from personalized tutoring and adaptive exams to
              institution-grade analytics and white-label deployment.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {capabilities.slice(0, 9).map((cap, i) => (
              <div key={i} className="group relative p-6 rounded-2xl border border-gray-200 bg-white hover:border-brand-200 hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-50 to-violet-50 border border-brand-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <cap.icon className="w-6 h-6 text-brand-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{cap.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{cap.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 p-8 rounded-2xl border border-brand-200 bg-gradient-to-r from-brand-50 to-violet-50 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-white border border-brand-200 flex items-center justify-center shadow-sm">
                <Rocket className="w-7 h-7 text-brand-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">{capabilities[9].title}</h3>
                <p className="text-gray-600 text-sm">{capabilities[9].desc}</p>
              </div>
            </div>
            <Link href="/signup" className="btn-primary whitespace-nowrap !py-3 !px-6">
              Explore All Features <ArrowRight className="w-4 h-4 ml-1 inline" />
            </Link>
          </div>
        </div>
      </section>

      {/* SOLUTIONS */}
      <section id="solutions" className="py-20 lg:py-28 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <SectionBadge><Users className="w-4 h-4" /> Built For Everyone</SectionBadge>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
              One Platform.{' '}
              <span className="gradient-text">Two Powerful Experiences.</span>
            </h2>
            <p className="text-gray-600 text-lg">
              Whether you&apos;re an individual learner or managing thousands of students --
              SRP Education AI adapts to your needs.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl border border-gray-200 p-8 hover:shadow-lg transition-shadow relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-brand-100/40 to-transparent rounded-bl-full" />
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center mb-6 shadow-glow">
                  <GraduationCap className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-2">For Students</h3>
                <p className="text-gray-600 mb-6">Self-paced AI-powered learning for individual students preparing for any exam or academic goal.</p>
                <ul className="space-y-3 mb-8">
                  {studentBenefits.map((b, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <CheckCircle className="w-5 h-5 text-brand-500 shrink-0 mt-0.5" />
                      <span className="text-gray-700">{b}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/signup" className="btn-primary text-sm !py-2.5 !px-6 inline-flex items-center">
                  Start Free <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-8 hover:shadow-lg transition-shadow relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-violet-100/40 to-transparent rounded-bl-full" />
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center mb-6">
                  <Building2 className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-2">For Institutions</h3>
                <p className="text-gray-600 mb-6">Enterprise-grade platform for colleges, coaching centers, and educational organizations.</p>
                <ul className="space-y-3 mb-8">
                  {institutionBenefits.map((b, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <CheckCircle className="w-5 h-5 text-violet-500 shrink-0 mt-0.5" />
                      <span className="text-gray-700">{b}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/signup" className="inline-flex items-center text-sm font-semibold py-2.5 px-6 rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 text-white shadow-md hover:shadow-lg transition-all">
                  Request Demo <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ANALYTICS */}
      <section id="analytics" className="py-20 lg:py-28 bg-gray-900 text-white relative overflow-hidden">
        <GradientBlob className="w-[500px] h-[500px] bg-brand-500 -top-40 -right-40 opacity-10" />
        <GradientBlob className="w-[400px] h-[400px] bg-violet-500 -bottom-20 left-0 opacity-10" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-white/80 text-sm font-medium mb-6">
              <LineChart className="w-4 h-4" />
              Analytics &amp; Insights
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
              Data-Driven Learning with{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-violet-400">
                BI-Grade Analytics
              </span>
            </h2>
            <p className="text-gray-400 text-lg">
              Track every metric that matters. From individual student performance to institution-wide insights --
              powered by real-time data visualization.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {analyticsFeatures.map((feat, i) => (
              <div key={i} className="bg-gray-800/60 backdrop-blur-sm rounded-xl border border-gray-700/50 p-5">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${feat.color} flex items-center justify-center mb-3`}>
                  <feat.icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-2xl font-bold">{feat.value}</p>
                <p className="text-gray-400 text-sm">{feat.sub}</p>
                <p className="text-gray-500 text-xs mt-1">{feat.label}</p>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-white font-semibold">Subject-Wise Performance</h3>
                <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400">Live</span>
              </div>
              <div className="space-y-4">
                {analyticsPanelRows.map((row, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between text-sm mb-1.5">
                      <span className="text-gray-300">{row.subject}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-white font-medium">{row.score}%</span>
                        <span className="text-emerald-400 text-xs">{row.trend}</span>
                      </div>
                    </div>
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full bg-gradient-to-r from-brand-500 to-violet-500 ${row.bar}`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
              <h3 className="text-white font-semibold mb-6">Study Engagement Overview</h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Avg. Session', value: '47 min', icon: Clock },
                  { label: 'Questions/Day', value: '156', icon: Target },
                  { label: 'Streak Days', value: '23', icon: Zap },
                  { label: 'Topics Covered', value: '142', icon: BookOpen },
                ].map((item, i) => (
                  <div key={i} className="bg-gray-900/60 rounded-lg p-4 border border-gray-700/30">
                    <item.icon className="w-5 h-5 text-brand-400 mb-2" />
                    <p className="text-xl font-bold text-white">{item.value}</p>
                    <p className="text-gray-500 text-xs">{item.label}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-4 border-t border-gray-700/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Weekly Progress</p>
                    <p className="text-white text-lg font-bold">+24% improvement</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-emerald-400" />
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link href="/signup" className="inline-flex items-center gap-2 text-sm font-semibold py-3 px-6 rounded-xl bg-white text-gray-900 hover:bg-gray-100 transition-colors shadow-lg">
              <BarChart3 className="w-4 h-4" /> Explore Analytics Dashboard <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ENTERPRISE */}
      <section id="enterprise" className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <SectionBadge><Building2 className="w-4 h-4" /> Enterprise Ready</SectionBadge>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-6">
                White-Label Platform for{' '}
                <span className="gradient-text">Educational Institutions</span>
              </h2>
              <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                Deploy your own branded education platform in days, not months. Full customization,
                dedicated infrastructure, and enterprise-grade security -- all managed for you.
              </p>
              <div className="space-y-4 mb-8">
                {[
                  { icon: ShieldCheck, text: 'Custom branding, logos, and color themes' },
                  { icon: Lock, text: 'Role-based access control with audit logging' },
                  { icon: Globe, text: 'Custom domain with SSL certificate' },
                  { icon: Users, text: 'Centralized management for students, teachers, and staff' },
                  { icon: BarChart3, text: 'Institution-wide analytics and reporting' },
                  { icon: Layers, text: 'Modular add-ons for custom needs' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center shrink-0">
                      <item.icon className="w-4 h-4 text-brand-600" />
                    </div>
                    <span className="text-gray-700">{item.text}</span>
                  </div>
                ))}
              </div>
              <Link href="/contact" className="btn-primary inline-flex items-center text-sm !py-3 !px-6">
                Talk to Sales <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700/50 shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">ABC Medical College</p>
                    <p className="text-gray-400 text-xs">Enterprise Dashboard</p>
                  </div>
                  <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">Active</span>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {[
                    { label: 'Students', value: '4,200' },
                    { label: 'Teachers', value: '185' },
                    { label: 'Courses', value: '42' },
                  ].map((s, i) => (
                    <div key={i} className="bg-gray-800 rounded-lg p-3 text-center border border-gray-700/30">
                      <p className="text-white text-lg font-bold">{s.value}</p>
                      <p className="text-gray-500 text-xs">{s.label}</p>
                    </div>
                  ))}
                </div>
                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700/30">
                  <p className="text-gray-400 text-xs mb-3">Department Performance</p>
                  {[
                    { name: 'MBBS I', pct: 92 },
                    { name: 'MBBS II', pct: 86 },
                    { name: 'MBBS III', pct: 78 },
                  ].map((d, i) => (
                    <div key={i} className="mb-2 last:mb-0">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-300">{d.name}</span>
                        <span className="text-gray-400">{d.pct}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-brand-500" style={{ width: `${d.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 w-24 h-24 rounded-full bg-gradient-to-br from-brand-500 to-violet-500 opacity-20 blur-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* ACADEMICS */}
      <section id="academics" className="py-20 lg:py-28 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <SectionBadge><GraduationCap className="w-4 h-4" /> Academic Coverage</SectionBadge>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
              Every Stream.{' '}
              <span className="gradient-text">Every Exam. One Platform.</span>
            </h2>
            <p className="text-gray-600 text-lg">
              From school boards to competitive exams, medical entrance to university semesters --
              our taxonomy covers 50+ exam types across India and global curricula.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {academicStreams.map((stream, i) => (
              <div key={i} className="group bg-white rounded-2xl border border-gray-200 p-6 text-center hover:border-brand-200 hover:shadow-lg transition-all duration-300">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-50 to-violet-50 border border-brand-100 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <stream.icon className="w-7 h-7 text-brand-600" />
                </div>
                <h3 className="font-semibold mb-1">{stream.title}</h3>
                <p className="text-gray-500 text-sm">{stream.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <SectionBadge><Star className="w-4 h-4" /> Trusted by Educators</SectionBadge>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
              What Our <span className="gradient-text">Community Says</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 text-sm leading-relaxed mb-6">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-violet-500 flex items-center justify-center text-white text-sm font-bold">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-gray-500 text-xs">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 lg:py-28 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <SectionBadge><Rocket className="w-4 h-4" /> Getting Started</SectionBadge>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
              Up and Running in <span className="gradient-text">3 Simple Steps</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { step: '01', title: 'Create Your Account', desc: 'Sign up for free as a student or register your institution. No credit card required.' },
              { step: '02', title: 'Choose Your Path', desc: 'Select your exam, stream, or academic goal. Our AI customizes everything for you.' },
              { step: '03', title: 'Learn & Track Progress', desc: 'Study with AI assistance, practice with smart exams, and track your growth with analytics.' },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-violet-500 flex items-center justify-center mx-auto mb-5 shadow-glow">
                  <span className="text-white text-xl font-bold">{s.step}</span>
                </div>
                <h3 className="text-lg font-bold mb-2">{s.title}</h3>
                <p className="text-gray-600 text-sm">{s.desc}</p>
                {i < 2 && (
                  <ChevronRight className="w-6 h-6 text-brand-300 mx-auto mt-4 hidden md:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 lg:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-600 via-brand-700 to-violet-700" />
        <GradientBlob className="w-[600px] h-[600px] bg-white -top-40 -right-40 opacity-10" />
        <GradientBlob className="w-[400px] h-[400px] bg-violet-300 -bottom-20 -left-20 opacity-10" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-6">
            Ready to Transform Your Learning Experience?
          </h2>
          <p className="text-brand-100 text-lg max-w-2xl mx-auto mb-10">
            Join thousands of students and institutions already using SRP Education AI
            to achieve better academic outcomes with less effort.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup" className="inline-flex items-center gap-2 py-3.5 px-8 rounded-xl bg-white text-brand-700 font-semibold text-base hover:bg-gray-50 shadow-xl transition-all">
              Get Started Free <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/contact" className="inline-flex items-center gap-2 py-3.5 px-8 rounded-xl border-2 border-white/30 text-white font-semibold text-base hover:bg-white/10 transition-all">
              <Building2 className="w-5 h-5" /> Book Institution Demo
            </Link>
          </div>

          <div className="flex items-center justify-center gap-6 mt-10 text-brand-100 text-sm">
            <span className="flex items-center gap-1.5"><Check className="w-4 h-4" /> Free forever plan</span>
            <span className="flex items-center gap-1.5"><Check className="w-4 h-4" /> No credit card</span>
            <span className="flex items-center gap-1.5"><Check className="w-4 h-4" /> Setup in 2 minutes</span>
          </div>
        </div>
      </section>

      {/* FOOTER */}
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
              <p className="text-sm text-gray-500 mb-4">
                AI-powered education platform for students and institutions across every academic stream.
              </p>
              <div className="flex items-center gap-3">
                <a href="mailto:support@srpailabs.com" className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center hover:bg-gray-700 transition-colors">
                  <Mail className="w-4 h-4" />
                </a>
                <a href="tel:+919876543210" className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center hover:bg-gray-700 transition-colors">
                  <Phone className="w-4 h-4" />
                </a>
              </div>
            </div>

            {Object.entries(footerLinks).map(([title, links]) => (
              <div key={title}>
                <h4 className="text-white text-sm font-semibold mb-4">{title}</h4>
                <ul className="space-y-2.5">
                  {links.map((link, i) => (
                    <li key={i}>
                      <Link href={link.href} className="text-sm text-gray-500 hover:text-white transition-colors">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-600">
              &copy; {new Date().getFullYear()} SRP AI Labs. All rights reserved.
            </p>
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
