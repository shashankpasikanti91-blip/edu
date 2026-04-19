'use client';

import { useState, useEffect, useCallback } from 'react';
import { Globe, Loader2, ArrowLeft, Newspaper, RefreshCw, Clock, AlertTriangle, Copy, Check, Calendar, Shield } from 'lucide-react';
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
  { value: 'Medical & Healthcare', label: 'Medical & Healthcare' },
  { value: 'Industry Updates', label: 'Industry Updates' },
  { value: 'Education Updates', label: 'Education Updates' },
  { value: 'Mixed', label: 'Mixed / General' },
];

const EXAM_TYPES = [
  { value: '', label: 'General' },
  { value: 'UPSC', label: 'UPSC Civil Services' },
  { value: 'SSC', label: 'SSC CGL/CHSL' },
  { value: 'Banking', label: 'Banking (IBPS/SBI)' },
  { value: 'RRB', label: 'Railway RRB' },
  { value: 'State PSC', label: 'State PSC' },
  { value: 'CUET', label: 'CUET' },
  { value: 'Medical', label: 'Medical (NEET/AIIMS)' },
  { value: 'Engineering', label: 'Engineering (GATE/JEE)' },
  { value: 'CA', label: 'CA / CS / CMA' },
  { value: 'Professional', label: 'Professional / Industry' },
];

const OUTPUT_FORMATS = [
  { value: 'comprehensive', label: 'Comprehensive (Summary + Q&A + Facts)' },
  { value: 'qa_only', label: 'Q&A Only' },
  { value: 'bullet_points', label: 'Bullet Highlights' },
  { value: 'memory_points', label: 'Memory Points & Mnemonics' },
  { value: 'mini_quiz', label: 'Mini Quiz (MCQ)' },
  { value: 'mcq_practice', label: 'MCQ Practice Set' },
  { value: 'editorial_summary', label: 'Editorial Summary' },
];

const DATE_RANGES = [
  { value: 'last_7_days', label: 'Last 7 Days' },
  { value: 'last_30_days', label: 'Last 30 Days' },
  { value: 'this_month', label: 'This Month' },
  { value: 'custom', label: 'Custom Range' },
];

const ANSWER_STANDARDS = [
  { value: 'indian', label: 'Indian Standard' },
  { value: 'international', label: 'International' },
  { value: 'neutral', label: 'Neutral' },
  { value: 'hybrid', label: 'Hybrid' },
];

const QUICK_TOPICS: Record<string, string[]> = {
  '': [
    'Latest government schemes and policies',
    'Recent Supreme Court judgments',
    'Union Budget key highlights',
    'International summits and India participation',
    'Latest ISRO missions',
  ],
  National: [
    'Central government policy announcements',
    'State elections and political developments',
    'Infrastructure projects and development',
    'Census and demographic changes',
    'Recent amendments to Indian laws',
  ],
  International: [
    'India bilateral relations updates',
    'UN General Assembly resolutions',
    'Geopolitical developments affecting India',
    'International trade agreements',
    'Climate change summits and India',
  ],
  Economy: [
    'RBI monetary policy decisions',
    'GDP growth and economic indicators',
    'GST updates and tax reforms',
    'Stock market milestones',
    'Foreign Direct Investment trends',
  ],
  'Science & Technology': [
    'ISRO and space technology updates',
    'DRDO defence technology achievements',
    'Digital India initiatives',
    'Artificial Intelligence developments',
    'Indian startups and innovation',
  ],
  Sports: [
    'Indian cricket team recent performances',
    'Olympics and Commonwealth Games',
    'Indian athletes international achievements',
    'IPL and domestic sports',
    'Sports policy and Khelo India',
  ],
  'Awards & Honours': [
    'Padma Awards recipients',
    'Nobel Prize winners',
    'Bharat Ratna and national honours',
    'International awards to Indians',
    'Sahitya Akademi and literary awards',
  ],
  'Government Schemes': [
    'PM Kisan Samman Nidhi updates',
    'Ayushman Bharat health scheme',
    'Make in India progress',
    'Swachh Bharat Mission updates',
    'Digital India programme milestones',
  ],
  Environment: [
    'Climate change policy India',
    'National parks and wildlife protection',
    'Pollution control measures',
    'Renewable energy targets',
    'International environmental agreements',
  ],
  Defence: [
    'Indian defence procurement',
    'Border security developments',
    'Military exercises and cooperation',
    'Indigenous defence manufacturing',
    'Cyber security initiatives',
  ],
  'Medical & Healthcare': [
    'NEET and medical education reforms',
    'NMC guidelines and updates',
    'Public health initiatives India',
    'Ayushman Bharat latest updates',
    'New drug approvals and CDSCO',
  ],
  'Industry Updates': [
    'Make in India industrial progress',
    'PLI scheme sector updates',
    'Startup India new policies',
    'FDI policy changes by sector',
    'Industry 4.0 adoption in India',
  ],
  'Education Updates': [
    'NEP 2020 implementation progress',
    'UGC and AICTE new regulations',
    'CUET and entrance exam changes',
    'Skill India and vocational training',
    'Foreign university campuses in India',
  ],
  Mixed: [
    'Top 10 current affairs this week',
    'Important dates and events this month',
    'India in global rankings updates',
    'National and international days',
    'Latest amendments to Indian laws',
  ],
};

