'use client';

import { useEffect, useState } from 'react';
import { Package, CheckCircle, XCircle, Loader2, IndianRupee } from 'lucide-react';
import { api } from '@/lib/api';

interface AddOnModule {
  id: string;
  name: string;
  slug: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: string[];
  isActive: boolean;
}

interface TenantAddOn {
  id: string;
  isActive: boolean;
  trialEndsAt: string | null;
  activatedAt: string;
  module: AddOnModule;
}

interface BillingSummary {
  tenantId: string;
  enabledModules: TenantAddOn[];
  availableModules: AddOnModule[];
  totalMonthlyCost: number;
  totalYearlyCost: number;
}

export default function AddOnsPage() {
  const [billing, setBilling] = useState<BillingSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activating, setActivating] = useState<string | null>(null);

  useEffect(() => {
    fetchBilling();
  }, []);

  const fetchBilling = async () => {
    setIsLoading(true);
    try {
      const { data: res } = await api.get('/addons/tenant/billing');
      setBilling(res.data);
    } catch {
      // Non-critical
    } finally {
      setIsLoading(false);
    }
  };

  const handleActivate = async (slug: string) => {
    setActivating(slug);
    try {
      await api.post('/addons/tenant/activate', { moduleSlug: slug, startTrial: true });
      await fetchBilling();
    } catch {
      // Non-critical
    } finally {
      setActivating(null);
    }
  };

  const handleDeactivate = async (slug: string) => {
    if (!confirm('Are you sure you want to deactivate this module?')) return;
    setActivating(slug);
    try {
      await api.post('/addons/tenant/deactivate', { moduleSlug: slug });
      await fetchBilling();
    } catch {
      // Non-critical
    } finally {
      setActivating(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
      </div>
    );
  }

  const enabledSlugs = new Set(billing?.enabledModules.map((m) => m.module.slug) || []);

  return (
    <div className="max-w-6xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Add-On Modules</h1>
        <p className="text-gray-500 mt-1">Extend your institution with powerful modules</p>
      </div>

      {/* Cost Summary */}
      {billing && billing.enabledModules.length > 0 && (
        <div className="card mb-8 bg-brand-50 border-brand-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-brand-900">Current Add-On Cost</h2>
              <p className="text-sm text-brand-700 mt-1">
                {billing.enabledModules.length} module{billing.enabledModules.length > 1 ? 's' : ''} active
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-brand-900 flex items-center">
                <IndianRupee className="w-5 h-5" />
                {billing.totalMonthlyCost.toLocaleString('en-IN')}/mo
              </p>
              <p className="text-sm text-brand-600">
                or ₹{billing.totalYearlyCost.toLocaleString('en-IN')}/yr
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Active Modules */}
      {billing && billing.enabledModules.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Active Modules</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {billing.enabledModules.map((addon) => (
              <div key={addon.id} className="card border-green-200 bg-green-50">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{addon.module.name}</h3>
                      <p className="text-sm text-gray-500">{addon.module.description}</p>
                      {addon.trialEndsAt && (
                        <p className="text-xs text-amber-600 mt-1">
                          Trial ends {new Date(addon.trialEndsAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeactivate(addon.module.slug)}
                    disabled={activating === addon.module.slug}
                    className="text-sm text-red-600 hover:text-red-700 font-medium"
                  >
                    {activating === addon.module.slug ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      'Deactivate'
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Available Modules */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Available Modules</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {billing?.availableModules
            .filter((m) => !enabledSlugs.has(m.slug))
            .map((mod) => (
              <div key={mod.id} className="card">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                      <Package className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{mod.name}</h3>
                      <p className="text-sm text-gray-500">{mod.description}</p>
                    </div>
                  </div>
                </div>
                {mod.features && mod.features.length > 0 && (
                  <ul className="text-sm text-gray-600 space-y-1 mb-4 ml-13">
                    {mod.features.map((f, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                )}
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm font-medium text-gray-700">
                    ₹{mod.monthlyPrice}/mo
                  </p>
                  <button
                    onClick={() => handleActivate(mod.slug)}
                    disabled={activating === mod.slug}
                    className="btn-primary text-sm px-4 py-2"
                  >
                    {activating === mod.slug ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      'Start Free Trial'
                    )}
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
