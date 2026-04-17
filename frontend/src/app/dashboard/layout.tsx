'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  Sparkles,
  BookOpen,
  Brain,
  FileText,
  Bell,
  Calendar,
  TrendingUp,
  LogOut,
  User,
  Users,
  LayoutDashboard,
  Heart,
  Library,
  Settings,
  BarChart3,
  Building2,
  CreditCard,
  Palette,
  Puzzle,
  Upload,
  Shield,
  Loader2,
  BookA,
  Globe,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';

const ADMIN_ROLES = ['SUPER_ADMIN', 'INSTITUTION_OWNER', 'INSTITUTION_ADMIN', 'DEPARTMENT_ADMIN'];

function getSidebarLinks(role?: string, accountType?: string) {
  if (accountType === 'B2C_STUDENT') {
    return [
      { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
      { icon: Brain, label: 'AI Study Assistant', href: '/dashboard/ai-assistant' },
      { icon: BookOpen, label: 'Quiz / Practice', href: '/dashboard/exam-prep' },
      { icon: FileText, label: 'My Notes', href: '/dashboard/notes' },
      { icon: Calendar, label: 'Revision Planner', href: '/dashboard/planner' },
      { icon: TrendingUp, label: 'Progress', href: '/dashboard/progress' },
      { icon: Library, label: 'Resources', href: '/dashboard/resources' },
      { icon: BookA, label: 'Dictionary', href: '/dashboard/dictionary' },
      { icon: Globe, label: 'Current Affairs', href: '/dashboard/current-affairs' },
      { icon: Upload, label: 'My Files', href: '/dashboard/files' },
      { icon: Users, label: 'Invite Friends', href: '/dashboard/referrals' },
      { icon: CreditCard, label: 'Upgrade Plan', href: '/dashboard/billing' },
      { icon: Bell, label: 'Notifications', href: '/dashboard/notifications' },
      { icon: Heart, label: 'Wellness', href: '/dashboard/wellness' },
      { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
    ];
  }

  const base = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
    { icon: Brain, label: 'AI Assistant', href: '/dashboard/ai-assistant' },
    { icon: BookOpen, label: 'Exam Prep', href: '/dashboard/exam-prep' },
    { icon: Library, label: 'Resources', href: '/dashboard/resources' },
    { icon: BookA, label: 'Dictionary', href: '/dashboard/dictionary' },
    { icon: Globe, label: 'Current Affairs', href: '/dashboard/current-affairs' },
    { icon: FileText, label: 'My Notes', href: '/dashboard/notes' },
    { icon: Calendar, label: 'Study Planner', href: '/dashboard/planner' },
  ];

  if (role && ADMIN_ROLES.includes(role)) {
    base.push({ icon: BarChart3, label: 'Analytics', href: '/dashboard/analytics' });
    base.push({ icon: CreditCard, label: 'Billing', href: '/dashboard/billing' });
    base.push({ icon: Palette, label: 'Branding', href: '/dashboard/branding' });
    base.push({ icon: Puzzle, label: 'Add-Ons', href: '/dashboard/addons' });
  }

  if (role && ['TEACHER', ...ADMIN_ROLES].includes(role)) {
    base.push({ icon: Upload, label: 'Files', href: '/dashboard/files' });
  }

  if (role === 'SUPER_ADMIN') {
    base.push({ icon: Building2, label: 'Tenants', href: '/dashboard/tenants' });
    base.push({ icon: Shield, label: 'Admin Overview', href: '/dashboard/admin' });
  }

  base.push(
    { icon: Bell, label: 'Notifications', href: '/dashboard/notifications' },
    { icon: Heart, label: 'Wellness', href: '/dashboard/wellness' },
    { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
  );

  return base;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading, loadUser, logout } = useAuthStore();

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    router.push('/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-secondary">
        <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const sidebarLinks = getSidebarLinks(user?.role, user?.accountType);

  return (
    <div className="min-h-screen bg-gray-50/80 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100/80 flex flex-col fixed h-full shadow-sm z-30">
        <div className="p-6 border-b border-gray-100/80">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-brand-600 to-violet-600 rounded-xl flex items-center justify-center shadow-sm">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">SRP Education AI</span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {sidebarLinks.map((link) => {
            const isActive =
              link.href === '/dashboard'
                ? pathname === '/dashboard'
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <link.icon className="w-5 h-5" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-9 h-9 bg-brand-100 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-brand-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.firstName || ''} {user?.lastName || ''}
              </p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2.5 w-full rounded-xl text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Log Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8">{children}</main>
    </div>
  );
}
