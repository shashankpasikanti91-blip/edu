'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Brain,
  FileText,
  Bell,
  Calendar,
  Clock,
  TrendingUp,
  Heart,
  CheckCircle,
  Circle,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import type { DashboardStats } from '@/types';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const { data } = await api.get('/users/dashboard');
        setStats(data.data);
      } catch {
        // Stats are non-critical, fail silently
      } finally {
        setIsLoadingStats(false);
      }
    }
    fetchStats();
  }, []);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            {greeting()}, {user?.firstName || 'there'}!
          </h1>
          <p className="text-gray-500 mt-1">
            {user?.accountType === 'B2C_STUDENT'
              ? `Student ID: ${user?.directStudentId || '—'} • Your personal learning dashboard`
              : "Here's your learning overview for today."}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard/notifications" className="relative p-2.5 rounded-xl bg-white border border-gray-100 hover:bg-gray-50 transition-colors shadow-sm">
            <Bell className="w-5 h-5 text-gray-600" />
            {stats && stats.unreadNotifications > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                {stats.unreadNotifications}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="bg-white rounded-2xl border border-gray-100/80 p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-brand-100 to-brand-50 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-brand-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {isLoadingStats ? '—' : stats?.totalQuizAttempts ?? 0}
          </p>
          <p className="text-sm text-gray-500">Quizzes Attempted</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100/80 p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-emerald-50 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {isLoadingStats ? '—' : stats?.totalNotes ?? 0}
          </p>
          <p className="text-sm text-gray-500">Notes Created</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100/80 p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-100 to-amber-50 rounded-xl flex items-center justify-center">
              <Calendar className="w-5 h-5 text-amber-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {isLoadingStats ? '—' : stats?.todayStudyPlans?.length ?? 0}
          </p>
          <p className="text-sm text-gray-500">Today&apos;s Tasks</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100/80 p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-rose-100 to-rose-50 rounded-xl flex items-center justify-center">
              <Bell className="w-5 h-5 text-rose-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {isLoadingStats ? '—' : stats?.unreadNotifications ?? 0}
          </p>
          <p className="text-sm text-gray-500">Notifications</p>
        </div>
      </div>

      {/* Study Plan & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Study Plan */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Today&apos;s Study Plan</h2>
            <Link
              href="/dashboard/planner"
              className="text-sm text-brand-600 hover:text-brand-700 font-medium"
            >
              View all
            </Link>
          </div>

          {stats?.todayStudyPlans && stats.todayStudyPlans.length > 0 ? (
            <div className="space-y-3">
              {stats.todayStudyPlans.map((plan) => (
                <div
                  key={plan.id}
                  className="flex items-center gap-4 p-3 rounded-xl bg-surface-secondary"
                >
                  {plan.isCompleted ? (
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  ) : (
                    <Circle className="w-5 h-5 text-gray-300 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${plan.isCompleted ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                      {plan.title}
                    </p>
                    <p className="text-xs text-gray-500">{plan.subjectName}</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Clock className="w-3.5 h-3.5" />
                    {plan.duration} min
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No study plans for today</p>
              <Link
                href="/dashboard/planner"
                className="text-sm text-brand-600 hover:text-brand-700 font-medium mt-2 inline-block"
              >
                Create a plan
              </Link>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-2">
            <Link
              href="/dashboard/ai-assistant"
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-brand-50 transition-colors group"
            >
              <div className="w-10 h-10 bg-brand-100 rounded-xl flex items-center justify-center group-hover:bg-brand-200 transition-colors">
                <Brain className="w-5 h-5 text-brand-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Ask AI a Doubt</p>
                <p className="text-xs text-gray-500">Get instant explanations</p>
              </div>
            </Link>

            <Link
              href="/dashboard/exam-prep"
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-green-50 transition-colors group"
            >
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center group-hover:bg-green-200 transition-colors">
                <BookOpen className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Take a Quiz</p>
                <p className="text-xs text-gray-500">Test your knowledge</p>
              </div>
            </Link>

            <Link
              href="/dashboard/notes"
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-amber-50 transition-colors group"
            >
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center group-hover:bg-amber-200 transition-colors">
                <FileText className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Create a Note</p>
                <p className="text-xs text-gray-500">Capture your thoughts</p>
              </div>
            </Link>

            <Link
              href="/dashboard/wellness"
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-rose-50 transition-colors group"
            >
              <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center group-hover:bg-rose-200 transition-colors">
                <Heart className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Focus Timer</p>
                <p className="text-xs text-gray-500">Study with breaks</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
