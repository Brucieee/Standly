import React, { useState, useEffect } from 'react';
import { X, Smile, Meh, Frown, CheckCircle2, Clock, AlertCircle, Link as LinkIcon, Plus, Trash2 } from 'lucide-react';
import { Standup } from '../types';

interface StandupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { date: string; yesterday: string; today: string; blockers: string; mood: 'happy' | 'neutral' | 'stressed'; jiraLinks?: string[] }) => void;
  initialData?: Standup | null;
  initialDate?: string;
}

export const StandupModal: React.FC<StandupModalProps> = ({ isOpen, onClose, onSubmit, initialData, initialDate }) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [yesterday, setYesterday] = useState('');
  const [today, setToday] = useState('');
  const [blockers, setBlockers] = useState('');
  const [mood, setMood] = useState<'happy' | 'neutral' | 'stressed'>('happy');
  const [hasJiraUpdate, setHasJiraUpdate] = useState(false);
  const [jiraLinks, setJiraLinks] = useState<string[]>(['']);

  const MAX_WORDS = 100;
  const getWordCount = (text: string) => text.trim().split(/\s+/).filter(Boolean).length;
  const isOverLimit = getWordCount(yesterday) > MAX_WORDS || getWordCount(today) > MAX_WORDS || getWordCount(blockers) > MAX_WORDS;

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setDate(initialData.date.split('T')[0]);
        setYesterday(initialData.yesterday);
        setToday(initialData.today);
        setBlockers(initialData.blockers);
        setMood(initialData.mood);
        setJiraLinks(initialData.jiraLinks && initialData.jiraLinks.length > 0 ? initialData.jiraLinks : ['']);
        setHasJiraUpdate(!!(initialData.jiraLinks && initialData.jiraLinks.length > 0));
      } else {
        setDate(initialDate || new Date().toISOString().split('T')[0]);
        setYesterday('');
        setToday('');
        setBlockers('');
        setMood('happy');
        setJiraLinks(['']);
        setHasJiraUpdate(false);
      }
    }
  }, [isOpen, initialData, initialDate]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isOverLimit) return;
    onSubmit({ date, yesterday, today, blockers, mood, jiraLinks: hasJiraUpdate ? jiraLinks.filter(l => l.trim() !== '') : [] });
  };

  const handleLinkChange = (index: number, value: string) => {
    const newLinks = [...jiraLinks];
    newLinks[index] = value;
    setJiraLinks(newLinks);
  };

  const addLink = () => setJiraLinks([...jiraLinks, '']);
  
  const removeLink = (index: number) => {
    setJiraLinks(jiraLinks.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-slate-100 flex justify-between items-center flex-shrink-0">
          <h2 className="text-xl font-bold text-slate-900">
            {initialData ? 'Edit Standup' : 'New Daily Standup'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
        <form id="standup-form" onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Date</label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
            />
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                <CheckCircle2 size={16} className="text-green-500" />
                What did you do yesterday?
              </label>
              <textarea
                required
                value={yesterday}
                onChange={(e) => setYesterday(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all min-h-[100px]"
                placeholder="- Completed the login page&#10;- Fixed bug in navigation"
              />
              <div className={`text-xs text-right mt-1 ${getWordCount(yesterday) > MAX_WORDS ? 'text-red-500 font-medium' : 'text-slate-400'}`}>
                {getWordCount(yesterday)}/{MAX_WORDS} words
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                <Clock size={16} className="text-indigo-500" />
                What will you do today?
              </label>
              <textarea
                required
                value={today}
                onChange={(e) => setToday(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all min-h-[100px]"
                placeholder="- Start working on the dashboard&#10;- Code review for PR #123"
              />
              <div className={`text-xs text-right mt-1 ${getWordCount(today) > MAX_WORDS ? 'text-red-500 font-medium' : 'text-slate-400'}`}>
                {getWordCount(today)}/{MAX_WORDS} words
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                <AlertCircle size={16} className="text-red-500" />
                Any blockers?
              </label>
              <textarea
                value={blockers}
                onChange={(e) => setBlockers(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all min-h-[80px]"
                placeholder="Waiting for API documentation..."
              />
              <div className={`text-xs text-right mt-1 ${getWordCount(blockers) > MAX_WORDS ? 'text-red-500 font-medium' : 'text-slate-400'}`}>
                {getWordCount(blockers)}/{MAX_WORDS} words
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-bold text-slate-700">Did you update your Jira ticket?</label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setHasJiraUpdate(true)}
                className={`px-6 py-2 rounded-xl border-2 font-medium transition-all ${
                  hasJiraUpdate ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-600 hover:border-indigo-200'
                }`}
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => setHasJiraUpdate(false)}
                className={`px-6 py-2 rounded-xl border-2 font-medium transition-all ${
                  !hasJiraUpdate ? 'border-slate-400 bg-slate-100 text-slate-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                No
              </button>
            </div>
            
            {hasJiraUpdate && (
              <div className="space-y-3">
                {jiraLinks.map((link, index) => (
                  <div key={index} className="relative animate-fade-in flex gap-2">
                    <div className="relative flex-1">
                      <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input
                        type="url"
                        value={link}
                        onChange={(e) => handleLinkChange(index, e.target.value)}
                        placeholder="Paste Jira ticket link here..."
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                      />
                    </div>
                    {jiraLinks.length > 1 && (
                      <button type="button" onClick={() => removeLink(index)} className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                        <Trash2 size={20} />
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={addLink} className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 ml-1">
                  <Plus size={16} />
                  Add another link
                </button>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-3">How are you feeling?</label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setMood('happy')}
                className={`flex-1 p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                  mood === 'happy' 
                    ? 'border-green-500 bg-green-50 text-green-700' 
                    : 'border-slate-100 hover:border-green-200 hover:bg-slate-50 text-slate-500'
                }`}
              >
                <Smile size={32} className={mood === 'happy' ? 'text-green-500' : 'text-slate-400'} />
                <span className="font-medium text-sm">Happy</span>
              </button>

              <button
                type="button"
                onClick={() => setMood('neutral')}
                className={`flex-1 p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                  mood === 'neutral' 
                    ? 'border-yellow-500 bg-yellow-50 text-yellow-700' 
                    : 'border-slate-100 hover:border-yellow-200 hover:bg-slate-50 text-slate-500'
                }`}
              >
                <Meh size={32} className={mood === 'neutral' ? 'text-yellow-500' : 'text-slate-400'} />
                <span className="font-medium text-sm">Neutral</span>
              </button>

              <button
                type="button"
                onClick={() => setMood('stressed')}
                className={`flex-1 p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                  mood === 'stressed' 
                    ? 'border-red-500 bg-red-50 text-red-700' 
                    : 'border-slate-100 hover:border-red-200 hover:bg-slate-50 text-slate-500'
                }`}
              >
                <Frown size={32} className={mood === 'stressed' ? 'text-red-500' : 'text-slate-400'} />
                <span className="font-medium text-sm">Stressed</span>
              </button>
            </div>
          </div>
        </form>
        </div>

        <div className="p-6 border-t border-slate-100 flex justify-end gap-3 flex-shrink-0 bg-white rounded-b-2xl">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 text-slate-700 hover:bg-slate-50 rounded-xl font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="standup-form"
            disabled={isOverLimit}
            className={`px-6 py-2.5 rounded-xl font-semibold shadow-lg transition-all active:scale-[0.98] ${isOverLimit ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none' : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200'}`}
          >
            {initialData ? 'Save Changes' : 'Post Standup'}
          </button>
        </div>
      </div>
    </div>
  );
};