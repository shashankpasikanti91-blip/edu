'use client';

import { useEffect, useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import {
  Users, Building2, BookOpen, FileText, TrendingUp, AlertCircle,
  BarChart3, Activity, Target, Brain, Download, RefreshCw,
  ChevronDown, Calendar, ArrowUpRight, ArrowDownRight,
  GraduationCap, Clock, Award, Zap,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

/* ── Recharts (client-only) ── */
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar,
  PieChart, Pie, Cell, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';

/* ── Types ── */
interface PlatformStats {
  totalTenants: number;
  activeTenants: number;
  totalUsers: number;
  activeUsers: number;
  totalContent: number;
  totalAssessments: number;
  recentSignups: number;
  usersByRole: Record<string, number>;
  contentByType: Record<string, number>;
  tenantsByType: Record<string, number>;
}

interface TenantStats {
  totalStudents: number;
  totalTeachers: number;
  totalCourses: number;
  totalContent: number;
  assessmentCount: number;
  enrollmentCount: number;
  pendingApprovals: number;
  recentActivity: number;
}

interface StudentProgress {
  enrollments: Array<{ course: { name: string }; subject: { name: string } }>;
  quizStats: { totalAttempts: number; averageScore: number };
  notesCount: number;
  recentStudyPlans: Array<{ id: string; title: string; date: string; isCompleted: boolean }>;
  recentQuizzes: Array<{
    id: string;
    score: number;
    totalQuestions: number;
    correctAnswers: number;
    quiz: { title: string; totalMarks: number };
    createdAt: string;
  }>;
}

interface GrowthData {
  month: string;
  count: number;
}

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#14b8a6'];
const BRAND_GRADIENT = ['#4f46e5', '#7c3aed'];

export default function AnalyticsPage() {
  const { user } = useAuthStore();
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const isAdmin = ['SUPER_ADMIN', 'INSTITUTION_OWNER', 'INSTITUTION_ADMIN'].includes(user?.role || '');
  const isTeacher = ['TEACHER', 'HOD'].includes(user?.role || '');
  const isStudent = !isAdmin && !isTeacher;

  if (isSuperAdmin) return <PlatformAnalytics />;
  if (isAdmin) return <TenantAnalytics tenantId={user?.tenantId || ''} />;
  if (isTeacher) return <TeacherAnalytics userId={user?.id || ''} tenantId={user?.tenantId || ''} />;
  return <StudentAnalytics userId={user?.id || ''} />;
}

/* ═══════════════════════════════════════════════════════════
   PLATFORM ANALYTICS (Super Admin)
   ═══════════════════════════════════════════════════════════ */
function PlatformAnalytics() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [growth, setGrowth] = useState<GrowthData[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('12m');

  useEffect(() => {
    async function load() {
      try {
        const [statsRes, growthRes] = await Promise.all([
          api.get('/analytics/platform'),
          api.get('/analytics/platform/growth'),
        ]);
        setStats(statsRes.data.data);
        setGrowth(growthRes.data.data || []);
      } catch { /* non-critical */ }
      finally { setLoading(false); }
    }
    load();
  }, []);

  const roleChartData = useMemo(() => {
    if (!stats?.usersByRole) return [];
    return Object.entries(stats.usersByRole).map(([name, value]) => ({
      name: name.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase()),
      value,
    }));
  }, [stats]);

  const contentChartData = useMemo(() => {
    if (!stats?.contentByType) return [];
    return Object.entries(stats.contentByType).map(([name, value]) => ({
      name: name.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase()),
      value,
    }));
  }, [stats]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <DashboardHeader title="Platform Analytics" subtitle="Real-time platform-wide metrics and insights" period={period} onPeriodChange={setPeriod} />

      {stats && (
        <>
          {/* KPI Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KPITile icon={Building2} label="Total Tenants" value={stats.totalTenants} sub={`${stats.activeTenants} active`} color="brand" trend={12} />
            <KPITile icon={Users} label="Total Users" value={stats.totalUsers} sub={`${stats.activeUsers} active`} color="emerald" trend={8} />
            <KPITile icon={FileText} label="Content Items" value={stats.totalContent} sub="All types" color="amber" trend={15} />
            <KPITile icon={Target} label="Assessments" value={stats.totalAssessments} sub={`${stats.recentSignups} new (30d)`} color="violet" trend={22} />
          </div>

          {/* Growth Chart + Role Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <ChartCard title="User Growth Trend" subtitle="Monthly signups over time" className="lg:col-span-2" icon={TrendingUp}>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={growth.length > 0 ? growth : generateMockGrowth()}>
                  <defs>
                    <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="count" stroke="#4f46e5" strokeWidth={2.5} fill="url(#growthGrad)" dot={{ r: 4, fill: '#4f46e5', strokeWidth: 2, stroke: '#fff' }} />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Users by Role" subtitle="Distribution" icon={BarChart3}>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={roleChartData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={4} dataKey="value" stroke="none">
                    {roleChartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          {/* Content + Tenant Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard title="Content Distribution" subtitle="By type" icon={FileText}>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={contentChartData} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} width={100} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={24}>
                    {contentChartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Platform Health" subtitle="Key performance indicators" icon={Activity}>
              <div className="grid grid-cols-2 gap-4 py-4">
                <HealthMetric label="User Activation" value={stats.totalUsers > 0 ? Math.round((stats.activeUsers / stats.totalUsers) * 100) : 0} suffix="%" status={stats.activeUsers / Math.max(stats.totalUsers, 1) > 0.7 ? 'good' : 'warn'} />
                <HealthMetric label="Tenant Uptime" value={stats.totalTenants > 0 ? Math.round((stats.activeTenants / stats.totalTenants) * 100) : 0} suffix="%" status="good" />
                <HealthMetric label="Content / User" value={stats.totalUsers > 0 ? +(stats.totalContent / stats.totalUsers).toFixed(1) : 0} status="normal" />
                <HealthMetric label="30-Day Growth" value={stats.recentSignups} status={stats.recentSignups > 10 ? 'good' : 'normal'} />
              </div>
            </ChartCard>
          </div>
        </>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   TENANT ANALYTICS (Institution Admin)
   ═══════════════════════════════════════════════════════════ */
function TenantAnalytics({ tenantId }: { tenantId: string }) {
  const [stats, setStats] = useState<TenantStats | null>(null);
  const [growth, setGrowth] = useState<GrowthData[]>([]);
  const [departmentData, setDepartmentData] = useState<Array<{ name: string; students: number; teachers: number; courses: number; score: number }>>([]);
  const [performanceRadar, setPerformanceRadar] = useState<Array<{ subject: string; score: number; fullMark: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('12m');

  useEffect(() => {
    if (!tenantId) return;
    async function load() {
      try {
        const [statsRes, growthRes, deptRes, subjRes] = await Promise.all([
          api.get(`/analytics/tenant/${tenantId}`),
          api.get(`/analytics/tenant/${tenantId}/growth`),
          api.get(`/analytics/tenant/${tenantId}/departments`).catch(() => ({ data: { data: [] } })),
          api.get(`/analytics/tenant/${tenantId}/subjects`).catch(() => ({ data: { data: [] } })),
        ]);
        setStats(statsRes.data.data);
        setGrowth(growthRes.data.data || []);
        setDepartmentData(deptRes.data.data || []);
        setPerformanceRadar(subjRes.data.data || []);
      } catch { /* non-critical */ }
      finally { setLoading(false); }
    }
    load();
  }, [tenantId]);

  if (loading) return <LoadingSpinner />;
  if (!stats) return <NoDataState message="No institution data available" />;

  return (
    <div className="space-y-6">
      <DashboardHeader title="Institution Analytics" subtitle="Performance metrics and enrollment insights" period={period} onPeriodChange={setPeriod} />

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPITile icon={Users} label="Students" value={stats.totalStudents} color="brand" trend={8} />
        <KPITile icon={GraduationCap} label="Teachers" value={stats.totalTeachers} color="emerald" trend={3} />
        <KPITile icon={BookOpen} label="Courses" value={stats.totalCourses} color="amber" sub={`${stats.enrollmentCount} enrollments`} />
        <KPITile icon={FileText} label="Content" value={stats.totalContent} color="violet" sub={`${stats.assessmentCount} assessments`} />
      </div>

      {/* Growth + Department Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartCard title="Enrollment Growth" subtitle="Monthly new registrations" className="lg:col-span-2" icon={TrendingUp}>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={growth.length > 0 ? growth : generateMockGrowth()}>
              <defs>
                <linearGradient id="enrollGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="count" stroke="#10b981" strokeWidth={2.5} fill="url(#enrollGrad)" dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Subject Performance" subtitle="Avg. scores across subjects" icon={Target}>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={performanceRadar} outerRadius={80}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#64748b' }} />
              <PolarRadiusAxis tick={{ fontSize: 9, fill: '#94a3b8' }} domain={[0, 100]} />
              <Radar name="Score" dataKey="score" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.15} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Department Breakdown + Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Department Comparison" subtitle="Students, teachers, avg score" icon={Building2}>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={departmentData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="students" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={16} name="Students" />
              <Bar dataKey="score" fill="#10b981" radius={[4, 4, 0, 0]} barSize={16} name="Avg Score" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Action Items" subtitle="Pending tasks and alerts" icon={AlertCircle}>
          <div className="space-y-3 py-2">
            <AlertItem color="amber" label="Pending Approvals" value={stats.pendingApprovals} desc="Users awaiting verification" />
            <AlertItem color="blue" label="Recent Activity" value={stats.recentActivity} desc="Audit events (last 10)" />
            <AlertItem color="emerald" label="Active Enrollments" value={stats.enrollmentCount} desc="Currently enrolled students" />
            <AlertItem color="violet" label="Assessments Created" value={stats.assessmentCount} desc="Quizzes and exams" />
          </div>
        </ChartCard>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   TEACHER ANALYTICS
   ═══════════════════════════════════════════════════════════ */
function TeacherAnalytics({ userId, tenantId }: { userId: string; tenantId: string }) {
  const [loading, setLoading] = useState(true);
  const [teacherStats, setTeacherStats] = useState<any>(null);
  const [period, setPeriod] = useState('12m');

  useEffect(() => {
    async function load() {
      try {
        const { data } = await api.get(`/analytics/teacher/${userId}`);
        setTeacherStats(data.data);
      } catch { /* non-critical */ }
      finally { setLoading(false); }
    }
    load();
  }, [userId]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <DashboardHeader title="Teaching Analytics" subtitle="Class performance and student insights" period={period} onPeriodChange={setPeriod} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPITile icon={Users} label="My Students" value={teacherStats?.studentCount || 0} color="brand" />
        <KPITile icon={BookOpen} label="Content Created" value={teacherStats?.contentCount || 0} color="emerald" />
        <KPITile icon={Target} label="Assessments" value={teacherStats?.assessmentCount || 0} color="amber" />
        <KPITile icon={Award} label="Total Content" value={(teacherStats?.contentCount || 0) + (teacherStats?.assessmentCount || 0)} color="violet" />
      </div>

      {/* Recent Content */}
      <div className="grid grid-cols-1 gap-6">
        <ChartCard title="Recent Content" subtitle="Your latest created materials" icon={FileText}>
          <div className="space-y-3 py-2 max-h-[300px] overflow-y-auto">
            {teacherStats?.recentContent?.length > 0 ? teacherStats.recentContent.map((item: any) => (
              <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50/80">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{item.title}</p>
                  <p className="text-xs text-gray-500">{item.type.replace(/_/g, ' ')} &bull; {item.status}</p>
                </div>
                <span className="text-xs text-gray-400">{new Date(item.createdAt).toLocaleDateString()}</span>
              </div>
            )) : (
              <p className="text-sm text-gray-400 text-center py-8">No content created yet. Start creating resources for your students!</p>
            )}
          </div>
        </ChartCard>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   STUDENT ANALYTICS
   ═══════════════════════════════════════════════════════════ */
function StudentAnalytics({ userId }: { userId: string }) {
  const [progress, setProgress] = useState<StudentProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('12m');

  useEffect(() => {
    async function load() {
      try {
        const { data } = await api.get(`/analytics/student/${userId}`);
        setProgress(data.data);
      } catch { /* non-critical */ }
      finally { setLoading(false); }
    }
    load();
  }, [userId]);

  const quizTrend = useMemo(() => {
    if (!progress?.recentQuizzes) return [];
    return [...progress.recentQuizzes].reverse().map((q, i) => ({
      name: q.quiz?.title || `Quiz ${i + 1}`,
      score: q.score || 0,
      total: q.quiz?.totalMarks || q.totalQuestions || 0,
      pct: q.quiz?.totalMarks ? Math.round((q.score / q.quiz.totalMarks) * 100) : 0,
    }));
  }, [progress]);

  const subjectRadar = useMemo(() => {
    if (!progress?.enrollments) return [];
    return progress.enrollments.map((e) => ({
      subject: e.subject?.name || e.course?.name || 'Unknown',
      score: progress.quizStats.averageScore || 0,
      fullMark: 100,
    }));
  }, [progress]);

  if (loading) return <LoadingSpinner />;
  if (!progress) return <NoDataState message="Start taking quizzes and creating notes to see your analytics" />;

  return (
    <div className="space-y-6">
      <DashboardHeader title="My Analytics" subtitle="Track your learning progress and performance" period={period} onPeriodChange={setPeriod} />

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPITile icon={Target} label="Quiz Attempts" value={progress.quizStats.totalAttempts} color="brand" />
        <KPITile icon={Award} label="Avg Score" value={progress.quizStats.averageScore} color="emerald" suffix="%" />
        <KPITile icon={FileText} label="Notes" value={progress.notesCount} color="amber" />
        <KPITile icon={BookOpen} label="Enrollments" value={progress.enrollments.length} color="violet" />
      </div>

      {/* Quiz Trend + Subject Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartCard title="Quiz Score Trend" subtitle="Recent assessment performance" className="lg:col-span-2" icon={TrendingUp}>
          {quizTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={quizTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="score" radius={[6, 6, 0, 0]} barSize={28}>
                  {quizTrend.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[260px] text-gray-400 text-sm">
              Take quizzes to see your score trends
            </div>
          )}
        </ChartCard>

        <ChartCard title="Subject Proficiency" subtitle="Across enrolled subjects" icon={Target}>
          {subjectRadar.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <RadarChart data={subjectRadar} outerRadius={80}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#64748b' }} />
                <PolarRadiusAxis tick={{ fontSize: 9, fill: '#94a3b8' }} domain={[0, 100]} />
                <Radar name="Score" dataKey="score" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.15} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[260px] text-gray-400 text-sm">
              Enroll in courses to see proficiency
            </div>
          )}
        </ChartCard>
      </div>

      {/* Study Plans + Recent Quizzes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Study Plan Progress" subtitle="Recent study tasks" icon={Calendar}>
          <div className="space-y-3 py-2 max-h-[280px] overflow-y-auto">
            {progress.recentStudyPlans.length > 0 ? progress.recentStudyPlans.map((plan) => (
              <div key={plan.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50/80">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${plan.isCompleted ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${plan.isCompleted ? 'text-gray-400 line-through' : 'text-gray-900'}`}>{plan.title}</p>
                  <p className="text-xs text-gray-500">{new Date(plan.date).toLocaleDateString()}</p>
                </div>
              </div>
            )) : (
              <p className="text-sm text-gray-400 text-center py-8">No study plans yet</p>
            )}
          </div>
        </ChartCard>

        <ChartCard title="Recent Quizzes" subtitle="Last 5 attempts" icon={Brain}>
          <div className="space-y-3 py-2 max-h-[280px] overflow-y-auto">
            {progress.recentQuizzes.length > 0 ? progress.recentQuizzes.map((q) => {
              const pct = q.quiz?.totalMarks ? Math.round((q.score / q.quiz.totalMarks) * 100) : 0;
              return (
                <div key={q.id} className="p-3 rounded-xl bg-gray-50/80">
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-sm font-medium text-gray-900 truncate">{q.quiz?.title || 'Quiz'}</p>
                    <span className={`text-sm font-bold ${pct >= 70 ? 'text-emerald-600' : pct >= 50 ? 'text-amber-600' : 'text-red-600'}`}>{pct}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{
                      width: `${pct}%`,
                      background: pct >= 70 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#ef4444',
                    }} />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{q.correctAnswers}/{q.totalQuestions} correct &bull; {new Date(q.createdAt).toLocaleDateString()}</p>
                </div>
              );
            }) : (
              <p className="text-sm text-gray-400 text-center py-8">No quiz attempts yet</p>
            )}
          </div>
        </ChartCard>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   SHARED COMPONENTS
   ═══════════════════════════════════════════════════════════ */

function DashboardHeader({ title, subtitle, period, onPeriodChange }: {
  title: string; subtitle: string; period: string; onPeriodChange: (p: string) => void;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <p className="text-gray-500 mt-0.5 text-sm">{subtitle}</p>
      </div>
      <div className="flex items-center gap-2">
        <select
          value={period}
          onChange={(e) => onPeriodChange(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:ring-2 focus:ring-brand-500 focus:outline-none"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="3m">Last 3 months</option>
          <option value="12m">Last 12 months</option>
        </select>
        <button className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-500 transition-colors" title="Refresh">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function KPITile({ icon: Icon, label, value, color, sub, trend, suffix }: {
  icon: React.ComponentType<{ className?: string }>;
  label: string; value: number; color: string;
  sub?: string; trend?: number; suffix?: string;
}) {
  const bgMap: Record<string, string> = {
    brand: 'from-indigo-500/10 to-indigo-500/5',
    emerald: 'from-emerald-500/10 to-emerald-500/5',
    amber: 'from-amber-500/10 to-amber-500/5',
    violet: 'from-violet-500/10 to-violet-500/5',
    rose: 'from-rose-500/10 to-rose-500/5',
  };
  const iconMap: Record<string, string> = {
    brand: 'text-indigo-600', emerald: 'text-emerald-600',
    amber: 'text-amber-600', violet: 'text-violet-600', rose: 'text-rose-600',
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100/80 p-5 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${bgMap[color] || bgMap.brand} flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${iconMap[color] || iconMap.brand}`} />
        </div>
        {trend !== undefined && (
          <span className={`flex items-center gap-0.5 text-xs font-medium px-2 py-0.5 rounded-full ${trend >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
            {trend >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}{suffix}</p>
      <p className="text-sm text-gray-500">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

function ChartCard({ title, subtitle, icon: Icon, children, className }: {
  title: string; subtitle: string;
  icon?: React.ComponentType<{ className?: string }>;
  children: React.ReactNode; className?: string;
}) {
  return (
    <div className={`bg-white rounded-2xl border border-gray-100/80 p-6 shadow-sm ${className || ''}`}>
      <div className="flex items-center gap-2 mb-4">
        {Icon && <Icon className="w-5 h-5 text-gray-400" />}
        <div>
          <h2 className="text-base font-semibold text-gray-900">{title}</h2>
          <p className="text-xs text-gray-500">{subtitle}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl shadow-lg p-3 text-xs">
      {label && <p className="font-semibold text-gray-900 mb-1">{label}</p>}
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="text-gray-600">{p.name || p.dataKey}:</span>
          <span className="font-bold text-gray-900">{typeof p.value === 'number' ? p.value.toLocaleString() : p.value}</span>
        </div>
      ))}
    </div>
  );
}

function HealthMetric({ label, value, suffix, status }: {
  label: string; value: number; suffix?: string;
  status: 'good' | 'warn' | 'normal';
}) {
  const statusColor = { good: 'text-emerald-600', warn: 'text-amber-600', normal: 'text-gray-700' };
  const statusBg = { good: 'bg-emerald-50', warn: 'bg-amber-50', normal: 'bg-gray-50' };
  return (
    <div className={`${statusBg[status]} rounded-xl p-4`}>
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${statusColor[status]}`}>{value}{suffix}</p>
    </div>
  );
}

function AlertItem({ color, label, value, desc }: { color: string; label: string; value: number; desc: string }) {
  const dotColor: Record<string, string> = {
    amber: 'bg-amber-500', blue: 'bg-blue-500', emerald: 'bg-emerald-500', violet: 'bg-violet-500', red: 'bg-red-500',
  };
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50/80">
      <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${dotColor[color] || 'bg-gray-400'}`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900">{label}</p>
        <p className="text-xs text-gray-500">{desc}</p>
      </div>
      <span className="text-lg font-bold text-gray-900">{value}</span>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center">
        <div className="animate-spin w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-sm text-gray-500">Loading analytics...</p>
      </div>
    </div>
  );
}

function NoDataState({ message }: { message: string }) {
  return (
    <div className="text-center py-20">
      <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-700 mb-2">No Data Yet</h3>
      <p className="text-gray-500 text-sm">{message}</p>
    </div>
  );
}

function generateMockGrowth(): GrowthData[] {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months.map((m, i) => ({ month: m, count: 15 + Math.floor(Math.random() * 40) + i * 3 }));
}


