import React, { useState, useEffect } from 'react';
import { X, Trash2, Calendar, Link as LinkIcon, Plus } from 'lucide-react';
import { Standup } from '../types';

interface StandupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    date: string;
    yesterday: string;
    today: string;
    blockers: string;
    mood: 'happy' | 'neutral' | 'stressed';
    jiraLinks?: string[];
  }) => Promise<void>;
  initialData?: Standup | null;
  initialDate: string;
  onDelete?: () => void;
  previousStandup?: Standup;
}

export const StandupModal: React.FC<StandupModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  initialDate,
  onDelete,
  previousStandup,
}) => {
  const [date, setDate] = useState(initialDate);
  const [yesterday, setYesterday] = useState('');
  const [today, setToday] = useState('');
  const [blockers, setBlockers] = useState('');
  const [mood, setMood] = useState<'happy' | 'neutral' | 'stressed'>('happy');
  const [jiraLinks, setJiraLinks] = useState<string[]>(['']);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setDate(initialData.date.split('T')[0]);
        setYesterday(initialData.yesterday);
        setToday(initialData.today);
        setBlockers(initialData.blockers);
        setJiraLinks(initialData.jiraLinks && initialData.jiraLinks.length > 0 ? initialData.jiraLinks : ['']);
        setMood(initialData.mood);
      } else {
        setDate(initialDate);
        setYesterday('');
        setToday('');
        setBlockers('');
        setJiraLinks(['']);
        setMood('happy');
      }
    }
  }, [isOpen, initialData, initialDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const validLinks = jiraLinks.map(l => l.trim()).filter(l => l.length > 0);
      await onSubmit({ date, yesterday, today, blockers, mood, jiraLinks: validLinks });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLinkChange = (index: number, value: string) => {
    const newLinks = [...jiraLinks];
    newLinks[index] = value;
    setJiraLinks(newLinks);
  };

  const addLinkField = () => {
    setJiraLinks([...jiraLinks, '']);
  };

  const removeLinkField = (index: number) => {
    const newLinks = jiraLinks.filter((_, i) => i !== index);
    setJiraLinks(newLinks.length ? newLinks : ['']);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-4 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold text-slate-900">

            {initialData ? 'Edit Standup' : 'New Standup'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1"><Calendar size={12} className="inline"/>Date</label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Yesterday</label>
            <textarea
              required
              value={yesterday}
              onChange={(e) => setYesterday(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all min-h-[80px]"
              placeholder={previousStandup?.today || "What did you work on yesterday?"}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Today</label>
            <textarea
              required
              value={today}
              onChange={(e) => setToday(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all min-h-[80px]"
              placeholder="What will you work on today?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Blockers</label>
            <textarea
              value={blockers}
              onChange={(e) => setBlockers(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all min-h-[60px]"
              placeholder={previousStandup?.blockers || "Any blockers? (Optional)"}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
              <LinkIcon size={12} className="inline"/> Jira Tickets (Optional)
            </label>
            <div className="space-y-2">
              {jiraLinks.map((link, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={link}
                    onChange={(e) => handleLinkChange(index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                    placeholder="Paste Jira link here..."
                  />
                  {jiraLinks.length > 1 && (
                    <button type="button" onClick={() => removeLinkField(index)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              ))}
              <button type="button" onClick={addLinkField} className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1 px-1">
                <Plus size={16} /> Add another ticket
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Mood</label>
            <div className="flex gap-4">
              {[
                { value: 'happy', emoji: '😄', label: 'Happy' },
                { value: 'neutral', emoji: '😐', label: 'Neutral' },
                { value: 'stressed', emoji: '😫', label: 'Stressed' },
              ].map((m) => (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => setMood(m.value as any)}
                  className={`flex-1 p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                    mood === m.value
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-slate-100 hover:border-slate-200 text-slate-600'
                  }`}
                >
                  <span className="text-2xl">{m.emoji}</span>
                  <span className="text-sm font-medium">{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            {initialData && onDelete ? (
              <button
                type="button"
                onClick={onDelete}
                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 size={20} />
                <span>Delete Standup</span>
              </button>
            ) : (
              <div></div> 
            )}
            
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Saving...' : initialData ? 'Save Changes' : 'Post Standup'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );


};