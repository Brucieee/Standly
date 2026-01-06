import React, { useState, useEffect } from 'react';
import { X, Calendar } from 'lucide-react';
import { Standup } from '../types';

interface StandupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { date: string; yesterday: string; today: string; blockers: string; mood: 'happy' | 'neutral' | 'stressed' }) => void;
  initialData?: Standup | null;
  initialDate?: string;
}

export const StandupModal: React.FC<StandupModalProps> = ({ isOpen, onClose, onSubmit, initialData, initialDate }) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [yesterday, setYesterday] = useState('');
  const [today, setToday] = useState('');
  const [blockers, setBlockers] = useState('');
  const [mood, setMood] = useState<'happy' | 'neutral' | 'stressed'>('happy');

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setDate(new Date(initialData.date).toISOString().split('T')[0]);
        setYesterday(initialData.yesterday);
        setToday(initialData.today);
        setBlockers(initialData.blockers);
        setMood(initialData.mood);
      } else {
        setDate(initialDate || new Date().toISOString().split('T')[0]);
        setYesterday('');
        setToday('');
        setBlockers('');
        setMood('happy');
      }
    }
  }, [isOpen, initialData, initialDate]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedDate = new Date(date);
    const isoDate = new Date(selectedDate.setHours(new Date().getHours(), new Date().getMinutes())).toISOString();

    onSubmit({ date: isoDate, yesterday, today, blockers, mood });
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-fade-in-up flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 flex-shrink-0">
          <h2 className="text-xl font-bold text-slate-800">{initialData ? 'Edit Standup' : 'New Daily Standup'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto custom-scrollbar">
          
          {/* Date Selection */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
              <input 
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                onClick={(e) => {
                  try {
                    if (e.currentTarget.showPicker) e.currentTarget.showPicker();
                  } catch (err) {
                    // Fallback or ignore if not supported/allowed
                  }
                }}
                className="w-full pl-10 pr-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-slate-900 placeholder:text-slate-400 cursor-pointer"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              What did you do yesterday?
            </label>
            <textarea
              required
              value={yesterday}
              onChange={(e) => setYesterday(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none h-24 text-slate-900 placeholder:text-slate-400"
              placeholder="- Finished the login page..."
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-semibold text-slate-700">
                What will you do today?
              </label>
            </div>
            <textarea
              required
              value={today}
              onChange={(e) => setToday(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none h-24 text-slate-900 placeholder:text-slate-400"
              placeholder="- Start working on the API..."
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Any blockers?
            </label>
            <textarea
              value={blockers}
              onChange={(e) => setBlockers(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all resize-none h-24 text-slate-900 placeholder:text-slate-400"
              placeholder="Waiting for design assets..."
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              How are you feeling?
            </label>
            <div className="flex space-x-4">
              {[
                { val: 'happy', label: '😄 Good' },
                { val: 'neutral', label: '😐 Okay' },
                { val: 'stressed', label: '😫 Stressed' }
              ].map((m) => (
                <button
                  key={m.val}
                  type="button"
                  onClick={() => setMood(m.val as any)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all ${
                    mood === m.val
                      ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 flex-shrink-0">
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-semibold hover:bg-indigo-700 active:transform active:scale-[0.98] transition-all shadow-sm shadow-indigo-200"
            >
              {initialData ? 'Update Standup' : 'Post Standup'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};