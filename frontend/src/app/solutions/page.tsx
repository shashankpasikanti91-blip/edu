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

const roles = [
  {
    id: 'students',
    icon: '🎓',
    title: 'For Students',
    subtitle: 'Individual Learners (B2C)',
    gradient: 'from-brand-50 to-blue-50',
    borderColor: 'border-brand-200',
    btnClass: 'bg-brand-600 hover:bg-brand-700',
    cta: { text: 'Start Learning Free', href: '/signup' },
    description: 'Whether you\'re preparing for board exams, JEE, NEET, UPSC, IELTS, or GRE — get AI-powered tutoring, adaptive quizzes, and honest analytics to track your real progress.',
    features: [
      { title: 'AI Doubt Solver', desc: 'Ask any question — get step-by-step solutions with concept explanations.' },
      { title: 'Exam-Pattern Quizzes', desc: 'JEE, NEET, CBSE, UPSC pattern questions with adaptive difficulty.' },
      { title: 'Study Planner', desc: 'Daily schedules built around your exam date and available time.' },
      { title: 'Progress Dashboard', desc: 'Subject-wise analytics, weekly trends, and performance heatmaps.' },
      { title: 'Notes & Flashcards', desc: 'Create rich notes with LaTeX math. Auto-generate flashcards.' },
      { title: 'Goal Tracking', desc: 'Set targets — quizzes completed, hours studied, score milestones.' },
    ],
    plans: [
      { name: 'Free', price: '₹0', features: ['3 quizzes/month', '10 AI queries', 'Basic dashboard', '100MB notes'] },
      { name: 'Pro', price: '₹149/mo', features: ['Unlimited quizzes', '500 AI credits', 'Full analytics', 'Study planner'], popular: true },
      { name: 'Career Premium', price: '₹399/mo', features: ['Everything in Pro', 'IELTS/GRE prep', 'Resume AI', 'Career mentoring'] },
    ],
  },
  {
    id: 'institutions',
    icon: '🏛️',
    title: 'For Institutions',
    subtitle: 'Schools, Colleges & Coaching (B2B)',
    gradient: 'from-violet-50 to-purple-50',
    borderColor: 'border-violet-200',
    btnClass: 'bg-violet-600 hover:bg-violet-700',
    cta: { text: 'Book a Demo', href: '/contact' },
    description: 'Deploy the platform for your entire institution in days. Multi-department management, teacher tools, student analytics, content workflows, and white-label branding.',
    features: [
      { title: 'Multi-Department Setup', desc: 'Science, Commerce, Arts — separated departments with independent analytics.' },
      { title: 'Teacher & HOD Tools', desc: 'Create content, quizzes, assignments. Review student performance.' },
      { title: 'Student Performance', desc: 'Institutional analytics dashboard with enrollment trends and weak areas.' },
      { title: 'Content Library', desc: 'Notes, revision sheets, question banks — with admin approval workflows.' },
      { title: 'White-Label Branding', desc: 'Your logo, colors, subdomain. It looks like your own platform.' },
      { title: 'Billing & Compliance', desc: 'Razorpay/Stripe payments, GST invoicing, subscription management.' },
    ],
    plans: [
      { name: 'School Starter', price: '₹9,999/mo', features: ['Up to 300 users', '5GB storage', 'Basic reports', 'Logo upload'] },
      { name: 'Campus Growth', price: '₹24,999/mo', features: ['Up to 1,000 users', '20GB storage', 'AI tools', 'Full branding'], popular: true },
      { name: 'University Pro', price: '₹79,999/mo', features: ['Up to 5,000 users', '100GB storage', 'Multi-campus', 'White-label'] },
    ],
  },
  {
    id: 'teachers',
    icon: '👩‍🏫',
    title: 'For Teachers & Faculty',
    subtitle: 'Within Institutions (B2B)',
    gradient: 'from-emerald-50 to-green-50',
    borderColor: 'border-emerald-200',
    btnClass: 'bg-emerald-600 hover:bg-emerald-700',
    cta: { text: 'Learn More', href: '/contact' },
    description: 'Create structured content, design quizzes, track student progress by class and subject. Get tools built for the way teachers actually work.',
    features: [
      { title: 'Quiz Builder', desc: 'Create MCQs, subjective questions. Set time limits and passing marks.' },
      { title: 'Content Authoring', desc: 'Author notes, revision sheets, flashcards. Submit for admin review.' },
      { title: 'Student Monitoring', desc: 'See per-student quiz scores, study hours, engagement levels.' },
      { title: 'AI-Assisted Grading', desc: 'AI helps evaluate subjective answers and suggest feedback.' },
      { title: 'Class Performance', desc: 'Compare class averages, identify weak topics, plan interventions.' },
      { title: 'Resource Library', desc: 'Share PDFs, videos, and documents. Organized by subject and topic.' },
    ],
  },
  {
    id: 'coaching',
    icon: '🏫',
    title: 'For Coaching Centers',
    subtitle: 'JEE/NEET/UPSC Coaching',
    gradient: 'from-amber-50 to-orange-50',
    borderColor: 'border-amber-200',
    btnClass: 'bg-amber-600 hover:bg-amber-700',
    cta: { text: 'Contact Sales', href: '/contact' },
    description: 'Purpose-built for competitive exam coaching centers like Narayana, Sri Chaitanya, NEXT IAS — with test series management, batch tracking, and parent communication.',
    features: [
      { title: 'Test Series Management', desc: 'Create full-length mock tests matching JEE/NEET/UPSC patterns.' },
      { title: 'Batch & Branch Tracking', desc: 'Track performance by batch, branch, and center location.' },
      { title: 'Student Rankings', desc: 'Auto-ranked leaderboards by test, subject, and overall performance.' },
      { title: 'Doubt Resolution', desc: 'AI-powered doubt clearing with teacher escalation workflows.' },
      { title: 'Parent Portal', desc: 'Parents see student progress, attendance, and upcoming tests.' },
      { title: 'Result Analytics', desc: 'Predict selection probability based on mock test trends.' },
    ],
  },
];

