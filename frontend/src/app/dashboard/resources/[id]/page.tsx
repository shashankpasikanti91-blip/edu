'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Loader2, FileText, BookOpen, Download, ExternalLink,
  Calendar, User, Tag, AlertCircle, File, Eye,
} from 'lucide-react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { renderMarkdownContent } from '@/lib/mathRenderer';

interface ResourceFile {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  fileUrl: string;
  createdAt: string;
}

interface ResourceDetail {
  id: string;
  title: string;
  description: string | null;
  type: string;
  status: string;
  tags: string[];
  isPublic: boolean;
  metadata: Record<string, string> | null;
  createdAt: string;
  updatedAt: string;
  reviewNote: string | null;
  createdBy: { id: string; firstName: string; lastName: string; role: string };
  subject: { id: string; name: string } | null;
  files: ResourceFile[];
}

const TYPE_LABELS: Record<string, string> = {
  REVISION_SHEET: 'Revision Sheet',
  QUESTION_BANK: 'Question Bank',
  TEACHER_RESOURCE: 'Teacher Resource',
  INSTITUTION_RESOURCE: 'Institution Resource',
  FLASHCARD: 'Flashcard',
  NOTES: 'Notes',
  TEXTBOOK_SOLUTION: 'Textbook Solution',
  PDF: 'PDF Resource',
};

const TYPE_COLORS: Record<string, string> = {
  REVISION_SHEET: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  QUESTION_BANK: 'bg-brand-50 text-brand-700 border-brand-200',
  TEACHER_RESOURCE: 'bg-amber-50 text-amber-700 border-amber-200',
  INSTITUTION_RESOURCE: 'bg-violet-50 text-violet-700 border-violet-200',
  FLASHCARD: 'bg-rose-50 text-rose-700 border-rose-200',
  NOTES: 'bg-blue-50 text-blue-700 border-blue-200',
  TEXTBOOK_SOLUTION: 'bg-orange-50 text-orange-700 border-orange-200',
  PDF: 'bg-red-50 text-red-700 border-red-200',
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ResourceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [resource, setResource] = useState<ResourceDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    async function fetchResource() {
      try {
        const { data } = await api.get(`/content/${id}`);
        setResource(data.data);
      } catch (err: unknown) {
        const axiosErr = err as { response?: { status?: number; data?: { message?: string } } };
        if (axiosErr.response?.status === 404) {
          setError('Resource not found or has been deleted.');
        } else if (axiosErr.response?.status === 403) {
          setError('You do not have permission to view this resource.');
        } else {
          setError(axiosErr.response?.data?.message || 'Failed to load resource.');
        }
        toast.error('Failed to load resource');
      } finally {
        setIsLoading(false);
      }
    }
    fetchResource();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
        <p className="text-sm text-gray-500">Loading resource...</p>
      </div>
    );
  }

  if (error || !resource) {
    return (
      <div className="max-w-3xl mx-auto">
        <Link href="/dashboard/resources" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Resources
        </Link>
        <div className="card text-center py-12">
          <AlertCircle className="w-12 h-12 text-red-300 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Resource Unavailable</h2>
          <p className="text-gray-500 text-sm max-w-md mx-auto">{error || 'This resource could not be found.'}</p>
          <button onClick={() => router.push('/dashboard/resources')} className="btn-primary mt-4">
            Back to Library
          </button>
        </div>
      </div>
    );
  }

  const typeColor = TYPE_COLORS[resource.type] || 'bg-gray-50 text-gray-700 border-gray-200';

  return (
    <div className="max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <Link href="/dashboard/resources" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Resources
      </Link>

      {/* Header Card */}
      <div className="card mb-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center flex-shrink-0">
            {resource.type === 'QUESTION_BANK' ? (
              <BookOpen className="w-6 h-6 text-brand-600" />
            ) : (
              <FileText className="w-6 h-6 text-brand-600" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-gray-900 mb-1">{resource.title}</h1>
            {resource.description && (
              <p className="text-gray-600 text-sm mb-3">{resource.description}</p>
            )}
            <div className="flex items-center gap-3 flex-wrap">
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${typeColor}`}>
                {TYPE_LABELS[resource.type] || resource.type}
              </span>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${
                resource.status === 'APPROVED' ? 'bg-green-50 text-green-700 border-green-200' :
                resource.status === 'DRAFT' ? 'bg-gray-50 text-gray-600 border-gray-200' :
                resource.status === 'REJECTED' ? 'bg-red-50 text-red-700 border-red-200' :
                'bg-yellow-50 text-yellow-700 border-yellow-200'
              }`}>
                {resource.status}
              </span>
              {resource.subject && (
                <span className="text-xs bg-brand-50 text-brand-700 px-2.5 py-1 rounded-full border border-brand-200">
                  {resource.subject.name}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Meta Info */}
        <div className="mt-5 pt-5 border-t border-gray-100 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center gap-2 text-gray-500">
            <User className="w-4 h-4" />
            <span>{resource.createdBy.firstName} {resource.createdBy.lastName}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-500">
            <Calendar className="w-4 h-4" />
            <span>{new Date(resource.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-500">
            <File className="w-4 h-4" />
            <span>{resource.files.length} file(s)</span>
          </div>
          {resource.isPublic && (
            <div className="flex items-center gap-2 text-gray-500">
              <Eye className="w-4 h-4" />
              <span>Public</span>
            </div>
          )}
        </div>

        {/* Tags */}
        {resource.tags && resource.tags.length > 0 && (
          <div className="mt-4 flex items-center gap-2 flex-wrap">
            <Tag className="w-4 h-4 text-gray-400" />
            {resource.tags.map((tag) => (
              <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Attached Files */}
      {resource.files.length > 0 && (
        <div className="card mb-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Attached Files</h2>
          <div className="space-y-3">
            {resource.files.map((file) => (
              <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 bg-white rounded-lg border border-gray-200 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-4 h-4 text-gray-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{file.fileName}</p>
                    <p className="text-xs text-gray-400">
                      {file.fileType} &middot; {formatFileSize(file.fileSize)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {file.fileUrl && (
                    <>
                      <a
                        href={file.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-brand-600 transition-colors"
                        title="Open file"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <a
                        href={file.fileUrl}
                        download
                        className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-brand-600 transition-colors"
                        title="Download file"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Content body (for flashcards/notes that have metadata content) */}
      {resource.metadata && typeof (resource.metadata as Record<string, string>).content === 'string' && (
        <div className="card mb-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Content</h2>
          <div className="prose prose-sm max-w-none text-gray-800">
            {renderMarkdownContent((resource.metadata as Record<string, string>).content)}
          </div>
        </div>
      )}

      {/* Review Note */}
      {resource.reviewNote && (
        <div className="card mb-6 border-amber-200 bg-amber-50/50">
          <h2 className="text-base font-semibold text-amber-800 mb-2">Review Note</h2>
          <p className="text-sm text-amber-700">{resource.reviewNote}</p>
        </div>
      )}

      {/* Empty files state */}
      {resource.files.length === 0 && !(resource.metadata && typeof (resource.metadata as Record<string, string>).content === 'string') && (
        <div className="card text-center py-8">
          <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">No files or content attached to this resource yet.</p>
        </div>
      )}
    </div>
  );
}
