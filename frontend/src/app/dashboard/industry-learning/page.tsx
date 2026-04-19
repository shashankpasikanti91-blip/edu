'use client';

import { useState, useCallback } from 'react';
import {
  Factory, Loader2, ArrowLeft, RefreshCw, AlertTriangle,
  Copy, Check, Clock, Shield, ClipboardList, ShieldAlert,
  Wrench, Scale, Workflow, FileQuestion,
} from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { renderMarkdownContent } from '@/lib/mathRenderer';
import type { FormattedAIResponse } from '@/types';

const INDUSTRY_MODES = [
  { value: 'sop_explanation', label: 'SOP Explanation', icon: ClipboardList },
  { value: 'safety_learning', label: 'Safety Learning', icon: ShieldAlert },
  { value: 'technical_basics', label: 'Technical Basics', icon: Wrench },
  { value: 'compliance_summary', label: 'Compliance Summary', icon: Scale },
  { value: 'process_training', label: 'Process Training', icon: Workflow },
  { value: 'quick_quiz', label: 'Quick Quiz', icon: FileQuestion },
];

const INDUSTRY_SECTORS = [
  { value: 'metal', label: 'Metal & Steel' },
  { value: 'engineering', label: 'Engineering' },
  { value: 'it_software', label: 'IT & Software' },
  { value: 'finance', label: 'Finance & Banking' },
  { value: 'hr', label: 'Human Resources' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'safety', label: 'Occupational Safety' },
  { value: 'corporate', label: 'Corporate Training' },
  { value: 'general', label: 'General' },
];

const STANDARDS = [
  { value: 'indian', label: 'Indian Standard' },
  { value: 'international', label: 'International Standard' },
  { value: 'hybrid', label: 'Hybrid (Indian + International)' },
];

const DIFFICULTY_LEVELS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'expert', label: 'Expert' },
];

const QUICK_TOPICS: Record<string, string[]> = {
  sop_explanation: [
    'Lockout/Tagout (LOTO) procedure',
    'Confined space entry — standard procedure',
    'Material handling — crane and hoist SOP',
    'Hot work permit — welding safety SOP',
    'Chemical storage and handling procedure',
  ],
  safety_learning: [
    'Fire safety — types of fire extinguishers',
    'PPE selection and usage guidelines',
    'Electrical safety — isolation procedures',
    'Working at heights — fall protection',
    'First aid basics — industrial accidents',
  ],
  technical_basics: [
    'Heat treatment of steel — types and processes',
    'PLC — Programmable Logic Controller basics',
    'Welding types — MIG, TIG, Arc comparison',
    'Quality control — SPC and control charts',
    'CNC machining — basics and programming',
  ],
  compliance_summary: [
    'Factories Act 1948 — key provisions',
    'ISO 9001:2015 — quality management requirements',
    'ISO 14001 — environmental management system',
    'POSH Act — workplace harassment compliance',
    'EPF and ESI — employer obligations',
  ],
  process_training: [
    'Steel making — BOF process overview',
    'Software Development Life Cycle (SDLC)',
    'Lean Manufacturing — 5S methodology',
    'Supply chain management — procurement process',
    'Customer onboarding — corporate process',
  ],
  quick_quiz: [
    'Industrial safety — general knowledge quiz',
    'ISO standards — compliance quiz',
    'Electrical safety — workplace quiz',
    'HR compliance — Indian labour law quiz',
    'Quality management — Six Sigma basics quiz',
  ],
};

