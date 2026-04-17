'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles, Send, Mail, MapPin, Phone, Loader2,
  ArrowRight, MessageSquare, Clock, Building2, Users,
  GraduationCap, Menu, X,
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
import toast from 'react-hot-toast';

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 1000));
    toast.success('Message sent! We\'ll get back to you within 24 hours.');
    setForm({ name: '', email: '', reason: '', subject: '', message: '' });
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-white">
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
                <Link key={link.label} href={link.href} className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${link.label === 'Contact' ? 'text-brand-600' : 'text-gray-600 hover:text-brand-600'}`}>
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
            <Link href="/pricing#faq" className="btn-secondary px-6 py-2.5">
              View FAQs
            </Link>
            <Link href="/pricing" className="btn-primary px-6 py-2.5">
              See Pricing
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
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
