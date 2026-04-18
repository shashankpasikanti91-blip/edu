'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import {
  Send, Plus, Trash2, Loader2, Brain, Sparkles,
  BookOpen, GraduationCap, FileQuestion, Languages,
  Globe, ClipboardList, Lightbulb, Table2, Lightbulb as LightbulbIcon,
  BarChart3, ListChecks,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import type { AiChat, AiChatMessage } from '@/types';
import { renderMarkdownContent } from '@/lib/mathRenderer';

const ANSWER_MODES = [
  { value: '', label: 'Default', icon: Sparkles },
  { value: 'table_compare', label: 'Table Compare', icon: Table2 },
  { value: 'memory_trick', label: 'Memory Tricks', icon: LightbulbIcon },
  { value: 'exam_answer', label: 'Exam Answer', icon: ListChecks },
  { value: 'diagram_summary', label: 'Diagram Summary', icon: BarChart3 },
];

export default function AiAssistantPage() {
  const { user } = useAuthStore();
  const [chats, setChats] = useState<AiChat[]>([]);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [messages, setMessages] = useState<AiChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoadingChats, setIsLoadingChats] = useState(true);
  const [answerMode, setAnswerMode] = useState('');
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

    // Build message with answer mode prefix if selected
    let fullMessage = messageText;
    if (answerMode) {
      const modeLabel = ANSWER_MODES.find(m => m.value === answerMode)?.label || '';
      fullMessage = `[Format: ${modeLabel}] ${messageText}`;
    }

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
        message: fullMessage,
        educationLevel: educationContext.level,
        grade: educationContext.grade,
      });

      setMessages((prev) => [...prev, data.data]);
      // Refresh chat list for updated titles
      fetchChats();
    } catch {
      toast.error('AI is temporarily unavailable. Please try again.');
      setMessages((prev) => prev.filter((m) => m.id !== userMessage.id));
      setInput(messageText);
    } finally {
      setIsSending(false);
    }
  }, [input, isSending, activeChat, answerMode, educationContext]);

  // Quick action handler: sets input AND sends immediately
  const handleQuickAction = (prompt: string) => {
    setInput(prompt);
    sendMessage(prompt);
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] gap-6 -m-8">
      {/* Chat List Sidebar */}
      <div className="w-72 bg-white rounded-2xl border border-gray-100 flex flex-col">
        <div className="p-4 border-b border-gray-100">
          <button
            onClick={createChat}
            className="btn-primary w-full flex items-center justify-center gap-2"
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
                className={`group flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-colors ${
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
      <div className="flex-1 bg-white rounded-2xl border border-gray-100 flex flex-col">
        {!activeChat && messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-2xl mx-auto px-4">
              <div className="w-16 h-16 bg-brand-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-brand-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">AI Study Assistant</h2>
              <p className="text-gray-500 max-w-md mx-auto mb-6">
                Ask me anything about your studies — concepts, doubts, exam tips, revision help, or career guidance.
              </p>

              {/* Quick Study Tools */}
              <div className="grid grid-cols-2 gap-3 max-w-lg mx-auto text-left">
                <button
                  onClick={() => handleQuickAction('Generate 10 MCQ questions for Class 10 Social Science - World War 2 with answers and explanations')}
                  className="flex items-center gap-2 p-3 rounded-xl border border-gray-200 hover:bg-brand-50 hover:border-brand-200 transition-colors"
                >
                  <FileQuestion className="w-5 h-5 text-brand-600 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Generate Q&amp;A</span>
                </button>
                <button
                  onClick={() => handleQuickAction('Explain Integration by Parts with step-by-step examples for B.Tech Maths 1')}
                  className="flex items-center gap-2 p-3 rounded-xl border border-gray-200 hover:bg-green-50 hover:border-green-200 transition-colors"
                >
                  <Lightbulb className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Explain Topic</span>
                </button>
                <button
                  onClick={() => handleQuickAction('Generate IELTS Writing Task 2 essay practice on technology and education with model answer')}
                  className="flex items-center gap-2 p-3 rounded-xl border border-gray-200 hover:bg-amber-50 hover:border-amber-200 transition-colors"
                >
                  <GraduationCap className="w-5 h-5 text-amber-600 flex-shrink-0" />
                  <span className="text-sm text-gray-700">IELTS Practice</span>
                </button>
                <button
                  onClick={() => handleQuickAction('Give me 10 current affairs questions for UPSC preparation with answers')}
                  className="flex items-center gap-2 p-3 rounded-xl border border-gray-200 hover:bg-purple-50 hover:border-purple-200 transition-colors"
                >
                  <Globe className="w-5 h-5 text-purple-600 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Current Affairs</span>
                </button>
              </div>

              <div className="flex flex-wrap gap-2 justify-center mt-4">
                {[
                  'Solve: ∫ x·e^x dx step by step',
                  'Explain Newton\'s Laws with examples',
                  'Causes and effects of World War 2',
                  'JEE Main 2025 preparation strategy',
                  'Class 10 CBSE Chemistry important questions',
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
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm ${
                    msg.role === 'user'
                      ? 'bg-brand-600 text-white rounded-br-md whitespace-pre-wrap'
                      : 'bg-gray-50 text-gray-900 rounded-bl-md border border-gray-100'
                  }`}
                >
                  {msg.role === 'assistant' ? (
                    <div className={`prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 ${
                      answerMode === 'table_compare' ? 'ai-format-table' :
                      answerMode === 'memory_trick' ? 'ai-format-memory' :
                      answerMode === 'exam_answer' ? 'ai-format-exam' :
                      answerMode === 'diagram_summary' ? 'ai-format-diagram' : ''
                    }`}>
                      {renderMarkdownContent(msg.content)}
                    </div>
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
        <div className="p-4 border-t border-gray-100">
          {/* Answer Mode Selector */}
          <div className="flex gap-1.5 mb-2 overflow-x-auto pb-1">
            {ANSWER_MODES.map((mode) => (
              <button
                key={mode.value}
                onClick={() => setAnswerMode(answerMode === mode.value ? '' : mode.value)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full border whitespace-nowrap transition-colors ${
                  answerMode === mode.value
                    ? 'bg-brand-50 border-brand-200 text-brand-700'
                    : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                }`}
              >
                <mode.icon className="w-3 h-3" />
                {mode.label}
              </button>
            ))}
          </div>
          <div className="flex gap-3">
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
