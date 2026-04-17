'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, BookOpen, FileText, Calendar, Target, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

interface ProgressData {
  period: { start: string; end: string; days: number };
  quizzes: { total: number; completed: number; averageScore: number };
  studyPlans: { total: number; completed: number; totalStudyMinutes: number; totalStudyHours: number };
  notesCreated: number;
}

export default function ProgressPage() {
  const [data, setData] = useState<ProgressData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState(30);

  useEffect(() => {
    fetchProgress();
  }, [period]);

  const fetchProgress = async () => {
    setIsLoading(true);
    try {
      const { data: res } = await api.get(`/students/progress?days=${period}`);
      setData(res.data);
    } catch {
      // Non-critical
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Progress</h1>
          <p className="text-gray-500 mt-1">Track your study performance over time</p>
        </div>
        <select
          value={period}
          onChange={(e) => setPeriod(Number(e.target.value))}
          className="input-field w-auto"
        >
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 3 months</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="w-10 h-10 bg-brand-100 rounded-xl flex items-center justify-center mb-3">
            <BookOpen className="w-5 h-5 text-brand-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{data?.quizzes.completed || 0}</p>
          <p className="text-sm text-gray-500">Quizzes Completed</p>
        </div>

        <div className="card">
          <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mb-3">
            <Target className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{data?.quizzes.averageScore || 0}%</p>
          <p className="text-sm text-gray-500">Average Score</p>
        </div>

        <div className="card">
          <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center mb-3">
            <Calendar className="w-5 h-5 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{data?.studyPlans.totalStudyHours || 0}h</p>
          <p className="text-sm text-gray-500">Study Hours</p>
        </div>

        <div className="card">
          <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center mb-3">
            <FileText className="w-5 h-5 text-rose-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{data?.notesCreated || 0}</p>
          <p className="text-sm text-gray-500">Notes Created</p>
        </div>
      </div>

      {/* Study Plan Completion */}
      <div className="card mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Study Plan Completion</h2>
        <div className="flex items-center gap-4">
          <div className="flex-1 bg-gray-200 rounded-full h-4">
            <div
              className="bg-brand-600 rounded-full h-4 transition-all"
              style={{
                width: `${data?.studyPlans.total ? Math.round((data.studyPlans.completed / data.studyPlans.total) * 100) : 0}%`,
              }}
            />
          </div>
          <span className="text-sm font-medium text-gray-700">
            {data?.studyPlans.completed || 0} / {data?.studyPlans.total || 0}
          </span>
        </div>
      </div>

      {/* Quiz Performance */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Performance Summary</h2>
        <div className="grid grid-cols-2 gap-6">
          <div className="p-4 bg-gray-50 rounded-xl">
            <p className="text-sm text-gray-500 mb-1">Total Quiz Attempts</p>
            <p className="text-xl font-bold text-gray-900">{data?.quizzes.total || 0}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl">
            <p className="text-sm text-gray-500 mb-1">Plans Completed</p>
            <p className="text-xl font-bold text-gray-900">
              {data?.studyPlans.total
                ? `${Math.round((data.studyPlans.completed / data.studyPlans.total) * 100)}%`
                : '0%'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
