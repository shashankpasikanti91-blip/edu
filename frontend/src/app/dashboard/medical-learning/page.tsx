'use client';

import { useState, useCallback } from 'react';
import {
  Stethoscope, Loader2, ArrowLeft, RefreshCw, AlertTriangle,
  Copy, Check, Clock, Shield, Heart, BookOpen, Pill,
  Scissors, FileQuestion, Award, Users, ClipboardList,
} from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { renderMarkdownContent } from '@/lib/mathRenderer';
import type { FormattedAIResponse } from '@/types';

const MEDICAL_MODES = [
  { value: 'explain_condition', label: 'Explain Condition', icon: Heart },
  { value: 'anatomy_learning', label: 'Anatomy Learning', icon: BookOpen },
  { value: 'drug_basics', label: 'Drug / Pharmacology', icon: Pill },
  { value: 'procedure_overview', label: 'Procedure Overview', icon: Scissors },
  { value: 'quiz_mode', label: 'Quiz Mode', icon: FileQuestion },
  { value: 'certification_prep', label: 'Certification Prep', icon: Award },
  { value: 'case_discussion', label: 'Case Discussion', icon: Users },
  { value: 'sop_learning', label: 'SOP Learning', icon: ClipboardList },
];

const MEDICAL_USER_LEVELS = [
  { value: 'nursing_student', label: 'Nursing Student' },
  { value: 'staff_nurse', label: 'Staff Nurse' },
  { value: 'icu_nurse', label: 'ICU Nurse' },
  { value: 'mbbs_student', label: 'MBBS Student' },
  { value: 'doctor', label: 'Doctor' },
  { value: 'surgeon', label: 'Surgeon' },
  { value: 'allied_health', label: 'Allied Health' },
  { value: 'hospital_admin', label: 'Hospital Admin' },
];

const MEDICAL_STANDARDS = [
  { value: 'indian', label: 'Indian Medical Standard' },
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
  explain_condition: [
    'Myocardial Infarction — pathophysiology and management',
    'Diabetes Mellitus Type 2 — etiology and clinical features',
    'Pneumonia — types, clinical presentation, and treatment',
    'Hypertension — classification and pharmacological management',
    'Chronic Kidney Disease — staging and management',
  ],
  anatomy_learning: [
    'Heart chambers and valves — anatomy',
    'Brachial plexus — roots, trunks, divisions',
    'Liver — lobes, blood supply, and relations',
    'Knee joint — ligaments and movements',
    'Circle of Willis — cerebral blood supply',
  ],
  drug_basics: [
    'ACE Inhibitors — mechanism, uses, side effects',
    'Metformin — pharmacology and clinical use',
    'Paracetamol vs Ibuprofen — comparison',
    'Antibiotics classification and spectrum',
    'Insulin types and their duration of action',
  ],
  procedure_overview: [
    'CPR — Basic Life Support steps',
    'Lumbar Puncture — indications and procedure',
    'Nasogastric tube insertion — nursing procedure',
    'IV Cannulation — technique and complications',
    'Wound Dressing — types and techniques',
  ],
  quiz_mode: [
    'Cardiovascular system MCQs',
    'Pharmacology — drug classification quiz',
    'Anatomy — upper limb questions',
    'Nursing fundamentals quiz',
    'Pathology — general pathology MCQs',
  ],
  certification_prep: [
    'NEET PG — Anatomy high-yield topics',
    'NCLEX — Nursing process questions',
    'USMLE Step 1 — Biochemistry review',
    'Indian Nursing Council exam preparation',
    'AIIMS PG — Microbiology review',
  ],
  case_discussion: [
    'Chest pain in a 55-year-old male — differential diagnosis',
    'Jaundice in a newborn — clinical approach',
    'Breathlessness in a young female — case analysis',
    'Fever with rash in a child — clinical discussion',
    'Acute abdominal pain — surgical case discussion',
  ],
  sop_learning: [
    'Hand hygiene protocol — WHO 5 moments',
    'Blood transfusion — standard operating procedure',
    'Medication administration — 10 Rights of nursing',
    'Infection control — isolation precautions',
    'Patient identification — safety protocol',
  ],
};

