'use client';

import { useState, useEffect, useRef } from 'react';
import { api } from '@/lib/api';
import {
  Palette, Upload, Globe, Image, Trash2, RefreshCw, Save, Lock
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Branding {
  id: string;
  tier: string;
  logoUrl: string | null;
  faviconUrl: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
  accentColor: string | null;
  subdomain: string | null;
  whiteLabel: boolean;
}

export default function BrandingPage() {
  const [branding, setBranding] = useState<Branding | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    primaryColor: '#4f46e5',
    secondaryColor: '#6366f1',
    accentColor: '#f59e0b',
    subdomain: '',
  });
  const logoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadBranding();
  }, []);

  const loadBranding = async () => {
    try {
      const { data } = await api.get('/branding');
      const b = data.data.branding;
      setBranding(b);
      if (b) {
        setForm({
          primaryColor: b.primaryColor || '#4f46e5',
          secondaryColor: b.secondaryColor || '#6366f1',
          accentColor: b.accentColor || '#f59e0b',
          subdomain: b.subdomain || '',
        });
      }
    } catch {
      // Branding not set yet
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await api.put('/branding', form);
      setBranding(data.data.branding);
      toast.success('Branding settings saved');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save branding');
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Logo must be under 2MB');
      return;
    }

    const formData = new FormData();
    formData.append('logo', file);

    try {
      const { data } = await api.post(`/branding/logo?type=${type}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setBranding(data.data.branding);
      toast.success('Logo uploaded successfully');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to upload logo');
    }
  };

  const handleRemoveLogo = async (type: string) => {
    try {
      const { data } = await api.delete(`/branding/logo?type=${type}`);
      setBranding(data.data.branding);
      toast.success('Logo removed');
    } catch {
      toast.error('Failed to remove logo');
    }
  };

  const tier = branding?.tier || 'BASIC';
  const canCustomColors = ['STANDARD', 'PREMIUM', 'WHITE_LABEL'].includes(tier);
  const canSubdomain = ['STANDARD', 'PREMIUM', 'WHITE_LABEL'].includes(tier);
  const canWhiteLabel = ['PREMIUM', 'WHITE_LABEL'].includes(tier);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="w-6 h-6 text-brand-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Institution Branding</h1>
        <p className="text-sm text-gray-500 mt-1">
          Customize your institution&apos;s appearance. Features available depend on your plan tier: <strong>{tier}</strong>
        </p>
      </div>

      {/* Logo Upload */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Image className="w-5 h-5 text-brand-600" /> Institution Logo
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          Upload your institution logo. It appears on the login page, dashboard, and reports.
        </p>
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center bg-gray-50 overflow-hidden">
            {branding?.logoUrl ? (
              <img src={branding.logoUrl} alt="Logo" className="w-full h-full object-contain" />
            ) : (
              <Upload className="w-8 h-8 text-gray-300" />
            )}
          </div>
          <div className="space-y-2">
            <div>
              <input
                ref={logoInputRef}
                type="file"
                accept="image/jpeg,image/png,image/svg+xml,image/webp"
                className="hidden"
                onChange={(e) => handleLogoUpload(e, 'logo')}
              />
              <button
                onClick={() => logoInputRef.current?.click()}
                className="btn-primary text-sm"
              >
                Upload Logo
              </button>
            </div>
            {branding?.logoUrl && (
              <button
                onClick={() => handleRemoveLogo('logo')}
                className="text-xs text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" /> Remove
              </button>
            )}
            <p className="text-xs text-gray-400">JPEG, PNG, SVG, WebP. Max 2MB.</p>
          </div>
        </div>
      </div>

      {/* Color Branding */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Palette className="w-5 h-5 text-brand-600" /> Color Branding
          {!canCustomColors && <Lock className="w-4 h-4 text-gray-400" />}
        </h2>
        {!canCustomColors ? (
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <p className="text-sm text-gray-500">
              Custom colors require <strong>Campus Growth</strong> plan or above.
            </p>
            <a href="/pricing" className="text-xs text-brand-600 hover:text-brand-700 font-medium mt-2 inline-block">
              Upgrade Plan →
            </a>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Primary Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={form.primaryColor}
                  onChange={(e) => setForm({ ...form, primaryColor: e.target.value })}
                  className="w-10 h-10 rounded border border-gray-200 cursor-pointer"
                />
                <input
                  type="text"
                  value={form.primaryColor}
                  onChange={(e) => setForm({ ...form, primaryColor: e.target.value })}
                  className="input-field text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Secondary Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={form.secondaryColor}
                  onChange={(e) => setForm({ ...form, secondaryColor: e.target.value })}
                  className="w-10 h-10 rounded border border-gray-200 cursor-pointer"
                />
                <input
                  type="text"
                  value={form.secondaryColor}
                  onChange={(e) => setForm({ ...form, secondaryColor: e.target.value })}
                  className="input-field text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Accent Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={form.accentColor}
                  onChange={(e) => setForm({ ...form, accentColor: e.target.value })}
                  className="w-10 h-10 rounded border border-gray-200 cursor-pointer"
                />
                <input
                  type="text"
                  value={form.accentColor}
                  onChange={(e) => setForm({ ...form, accentColor: e.target.value })}
                  className="input-field text-sm"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Subdomain */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Globe className="w-5 h-5 text-brand-600" /> Subdomain Branding
          {!canSubdomain && <Lock className="w-4 h-4 text-gray-400" />}
        </h2>
        {!canSubdomain ? (
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <p className="text-sm text-gray-500">
              Subdomain branding requires <strong>Campus Growth</strong> plan or above.
            </p>
            <a href="/pricing" className="text-xs text-brand-600 hover:text-brand-700 font-medium mt-2 inline-block">
              Upgrade Plan →
            </a>
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Your Subdomain</label>
            <div className="flex items-center gap-2 max-w-md">
              <input
                type="text"
                value={form.subdomain}
                onChange={(e) => setForm({ ...form, subdomain: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                placeholder="yourschool"
                className="input-field text-sm"
              />
              <span className="text-sm text-gray-500 whitespace-nowrap">.srpedu.ai</span>
            </div>
            {form.subdomain && (
              <p className="text-xs text-gray-400 mt-2">
                Your institution will be accessible at <strong>{form.subdomain}.srpedu.ai</strong>
              </p>
            )}
          </div>
        )}
      </div>

      {/* White Label Info */}
      {!canWhiteLabel && (
        <div className="card p-6 bg-brand-50 border border-brand-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">White-Label Dashboard</h2>
          <p className="text-sm text-gray-600">
            Get a fully branded experience with custom login page, PDF certificates with your logo,
            branded email templates, and complete white-label dashboard.
          </p>
          <a href="/pricing" className="btn-primary text-sm mt-4 inline-flex items-center gap-2">
            Upgrade to University Pro
          </a>
        </div>
      )}

      {/* Save Button */}
      <div className="flex justify-end">
        <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2">
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Branding Settings'}
        </button>
      </div>
    </div>
  );
}
