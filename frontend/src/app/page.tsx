'use client';

import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useEffect, useRef } from 'react';

/* ─────────────────────── Scroll animation hook ─────────────────────── */
function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add('visible')),
      { threshold: 0.12 }
    );
    ref.current?.querySelectorAll('.animate-on-scroll').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
  return ref;
}

/* ──────────────────────────── Stat counter ──────────────────────────── */
const stats = [
  { value: '50K+', label: 'Students Learning' },
  { value: '200+', label: 'Institutions' },
  { value: '15+', label: 'Academic Streams' },
  { value: '99.9%', label: 'Uptime' },
];

/* ───────────────────── Academic streams data ───────────────────────── */
const streams = [
  { icon: '🏫', name: 'K-12 / CBSE / ICSE', desc: 'Board exam prep & foundations' },
  { icon: '⚙️', name: 'Engineering / JEE', desc: 'IIT-JEE Main & Advanced' },
  { icon: '🩺', name: 'Medical / NEET', desc: 'NEET-UG & PG preparation' },
  { icon: '💊', name: 'Nursing & Allied', desc: 'Nursing entrance & practice' },
  { icon: '📊', name: 'Commerce / CA', desc: 'CA, CS & commerce streams' },
  { icon: '🎓', name: 'University / UG-PG', desc: 'Undergraduate & postgraduate' },
  { icon: '📝', name: 'UPSC / Govt Exams', desc: 'Civil services & state exams' },
  { icon: '🌍', name: 'IELTS / GRE / TOEFL', desc: 'International study abroad' },
];

/* ─────────────────── Platform capabilities ─────────────────────────── */
const capabilities = [
  { icon: '🤖', title: 'AI Study Assistant', desc: 'Ask questions in any subject. Get step-by-step solutions, explanations, and related concept links.' },
  { icon: '📋', title: 'Adaptive Exam Prep', desc: 'Practice with JEE, NEET, UPSC-pattern quizzes that adapt difficulty based on your performance.' },
  { icon: '📈', title: 'Real-Time Analytics', desc: 'Track study hours, quiz scores, strengths, weaknesses — with Power BI-style dashboards.' },
  { icon: '📅', title: 'Smart Study Planner', desc: 'AI-generated daily study schedules based on your goals, deadlines, and available time.' },
  { icon: '📝', title: 'Rich Notes & Flashcards', desc: 'Create structured notes with LaTeX math, diagrams, and auto-generated revision flashcards.' },
  { icon: '🏛️', title: 'Multi-Tenant Architecture', desc: 'Schools, colleges, and coaching centers get their own isolated environment with full branding.' },
];

/* ───────────────────── Solutions for each role ─────────────────────── */
const solutionStudents = [
  'AI-powered doubt solving across all subjects',
  'Personalized quiz practice that adapts to your level',
  'Daily study planner with reminders and tracking',
  'Progress analytics with strength/weakness mapping',
  'Notes, flashcards, and revision tools in one place',
  'IELTS, GRE, JEE & NEET specific prep modules',
];
const solutionInstitutions = [
  'Multi-department management with RBAC',
  'Student and teacher performance dashboards',
  'Content library with approval workflows',
  'White-label branding — your logo, your colors',
  'Bulk student onboarding with multiple streams',
  'Subscription billing, invoicing & GST compliance',
];

/* ─────────────────── Trust / Differentiators ───────────────────────── */
const trustItems = [
  { icon: '🔒', title: 'Bank-Level Security', desc: 'Argon2id hashing, JWT sessions, AES-256 encryption, rate limiting, RBAC, and full audit trails.' },
  { icon: '📊', title: 'Honest Analytics', desc: 'No inflated metrics. Every data point comes directly from actual student activity and quiz performance.' },
  { icon: '🧠', title: 'Curriculum-Aware AI', desc: 'Our AI models are tuned to Indian and international curricula — CBSE, ICSE, IB, state boards, and competitive exams.' },
  { icon: '🌐', title: 'Multi-Language Support', desc: 'Interface and AI responses in English, Hindi, Telugu, Tamil, and more — growing every quarter.' },
];

