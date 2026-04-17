'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2, FileQuestion, BookOpen, Clock, CheckCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';
import { processLatex } from '@/lib/mathRenderer';
import type { TaxonomyOption, SubjectEntry } from '@/types';

// ─── Local types ────────────────────────────────────────────

interface AcademicLevel extends TaxonomyOption {
  grades?: string[];
}

interface StreamOption extends TaxonomyOption {
  levels?: string[];
}

interface CourseOption {
  code: string;
  name: string;
  stream: string;
  level: string;
  duration: string;
  semesters?: number;
  yearBased?: boolean;
  professionalYears?: string[];
}

interface QuizAttempt {
  id: string;
  score: number;
  totalMarks: number;
  createdAt: string;
  quiz: { title: string; subject?: { name: string } };
}

// ─── Component ──────────────────────────────────────────────

export default function ExamPrepPage() {
  const { user } = useAuthStore();
  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);

  // Taxonomy reference data
  const [academicLevels, setAcademicLevels] = useState<AcademicLevel[]>([]);
  const [allStreams, setAllStreams] = useState<StreamOption[]>([]);
  const [filteredStreams, setFilteredStreams] = useState<StreamOption[]>([]);
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [yearsOrSemesters, setYearsOrSemesters] = useState<string[]>([]);
  const [grades, setGrades] = useState<string[]>([]);
  const [subjects, setSubjects] = useState<SubjectEntry[]>([]);
  const [boards, setBoards] = useState<{ name: string; shortName: string }[]>([]);
  const [examTypes, setExamTypes] = useState<TaxonomyOption[]>([]);
  const [difficultyLevels, setDifficultyLevels] = useState<TaxonomyOption[]>([]);

  // Institution context (B2B)
  const [instContext, setInstContext] = useState<{
    profile?: { levelsOffered?: string[]; streamsOffered?: string[]; affiliatedBody?: string };
    subjects?: { name: string; code: string }[];
  } | null>(null);

  // Student academic profile (B2C)
  const [studentProfile, setStudentProfile] = useState<{
    academicLevel?: string;
    stream?: string;
    boardName?: string;
    courseName?: string;
    classYear?: string;
    subjectsOfInterest?: string[];
  } | null>(null);

  // Generator form state
  const [level, setLevel] = useState('');
  const [stream, setStream] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [classYear, setClassYear] = useState('');
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [grade, setGrade] = useState('');
  const [board, setBoard] = useState('');
  const [difficulty, setDifficulty] = useState('mixed');
  const [questionType, setQuestionType] = useState('mixed');
  const [count, setCount] = useState(10);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);

  // Whether to show the course selector (only for levels with courses)
  const showCourseSelector = ['DIPLOMA', 'UG', 'PG', 'DOCTORAL', 'PROFESSIONAL', 'COMPETITIVE_EXAM', 'SKILL_VOCATIONAL'].includes(level);
  const showGradeSelector = !showCourseSelector && level !== '';

  // ─── Data Loading ───────────────────────────────────────

  // Load taxonomy reference data
  useEffect(() => {
    async function loadTaxonomy() {
      try {
        const [levelsRes, streamsRes, boardsRes, examTypesRes, diffRes] = await Promise.all([
          api.get('/taxonomy/academic-levels'),
          api.get('/taxonomy/streams'),
          api.get('/taxonomy/boards'),
          api.get('/taxonomy/exam-types'),
          api.get('/taxonomy/difficulty-levels'),
        ]);
        setAcademicLevels(levelsRes.data.data || []);
        setAllStreams(streamsRes.data.data || []);
        setBoards(boardsRes.data.data || []);
        setExamTypes(examTypesRes.data.data || []);
        setDifficultyLevels(diffRes.data.data || []);
      } catch {
        // silent — hardcoded fallbacks exist in selects
      }
    }
    loadTaxonomy();
  }, []);

  // Load institution context for B2B users
  useEffect(() => {
    if (user?.accountType === 'B2B_INSTITUTION' && user?.tenantId) {
      api.get('/institution/academic-context').then(({ data }) => {
        setInstContext(data.data);
      }).catch(() => {});
    }
  }, [user]);

  // Load student academic profile for B2C users (prefill)
  useEffect(() => {
    if (user?.accountType === 'B2C_STUDENT') {
      api.get('/students/academic-profile').then(({ data }) => {
        const profile = data.data;
        if (profile) {
          setStudentProfile(profile);
          if (profile.academicLevel) setLevel(profile.academicLevel);
          if (profile.stream) setStream(profile.stream);
          if (profile.boardName) setBoard(profile.boardName);
        }
      }).catch(() => {});
    }
  }, [user]);

  // Load quiz attempts
  useEffect(() => {
    async function load() {
      try {
        if (user?.accountType === 'B2C_STUDENT') {
          const { data } = await api.get('/students/dashboard');
          setQuizAttempts(data.data?.recentQuizAttempts || []);
        } else {
          const { data } = await api.get('/analytics/student');
          setQuizAttempts(data.data?.recentQuizzes || []);
        }
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  // ─── Cascading Filters ─────────────────────────────────

  // Filter streams by level + institution constraints
  useEffect(() => {
    if (level) {
      let filtered = allStreams.filter(s => s.levels?.includes(level));
      if (instContext?.profile?.streamsOffered?.length) {
        const instStreams = instContext.profile.streamsOffered;
        const instFiltered = filtered.filter(s => instStreams.includes(s.value));
        if (instFiltered.length > 0) filtered = instFiltered;
      }
      setFilteredStreams(filtered);
      if (stream && !filtered.some(s => s.value === stream)) {
        setStream('');
      }
    } else {
      setFilteredStreams(allStreams);
    }
  }, [level, allStreams, instContext, stream]);

  // Load grades when level changes (for school levels)
  useEffect(() => {
    if (level && showGradeSelector) {
      const found = academicLevels.find(l => l.value === level);
      setGrades(found?.grades || []);
      setGrade('');
    } else {
      setGrades([]);
    }
  }, [level, academicLevels, showGradeSelector]);

  // Load courses when stream+level changes (for higher ed)
  useEffect(() => {
    if (stream && showCourseSelector) {
      api.get(`/taxonomy/courses?stream=${stream}&level=${level}`)
        .then(({ data }) => setCourses(data.data || []))
        .catch(() => setCourses([]));
      setCourseCode('');
      setClassYear('');
    } else {
      setCourses([]);
      setCourseCode('');
    }
  }, [stream, level, showCourseSelector]);

  // Load years/semesters when course changes
  useEffect(() => {
    if (courseCode) {
      api.get(`/taxonomy/years?courseCode=${courseCode}`)
        .then(({ data }) => setYearsOrSemesters(data.data || []))
        .catch(() => setYearsOrSemesters([]));
      setClassYear('');
    } else {
      setYearsOrSemesters([]);
    }
  }, [courseCode]);

  // Load subjects when stream/level/course changes
  const loadSubjects = useCallback(async () => {
    if (!stream && !level) {
      setSubjects([]);
      return;
    }
    try {
      const params = new URLSearchParams();
      if (stream) params.set('stream', stream);
      if (level) params.set('level', level);
      if (courseCode) params.set('courseCode', courseCode);
      const { data } = await api.get(`/taxonomy/subjects?${params.toString()}`);
      setSubjects(data.data || []);
    } catch {
      setSubjects([]);
    }
  }, [stream, level, courseCode]);

  useEffect(() => {
    loadSubjects();
    setSubject('');
  }, [loadSubjects]);

  // Set defaults from institution context
  useEffect(() => {
    if (instContext?.profile) {
      const ip = instContext.profile;
      if (ip.levelsOffered?.length === 1) setLevel(ip.levelsOffered[0]);
      if (ip.affiliatedBody) setBoard(ip.affiliatedBody);
    }
  }, [instContext]);

  // ─── Generate ───────────────────────────────────────────

  const generateQuestions = async () => {
    if (!subject) {
      toast.error('Please select a subject');
      return;
    }

    setIsGenerating(true);
    setGeneratedContent(null);

    try {
      const { data } = await api.post('/ai/generate/questions', {
        subject,
        topic: topic.trim() || undefined,
        grade: grade || undefined,
        board: board || undefined,
        difficulty,
        questionType,
        count,
        educationCategory: level || undefined,
        stream: stream || undefined,
        courseCode: courseCode || undefined,
        classYear: classYear || undefined,
      });

      setGeneratedContent(data.data.questions);
    } catch {
      toast.error('Failed to generate questions. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // ─── Render ─────────────────────────────────────────────

  return (
    <div>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/dashboard" className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Exam Prep &amp; Practice</h1>
            <p className="text-gray-500 mt-1">Generate practice questions, take quizzes, and track scores</p>
          </div>
        </div>

        {/* Q&A Generator */}
        <div className="card mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FileQuestion className="w-5 h-5 text-brand-600" />
            AI Question Generator
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Academic Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Academic Level</label>
              <select value={level} onChange={(e) => setLevel(e.target.value)} className="input-field">
                <option value="">Select Level</option>
                {(instContext?.profile?.levelsOffered?.length
                  ? academicLevels.filter(l => instContext.profile!.levelsOffered!.includes(l.value))
                  : academicLevels
                ).map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
              </select>
            </div>

            {/* Stream */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stream / Domain</label>
              <select value={stream} onChange={(e) => setStream(e.target.value)} className="input-field" disabled={!level && filteredStreams.length === 0}>
                <option value="">Select Stream</option>
                {filteredStreams.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>

            {/* Course (shown for higher-ed levels) */}
            {showCourseSelector && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Course / Program</label>
                <select value={courseCode} onChange={(e) => setCourseCode(e.target.value)} className="input-field" disabled={courses.length === 0}>
                  <option value="">{courses.length === 0 ? 'Select stream first' : 'Select Course'}</option>
                  {courses.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
                </select>
              </div>
            )}

            {/* Year / Semester (shown when course is selected) */}
            {showCourseSelector && courseCode && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Year / Semester</label>
                <select value={classYear} onChange={(e) => setClassYear(e.target.value)} className="input-field" disabled={yearsOrSemesters.length === 0}>
                  <option value="">Select Year/Semester</option>
                  {yearsOrSemesters.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            )}

            {/* Grade (shown for school levels) */}
            {showGradeSelector && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Grade / Class</label>
                <select value={grade} onChange={(e) => setGrade(e.target.value)} className="input-field" disabled={grades.length === 0}>
                  <option value="">{grades.length === 0 ? 'Select level first' : 'Select Grade'}</option>
                  {grades.map((g) => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
            )}

            {/* Subject */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
              <select value={subject} onChange={(e) => setSubject(e.target.value)} className="input-field">
                <option value="">Select Subject</option>
                {subjects.map((s) => <option key={s.code} value={s.name}>{s.name}{s.category === 'elective' ? ' (Elective)' : ''}</option>)}
              </select>
            </div>

            {/* Topic */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Topic (optional)</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., Photosynthesis, Quadratic Equations..."
                className="input-field"
              />
            </div>

            {/* Board / Curriculum */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Board / Curriculum</label>
              <select value={board} onChange={(e) => setBoard(e.target.value)} className="input-field">
                <option value="">Select Board</option>
                {boards.map((b) => <option key={b.shortName} value={b.shortName}>{b.name}</option>)}
              </select>
            </div>

            {/* Difficulty */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
              <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="input-field">
                {difficultyLevels.length > 0
                  ? difficultyLevels.map(d => <option key={d.value} value={d.value}>{d.label}</option>)
                  : <>
                      <option value="mixed">Mixed</option>
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </>
                }
              </select>
            </div>

            {/* Question Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Question Type</label>
              <select value={questionType} onChange={(e) => setQuestionType(e.target.value)} className="input-field">
                {examTypes.length > 0
                  ? examTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)
                  : <>
                      <option value="mixed">Mixed</option>
                      <option value="mcq">MCQ Only</option>
                      <option value="descriptive">Descriptive</option>
                    </>
                }
              </select>
            </div>

            {/* Count */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Number of Questions</label>
              <select value={count} onChange={(e) => setCount(Number(e.target.value))} className="input-field">
                {[5, 10, 15, 20, 25, 30].map(n => <option key={n} value={n}>{n} questions</option>)}
              </select>
            </div>
          </div>

          <button
            onClick={generateQuestions}
            disabled={isGenerating || !subject}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
            ) : (
              <><FileQuestion className="w-4 h-4" /> Generate Questions</>
            )}
          </button>
        </div>

        {/* Generated Content */}
        {generatedContent && (
          <div className="card mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-brand-600" />
              Generated Questions
            </h2>
            <div
              className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-700"
              dangerouslySetInnerHTML={{ __html: processLatex(generatedContent) }}
            />
          </div>
        )}

        {/* Quiz History */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-brand-600" />
            Recent Quiz Attempts
          </h2>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-brand-600" />
            </div>
          ) : quizAttempts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CheckCircle className="w-10 h-10 mx-auto mb-2 text-gray-300" />
              <p>No quiz attempts yet. Generate questions above to get started!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {quizAttempts.map((attempt) => (
                <div key={attempt.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{attempt.quiz?.title || 'Quiz'}</p>
                    <p className="text-sm text-gray-500">
                      {attempt.quiz?.subject?.name || 'General'} &middot; {new Date(attempt.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-brand-600">{attempt.score}/{attempt.totalMarks}</p>
                    <p className="text-xs text-gray-500">
                      {Math.round((attempt.score / Math.max(attempt.totalMarks, 1)) * 100)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
