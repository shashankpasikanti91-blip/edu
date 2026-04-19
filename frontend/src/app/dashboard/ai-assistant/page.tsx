'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import {
  Send, Plus, Trash2, Loader2, Brain,
  BookOpen, FileQuestion,
  Lightbulb, Table2, BarChart3, ListChecks,
  Calculator, BookMarked, Copy, Check, Sparkles,
  AlertTriangle, Shield,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import type { AiChat, AiChatMessage } from '@/types';
import { renderMarkdownContent } from '@/lib/mathRenderer';

// Study Modes — maps to backend StudyMode enum
const STUDY_MODES = [
  { value: 'default', label: 'Default', icon: Sparkles },
  { value: 'explain_topic', label: 'Explain Topic', icon: Lightbulb },
  { value: 'solve_step_by_step', label: 'Solve Step by Step', icon: Calculator },
  { value: 'exam_answer', label: 'Exam Answer', icon: ListChecks },
  { value: 'table_compare', label: 'Table Compare', icon: Table2 },
  { value: 'memory_tricks', label: 'Memory Tricks', icon: BookMarked },
  { value: 'diagram_summary', label: 'Diagram Summary', icon: BarChart3 },
  { value: 'revision_notes', label: 'Revision Notes', icon: BookOpen },
  { value: 'quick_quiz', label: 'Quick Quiz', icon: FileQuestion },
];

const ANSWER_STANDARDS = [
  { value: 'indian', label: 'Indian Standard' },
  { value: 'international', label: 'International' },
  { value: 'neutral', label: 'Neutral' },
  { value: 'hybrid', label: 'Hybrid' },
];

const MODE_FORMAT_CLASS: Record<string, string> = {
  table_compare: 'ai-format-table',
  memory_tricks: 'ai-format-memory',
  exam_answer: 'ai-format-exam',
  diagram_summary: 'ai-format-diagram',
};

// Detect medical/pharma/drug content in AI responses to show disclaimer
const MEDICAL_KEYWORDS = /\b(dosage|medication|drug|prescription|mg\/kg|tablet|capsule|injection|IV|intramuscular|intravenous|oral\s+dose|side\s+effect|contraindication|pharmacology|pharmacokinetic|pharmacodynamic|adverse\s+effect|therapeutic|antidote|overdose|toxicity|diagnosis|prognosis|pathophysiology|clinical\s+feature|symptom|treatment\s+protocol|surgical|anaesthesia|anesthesia|chemotherapy|insulin|antibiotic|analgesic|antipyretic|antihypertensive|NSAID|opioid|sedative|diuretic|steroid|vaccine)\b/i;

function containsMedicalContent(text: string): boolean {
  // Count matches — only flag if multiple medical terms appear (avoids false positives)
  const matches = text.match(new RegExp(MEDICAL_KEYWORDS.source, 'gi'));
  return (matches?.length || 0) >= 3;
}

