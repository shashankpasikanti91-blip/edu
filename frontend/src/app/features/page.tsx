'use client';

import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useEffect, useRef } from 'react';

function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add('visible')),
      { threshold: 0.1 }
    );
    ref.current?.querySelectorAll('.animate-on-scroll').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
  return ref;
}

const studentFeatures = [
  { icon: '🤖', title: 'AI Study Assistant', desc: 'Get instant answers and step-by-step explanations for any question across Physics, Chemistry, Mathematics, Biology, English, and more. Supports LaTeX, diagrams, and multi-language queries.', highlights: ['Context-aware responses tuned to your syllabus', 'Follow-up conversations for deep understanding', 'Works with CBSE, ICSE, state boards, JEE, NEET, UPSC'] },
  { icon: '📋', title: 'Adaptive Exam Prep', desc: 'Take quizzes that match real exam patterns — JEE Main, NEET-UG, UPSC Prelims, IELTS, GRE. Difficulty adjusts based on your performance.', highlights: ['Auto-generated quizzes from your weak topics', 'Timer-based practice with instant scoring', 'Detailed answer explanations and concept links'] },
  { icon: '📈', title: 'Progress Analytics', desc: 'Power BI-style dashboards that show you exactly where you stand. No vanity metrics — real study data mapped to real performance.', highlights: ['Subject-wise strength & weakness heatmaps', 'Weekly/monthly trend charts', 'Goal tracking with milestone alerts'] },
  { icon: '📅', title: 'Smart Study Planner', desc: 'AI creates day-by-day study schedules based on your exam date, syllabus coverage, and available hours. Adapts when you fall behind.', highlights: ['Drag-and-drop daily task management', 'Pomodoro-style focus session tracking', 'Automatic rescheduling for missed sessions'] },
  { icon: '📝', title: 'Rich Notes & Flashcards', desc: 'Create beautifully formatted notes with Markdown, LaTeX math equations, code blocks, and images. Auto-generate flashcards from your notes.', highlights: ['Subject-tagged and searchable', 'Favorite, archive, and revision modes', 'Export as PDF for offline study'] },
  { icon: '📖', title: 'Dictionary & Reference', desc: 'Built-in academic dictionary with definitions, formulas, and concept explanations. Quick access while studying or solving quizzes.', highlights: ['Subject-specific terminology', 'Cross-linked with related concepts', 'Formula sheets for Physics, Chemistry, Math'] },
  { icon: '🌍', title: 'Current Affairs', desc: 'Curated daily current affairs for UPSC, SSC, banking exams. Categorized by topic with MCQ practice questions.', highlights: ['Daily, weekly, and monthly compilations', 'Auto-generated MCQs from current news', 'Relevant for UPSC, SSC, State PSC'] },
  { icon: '🧘', title: 'Wellness & Focus', desc: 'Track study-life balance with wellness metrics. Pomodoro timer, break reminders, and study streak tracking.', highlights: ['Focus mode with distraction blocking', 'Study streak and consistency tracking', 'Burnout prevention alerts'] },
];

const institutionFeatures = [
  { icon: '🏛️', title: 'Multi-Tenant Architecture', desc: 'Every institution gets its own isolated database space, users, and configuration. No data leakage between tenants.', highlights: ['Isolated data per institution', 'Custom branding per tenant', 'Independent admin controls'] },
  { icon: '👥', title: 'Role-Based Access Control', desc: '7+ roles from Super Admin to Student. Granular permissions for every action — who can create content, view analytics, manage billing.', highlights: ['Owner, Admin, HOD, Teacher, Coordinator, Staff, Student', 'Custom permission templates', 'Department-level access scoping'] },
  { icon: '📊', title: 'Institution Analytics', desc: 'Bird\'s-eye view of enrollment trends, department performance, student engagement, teacher activity, and revenue metrics.', highlights: ['Enrollment growth & retention charts', 'Department comparison dashboards', 'Student performance heatmaps across subjects'] },
  { icon: '🎨', title: 'White-Label Branding', desc: 'Upload your logo, set your color scheme, configure your subdomain. Your platform, your identity.', highlights: ['Custom logo and favicon', 'Primary/secondary color themes', 'Custom subdomain (school.edu.srpailabs.com)'] },
  { icon: '📚', title: 'Content Management', desc: 'Teachers create content — notes, revision sheets, question banks, mock tests. Admin reviews and approves before publishing.', highlights: ['Content approval workflow', '8 content types supported', 'Version control and archiving'] },
  { icon: '💰', title: 'Billing & Subscriptions', desc: 'Integrated billing with Razorpay (India) and Stripe (International). GST compliant invoicing, subscription management, and coupon codes.', highlights: ['Auto-recurring subscriptions', 'GST invoice generation', 'Coupon codes and referral rewards'] },
  { icon: '🏢', title: 'Department Management', desc: 'Create departments, courses, and subjects. Assign HODs, teachers, and students. Track performance per department.', highlights: ['Hierarchical org structure', 'Department-wise analytics', 'Course and subject mapping'] },
  { icon: '🔧', title: 'Modular Add-Ons', desc: 'Enable only what you need: Attendance, Parent Portal, Transport, Fee Reminders, WhatsApp Integration, LMS, AI Analytics.', highlights: ['8 add-on modules available', 'Per-module pricing', 'Free trial for each add-on'] },
];

