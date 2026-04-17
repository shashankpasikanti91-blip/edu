'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, Loader2, Users, BookOpen, X, Check, Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';

interface Department {
  id: string;
  name: string;
  code: string | null;
  headId: string | null;
  description: string | null;
  isActive: boolean;
  _count?: { students: number; teachers: number; courses: number };
}

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', code: '', description: '' });
  const [saving, setSaving] = useState(false);

  const loadDepartments = useCallback(async () => {
    try {
      const { data } = await api.get('/institution/academic-context');
      setDepartments(data.data?.departments || []);
    } catch { toast.error('Failed to load departments'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadDepartments(); }, [loadDepartments]);

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Department name is required'); return; }
    setSaving(true);
    try {
      if (editId) {
        await api.patch(`/tenants/departments/${editId}`, form);
        toast.success('Department updated');
      } else {
        await api.post('/tenants/departments', form);
        toast.success('Department created');
      }
      setShowCreate(false);
      setEditId(null);
      setForm({ name: '', code: '', description: '' });
      loadDepartments();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to save department');
    } finally { setSaving(false); }
  };

  const handleEdit = (dept: Department) => {
    setEditId(dept.id);
    setForm({ name: dept.name, code: dept.code || '', description: dept.description || '' });
    setShowCreate(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Departments</h1>
          <p className="text-gray-500 mt-1">Manage academic departments and divisions.</p>
        </div>
        <button onClick={() => { setShowCreate(true); setEditId(null); setForm({ name: '', code: '', description: '' }); }} className="btn-primary inline-flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" /> Add Department
        </button>
      </div>

      {loading ? (
        <div className="card text-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-brand-600 mx-auto" />
        </div>
      ) : departments.length === 0 ? (
        <div className="card text-center py-12">
          <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No departments created yet</p>
          <button onClick={() => setShowCreate(true)} className="text-sm text-brand-600 font-medium mt-2">Create first department</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map(dept => (
            <div key={dept.id} className="card hover:shadow-elevated transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-brand-100 rounded-xl flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-brand-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{dept.name}</h3>
                    {dept.code && <p className="text-xs text-gray-400">{dept.code}</p>}
                  </div>
                </div>
                <button onClick={() => handleEdit(dept)} className="p-1.5 rounded-lg hover:bg-gray-100">
                  <Pencil className="w-4 h-4 text-gray-400" />
                </button>
              </div>
              {dept.description && <p className="text-sm text-gray-500 mb-3">{dept.description}</p>}
              <div className="flex items-center gap-4 text-xs text-gray-400">
                <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {dept._count?.teachers || 0} Teachers</span>
                <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {dept._count?.students || 0} Students</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={e => e.target === e.currentTarget && setShowCreate(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">{editId ? 'Edit Department' : 'Add Department'}</h2>
              <button onClick={() => setShowCreate(false)} className="p-1 rounded-lg hover:bg-gray-100"><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department Name *</label>
                <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="input-field" placeholder="e.g., Computer Science" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
                <input type="text" value={form.code} onChange={e => setForm({...form, code: e.target.value})} className="input-field" placeholder="e.g., CSE" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="input-field" rows={2} />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button onClick={() => setShowCreate(false)} className="btn-secondary">Cancel</button>
                <button onClick={handleSave} disabled={saving} className="btn-primary inline-flex items-center gap-2">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  {editId ? 'Update' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
