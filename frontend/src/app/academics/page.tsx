'use client';

import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useEffect, useRef, useState } from 'react';

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

const categories = [
  { id: 'all', label: 'All Streams' },
  { id: 'school', label: 'School / K-12' },
  { id: 'competitive', label: 'Competitive Exams' },
  { id: 'university', label: 'University' },
  { id: 'international', label: 'International' },
  { id: 'professional', label: 'Professional' },
];

const academicStreams = [
  {
    id: 'cbse',
    category: 'school',
    icon: '📘',
    title: 'CBSE / ICSE Board',
    grades: 'Classes 1-12',
    subjects: ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Computer Science', 'Hindi', 'Social Science'],
    features: ['NCERT-aligned content', 'Board exam pattern quizzes', 'Chapter-wise notes & solutions', 'Previous year paper analysis'],
    color: 'border-blue-200 bg-blue-50/30',
  },
  {
    id: 'state',
    category: 'school',
    icon: '📗',
    title: 'State Board',
    grades: 'Classes 1-12',
    subjects: ['Regional syllabus coverage', 'State exam patterns', 'Local language support'],
    features: ['State-specific curriculum mapping', 'Vernacular medium support', 'State exam pattern MCQs', 'Board exam preparation guides'],
    color: 'border-green-200 bg-green-50/30',
  },
  {
    id: 'foundation',
    category: 'school',
    icon: '🏗️',
    title: 'Foundation (8-10)',
    grades: 'Classes 8, 9, 10',
    subjects: ['Mathematics', 'Science', 'Mental Ability', 'Olympiad Prep'],
    features: ['IIT-JEE/NEET foundation building', 'NTSE & Olympiad training', 'Concept strengthening modules', 'Early competitive readiness'],
    color: 'border-teal-200 bg-teal-50/30',
  },
  {
    id: 'jee',
    category: 'competitive',
    icon: '⚙️',
    title: 'IIT-JEE Main & Advanced',
    grades: 'Classes 11-12 + Droppers',
    subjects: ['Physics', 'Chemistry', 'Mathematics'],
    features: ['JEE Main & Advanced pattern tests', 'Adaptive difficulty engine', 'Topic-wise analysis & weak area detection', 'Mock tests with AIR prediction'],
    color: 'border-indigo-200 bg-indigo-50/30',
  },
  {
    id: 'neet',
    category: 'competitive',
    icon: '🩺',
    title: 'NEET-UG & PG',
    grades: 'Classes 11-12 + Droppers',
    subjects: ['Biology', 'Physics', 'Chemistry'],
    features: ['NEET-UG full-length mocks', 'Biology-heavy practice sets', 'NCERT-based MCQ banks', 'Previous year trend analysis'],
    color: 'border-rose-200 bg-rose-50/30',
  },
  {
    id: 'upsc',
    category: 'competitive',
    icon: '📝',
    title: 'UPSC Civil Services',
    grades: 'Graduate+',
    subjects: ['General Studies I-IV', 'CSAT', 'Optional Subjects', 'Essay', 'Ethics'],
    features: ['Prelims MCQ practice by topic', 'Mains answer writing guidance', 'Daily current affairs with MCQs', 'Optional subject content'],
    color: 'border-amber-200 bg-amber-50/30',
  },
  {
    id: 'ssc',
    category: 'competitive',
    icon: '📋',
    title: 'SSC / Banking / Railways',
    grades: 'Graduate+',
    subjects: ['Quantitative Aptitude', 'Reasoning', 'English', 'General Awareness'],
    features: ['SSC CGL/CHSL pattern tests', 'Banking exam preparation', 'Speed-based practice modules', 'Current affairs for government exams'],
    color: 'border-orange-200 bg-orange-50/30',
  },
  {
    id: 'ca',
    category: 'professional',
    icon: '📊',
    title: 'CA / CS / CMA',
    grades: 'Post-12th / Graduate',
    subjects: ['Accountancy', 'Law', 'Taxation', 'Auditing', 'Financial Management'],
    features: ['CA Foundation & Inter prep', 'Practice problems with solutions', 'Section-wise mock tests', 'Professional body curriculum aligned'],
    color: 'border-cyan-200 bg-cyan-50/30',
  },
  {
    id: 'nursing',
    category: 'professional',
    icon: '💊',
    title: 'Nursing & Allied Health',
    grades: 'Post-12th / Graduate',
    subjects: ['Anatomy', 'Physiology', 'Pharmacology', 'Community Health Nursing'],
    features: ['Nursing entrance exam prep', 'Clinical case studies', 'Pharmacology MCQ banks', 'Registration exam practice'],
    color: 'border-pink-200 bg-pink-50/30',
  },
  {
    id: 'ug-pg',
    category: 'university',
    icon: '🎓',
    title: 'University UG / PG',
    grades: 'Undergraduate & Postgraduate',
    subjects: ['Engineering', 'Sciences', 'Humanities', 'Commerce', 'Management'],
    features: ['University exam preparation', 'Course-specific content', 'Semester-wise study plans', 'Research paper assistance'],
    color: 'border-purple-200 bg-purple-50/30',
  },
  {
    id: 'gate',
    category: 'competitive',
    icon: '🔧',
    title: 'GATE / NET / SET',
    grades: 'Graduate+',
    subjects: ['Engineering disciplines', 'Science subjects', 'Research methodology'],
    features: ['GATE paper-wise mocks', 'UGC-NET preparation', 'Subject-wise question banks', 'Previous year solutions'],
    color: 'border-slate-200 bg-slate-50/30',
  },
  {
    id: 'ielts',
    category: 'international',
    icon: '🌍',
    title: 'IELTS / TOEFL / PTE',
    grades: 'Study Abroad',
    subjects: ['Listening', 'Reading', 'Writing', 'Speaking'],
    features: ['Full-length practice tests', 'AI-evaluated speaking & writing', 'Band score prediction', 'Section-wise skill building'],
    color: 'border-sky-200 bg-sky-50/30',
  },
  {
    id: 'gre',
    category: 'international',
    icon: '🌐',
    title: 'GRE / GMAT / SAT',
    grades: 'Study Abroad',
    subjects: ['Verbal Reasoning', 'Quantitative Reasoning', 'Analytical Writing', 'Data Sufficiency'],
    features: ['Adaptive practice tests', 'Vocabulary builder', 'Quantitative problem sets', 'Score prediction engine'],
    color: 'border-emerald-200 bg-emerald-50/30',
  },
  {
    id: 'language',
    category: 'international',
    icon: '🗣️',
    title: 'Language Learning',
    grades: 'All Levels',
    subjects: ['English', 'French', 'German', 'Japanese', 'Korean', 'Spanish'],
    features: ['Grammar & vocabulary exercises', 'AI conversation practice', 'Certification exam prep', 'Level-based progression'],
    color: 'border-fuchsia-200 bg-fuchsia-50/30',
  },
];

