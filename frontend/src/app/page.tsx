'use client';

import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
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
  Rocket,
  School,
  Shield,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Target,
  TrendingUp,
  Trophy,
  Users,
  Zap,
} from 'lucide-react';

/* ---- DATA ---- */

const capabilities = [
  { icon: Brain, title: 'AI Study Assistant', desc: 'Context-aware tutoring powered by advanced AI models. Get explanations, step-by-step solutions, and personalized guidance across subjects.' },
  { icon: Target, title: 'Adaptive Exam Prep', desc: 'Practice with question banks that scale in difficulty. Covers NEET, JEE, GATE, CA, NExT, and other major exam patterns.' },
  { icon: BarChart3, title: 'Learning Analytics', desc: 'Topic-wise performance breakdowns, study time tracking, and progress insights to help students focus where it matters.' },
  { icon: Calendar, title: 'AI Study Planner', desc: 'Personalized study schedules that adapt to your pace, deadlines, and focus areas — grounded in learning science.' },
  { icon: FileText, title: 'Notes & Resources', desc: 'Upload, organize, and search your study materials. AI-powered summaries help you review faster.' },
  { icon: Users, title: 'Multi-Tenant Platform', desc: 'White-label ready for institutions. Custom branding, user management, and centralized admin controls built in.' },
  { icon: Shield, title: 'Secure by Design', desc: 'Role-based access control, audit logging, encrypted data at rest and in transit. Built for institutional trust.' },
  { icon: Globe, title: 'Multi-Language Support', desc: 'Study in your preferred language with content delivery across regional languages.' },
  { icon: Layers, title: 'Modular Add-ons', desc: 'Extend with attendance tracking, billing, parent portal, transport management, and more — activate what you need.' },
  { icon: Rocket, title: 'Teacher & Admin Tools', desc: 'Teachers can assign content, create assessments, and track class progress. Admins manage everything from one dashboard.' },
];

