'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  Send, Mail, MapPin, Loader2,
  ArrowRight, MessageSquare, Clock, Building2, Users,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';

const contactReasons = [
  { label: 'General Inquiry', value: 'general' },
  { label: 'Student Support', value: 'student' },
  { label: 'Institution Demo', value: 'demo' },
  { label: 'Partnership', value: 'partnership' },
  { label: 'Technical Issue', value: 'technical' },
  { label: 'Billing Question', value: 'billing' },
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', reason: '', subject: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/contact', form);
      toast.success('Message sent! We\'ll get back to you within 24 hours.');
      setForm({ name: '', email: '', reason: '', subject: '', message: '' });
    } catch {
      toast.error('Failed to send message. Please try emailing us directly at support@srpailabs.com');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar activePage="Contact" />

      {/* Hero */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-50/60 via-white to-white" />
        <div className="absolute top-32 right-1/4 w-64 h-64 bg-violet-200/20 rounded-full blur-3xl" />

        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-100/80 text-brand-700 rounded-full text-sm font-semibold mb-6 border border-brand-200/50">
            <MessageSquare className="w-4 h-4" />
            Get In Touch
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-6 tracking-tight">
            We&apos;d love to
            <span className="gradient-text"> hear from you</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-xl mx-auto">
            Have a question, need a demo, or want to explore partnerships? Our team is here to help.
          </p>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-8 max-w-5xl mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: Mail,
              title: 'Email Us',
              detail: 'support@srpailabs.com',
              sub: 'We reply within 24 hours',
              color: 'bg-brand-50 text-brand-600',
              href: 'mailto:support@srpailabs.com',
            },
            {
              icon: Clock,
              title: 'Business Hours',
              detail: 'Mon - Sat, 9 AM - 6 PM IST',
              sub: 'Emergency: 24/7 for paid plans',
              color: 'bg-emerald-50 text-emerald-600',
              href: null,
            },
            {
              icon: MapPin,
              title: 'Location',
              detail: 'India',
              sub: 'Serving institutions nationwide',
              color: 'bg-amber-50 text-amber-600',
              href: null,
            },
          ].map((item) => (
            <div key={item.title} className="card-elevated hover-lift text-center">
              <div className={`w-12 h-12 ${item.color} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                <item.icon className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-1">{item.title}</h3>
              {item.href ? (
                <a href={item.href} className="text-sm text-brand-600 font-medium hover:text-brand-700">{item.detail}</a>
              ) : (
                <p className="text-sm text-gray-700 font-medium">{item.detail}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">{item.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Form Section */}
      <section className="py-16 max-w-5xl mx-auto px-6">
        <div className="grid lg:grid-cols-5 gap-12">
          {/* Left info */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-extrabold text-gray-900 mb-4">Send us a message</h2>
            <p className="text-gray-600 text-sm leading-relaxed mb-8">
              Fill out the form and our team will get back to you as soon as possible. For institution demos,
              we&apos;ll schedule a personalized walkthrough of the platform.
            </p>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-violet-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-5 h-5 text-violet-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">For Institutions</h3>
                  <p className="text-xs text-gray-500 mt-1">Request a personalized demo with white-label platform setup walkthrough.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">For Students</h3>
                  <p className="text-xs text-gray-500 mt-1">Need help with your account, billing, or learning tools? We&apos;ve got you.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="lg:col-span-3 card-elevated space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Your name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="input-field"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Reason for Contact</label>
              <select
                required
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
                className="input-field"
              >
                <option value="">Select a reason</option>
                {contactReasons.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Subject</label>
              <input
                type="text"
                required
                placeholder="How can we help?"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Message</label>
              <textarea
                required
                rows={5}
                placeholder="Tell us more about your inquiry..."
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="input-field resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full py-3 text-base shadow-glow hover:shadow-glow-lg"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5 mr-2" />
                  Send Message
                </>
              )}
            </button>

            <p className="text-xs text-gray-400 text-center">
              By submitting, you agree to our <Link href="/privacy" className="text-brand-600 hover:underline">Privacy Policy</Link>.
            </p>
          </form>
        </div>
      </section>

      {/* FAQ Quick Links */}
      <section className="py-16 bg-surface-secondary">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-extrabold text-gray-900 mb-3">Looking for quick answers?</h2>
          <p className="text-gray-600 mb-8">Check our pricing page for FAQs about plans, billing, and features.</p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/pricing" className="btn-secondary px-6 py-2.5">
              View Pricing &amp; FAQs
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
