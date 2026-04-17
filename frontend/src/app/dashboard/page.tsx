'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  Users,
  Building2,
  BarChart3,
  GraduationCap,
  Settings,
  AlertCircle,
  Loader2,
  CreditCard,
  Shield,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import type { DashboardStats } from '@/types';

const ADMIN_ROLES = ['SUPER_ADMIN', 'INSTITUTION_OWNER', 'INSTITUTION_ADMIN'];
const TEACHER_ROLES = ['TEACHER', 'HOD'];

export default function DashboardPage() {
  const { user } = useAuthStore();
  const role = user?.role;
  const accountType = user?.accountType;

  // Show institution admin dashboard for owners/admins
  if (role && ADMIN_ROLES.includes(role)) {
    return <AdminDashboard />;
  }

  // Show teacher dashboard
  if (role && TEACHER_ROLES.includes(role)) {
    return <TeacherDashboard />;
  }

  // Default: student dashboard (both B2C and B2B students)
  return <StudentDashboard />;
}

// ─── Student Dashboard ───────────────────────────────────────

function StudentDashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const endpoint = user?.accountType === 'B2C_STUDENT' ? '/student/dashboard' : '/users/dashboard';
        const { data } = await api.get(endpoint);
        setStats(data.data);
      } catch {
        // Stats are non-critical
      } finally {
        setIsLoadingStats(false);
      }
    }
    fetchStats();
  }, [user?.accountType]);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <>
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
        <Link href="/dashboard/notifications" className="relative p-2.5 rounded-xl bg-white border border-gray-100 hover:bg-gray-50 transition-colors shadow-sm">
          <Bell className="w-5 h-5 text-gray-600" />
          {stats && stats.unreadNotifications > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
              {stats.unreadNotifications}
            </span>
          )}
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard icon={TrendingUp} color="brand" label="Quizzes Attempted" value={isLoadingStats ? '—' : String(stats?.totalQuizAttempts ?? 0)} />
        <StatCard icon={FileText} color="green" label="Notes Created" value={isLoadingStats ? '—' : String(stats?.totalNotes ?? 0)} />
        <StatCard icon={Calendar} color="amber" label="Today's Tasks" value={isLoadingStats ? '—' : String(stats?.todayStudyPlans?.length ?? 0)} />
        <StatCard icon={Bell} color="rose" label="Notifications" value={isLoadingStats ? '—' : String(stats?.unreadNotifications ?? 0)} />
      </div>

      {/* Study Plan & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Today&apos;s Study Plan</h2>
            <Link href="/dashboard/planner" className="text-sm text-brand-600 hover:text-brand-700 font-medium">View all</Link>
          </div>
          {stats?.todayStudyPlans && stats.todayStudyPlans.length > 0 ? (
            <div className="space-y-3">
              {stats.todayStudyPlans.map((plan) => (
                <div key={plan.id} className="flex items-center gap-4 p-3 rounded-xl bg-surface-secondary">
                  {plan.isCompleted ? <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" /> : <Circle className="w-5 h-5 text-gray-300 flex-shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${plan.isCompleted ? 'text-gray-400 line-through' : 'text-gray-900'}`}>{plan.title}</p>
                    <p className="text-xs text-gray-500">{plan.subjectName}</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Clock className="w-3.5 h-3.5" />{plan.duration} min
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No study plans for today</p>
              <Link href="/dashboard/planner" className="text-sm text-brand-600 hover:text-brand-700 font-medium mt-2 inline-block">Create a plan</Link>
            </div>
          )}
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-2">
            <QuickAction href="/dashboard/ai-assistant" icon={Brain} color="brand" title="Ask AI a Doubt" desc="Get instant explanations" />
            <QuickAction href="/dashboard/exam-prep" icon={BookOpen} color="green" title="Take a Quiz" desc="Test your knowledge" />
            <QuickAction href="/dashboard/notes" icon={FileText} color="amber" title="Create a Note" desc="Capture your thoughts" />
            <QuickAction href="/dashboard/wellness" icon={Heart} color="rose" title="Focus Timer" desc="Study with breaks" />
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Admin Dashboard ─────────────────────────────────────────

interface InstitutionStats {
  totalUsers: number;
  totalTeachers: number;
  totalStudents: number;
  totalDepartments: number;
  onboardingStatus: string;
  institutionName: string;
  subscription?: { plan?: { name: string }; status: string; validUntil?: string };
}

function AdminDashboard() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [stats, setStats] = useState<InstitutionStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const { data } = await api.get('/institution/profile');
        const profile = data.data.profile;
        const tenant = data.data.tenant;
        setStats({
          totalUsers: tenant?._count?.users ?? 0,
          totalTeachers: 0, // Would need separate count
          totalStudents: 0,
          totalDepartments: tenant?._count?.departments ?? 0,
          onboardingStatus: profile?.onboardingStatus || 'NOT_STARTED',
          institutionName: profile?.institutionName || tenant?.name || '—',
          subscription: tenant?.subscription,
        });
      } catch {
        // Non-critical
      } finally {
        setLoading(false);
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

  const needsOnboarding = stats && stats.onboardingStatus !== 'COMPLETED';

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            {greeting()}, {user?.firstName || 'there'}!
          </h1>
          <p className="text-gray-500 mt-1">
            {stats?.institutionName || 'Institution'} — Admin Dashboard
          </p>
        </div>
        <Link href="/dashboard/notifications" className="relative p-2.5 rounded-xl bg-white border border-gray-100 hover:bg-gray-50 transition-colors shadow-sm">
          <Bell className="w-5 h-5 text-gray-600" />
        </Link>
      </div>

      {/* Onboarding Banner */}
      {needsOnboarding && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600" />
            <div>
              <p className="text-sm font-semibold text-amber-800">Complete Institution Setup</p>
              <p className="text-xs text-amber-600">Finish onboarding to unlock all features for your institution.</p>
            </div>
          </div>
          <Link
            href="/dashboard/onboarding"
            className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors"
          >
            Continue Setup
          </Link>
        </div>
      )}

      {/* Institution Stats */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-brand-600" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            <StatCard icon={Users} color="brand" label="Total Users" value={String(stats?.totalUsers ?? 0)} />
            <StatCard icon={Building2} color="violet" label="Departments" value={String(stats?.totalDepartments ?? 0)} />
            <StatCard icon={CreditCard} color="green" label="Plan" value={stats?.subscription?.plan?.name || 'Free'} />
            <StatCard icon={Shield} color="amber" label="Status" value={stats?.subscription?.status === 'ACTIVE' ? 'Active' : 'Inactive'} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Management Quick Actions */}
            <div className="lg:col-span-2 card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Institution Management</h2>
              <div className="grid grid-cols-2 gap-3">
                <QuickActionCard href="/dashboard/manage-users" icon={Users} color="brand" title="Manage Users" desc="Add teachers, students, and staff" />
                <QuickActionCard href="/dashboard/departments" icon={Building2} color="violet" title="Departments" desc="Organize academic departments" />
                <QuickActionCard href="/dashboard/analytics" icon={BarChart3} color="green" title="Analytics" desc="View performance reports" />
                <QuickActionCard href="/dashboard/settings" icon={Settings} color="gray" title="Settings" desc="Institution configuration" />
              </div>
            </div>

            {/* Academic Tools */}
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Academic Tools</h2>
              <div className="space-y-2">
                <QuickAction href="/dashboard/exam-prep" icon={BookOpen} color="green" title="Exam Prep" desc="Generate question papers" />
                <QuickAction href="/dashboard/ai-assistant" icon={Brain} color="brand" title="AI Assistant" desc="AI-powered tutoring" />
                <QuickAction href="/dashboard/resources" icon={GraduationCap} color="amber" title="Resources" desc="Content library" />
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

