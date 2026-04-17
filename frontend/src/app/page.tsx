import Link from 'next/link';
import {
  BookOpen,
  Brain,
  Shield,
  Users,
  ArrowRight,
  CheckCircle,
  Sparkles,
  BarChart3,
  Zap,
  Globe,
  GraduationCap,
  FileText,
  Target,
  TrendingUp,
  Clock,
  ChevronRight,
  Building2,
  Calendar,
} from 'lucide-react';

const highlights = [
  { value: 'Free to Start', label: 'No credit card needed' },
  { value: 'AI-Powered', label: 'Personalized learning' },
  { value: 'Multi-Board', label: 'CBSE, ICSE, State & more' },
  { value: 'Secure', label: 'Enterprise-grade encryption' },
];

const features = [
  {
    icon: Brain,
    title: 'AI Study Assistant',
    description: 'Ask doubts via text or image. Get instant, curriculum-aligned explanations in your preferred language.',
    bgLight: 'bg-violet-50',
    iconColor: 'text-violet-600',
  },
  {
    icon: BookOpen,
    title: 'Smart Exam Prep',
    description: 'AI-generated mock tests, quizzes, previous papers, and adaptive practice that targets your weak areas.',
    bgLight: 'bg-blue-50',
    iconColor: 'text-blue-600',
  },
  {
    icon: BarChart3,
    title: 'Learning Analytics',
    description: 'Power BI-grade dashboards showing progress, knowledge gaps, and personalized improvement paths.',
    bgLight: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
  },
  {
    icon: Calendar,
    title: 'Smart Study Planner',
    description: 'AI builds a personalized schedule around your materials and deadlines with clear milestones.',
    bgLight: 'bg-amber-50',
    iconColor: 'text-amber-600',
  },
  {
    icon: FileText,
    title: 'Notes & Resources',
    description: 'Upload materials once and unlock flashcards, summaries, mind maps, and revision sheets.',
    bgLight: 'bg-rose-50',
    iconColor: 'text-rose-600',
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'End-to-end encryption, RBAC, complete audit logs, and privacy-first architecture.',
    bgLight: 'bg-indigo-50',
    iconColor: 'text-indigo-600',
  },
];

const platformCapabilities = [
  { icon: Brain, label: 'AI Tutor with multi-language support' },
  { icon: Target, label: 'Adaptive learning that adjusts to you' },
  { icon: BarChart3, label: 'Real-time progress analytics' },
  { icon: GraduationCap, label: 'Career & placement prep tools' },
  { icon: Globe, label: 'Multi-tenant institutional support' },
  { icon: Zap, label: 'Automated content generation' },
  { icon: Users, label: 'Parent, teacher, and student portals' },
  { icon: Clock, label: 'Wellness & focus management' },
];

const useCases = [
  {
    icon: GraduationCap,
    title: 'For Students',
    description: 'Personalized study plans, AI tutoring, flashcards, quizzes, and progress tracking — all in one platform.',
    cta: 'Start Learning Free',
    href: '/signup',
  },
  {
    icon: Building2,
    title: 'For Institutions',
    description: 'White-label platform with analytics, attendance, billing, parent portal, and custom branding.',
    cta: 'Book a Demo',
    href: '/contact',
  },
  {
    icon: Users,
    title: 'For Teachers',
    description: 'Content management, quiz creation, student performance insights, and automated feedback tools.',
    cta: 'Learn More',
    href: '/about',
  },
];



