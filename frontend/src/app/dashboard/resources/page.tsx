'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Library, BookOpen, FileText, Search, Loader2, ChevronLeft, ChevronRight, ExternalLink, GraduationCap, Plus, X, Save } from 'lucide-react';
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

// Free, open educational resources for individual students (copyright-free / open-license)
const OPEN_RESOURCES = [
  {
    id: 'ncert-textbooks',
    title: 'NCERT Textbooks (Classes 1–12)',
    description: 'Official NCERT textbooks for all subjects. Free to download and use for educational purposes.',
    url: 'https://ncert.nic.in/textbook.php',
    category: 'Textbook',
    levels: ['PRIMARY_SCHOOL', 'MIDDLE_SCHOOL', 'HIGH_SCHOOL', 'HIGHER_SECONDARY'],
    icon: '📚',
  },
  {
    id: 'ncert-exemplar',
    title: 'NCERT Exemplar Problems',
    description: 'Practice problems with solutions for Science and Maths (Classes 6–12).',
    url: 'https://ncert.nic.in/exemplar-problems.php',
    category: 'Practice',
    levels: ['MIDDLE_SCHOOL', 'HIGH_SCHOOL', 'HIGHER_SECONDARY'],
    icon: '✏️',
  },
  {
    id: 'diksha',
    title: 'DIKSHA — Digital Learning Platform',
    description: 'Government of India interactive courses, textbooks, and assessments for all boards and classes.',
    url: 'https://diksha.gov.in',
    category: 'Interactive',
    levels: ['PRIMARY_SCHOOL', 'MIDDLE_SCHOOL', 'HIGH_SCHOOL', 'HIGHER_SECONDARY'],
    icon: '🎓',
  },
  {
    id: 'swayam',
    title: 'SWAYAM — Free Online Courses',
    description: 'MOOCs from top Indian professors for UG, PG, and professional courses. Earn certificates.',
    url: 'https://swayam.gov.in',
    category: 'Course',
    levels: ['UG', 'PG', 'DOCTORAL', 'PROFESSIONAL', 'DIPLOMA'],
    icon: '🏫',
  },
  {
    id: 'nptel',
    title: 'NPTEL — Engineering & Science Courses',
    description: 'Video lectures and course materials from IITs and IISc. Ideal for engineering and science students.',
    url: 'https://nptel.ac.in',
    category: 'Course',
    levels: ['UG', 'PG', 'DOCTORAL', 'DIPLOMA'],
    icon: '🔬',
  },
  {
    id: 'nroer',
    title: 'National Repository of Open Educational Resources',
    description: 'Government repository of free educational content: videos, audio, images, and documents.',
    url: 'https://nroer.gov.in',
    category: 'Reference',
    levels: ['PRIMARY_SCHOOL', 'MIDDLE_SCHOOL', 'HIGH_SCHOOL', 'HIGHER_SECONDARY'],
    icon: '📖',
  },
  {
    id: 'epathshala',
    title: 'e-Pathshala (NCERT)',
    description: 'NCERT e-books, audio, and videos for Classes 1–12 in Hindi, English, and Urdu.',
    url: 'https://epathshala.nic.in',
    category: 'Textbook',
    levels: ['PRIMARY_SCHOOL', 'MIDDLE_SCHOOL', 'HIGH_SCHOOL', 'HIGHER_SECONDARY'],
    icon: '📱',
  },
  {
    id: 'khan-academy',
    title: 'Khan Academy — Free Learning',
    description: 'World-class free education: Math, Science, Computing, Economics, and more with practice exercises.',
    url: 'https://www.khanacademy.org',
    category: 'Interactive',
    levels: ['PRIMARY_SCHOOL', 'MIDDLE_SCHOOL', 'HIGH_SCHOOL', 'HIGHER_SECONDARY', 'UG', 'COMPETITIVE_EXAM'],
    icon: '🌐',
  },
  {
    id: 'mit-ocw',
    title: 'MIT OpenCourseWare',
    description: 'Free course materials from MIT for engineering, computer science, mathematics, and more.',
    url: 'https://ocw.mit.edu',
    category: 'Course',
    levels: ['UG', 'PG', 'DOCTORAL'],
    icon: '🏛️',
  },
  {
    id: 'neet-prep',
    title: 'NTA NEET/JEE Practice Papers',
    description: 'Previous year question papers and mock tests from NTA for NEET and JEE aspirants.',
    url: 'https://nta.ac.in',
    category: 'Practice',
    levels: ['HIGHER_SECONDARY', 'COMPETITIVE_EXAM'],
    icon: '🎯',
  },
];

