'use client';

import { useState, useCallback } from 'react';
import {
  Cpu, Loader2, ArrowLeft, RefreshCw, AlertTriangle,
  Copy, Check, Clock, Shield, BookOpen, Calculator,
  FlaskConical, Ruler, FileQuestion, GraduationCap,
  FolderGit2, Code2, Wrench,
} from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { renderMarkdownContent } from '@/lib/mathRenderer';
import type { FormattedAIResponse } from '@/types';

const ENGINEERING_MODES = [
  { value: 'concept_explain', label: 'Explain Concept', icon: BookOpen },
  { value: 'solve_numericals', label: 'Solve Numericals', icon: Calculator },
  { value: 'lab_viva_prep', label: 'Lab Viva Prep', icon: FlaskConical },
  { value: 'design_problems', label: 'Design Problems', icon: Ruler },
  { value: 'formula_revision', label: 'Formula Revision', icon: Wrench },
  { value: 'quiz_mode', label: 'Quiz Mode', icon: FileQuestion },
  { value: 'gate_prep', label: 'GATE Prep', icon: GraduationCap },
  { value: 'project_guidance', label: 'Project Guidance', icon: FolderGit2 },
  { value: 'coding_practice', label: 'Coding Practice', icon: Code2 },
];

const ENGINEERING_BRANCHES = [
  { value: 'cse', label: 'CSE (Computer Science)' },
  { value: 'ece', label: 'ECE (Electronics & Comm.)' },
  { value: 'eee', label: 'EEE (Electrical)' },
  { value: 'mechanical', label: 'Mechanical' },
  { value: 'civil', label: 'Civil' },
  { value: 'it', label: 'IT (Information Tech.)' },
  { value: 'chemical', label: 'Chemical' },
  { value: 'marine', label: 'Marine' },
  { value: 'aerospace', label: 'Aerospace' },
  { value: 'automobile', label: 'Automobile' },
  { value: 'biomedical', label: 'Biomedical' },
  { value: 'general', label: 'General Engineering' },
];

const USER_LEVELS = [
  { value: 'class_10', label: '10th Class (MPC Foundation)' },
  { value: 'class_11_12', label: '11th-12th MPC / Inter' },
  { value: 'diploma', label: 'Polytechnic / Diploma' },
  { value: 'btech_1_2', label: 'B.Tech 1st-2nd Year' },
  { value: 'btech_3_4', label: 'B.Tech 3rd-4th Year' },
  { value: 'mtech', label: 'M.Tech / Research' },
  { value: 'gate_aspirant', label: 'GATE Aspirant' },
  { value: 'working_engineer', label: 'Working Engineer' },
];

const STANDARDS = [
  { value: 'indian', label: 'Indian Standard (GATE/JEE/University)' },
  { value: 'international', label: 'International Standard (FE/PE)' },
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
    'Newton\'s Laws of Motion — with real-life examples',
    'OSI Model — 7 layers explained clearly',
    'Ohm\'s Law and Kirchhoff\'s Laws — electrical circuits',
    'Thermodynamics First Law — energy conservation',
    'Data Structures — Arrays vs Linked Lists comparison',
    'Stress and Strain — strength of materials basics',
    'Boolean Algebra — digital logic fundamentals',
  ],
  solve_numericals: [
    'Simply supported beam with UDL — shear force and bending moment',
    'Heat transfer through composite wall — thermal resistance',
    'Time complexity analysis of merge sort algorithm',
    'RLC series circuit — impedance and power factor calculation',
    'Bernoulli\'s equation — fluid flow velocity problem',
    'Binary search tree — insertion and traversal operations',
    'Carnot cycle efficiency — thermodynamics numerical',
  ],
  lab_viva_prep: [
    'Tensile test on mild steel — UTM experiment',
    'Kirchhoff\'s voltage law — circuit lab verification',
    'Hardness testing — Brinell and Rockwell methods',
    'MOSFET characteristics — electronics lab',
    'SQL joins — DBMS lab viva questions',
    'Deflection of simply supported beam — mechanics lab',
    'Compiler design — lexical analyser lab viva',
  ],
  design_problems: [
    'Design a shaft for combined bending and torsion',
    'Design a simple compiler for arithmetic expressions',
    'RC low-pass filter design — cutoff frequency specification',
    'Heat exchanger design — shell and tube type',
    'Database schema design for an e-commerce application',
    'Reinforced concrete beam design as per IS 456',
  ],
  formula_revision: [
    'Mechanics of Solids — stress, strain, Mohr\'s circle formulas',
    'Data Structures — time complexity of all sorting algorithms',
    'Electromagnetic Theory — Maxwell\'s equations',
    'Fluid Mechanics — Bernoulli, Reynolds number, head loss formulas',
    'Digital Electronics — Boolean identities and K-map rules',
    'Engineering Mathematics — Laplace transforms table',
  ],
  quiz_mode: [
    'Operating Systems — process scheduling MCQs',
    'Thermodynamics — Carnot cycle and entropy questions',
    'Computer Networks — TCP/IP and subnetting quiz',
    'Strength of Materials — beam bending quiz',
    'Power Electronics — converter circuits MCQs',
    'Database Management — normalization quiz',
  ],
  gate_prep: [
    'GATE CSE — Data Structures previous year questions',
    'GATE ME — Manufacturing processes high-yield topics',
    'GATE ECE — Signals and Systems key formulas',
    'GATE EE — Power Systems protection scheme questions',
    'GATE CE — Structural Analysis shortcut methods',
    'Engineering Mathematics — GATE common topics across branches',
  ],
  project_guidance: [
    'IoT-based Smart Agriculture Monitoring System',
    'Machine Learning based Crop Disease Detection',
    'ChatBot using NLP — final year project guidance',
    'Automatic Irrigation System using Arduino',
    'Face Recognition Attendance System — Python OpenCV',
    'Solar-powered Electric Vehicle — design approach',
  ],
  coding_practice: [
    'Implement Stack using Arrays and Linked Lists — C/Java',
    'Dynamic Programming — Longest Common Subsequence',
    'Graph traversal — BFS and DFS implementation',
    'Binary Tree — preorder, inorder, postorder traversal',
    'Linked List reversal — iterative and recursive methods',
    'SQL queries — aggregate functions and subqueries',
  ],
};

