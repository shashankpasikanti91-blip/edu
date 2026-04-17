'use client';

import { useEffect, useState } from 'react';
import { Library, BookOpen, FileText, Search, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

interface Resource {
  id: string;
  title: string;
  description: string | null;
  type: string;
  status: string;
  createdBy: { firstName: string; lastName: string };
  subject: { name: string } | null;
  _count: { files: number };
  createdAt: string;
}

interface Meta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const TYPE_LABELS: Record<string, string> = {
  REVISION_SHEET: 'Revision Sheet',
  QUESTION_BANK: 'Question Bank',
  TEACHER_RESOURCE: 'Teacher Resource',
  INSTITUTION_RESOURCE: 'Institution Resource',
  FLASHCARD: 'Flashcard',
};

export default function ResourcesPage() {
  const { user } = useAuthStore();
  const [resources, setResources] = useState<Resource[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const isB2C = user?.accountType === 'B2C_STUDENT';

  useEffect(() => {
    fetchResources();
  }, [typeFilter]);

  const fetchResources = async (q = '') => {
    if (isB2C) {
      // B2C students don't have tenant-scoped content
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (q) params.set('search', q);
      if (typeFilter) params.set('type', typeFilter);
      params.set('status', 'APPROVED');
      const { data } = await api.get(`/content?${params.toString()}`);
      setResources(data.data);
      setMeta(data.meta);
    } catch {
      toast.error('Failed to load resources');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => fetchResources(search);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
      </div>
    );
  }

  if (isB2C) {
    return (
      <div className="max-w-5xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Resources</h1>
        <p className="text-gray-500 mb-8">Access study materials from your institution</p>
        <div className="card text-center py-12">
          <Library className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">No institution linked</p>
          <p className="text-sm text-gray-400 mt-1">
            Link your account to an institution in Settings to access shared resources.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Resource Library</h1>
        <p className="text-gray-500 mt-1">{meta?.total || 0} resources available</p>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search resources..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="input-field pl-10"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="input-field w-auto"
        >
          <option value="">All Types</option>
          <option value="REVISION_SHEET">Revision Sheets</option>
          <option value="QUESTION_BANK">Question Banks</option>
          <option value="FLASHCARD">Flashcards</option>
          <option value="TEACHER_RESOURCE">Teacher Resources</option>
          <option value="INSTITUTION_RESOURCE">Institution Resources</option>
        </select>
        <button onClick={handleSearch} className="btn-secondary">Search</button>
      </div>

      {/* Resource Grid */}
      {resources.length === 0 ? (
        <div className="card text-center py-12">
          <Library className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">No resources found</p>
          <p className="text-sm text-gray-400 mt-1">Check back later or try a different search</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {resources.map((res) => (
            <div key={res.id} className="card hover:shadow-elevated transition-shadow">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-brand-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  {res.type === 'QUESTION_BANK' ? (
                    <BookOpen className="w-5 h-5 text-brand-600" />
                  ) : (
                    <FileText className="w-5 h-5 text-brand-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{res.title}</h3>
                  {res.description && <p className="text-sm text-gray-500 mt-1 line-clamp-2">{res.description}</p>}
                  <div className="flex items-center gap-3 mt-3 flex-wrap">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                      {TYPE_LABELS[res.type] || res.type}
                    </span>
                    {res.subject && (
                      <span className="text-xs bg-brand-50 text-brand-700 px-2 py-0.5 rounded-full">
                        {res.subject.name}
                      </span>
                    )}
                    <span className="text-xs text-gray-400">
                      by {res.createdBy.firstName} {res.createdBy.lastName}
                    </span>
                    {res._count.files > 0 && (
                      <span className="text-xs text-gray-400">{res._count.files} file(s)</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <p className="text-sm text-gray-500">
            Page {meta.page} of {meta.totalPages}
          </p>
        </div>
      )}
    </div>
  );
}
