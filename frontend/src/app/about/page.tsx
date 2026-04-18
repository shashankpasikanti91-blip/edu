'use client';

import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  Target, Heart, Shield, Users, Globe, Award,
  ArrowRight, Brain, BarChart3, Zap,
  GraduationCap, Building2, BookOpen,
} from 'lucide-react';

const values = [
  { icon: Target, title: 'Mission-Driven', text: 'Making quality education accessible to every student, regardless of background or geography.' },
  { icon: Heart, title: 'Student-First', text: 'Every feature we build starts with student well-being and learning outcomes in mind.' },
  { icon: Shield, title: 'Trust & Privacy', text: 'Enterprise-grade security, transparent data practices, and honest analytics — always.' },
  { icon: Globe, title: 'Multi-Language', text: 'Supporting regional languages so no student is left behind in their learning journey.' },
  { icon: Users, title: 'Community', text: 'Connecting students, parents, teachers, and institutions on one unified platform.' },
  { icon: Award, title: 'Excellence', text: 'AI-powered tools that deliver measurable, auditable learning outcomes.' },
];

const milestones = [
  { year: '2025', title: 'Founded', desc: 'SRP AI Labs established with a mission to democratize AI-powered education across India.' },
  { year: '2025', title: 'Platform Development', desc: 'Multi-tenant SaaS platform built with AI tutoring, exam prep, analytics, and institutional management.' },
  { year: '2026', title: 'Launch & Early Access', desc: 'Platform launched for early adopters — onboarding students and institutions, iterating on feedback.' },
  { year: '2026', title: 'Expanding Capabilities', desc: 'Analytics dashboards, adaptive learning paths, career preparation tools, and add-on modules in active development.' },
];

const teamHighlights = [
  { stat: 'AI-First', label: 'Approach' },
  { stat: 'Multi-Board', label: 'Support' },
  { stat: 'Secure', label: 'By Design' },
  { stat: 'Open', label: 'To Feedback' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden">
      <Navbar activePage="About" />

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
            Building education tools
            <br />
            <span className="gradient-text">that institutions can trust</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            We&apos;re building an AI-powered education platform that helps
            students learn effectively, institutions operate better, and teachers teach with data-driven insights.
          </p>
        </div>
      </section>

      {/* Highlights */}
      <section className="py-16 border-y border-gray-100 bg-surface-secondary">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {teamHighlights.map((s) => (
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
                each with a fully branded, customizable experience powered by the same AI engine.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Brain, text: 'AI-first approach' },
                  { icon: Shield, text: 'Privacy by design' },
                  { icon: BarChart3, text: 'Honest analytics only' },
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
            Our platform uses advanced AI models, cloud infrastructure, and security best practices to deliver
            reliable, fast, and intelligent learning experiences.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'AI Engine', value: 'Advanced LLMs' },
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
                Ready to get started?
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

      <Footer />
    </div>
  );
}
