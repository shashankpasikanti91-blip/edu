'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  GraduationCap, BookOpen, Target, Globe, Loader2,
  Save, ChevronDown, ChevronUp, AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import type { TaxonomyOption } from '@/types';

interface AcademicProfile {
  academicLevel: string;
  stream: string | null;
  boardName: string | null;
  courseName: string | null;
  classYear: string | null;
  semester: string | null;
  subjectsOfInterest: string[];
  targetExams: string[];
  goals: string | null;
  state: string | null;
  preferredLang: string;
}

const LANGUAGES = [
  { value: 'en', label: 'English' }, { value: 'hi', label: 'Hindi' },
  { value: 'ta', label: 'Tamil' }, { value: 'te', label: 'Telugu' },
  { value: 'kn', label: 'Kannada' }, { value: 'ml', label: 'Malayalam' },
  { value: 'mr', label: 'Marathi' }, { value: 'bn', label: 'Bengali' },
  { value: 'gu', label: 'Gujarati' },
];

export default function AcademicProfilePage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Taxonomy data
  const [academicLevels, setAcademicLevels] = useState<TaxonomyOption[]>([]);
  const [streams, setStreams] = useState<TaxonomyOption[]>([]);
  const [boards, setBoards] = useState<TaxonomyOption[]>([]);
  const [subjects, setSubjects] = useState<{ name: string; code: string }[]>([]);
  const [competitiveExams, setCompetitiveExams] = useState<TaxonomyOption[]>([]);
  const [grades, setGrades] = useState<TaxonomyOption[]>([]);

  // Form state
  const [formData, setFormData] = useState({
    academicLevel: '',
    stream: '',
    boardName: '',
    courseName: '',
    classYear: '',
    semester: '',
    subjectsOfInterest: [] as string[],
    targetExams: [] as string[],
    goals: '',
    state: '',
    preferredLang: 'en',
  });

  const [expandedSections, setExpandedSections] = useState({
    academic: true,
    subjects: true,
    goals: true,
  });

  // Load taxonomy and existing profile
  useEffect(() => {
    const load = async () => {
      try {
        const [levelsRes, streamsRes, boardsRes, examsRes, gradesRes, profileRes] = await Promise.all([
          api.get('/taxonomy/academic-levels'),
          api.get('/taxonomy/streams'),
          api.get('/taxonomy/boards'),
          api.get('/taxonomy/competitive-exams'),
          api.get('/taxonomy/grades'),
          api.get('/students/academic-profile').catch(() => null),
        ]);

        setAcademicLevels(levelsRes.data.data || []);
        setStreams(streamsRes.data.data || []);
        setBoards(boardsRes.data.data || []);
        setCompetitiveExams(examsRes.data.data || []);
        setGrades(gradesRes.data.data || []);

        const profile: AcademicProfile | null = profileRes?.data?.data || null;
        if (profile) {
          setFormData({
            academicLevel: profile.academicLevel || '',
            stream: profile.stream || '',
            boardName: profile.boardName || '',
            courseName: profile.courseName || '',
            classYear: profile.classYear || '',
            semester: profile.semester || '',
            subjectsOfInterest: profile.subjectsOfInterest || [],
            targetExams: profile.targetExams || [],
            goals: profile.goals || '',
            state: profile.state || '',
            preferredLang: profile.preferredLang || 'en',
          });
        }
      } catch {
        // Continue with defaults
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Load subjects when level/stream changes
  useEffect(() => {
    if (!formData.academicLevel) return;
    const params = new URLSearchParams();
    if (formData.academicLevel) params.append('level', formData.academicLevel);
    if (formData.stream) params.append('stream', formData.stream);

    api.get(`/taxonomy/subjects?${params.toString()}`)
      .then((r) => setSubjects(r.data.data || []))
      .catch(() => setSubjects([]));
  }, [formData.academicLevel, formData.stream]);

  const updateField = useCallback((field: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const toggleSubject = useCallback((subject: string) => {
    setFormData((prev) => ({
      ...prev,
      subjectsOfInterest: prev.subjectsOfInterest.includes(subject)
        ? prev.subjectsOfInterest.filter((s) => s !== subject)
        : [...prev.subjectsOfInterest, subject],
    }));
  }, []);

  const toggleExam = useCallback((exam: string) => {
    setFormData((prev) => ({
      ...prev,
      targetExams: prev.targetExams.includes(exam)
        ? prev.targetExams.filter((e) => e !== exam)
        : [...prev.targetExams, exam],
    }));
  }, []);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleSave = async () => {
    if (!formData.academicLevel) {
      toast.error('Please select your academic level');
      return;
    }
    setSaving(true);
    try {
      await api.put('/students/academic-profile', formData);
      toast.success('Academic profile saved!');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  // Filter streams based on selected level
  const filteredStreams = streams.filter((s) => {
    // The taxonomy API should handle this, but we also filter client-side for responsiveness
    return true; // Show all streams, let user pick
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
      </div>
    );
  }

  // Redirect if not B2C student
  if (user && user.tenantId && user.role !== 'STUDENT') {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
        <h1 className="text-xl font-bold text-gray-900 mb-2">Not Available</h1>
        <p className="text-gray-500">This page is for individual students. Your academic profile is managed by your institution.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <GraduationCap className="w-6 h-6 text-brand-600" />
          Academic Profile
        </h1>
        <p className="text-gray-500 mt-1">
          Set up your academic details so we can personalize your learning experience
        </p>
      </div>

      {/* Section 1: Academic Level & Structure */}
      <CollapsibleSection
        title="Academic Details"
        icon={BookOpen}
        expanded={expandedSections.academic}
        onToggle={() => toggleSection('academic')}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Academic Level *</label>
              <select
                className="input-field"
                value={formData.academicLevel}
                onChange={(e) => {
                  updateField('academicLevel', e.target.value);
                  updateField('stream', '');
                  updateField('classYear', '');
                  updateField('subjectsOfInterest', []);
                }}
              >
                <option value="">Select level</option>
                {academicLevels.map((l) => (
                  <option key={l.value} value={l.value}>{l.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stream / Domain</label>
              <select
                className="input-field"
                value={formData.stream}
                onChange={(e) => {
                  updateField('stream', e.target.value);
                  updateField('subjectsOfInterest', []);
                }}
              >
                <option value="">Select stream</option>
                {filteredStreams.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Board / Curriculum</label>
              <select
                className="input-field"
                value={formData.boardName}
                onChange={(e) => updateField('boardName', e.target.value)}
              >
                <option value="">Select board</option>
                {boards.map((b) => (
                  <option key={b.value} value={b.value}>{b.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Class / Year</label>
              <select
                className="input-field"
                value={formData.classYear}
                onChange={(e) => updateField('classYear', e.target.value)}
              >
                <option value="">Select</option>
                {grades.map((g) => (
                  <option key={g.value} value={g.value}>{g.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Course Name</label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g., B.Tech CSE, B.Sc Physics"
                value={formData.courseName}
                onChange={(e) => updateField('courseName', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g., Sem 3, Term 1"
                value={formData.semester}
                onChange={(e) => updateField('semester', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
              <input
                type="text"
                className="input-field"
                placeholder="Your state (for state board)"
                value={formData.state}
                onChange={(e) => updateField('state', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Language</label>
              <select
                className="input-field"
                value={formData.preferredLang}
                onChange={(e) => updateField('preferredLang', e.target.value)}
              >
                {LANGUAGES.map((l) => (
                  <option key={l.value} value={l.value}>{l.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </CollapsibleSection>

      {/* Section 2: Subjects of Interest */}
      <CollapsibleSection
        title="Subjects of Interest"
        icon={BookOpen}
        expanded={expandedSections.subjects}
        onToggle={() => toggleSection('subjects')}
      >
        {subjects.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {subjects.map((s) => (
              <button
                key={s.code}
                type="button"
                onClick={() => toggleSubject(s.name)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                  formData.subjectsOfInterest.includes(s.name)
                    ? 'bg-brand-50 text-brand-700 border-brand-300'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                }`}
              >
                {s.name}
              </button>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400 italic">
            {formData.academicLevel
              ? 'No subjects found for this combination. Select a different level or stream.'
              : 'Select your academic level first to see available subjects.'}
          </p>
        )}
        {formData.subjectsOfInterest.length > 0 && (
          <p className="text-xs text-gray-500 mt-2">
            {formData.subjectsOfInterest.length} subject{formData.subjectsOfInterest.length !== 1 ? 's' : ''} selected
          </p>
        )}
      </CollapsibleSection>

      {/* Section 3: Goals & Target Exams */}
      <CollapsibleSection
        title="Goals & Target Exams"
        icon={Target}
        expanded={expandedSections.goals}
        onToggle={() => toggleSection('goals')}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Learning Goals</label>
            <textarea
              className="input-field"
              rows={3}
              placeholder="What are you preparing for? e.g., Board exams, JEE Main, NEET UG, campus placements..."
              value={formData.goals}
              onChange={(e) => updateField('goals', e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Target Competitive Exams</label>
            <div className="flex flex-wrap gap-2">
              {competitiveExams.map((exam) => (
                <button
                  key={exam.value}
                  type="button"
                  onClick={() => toggleExam(exam.value)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                    formData.targetExams.includes(exam.value)
                      ? 'bg-violet-50 text-violet-700 border-violet-300'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {exam.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </CollapsibleSection>

      {/* Save Button */}
      <div className="flex justify-end mt-6">
        <button
          onClick={handleSave}
          disabled={saving || !formData.academicLevel}
          className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-brand-600 text-white font-medium hover:bg-brand-700 disabled:opacity-60 transition-colors"
        >
          {saving ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
          ) : (
            <><Save className="w-4 h-4" /> Save Academic Profile</>
          )}
        </button>
      </div>
    </div>
  );
}

// ─── Collapsible Section ─────────────────────────────────────

function CollapsibleSection({ title, icon: Icon, expanded, onToggle, children }: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-4 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Icon className="w-5 h-5 text-brand-600" />
          <span className="text-base font-semibold text-gray-900">{title}</span>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>
      {expanded && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}