export default function HomePage() {
  const containerRef = useScrollReveal();

  return (
    <div ref={containerRef} className="min-h-screen bg-white">
      <Navbar />

      {/* ═══════════════════ HERO SECTION ═══════════════════ */}
      <section className="relative overflow-hidden pt-28 pb-20 lg:pt-36 lg:pb-28">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-100 rounded-full blur-3xl opacity-40" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-violet-100 rounded-full blur-3xl opacity-40" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-radial from-brand-50 to-transparent opacity-50" />
        </div>
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-50 text-brand-700 text-sm font-medium border border-brand-100">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Part of the SRP AI Labs Ecosystem
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight text-gray-900">
                Learn Smarter with{' '}
                <span className="gradient-text">AI-Powered</span>{' '}
                Education
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 max-w-xl leading-relaxed">
                From K-12 to competitive exams, IELTS to UPSC — one platform for students, institutions, and coaching centers. AI tutoring, real analytics, and honest progress tracking.
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <Link href="/signup" className="btn-primary text-base px-8 py-3.5 shadow-glow hover:shadow-glow-lg">
                  Get Started Free
                </Link>
                <Link href="/contact" className="btn-secondary text-base px-8 py-3.5">
                  Book a Demo
                </Link>
              </div>
              <p className="text-sm text-gray-500">No credit card required · 7-day free trial · Cancel anytime</p>
            </div>
            <div className="relative hidden lg:block">
              <div className="relative bg-white rounded-2xl shadow-elevated border border-gray-100 p-6 space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                  <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white font-bold text-sm">S</div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">Student Dashboard</p>
                    <p className="text-xs text-gray-500">Class 12 · Science Stream</p>
                  </div>
                  <div className="ml-auto"><span className="px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-700 font-medium">Pro Plan</span></div>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { label: 'Quizzes', val: '32', color: 'bg-brand-50 text-brand-700' },
                    { label: 'Notes', val: '24', color: 'bg-emerald-50 text-emerald-700' },
                    { label: 'Avg Score', val: '73%', color: 'bg-amber-50 text-amber-700' },
                    { label: 'Streak', val: '12d', color: 'bg-violet-50 text-violet-700' },
                  ].map((s) => (
                    <div key={s.label} className={`rounded-xl p-3 text-center ${s.color}`}>
                      <p className="text-lg font-bold">{s.val}</p>
                      <p className="text-xs mt-0.5">{s.label}</p>
                    </div>
                  ))}
                </div>
                <div className="flex items-end gap-1.5 h-20 px-2">
                  {[40, 65, 50, 80, 70, 90, 55].map((h, i) => (
                    <div key={i} className="flex-1 rounded-t-md bg-brand-500 opacity-80" style={{ height: `${h}%` }} />
                  ))}
                </div>
                <p className="text-xs text-gray-400 text-center">Weekly Study Activity</p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { sub: 'Mathematics', pct: 78, clr: 'bg-brand-500' },
                    { sub: 'Physics', pct: 65, clr: 'bg-amber-500' },
                    { sub: 'Chemistry', pct: 72, clr: 'bg-emerald-500' },
                  ].map((s) => (
                    <div key={s.sub} className="space-y-1">
                      <p className="text-xs text-gray-600 truncate">{s.sub}</p>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${s.clr}`} style={{ width: `${s.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-brand-100 rounded-full blur-2xl" />
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-violet-100 rounded-full blur-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ STATS RIBBON ═══════════════════ */}
      <section className="border-y border-gray-100 bg-surface-secondary py-10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((s) => (
              <div key={s.label} className="animate-on-scroll">
                <p className="text-3xl lg:text-4xl font-extrabold gradient-text">{s.value}</p>
                <p className="text-sm text-gray-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ ACADEMIC STREAMS ═══════════════════ */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-14 animate-on-scroll">
            <span className="text-sm font-semibold text-brand-600 tracking-wide uppercase">Academic Coverage</span>
            <h2 className="mt-3 text-3xl lg:text-4xl font-bold text-gray-900">
              Purpose-Built for <span className="gradient-text">Every Stream</span>
            </h2>
            <p className="mt-4 text-gray-600 text-lg">From school boards to competitive exams and international certifications.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
            {streams.map((s) => (
              <div key={s.name} className="animate-on-scroll group card hover-lift cursor-pointer border border-gray-100 hover:border-brand-200 text-center">
                <span className="text-3xl mb-3 block">{s.icon}</span>
                <h3 className="font-semibold text-gray-900 group-hover:text-brand-600 transition-colors">{s.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ PLATFORM CAPABILITIES ═══════════════════ */}
      <section className="py-20 bg-surface-secondary">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-14 animate-on-scroll">
            <span className="text-sm font-semibold text-brand-600 tracking-wide uppercase">Platform Capabilities</span>
            <h2 className="mt-3 text-3xl lg:text-4xl font-bold text-gray-900">
              Everything You Need to <span className="gradient-text">Excel</span>
            </h2>
            <p className="mt-4 text-gray-600 text-lg">AI tutoring, smart assessments, and institutional tools — all in one platform.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {capabilities.map((c) => (
              <div key={c.title} className="animate-on-scroll card-elevated hover-lift border border-gray-100 hover:border-brand-200">
                <span className="text-2xl mb-3 block">{c.icon}</span>
                <h3 className="font-semibold text-gray-900 text-lg">{c.title}</h3>
                <p className="text-gray-600 mt-2 text-sm leading-relaxed">{c.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10 animate-on-scroll">
            <Link href="/features" className="text-brand-600 hover:text-brand-700 font-medium text-sm inline-flex items-center gap-1.5 group">
              Explore all features
              <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════ SOLUTIONS ═══════════════════ */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-14 animate-on-scroll">
            <span className="text-sm font-semibold text-brand-600 tracking-wide uppercase">Solutions</span>
            <h2 className="mt-3 text-3xl lg:text-4xl font-bold text-gray-900">
              Built for <span className="gradient-text">Students & Institutions</span>
            </h2>
          </div>
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="animate-on-scroll card-elevated border border-brand-100 bg-gradient-to-br from-brand-50/50 to-white">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-brand-600 flex items-center justify-center text-white text-xl">🎓</div>
                <div><h3 className="text-xl font-bold text-gray-900">For Students</h3><p className="text-sm text-gray-500">Individual learners · B2C</p></div>
              </div>
              <ul className="space-y-3">
                {solutionStudents.map((s) => (
                  <li key={s} className="flex items-start gap-3 text-gray-700">
                    <svg className="w-5 h-5 text-brand-600 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    {s}
                  </li>
                ))}
              </ul>
              <div className="mt-6 pt-4 border-t border-brand-100"><Link href="/signup" className="btn-primary text-sm">Start Learning Free →</Link></div>
            </div>
            <div className="animate-on-scroll card-elevated border border-violet-100 bg-gradient-to-br from-violet-50/50 to-white">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-violet-600 flex items-center justify-center text-white text-xl">🏛️</div>
                <div><h3 className="text-xl font-bold text-gray-900">For Institutions</h3><p className="text-sm text-gray-500">Schools · Colleges · Coaching · B2B</p></div>
              </div>
              <ul className="space-y-3">
                {solutionInstitutions.map((s) => (
                  <li key={s} className="flex items-start gap-3 text-gray-700">
                    <svg className="w-5 h-5 text-violet-600 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    {s}
                  </li>
                ))}
              </ul>
              <div className="mt-6 pt-4 border-t border-violet-100">
                <Link href="/contact" className="inline-flex items-center justify-center px-6 py-2.5 bg-violet-600 text-white font-medium rounded-xl hover:bg-violet-700 transition-all shadow-sm text-sm">Book Institution Demo →</Link>
              </div>
            </div>
          </div>
          <div className="text-center mt-10 animate-on-scroll">
            <Link href="/solutions" className="text-brand-600 hover:text-brand-700 font-medium text-sm inline-flex items-center gap-1.5 group">
              View all solutions
              <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════ HOW IT WORKS ═══════════════════ */}
      <section className="py-20 bg-surface-secondary">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-14 animate-on-scroll">
            <span className="text-sm font-semibold text-brand-600 tracking-wide uppercase">Get Started</span>
            <h2 className="mt-3 text-3xl lg:text-4xl font-bold text-gray-900">Three Steps to <span className="gradient-text">Success</span></h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Create Account', desc: 'Sign up as a student or register your institution. Choose a plan that fits.', icon: '👤' },
              { step: '02', title: 'Set Your Goal', desc: 'Pick your exam, stream, or subjects. Set targets and deadlines.', icon: '🎯' },
              { step: '03', title: 'Learn & Track', desc: 'Use AI tutoring, take quizzes, build notes. Watch your analytics grow.', icon: '📈' },
            ].map((s) => (
              <div key={s.step} className="animate-on-scroll text-center">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-brand-600 text-white flex items-center justify-center text-2xl mb-4 shadow-glow">{s.icon}</div>
                <span className="text-xs font-bold text-brand-400 tracking-widest uppercase">Step {s.step}</span>
                <h3 className="mt-2 text-lg font-bold text-gray-900">{s.title}</h3>
                <p className="mt-2 text-gray-600 text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ TRUST & SECURITY ═══════════════════ */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-14 animate-on-scroll">
            <span className="text-sm font-semibold text-brand-400 tracking-wide uppercase">Why Trust Us</span>
            <h2 className="mt-3 text-3xl lg:text-4xl font-bold">Security & Transparency First</h2>
            <p className="mt-4 text-gray-400 text-lg">No shortcuts. No inflated data. Enterprise-grade infrastructure built for real institutions.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {trustItems.map((t) => (
              <div key={t.title} className="animate-on-scroll p-6 rounded-2xl bg-gray-800/50 border border-gray-700/50 hover:border-brand-500/30 transition-colors">
                <span className="text-3xl mb-4 block">{t.icon}</span>
                <h3 className="font-semibold text-white text-lg">{t.title}</h3>
                <p className="text-sm text-gray-400 mt-2 leading-relaxed">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ CTA ═══════════════════ */}
      <section className="py-20 bg-gradient-to-r from-brand-600 via-violet-600 to-brand-600 relative overflow-hidden">
        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">Ready to Transform Learning?</h2>
          <p className="text-lg text-white/80 mb-8">Join thousands of students and institutions already using SRP Education AI.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup" className="px-8 py-4 rounded-full bg-white text-brand-700 font-bold text-lg hover:bg-gray-100 transition-colors shadow-xl">
              Start Free Trial
            </Link>
            <Link href="/contact" className="px-8 py-4 rounded-full border-2 border-white text-white font-bold text-lg hover:bg-white/10 transition-colors">
              Contact Sales
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
