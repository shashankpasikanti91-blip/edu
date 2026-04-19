'use client';

import { useState, useCallback } from 'react';
import {
  IndianRupee, Loader2, ArrowLeft, RefreshCw, AlertTriangle,
  Copy, Check, Clock, Shield, BookOpen, Calculator,
  FileText, GraduationCap, FileQuestion, Scale,
  ClipboardList, Banknote,
} from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { renderMarkdownContent } from '@/lib/mathRenderer';
import type { FormattedAIResponse } from '@/types';

const COMMERCE_MODES = [
  { value: 'concept_explain', label: 'Explain Concept', icon: BookOpen },
  { value: 'solve_problems', label: 'Solve Problems', icon: Calculator },
  { value: 'case_study', label: 'Case Study', icon: FileText },
  { value: 'exam_prep', label: 'Exam Preparation', icon: GraduationCap },
  { value: 'standards_learning', label: 'Accounting Standards', icon: Scale },
  { value: 'tax_computation', label: 'Tax Computation', icon: Banknote },
  { value: 'audit_learning', label: 'Audit Learning', icon: ClipboardList },
  { value: 'quiz_mode', label: 'Quiz Mode', icon: FileQuestion },
];

const USER_LEVELS = [
  { value: 'class_11_12', label: '11th-12th Commerce' },
  { value: 'bcom', label: 'B.Com' },
  { value: 'bba', label: 'BBA' },
  { value: 'ca_foundation', label: 'CA Foundation' },
  { value: 'ca_inter', label: 'CA Intermediate' },
  { value: 'ca_final', label: 'CA Final' },
  { value: 'cs_student', label: 'CS (Company Secretary)' },
  { value: 'cma_student', label: 'CMA (Cost Accountant)' },
  { value: 'mcom', label: 'M.Com' },
  { value: 'mba_finance', label: 'MBA Finance' },
];

const SPECIALIZATIONS = [
  { value: 'accountancy', label: 'Accountancy' },
  { value: 'cost_accounting', label: 'Cost Accounting' },
  { value: 'taxation', label: 'Taxation (Income Tax & GST)' },
  { value: 'auditing', label: 'Auditing & Assurance' },
  { value: 'corporate_law', label: 'Corporate & Business Law' },
  { value: 'economics', label: 'Economics' },
  { value: 'financial_management', label: 'Financial Management' },
  { value: 'business_studies', label: 'Business Studies' },
  { value: 'statistics', label: 'Statistics & Mathematics' },
  { value: 'general', label: 'General Commerce' },
];

const STANDARDS = [
  { value: 'indian', label: 'Indian Standard (Ind AS / CA / CS)' },
  { value: 'international', label: 'International (IFRS / ACCA / CPA)' },
  { value: 'hybrid', label: 'Hybrid (Indian + International)' },
];

const DIFFICULTY_LEVELS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'expert', label: 'Expert' },
];

const QUICK_TOPICS: Record<string, string[]> = {
  concept_explain: [
    'Double Entry System — rules of debit and credit',
    'Depreciation — methods and accounting treatment',
    'Partnership Accounts — admission and retirement',
    'Company Final Accounts — Trading, P&L, Balance Sheet',
    'Cost Sheet — elements of cost and format',
    'Working Capital Management — concepts and calculation',
    'Demand and Supply — micro economics fundamentals',
  ],
  solve_problems: [
    'Prepare Trading and Profit & Loss Account from trial balance',
    'Ratio Analysis — calculate liquidity and profitability ratios',
    'Process Costing — abnormal loss and gain calculation',
    'Partnership — goodwill calculation on retirement of partner',
    'Bank Reconciliation Statement — adjustments and preparation',
    'Marginal Costing — BEP and P/V ratio calculation',
    'Company Accounts — issue of shares at premium/discount',
  ],
  case_study: [
    'Cash flow analysis of a manufacturing company',
    'Merger and acquisition — valuation case study',
    'Capital budgeting decision — NPV vs IRR conflict',
    'Tax planning — choosing between old and new regime',
    'Working capital crisis in a retail business',
    'Audit observations on inventory valuation',
  ],
  exam_prep: [
    'CA Foundation — Accounting principles high-yield topics',
    'CA Inter — Advanced Accounting group 1 revision',
    'CA Final — Financial Reporting Ind AS questions',
    'CS Executive — Company Law important sections',
    'CMA Inter — Cost Accounting standard costing review',
    'B.Com — Income Tax assessment year problems',
  ],
  standards_learning: [
    'Ind AS 16 — Property, Plant and Equipment',
    'AS 9 — Revenue Recognition',
    'Ind AS 115 — Revenue from Contracts with Customers',
    'AS 10 — Accounting for Fixed Assets',
    'Ind AS 2 — Inventories — valuation and measurement',
    'AS 22 / Ind AS 12 — Accounting for Taxes on Income',
  ],
  tax_computation: [
    'Income Tax — Salary income computation with exemptions',
    'Income Tax — Capital Gains — STCG and LTCG calculation',
    'GST — Input Tax Credit mechanism and matching',
    'Income Tax — House Property income — self-occupied and let out',
    'Tax Deducted at Source — rates and compliance',
    'GST — Place of Supply for services — inter-state vs intra-state',
  ],
  audit_learning: [
    'Audit Planning — assessment of audit risk',
    'Internal Control evaluation — questionnaire approach',
    'Vouching of cash and bank transactions',
    'Company Audit — statutory requirements under Companies Act',
    'Tax Audit u/s 44AB — applicability and reporting',
    'Standards on Auditing — SA 200 to SA 265 overview',
  ],
  quiz_mode: [
    'Financial Accounting — journal entries MCQs',
    'Corporate Law — Companies Act 2013 MCQs',
    'Income Tax — deduction u/s 80C to 80U quiz',
    'Cost Accounting — material and labour costing MCQs',
    'GST — supply and registration questions',
    'Auditing — SA-based practical questions',
  ],
};