// ─── Teacher Dashboard ───────────────────────────────────────

function TeacherDashboard() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false); // Placeholder — would fetch teacher-specific stats
  }, []);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            {greeting()}, {user?.firstName || 'there'}!
          </h1>
          <p className="text-gray-500 mt-1">Teacher Dashboard — Create, assess, and support students</p>
        </div>
        <Link href="/dashboard/notifications" className="relative p-2.5 rounded-xl bg-white border border-gray-100 hover:bg-gray-50 transition-colors shadow-sm">
          <Bell className="w-5 h-5 text-gray-600" />
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Teaching Tools */}
        <div className="lg:col-span-2 card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Teaching Tools</h2>
          <div className="grid grid-cols-2 gap-3">
            <QuickActionCard href="/dashboard/exam-prep" icon={BookOpen} color="green" title="Create Question Paper" desc="AI-generated questions by topic" />
            <QuickActionCard href="/dashboard/ai-assistant" icon={Brain} color="brand" title="AI Teaching Aid" desc="Generate explanations & examples" />
            <QuickActionCard href="/dashboard/notes" icon={FileText} color="amber" title="Create Notes" desc="Share notes with students" />
            <QuickActionCard href="/dashboard/resources" icon={GraduationCap} color="violet" title="Resource Library" desc="Upload and manage content" />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-2">
            <QuickAction href="/dashboard/analytics" icon={BarChart3} color="green" title="Student Progress" desc="Track class performance" />
            <QuickAction href="/dashboard/planner" icon={Calendar} color="amber" title="Lesson Planner" desc="Plan your lessons" />
            <QuickAction href="/dashboard/settings" icon={Settings} color="gray" title="Profile & Settings" desc="Update your profile" />
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Shared Components ───────────────────────────────────────

