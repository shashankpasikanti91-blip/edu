'use client';

import { useEffect, useState } from 'react';
import {
  Users,
  Building2,
  BookOpen,
  FileText,
  TrendingUp,
  AlertCircle,
  BarChart3,
  Activity,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

interface PlatformStats {
  totalTenants: number;
  totalUsers: number;
  totalContent: number;
  usersByRole: Record<string, number>;
  contentByType: Record<string, number>;
}

interface TenantStats {
  totalStudents: number;
  totalTeachers: number;
  totalCourses: number;
  totalContent: number;
  pendingApprovals: number;
  recentActivity: number;
}

export default function AnalyticsPage() {
  const { user } = useAuthStore();
  const [platformStats, setPlatformStats] = useState<PlatformStats | null>(null);
  const [tenantStats, setTenantStats] = useState<TenantStats | null>(null);
  const [loading, setLoading] = useState(true);

  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  useEffect(() => {
    async function load() {
      try {
        if (isSuperAdmin) {
          const { data } = await api.get('/analytics/platform');
          setPlatformStats(data.data);
        } else if (user?.tenantId) {
          const { data } = await api.get(`/analytics/tenant/${user.tenantId}`);
          setTenantStats(data.data);
        }
      } catch {
        // Non-critical
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [isSuperAdmin, user?.tenantId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-500 mt-1">
          {isSuperAdmin ? 'Platform-wide overview' : 'Institution analytics'}
        </p>
      </div>

      {isSuperAdmin && platformStats && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              icon={Building2}
              label="Total Tenants"
              value={platformStats.totalTenants}
              color="brand"
            />
            <StatCard
              icon={Users}
              label="Total Users"
              value={platformStats.totalUsers}
              color="green"
            />
            <StatCard
              icon={FileText}
              label="Total Content"
              value={platformStats.totalContent}
              color="amber"
            />
            <StatCard
              icon={Activity}
              label="Active Roles"
              value={Object.keys(platformStats.usersByRole).length}
              color="purple"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-brand-600" />
                Users by Role
              </h2>
              <div className="space-y-3">
                {platformStats.usersByRole && Object.entries(platformStats.usersByRole).map(([role, count]) => (
                  <div key={role} className="flex items-center justify-between p-3 rounded-xl bg-surface-secondary">
                    <span className="text-sm font-medium text-gray-700 capitalize">
                      {role.toLowerCase().replace('_', ' ')}
                    </span>
                    <span className="text-sm font-bold text-gray-900">{count}</span>
                  </div>
                ))}
                {(!platformStats.usersByRole || Object.keys(platformStats.usersByRole).length === 0) && (
                  <p className="text-sm text-gray-400 text-center py-4">No data available</p>
                )}
              </div>
            </div>

            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-green-600" />
                Content by Type
              </h2>
              <div className="space-y-3">
                {platformStats.contentByType && Object.entries(platformStats.contentByType).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between p-3 rounded-xl bg-surface-secondary">
                    <span className="text-sm font-medium text-gray-700 capitalize">
                      {type.toLowerCase().replace('_', ' ')}
                    </span>
                    <span className="text-sm font-bold text-gray-900">{count}</span>
                  </div>
                ))}
                {(!platformStats.contentByType || Object.keys(platformStats.contentByType).length === 0) && (
                  <p className="text-sm text-gray-400 text-center py-4">No content data yet</p>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {!isSuperAdmin && tenantStats && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <StatCard icon={Users} label="Students" value={tenantStats.totalStudents} color="brand" />
            <StatCard icon={Users} label="Teachers" value={tenantStats.totalTeachers} color="green" />
            <StatCard icon={BookOpen} label="Courses" value={tenantStats.totalCourses} color="amber" />
            <StatCard icon={FileText} label="Content Items" value={tenantStats.totalContent} color="purple" />
            <StatCard icon={AlertCircle} label="Pending Approvals" value={tenantStats.pendingApprovals} color="rose" />
            <StatCard icon={TrendingUp} label="Recent Activity" value={tenantStats.recentActivity} color="blue" />
          </div>
        </>
      )}

      {!isSuperAdmin && !user?.tenantId && (
        <div className="card text-center py-12">
          <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No Institution Linked</h3>
          <p className="text-gray-500 text-sm">Contact your administrator to get assigned to an institution.</p>
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  color: string;
}) {
  const colorMap: Record<string, string> = {
    brand: 'bg-brand-100 text-brand-600',
    green: 'bg-green-100 text-green-600',
    amber: 'bg-amber-100 text-amber-600',
    rose: 'bg-rose-100 text-rose-600',
    purple: 'bg-purple-100 text-purple-600',
    blue: 'bg-blue-100 text-blue-600',
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorMap[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  );
}
