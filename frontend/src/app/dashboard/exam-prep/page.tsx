'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, Clock, CheckCircle, AlertCircle, ArrowLeft, Play, BarChart3, Loader2, FileQuestion } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';
import { processLatex } from '@/lib/mathRenderer';

interface QuizAttempt {
  id: string;
  score: number;
  totalMarks: number;
  createdAt: string;
  quiz: { title: string; subject?: { name: string } };
}

const SUBJECTS = [
  'Mathematics', 'Physics', 'Chemistry', 'Biology',
  'Social Science', 'History', 'Geography', 'Economics',
  'English', 'Hindi', 'Computer Science',
  'Engineering Mathematics', 'Data Structures', 'Thermodynamics',
];

const GRADES = [
  'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10',
  'Class 11', 'Class 12', 'B.Tech 1st Year', 'B.Tech 2nd Year',
  'B.Tech 3rd Year', 'B.Tech 4th Year', 'Graduate', 'Post Graduate',
];

const BOARDS = ['CBSE', 'ICSE', 'State Board', 'IB', 'Cambridge', 'NIOS', 'University'];

export default function ExamPrepPage() {
  const { user } = useAuthStore();
  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);

  // Q&A Generator state
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [grade, setGrade] = useState('');
  const [board, setBoard] = useState('');
  const [difficulty, setDifficulty] = useState('mixed');
  const [questionType, setQuestionType] = useState('mixed');
  const [count, setCount] = useState(10);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);

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
        // fail silently
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

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
      });

      setGeneratedContent(data.data.questions);
    } catch {
      toast.error('Failed to generate questions. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
              <select value={subject} onChange={(e) => setSubject(e.target.value)} className="input-field">
                <option value="">Select Subject</option>
                {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Topic (optional)</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., World War 2, Quadratic Equations..."
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Grade / Level</label>
              <select value={grade} onChange={(e) => setGrade(e.target.value)} className="input-field">
                <option value="">Select Grade</option>
                {GRADES.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Board / Curriculum</label>
              <select value={board} onChange={(e) => setBoard(e.target.value)} className="input-field">
                <option value="">Select Board</option>
                {BOARDS.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
              <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="input-field">
                <option value="mixed">Mixed</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Question Type</label>
              <select value={questionType} onChange={(e) => setQuestionType(e.target.value)} className="input-field">
                <option value="mixed">Mixed</option>
                <option value="mcq">MCQ Only</option>
                <option value="short">Short Answer</option>
                <option value="long">Long Answer</option>
                <option value="numerical">Numerical</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Questions:</label>
              <select value={count} onChange={(e) => setCount(Number(e.target.value))} className="input-field w-20">
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={20}>20</option>
              </select>
            </div>
            <button
              onClick={generateQuestions}
              disabled={isGenerating || !subject}
              className="btn-primary flex items-center gap-2"
            >
              {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              Generate Questions
            </button>
          </div>
        </div>

        {/* Generated Content */}
        {isGenerating && (
          <div className="card text-center py-12 mb-8">
            <Loader2 className="w-8 h-8 animate-spin text-brand-600 mx-auto mb-3" />
            <p className="text-gray-500">Generating {count} {subject} questions...</p>
          </div>
        )}

        {generatedContent && !isGenerating && (
          <div className="card mb-8">
            <div className="prose prose-sm max-w-none text-gray-800 leading-relaxed">
              {generatedContent.split('\n').map((line, i) => {
                const renderText = (text: string) => {
                  // Strip bold markers, then process LaTeX
                  const cleaned = text.replace(/\*\*(.*?)\*\*/g, '$1');
                  return processLatex(cleaned);
                };
                const renderWithBold = (text: string) => {
                  // Process bold and LaTeX
                  const parts: React.ReactNode[] = [];
                  let remaining = text;
                  let k = 0;
                  while (remaining.length > 0) {
                    const boldMatch = remaining.match(/\*\*(.*?)\*\*/);
                    if (boldMatch && boldMatch.index !== undefined) {
                      if (boldMatch.index > 0) {
                        parts.push(<span key={`t-${i}-${k++}`}>{processLatex(remaining.slice(0, boldMatch.index))}</span>);
                      }
                      parts.push(<strong key={`b-${i}-${k++}`} className="font-semibold text-gray-900">{processLatex(boldMatch[1])}</strong>);
                      remaining = remaining.slice(boldMatch.index + boldMatch[0].length);
                    } else {
                      parts.push(<span key={`t-${i}-${k++}`}>{processLatex(remaining)}</span>);
                      break;
                    }
                  }
                  return parts;
                };
                if (line.startsWith('## ')) {
                  return <h2 key={i} className="text-xl font-bold text-gray-900 mt-4 mb-2">{renderText(line.replace(/^#+\s*/, ''))}</h2>;
                }
                if (line.startsWith('### ')) {
                  return <h3 key={i} className="text-lg font-semibold text-gray-800 mt-3 mb-1">{renderText(line.replace(/^#+\s*/, ''))}</h3>;
                }
                if (line.startsWith('**') && line.endsWith('**')) {
                  return <p key={i} className="font-semibold text-gray-900 mt-2">{renderText(line.replace(/\*\*/g, ''))}</p>;
                }
                if (line.startsWith('- ') || line.startsWith('* ')) {
                  return <p key={i} className="ml-4 text-gray-700">• {renderWithBold(line.replace(/^[-*]\s*/, ''))}</p>;
                }
                if (line.match(/^\s*\([a-d]\)/i)) {
                  return <p key={i} className="ml-6 text-gray-700">{renderWithBold(line)}</p>;
                }
                if (line.match(/^---+$/)) {
                  return <hr key={i} className="my-3 border-gray-200" />;
                }
                if (line.trim() === '') return <br key={i} />;
                return <p key={i} className="text-gray-700">{renderWithBold(line)}</p>;
              })}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link href="/dashboard/ai-assistant" className="card hover:shadow-elevated transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-brand-100 rounded-xl flex items-center justify-center">
                <Play className="w-5 h-5 text-brand-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Ask AI for Help</p>
                <p className="text-xs text-gray-500">Get explanations &amp; solutions</p>
              </div>
            </div>
          </Link>
          <Link href="/dashboard/progress" className="card hover:shadow-elevated transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">View Progress</p>
                <p className="text-xs text-gray-500">See your score trends</p>
              </div>
            </div>
          </Link>
          <Link href="/dashboard/dictionary" className="card hover:shadow-elevated transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Dictionary</p>
                <p className="text-xs text-gray-500">Look up terms &amp; meanings</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Recent Quiz Attempts */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Quiz Attempts</h2>
          {loading ? (
            <div className="text-center py-8 text-gray-400">Loading...</div>
          ) : quizAttempts.length > 0 ? (
            <div className="space-y-3">
              {quizAttempts.map((attempt) => (
                <div key={attempt.id} className="flex items-center gap-4 p-4 rounded-xl bg-surface-secondary">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    (attempt.score / attempt.totalMarks) >= 0.7 ? 'bg-green-100' : 'bg-amber-100'
                  }`}>
                    {(attempt.score / attempt.totalMarks) >= 0.7 ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-amber-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900">{attempt.quiz?.title || 'Quiz'}</p>
                    <p className="text-xs text-gray-500">{attempt.quiz?.subject?.name || 'General'}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{attempt.score}/{attempt.totalMarks}</p>
                    <p className="text-xs text-gray-400">
                      <Clock className="w-3 h-3 inline mr-1" />
                      {new Date(attempt.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-2">No quizzes attempted yet</p>
              <p className="text-sm text-gray-400 mb-4">Use the Question Generator above to create practice questions!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