export default function CommerceLearningPage() {
  const [topic, setTopic] = useState('');
  const [mode, setMode] = useState('concept_explain');
  const [userLevel, setUserLevel] = useState('bcom');
  const [specialization, setSpecialization] = useState('accountancy');
  const [standard, setStandard] = useState('indian');
  const [difficulty, setDifficulty] = useState('intermediate');
  const [examType, setExamType] = useState('');
  const [result, setResult] = useState<FormattedAIResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [copied, setCopied] = useState(false);

  const generate = useCallback(async (topicOverride?: string) => {
    const actualTopic = (topicOverride ?? topic).trim();
    if (!actualTopic) {
      toast.error('Please enter a commerce topic.');
      return;
    }

    setIsLoading(true);
    setResult(null);
    setHasError(false);

    try {
      const { data } = await api.post('/ai/commerce/generate', {
        topic: actualTopic,
        mode,
        userLevel,
        specialization,
        standard,
        difficulty,
        examType: examType || undefined,
      });

      setResult(data.data);
    } catch {
      setHasError(true);
      toast.error('Failed to generate commerce content. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [topic, mode, userLevel, specialization, standard, difficulty, examType]);

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

  const activeQuickTopics = QUICK_TOPICS[mode] || QUICK_TOPICS.concept_explain;

  return (
    <div>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link href="/dashboard" className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
              <IndianRupee className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Commerce & CA Learning</h1>
              <p className="text-gray-500 mt-0.5">Accountancy, Taxation, CA/CS/CMA prep — 11th Commerce to MBA Finance.</p>
            </div>
          </div>
        </div>

        {/* Mode Selection */}
        <div className="card mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Learning Mode</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
            {COMMERCE_MODES.map((m) => (
              <button
                key={m.value}
                onClick={() => setMode(m.value)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  mode === m.value
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Your Level</label>
              <select value={userLevel} onChange={(e) => setUserLevel(e.target.value)} className="input-field">
                {USER_LEVELS.map((l) => (
                  <option key={l.value} value={l.value}>{l.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
              <select value={specialization} onChange={(e) => setSpecialization(e.target.value)} className="input-field">
                {SPECIALIZATIONS.map((s) => (
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Exam Context (optional)</label>
              <input
                type="text"
                value={examType}
                onChange={(e) => setExamType(e.target.value)}
                placeholder="e.g., CA Inter, CS Exec, CMA, B.Com..."
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Topic</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && generate()}
                placeholder="Enter commerce / accounting topic..."
                className="input-field"
              />
            </div>
          </div>

          <button
            onClick={() => generate()}
            disabled={isLoading}
            className="btn-primary flex items-center gap-2"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <IndianRupee className="w-4 h-4" />}
            Generate Commerce Content
          </button>
        </div>

        {/* Quick Topics */}
        {!result && !isLoading && (
          <div className="card mb-6">
            <h3 className="text-sm font-medium text-gray-500 mb-3">
              Quick Topics — {COMMERCE_MODES.find(m => m.value === mode)?.label}
            </h3>
            <div className="flex flex-wrap gap-2">
              {activeQuickTopics.map((t) => (
                <button
                  key={t}
                  onClick={() => handleQuickTopic(t)}
                  className="px-3 py-1.5 text-sm rounded-full border border-gray-200 text-gray-600 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 transition-colors"
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
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mx-auto mb-3" />
            <p className="text-gray-500">Generating commerce learning content...</p>
            <p className="text-xs text-gray-400 mt-1">This may take a few seconds</p>
          </div>
        )}

        {/* Error */}
        {hasError && !isLoading && !result && (
          <div className="card text-center py-12 border-red-200 bg-red-50/30">
            <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-red-700 mb-1">Generation Failed</h3>
            <p className="text-sm text-red-500 mb-4">Could not generate commerce content. Please try again.</p>
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
                  {COMMERCE_MODES.find(m => m.value === mode)?.label || 'Commerce Content'}
                </h2>
                {result.generatedAt && (
                  <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                    <Clock className="w-3 h-3" />
                    {new Date(result.generatedAt).toLocaleString()}
                  </span>
                )}
                <span className="text-xs bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full">
                  {SPECIALIZATIONS.find(s => s.value === specialization)?.label}
                </span>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                  {USER_LEVELS.find(l => l.value === userLevel)?.label}
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
                    {result.safetyNotices.map((notice: string, i: number) => (
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
            <IndianRupee className="w-14 h-14 text-emerald-200 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Commerce & CA Learning</h3>
            <p className="text-gray-500 text-sm max-w-md mx-auto mb-3">
              Learn accounting, taxation, auditing, business law — prepare for CA, CS, CMA, and university exams.
            </p>
            <p className="text-gray-400 text-xs max-w-sm mx-auto">
              From 11th Commerce to MBA Finance. Supports CA Foundation to CA Final, CS, CMA, B.Com, M.Com with Indian standards focus.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
