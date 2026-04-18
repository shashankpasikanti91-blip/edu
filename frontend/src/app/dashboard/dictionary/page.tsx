'use client';

import { useState, useEffect } from 'react';
import { Search, BookOpen, Loader2, ArrowLeft, Globe, Volume2 } from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';
import { renderMarkdownContent } from '@/lib/mathRenderer';

const LANGUAGES = [
  { value: '', label: 'English' },
  { value: 'hi', label: 'Hindi (हिन्दी)' },
  { value: 'te', label: 'Telugu (తెలుగు)' },
  { value: 'ta', label: 'Tamil (தமிழ்)' },
  { value: 'kn', label: 'Kannada (ಕನ್ನಡ)' },
  { value: 'ml', label: 'Malayalam (മലയാളം)' },
  { value: 'mr', label: 'Marathi (मराठी)' },
  { value: 'bn', label: 'Bengali (বাংলা)' },
  { value: 'gu', label: 'Gujarati (ગુજરાતી)' },
  { value: 'pa', label: 'Punjabi (ਪੰਜਾਬੀ)' },
  { value: 'ur', label: 'Urdu (اردو)' },
];

const RECENT_WORDS_KEY = 'srp_recent_words';

function getRecentWords(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(RECENT_WORDS_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveRecentWord(word: string) {
  const recent = getRecentWords().filter((w) => w.toLowerCase() !== word.toLowerCase());
  recent.unshift(word);
  localStorage.setItem(RECENT_WORDS_KEY, JSON.stringify(recent.slice(0, 20)));
}

export default function DictionaryPage() {
  const { user } = useAuthStore();
  const [word, setWord] = useState('');
  const [translateTo, setTranslateTo] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [recentWords, setRecentWords] = useState<string[]>(getRecentWords);
  const [educationContext, setEducationContext] = useState<{ level?: string; grade?: string }>({});

  // Load student education context for adaptive AI
  useEffect(() => {
    if (user?.accountType === 'B2C_STUDENT') {
      api.get('/students/academic-profile').then(({ data }) => {
        const profile = data.data;
        if (profile) {
          setEducationContext({
            level: profile.academicLevel || undefined,
            grade: profile.classYear || profile.grade || undefined,
          });
        }
      }).catch(() => {});
    }
  }, [user]);

  const lookupWord = async (searchWord?: string) => {
    const targetWord = (searchWord || word).trim();
    if (!targetWord) return;

    setIsLoading(true);
    setResult(null);

    try {
      const { data } = await api.post('/ai/dictionary', {
        word: targetWord,
        translateTo: translateTo || undefined,
        educationLevel: educationContext.level,
        grade: educationContext.grade,
      });

      setResult(data.data.definition);
      saveRecentWord(targetWord);
      setRecentWords(getRecentWords());
    } catch {
      toast.error('Failed to look up word. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecentClick = (w: string) => {
    setWord(w);
    lookupWord(w);
  };

  return (
    <div>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link href="/dashboard" className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dictionary</h1>
            <p className="text-gray-500 mt-1">Look up words, meanings, synonyms, translations &amp; more</p>
          </div>
        </div>

        {/* Search */}
        <div className="card mb-6">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={word}
                onChange={(e) => setWord(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && lookupWord()}
                placeholder="Type a word or phrase..."
                className="input-field pl-11 text-lg"
                disabled={isLoading}
              />
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-gray-400" />
              <select
                value={translateTo}
                onChange={(e) => setTranslateTo(e.target.value)}
                className="input-field w-auto text-sm"
              >
                <option value="">No translation</option>
                {LANGUAGES.filter((l) => l.value).map((lang) => (
                  <option key={lang.value} value={lang.value}>{lang.label}</option>
                ))}
              </select>
            </div>
            <button
              onClick={() => lookupWord()}
              disabled={isLoading || !word.trim()}
              className="btn-primary px-6"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Look up'}
            </button>
          </div>
        </div>

        {/* Recent Words */}
        {recentWords.length > 0 && !result && !isLoading && (
          <div className="card mb-6">
            <h3 className="text-sm font-medium text-gray-500 mb-3">Recent Lookups</h3>
            <div className="flex flex-wrap gap-2">
              {recentWords.slice(0, 15).map((w) => (
                <button
                  key={w}
                  onClick={() => handleRecentClick(w)}
                  className="px-3 py-1.5 text-sm rounded-full border border-gray-200 text-gray-600 hover:bg-brand-50 hover:border-brand-200 hover:text-brand-700 transition-colors"
                >
                  {w}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="card text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-brand-600 mx-auto mb-3" />
            <p className="text-gray-500">Looking up &ldquo;{word}&rdquo;...</p>
          </div>
        )}

        {/* Result */}
        {result && !isLoading && (
          <div className="card">
            <div className="prose prose-sm max-w-none text-gray-800 leading-relaxed">
              {renderMarkdownContent(result)}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!result && !isLoading && recentWords.length === 0 && (
          <div className="card text-center py-16">
            <BookOpen className="w-14 h-14 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Look Up Any Word</h3>
            <p className="text-gray-500 text-sm max-w-md mx-auto mb-6">
              Get definitions, meanings, synonyms, antonyms, etymology, example sentences, and translations in Indian languages.
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {['Photosynthesis', 'Democracy', 'Algorithm', 'Mitochondria', 'Renaissance'].map((w) => (
                <button
                  key={w}
                  onClick={() => handleRecentClick(w)}
                  className="px-4 py-2 text-sm rounded-full border border-gray-200 text-gray-600 hover:bg-brand-50 hover:border-brand-200 hover:text-brand-700 transition-colors"
                >
                  {w}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
