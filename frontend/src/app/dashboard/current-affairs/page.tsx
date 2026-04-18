'use client';

import { useState, useEffect, useCallback } from 'react';
import { Globe, Loader2, ArrowLeft, Newspaper, RefreshCw, Clock, AlertTriangle, Copy, Check } from 'lucide-react';
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

const OUTPUT_FORMATS = [
  { value: 'comprehensive', label: 'Comprehensive (Summary + Q&A + Facts)' },
  { value: 'qa_only', label: 'Q&A Only' },
  { value: 'bullet_points', label: 'Bullet Highlights' },
  { value: 'memory_points', label: 'Memory Points & Mnemonics' },
  { value: 'mini_quiz', label: 'Mini Quiz (MCQ)' },
];

const QUICK_TOPICS = [
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
];

export default function CurrentAffairsPage() {
  const { user } = useAuthStore();
  const [category, setCategory] = useState('');
  const [examType, setExamType] = useState('');
  const [topic, setTopic] = useState('');
  const [outputFormat, setOutputFormat] = useState('comprehensive');
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedAt, setGeneratedAt] = useState<Date | null>(null);
  const [hasError, setHasError] = useState(false);
  const [copied, setCopied] = useState(false);
  const [educationContext, setEducationContext] = useState<{ level?: string; grade?: string }>({});

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

  const generate = useCallback(async (topicOverride?: string) => {
    setIsLoading(true);
    setResult(null);
    setHasError(false);

    const actualTopic = topicOverride ?? topic.trim();

    try {
      const { data } = await api.post('/ai/generate/current-affairs', {
        category: category || undefined,
        examType: examType || undefined,
        topic: actualTopic || undefined,
        outputFormat,
        count: 10,
        educationLevel: educationContext.level,
        grade: educationContext.grade,
      });

      setResult(data.data.content);
      setGeneratedAt(new Date());
    } catch {
      setHasError(true);
      toast.error('Failed to generate content. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [category, examType, topic, outputFormat, educationContext]);

  const handleQuickTopic = (t: string) => {
    setTopic(t);
    generate(t);
  };

  const handleCopy = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      toast.success('Copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy');
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="input-field">
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Target Exam</label>
              <select value={examType} onChange={(e) => setExamType(e.target.value)} className="input-field">
                {EXAM_TYPES.map((e) => (
                  <option key={e.value} value={e.value}>{e.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Output Format</label>
              <select value={outputFormat} onChange={(e) => setOutputFormat(e.target.value)} className="input-field">
                {OUTPUT_FORMATS.map((f) => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Specific Topic (optional)</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && generate()}
                placeholder="e.g., Indian Budget 2025..."
                className="input-field"
              />
            </div>
          </div>
          <button
            onClick={() => generate()}
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
            <h3 className="text-sm font-medium text-gray-500 mb-3">Quick Topics — click to generate instantly</h3>
            <div className="flex flex-wrap gap-2">
              {QUICK_TOPICS.map((t) => (
                <button
                  key={t}
                  onClick={() => handleQuickTopic(t)}
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
            <p className="text-xs text-gray-400 mt-1">This may take a few seconds</p>
          </div>
        )}

        {/* Error State with Retry */}
        {hasError && !isLoading && !result && (
          <div className="card text-center py-12 border-red-200 bg-red-50/30">
            <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-red-700 mb-1">Generation Failed</h3>
            <p className="text-sm text-red-500 mb-4">Could not generate current affairs content. Please try again.</p>
            <button onClick={() => generate()} className="btn-primary inline-flex items-center gap-2">
              <RefreshCw className="w-4 h-4" /> Retry
            </button>
          </div>
        )}

        {/* Result */}
        {result && !isLoading && (
          <div className="card">
            {/* Result Header */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <h2 className="text-base font-semibold text-gray-900">Generated Content</h2>
                {generatedAt && (
                  <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                    <Clock className="w-3 h-3" />
                    {generatedAt.toLocaleString()}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button onClick={handleCopy} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors" title="Copy">
                  {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                </button>
                <button onClick={() => generate()} disabled={isLoading} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors" title="Regenerate">
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* AI Disclaimer */}
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-xs text-amber-700">
                <strong>Note:</strong> This content is AI-generated for study assistance. Facts should be cross-verified with official sources. Content date may not reflect the very latest events.
              </p>
            </div>

            <div className="prose prose-sm max-w-none text-gray-800 leading-relaxed">
              {renderMarkdownContent(result)}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!result && !isLoading && !hasError && (
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
