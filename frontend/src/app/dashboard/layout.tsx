'use client';

import { useEffect, useState } from 'react';
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
  GraduationCap,
  Stethoscope,
  Factory,
  Cpu,
  IndianRupee,
  Menu,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';

const ADMIN_ROLES = ['SUPER_ADMIN', 'INSTITUTION_OWNER', 'INSTITUTION_ADMIN'];
const ACADEMIC_ADMIN_ROLES = ['ACADEMIC_ADMIN', 'BRANCH_ADMIN', 'DEPARTMENT_ADMIN'];
const TEACHER_ROLES = ['TEACHER', 'HOD'];
const STAFF_ROLES = ['STAFF', 'COORDINATOR'];

function getSidebarLinks(role?: string, accountType?: string) {
  // ── Individual Student (B2C) ──
  if (accountType === 'B2C_STUDENT') {
    return [
      { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
      { icon: GraduationCap, label: 'Academic Profile', href: '/dashboard/academic-profile' },
      { icon: Brain, label: 'AI Study Assistant', href: '/dashboard/ai-assistant' },
      { icon: BookOpen, label: 'Exam Prep', href: '/dashboard/exam-prep' },
      { icon: FileText, label: 'My Notes', href: '/dashboard/notes' },
      { icon: Calendar, label: 'Study Planner', href: '/dashboard/planner' },
      { icon: TrendingUp, label: 'My Progress', href: '/dashboard/progress' },
      { icon: Library, label: 'Resources', href: '/dashboard/resources' },
      { icon: BookA, label: 'Dictionary', href: '/dashboard/dictionary' },
      { icon: Globe, label: 'Current Affairs', href: '/dashboard/current-affairs' },
      { icon: Stethoscope, label: 'Medical Learning', href: '/dashboard/medical-learning' },
      { icon: Cpu, label: 'Engineering & MPC', href: '/dashboard/engineering-learning' },
      { icon: IndianRupee, label: 'Commerce & CA', href: '/dashboard/commerce-learning' },
      { icon: Factory, label: 'Industry Learning', href: '/dashboard/industry-learning' },
      { icon: Upload, label: 'My Files', href: '/dashboard/files' },
      { icon: Users, label: 'Invite Friends', href: '/dashboard/referrals' },
      { icon: CreditCard, label: 'Subscription', href: '/dashboard/billing' },
      { icon: Bell, label: 'Notifications', href: '/dashboard/notifications' },
      { icon: Heart, label: 'Wellness', href: '/dashboard/wellness' },
      { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
    ];
  }

  // ── Institution Owner / Admin ──
  if (role && ADMIN_ROLES.includes(role)) {
    return [
      { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
      // Institution Management
      { icon: Building2, label: 'Manage Users', href: '/dashboard/manage-users' },
      { icon: Users, label: 'Departments', href: '/dashboard/departments' },
      { icon: BarChart3, label: 'Analytics', href: '/dashboard/analytics' },
      // Academic
      { icon: Brain, label: 'AI Assistant', href: '/dashboard/ai-assistant' },
      { icon: BookOpen, label: 'Exam Prep', href: '/dashboard/exam-prep' },
      { icon: Library, label: 'Resources', href: '/dashboard/resources' },
      { icon: BookA, label: 'Dictionary', href: '/dashboard/dictionary' },
      { icon: Globe, label: 'Current Affairs', href: '/dashboard/current-affairs' },
      { icon: Stethoscope, label: 'Medical Learning', href: '/dashboard/medical-learning' },
      { icon: Cpu, label: 'Engineering & MPC', href: '/dashboard/engineering-learning' },
      { icon: IndianRupee, label: 'Commerce & CA', href: '/dashboard/commerce-learning' },
      { icon: Factory, label: 'Industry Learning', href: '/dashboard/industry-learning' },
      { icon: FileText, label: 'Notes', href: '/dashboard/notes' },
      { icon: Calendar, label: 'Study Planner', href: '/dashboard/planner' },
      // Admin
      { icon: CreditCard, label: 'Billing', href: '/dashboard/billing' },
      { icon: Palette, label: 'Branding', href: '/dashboard/branding' },
      { icon: Puzzle, label: 'Add-Ons', href: '/dashboard/addons' },
      { icon: Upload, label: 'Files', href: '/dashboard/files' },
      ...(role === 'SUPER_ADMIN' ? [
        { icon: Building2, label: 'Tenants', href: '/dashboard/tenants' },
        { icon: Shield, label: 'Admin Overview', href: '/dashboard/admin' },
      ] : []),
      { icon: Bell, label: 'Notifications', href: '/dashboard/notifications' },
      { icon: Heart, label: 'Wellness', href: '/dashboard/wellness' },
      { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
    ];
  }

  // ── Academic Admin / Branch Admin / Department Admin ──
  if (role && ACADEMIC_ADMIN_ROLES.includes(role)) {
    return [
      { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
      { icon: Users, label: 'Manage Users', href: '/dashboard/manage-users' },
      { icon: BarChart3, label: 'Analytics', href: '/dashboard/analytics' },
      { icon: Brain, label: 'AI Assistant', href: '/dashboard/ai-assistant' },
      { icon: BookOpen, label: 'Exam Prep', href: '/dashboard/exam-prep' },
      { icon: Library, label: 'Resources', href: '/dashboard/resources' },
      { icon: BookA, label: 'Dictionary', href: '/dashboard/dictionary' },
      { icon: Globe, label: 'Current Affairs', href: '/dashboard/current-affairs' },
      { icon: Stethoscope, label: 'Medical Learning', href: '/dashboard/medical-learning' },
      { icon: Cpu, label: 'Engineering & MPC', href: '/dashboard/engineering-learning' },
      { icon: IndianRupee, label: 'Commerce & CA', href: '/dashboard/commerce-learning' },
      { icon: Factory, label: 'Industry Learning', href: '/dashboard/industry-learning' },
      { icon: FileText, label: 'Notes', href: '/dashboard/notes' },
      { icon: Calendar, label: 'Study Planner', href: '/dashboard/planner' },
      { icon: Upload, label: 'Files', href: '/dashboard/files' },
      { icon: Bell, label: 'Notifications', href: '/dashboard/notifications' },
      { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
    ];
  }

  // ── Teacher / HOD ──
  if (role && TEACHER_ROLES.includes(role)) {
    return [
      { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
      { icon: Brain, label: 'AI Assistant', href: '/dashboard/ai-assistant' },
      { icon: BookOpen, label: 'Exam Prep', href: '/dashboard/exam-prep' },
      { icon: Library, label: 'Resources', href: '/dashboard/resources' },
      { icon: FileText, label: 'Notes', href: '/dashboard/notes' },
      { icon: Upload, label: 'Files & Materials', href: '/dashboard/files' },
      { icon: TrendingUp, label: 'Student Progress', href: '/dashboard/progress' },
      { icon: BookA, label: 'Dictionary', href: '/dashboard/dictionary' },
      { icon: Globe, label: 'Current Affairs', href: '/dashboard/current-affairs' },
      { icon: Stethoscope, label: 'Medical Learning', href: '/dashboard/medical-learning' },
      { icon: Cpu, label: 'Engineering & MPC', href: '/dashboard/engineering-learning' },
      { icon: IndianRupee, label: 'Commerce & CA', href: '/dashboard/commerce-learning' },
      { icon: Factory, label: 'Industry Learning', href: '/dashboard/industry-learning' },
      { icon: Calendar, label: 'Planner', href: '/dashboard/planner' },
      { icon: Bell, label: 'Notifications', href: '/dashboard/notifications' },
      { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
    ];
  }

  // ── Staff / Coordinator ──
  if (role && STAFF_ROLES.includes(role)) {
    return [
      { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
      { icon: Users, label: 'Student Records', href: '/dashboard/manage-users' },
      { icon: Library, label: 'Resources', href: '/dashboard/resources' },
      { icon: Bell, label: 'Notifications', href: '/dashboard/notifications' },
      { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
    ];
  }

  // ── Institution Student (B2B) ──
  return [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
    { icon: Brain, label: 'AI Assistant', href: '/dashboard/ai-assistant' },
    { icon: BookOpen, label: 'Exam Prep', href: '/dashboard/exam-prep' },
    { icon: Library, label: 'Resources', href: '/dashboard/resources' },
    { icon: BookA, label: 'Dictionary', href: '/dashboard/dictionary' },
    { icon: Globe, label: 'Current Affairs', href: '/dashboard/current-affairs' },
    { icon: Stethoscope, label: 'Medical Learning', href: '/dashboard/medical-learning' },
    { icon: Cpu, label: 'Engineering & MPC', href: '/dashboard/engineering-learning' },
    { icon: IndianRupee, label: 'Commerce & CA', href: '/dashboard/commerce-learning' },
    { icon: Factory, label: 'Industry Learning', href: '/dashboard/industry-learning' },
    { icon: FileText, label: 'My Notes', href: '/dashboard/notes' },
    { icon: Calendar, label: 'Study Planner', href: '/dashboard/planner' },
    { icon: TrendingUp, label: 'My Progress', href: '/dashboard/progress' },
    { icon: Bell, label: 'Notifications', href: '/dashboard/notifications' },
    { icon: Heart, label: 'Wellness', href: '/dashboard/wellness' },
    { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
  ];
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
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-gray-50/80 flex">
      {/* Mobile Header Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b border-gray-100 flex items-center px-4 z-40">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 -ml-1 rounded-xl hover:bg-gray-100 transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-6 h-6 text-gray-700" />
        </button>
        <Link href="/" className="flex items-center gap-2 ml-3">
          <div className="w-8 h-8 bg-gradient-to-br from-brand-600 to-violet-600 rounded-lg flex items-center justify-center shadow-sm">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="text-base font-bold text-gray-900">SRP Education AI</span>
        </Link>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        w-64 bg-white border-r border-gray-100/80 flex flex-col fixed h-full shadow-sm z-50
        transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        <div className="p-6 border-b border-gray-100/80 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-brand-600 to-violet-600 rounded-xl flex items-center justify-center shadow-sm">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">SRP Education AI</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
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
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
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
              {user?.directStudentId && (
                <p className="text-[10px] font-mono text-brand-500 truncate">{user.directStudentId}</p>
              )}
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
      <main className="flex-1 lg:ml-64 pt-14 lg:pt-0 p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  );
}