export default function AcademicsPage() {
  const ref = useScrollReveal();
  const [activeCategory, setActiveCategory] = useState('all');
  const filtered = activeCategory === 'all' ? academicStreams : academicStreams.filter((s) => s.category === activeCategory);

  return (
    <div ref={ref} className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="pt-28 pb-16 lg:pt-36 bg-gradient-to-b from-emerald-50 to-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <span className="text-sm font-semibold text-brand-600 tracking-wide uppercase">Academic Coverage</span>
          <h1 className="mt-3 text-4xl lg:text-5xl font-extrabold text-gray-900">
            Every Stream.{' '}<span className="gradient-text">Every Exam.</span>
          </h1>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            From CBSE boards to UPSC, IELTS to CA — our AI is trained on real curricula, syllabi, and exam patterns. Not generic content.
          </p>
        </div>
      </section>

      {/* Filter tabs */}
      <section className="sticky top-16 z-30 bg-white border-b border-gray-100 py-3">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveCategory(c.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  activeCategory === c.id
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Streams Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((s) => (
              <div key={s.id} className={`animate-on-scroll rounded-2xl border p-6 hover-lift transition-all ${s.color}`}>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">{s.icon}</span>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">{s.title}</h3>
                    <p className="text-xs text-gray-500">{s.grades}</p>
                  </div>
                </div>
                <div className="mb-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Subjects</p>
                  <div className="flex flex-wrap gap-1.5">
                    {s.subjects.slice(0, 5).map((sub) => (
                      <span key={sub} className="px-2 py-0.5 text-xs rounded-md bg-white/80 text-gray-700 border border-gray-200">{sub}</span>
                    ))}
                    {s.subjects.length > 5 && <span className="px-2 py-0.5 text-xs rounded-md bg-white/80 text-gray-500">+{s.subjects.length - 5} more</span>}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Features</p>
                  <ul className="space-y-1.5">
                    {s.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-gray-700">
                        <span className="w-1 h-1 rounded-full bg-brand-500 shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-20">
              <p className="text-gray-500">No streams found for this category.</p>
            </div>
          )}
        </div>
      </section>

      {/* How We Cover Curricula */}
      <section className="py-20 bg-surface-secondary">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14 animate-on-scroll">
            <h2 className="text-3xl font-bold text-gray-900">How Our AI Covers Your Curriculum</h2>
            <p className="mt-2 text-gray-600">Not generic — trained on real syllabi and exam patterns.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: '📚', title: 'Syllabus Mapping', desc: 'AI is trained on actual CBSE, ICSE, state board, JEE, NEET, and UPSC syllabi. Questions and explanations reference specific chapters and topics.' },
              { icon: '📊', title: 'Exam Pattern Analysis', desc: 'We analyze 10+ years of previous papers. Quiz difficulty and question distribution match real exam patterns — including negative marking.' },
              { icon: '🔄', title: 'Continuous Updates', desc: 'Syllabi change. We track NCERT updates, UPSC notification changes, IELTS format updates, and reflect them within weeks — not months.' },
            ].map((i) => (
              <div key={i.title} className="animate-on-scroll text-center">
                <span className="text-3xl block mb-3">{i.icon}</span>
                <h3 className="font-bold text-gray-900 text-lg">{i.title}</h3>
                <p className="mt-2 text-sm text-gray-600 leading-relaxed">{i.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-brand-600 to-violet-600">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Start Studying Your Stream Today</h2>
          <p className="text-white/80 mb-8">Choose your exam or board. Our AI configures itself to your curriculum.</p>
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
