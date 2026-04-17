'use client';

import { useEffect, useState } from 'react';
import { Calendar, Plus, Check, Clock, Trash2, X, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

interface StudyPlan {
  id: string;
  title: string;
  date: string;
  subjectName: string;
  duration: number;
  isCompleted: boolean;
  notes: string | null;
  createdAt: string;
}

interface Meta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function PlannerPage() {
  const [plans, setPlans] = useState<StudyPlan[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', date: '', subjectName: '', duration: 60, notes: '' });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get('/students/plans?limit=50');
      setPlans(data.data.items);
      setMeta(data.data.meta);
    } catch {
      toast.error('Failed to load study plans');
    } finally {
      setIsLoading(false);
    }
  };

  const createPlan = async () => {
    if (!form.title.trim() || !form.date || !form.subjectName.trim()) {
      toast.error('Title, date and subject are required');
      return;
    }
    setIsSaving(true);
    try {
      await api.post('/students/plans', form);
      toast.success('Study plan created');
      setShowForm(false);
      setForm({ title: '', date: '', subjectName: '', duration: 60, notes: '' });
      fetchPlans();
    } catch {
      toast.error('Failed to create plan');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleComplete = async (plan: StudyPlan) => {
    try {
      await api.patch(`/students/plans/${plan.id}`, { isCompleted: !plan.isCompleted });
      setPlans((prev) => prev.map((p) => p.id === plan.id ? { ...p, isCompleted: !p.isCompleted } : p));
      toast.success(plan.isCompleted ? 'Marked incomplete' : 'Marked complete');
    } catch {
      toast.error('Failed to update');
    }
  };

  const deletePlan = async (id: string) => {
    if (!confirm('Delete this study plan?')) return;
    try {
      await api.delete(`/students/plans/${id}`);
      toast.success('Study plan deleted');
      fetchPlans();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const today = new Date().toISOString().split('T')[0];
  const todayPlans = plans.filter((p) => p.date.startsWith(today));
  const upcomingPlans = plans.filter((p) => p.date > new Date().toISOString() && !p.date.startsWith(today));
  const completedPlans = plans.filter((p) => p.isCompleted);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Study Planner</h1>
          <p className="text-gray-500 mt-1">Organize your revision schedule</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Plan
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="card">
          <p className="text-sm text-gray-500">Today&apos;s Tasks</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{todayPlans.length}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Upcoming</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{upcomingPlans.length}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Completed</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{completedPlans.length}</p>
        </div>
      </div>

      {/* Today's Plans */}
      {todayPlans.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Today</h2>
          <div className="space-y-3">
            {todayPlans.map((plan) => (
              <PlanCard key={plan.id} plan={plan} onToggle={toggleComplete} onDelete={deletePlan} />
            ))}
          </div>
        </div>
      )}

      {/* Upcoming */}
      {upcomingPlans.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Upcoming</h2>
          <div className="space-y-3">
            {upcomingPlans.map((plan) => (
              <PlanCard key={plan.id} plan={plan} onToggle={toggleComplete} onDelete={deletePlan} />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {plans.length === 0 && (
        <div className="card text-center py-12">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">No study plans yet</p>
          <p className="text-sm text-gray-400 mt-1">Create a study plan to stay on track</p>
        </div>
      )}

      {/* Create Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">New Study Plan</h2>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="input-field"
                  placeholder="e.g. Revise Chapter 5"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration (min)</label>
                  <input
                    type="number"
                    value={form.duration}
                    onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })}
                    className="input-field"
                    min={1}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <input
                  type="text"
                  value={form.subjectName}
                  onChange={(e) => setForm({ ...form, subjectName: e.target.value })}
                  className="input-field"
                  placeholder="e.g. Mathematics"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="input-field resize-y"
                  rows={3}
                  placeholder="Any extra notes..."
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-gray-100">
              <button onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
              <button onClick={createPlan} disabled={isSaving} className="btn-primary flex items-center gap-2">
                {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                Create Plan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PlanCard({ plan, onToggle, onDelete }: { plan: StudyPlan; onToggle: (p: StudyPlan) => void; onDelete: (id: string) => void }) {
  return (
    <div className={`card flex items-center gap-4 ${plan.isCompleted ? 'opacity-60' : ''}`}>
      <button
        onClick={() => onToggle(plan)}
        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
          plan.isCompleted ? 'bg-green-500 border-green-500' : 'border-gray-300 hover:border-brand-500'
        }`}
      >
        {plan.isCompleted && <Check className="w-3.5 h-3.5 text-white" />}
      </button>
      <div className="flex-1 min-w-0">
        <p className={`font-medium ${plan.isCompleted ? 'line-through text-gray-400' : 'text-gray-900'}`}>{plan.title}</p>
        <div className="flex items-center gap-3 mt-1">
          <span className="text-xs bg-brand-50 text-brand-700 px-2 py-0.5 rounded-full">{plan.subjectName}</span>
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <Clock className="w-3 h-3" /> {plan.duration} min
          </span>
          <span className="text-xs text-gray-400">
            {new Date(plan.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
          </span>
        </div>
      </div>
      <button onClick={() => onDelete(plan.id)} className="p-1.5 rounded-lg hover:bg-red-50">
        <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
      </button>
    </div>
  );
}