export default function IndustryLearningPage() {
  const [topic, setTopic] = useState('');
  const [mode, setMode] = useState('technical_basics');
  const [sector, setSector] = useState('general');
  const [standard, setStandard] = useState('indian');
  const [difficulty, setDifficulty] = useState('intermediate');
  const [role, setRole] = useState('');
  const [result, setResult] = useState<FormattedAIResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [copied, setCopied] = useState(false);

  const generate = useCallback(async (topicOverride?: string) => {
    const actualTopic = (topicOverride ?? topic).trim();
    if (!actualTopic) {
      toast.error('Please enter a topic.');
      return;
    }

    setIsLoading(true);
    setResult(null);
    setHasError(false);

    try {
      const { data } = await api.post('/ai/industry/generate', {
        topic: actualTopic,
        mode,
        sector,
        standard,
        difficulty,
        role: role || undefined,
      });

      setResult(data.data);
    } catch {
      setHasError(true);
      toast.error('Failed to generate industry content. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [topic, mode, sector, standard, difficulty, role]);

  const handleQuickTopic = (t: string) => {
    setTopic(t);
    generate(t);
  };

  const handleCopy = async () => {
    if (!result?.content) return;
    try {
      await navigator.clipboard.writeText(result.content);
      setCopied(true);
      toast.success('Copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  const activeQuickTopics = QUICK_TOPICS[mode] || QUICK_TOPICS.technical_basics;

  return (
    <div>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link href="/dashboard" className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Factory className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Industry Learning Assistant</h1>
              <p className="text-gray-500 mt-0.5">SOPs, safety training, technical learning, and compliance for professionals.</p>
            </div>
          </div>
        </div>

        {/* Mode Selection */}
        <div className="card mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Learning Mode</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
            {INDUSTRY_MODES.map((m) => (
              <button
                key={m.value}
                onClick={() => setMode(m.value)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  mode === m.value
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'bg-gray-50 text-gray-600 border border-gray-100 hover:bg-gray-100'
                }`}
              >
                <m.icon className="w-4 h-4" />
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="card mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Industry Sector</label>
              <select value={sector} onChange={(e) => setSector(e.target.value)} className="input-field">
                {INDUSTRY_SECTORS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Standard</label>
              <select value={standard} onChange={(e) => setStandard(e.target.value)} className="input-field">
                {STANDARDS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
              <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="input-field">
                {DIFFICULTY_LEVELS.map((d) => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Your Role (optional)</label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g., Safety Officer, Supervisor..."
                className="input-field"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Topic</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && generate()}
                placeholder="Enter industry / technical topic..."
                className="input-field"
              />
            </div>
          </div>

          <button
            onClick={() => generate()}
            disabled={isLoading}
            className="btn-primary flex items-center gap-2"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Factory className="w-4 h-4" />}
            Generate Industry Content
          </button>
        </div>

        {/* Quick Topics */}
        {!result && !isLoading && (
          <div className="card mb-6">
            <h3 className="text-sm font-medium text-gray-500 mb-3">
              Quick Topics — {INDUSTRY_MODES.find(m => m.value === mode)?.label}
            </h3>
            <div className="flex flex-wrap gap-2">
              {activeQuickTopics.map((t) => (
                <button
                  key={t}
                  onClick={() => handleQuickTopic(t)}
                  className="px-3 py-1.5 text-sm rounded-full border border-gray-200 text-gray-600 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-colors"
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
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
            <p className="text-gray-500">Generating industry learning content...</p>
            <p className="text-xs text-gray-400 mt-1">This may take a few seconds</p>
          </div>
        )}

        {/* Error */}
        {hasError && !isLoading && !result && (
          <div className="card text-center py-12 border-red-200 bg-red-50/30">
            <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-red-700 mb-1">Generation Failed</h3>
            <p className="text-sm text-red-500 mb-4">Could not generate industry content. Please try again.</p>
            <button onClick={() => generate()} className="btn-primary inline-flex items-center gap-2">
              <RefreshCw className="w-4 h-4" /> Retry
            </button>
          </div>
        )}

        {/* Result */}
        {result && !isLoading && (
          <div className="card">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-base font-semibold text-gray-900">
                  {INDUSTRY_MODES.find(m => m.value === mode)?.label || 'Industry Content'}
                </h2>
                {result.generatedAt && (
                  <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                    <Clock className="w-3 h-3" />
                    {new Date(result.generatedAt).toLocaleString()}
                  </span>
                )}
                <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                  {INDUSTRY_SECTORS.find(s => s.value === sector)?.label}
                </span>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                  {standard === 'indian' ? 'Indian Standard' : standard === 'international' ? 'International' : 'Hybrid'}
                </span>
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

            {/* Safety Notices */}
            {result.safetyNotices && result.safetyNotices.length > 0 && (
              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <Shield className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                  <div>
                    {result.safetyNotices.map((notice, i) => (
                      <p key={i} className="text-xs text-amber-700">{notice}</p>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="prose prose-sm max-w-none text-gray-800 leading-relaxed">
              {renderMarkdownContent(result.content)}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!result && !isLoading && !hasError && (
          <div className="card text-center py-12">
            <Factory className="w-14 h-14 text-blue-200 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Industry Learning Assistant</h3>
            <p className="text-gray-500 text-sm max-w-md mx-auto mb-3">
              Learn SOPs, safety protocols, technical concepts, and compliance requirements for your industry.
            </p>
            <p className="text-gray-400 text-xs max-w-sm mx-auto">
              Select your sector, choose a learning mode, and enter a topic. Content follows official industry standards and guidelines.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