const securityFeatures = [
  { icon: '🔐', title: 'Argon2id Password Hashing', desc: 'Industry-leading password hashing with memory-hard algorithm. Resistant to GPU and ASIC attacks.' },
  { icon: '🎫', title: 'JWT + Session Management', desc: 'Short-lived access tokens with refresh rotation. Server-side session tracking with device info.' },
  { icon: '🚦', title: 'Rate Limiting', desc: 'Global, auth-specific, and strict rate limiters. Protection against brute force and DDoS attacks.' },
  { icon: '🛡️', title: 'RBAC & Tenant Isolation', desc: 'Role-based middleware on every endpoint. Tenant guard ensures users only access their own data.' },
  { icon: '📋', title: 'Full Audit Trail', desc: 'Every login, data change, and admin action is logged with timestamp, IP, and user agent.' },
  { icon: '🔒', title: 'Security Headers', desc: 'Helmet.js with strict CSP, HSTS, X-Frame-Options DENY, XSS protection, and referrer policy.' },
];

export default function FeaturesPage() {
  const ref = useScrollReveal();
  return (
    <div ref={ref} className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="pt-28 pb-16 lg:pt-36 bg-gradient-to-b from-brand-50 to-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <span className="text-sm font-semibold text-brand-600 tracking-wide uppercase">Platform Features</span>
          <h1 className="mt-3 text-4xl lg:text-5xl font-extrabold text-gray-900">
            Every Tool You Need.{' '}<span className="gradient-text">Nothing You Don&apos;t.</span>
          </h1>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Comprehensive learning and management tools built with real education workflows in mind — not generic templates.
          </p>
        </div>
      </section>

      {/* Student Features */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14 animate-on-scroll">
            <h2 className="text-3xl font-bold text-gray-900">Student & Learner Tools</h2>
            <p className="mt-2 text-gray-600">Everything a student needs from study to assessment to revision.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {studentFeatures.map((f) => (
              <div key={f.title} className="animate-on-scroll card-elevated hover-lift border border-gray-100">
                <div className="flex items-start gap-4">
                  <span className="text-3xl shrink-0">{f.icon}</span>
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-gray-900">{f.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{f.desc}</p>
                    <ul className="space-y-1.5 mt-3">
                      {f.highlights.map((h) => (
                        <li key={h} className="flex items-center gap-2 text-sm text-gray-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-brand-500 shrink-0" />
                          {h}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Institution Features */}
      <section className="py-20 bg-surface-secondary">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14 animate-on-scroll">
            <h2 className="text-3xl font-bold text-gray-900">Institution & Admin Tools</h2>
            <p className="mt-2 text-gray-600">Run your school, college, or coaching center from one dashboard.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {institutionFeatures.map((f) => (
              <div key={f.title} className="animate-on-scroll card-elevated hover-lift border border-gray-100">
                <div className="flex items-start gap-4">
                  <span className="text-3xl shrink-0">{f.icon}</span>
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-gray-900">{f.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{f.desc}</p>
                    <ul className="space-y-1.5 mt-3">
                      {f.highlights.map((h) => (
                        <li key={h} className="flex items-center gap-2 text-sm text-gray-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-violet-500 shrink-0" />
                          {h}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14 animate-on-scroll">
            <h2 className="text-3xl font-bold text-white">Security & Compliance</h2>
            <p className="mt-2 text-gray-400">Enterprise-grade security built into every layer. No compromises.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {securityFeatures.map((f) => (
              <div key={f.title} className="animate-on-scroll p-6 rounded-2xl bg-gray-800/50 border border-gray-700/50">
                <span className="text-2xl mb-3 block">{f.icon}</span>
                <h3 className="font-semibold text-white">{f.title}</h3>
                <p className="text-sm text-gray-400 mt-2">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-brand-600 to-violet-600">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Experience All Features?</h2>
          <p className="text-white/80 mb-8">Start your free trial — no credit card required.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/signup" className="px-8 py-3.5 bg-white text-brand-700 font-semibold rounded-xl hover:bg-gray-100 transition-all shadow-lg">Get Started Free</Link>
            <Link href="/pricing" className="px-8 py-3.5 bg-white/10 text-white font-semibold rounded-xl border border-white/20 hover:bg-white/20 transition-all">View Pricing</Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