export default function CurrentAffairsPage() {
  const { user } = useAuthStore();
  const [category, setCategory] = useState('');
  const [examType, setExamType] = useState('');
  const [topic, setTopic] = useState('');
  const [outputFormat, setOutputFormat] = useState('comprehensive');
  const [dateRange, setDateRange] = useState('last_30_days');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [answerStandard, setAnswerStandard] = useState('indian');
  const [result, setResult] = useState<string | null>(null);
  const [resultMeta, setResultMeta] = useState<{
    dateRange?: string;
    category?: string;
    examType?: string;
    freshnessWarnings?: string[];
    generatedAt?: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
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
    // Validate custom date range
    if (dateRange === 'custom' && (!customStartDate || !customEndDate)) {
      toast.error('Please select both start and end dates for custom range.');
      return;
    }

    setIsLoading(true);
    setResult(null);
    setResultMeta(null);
    setHasError(false);

    const actualTopic = topicOverride ?? topic.trim();

    try {
      const { data } = await api.post('/ai/generate/current-affairs', {
        category: category || undefined,
        examType: examType || undefined,
        topic: actualTopic || undefined,
        outputFormat,
        dateRange,
        customStartDate: dateRange === 'custom' ? customStartDate : undefined,
        customEndDate: dateRange === 'custom' ? customEndDate : undefined,
        answerStandard,
        count: 10,
        educationLevel: educationContext.level,
        grade: educationContext.grade,
      });

      setResult(data.data.content);
      setResultMeta({
        dateRange: data.data.dateRange,
        category: data.data.category,
        examType: data.data.examType,
        freshnessWarnings: data.data.freshnessWarnings,
        generatedAt: data.data.generatedAt,
      });
    } catch {
      setHasError(true);
      toast.error('Failed to generate content. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [category, examType, topic, outputFormat, dateRange, customStartDate, customEndDate, answerStandard, educationContext]);

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

  const activeQuickTopics = QUICK_TOPICS[category] || QUICK_TOPICS[''];

  return (
    <div>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link href="/dashboard" className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <Globe className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Current Affairs &amp; GK</h1>
              <p className="text-gray-500 mt-0.5">Latest category-wise current affairs and GK for Indian exams.</p>
            </div>
          </div>
        </div>

        {/* Filters Card */}
        <div className="card mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
              <select value={dateRange} onChange={(e) => setDateRange(e.target.value)} className="input-field">
                {DATE_RANGES.map((d) => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Answer Standard</label>
              <select value={answerStandard} onChange={(e) => setAnswerStandard(e.target.value)} className="input-field">
                {ANSWER_STANDARDS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
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
                placeholder="e.g., RBI monetary policy..."
                className="input-field"
              />
            </div>
          </div>

          {/* Custom Date Range Inputs */}
          {dateRange === 'custom' && (
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="input-field"
                />
              </div>
            </div>
          )}

          <button
            onClick={() => generate()}
            disabled={isLoading}
            className="btn-primary flex items-center gap-2"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Newspaper className="w-4 h-4" />}
            Generate Current Affairs Q&amp;A
          </button>
        </div>

        {/* Quick Topics — category-relevant */}
        {!result && !isLoading && (
          <div className="card mb-6">
            <h3 className="text-sm font-medium text-gray-500 mb-3">
              Quick Topics{category ? ` — ${CATEGORIES.find(c => c.value === category)?.label}` : ''} — click to generate instantly
            </h3>
            <div className="flex flex-wrap gap-2">
              {activeQuickTopics.map((t) => (
                <button
                  key={t}
                  onClick={() => handleQuickTopic(t)}
                  className="px-3 py-1.5 text-sm rounded-full border border-gray-200 text-gray-600 hover:bg-purple-50 hover:border-purple-200 hover:text-purple-700 transition-colors"
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
            <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-3" />
            <p className="text-gray-500">Generating current affairs content...</p>
            <p className="text-xs text-gray-400 mt-1">This may take a few seconds</p>
          </div>
        )}

        {/* Error State */}
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
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-base font-semibold text-gray-900">Generated Content</h2>
                {resultMeta?.generatedAt && (
                  <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                    <Clock className="w-3 h-3" />
                    {new Date(resultMeta.generatedAt).toLocaleString()}
                  </span>
                )}
                {resultMeta?.dateRange && (
                  <span className="inline-flex items-center gap-1 text-xs bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full">
                    <Calendar className="w-3 h-3" />
                    {resultMeta.dateRange}
                  </span>
                )}
                {resultMeta?.category && (
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                    {resultMeta.category}
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

            {/* Freshness Warnings */}
            {resultMeta?.freshnessWarnings && resultMeta.freshnessWarnings.length > 0 && (
              <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <Shield className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-orange-700">Freshness Notice</p>
                    {resultMeta.freshnessWarnings.map((w, i) => (
                      <p key={i} className="text-xs text-orange-600 mt-0.5">{w}</p>
                    ))}
                  </div>
                </div>
              </div>
            )}

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
            <Globe className="w-14 h-14 text-purple-200 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Current Affairs &amp; General Knowledge</h3>
            <p className="text-gray-500 text-sm max-w-md mx-auto mb-3">
              Generate exam-focused current affairs for UPSC, SSC, Banking, Railway, and other competitive exams.
            </p>
            <p className="text-gray-400 text-xs max-w-sm mx-auto">
              Select a category, target exam, date range, and click Generate. Content defaults to Indian Standard with the last 30 days.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