export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-gray-100/50">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-brand-600 to-violet-600 rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">SRP Education AI</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link href="/#features" className="text-sm text-gray-600 hover:text-gray-900 transition-colors font-medium">Features</Link>
            <Link href="/pricing" className="text-sm text-gray-600 hover:text-gray-900 transition-colors font-medium">Pricing</Link>
            <Link href="/about" className="text-sm text-gray-600 hover:text-gray-900 transition-colors font-medium">About</Link>
            <Link href="/contact" className="text-sm text-gray-600 hover:text-gray-900 transition-colors font-medium">Contact</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="btn-ghost text-sm px-4 py-2">Log In</Link>
            <Link href="/signup" className="btn-primary text-sm px-5 py-2">Get Started Free</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-50/80 via-white to-white" />
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-brand-200/30 rounded-full blur-3xl" />
        <div className="absolute top-40 right-1/4 w-96 h-96 bg-violet-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-32 bg-gradient-to-t from-white to-transparent" />

        <div className="relative max-w-7xl mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-100/80 backdrop-blur-sm text-brand-700 rounded-full text-sm font-semibold mb-8 border border-brand-200/50">
              <Sparkles className="w-4 h-4" />
              AI-Powered Education Platform
              <ChevronRight className="w-3.5 h-3.5" />
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 leading-[1.1] mb-6 tracking-tight">
              Learning that adapts
              <br />
              <span className="gradient-text">to every student</span>
            </h1>

            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
              The trusted AI learning platform for students, teachers, and institutions.
              Personalized study plans, real-time analytics, and intelligent tutoring — all in one place.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Link href="/signup" className="btn-primary text-base px-8 py-3.5 shadow-glow hover:shadow-glow-lg">
                Start Learning Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              <Link href="/pricing" className="btn-secondary text-base px-8 py-3.5">
                View Pricing
              </Link>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                No credit card required
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-brand-500" />
                Enterprise-grade security
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" />
                Setup in 2 minutes
              </div>
            </div>
          </div>

          {/* Hero Dashboard Preview */}
          <div className="mt-16 max-w-5xl mx-auto">
            <div className="relative rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 p-1 shadow-2xl">
              <div className="rounded-xl bg-gray-900 overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 bg-gray-800/50 border-b border-gray-700/50">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400/80" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400/80" />
                    <div className="w-3 h-3 rounded-full bg-green-400/80" />
                  </div>
                  <div className="flex-1 mx-4">
                    <div className="bg-gray-700/50 rounded-lg px-4 py-1.5 text-xs text-gray-400 max-w-md mx-auto">
                      app.srpeducation.ai/dashboard
                    </div>
                  </div>
                </div>
                <div className="p-6 grid grid-cols-12 gap-4">
                  <div className="col-span-3 space-y-3">
                    <div className="flex items-center gap-2 px-3 py-2 bg-brand-600/20 rounded-lg">
                      <div className="w-4 h-4 rounded bg-brand-500/50" />
                      <div className="h-2.5 bg-brand-400/40 rounded w-16" />
                    </div>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="flex items-center gap-2 px-3 py-2">
                        <div className="w-4 h-4 rounded bg-gray-700/50" />
                        <div className="h-2 bg-gray-700/30 rounded" style={{ width: `${50 + i * 8}px` }} />
                      </div>
                    ))}
                  </div>
                  <div className="col-span-9 space-y-4">
                    <div className="flex gap-4">
                      {['brand', 'emerald', 'amber', 'violet'].map((color, i) => (
                        <div key={color} className="flex-1 rounded-xl p-4 bg-gray-800/50 border border-gray-700/30">
                          <div className={`w-8 h-8 rounded-lg mb-2 ${i === 0 ? 'bg-brand-500/30' : i === 1 ? 'bg-emerald-500/30' : i === 2 ? 'bg-amber-500/30' : 'bg-violet-500/30'}`} />
                          <div className="h-5 bg-gray-600/30 rounded w-12 mb-1" />
                          <div className="h-2 bg-gray-700/30 rounded w-20" />
                        </div>
                      ))}
                    </div>
                    <div className="rounded-xl p-4 bg-gray-800/50 border border-gray-700/30">
                      <div className="h-3 bg-gray-700/30 rounded w-32 mb-4" />
                      <div className="flex items-end gap-2 h-24">
                        {[40, 65, 45, 80, 55, 70, 90, 60, 75, 85, 50, 95].map((h, i) => (
                          <div key={i} className="flex-1 bg-gradient-to-t from-brand-600/60 to-brand-400/30 rounded-t" style={{ height: `${h}%` }} />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-20 bg-brand-500/10 blur-2xl rounded-full" />
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section className="py-16 border-y border-gray-100 bg-surface-secondary">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {highlights.map((item) => (
              <div key={item.label} className="text-center">
                <div className="text-xl md:text-2xl font-extrabold gradient-text mb-1">{item.value}</div>
                <div className="text-sm text-gray-500 font-medium">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-100 text-brand-700 rounded-full text-xs font-semibold mb-4 uppercase tracking-wider">
              Features
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
              Everything you need to succeed
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Upload your materials once and unlock a complete study system designed to help you understand faster, retain longer, and stress less.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div key={feature.title} className="group card-elevated hover-lift cursor-default">
                <div className={`w-12 h-12 ${feature.bgLight} rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className={`w-6 h-6 ${feature.iconColor}`} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold mb-4 uppercase tracking-wider">
              How It Works
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
              Start learning in minutes
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Three simple steps to transform your study experience
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { step: '01', title: 'Create Your Account', desc: 'Sign up free and set up your profile in under 2 minutes. No credit card required.', icon: Users },
              { step: '02', title: 'Upload Your Materials', desc: 'Add your notes, textbooks, or syllabus. Our AI processes everything instantly.', icon: FileText },
              { step: '03', title: 'Learn Smarter', desc: 'Get personalized study plans, take AI-generated quizzes, and track your progress.', icon: TrendingUp },
            ].map((item) => (
              <div key={item.step} className="relative text-center">
                <div className="text-6xl font-extrabold text-brand-100 mb-4">{item.step}</div>
                <div className="w-14 h-14 bg-brand-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-glow">
                  <item.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Capabilities */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-violet-100 text-violet-700 rounded-full text-xs font-semibold mb-4 uppercase tracking-wider">
                Platform
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-6 tracking-tight">
                More than just a study tool
              </h2>
              <p className="text-gray-600 mb-8 leading-relaxed">
                SRP Education AI is a complete learning ecosystem — from intelligent tutoring and exam preparation to
                institutional management and parent engagement. Everything connected, nothing siloed.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {platformCapabilities.map((cap) => (
                  <div key={cap.label} className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-brand-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <cap.icon className="w-4 h-4 text-brand-600" />
                    </div>
                    <span className="text-sm text-gray-700 font-medium">{cap.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-brand-100 to-violet-100 rounded-3xl blur-xl opacity-60" />
              <div className="relative bg-white rounded-2xl shadow-elevated p-8 border border-gray-100">
                <div className="space-y-6">
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                    <div className="w-12 h-12 bg-gradient-to-br from-brand-500 to-violet-500 rounded-xl flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-gray-900">Your Progress</div>
                      <p className="text-xs text-gray-500 mt-1">Track your real learning journey with AI-powered analytics</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'AI Tutoring', desc: 'Ask any doubt', color: 'bg-blue-50 text-blue-700' },
                      { label: 'Smart Quizzes', desc: 'Adaptive tests', color: 'bg-emerald-50 text-emerald-700' },
                      { label: 'Study Planner', desc: 'Personalized', color: 'bg-amber-50 text-amber-700' },
                      { label: 'Progress', desc: 'Real analytics', color: 'bg-rose-50 text-rose-700' },
                    ].map((s) => (
                      <div key={s.label} className="p-3 bg-gray-50 rounded-xl">
                        <span className="text-xs font-medium text-gray-700">{s.label}</span>
                        <span className={`block text-xs font-bold mt-0.5 px-2 py-0.5 rounded-md ${s.color}`}>{s.desc}</span>
                      </div>
                    ))}
                  </div>
                  <div className="p-4 bg-brand-50 rounded-xl border border-brand-100">
                    <div className="flex items-start gap-3">
                      <Brain className="w-5 h-5 text-brand-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="text-sm font-semibold text-brand-900">AI Recommendation</div>
                        <p className="text-xs text-brand-700 mt-1">AI analyzes your study patterns and recommends what to focus on next based on your actual performance.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-24 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold mb-4 uppercase tracking-wider">
              Use Cases
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
              Built for everyone in education
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {useCases.map((uc) => (
              <div key={uc.title} className="group relative bg-white rounded-2xl p-8 shadow-card border border-gray-100 hover:shadow-elevated hover:border-brand-200 transition-all duration-300">
                <div className="w-14 h-14 bg-gradient-to-br from-brand-500 to-violet-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <uc.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{uc.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed mb-6">{uc.description}</p>
                <Link href={uc.href} className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700 transition-colors">
                  {uc.cta}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-100 text-rose-700 rounded-full text-xs font-semibold mb-4 uppercase tracking-wider">
              Why SRP Education AI
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
              Built for honest, effective learning
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { icon: Shield, title: 'No Fake Metrics', description: 'We never inflate numbers or fabricate data. Your progress is real, verified, and yours.' },
              { icon: Brain, title: 'AI That Explains', description: 'Our AI tutor breaks down complex topics in your language, adapting to your pace and learning style.' },
              { icon: BarChart3, title: 'Transparent Analytics', description: 'Every insight comes from your actual usage. Real data, real progress, real improvement.' },
            ].map((item) => (
              <div key={item.title} className="card-elevated">
                <div className="w-12 h-12 bg-brand-50 rounded-2xl flex items-center justify-center mb-5">
                  <item.icon className="w-6 h-6 text-brand-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-brand-600 via-brand-700 to-violet-700 p-12 md:p-20 text-center">
            <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-1/3 translate-y-1/3" />

            <div className="relative">
              <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
                Ready to transform your learning?
              </h2>
              <p className="text-brand-100 text-lg mb-10 max-w-2xl mx-auto">
                Join students and institutions already learning smarter with SRP Education AI.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/signup" className="inline-flex items-center gap-2 bg-white text-brand-700 px-8 py-3.5 rounded-xl font-semibold hover:bg-brand-50 transition-all shadow-lg hover:shadow-xl text-base">
                  Get Started Free
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link href="/contact" className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-white/20 transition-all border border-white/20 text-base">
                  Book a Demo
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            <div className="col-span-2">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 bg-gradient-to-br from-brand-500 to-violet-500 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold text-white">SRP Education AI</span>
              </div>
              <p className="text-sm leading-relaxed mb-4 max-w-xs">
                India&apos;s trusted AI-powered education platform for students, teachers, and institutions. A product of SRP AI Labs.
              </p>
              <div className="flex items-center gap-1 text-sm">
                <Shield className="w-4 h-4 text-green-400" />
                <span className="text-gray-500">Enterprise-grade security</span>
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4 text-sm">Product</h4>
              <ul className="space-y-2.5 text-sm">
                <li><Link href="/#features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4 text-sm">Legal</h4>
              <ul className="space-y-2.5 text-sm">
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4 text-sm">Support</h4>
              <ul className="space-y-2.5 text-sm">
                <li><Link href="/contact" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><a href="mailto:support@srpailabs.com" className="hover:text-white transition-colors">support@srpailabs.com</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm">
              &copy; {new Date().getFullYear()} SRP AI Labs. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm">
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
              <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