export default function ResourcesPage() {
  const { user } = useAuthStore();
  const [resources, setResources] = useState<Resource[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const isB2C = user?.accountType === 'B2C_STUDENT';
  const isInstAdmin = ['INSTITUTION_OWNER', 'INSTITUTION_ADMIN', 'TEACHER', 'DEPARTMENT_ADMIN'].includes(user?.role || '');
  const [studentLevel, setStudentLevel] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newResource, setNewResource] = useState({
    title: '',
    description: '',
    type: 'INSTITUTION_RESOURCE',
    content: '',
  });

  useEffect(() => {
    if (isB2C) {
      // Load student's academic profile to filter resources
      api.get('/students/academic-profile').then(({ data }) => {
        if (data.data?.academicLevel) setStudentLevel(data.data.academicLevel);
      }).catch(() => {});
      setIsLoading(false);
    } else {
      fetchResources();
    }
  }, [typeFilter]);

  const fetchResources = async (q = '', page = 1) => {
    if (isB2C) return;
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (q) params.set('search', q);
      if (typeFilter) params.set('type', typeFilter);
      params.set('status', 'APPROVED');
      params.set('page', String(page));
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

  const handleCreateResource = async () => {
    if (!newResource.title.trim()) {
      toast.error('Title is required');
      return;
    }
    setCreating(true);
    try {
      await api.post('/content', {
        title: newResource.title.trim(),
        description: newResource.description.trim() || null,
        type: newResource.type,
        content: newResource.content.trim() || null,
      });
      toast.success('Resource created successfully');
      setShowCreate(false);
      setNewResource({ title: '', description: '', type: 'INSTITUTION_RESOURCE', content: '' });
      fetchResources(search);
    } catch {
      toast.error('Failed to create resource');
    } finally {
      setCreating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
      </div>
    );
  }

  // B2C Student view — show open educational resources
  if (isB2C) {
    const filteredResources = studentLevel
      ? OPEN_RESOURCES.filter(r => r.levels.includes(studentLevel))
      : OPEN_RESOURCES;

    const searchFiltered = search.trim()
      ? filteredResources.filter(r =>
          r.title.toLowerCase().includes(search.toLowerCase()) ||
          r.description.toLowerCase().includes(search.toLowerCase()) ||
          r.category.toLowerCase().includes(search.toLowerCase())
        )
      : filteredResources;

    return (
      <div className="max-w-5xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Study Resources</h1>
          <p className="text-gray-500 mt-1">Free, verified educational materials for your studies</p>
        </div>

        {/* Info banner */}
        <div className="mb-6 p-4 bg-brand-50 border border-brand-200 rounded-xl">
          <div className="flex items-start gap-3">
            <GraduationCap className="w-5 h-5 text-brand-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-brand-800">Open Educational Resources</p>
              <p className="text-sm text-brand-600 mt-0.5">
                These are free, government-approved and open-license educational resources. All materials comply with copyright regulations.
                {!studentLevel && ' Set up your Academic Profile to see resources tailored to your level.'}
              </p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="flex gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search resources..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-10"
            />
          </div>
        </div>

        {/* Resource Grid */}
        <div className="grid gap-4 md:grid-cols-2">
          {searchFiltered.map((res) => (
            <a
              key={res.id}
              href={res.url}
              target="_blank"
              rel="noopener noreferrer"
              className="card hover:shadow-elevated transition-shadow cursor-pointer group block"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-brand-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-brand-200 transition-colors text-xl">
                  {res.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate group-hover:text-brand-700 transition-colors flex items-center gap-1">
                    {res.title}
                    <ExternalLink className="w-3 h-3 text-gray-400 flex-shrink-0" />
                  </h3>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{res.description}</p>
                  <div className="flex items-center gap-2 mt-3">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                      {res.category}
                    </span>
                    <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full">
                      Free &amp; Open
                    </span>
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>

        {searchFiltered.length === 0 && (
          <div className="card text-center py-12">
            <Library className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">No matching resources found</p>
          </div>
        )}

        {/* Link institution CTA */}
        <div className="mt-8 card bg-gray-50 border-dashed">
          <div className="text-center py-4">
            <p className="text-sm text-gray-600 font-medium">Have an institution code?</p>
            <p className="text-xs text-gray-400 mt-1">
              Link your account to an institution in <Link href="/dashboard/settings" className="text-brand-600 hover:underline">Settings</Link> to access their shared resources and study materials.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Resource Library</h1>
          <p className="text-gray-500 mt-1">{meta?.total || 0} resources available</p>
        </div>
        {isInstAdmin && (
          <button onClick={() => setShowCreate(true)} className="btn-primary inline-flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Resource
          </button>
        )}
      </div>

      {/* Create Resource Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Create Resource</h2>
              <button onClick={() => setShowCreate(false)} className="p-1 rounded-lg hover:bg-gray-100">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input type="text" value={newResource.title} onChange={(e) => setNewResource(p => ({ ...p, title: e.target.value }))} className="input-field" placeholder="Resource title" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select value={newResource.type} onChange={(e) => setNewResource(p => ({ ...p, type: e.target.value }))} className="input-field">
                  <option value="INSTITUTION_RESOURCE">Institution Resource</option>
                  <option value="REVISION_SHEET">Revision Sheet</option>
                  <option value="QUESTION_BANK">Question Bank</option>
                  <option value="FLASHCARD">Flashcard</option>
                  <option value="TEACHER_RESOURCE">Teacher Resource</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={newResource.description} onChange={(e) => setNewResource(p => ({ ...p, description: e.target.value }))} className="input-field" rows={2} placeholder="Brief description of the resource" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                <textarea value={newResource.content} onChange={(e) => setNewResource(p => ({ ...p, content: e.target.value }))} className="input-field" rows={6} placeholder="Paste or type the resource content here (supports text, notes, question banks)..." />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowCreate(false)} className="btn-secondary flex-1">Cancel</button>
                <button onClick={handleCreateResource} disabled={creating} className="btn-primary flex-1 inline-flex items-center justify-center gap-2">
                  {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
            <Link
              key={res.id}
              href={`/dashboard/resources/${res.id}`}
              className="card hover:shadow-elevated transition-shadow cursor-pointer group block"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-brand-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-brand-200 transition-colors">
                  {res.type === 'QUESTION_BANK' ? (
                    <BookOpen className="w-5 h-5 text-brand-600" />
                  ) : (
                    <FileText className="w-5 h-5 text-brand-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate group-hover:text-brand-700 transition-colors">{res.title}</h3>
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
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-8">
          <button
            onClick={() => { if (meta.page > 1) fetchResources(search, meta.page - 1); }}
            disabled={meta.page <= 1}
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          </button>
          <p className="text-sm text-gray-500">
            Page {meta.page} of {meta.totalPages}
          </p>
          <button
            onClick={() => { if (meta.page < meta.totalPages) fetchResources(search, meta.page + 1); }}
            disabled={meta.page >= meta.totalPages}
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      )}
    </div>
  );
}
