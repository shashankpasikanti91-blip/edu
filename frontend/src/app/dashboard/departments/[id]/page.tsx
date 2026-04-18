'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Loader2, BookOpen, Users, User, GraduationCap,
  AlertCircle, Mail, Shield, Pencil, X, Check,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

interface DepartmentDetail {
  id: string;
  name: string;
  code: string | null;
  description: string | null;
  isActive: boolean;
  headId: string | null;
  head: { id: string; firstName: string; lastName: string; email: string; role: string } | null;
  teachers: Array<{
    user: { id: string; firstName: string; lastName: string; email: string; role: string; status: string };
  }>;
  students: Array<{
    user: { id: string; firstName: string; lastName: string; email: string; status: string };
  }>;
  courses: Array<{ id: string; name: string; code: string; isActive: boolean; subjects?: Array<{ id: string; name: string; code: string }> }>;
  subjects: Array<{ id: string; name: string; code: string; category: string }>;
}

const ADMIN_ROLES = ['SUPER_ADMIN', 'INSTITUTION_OWNER', 'INSTITUTION_ADMIN'];

export default function DepartmentDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { user } = useAuthStore();
  const isAdmin = user?.role && ADMIN_ROLES.includes(user.role);

  const [department, setDepartment] = useState<DepartmentDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEdit, setShowEdit] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', code: '', description: '' });
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'teachers' | 'students' | 'courses'>('courses');
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    async function load() {
      try {
        const { data } = await api.get(`/institution/departments/${id}`);
        setDepartment(data.data);
      } catch (err: unknown) {
        const axiosErr = err as { response?: { status?: number; data?: { message?: string } } };
        if (axiosErr.response?.status === 404) {
          setError('Department not found.');
        } else {
          setError(axiosErr.response?.data?.message || 'Failed to load department.');
        }
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [id]);

  const handleEdit = () => {
    if (!department) return;
    setEditForm({ name: department.name, code: department.code || '', description: department.description || '' });
    setShowEdit(true);
  };

  const handleSave = async () => {
    if (!editForm.name.trim()) { toast.error('Department name is required'); return; }
    setSaving(true);
    try {
      await api.patch(`/tenants/departments/${id}`, editForm);
      toast.success('Department updated');
      setShowEdit(false);
      // Refresh
      const { data } = await api.get(`/institution/departments/${id}`);
      setDepartment(data.data);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to update department');
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
        <p className="text-sm text-gray-500">Loading department...</p>
      </div>
    );
  }

  if (error || !department) {
    return (
      <div className="max-w-3xl mx-auto">
        <Link href="/dashboard/departments" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Departments
        </Link>
        <div className="card text-center py-12">
          <AlertCircle className="w-12 h-12 text-red-300 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Department Unavailable</h2>
          <p className="text-gray-500 text-sm">{error || 'This department could not be found.'}</p>
          <Link href="/dashboard/departments" className="btn-primary mt-4 inline-block">
            Back to Departments
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Breadcrumb */}
      <Link href="/dashboard/departments" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Departments
      </Link>

      {/* Header */}
      <div className="card mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-6 h-6 text-brand-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{department.name}</h1>
              {department.code && <p className="text-sm text-gray-400 mt-0.5">Code: {department.code}</p>}
              {department.description && <p className="text-gray-600 text-sm mt-2">{department.description}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${
              department.isActive
                ? 'bg-green-50 text-green-700 border-green-200'
                : 'bg-red-50 text-red-700 border-red-200'
            }`}>
              {department.isActive ? 'Active' : 'Inactive'}
            </span>
            {isAdmin && (
              <button onClick={handleEdit} className="p-2 rounded-lg hover:bg-gray-100 transition-colors" title="Edit Department">
                <Pencil className="w-4 h-4 text-gray-500" />
              </button>
            )}
          </div>
        </div>

        {/* Stats Row */}
        <div className="mt-5 pt-5 border-t border-gray-100 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-xl">
            <p className="text-2xl font-bold text-brand-600">{department.teachers.length}</p>
            <p className="text-xs text-gray-500 mt-0.5">Teachers</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-xl">
            <p className="text-2xl font-bold text-emerald-600">{department.students.length}</p>
            <p className="text-xs text-gray-500 mt-0.5">Students</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-xl">
            <p className="text-2xl font-bold text-amber-600">{department.courses.length}</p>
            <p className="text-xs text-gray-500 mt-0.5">Courses</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-xl">
            <p className="text-2xl font-bold text-violet-600">{department.subjects.length}</p>
            <p className="text-xs text-gray-500 mt-0.5">Subjects</p>
          </div>
        </div>

        {/* Department Head */}
        {department.head && (
          <div className="mt-5 pt-5 border-t border-gray-100">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Department Head</h3>
            <div className="flex items-center gap-3 p-3 bg-brand-50 rounded-xl border border-brand-100">
              <div className="w-9 h-9 bg-brand-100 rounded-full flex items-center justify-center">
                <Shield className="w-4 h-4 text-brand-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{department.head.firstName} {department.head.lastName}</p>
                <p className="text-xs text-gray-500">{department.head.email}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-gray-100 rounded-xl p-1 w-fit">
        {(['teachers', 'students', 'courses'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors capitalize ${
              activeTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab} ({tab === 'teachers' ? department.teachers.length : tab === 'students' ? department.students.length : department.courses.length})
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="card">
        {activeTab === 'teachers' && (
          department.teachers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No teachers assigned to this department</p>
            </div>
          ) : (
            <div className="space-y-2">
              {department.teachers.map((t) => (
                <div key={t.user.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-brand-100 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-brand-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{t.user.firstName} {t.user.lastName}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1"><Mail className="w-3 h-3" />{t.user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">{t.user.role.replace('_', ' ')}</span>
                    <span className={`w-2 h-2 rounded-full ${t.user.status === 'ACTIVE' ? 'bg-green-500' : 'bg-gray-300'}`} />
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {activeTab === 'students' && (
          department.students.length === 0 ? (
            <div className="text-center py-8">
              <GraduationCap className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No students enrolled in this department</p>
            </div>
          ) : (
            <div className="space-y-2">
              {department.students.map((s) => (
                <div key={s.user.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-emerald-100 rounded-full flex items-center justify-center">
                      <GraduationCap className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{s.user.firstName} {s.user.lastName}</p>
                      <p className="text-xs text-gray-500">{s.user.email}</p>
                    </div>
                  </div>
                  <span className={`w-2 h-2 rounded-full ${s.user.status === 'ACTIVE' ? 'bg-green-500' : 'bg-gray-300'}`} />
                </div>
              ))}
            </div>
          )
        )}

        {activeTab === 'courses' && (
          department.courses.length === 0 && department.subjects.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No courses or subjects linked to this department</p>
            </div>
          ) : (
            <div className="space-y-4">
              {department.courses.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Courses</h3>
                  <div className="grid grid-cols-1 gap-3">
                    {department.courses.map((c) => (
                      <div key={c.id} className="rounded-xl border border-gray-100 overflow-hidden">
                        <button
                          onClick={() => setExpandedCourse(expandedCourse === c.id ? null : c.id)}
                          className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                              <BookOpen className="w-5 h-5 text-amber-600" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-900">{c.name}</p>
                              <p className="text-xs text-gray-400">{c.code}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${c.isActive ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                              {c.isActive ? 'Active' : 'Inactive'}
                            </span>
                            <svg className={`w-4 h-4 text-gray-400 transition-transform ${expandedCourse === c.id ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                          </div>
                        </button>
                        {expandedCourse === c.id && (
                          <div className="p-4 border-t border-gray-100 bg-white">
                            {c.subjects && c.subjects.length > 0 ? (
                              <div>
                                <p className="text-xs font-medium text-gray-500 mb-2">Subjects in this course</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  {c.subjects.map((s) => (
                                    <div key={s.id} className="flex items-center gap-2 p-2.5 rounded-lg bg-brand-50 border border-brand-100">
                                      <GraduationCap className="w-4 h-4 text-brand-600" />
                                      <div>
                                        <p className="text-sm font-medium text-gray-900">{s.name}</p>
                                        <p className="text-xs text-gray-400">{s.code}</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <p className="text-sm text-gray-400 text-center py-4">No subjects assigned to this course yet</p>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {department.subjects.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Subjects</h3>
                  <div className="flex flex-wrap gap-2">
                    {department.subjects.map((s) => (
                      <span key={s.id} className="text-xs bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full border border-gray-200">
                        {s.name} ({s.code})
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        )}
      </div>

      {/* Edit Modal */}
      {showEdit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={(e) => e.target === e.currentTarget && setShowEdit(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Edit Department</h2>
              <button onClick={() => setShowEdit(false)} className="p-1 rounded-lg hover:bg-gray-100">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department Name *</label>
                <input type="text" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
                <input type="text" value={editForm.code} onChange={(e) => setEditForm({ ...editForm, code: e.target.value })} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} className="input-field" rows={2} />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button onClick={() => setShowEdit(false)} className="btn-secondary">Cancel</button>
                <button onClick={handleSave} disabled={saving} className="btn-primary inline-flex items-center gap-2">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  Update
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
