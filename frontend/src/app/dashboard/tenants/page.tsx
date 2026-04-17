'use client';

import { useEffect, useState } from 'react';
import { Building2, Users, Search, Loader2, CheckCircle2, XCircle, Clock, Plus } from 'lucide-react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

interface Tenant {
  id: string;
  name: string;
  slug: string;
  type: string;
  status: string;
  city: string | null;
  _count: { users: number; departments: number; courses: number };
}

interface Meta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const STATUS_STYLE: Record<string, { bg: string; text: string; icon: typeof CheckCircle2 }> = {
  ACTIVE: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle2 },
  SUSPENDED: { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle },
  PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Clock },
  TRIAL: { bg: 'bg-blue-100', text: 'text-blue-700', icon: Clock },
};

export default function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchTenants();
  }, [page]);

  const fetchTenants = async (q = '') => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', '20');
      if (q) params.set('search', q);
      const { data } = await api.get(`/tenants?${params.toString()}`);
      setTenants(data.data);
      setMeta(data.meta);
    } catch {
      toast.error('Failed to load institutions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    fetchTenants(search);
  };

  const toggleStatus = async (tenant: Tenant) => {
    const action = tenant.status === 'ACTIVE' ? 'suspend' : 'activate';
    if (!confirm(`${action === 'suspend' ? 'Suspend' : 'Activate'} ${tenant.name}?`)) return;
    try {
      await api.post(`/tenants/${tenant.id}/${action}`);
      toast.success(`${tenant.name} ${action}d`);
      fetchTenants(search);
    } catch {
      toast.error(`Failed to ${action} institution`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Institution Management</h1>
          <p className="text-gray-500 mt-1">{meta?.total || 0} institutions registered</p>
        </div>
      </div>

      {/* Search */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search institutions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="input-field pl-10"
          />
        </div>
        <button onClick={handleSearch} className="btn-secondary">Search</button>
      </div>

      {/* Tenants Table */}
      {tenants.length === 0 ? (
        <div className="card text-center py-12">
          <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">No institutions found</p>
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left py-3 px-4 font-medium text-gray-600">Institution</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Type</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">Users</th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">Depts</th>
                <th className="text-right py-3 px-4 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tenants.map((t) => {
                const statusStyle = STATUS_STYLE[t.status] || STATUS_STYLE.PENDING;
                const StatusIcon = statusStyle.icon;
                return (
                  <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <p className="font-medium text-gray-900">{t.name}</p>
                      <p className="text-xs text-gray-400">{t.slug}{t.city ? ` • ${t.city}` : ''}</p>
                    </td>
                    <td className="py-3 px-4 text-gray-600 capitalize">{t.type.toLowerCase().replace('_', ' ')}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${statusStyle.bg} ${statusStyle.text}`}>
                        <StatusIcon className="w-3 h-3" /> {t.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center text-gray-600">{t._count.users}</td>
                    <td className="py-3 px-4 text-center text-gray-600">{t._count.departments}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => toggleStatus(t)}
                        className={`text-xs font-medium px-3 py-1 rounded-lg transition-colors ${
                          t.status === 'ACTIVE'
                            ? 'text-red-600 hover:bg-red-50'
                            : 'text-green-600 hover:bg-green-50'
                        }`}
                      >
                        {t.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="btn-secondary text-sm disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-gray-500">
            Page {meta.page} of {meta.totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
            disabled={page >= meta.totalPages}
            className="btn-secondary text-sm disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
