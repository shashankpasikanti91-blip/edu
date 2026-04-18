'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import {
  Upload,
  File,
  Trash2,
  Download,
  ArrowLeft,
  Loader2,
  FileText,
  FileSpreadsheet,
  Image as ImageIcon,
  AlertCircle,
  CheckCircle,
  X,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

type UploadPurpose = 'study_material' | 'attendance' | 'profile_image' | 'general';

interface UploadRecord {
  id: string;
  fileName: string;
  fileUrl: string;
  mimeType: string;
  fileSize: number;
  purpose: string;
  createdAt: string;
}

const PURPOSE_LABELS: Record<string, string> = {
  study_material: 'Study Material',
  attendance: 'Attendance',
  profile_image: 'Profile Image',
  general: 'General',
};

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function getFileIcon(mimeType: string) {
  if (mimeType.startsWith('image/')) return <ImageIcon className="w-5 h-5 text-violet-500" />;
  if (mimeType.includes('spreadsheet') || mimeType.includes('csv') || mimeType.includes('excel'))
    return <FileSpreadsheet className="w-5 h-5 text-emerald-500" />;
  return <FileText className="w-5 h-5 text-brand-500" />;
}

const ADMIN_ROLES = ['SUPER_ADMIN', 'INSTITUTION_ADMIN', 'INSTITUTION_OWNER', 'DEPARTMENT_ADMIN'];

export default function FilesPage() {
  const { user } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [files, setFiles] = useState<UploadRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [filterPurpose, setFilterPurpose] = useState<string>('');
  const [selectedPurpose, setSelectedPurpose] = useState<UploadPurpose>('study_material');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const canUploadAttendance =
    user &&
    (user.role === 'TEACHER' || ADMIN_ROLES.includes(user.role));

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchFiles = async () => {
    setIsLoading(true);
    try {
      const params: Record<string, string | number> = { page, limit: 20 };
      if (filterPurpose) params.purpose = filterPurpose;
      const res = await api.get('/uploads', { params });
      if (res.data?.data) {
        setFiles(res.data.data.uploads);
        setTotal(res.data.data.total ?? 0);
      }
    } catch {
      showToast('error', 'Failed to load files');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [page, filterPurpose]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('purpose', selectedPurpose);
      await api.post('/uploads', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      showToast('success', 'File uploaded successfully');
      setPage(1);
      await fetchFiles();
    } catch (err: unknown) {
      const axiosMsg = (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message;
      showToast('error', axiosMsg || 'Upload failed');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (id: string) => {
    setDeleteId(id);
    try {
      await api.delete(`/uploads/${id}`);
      showToast('success', 'File deleted');
      setFiles((prev) => prev.filter((f) => f.id !== id));
      setTotal((prev) => prev - 1);
    } catch {
      showToast('error', 'Failed to delete file');
    } finally {
      setDeleteId(null);
    }
  };

  const handleDownload = async (upload: UploadRecord) => {
    try {
      const res = await api.get(`/uploads/download/${upload.fileName}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = upload.fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      showToast('error', 'Download failed');
    }
  };

  const totalPages = Math.ceil(total / 20);

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right">
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border ${
              toast.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
            )}
            <span className="text-sm font-medium">{toast.message}</span>
            <button onClick={() => setToast(null)}>
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/dashboard"
            className="p-2 rounded-xl bg-white border border-gray-100 hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <File className="w-6 h-6 text-brand-600" />
              My Files
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Upload study materials, attendance sheets, and more.
            </p>
          </div>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Upload a File</h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={selectedPurpose}
              onChange={(e) => setSelectedPurpose(e.target.value as UploadPurpose)}
              className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="study_material">Study Material</option>
              {canUploadAttendance && <option value="attendance">Attendance (Excel/CSV)</option>}
              <option value="profile_image">Profile Image</option>
              <option value="general">General</option>
            </select>

            <input
              ref={fileInputRef}
              type="file"
              onChange={handleUpload}
              className="hidden"
              accept={
                selectedPurpose === 'profile_image'
                  ? 'image/jpeg,image/png,image/webp'
                  : selectedPurpose === 'attendance'
                  ? '.xlsx,.xls,.csv'
                  : undefined
              }
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-brand-600 text-white rounded-xl text-sm font-medium hover:bg-brand-700 transition-colors disabled:opacity-50"
            >
              {isUploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              {isUploading ? 'Uploading...' : 'Choose File'}
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-3">
            Study Materials: PDF, DOC, DOCX, PPT, PPTX, TXT, images (max 25MB)
            {canUploadAttendance && ' · Attendance: Excel, CSV (max 10MB)'}
            {' · Profile Image: JPEG, PNG, WebP (max 2MB)'}
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm text-gray-500">Filter:</span>
          {['', 'study_material', 'attendance', 'profile_image', 'general'].map((p) => (
            <button
              key={p}
              onClick={() => {
                setFilterPurpose(p);
                setPage(1);
              }}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                filterPurpose === p
                  ? 'bg-brand-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {p === '' ? 'All' : PURPOSE_LABELS[p]}
            </button>
          ))}
        </div>

        {/* File List */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-brand-600" />
            </div>
          ) : files.length === 0 ? (
            <div className="text-center py-16">
              <Upload className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-400">No files uploaded yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors"
                >
                  {getFileIcon(file.mimeType)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {file.fileName}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-400">
                      <span>{formatBytes(file.fileSize)}</span>
                      <span>·</span>
                      <span className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-500">
                        {PURPOSE_LABELS[file.purpose] || file.purpose}
                      </span>
                      <span>·</span>
                      <span>{new Date(file.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleDownload(file)}
                      title="Download"
                      className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500 hover:text-brand-600"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(file.id)}
                      disabled={deleteId === file.id}
                      title="Delete"
                      className="p-2 rounded-lg hover:bg-red-50 transition-colors text-gray-400 hover:text-red-600 disabled:opacity-50"
                    >
                      {deleteId === file.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 px-6 py-4 border-t border-gray-100">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 text-sm rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-500">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 text-sm rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
