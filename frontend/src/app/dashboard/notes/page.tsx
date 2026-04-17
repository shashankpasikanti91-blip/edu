'use client';

import { useEffect, useState } from 'react';
import { FileText, Plus, Search, Star, Trash2, Edit3, X, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

interface Note {
  id: string;
  title: string;
  content: string;
  subjectName: string | null;
  tags: string[];
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Meta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showEditor, setShowEditor] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [form, setForm] = useState({ title: '', content: '', subjectName: '' });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async (query = '') => {
    setIsLoading(true);
    try {
      const params = query ? `?search=${encodeURIComponent(query)}` : '';
      const { data } = await api.get(`/students/notes${params}`);
      setNotes(data.data.items);
      setMeta(data.data.meta);
    } catch {
      toast.error('Failed to load notes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    fetchNotes(search);
  };

  const openNew = () => {
    setEditingNote(null);
    setForm({ title: '', content: '', subjectName: '' });
    setShowEditor(true);
  };

  const openEdit = (note: Note) => {
    setEditingNote(note);
    setForm({ title: note.title, content: note.content, subjectName: note.subjectName || '' });
    setShowEditor(true);
  };

  const saveNote = async () => {
    if (!form.title.trim() || !form.content.trim()) {
      toast.error('Title and content are required');
      return;
    }
    setIsSaving(true);
    try {
      if (editingNote) {
        await api.patch(`/students/notes/${editingNote.id}`, form);
        toast.success('Note updated');
      } else {
        await api.post('/students/notes', form);
        toast.success('Note created');
      }
      setShowEditor(false);
      fetchNotes(search);
    } catch {
      toast.error('Failed to save note');
    } finally {
      setIsSaving(false);
    }
  };

  const deleteNote = async (id: string) => {
    if (!confirm('Delete this note?')) return;
    try {
      await api.delete(`/students/notes/${id}`);
      toast.success('Note deleted');
      fetchNotes(search);
    } catch {
      toast.error('Failed to delete note');
    }
  };

  const toggleFavorite = async (note: Note) => {
    try {
      await api.patch(`/students/notes/${note.id}`, { isFavorite: !note.isFavorite });
      setNotes((prev) => prev.map((n) => n.id === note.id ? { ...n, isFavorite: !n.isFavorite } : n));
    } catch {
      toast.error('Failed to update');
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
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Notes</h1>
          <p className="text-gray-500 mt-1">{meta?.total || 0} notes saved</p>
        </div>
        <button onClick={openNew} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Note
        </button>
      </div>

      {/* Search */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="input-field pl-10"
          />
        </div>
        <button onClick={handleSearch} className="btn-secondary">Search</button>
      </div>

      {/* Notes List */}
      {notes.length === 0 ? (
        <div className="card text-center py-12">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">No notes yet</p>
          <p className="text-sm text-gray-400 mt-1">Create your first note to start organizing your studies</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {notes.map((note) => (
            <div key={note.id} className="card hover:shadow-elevated transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => openEdit(note)}>
                  <h3 className="font-semibold text-gray-900 truncate">{note.title}</h3>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{note.content}</p>
                  <div className="flex items-center gap-3 mt-3">
                    {note.subjectName && (
                      <span className="text-xs bg-brand-50 text-brand-700 px-2 py-0.5 rounded-full">{note.subjectName}</span>
                    )}
                    <span className="text-xs text-gray-400">
                      {new Date(note.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 ml-4">
                  <button onClick={() => toggleFavorite(note)} className="p-1.5 rounded-lg hover:bg-gray-100">
                    <Star className={`w-4 h-4 ${note.isFavorite ? 'text-yellow-500 fill-yellow-500' : 'text-gray-400'}`} />
                  </button>
                  <button onClick={() => openEdit(note)} className="p-1.5 rounded-lg hover:bg-gray-100">
                    <Edit3 className="w-4 h-4 text-gray-400" />
                  </button>
                  <button onClick={() => deleteNote(note.id)} className="p-1.5 rounded-lg hover:bg-red-50">
                    <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Editor Modal */}
      {showEditor && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingNote ? 'Edit Note' : 'New Note'}
              </h2>
              <button onClick={() => setShowEditor(false)} className="p-1 hover:bg-gray-100 rounded-lg">
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
                  placeholder="Note title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject (optional)</label>
                <input
                  type="text"
                  value={form.subjectName}
                  onChange={(e) => setForm({ ...form, subjectName: e.target.value })}
                  className="input-field"
                  placeholder="e.g. Mathematics"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                <textarea
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  className="input-field min-h-[200px] resize-y"
                  placeholder="Write your note..."
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-gray-100">
              <button onClick={() => setShowEditor(false)} className="btn-secondary">Cancel</button>
              <button onClick={saveNote} disabled={isSaving} className="btn-primary flex items-center gap-2">
                {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                {editingNote ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