export default function AiAssistantPage() {
  const { user } = useAuthStore();
  const [chats, setChats] = useState<AiChat[]>([]);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [messages, setMessages] = useState<AiChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoadingChats, setIsLoadingChats] = useState(true);
  const [studyMode, setStudyMode] = useState('default');
  const [answerStandard, setAnswerStandard] = useState('indian');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [educationContext, setEducationContext] = useState<{ level?: string; grade?: string }>({});

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

  useEffect(() => {
    fetchChats();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchChats = async () => {
    try {
      const { data } = await api.get('/ai/chats');
      setChats(data.data || []);
    } catch {
      // Non-critical
    } finally {
      setIsLoadingChats(false);
    }
  };

  const createChat = async () => {
    try {
      const { data } = await api.post('/ai/chats', { title: 'New Chat' });
      const newChat = data.data;
      setChats((prev) => [{ id: newChat.id, title: newChat.title, lastMessage: null, updatedAt: newChat.createdAt }, ...prev]);
      setActiveChat(newChat.id);
      setMessages([]);
      inputRef.current?.focus();
    } catch {
      toast.error('Failed to create chat');
    }
  };

  const loadChat = async (chatId: string) => {
    setActiveChat(chatId);
    try {
      const { data } = await api.get(`/ai/chats/${chatId}/messages`);
      setMessages(data.data || []);
    } catch {
      toast.error('Failed to load messages');
    }
  };

  const deleteChat = async (chatId: string) => {
    try {
      await api.delete(`/ai/chats/${chatId}`);
      setChats((prev) => prev.filter((c) => c.id !== chatId));
      if (activeChat === chatId) {
        setActiveChat(null);
        setMessages([]);
      }
      toast.success('Chat deleted');
    } catch {
      toast.error('Failed to delete chat');
    }
  };

  const sendMessage = useCallback(async (messageOverride?: string) => {
    const messageText = messageOverride ?? input.trim();
    if (!messageText || isSending) return;

    // Auto-create chat if none is active
    let chatId = activeChat;
    if (!chatId) {
      try {
        const { data } = await api.post('/ai/chats', { title: 'New Chat' });
        chatId = data.data.id;
        setActiveChat(chatId);
        setChats((prev) => [{ id: data.data.id, title: data.data.title, lastMessage: null, updatedAt: data.data.createdAt }, ...prev]);
      } catch {
        toast.error('Failed to create chat');
        return;
      }
    }

    const userMessage: AiChatMessage = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: messageText,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsSending(true);

    try {
      const { data } = await api.post(`/ai/chats/${chatId}/messages`, {
        message: messageText,
        mode: studyMode !== 'default' ? studyMode : undefined,
        answerStandard,
        educationLevel: educationContext.level,
        grade: educationContext.grade,
      });

      setMessages((prev) => [...prev, data.data]);
      fetchChats();
    } catch {
      toast.error('AI is temporarily unavailable. Please try again.');
      setMessages((prev) => prev.filter((m) => m.id !== userMessage.id));
      setInput(messageText);
    } finally {
      setIsSending(false);
    }
  }, [input, isSending, activeChat, studyMode, answerStandard, educationContext]);

  const handleQuickAction = (prompt: string, mode?: string) => {
    if (mode) setStudyMode(mode);
    setInput(prompt);
    sendMessage(prompt);
  };

  const handleCopyMessage = async (msgId: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(msgId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] lg:h-[calc(100vh-4rem)] h-[calc(100vh-3.5rem)] gap-0 lg:gap-6 -m-4 sm:-m-6 lg:-m-8">
      {/* Chat List Sidebar — hidden on mobile, shown with toggle */}
      <div className={`
        ${activeChat ? 'hidden lg:flex' : 'flex'}
        w-full lg:w-72 bg-white rounded-none lg:rounded-2xl border-0 lg:border border-gray-100 flex-col
      `}>
        <div className="p-4 border-b border-gray-100">
          <button
            onClick={createChat}
            className="btn-primary w-full flex items-center justify-center gap-2 py-3"
          >
            <Plus className="w-4 h-4" />
            New Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {isLoadingChats ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
            </div>
          ) : chats.length === 0 ? (
            <p className="text-center text-sm text-gray-400 py-8">No chats yet</p>
          ) : (
            chats.map((chat) => (
              <div
                key={chat.id}
                className={`group flex items-center gap-2 px-3 py-3 rounded-xl cursor-pointer transition-colors ${
                  activeChat === chat.id
                    ? 'bg-brand-50 text-brand-700'
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
                onClick={() => loadChat(chat.id)}
              >
                <Brain className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1 text-sm truncate">{chat.title}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteChat(chat.id); }}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`
        ${!activeChat ? 'hidden lg:flex' : 'flex'}
        flex-1 bg-white rounded-none lg:rounded-2xl border-0 lg:border border-gray-100 flex-col
      `}>
        {/* Mobile back-to-chats button */}
        {activeChat && (
          <div className="lg:hidden flex items-center gap-2 p-3 border-b border-gray-100">
            <button
              onClick={() => setActiveChat(null)}
              className="flex items-center gap-1.5 text-sm text-brand-600 font-medium px-2 py-1.5 rounded-lg hover:bg-brand-50 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              All Chats
            </button>
          </div>
        )}

        {!activeChat && messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center overflow-y-auto">
            <div className="text-center max-w-2xl mx-auto px-4 py-8">
              <div className="w-16 h-16 bg-brand-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-brand-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">AI Study Assistant</h2>
              <p className="text-gray-500 max-w-md mx-auto mb-8">
                Indian-standard study help for concepts, doubts, summaries, and exam answers.
              </p>

              {/* 7 Study Mode Quick Actions */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 max-w-2xl mx-auto text-left mb-6">
                <button
                  onClick={() => handleQuickAction('Generate 10 MCQ questions for Class 10 CBSE Science — Chemical Reactions and Equations with answers', 'default')}
                  className="flex items-center gap-2 p-3 rounded-xl border border-gray-200 hover:bg-brand-50 hover:border-brand-200 transition-colors"
                >
                  <FileQuestion className="w-5 h-5 text-brand-600 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Generate Q&amp;A</span>
                </button>
                <button
                  onClick={() => handleQuickAction('Explain the concept of Federalism in India as per NCERT Political Science Class 10', 'explain_topic')}
                  className="flex items-center gap-2 p-3 rounded-xl border border-gray-200 hover:bg-green-50 hover:border-green-200 transition-colors"
                >
                  <Lightbulb className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Explain Topic</span>
                </button>
                <button
                  onClick={() => handleQuickAction('Solve step by step: A train travels 360 km at a uniform speed. If the speed had been 5 km/h more, it would have taken 1 hour less. Find the speed.', 'solve_step_by_step')}
                  className="flex items-center gap-2 p-3 rounded-xl border border-gray-200 hover:bg-blue-50 hover:border-blue-200 transition-colors"
                >
                  <Calculator className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Solve Step by Step</span>
                </button>
                <button
                  onClick={() => handleQuickAction('Write a model exam answer: Discuss the significance of the Indian Constitution Preamble (8 marks)', 'exam_answer')}
                  className="flex items-center gap-2 p-3 rounded-xl border border-gray-200 hover:bg-emerald-50 hover:border-emerald-200 transition-colors"
                >
                  <ListChecks className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Exam Answer</span>
                </button>
                <button
                  onClick={() => handleQuickAction('Compare Mitosis vs Meiosis in a detailed table for Class 11 Biology', 'table_compare')}
                  className="flex items-center gap-2 p-3 rounded-xl border border-gray-200 hover:bg-violet-50 hover:border-violet-200 transition-colors"
                >
                  <Table2 className="w-5 h-5 text-violet-600 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Table Compare</span>
                </button>
                <button
                  onClick={() => handleQuickAction('Create memory tricks and mnemonics for Periodic Table Group 1 elements (Alkali Metals)', 'memory_tricks')}
                  className="flex items-center gap-2 p-3 rounded-xl border border-gray-200 hover:bg-amber-50 hover:border-amber-200 transition-colors"
                >
                  <BookMarked className="w-5 h-5 text-amber-600 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Memory Tricks</span>
                </button>
                <button
                  onClick={() => handleQuickAction('Create a diagram summary of the Indian Parliament structure — Lok Sabha, Rajya Sabha, their composition', 'diagram_summary')}
                  className="flex items-center gap-2 p-3 rounded-xl border border-gray-200 hover:bg-rose-50 hover:border-rose-200 transition-colors"
                >
                  <BarChart3 className="w-5 h-5 text-rose-600 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Diagram Summary</span>
                </button>
              </div>

              <div className="flex flex-wrap gap-2 justify-center">
                {[
                  'Explain India\'s three-tier Panchayati Raj system',
                  'Solve: Find area of triangle with vertices (1,2), (3,4), (5,0)',
                  'Causes of the Revolt of 1857',
                  'Compare DNA and RNA in a table',
                  'CBSE Class 12 Maths — Integration important formulae',
                ].map((q) => (
                  <button
                    key={q}
                    onClick={() => handleQuickAction(q)}
                    className="px-4 py-2 text-sm rounded-full border border-gray-200 text-gray-600 hover:bg-brand-50 hover:border-brand-200 hover:text-brand-700 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm relative group ${
                    msg.role === 'user'
                      ? 'bg-brand-600 text-white rounded-br-md whitespace-pre-wrap'
                      : 'bg-gray-50 text-gray-900 rounded-bl-md border border-gray-100'
                  }`}
                >
                  {msg.role === 'assistant' ? (
                    <>
                      {containsMedicalContent(msg.content) && (
                        <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                          <div className="flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                            <p className="text-xs text-amber-700">
                              <strong>Medical/Drug Disclaimer:</strong> This content is for educational purposes only.
                              Do not use for self-medication or diagnosis. Always consult your doctor, pharmacist,
                              or qualified healthcare provider. Verify all drug information with current pharmacopoeia.
                            </p>
                          </div>
                        </div>
                      )}
                      <div className={`prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 ${MODE_FORMAT_CLASS[studyMode] || ''}`}>
                        {renderMarkdownContent(msg.content)}
                      </div>
                      <button
                        onClick={() => handleCopyMessage(msg.id, msg.content)}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-white border border-gray-200 hover:bg-gray-100 transition-all"
                        title="Copy"
                      >
                        {copiedId === msg.id
                          ? <Check className="w-3.5 h-3.5 text-green-600" />
                          : <Copy className="w-3.5 h-3.5 text-gray-500" />}
                      </button>
                    </>
                  ) : msg.content}
                </div>
              </div>
            ))}
            {isSending && (
              <div className="flex justify-start">
                <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-bl-md flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-brand-600" />
                  <span className="text-sm text-gray-500">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Input Area */}
        <div className="p-3 sm:p-4 border-t border-gray-100">
          {/* Study Mode + Answer Standard Row */}
          <div className="flex items-center gap-2 sm:gap-3 mb-2 overflow-x-auto pb-1 -mx-1 px-1">
            <div className="flex gap-1.5 flex-shrink-0">
              {STUDY_MODES.map((mode) => (
                <button
                  key={mode.value}
                  onClick={() => setStudyMode(studyMode === mode.value ? 'default' : mode.value)}
                  className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-full border whitespace-nowrap transition-colors ${
                    studyMode === mode.value
                      ? 'bg-brand-50 border-brand-200 text-brand-700'
                      : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <mode.icon className="w-3 h-3" />
                  <span className="hidden sm:inline">{mode.label}</span>
                </button>
              ))}
            </div>
            <select
              value={answerStandard}
              onChange={(e) => setAnswerStandard(e.target.value)}
              className="text-xs border border-gray-200 rounded-full px-3 py-2 bg-white text-gray-600 focus:outline-none focus:ring-1 focus:ring-brand-400 flex-shrink-0"
            >
              {ANSWER_STANDARDS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2 sm:gap-3">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder="Ask a doubt, get an explanation..."
              className="input-field flex-1"
              disabled={isSending}
            />
            <button
              onClick={() => sendMessage()}
              disabled={isSending || !input.trim()}
              className="btn-primary px-4"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