export default function SolutionsPage() {
  const ref = useScrollReveal();
  return (
    <div ref={ref} className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="pt-28 pb-16 lg:pt-36 bg-gradient-to-b from-violet-50 to-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <span className="text-sm font-semibold text-brand-600 tracking-wide uppercase">Solutions</span>
          <h1 className="mt-3 text-4xl lg:text-5xl font-extrabold text-gray-900">
            One Platform.{' '}<span className="gradient-text">Every Role.</span>
          </h1>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Whether you&apos;re a student, institution, teacher, or coaching center — we have purpose-built tools for your specific workflow.
          </p>
        </div>
      </section>

      {/* Role Sections */}
      {roles.map((role, ri) => (
        <section key={role.id} className={`py-20 ${ri % 2 === 0 ? 'bg-white' : 'bg-surface-secondary'}`}>
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-5 gap-12 items-start">
              {/* Left info */}
              <div className="lg:col-span-2 animate-on-scroll">
                <div className={`inline-flex items-center gap-3 px-4 py-2 rounded-xl bg-gradient-to-r ${role.gradient} border ${role.borderColor} mb-4`}>
                  <span className="text-2xl">{role.icon}</span>
                  <span className="text-sm font-medium text-gray-700">{role.subtitle}</span>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mt-2">{role.title}</h2>
                <p className="mt-4 text-gray-600 leading-relaxed">{role.description}</p>
                <div className="mt-6">
                  <Link href={role.cta.href} className={`inline-flex items-center justify-center px-6 py-2.5 ${role.btnClass} text-white font-medium rounded-xl transition-all shadow-sm`}>
                    {role.cta.text} →
                  </Link>
                </div>

                {/* Mini pricing (only for student and institution) */}
                {role.plans && (
                  <div className="mt-8 space-y-3">
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Plans</p>
                    {role.plans.map((p) => (
                      <div key={p.name} className={`flex items-center justify-between p-3 rounded-xl border ${p.popular ? role.borderColor + ' bg-white shadow-sm' : 'border-gray-100'}`}>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{p.name} {p.popular && <span className="text-xs text-brand-600 ml-1">Popular</span>}</p>
                          <p className="text-xs text-gray-500">{p.features.slice(0, 2).join(' · ')}</p>
                        </div>
                        <p className="font-bold text-gray-900 text-sm">{p.price}</p>
                      </div>
                    ))}
                    <Link href="/pricing" className="text-sm text-brand-600 hover:text-brand-700 font-medium">View all plans →</Link>
                  </div>
                )}
              </div>

              {/* Right features grid */}
              <div className="lg:col-span-3 grid sm:grid-cols-2 gap-4">
                {role.features.map((f) => (
                  <div key={f.title} className="animate-on-scroll card hover-lift border border-gray-100">
                    <h3 className="font-semibold text-gray-900">{f.title}</h3>
                    <p className="text-sm text-gray-600 mt-1.5 leading-relaxed">{f.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      ))}

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-brand-600 to-violet-600">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Find the Right Solution for You</h2>
          <p className="text-white/80 mb-8">Start with a free account or schedule a personalized demo for your institution.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/signup" className="px-8 py-3.5 bg-white text-brand-700 font-semibold rounded-xl hover:bg-gray-100 transition-all shadow-lg">Get Started Free</Link>
            <Link href="/contact" className="px-8 py-3.5 bg-white/10 text-white font-semibold rounded-xl border border-white/20 hover:bg-white/20 transition-all">Book a Demo</Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