const colorMap: Record<string, { bg: string; icon: string }> = {
  brand: { bg: 'bg-gradient-to-br from-brand-100 to-brand-50', icon: 'text-brand-600' },
  green: { bg: 'bg-gradient-to-br from-green-100 to-emerald-50', icon: 'text-green-600' },
  amber: { bg: 'bg-gradient-to-br from-amber-100 to-amber-50', icon: 'text-amber-600' },
  rose: { bg: 'bg-gradient-to-br from-rose-100 to-rose-50', icon: 'text-rose-600' },
  violet: { bg: 'bg-gradient-to-br from-violet-100 to-violet-50', icon: 'text-violet-600' },
  gray: { bg: 'bg-gradient-to-br from-gray-100 to-gray-50', icon: 'text-gray-600' },
};

function StatCard({ icon: Icon, color, label, value }: {
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  label: string;
  value: string;
}) {
  const c = colorMap[color] || colorMap.brand;
  return (
    <div className="bg-white rounded-2xl border border-gray-100/80 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="mb-3">
        <div className={`w-10 h-10 ${c.bg} rounded-xl flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${c.icon}`} />
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  );
}

function QuickAction({ href, icon: Icon, color, title, desc }: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  title: string;
  desc: string;
}) {
  const c = colorMap[color] || colorMap.brand;
  return (
    <Link href={href} className={`flex items-center gap-3 p-3 rounded-xl hover:bg-${color}-50 transition-colors group`}>
      <div className={`w-10 h-10 ${c.bg} rounded-xl flex items-center justify-center transition-colors`}>
        <Icon className={`w-5 h-5 ${c.icon}`} />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-900">{title}</p>
        <p className="text-xs text-gray-500">{desc}</p>
      </div>
    </Link>
  );
}

function QuickActionCard({ href, icon: Icon, color, title, desc }: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  title: string;
  desc: string;
}) {
  const c = colorMap[color] || colorMap.brand;
  return (
    <Link href={href} className="p-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all group">
      <div className={`w-10 h-10 ${c.bg} rounded-xl flex items-center justify-center mb-3`}>
        <Icon className={`w-5 h-5 ${c.icon}`} />
      </div>
      <p className="text-sm font-semibold text-gray-900">{title}</p>
      <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
    </Link>
  );
}