export default function EngineeringLearningPage() {
  const [topic, setTopic] = useState('');
  const [mode, setMode] = useState('concept_explain');
  const [branch, setBranch] = useState('cse');
  const [userLevel, setUserLevel] = useState('btech_1_2');
  const [standard, setStandard] = useState('indian');
  const [difficulty, setDifficulty] = useState('intermediate');
  const [examType, setExamType] = useState('');
  const [semester, setSemester] = useState('');
  const [result, setResult] = useState<FormattedAIResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [copied, setCopied] = useState(false);

  const generate = useCallback(async (topicOverride?: string) => {
    const actualTopic = (topicOverride ?? topic).trim();
    if (!actualTopic) {
      toast.error('Please enter an engineering topic.');
      return;
    }

    setIsLoading(true);
    setResult(null);
    setHasError(false);

    try {
      const { data } = await api.post('/ai/engineering/generate', {
        topic: actualTopic,
        mode,
        branch,
        userLevel,
        standard,
        difficulty,
        examType: examType || undefined,
        semester: semester || undefined,
      });

      setResult(data.data);
    } catch {
      setHasError(true);
      toast.error('Failed to generate engineering content. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [topic, mode, branch, userLevel, standard, difficulty, examType, semester]);

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
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Cpu className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Engineering & MPC Learning</h1>
              <p className="text-gray-500 mt-0.5">From 10th MPC to PhD — Maths, Physics, Chemistry & all engineering branches.</p>
            </div>
          </div>
        </div>

        {/* Mode Selection */}
        <div className="card mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Learning Mode</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 mb-4">
            {ENGINEERING_MODES.map((m) => (
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
              <select value={branch} onChange={(e) => setBranch(e.target.value)} className="input-field">
                {ENGINEERING_BRANCHES.map((b) => (
                  <option key={b.value} value={b.value}>{b.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Your Level</label>
              <select value={userLevel} onChange={(e) => setUserLevel(e.target.value)} className="input-field">
                {USER_LEVELS.map((l) => (
                  <option key={l.value} value={l.value}>{l.label}</option>
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
                placeholder="e.g., GATE, JEE, EAMCET, University..."
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Semester (optional)</label>
              <input
                type="text"
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                placeholder="e.g., Sem 3, Sem 5..."
                className="input-field"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Topic</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && generate()}
              placeholder="Enter engineering topic, subject, or problem..."
              className="input-field"
            />
          </div>

          <button
            onClick={() => generate()}
            disabled={isLoading}
            className="btn-primary flex items-center gap-2"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Cpu className="w-4 h-4" />}
            Generate Engineering Content
          </button>
        </div>

        {/* Quick Topics */}
        {!result && !isLoading && (
          <div className="card mb-6">
            <h3 className="text-sm font-medium text-gray-500 mb-3">
              Quick Topics — {ENGINEERING_MODES.find(m => m.value === mode)?.label}
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
            <p className="text-gray-500">Generating engineering learning content...</p>
            <p className="text-xs text-gray-400 mt-1">This may take a few seconds</p>
          </div>
        )}

        {/* Error */}
        {hasError && !isLoading && !result && (
          <div className="card text-center py-12 border-red-200 bg-red-50/30">
            <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-red-700 mb-1">Generation Failed</h3>
            <p className="text-sm text-red-500 mb-4">Could not generate engineering content. Please try again.</p>
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
                  {ENGINEERING_MODES.find(m => m.value === mode)?.label || 'Engineering Content'}
                </h2>
                {result.generatedAt && (
                  <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                    <Clock className="w-3 h-3" />
                    {new Date(result.generatedAt).toLocaleString()}
                  </span>
                )}
                <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                  {ENGINEERING_BRANCHES.find(b => b.value === branch)?.label}
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
            <Cpu className="w-14 h-14 text-blue-200 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Engineering & MPC Learning</h3>
            <p className="text-gray-500 text-sm max-w-md mx-auto mb-3">
              Learn engineering concepts, solve numericals, prepare for GATE/JEE, lab viva prep, and coding practice — from 10th MPC to PhD.
            </p>
            <p className="text-gray-400 text-xs max-w-sm mx-auto">
              Supports all branches: CSE, ECE, EEE, Mechanical, Civil, Marine, Aerospace, and more. Select your branch, level, and start learning.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