const studentBenefits = [
  'AI-powered personalized study plans',
  'Exam prep for NEET, JEE, GATE, CA, NExT & more',
  'Adaptive quizzes with difficulty scaling',
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
  'Modular add-ons for attendance, billing & more',
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

const platformHighlights = [
  { label: 'Multi-Tenant', sub: 'Architecture', icon: Building2, color: 'from-brand-500 to-violet-500' },
  { label: 'Role-Based', sub: 'Access Control', icon: Shield, color: 'from-cyan-500 to-brand-500' },
  { label: 'Real-Time', sub: 'Analytics Engine', icon: BarChart3, color: 'from-emerald-500 to-cyan-500' },
  { label: 'Curriculum-Aware', sub: 'AI Models', icon: Brain, color: 'from-violet-500 to-rose-500' },
];

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
  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden">
      <Navbar />

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
              Study Smarter with{' '}
              <span className="gradient-text">AI-Powered</span>{' '}
              Tools &amp;{' '}
              <span className="gradient-text">Real Analytics</span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in">
              Personalized AI tutoring, adaptive exam preparation, and institution-grade analytics —
              built for students, teachers, and educational institutions across every academic stream.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-in">
              <Link href="/signup" className="btn-primary text-base !py-3.5 !px-8 shadow-glow">
                Start Learning Free <ArrowRight className="w-5 h-5 ml-2 inline" />
              </Link>
              <Link href="/contact" className="btn-secondary text-base !py-3.5 !px-8">
                <Building2 className="w-5 h-5 mr-2 inline" /> Request Institution Demo
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
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-medium">Dashboard Preview</span>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  {[
                    { label: 'Active Students', val: '—', change: 'Live data', color: 'from-brand-500 to-brand-600' },
                    { label: 'Avg. Score', val: '—', change: 'Per subject', color: 'from-emerald-500 to-emerald-600' },
                    { label: 'Study Hours', val: '—', change: 'Tracked', color: 'from-violet-500 to-violet-600' },
                    { label: 'Pass Rate', val: '—', change: 'Analytics', color: 'from-cyan-500 to-cyan-600' },
                  ].map((s, i) => (
                    <div key={i} className="bg-gray-800/80 rounded-xl p-4 border border-gray-700/50">
                      <p className="text-gray-400 text-xs mb-1">{s.label}</p>
                      <p className="text-white text-xl font-bold">{s.val}</p>
                      <p className="text-gray-500 text-xs mt-1">{s.change}</p>
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

      {/* PLATFORM HIGHLIGHTS */}
      <section className="py-12 bg-gray-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {platformHighlights.map((item, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center mb-1`}>
                  <item.icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-lg font-bold text-gray-900">{item.label}</p>
                <p className="text-sm text-gray-500">{item.sub}</p>
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
              Built for Real{' '}
              <span className="gradient-text">Academic Outcomes</span>
            </h2>
            <p className="text-gray-600 text-lg">
              An AI-powered education suite covering personalized tutoring, adaptive exams,
              analytics, and white-label institutional deployment.
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
              Get Started <ArrowRight className="w-4 h-4 ml-1 inline" />
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
              Whether you&apos;re an individual learner or managing an institution —
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
                <p className="text-gray-600 mb-6">A full-featured platform for colleges, coaching centers, and educational organizations of any size.</p>
                <ul className="space-y-3 mb-8">
                  {institutionBenefits.map((b, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <CheckCircle className="w-5 h-5 text-violet-500 shrink-0 mt-0.5" />
                      <span className="text-gray-700">{b}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/contact" className="inline-flex items-center text-sm font-semibold py-2.5 px-6 rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 text-white shadow-md hover:shadow-lg transition-all">
                  Request Demo <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ANALYTICS CAPABILITIES */}
      <section className="py-20 lg:py-28 bg-gray-900 text-white relative overflow-hidden">
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
                Actionable Analytics
              </span>
            </h2>
            <p className="text-gray-400 text-lg">
              Track the metrics that matter — from individual student performance to institution-wide insights.
              Built on real data, not vanity numbers.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {platformHighlights.map((feat, i) => (
              <div key={i} className="bg-gray-800/60 backdrop-blur-sm rounded-xl border border-gray-700/50 p-5">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${feat.color} flex items-center justify-center mb-3`}>
                  <feat.icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-lg font-bold">{feat.label}</p>
                <p className="text-gray-400 text-sm">{feat.sub}</p>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
              <h3 className="text-white font-semibold mb-6">What You Can Track</h3>
              <div className="space-y-4">
                {[
                  { subject: 'Subject-wise quiz scores', desc: 'Track accuracy per topic and identify weak areas' },
                  { subject: 'Study time per session', desc: 'Measure daily and weekly study habits' },
                  { subject: 'Exam readiness index', desc: 'Progress toward target exam scores' },
                  { subject: 'Institution-wide reports', desc: 'Aggregate performance across departments' },
                ].map((row, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-brand-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-white text-sm font-medium">{row.subject}</p>
                      <p className="text-gray-500 text-xs">{row.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
              <h3 className="text-white font-semibold mb-6">Analytics Capabilities</h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Session Tracking', value: 'Per user', icon: Clock },
                  { label: 'Quiz Analytics', value: 'Per question', icon: Target },
                  { label: 'Goal Tracking', value: 'Custom goals', icon: Zap },
                  { label: 'Topic Coverage', value: 'Full taxonomy', icon: BookOpen },
                ].map((item, i) => (
                  <div key={i} className="bg-gray-900/60 rounded-lg p-4 border border-gray-700/30">
                    <item.icon className="w-5 h-5 text-brand-400 mb-2" />
                    <p className="text-sm font-medium text-white">{item.value}</p>
                    <p className="text-gray-500 text-xs">{item.label}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-4 border-t border-gray-700/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Export &amp; Reporting</p>
                    <p className="text-white text-sm font-medium">PDF, CSV, and scheduled reports</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-emerald-400" />
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link href="/signup" className="inline-flex items-center gap-2 text-sm font-semibold py-3 px-6 rounded-xl bg-white text-gray-900 hover:bg-gray-100 transition-colors shadow-lg">
              <BarChart3 className="w-4 h-4" /> Try the Dashboard <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ENTERPRISE / WHITE-LABEL */}
      <section id="enterprise" className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <SectionBadge><Building2 className="w-4 h-4" /> Institution Ready</SectionBadge>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-6">
                White-Label Platform for{' '}
                <span className="gradient-text">Educational Institutions</span>
              </h2>
              <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                Deploy your own branded education platform with full customization,
                multi-user management, and analytics — configured for your institution.
              </p>
              <div className="space-y-4 mb-8">
                {[
                  { icon: ShieldCheck, text: 'Custom branding, logos, and color themes' },
                  { icon: Lock, text: 'Role-based access control with audit logging' },
                  { icon: Globe, text: 'Custom subdomain or domain support' },
                  { icon: Users, text: 'Manage students, teachers, and staff centrally' },
                  { icon: BarChart3, text: 'Institution-wide analytics and reporting' },
                  { icon: Layers, text: 'Modular add-ons: attendance, billing, transport & more' },
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
                    <p className="text-white font-semibold text-sm">Your Institution Name</p>
                    <p className="text-gray-400 text-xs">White-Label Dashboard</p>
                  </div>
                  <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400">Preview</span>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {[
                    { label: 'Students', value: '—' },
                    { label: 'Teachers', value: '—' },
                    { label: 'Courses', value: '—' },
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
                    { name: 'Department A', pct: 92 },
                    { name: 'Department B', pct: 86 },
                    { name: 'Department C', pct: 78 },
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
                <p className="text-center text-gray-600 text-xs mt-4">Sample layout — your data populates automatically</p>
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
              From school boards to competitive exams, medical entrance to university semesters —
              our taxonomy covers major exam types across India and global curricula.
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

      {/* WHY TRUST US */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <SectionBadge><Shield className="w-4 h-4" /> Built for Trust</SectionBadge>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
              Why Institutions &amp; Students{' '}
              <span className="gradient-text">Choose Us</span>
            </h2>
            <p className="text-gray-600 text-lg">
              We focus on what matters — reliable technology, real analytics, and transparent operations.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: 'Honest Analytics',
                desc: 'Every number in your dashboard comes from real student activity. No generated vanity stats or inflated progress reports.',
                icon: BarChart3,
              },
              {
                title: 'Multi-Tenant Security',
                desc: 'Each institution\'s data is isolated. Role-based access, audit logging, and encryption ensure data integrity.',
                icon: Lock,
              },
              {
                title: 'Curriculum-Aware AI',
                desc: 'Our AI models understand Indian exam patterns — NEET, JEE, GATE, and more. Not generic chatbot responses.',
                icon: Brain,
              },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-50 to-violet-50 border border-brand-100 flex items-center justify-center mb-4">
                  <item.icon className="w-6 h-6 text-brand-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
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
              Get Started in <span className="gradient-text">3 Simple Steps</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { step: '01', title: 'Create Your Account', desc: 'Sign up free as a student, or register your institution. No credit card required.' },
              { step: '02', title: 'Set Your Academic Goal', desc: 'Select your exam, stream, or academic focus. The platform configures itself around your context.' },
              { step: '03', title: 'Learn & Track Progress', desc: 'Study with AI tools, practice with adaptive exams, and monitor your growth through analytics.' },
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
            Ready to Get Started?
          </h2>
          <p className="text-brand-100 text-lg max-w-2xl mx-auto mb-10">
            Create your free account and explore the platform — or request a demo for your institution.
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
            <span className="flex items-center gap-1.5"><Check className="w-4 h-4" /> Free plan available</span>
            <span className="flex items-center gap-1.5"><Check className="w-4 h-4" /> No credit card required</span>
            <span className="flex items-center gap-1.5"><Check className="w-4 h-4" /> Setup in minutes</span>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
