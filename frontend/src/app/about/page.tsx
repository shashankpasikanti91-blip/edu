'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles, Target, Heart, Shield, Users, Globe, Award,
  ArrowRight, CheckCircle, Zap, BarChart3, Brain,
  GraduationCap, Building2, BookOpen, Menu, X, Mail, Phone,
} from 'lucide-react';

const navLinks = [
  { label: 'Features', href: '/#features' },
  { label: 'Solutions', href: '/#solutions' },
  { label: 'Analytics', href: '/#analytics' },
  { label: 'Academics', href: '/#academics' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

const values = [
  { icon: Target, title: 'Mission-Driven', text: 'Making quality education accessible to every student, regardless of background or geography.' },
  { icon: Heart, title: 'Student-First', text: 'Every feature we build starts with student well-being and learning outcomes in mind.' },
  { icon: Shield, title: 'Trust & Privacy', text: 'Enterprise-grade security, transparent data practices, and no fake analytics — ever.' },
  { icon: Globe, title: 'Multi-Language', text: 'Supporting regional languages so no student is left behind in their learning journey.' },
  { icon: Users, title: 'Community', text: 'Connecting students, parents, teachers, and institutions on one unified platform.' },
  { icon: Award, title: 'Excellence', text: 'AI-powered tools that deliver measurable, auditable learning outcomes.' },
];

const milestones = [
  { year: '2024', title: 'Founded', desc: 'SRP AI Labs established with a mission to democratize AI-powered education.' },
  { year: '2024', title: 'Platform Launch', desc: 'Multi-tenant SaaS platform launched with AI tutoring and institutional management.' },
  { year: '2025', title: 'Growing', desc: 'Onboarding institutions and students, continuously improving based on real feedback.' },
  { year: '2025', title: 'Innovation', desc: 'Building analytics dashboards, adaptive learning paths, and career preparation tools.' },
];

const teamValues = [
  { stat: 'AI-First', label: 'Approach' },
  { stat: 'Multi-Board', label: 'Support' },
  { stat: 'Secure', label: 'By Design' },
  { stat: 'Open', label: 'To Feedback' },
];

export default function AboutPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden">
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
                <Link key={link.label} href={link.href} className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${link.label === 'About' ? 'text-brand-600' : 'text-gray-600 hover:text-brand-600'}`}>
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
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-50/60 via-white to-white" />
        <div className="absolute top-32 left-1/3 w-72 h-72 bg-violet-200/20 rounded-full blur-3xl" />
        <div className="absolute top-48 right-1/4 w-64 h-64 bg-brand-200/20 rounded-full blur-3xl" />

        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-100/80 text-brand-700 rounded-full text-sm font-semibold mb-6 border border-brand-200/50">
            About SRP AI Labs
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-6 tracking-tight">
            Empowering education
            <br />
            <span className="gradient-text">with intelligent technology</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            We&apos;re building India&apos;s most trusted AI-powered education platform — helping
            students learn smarter, institutions operate better, and teachers teach more effectively.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 border-y border-gray-100 bg-surface-secondary">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {teamValues.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-3xl md:text-4xl font-extrabold gradient-text mb-1">{s.stat}</div>
                <div className="text-sm text-gray-500 font-medium">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold mb-4 uppercase tracking-wider">
                Our Mission
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-6 tracking-tight">
                Making quality education accessible to everyone
              </h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                We believe every student deserves access to personalized, AI-powered learning tools — regardless of which school they attend
                or where they live. SRP Education AI bridges the gap between traditional teaching and modern technology.
              </p>
              <p className="text-gray-600 leading-relaxed mb-8">
                Our multi-tenant platform serves diverse institutions — from small coaching centers to large universities — providing
                each with a fully branded, customizable experience powered by the same enterprise-grade AI engine.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Brain, text: 'AI-first approach' },
                  { icon: Shield, text: 'Privacy by design' },
                  { icon: BarChart3, text: 'Real analytics only' },
                  { icon: Zap, text: 'Always improving' },
                ].map((item) => (
                  <div key={item.text} className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-brand-50 rounded-lg flex items-center justify-center">
                      <item.icon className="w-4 h-4 text-brand-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Visual */}
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-brand-100 to-violet-100 rounded-3xl blur-xl opacity-50" />
              <div className="relative bg-white rounded-2xl shadow-elevated p-8 border border-gray-100">
                <div className="space-y-4">
                  {[
                    { icon: GraduationCap, title: 'For Students', desc: 'Personalized AI tutoring, adaptive exams, study planner', color: 'bg-violet-50 text-violet-600' },
                    { icon: Building2, title: 'For Institutions', desc: 'White-label platform, analytics, attendance, billing', color: 'bg-blue-50 text-blue-600' },
                    { icon: Users, title: 'For Teachers', desc: 'Content tools, quiz builder, performance insights', color: 'bg-emerald-50 text-emerald-600' },
                    { icon: BookOpen, title: 'For Parents', desc: 'Transparent progress tracking and communication', color: 'bg-amber-50 text-amber-600' },
                  ].map((item) => (
                    <div key={item.title} className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.color}`}>
                        <item.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-900">{item.title}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{item.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-100 text-brand-700 rounded-full text-xs font-semibold mb-4 uppercase tracking-wider">
              Our Values
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
              What drives us every day
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {values.map((v) => (
              <div key={v.title} className="group card-elevated hover-lift cursor-default">
                <div className="w-12 h-12 bg-brand-50 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                  <v.icon className="w-6 h-6 text-brand-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{v.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold mb-4 uppercase tracking-wider">
              Journey
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
              Our story so far
            </h2>
          </div>

          <div className="space-y-0">
            {milestones.map((m, i) => (
              <div key={`${m.year}-${m.title}`} className="relative flex gap-6">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 bg-brand-600 rounded-full flex items-center justify-center text-white text-xs font-bold z-10">
                    {i + 1}
                  </div>
                  {i < milestones.length - 1 && <div className="w-0.5 flex-1 bg-brand-200" />}
                </div>
                <div className="pb-12 pt-1">
                  <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">{m.year}</span>
                  <h3 className="text-lg font-bold text-gray-900 mt-1">{m.title}</h3>
                  <p className="text-sm text-gray-600 mt-1 leading-relaxed">{m.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology */}
      <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-violet-100 text-violet-700 rounded-full text-xs font-semibold mb-4 uppercase tracking-wider">
            Technology
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-6 tracking-tight">
            Built with modern, scalable technology
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto mb-12 leading-relaxed">
            Our platform uses cutting-edge AI models, cloud infrastructure, and security best practices to deliver
            reliable, fast, and intelligent learning experiences at scale.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'AI Engine', value: 'GPT-4 Class Models' },
              { label: 'Security', value: 'E2E Encryption' },
              { label: 'Architecture', value: 'Multi-Tenant SaaS' },
              { label: 'Compliance', value: 'Audit-Ready' },
            ].map((t) => (
              <div key={t.label} className="card-elevated text-center">
                <div className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">{t.label}</div>
                <div className="text-sm font-bold text-gray-900">{t.value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-brand-600 via-brand-700 to-violet-700 p-12 md:p-20 text-center">
            <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-1/3 translate-y-1/3" />

            <div className="relative">
              <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
                Ready to join us?
              </h2>
              <p className="text-brand-100 text-lg mb-10 max-w-2xl mx-auto">
                Whether you&apos;re a student, teacher, or institution — there&apos;s a place for you on SRP Education AI.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/signup" className="inline-flex items-center gap-2 bg-white text-brand-700 px-8 py-3.5 rounded-xl font-semibold hover:bg-brand-50 transition-all shadow-lg text-base">
                  Get Started Free
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link href="/contact" className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-white/20 transition-all border border-white/20 text-base">
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        </div>
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
