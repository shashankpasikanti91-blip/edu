'use client';

import { useState, useEffect, useCallback } from 'react';
import { Heart, Play, Pause, RotateCcw, Clock, Sun, Coffee, Droplets } from 'lucide-react';

export default function WellnessPage() {
  // Pomodoro timer
  const [timerMode, setTimerMode] = useState<'focus' | 'break'>('focus');
  const [seconds, setSeconds] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [focusCount, setFocusCount] = useState(0);

  const FOCUS_TIME = 25 * 60;
  const BREAK_TIME = 5 * 60;

  useEffect(() => {
    if (!isRunning) return;
    if (seconds <= 0) {
      if (timerMode === 'focus') {
        setFocusCount((c) => c + 1);
        setTimerMode('break');
        setSeconds(BREAK_TIME);
      } else {
        setTimerMode('focus');
        setSeconds(FOCUS_TIME);
      }
      setIsRunning(false);
      return;
    }
    const id = setInterval(() => setSeconds((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, [isRunning, seconds, timerMode]);

  const resetTimer = useCallback(() => {
    setIsRunning(false);
    setSeconds(timerMode === 'focus' ? FOCUS_TIME : BREAK_TIME);
  }, [timerMode]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const tips = [
    { icon: Sun, title: 'Take Breaks', desc: 'Study for 25 minutes, then rest for 5. Your brain consolidates information during breaks.' },
    { icon: Droplets, title: 'Stay Hydrated', desc: 'Drink water regularly. Dehydration affects concentration and memory.' },
    { icon: Coffee, title: 'Sleep Well', desc: 'Aim for 7-8 hours of sleep. Sleep is essential for memory consolidation.' },
    { icon: Heart, title: 'Move Your Body', desc: 'Light exercise between study sessions improves blood flow and focus.' },
  ];

  return (
    <div className="max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Wellness</h1>
        <p className="text-gray-500 mt-1">Take care of yourself while studying</p>
      </div>

      {/* Pomodoro Timer */}
      <div className="card mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Pomodoro Timer</h2>
        <div className="flex flex-col items-center">
          {/* Mode Toggle */}
          <div className="inline-flex bg-gray-100 rounded-xl p-1 mb-6">
            <button
              onClick={() => { setTimerMode('focus'); setSeconds(FOCUS_TIME); setIsRunning(false); }}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
                timerMode === 'focus' ? 'bg-brand-600 text-white' : 'text-gray-500'
              }`}
            >
              Focus
            </button>
            <button
              onClick={() => { setTimerMode('break'); setSeconds(BREAK_TIME); setIsRunning(false); }}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
                timerMode === 'break' ? 'bg-green-600 text-white' : 'text-gray-500'
              }`}
            >
              Break
            </button>
          </div>

          {/* Timer Display */}
          <div className={`w-48 h-48 rounded-full flex items-center justify-center mb-6 ${
            timerMode === 'focus' ? 'bg-brand-50' : 'bg-green-50'
          }`}>
            <span className={`text-5xl font-mono font-bold ${
              timerMode === 'focus' ? 'text-brand-600' : 'text-green-600'
            }`}>
              {formatTime(seconds)}
            </span>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className={`w-14 h-14 rounded-full flex items-center justify-center text-white transition-colors ${
                timerMode === 'focus'
                  ? 'bg-brand-600 hover:bg-brand-700'
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {isRunning ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
            </button>
            <button
              onClick={resetTimer}
              className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50"
            >
              <RotateCcw className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          {/* Session Count */}
          <p className="text-sm text-gray-500 mt-4 flex items-center gap-1">
            <Clock className="w-4 h-4" /> {focusCount} focus sessions completed
          </p>
        </div>
      </div>

      {/* Wellness Tips */}
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Study Wellness Tips</h2>
      <div className="grid md:grid-cols-2 gap-4">
        {tips.map((tip) => (
          <div key={tip.title} className="card">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-brand-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <tip.icon className="w-5 h-5 text-brand-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">{tip.title}</h3>
                <p className="text-sm text-gray-500 mt-1">{tip.desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
