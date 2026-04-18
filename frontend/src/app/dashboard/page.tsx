'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  BookOpen, Brain, FileText, Bell, Calendar, Clock,
  CheckCircle, Circle,
  Users, Building2, BarChart3, GraduationCap, Settings,
  AlertCircle, Loader2, CreditCard, Shield, Target,
  Activity, Zap,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import type { DashboardStats } from '@/types';

const ADMIN_ROLES = ['SUPER_ADMIN', 'INSTITUTION_OWNER', 'INSTITUTION_ADMIN'];
const TEACHER_ROLES = ['TEACHER', 'HOD'];

export default function DashboardPage() {
  const { user } = useAuthStore();
  const role = user?.role;
  if (role && ADMIN_ROLES.includes(role)) return <AdminDashboard />;
  if (role && TEACHER_ROLES.includes(role)) return <TeacherDashboard />;
  return <StudentDashboard />;
}

/* ═══════════════════════════════════════════════════════════
   STUDENT DASHBOARD
   ═══════════════════════════════════════════════════════════ */

function StudentDashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const endpoint = user?.accountType === 'B2C_STUDENT' ? '/student/dashboard' : '/users/dashboard';
        const { data } = await api.get(endpoint);
        setStats(data.data);
      } catch { /* non-critical */ } finally { setIsLoading(false); }
    }
    fetchStats();
  }, [user?.accountType]);

  const greeting = () => {
    const h = new Date().getHours();
    return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
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
              ? `Student ID: ${user?.directStudentId || '\u2014'} \u2022 Your personal learning dashboard`
              : 'Here\u2019s your learning overview for today.'}
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

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KPICard icon={Target} color="brand" label="Quizzes Taken" value={isLoading ? '\u2014' : String(stats?.totalQuizAttempts ?? 0)} />
        <KPICard icon={FileText} color="emerald" label="Notes Created" value={isLoading ? '\u2014' : String(stats?.totalNotes ?? 0)} />
        <KPICard icon={Calendar} color="amber" label="Today\u2019s Tasks" value={isLoading ? '\u2014' : String(stats?.todayStudyPlans?.length ?? 0)} />
        <KPICard icon={Zap} color="violet" label="Notifications" value={isLoading ? '\u2014' : String(stats?.unreadNotifications ?? 0)} />
      </div>

      {/* Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Today's Study Plan (moved up for relevance) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100/80 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900">Today&apos;s Study Plan</h2>
            <Link href="/dashboard/planner" className="text-xs text-brand-600 hover:text-brand-700 font-medium">View all</Link>
          </div>
          {stats?.todayStudyPlans && stats.todayStudyPlans.length > 0 ? (
            <div className="space-y-3">
              {stats.todayStudyPlans.map((plan) => (
                <div key={plan.id} className="flex items-center gap-4 p-3 rounded-xl bg-gray-50/80 hover:bg-gray-100/80 transition-colors">
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
            <EmptyState icon={Calendar} message="No study plans for today" actionLabel="Create a plan" actionHref="/dashboard/planner" />
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl border border-gray-100/80 p-6 shadow-sm">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-2">
            <QuickAction href="/dashboard/ai-assistant" icon={Brain} color="brand" title="Ask AI a Doubt" desc="Get instant explanations" />
            <QuickAction href="/dashboard/exam-prep" icon={BookOpen} color="emerald" title="Practice Quiz" desc="Test your knowledge" />
            <QuickAction href="/dashboard/notes" icon={FileText} color="amber" title="Create a Note" desc="Capture your thoughts" />
            <QuickAction href="/dashboard/analytics" icon={Target} color="violet" title="My Analytics" desc="View detailed progress" />
          </div>
        </div>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════
   ADMIN / INSTITUTION DASHBOARD
   ═══════════════════════════════════════════════════════════ */

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
          totalTeachers: 0,
          totalStudents: 0,
          totalDepartments: tenant?._count?.departments ?? 0,
          onboardingStatus: profile?.onboardingStatus || 'NOT_STARTED',
          institutionName: profile?.institutionName || tenant?.name || '\u2014',
          subscription: tenant?.subscription,
        });
      } catch { /* non-critical */ } finally { setLoading(false); }
    }
    fetchStats();
  }, []);

  const greeting = () => {
    const h = new Date().getHours();
    return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  };

  const needsOnboarding = stats && stats.onboardingStatus !== 'COMPLETED';

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            {greeting()}, {user?.firstName || 'there'}!
          </h1>
          <p className="text-gray-500 mt-1">{stats?.institutionName || 'Institution'} \u2014 Admin Dashboard</p>
        </div>
        <Link href="/dashboard/notifications" className="relative p-2.5 rounded-xl bg-white border border-gray-100 hover:bg-gray-50 transition-colors shadow-sm">
          <Bell className="w-5 h-5 text-gray-600" />
        </Link>
      </div>

      {needsOnboarding && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600" />
            <div>
              <p className="text-sm font-semibold text-amber-800">Complete Institution Setup</p>
              <p className="text-xs text-amber-600">Finish onboarding to unlock all features.</p>
            </div>
          </div>
          <Link href="/dashboard/onboarding" className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors">
            Continue Setup
          </Link>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-brand-600" /></div>
      ) : (
        <>
          {/* KPI Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <KPICard icon={Users} color="brand" label="Total Users" value={String(stats?.totalUsers ?? 0)} />
            <KPICard icon={Building2} color="violet" label="Departments" value={String(stats?.totalDepartments ?? 0)} />
            <KPICard icon={CreditCard} color="emerald" label="Plan" value={stats?.subscription?.plan?.name || 'Free'} />
            <KPICard icon={Shield} color="amber" label="Status" value={stats?.subscription?.status === 'ACTIVE' ? 'Active' : 'Inactive'} />
          </div>

          {/* Analytics Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Institution Overview */}
            <div className="bg-white rounded-2xl border border-gray-100/80 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-semibold text-gray-900">Institution Overview</h2>
                <Link href="/dashboard/analytics" className="text-xs text-brand-600 hover:text-brand-700 font-medium">Details</Link>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <MiniMetric label="Total Users" value={String(stats?.totalUsers ?? 0)} icon={Users} />
                <MiniMetric label="Departments" value={String(stats?.totalDepartments ?? 0)} icon={Building2} />
                <MiniMetric label="Onboarding" value={stats?.onboardingStatus === 'COMPLETED' ? 'Done' : 'Pending'} icon={CheckCircle} />
                <MiniMetric label="Plan Status" value={stats?.subscription?.status === 'ACTIVE' ? 'Active' : 'Inactive'} icon={Shield} />
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100/80 p-6 shadow-sm">
              <h2 className="text-base font-semibold text-gray-900 mb-5">Quick Setup</h2>
              <div className="space-y-3">
                <QuickAction href="/dashboard/manage-users" icon={Users} color="brand" title="Add Users" desc="Invite teachers & students" />
                <QuickAction href="/dashboard/departments" icon={Building2} color="violet" title="Departments" desc="Manage academic units" />
                <QuickAction href="/dashboard/branding" icon={Settings} color="amber" title="Branding" desc="Customize your portal" />
              </div>
            </div>
          </div>

          {/* Management Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100/80 p-6 shadow-sm">
              <h2 className="text-base font-semibold text-gray-900 mb-4">Institution Management</h2>
              <div className="grid grid-cols-2 gap-3">
                <QuickActionCard href="/dashboard/manage-users" icon={Users} color="brand" title="Manage Users" desc="Add teachers, students, staff" />
                <QuickActionCard href="/dashboard/departments" icon={Building2} color="violet" title="Departments" desc="Academic departments" />
                <QuickActionCard href="/dashboard/analytics" icon={BarChart3} color="emerald" title="Analytics" desc="Performance reports" />
                <QuickActionCard href="/dashboard/settings" icon={Settings} color="gray" title="Settings" desc="Institution configuration" />
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100/80 p-6 shadow-sm">
              <h2 className="text-base font-semibold text-gray-900 mb-4">Academic Tools</h2>
              <div className="space-y-2">
                <QuickAction href="/dashboard/exam-prep" icon={BookOpen} color="emerald" title="Exam Prep" desc="Generate question papers" />
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

/* ═══════════════════════════════════════════════════════════
   TEACHER DASHBOARD
   ═══════════════════════════════════════════════════════════ */

function TeacherDashboard() {
  const { user } = useAuthStore();
  const [teacherStats, setTeacherStats] = useState<{ contentCount: number; assessmentCount: number; recentContent: Array<{ id: string; title: string; type: string; status: string; createdAt: string }> } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const { data } = await api.get(`/analytics/teacher/${user?.id}`);
        setTeacherStats(data.data);
      } catch { /* non-critical */ }
      finally { setLoading(false); }
    }
    if (user?.id) fetchStats();
  }, [user?.id]);

  const greeting = () => {
    const h = new Date().getHours();
    return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  };

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{greeting()}, {user?.firstName || 'there'}!</h1>
          <p className="text-gray-500 mt-1">Teacher Dashboard \u2014 Create, assess, and support students</p>
        </div>
        <Link href="/dashboard/notifications" className="relative p-2.5 rounded-xl bg-white border border-gray-100 hover:bg-gray-50 transition-colors shadow-sm">
          <Bell className="w-5 h-5 text-gray-600" />
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-brand-600" /></div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <KPICard icon={FileText} color="brand" label="Content Created" value={String(teacherStats?.contentCount ?? 0)} />
            <KPICard icon={BookOpen} color="emerald" label="Assessments" value={String(teacherStats?.assessmentCount ?? 0)} />
            <KPICard icon={Target} color="amber" label="Total Materials" value={String((teacherStats?.contentCount ?? 0) + (teacherStats?.assessmentCount ?? 0))} />
            <KPICard icon={Activity} color="violet" label="Recent Items" value={String(teacherStats?.recentContent?.length ?? 0)} />
          </div>

          {/* Recent Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-2xl border border-gray-100/80 p-6 shadow-sm">
              <h2 className="text-base font-semibold text-gray-900 mb-4">Recent Content</h2>
              {teacherStats?.recentContent && teacherStats.recentContent.length > 0 ? (
                <div className="space-y-3">
                  {teacherStats.recentContent.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50/80">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{item.title}</p>
                        <p className="text-xs text-gray-500">{item.type.replace(/_/g, ' ')} &bull; {item.status}</p>
                      </div>
                      <span className="text-xs text-gray-400">{new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState icon={FileText} message="No content created yet" actionLabel="Create content" actionHref="/dashboard/resources" />
              )}
            </div>

            <div className="bg-white rounded-2xl border border-gray-100/80 p-6 shadow-sm">
              <h2 className="text-base font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-2">
                <QuickAction href="/dashboard/exam-prep" icon={BookOpen} color="emerald" title="Create Question Paper" desc="AI-generated questions" />
                <QuickAction href="/dashboard/ai-assistant" icon={Brain} color="brand" title="AI Teaching Aid" desc="Generate explanations" />
                <QuickAction href="/dashboard/notes" icon={FileText} color="amber" title="Create Notes" desc="Share with students" />
                <QuickAction href="/dashboard/analytics" icon={BarChart3} color="violet" title="Analytics" desc="View detailed stats" />
              </div>
            </div>
          </div>
        </>
      )}

      {/* Teaching Tools */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100/80 p-6 shadow-sm">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Teaching Tools</h2>
          <div className="grid grid-cols-2 gap-3">
            <QuickActionCard href="/dashboard/exam-prep" icon={BookOpen} color="emerald" title="Create Question Paper" desc="AI-generated questions by topic" />
            <QuickActionCard href="/dashboard/ai-assistant" icon={Brain} color="brand" title="AI Teaching Aid" desc="Generate explanations" />
            <QuickActionCard href="/dashboard/notes" icon={FileText} color="amber" title="Create Notes" desc="Share notes with students" />
            <QuickActionCard href="/dashboard/resources" icon={GraduationCap} color="violet" title="Resource Library" desc="Upload and manage content" />
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100/80 p-6 shadow-sm">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Navigation</h2>
          <div className="space-y-2">
            <QuickAction href="/dashboard/planner" icon={Calendar} color="amber" title="Lesson Planner" desc="Plan your lessons" />
            <QuickAction href="/dashboard/settings" icon={Settings} color="gray" title="Profile" desc="Update your profile" />
          </div>
        </div>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════
   SHARED VISUALIZATION COMPONENTS
   ═══════════════════════════════════════════════════════════ */

const colorMap: Record<string, { bg: string; icon: string; ring: string }> = {
  brand:   { bg: 'bg-gradient-to-br from-brand-100 to-brand-50', icon: 'text-brand-600', ring: 'ring-brand-500/20' },
  emerald: { bg: 'bg-gradient-to-br from-emerald-100 to-emerald-50', icon: 'text-emerald-600', ring: 'ring-emerald-500/20' },
  amber:   { bg: 'bg-gradient-to-br from-amber-100 to-amber-50', icon: 'text-amber-600', ring: 'ring-amber-500/20' },
  rose:    { bg: 'bg-gradient-to-br from-rose-100 to-rose-50', icon: 'text-rose-600', ring: 'ring-rose-500/20' },
  violet:  { bg: 'bg-gradient-to-br from-violet-100 to-violet-50', icon: 'text-violet-600', ring: 'ring-violet-500/20' },
  gray:    { bg: 'bg-gradient-to-br from-gray-100 to-gray-50', icon: 'text-gray-600', ring: 'ring-gray-500/20' },
  green:   { bg: 'bg-gradient-to-br from-green-100 to-emerald-50', icon: 'text-green-600', ring: 'ring-green-500/20' },
};

/* KPI Card with optional trend indicator */
function KPICard({ icon: Icon, color, label, value, trend, up }: {
  icon: React.ComponentType<{ className?: string }>;
  color: string; label: string; value: string;
  trend?: string; up?: boolean;
}) {
  const c = colorMap[color] || colorMap.brand;
  return (
    <div className="bg-white rounded-2xl border border-gray-100/80 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 ${c.bg} rounded-xl flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${c.icon}`} />
        </div>
        {trend && (
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${up ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}>
            {up && '\u2191'}{trend}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  );
}

/* Mini metric card for grid layouts */
function MiniMetric({ label, value, icon: Icon, trend, up }: {
  label: string; value: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: string; up?: boolean;
}) {
  return (
    <div className="p-3.5 rounded-xl bg-gray-50/80 border border-gray-100/50">
      <div className="flex items-center justify-between mb-2">
        <Icon className="w-4 h-4 text-gray-400" />
        {trend && <span className={`text-[10px] font-medium ${up ? 'text-emerald-600' : 'text-gray-400'}`}>{up ? '\u2191' : ''}{trend}</span>}
      </div>
      <p className="text-lg font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
}

/* Empty state */
function EmptyState({ icon: Icon, message, actionLabel, actionHref }: {
  icon: React.ComponentType<{ className?: string }>; message: string;
  actionLabel?: string; actionHref?: string;
}) {
  return (
    <div className="text-center py-8">
      <Icon className="w-10 h-10 text-gray-300 mx-auto mb-3" />
      <p className="text-gray-500 text-sm">{message}</p>
      {actionLabel && actionHref && (
        <Link href={actionHref} className="text-sm text-brand-600 hover:text-brand-700 font-medium mt-2 inline-block">{actionLabel}</Link>
      )}
    </div>
  );
}

/* Quick action link */
function QuickAction({ href, icon: Icon, color, title, desc }: {
  href: string; icon: React.ComponentType<{ className?: string }>;
  color: string; title: string; desc: string;
}) {
  const c = colorMap[color] || colorMap.brand;
  return (
    <Link href={href} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group">
      <div className={`w-10 h-10 ${c.bg} rounded-xl flex items-center justify-center`}>
        <Icon className={`w-5 h-5 ${c.icon}`} />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-900">{title}</p>
        <p className="text-xs text-gray-500">{desc}</p>
      </div>
    </Link>
  );
}

/* Quick action card (grid style) */
function QuickActionCard({ href, icon: Icon, color, title, desc }: {
  href: string; icon: React.ComponentType<{ className?: string }>;
  color: string; title: string; desc: string;
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