export default function MedicalLearningPage() {
  const [topic, setTopic] = useState('');
  const [mode, setMode] = useState('explain_condition');
  const [medicalUserLevel, setMedicalUserLevel] = useState('mbbs_student');
  const [standard, setStandard] = useState('indian');
  const [difficulty, setDifficulty] = useState('intermediate');
  const [examType, setExamType] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [result, setResult] = useState<FormattedAIResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [copied, setCopied] = useState(false);

  const generate = useCallback(async (topicOverride?: string) => {
    const actualTopic = (topicOverride ?? topic).trim();
    if (!actualTopic) {
      toast.error('Please enter a medical topic.');
      return;
    }

    setIsLoading(true);
    setResult(null);
    setHasError(false);

    try {
      const { data } = await api.post('/ai/medical/generate', {
        topic: actualTopic,
        mode,
        medicalUserLevel,
        standard,
        difficulty,
        examType: examType || undefined,
        specialization: specialization || undefined,
      });

      setResult(data.data);
    } catch {
      setHasError(true);
      toast.error('Failed to generate medical content. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [topic, mode, medicalUserLevel, standard, difficulty, examType, specialization]);

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

  const activeQuickTopics = QUICK_TOPICS[mode] || QUICK_TOPICS.explain_condition;

  return (
    <div>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link href="/dashboard" className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-rose-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Medical Learning Assistant</h1>
              <p className="text-gray-500 mt-0.5">Educational support for healthcare learners — from nursing to surgery.</p>
            </div>
          </div>
        </div>

        {/* Mode Selection */}
        <div className="card mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Learning Mode</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
            {MEDICAL_MODES.map((m) => (
              <button
                key={m.value}
                onClick={() => setMode(m.value)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  mode === m.value
                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
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
              <select value={medicalUserLevel} onChange={(e) => setMedicalUserLevel(e.target.value)} className="input-field">
                {MEDICAL_USER_LEVELS.map((l) => (
                  <option key={l.value} value={l.value}>{l.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Standard</label>
              <select value={standard} onChange={(e) => setStandard(e.target.value)} className="input-field">
                {MEDICAL_STANDARDS.map((s) => (
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
                placeholder="e.g., NEET PG, NCLEX, USMLE..."
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Specialization (optional)</label>
              <input
                type="text"
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                placeholder="e.g., Cardiology, Orthopaedics..."
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
                placeholder="Enter medical topic..."
                className="input-field"
              />
            </div>
          </div>

          <button
            onClick={() => generate()}
            disabled={isLoading}
            className="btn-primary flex items-center gap-2"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Stethoscope className="w-4 h-4" />}
            Generate Medical Content
          </button>
        </div>

        {/* Quick Topics */}
        {!result && !isLoading && (
          <div className="card mb-6">
            <h3 className="text-sm font-medium text-gray-500 mb-3">
              Quick Topics — {MEDICAL_MODES.find(m => m.value === mode)?.label}
            </h3>
            <div className="flex flex-wrap gap-2">
              {activeQuickTopics.map((t) => (
                <button
                  key={t}
                  onClick={() => handleQuickTopic(t)}
                  className="px-3 py-1.5 text-sm rounded-full border border-gray-200 text-gray-600 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-700 transition-colors"
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
            <Loader2 className="w-8 h-8 animate-spin text-rose-600 mx-auto mb-3" />
            <p className="text-gray-500">Generating medical learning content...</p>
            <p className="text-xs text-gray-400 mt-1">This may take a few seconds</p>
          </div>
        )}

        {/* Error */}
        {hasError && !isLoading && !result && (
          <div className="card text-center py-12 border-red-200 bg-red-50/30">
            <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-red-700 mb-1">Generation Failed</h3>
            <p className="text-sm text-red-500 mb-4">Could not generate medical content. Please try again.</p>
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
                <h2 className="text-base font-semibold text-gray-900">
                  {MEDICAL_MODES.find(m => m.value === mode)?.label || 'Medical Content'}
                </h2>
                {result.generatedAt && (
                  <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                    <Clock className="w-3 h-3" />
                    {new Date(result.generatedAt).toLocaleString()}
                  </span>
                )}
                <span className="text-xs bg-rose-50 text-rose-600 px-2 py-0.5 rounded-full">
                  {standard === 'indian' ? 'Indian Standard' : standard === 'international' ? 'International' : 'Hybrid'}
                </span>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                  {MEDICAL_USER_LEVELS.find(l => l.value === medicalUserLevel)?.label}
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

            {/* Medical Warnings */}
            {(result as any).medicalWarnings?.length > 0 && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-red-700">Content Review Notice</p>
                    {(result as any).medicalWarnings.map((w: string, i: number) => (
                      <p key={i} className="text-xs text-red-600 mt-0.5">{w}</p>
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
            <Stethoscope className="w-14 h-14 text-rose-200 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Medical Learning Assistant</h3>
            <p className="text-gray-500 text-sm max-w-md mx-auto mb-3">
              Learn medical concepts, anatomy, pharmacology, procedures, and prepare for healthcare exams.
            </p>
            <p className="text-gray-400 text-xs max-w-sm mx-auto">
              Select your level, choose a learning mode, and enter a topic. Content is educational only — not a substitute for professional medical advice.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
