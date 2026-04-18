'use client';

import { useState, useEffect } from 'react';
import { Globe, Loader2, ArrowLeft, Newspaper, BookOpen, GraduationCap, Building2 } from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';
import { renderMarkdownContent } from '@/lib/mathRenderer';

const CATEGORIES = [
  { value: '', label: 'All Categories' },
  { value: 'National', label: 'National' },
  { value: 'International', label: 'International' },
  { value: 'Economy', label: 'Economy & Finance' },
  { value: 'Science & Technology', label: 'Science & Technology' },
  { value: 'Sports', label: 'Sports' },
  { value: 'Awards & Honours', label: 'Awards & Honours' },
  { value: 'Government Schemes', label: 'Government Schemes' },
  { value: 'Environment', label: 'Environment' },
  { value: 'Defence', label: 'Defence & Security' },
];

const EXAM_TYPES = [
  { value: '', label: 'General' },
  { value: 'UPSC', label: 'UPSC Civil Services' },
  { value: 'SSC', label: 'SSC CGL/CHSL' },
  { value: 'Banking', label: 'Banking (IBPS/SBI)' },
  { value: 'RRB', label: 'Railway RRB' },
  { value: 'State PSC', label: 'State PSC' },
  { value: 'CUET', label: 'CUET' },
];

export default function CurrentAffairsPage() {
  const { user } = useAuthStore();
  const [category, setCategory] = useState('');
  const [examType, setExamType] = useState('');
  const [topic, setTopic] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [educationContext, setEducationContext] = useState<{ level?: string; grade?: string }>({});

  // Load student education context for adaptive AI
  useEffect(() => {
    if (user?.accountType === 'B2C_STUDENT') {
      api.get('/students/academic-profile').then(({ data }) => {
        const profile = data.data;
        if (profile) {
          setEducationContext({
            level: profile.academicLevel || undefined,
            grade: profile.classYear || profile.grade || undefined,
          });
        }
      }).catch(() => {});
    }
  }, [user]);

  const generate = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      const { data } = await api.post('/ai/generate/current-affairs', {
        category: category || undefined,
        examType: examType || undefined,
        topic: topic.trim() || undefined,
        count: 10,
        educationLevel: educationContext.level,
        grade: educationContext.grade,
      });

      setResult(data.data.content);
    } catch {
      toast.error('Failed to generate content. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link href="/dashboard" className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Current Affairs &amp; GK</h1>
            <p className="text-gray-500 mt-1">AI-generated current affairs Q&amp;A for exam preparation</p>
          </div>
        </div>

        {/* Filters */}
        <div className="card mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="input-field"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Target Exam</label>
              <select
                value={examType}
                onChange={(e) => setExamType(e.target.value)}
                className="input-field"
              >
                {EXAM_TYPES.map((e) => (
                  <option key={e.value} value={e.value}>{e.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Specific Topic (optional)</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., Indian Budget 2025, G20 Summit..."
                className="input-field"
              />
            </div>
          </div>
          <button
            onClick={generate}
            disabled={isLoading}
            className="btn-primary flex items-center gap-2"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Newspaper className="w-4 h-4" />}
            Generate Current Affairs Q&amp;A
          </button>
        </div>

        {/* Quick Topics */}
        {!result && !isLoading && (
          <div className="card mb-6">
            <h3 className="text-sm font-medium text-gray-500 mb-3">Quick Topics</h3>
            <div className="flex flex-wrap gap-2">
              {[
                'Indian Constitution Amendments',
                'Space Missions India (ISRO)',
                'Union Budget highlights',
                'International Organizations',
                'Indian Economy & GDP',
                'Government welfare schemes',
                'Recent Supreme Court judgments',
                'Nobel Prize winners',
                'Indian History freedom struggle',
                'World Geography important facts',
              ].map((t) => (
                <button
                  key={t}
                  onClick={() => { setTopic(t); }}
                  className="px-3 py-1.5 text-sm rounded-full border border-gray-200 text-gray-600 hover:bg-brand-50 hover:border-brand-200 hover:text-brand-700 transition-colors"
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="card text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-brand-600 mx-auto mb-3" />
            <p className="text-gray-500">Generating current affairs content...</p>
          </div>
        )}

        {/* Result */}
        {result && !isLoading && (
          <div className="card">
            <div className="prose prose-sm max-w-none text-gray-800 leading-relaxed">
              {renderMarkdownContent(result)}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!result && !isLoading && (
          <div className="card text-center py-12">
            <Globe className="w-14 h-14 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Current Affairs &amp; General Knowledge</h3>
            <p className="text-gray-500 text-sm max-w-md mx-auto">
              Generate exam-focused current affairs Q&amp;A for UPSC, SSC, Banking, and other competitive exams. Select a category and click Generate.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
