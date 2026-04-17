'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Users, Plus, Search, Loader2, MoreVertical,
  UserPlus, Shield, Mail, Phone, Check, X,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import type { SubUser, TaxonomyOption } from '@/types';

const ASSIGNABLE_ROLES = [
  { value: 'STUDENT', label: 'Student' },
  { value: 'TEACHER', label: 'Teacher' },
  { value: 'HOD', label: 'Head of Department' },
  { value: 'STAFF', label: 'Staff' },
  { value: 'COORDINATOR', label: 'Coordinator' },
  { value: 'BRANCH_ADMIN', label: 'Branch Admin' },
  { value: 'ACADEMIC_ADMIN', label: 'Academic Admin' },
  { value: 'DEPARTMENT_ADMIN', label: 'Department Admin' },
  { value: 'INSTITUTION_ADMIN', label: 'Institution Admin' },
];

interface Department {
  id: string;
  name: string;
  code: string | null;
}

export default function ManageUsersPage() {
  const { user } = useAuthStore();
  const [users, setUsers] = useState<SubUser[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Create form
  const [createForm, setCreateForm] = useState({
    firstName: '', lastName: '', email: '', phone: '', role: 'STUDENT', departmentId: '', password: '',
  });
  const [creating, setCreating] = useState(false);

  // Action menu
  const [actionMenuUserId, setActionMenuUserId] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', '20');
      if (search) params.set('search', search);
      if (filterRole) params.set('role', filterRole);
      if (filterDept) params.set('departmentId', filterDept);
      if (filterStatus) params.set('status', filterStatus);

      const { data } = await api.get(`/institution/users?${params.toString()}`);
      setUsers(data.data?.users || []);
      setTotalPages(data.data?.pagination?.totalPages || 1);
      setTotalCount(data.data?.pagination?.total || 0);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [page, search, filterRole, filterDept, filterStatus]);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  useEffect(() => {
    api.get('/institution/academic-context').then(({ data }) => {
      setDepartments(data.data?.departments || []);
    }).catch(() => {});
  }, []);

  const handleCreate = async () => {
    if (!createForm.firstName || !createForm.email || !createForm.role) {
      toast.error('First name, email, and role are required');
      return;
    }
    setCreating(true);
    try {
      await api.post('/institution/users', createForm);
      toast.success(`${createForm.role.replace('_', ' ')} created successfully`);
      setShowCreateModal(false);
      setCreateForm({ firstName: '', lastName: '', email: '', phone: '', role: 'STUDENT', departmentId: '', password: '' });
      loadUsers();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to create user');
    } finally {
      setCreating(false);
    }
  };

  const handleDeactivate = async (userId: string) => {
    try {
      await api.post(`/institution/users/${userId}/deactivate`);
      toast.success('User deactivated');
      loadUsers();
    } catch { toast.error('Failed to deactivate user'); }
    setActionMenuUserId(null);
  };

  const handleActivate = async (userId: string) => {
    try {
      await api.post(`/institution/users/${userId}/activate`);
      toast.success('User activated');
      loadUsers();
    } catch { toast.error('Failed to activate user'); }
    setActionMenuUserId(null);
  };

  const handleResetPassword = async (userId: string) => {
    try {
      const { data } = await api.post(`/institution/users/${userId}/reset-password`);
      toast.success(`Password reset. Temp password: ${data.data?.tempPassword || '(sent via email)'}`);
    } catch { toast.error('Failed to reset password'); }
    setActionMenuUserId(null);
  };

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      STUDENT: 'bg-blue-100 text-blue-700',
      TEACHER: 'bg-green-100 text-green-700',
      HOD: 'bg-purple-100 text-purple-700',
      STAFF: 'bg-gray-100 text-gray-700',
      COORDINATOR: 'bg-amber-100 text-amber-700',
      INSTITUTION_ADMIN: 'bg-red-100 text-red-700',
      ACADEMIC_ADMIN: 'bg-indigo-100 text-indigo-700',
      BRANCH_ADMIN: 'bg-teal-100 text-teal-700',
      DEPARTMENT_ADMIN: 'bg-cyan-100 text-cyan-700',
    };
    return colors[role] || 'bg-gray-100 text-gray-700';
  };

  const getStatusBadge = (status: string) => {
    if (status === 'ACTIVE') return <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-700">Active</span>;
    if (status === 'DEACTIVATED') return <span className="px-2 py-0.5 text-xs rounded-full bg-red-100 text-red-700">Deactivated</span>;
    return <span className="px-2 py-0.5 text-xs rounded-full bg-amber-100 text-amber-700">{status}</span>;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Users</h1>
          <p className="text-gray-500 mt-1">Create and manage institution users, roles, and permissions.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowBulkModal(true)} className="btn-secondary inline-flex items-center gap-2 text-sm">
            <Users className="w-4 h-4" /> Bulk Import
          </button>
          <button onClick={() => setShowCreateModal(true)} className="btn-primary inline-flex items-center gap-2 text-sm">
            <UserPlus className="w-4 h-4" /> Add User
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by name or email..."
              className="input-field pl-10"
            />
          </div>
          <select value={filterRole} onChange={(e) => { setFilterRole(e.target.value); setPage(1); }} className="input-field">
            <option value="">All Roles</option>
            {ASSIGNABLE_ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
          <select value={filterDept} onChange={(e) => { setFilterDept(e.target.value); setPage(1); }} className="input-field">
            <option value="">All Departments</option>
            {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
          <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }} className="input-field">
            <option value="">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="DEACTIVATED">Deactivated</option>
            <option value="PENDING_VERIFICATION">Pending</option>
          </select>
        </div>
        <div className="mt-3 text-sm text-gray-500">{totalCount} user{totalCount !== 1 ? 's' : ''} found</div>
      </div>

      {/* Users Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-brand-600 mx-auto" />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No users found</p>
            <button onClick={() => setShowCreateModal(true)} className="text-sm text-brand-600 font-medium mt-2">
              Create first user
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Name</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Email</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Role</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Last Login</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{u.firstName} {u.lastName}</div>
                      {u.phone && <div className="text-xs text-gray-400">{u.phone}</div>}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${getRoleBadgeColor(u.role)}`}>
                        {u.role.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3">{getStatusBadge(u.status)}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-4 py-3 text-right relative">
                      <button
                        onClick={() => setActionMenuUserId(actionMenuUserId === u.id ? null : u.id)}
                        className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <MoreVertical className="w-4 h-4 text-gray-400" />
                      </button>
                      {actionMenuUserId === u.id && (
                        <div className="absolute right-4 top-full mt-1 w-48 bg-white rounded-xl border border-gray-100 shadow-lg z-10 py-1">
                          {u.status === 'ACTIVE' ? (
                            <button onClick={() => handleDeactivate(u.id)} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                              Deactivate
                            </button>
                          ) : (
                            <button onClick={() => handleActivate(u.id)} className="w-full text-left px-4 py-2 text-sm text-green-600 hover:bg-green-50">
                              Activate
                            </button>
                          )}
                          <button onClick={() => handleResetPassword(u.id)} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                            Reset Password
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>
            <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-40"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={(e) => e.target === e.currentTarget && setShowCreateModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-brand-600" /> Add New User
              </h2>
              <button onClick={() => setShowCreateModal(false)} className="p-1 rounded-lg hover:bg-gray-100">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                  <input type="text" value={createForm.firstName} onChange={e => setCreateForm({...createForm, firstName: e.target.value})} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                  <input type="text" value={createForm.lastName} onChange={e => setCreateForm({...createForm, lastName: e.target.value})} className="input-field" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input type="email" value={createForm.email} onChange={e => setCreateForm({...createForm, email: e.target.value})} className="input-field" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input type="tel" value={createForm.phone} onChange={e => setCreateForm({...createForm, phone: e.target.value})} className="input-field" placeholder="+91 XXXXX XXXXX" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                  <select value={createForm.role} onChange={e => setCreateForm({...createForm, role: e.target.value})} className="input-field">
                    {ASSIGNABLE_ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <select value={createForm.departmentId} onChange={e => setCreateForm({...createForm, departmentId: e.target.value})} className="input-field">
                    <option value="">None</option>
                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password (optional)</label>
                <input type="text" value={createForm.password} onChange={e => setCreateForm({...createForm, password: e.target.value})} className="input-field" placeholder="Auto-generated if left blank" />
                <p className="text-xs text-gray-400 mt-1">A temporary password will be generated if not provided.</p>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button onClick={() => setShowCreateModal(false)} className="btn-secondary">Cancel</button>
                <button onClick={handleCreate} disabled={creating} className="btn-primary inline-flex items-center gap-2">
                  {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  Create User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Import Modal (placeholder) */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={(e) => e.target === e.currentTarget && setShowBulkModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Bulk Import Users</h2>
              <button onClick={() => setShowBulkModal(false)} className="p-1 rounded-lg hover:bg-gray-100">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-2">Prepare a JSON array with user data</p>
              <p className="text-xs text-gray-400 mb-4">Each entry needs: firstName, lastName, email, role</p>
              <textarea
                id="bulkData"
                className="input-field w-full h-32 font-mono text-xs"
                placeholder='[{"firstName":"John","lastName":"Doe","email":"john@example.com","role":"STUDENT"}]'
              />
              <button
                onClick={async () => {
                  try {
                    const el = document.getElementById('bulkData') as HTMLTextAreaElement;
                    const users = JSON.parse(el.value);
                    const { data } = await api.post('/institution/users/bulk', { users });
                    toast.success(`Created ${data.data?.created || 0} users`);
                    setShowBulkModal(false);
                    loadUsers();
                  } catch { toast.error('Invalid data or import failed'); }
                }}
                className="btn-primary mt-4"
              >
                Import Users
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
