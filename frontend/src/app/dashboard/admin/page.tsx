'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Shield,
  Users,
  AlertTriangle,
  Bell,
  UserPlus,
  Activity,
  ArrowLeft,
  RefreshCw,
  Clock,
  Loader2,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';

interface PlatformStats {
  totalUsers: number;
  totalTenants: number;
  totalStudents: number;
  totalInstitutions: number;
  activeSubscriptions: number;
  revenue: number;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export default function AdminOverviewPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Only super admins can access this page
  useEffect(() => {
    if (user && user.role !== 'SUPER_ADMIN') {
      router.push('/dashboard');
    }
  }, [user, router]);

  const fetchData = async (showRefresh = false) => {
    if (showRefresh) setIsRefreshing(true);
    try {
      const [statsRes, notifRes] = await Promise.all([
        api.get('/analytics/platform').catch(() => null),
        api.get('/notifications?limit=20'),
      ]);

      if (statsRes?.data?.data) {
        setStats(statsRes.data.data);
      }
      if (notifRes?.data?.data?.notifications) {
        setNotifications(notifRes.data.data.notifications);
      }
    } catch {
      // Non-critical, show what we can
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const securityAlerts = notifications.filter(
    (n) => n.type === 'SECURITY_ALERT' || n.type === 'ERROR_ALERT'
  );
  const registrationAlerts = notifications.filter(
    (n) => n.type === 'NEW_REGISTRATION'
  );

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    const diffDay = Math.floor(diffHr / 24);
    return `${diffDay}d ago`;
  };

  if (user?.role !== 'SUPER_ADMIN') return null;

  return (
    <div>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="p-2 rounded-xl bg-white border border-gray-100 hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Shield className="w-6 h-6 text-brand-600" />
                System Admin Overview
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Monitor registrations, errors, and security — all in one place.
              </p>
            </div>
          </div>
          <button
            onClick={() => fetchData(true)}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
          </div>
        ) : (
          <>
            {/* Platform Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 bg-brand-50 rounded-xl flex items-center justify-center">
                    <Users className="w-5 h-5 text-brand-600" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalUsers ?? 0}</p>
                <p className="text-xs text-gray-500">Total Users</p>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center">
                    <Activity className="w-5 h-5 text-emerald-600" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalTenants ?? 0}</p>
                <p className="text-xs text-gray-500">Institutions</p>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 bg-violet-50 rounded-xl flex items-center justify-center">
                    <UserPlus className="w-5 h-5 text-violet-600" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900">{registrationAlerts.length}</p>
                <p className="text-xs text-gray-500">Recent Signups</p>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900">{securityAlerts.length}</p>
                <p className="text-xs text-gray-500">Alerts</p>
              </div>
            </div>

            {/* Two column layout */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* New Registrations */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                  <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                    <UserPlus className="w-4 h-4 text-brand-600" />
                    New Registrations
                  </h2>
                  <Link
                    href="/dashboard/notifications"
                    className="text-xs text-brand-600 hover:text-brand-700 font-medium"
                  >
                    View all
                  </Link>
                </div>
                <div className="divide-y divide-gray-50">
                  {registrationAlerts.length > 0 ? (
                    registrationAlerts.slice(0, 10).map((n) => (
                      <div key={n.id} className="px-6 py-3 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {n.title}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                              {n.message}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-400 flex-shrink-0">
                            <Clock className="w-3 h-3" />
                            {formatDate(n.createdAt)}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="px-6 py-8 text-center">
                      <UserPlus className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-400">No recent registrations</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Security & Error Alerts */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                  <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                    Security &amp; Error Alerts
                  </h2>
                </div>
                <div className="divide-y divide-gray-50">
                  {securityAlerts.length > 0 ? (
                    securityAlerts.slice(0, 10).map((n) => (
                      <div
                        key={n.id}
                        className={`px-6 py-3 hover:bg-gray-50 transition-colors ${
                          !n.isRead ? 'bg-red-50/30' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {n.title}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                              {n.message}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-400 flex-shrink-0">
                            <Clock className="w-3 h-3" />
                            {formatDate(n.createdAt)}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="px-6 py-8 text-center">
                      <Shield className="w-8 h-8 text-green-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-400">No security alerts — all clear</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="mt-8 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-4">Quick Admin Actions</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Link
                  href="/dashboard/tenants"
                  className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-brand-50 transition-colors"
                >
                  <Activity className="w-5 h-5 text-brand-600" />
                  <span className="text-sm font-medium text-gray-700">Manage Tenants</span>
                </Link>
                <Link
                  href="/dashboard/analytics"
                  className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-brand-50 transition-colors"
                >
                  <Activity className="w-5 h-5 text-emerald-600" />
                  <span className="text-sm font-medium text-gray-700">View Analytics</span>
                </Link>
                <Link
                  href="/dashboard/notifications"
                  className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-brand-50 transition-colors"
                >
                  <Bell className="w-5 h-5 text-amber-600" />
                  <span className="text-sm font-medium text-gray-700">All Notifications</span>
                </Link>
                <Link
                  href="/dashboard/billing"
                  className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-brand-50 transition-colors"
                >
                  <Activity className="w-5 h-5 text-violet-600" />
                  <span className="text-sm font-medium text-gray-700">Billing</span>
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
