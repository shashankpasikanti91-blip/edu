'use client';

import { useEffect, useState } from 'react';
import { Save, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';

interface ProfileForm {
  firstName: string;
  lastName: string;
  phone: string;
  preferredLang: string;
}

export default function SettingsPage() {
  const { user, loadUser } = useAuthStore();
  const [form, setForm] = useState<ProfileForm>({
    firstName: '',
    lastName: '',
    phone: '',
    preferredLang: 'en',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        firstName: user.firstName,
        lastName: user.lastName,
        phone: '',
        preferredLang: 'en',
      });

      // Fetch full profile
      api.get('/users/profile').then(({ data }) => {
        const p = data.data;
        setForm({
          firstName: p.firstName,
          lastName: p.lastName,
          phone: p.phone || '',
          preferredLang: p.preferredLang || 'en',
        });
      }).catch(() => {});
    }
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.patch('/users/profile', form);
      await loadUser();
      toast.success('Profile updated');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Manage your account settings.</p>
      </div>

      <div className="card max-w-2xl">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Profile</h2>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <input
                type="text"
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input
                type="text"
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                className="input-field"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={user?.email ?? ''}
              disabled
              className="input-field bg-gray-50 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="input-field"
              placeholder="+91 XXXXX XXXXX"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
            <select
              value={form.preferredLang}
              onChange={(e) => setForm({ ...form, preferredLang: e.target.value })}
              className="input-field"
            >
              <option value="en">English</option>
              <option value="hi">Hindi</option>
              <option value="ta">Tamil</option>
              <option value="te">Telugu</option>
              <option value="kn">Kannada</option>
              <option value="ml">Malayalam</option>
              <option value="mr">Marathi</option>
              <option value="bn">Bengali</option>
              <option value="gu">Gujarati</option>
            </select>
          </div>

          <div className="pt-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-primary inline-flex items-center gap-2"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Changes
            </button>
          </div>
        </div>
      </div>

      <div className="card max-w-2xl mt-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Info</h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Role</span>
            <span className="font-medium text-gray-900 capitalize">{user?.role?.toLowerCase().replace('_', ' ')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Email Verified</span>
            <span className={`font-medium ${user?.emailVerified ? 'text-green-600' : 'text-amber-600'}`}>
              {user?.emailVerified ? 'Verified' : 'Not Verified'}
            </span>
          </div>
          {user?.tenantId && (
            <div className="flex justify-between">
              <span className="text-gray-500">Institution ID</span>
              <span className="font-mono text-xs text-gray-600">{user.tenantId}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
