import React, { useState, useEffect } from 'react';
import { X, Trash2, Calendar, Link as LinkIcon, Plus, Info } from 'lucide-react';
import { Standup, User } from '../types';

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
  userStandups: Standup[];
  users: User[];
}

export const StandupModal: React.FC<StandupModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  initialDate,
  onDelete,
  userStandups,
  users,
}) => {
  const [date, setDate] = useState(initialDate);
  const [yesterday, setYesterday] = useState('');
  const [today, setToday] = useState('');
  const [blockers, setBlockers] = useState('');
  const [mood, setMood] = useState<'happy' | 'neutral' | 'stressed'>('happy');
  const [jiraLinks, setJiraLinks] = useState<string[]>(['']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  type SuggestionItem = import('../types').User | { name: string; isEveryone: boolean; id: string; role: string; avatar: string };

  const filteredUsers: SuggestionItem[] = mentionQuery !== null && users
    ? [
      ...(users
        .filter(u => u.name.toLowerCase().includes(mentionQuery.toLowerCase()))
        .map(u => ({ ...u, isEveryone: false }))),
      ...('everyone'.includes(mentionQuery.toLowerCase()) ? [{ name: 'everyone', isEveryone: true, id: 'everyone', role: 'Notify all users', avatar: '' }] : [])
    ]
    : [];

  useEffect(() => {
    setHighlightedIndex(0);
  }, [mentionQuery]);

  // Calculate previous standup dynamically based on selected date
  const previousStandup = React.useMemo(() => {
    // Target date string YYYY-MM-DD
    const targetDateStr = date;

    // Sort descending
    const sorted = [...userStandups].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Find first one strictly before current date
    return sorted.find(s => {
      // Normalize standup date to YYYY-MM-DD for comparison
      // This handles cases where s.date is ISO with time (e.g. 2025-01-08T10:00:00Z)
      const sDateStr = s.date.split('T')[0];
      return sDateStr < targetDateStr;
    });
  }, [date, userStandups]);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setDate(initialData.date.split('T')[0]);
        setYesterday(initialData.yesterday);
        setToday(initialData.today);
        setBlockers(initialData.blockers);
        // Use a copy of the array to be safe
        const links = initialData.jiraLinks;
        if (links && links.length > 0) {
          setJiraLinks([...links]);
        } else {
          setJiraLinks(['']);
        }
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

  const yesterdayPlaceholder = previousStandup?.today || "What did you work on yesterday?";
  const blockersPlaceholder = previousStandup?.blockers || "Any blockers? (Optional)";

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>, setValue: (val: string) => void, placeholder: string) => {
    // Mentions dropdown navigation
    if (mentionQuery !== null && filteredUsers.length > 0 && setValue === setBlockers) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlightedIndex(prev => (prev + 1) % filteredUsers.length);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlightedIndex(prev => (prev - 1 + filteredUsers.length) % filteredUsers.length);
        return;
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSelectUser(filteredUsers[highlightedIndex]);
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        setMentionQuery(null);
        return;
      }
    }

    if (e.key === 'Tab' && !e.shiftKey && e.currentTarget.value === '' && placeholder) {
      e.preventDefault();
      setValue(placeholder);
    }
  };

  const handleBlockersChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setBlockers(value);

    // Check for mention trigger
    const cursorPosition = e.target.selectionStart || 0;
    const textBeforeCursor = value.slice(0, cursorPosition);
    const lastWord = textBeforeCursor.split(' ').pop();

    if (lastWord && lastWord.startsWith('@')) {
      setMentionQuery(lastWord.slice(1));
    } else {
      setMentionQuery(null);
    }
  };

  const handleSelectUser = (user: SuggestionItem) => {
    if (mentionQuery === null) return;

    // Replace the last @partial with @Name
    const nameToInsert = 'isEveryone' in user && user.isEveryone ? 'everyone' : user.name.split(' ')[0];

    const lastIndex = blockers.lastIndexOf(`@${mentionQuery}`);
    if (lastIndex !== -1) {
      const prefix = blockers.substring(0, lastIndex);
      const suffix = blockers.substring(lastIndex + mentionQuery.length + 1);
      const newValue = `${prefix}@${nameToInsert} ${suffix}`;
      setBlockers(newValue);
      setMentionQuery(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-slate-200 rounded-3xl shadow-neo border-none w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="px-5 py-4 border-none flex justify-between items-center sticky top-0 bg-transparent z-10">
          <h2 className="text-xl font-bold text-slate-800">

            {initialData ? 'Edit Standup' : 'New Standup'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 pb-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1"><Calendar size={12} className="inline" />Date</label>
              <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-3 bg-slate-200 border-none rounded-xl shadow-neo-sm-inner focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:shadow-neo transition-all text-slate-700"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
                Yesterday
                {previousStandup?.today && (
                  <div className="group relative flex items-center">
                    <Info size={14} className="text-slate-400 hover:text-indigo-500 cursor-help" />
                    <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 w-48 p-2 bg-slate-800 text-white text-xs rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none">
                      Press Tab to autofill from previous standup
                    </div>
                  </div>
                )}
              </label>
              <textarea
                required
                value={yesterday}
                onChange={(e) => setYesterday(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, setYesterday, yesterdayPlaceholder)}
                className="w-full px-4 py-3 bg-slate-200 border-none rounded-xl shadow-neo-sm-inner focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:shadow-neo transition-all min-h-[80px] text-slate-700 resize-none"
                placeholder={yesterdayPlaceholder}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Today</label>
              <textarea
                required
                value={today}
                onChange={(e) => setToday(e.target.value)}
                className="w-full px-4 py-3 bg-slate-200 border-none rounded-xl shadow-neo-sm-inner focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:shadow-neo transition-all min-h-[80px] text-slate-700 resize-none"
                placeholder="What will you work on today?"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
              Blockers
              {previousStandup?.blockers && (
                <div className="group relative flex items-center">
                  <Info size={14} className="text-slate-400 hover:text-indigo-500 cursor-help" />
                  <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 w-48 p-2 bg-slate-800 text-white text-xs rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none">
                    Press Tab to autofill from previous standup
                  </div>
                </div>
              )}
            </label>
            <div className="relative">
              <textarea
                value={blockers}
                onChange={handleBlockersChange}
                onKeyDown={(e) => handleKeyDown(e, setBlockers, blockersPlaceholder)}
                className="w-full px-4 py-3 bg-slate-200 border-none rounded-xl shadow-neo-sm-inner focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:shadow-neo transition-all min-h-[60px] text-slate-700 resize-none"
                placeholder={blockersPlaceholder}
              />
              {/* Mention Suggestions */}
              {mentionQuery !== null && filteredUsers.length > 0 && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-slate-200 rounded-2xl shadow-neo border-none overflow-hidden z-[60] animate-fade-in-up">
                  <div className="max-h-48 overflow-y-auto">
                    {filteredUsers.map((user, index) => (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => handleSelectUser(user)}
                        className={`w-full flex items-center gap-3 p-3 transition-colors text-left ${index === highlightedIndex ? 'bg-indigo-50/50' : 'hover:bg-slate-100/50'}`}
                      >
                        {'isEveryone' in user && user.isEveryone ? (
                          <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 shadow-neo-sm">
                            <span className="font-bold text-xs">ALL</span>
                          </div>
                        ) : (
                          <img
                            src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}`}
                            alt={user.name}
                            className="w-8 h-8 rounded-full bg-slate-100 object-cover shadow-neo-sm"
                            onError={(e) => {
                              e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`;
                            }}
                          />
                        )}
                        <div>
                          <p className="text-sm font-bold text-slate-900">{'isEveryone' in user && user.isEveryone ? '@everyone' : user.name}</p>
                          <p className="text-xs text-slate-500">{user.role}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
              <LinkIcon size={12} className="inline" /> Jira Tickets (Optional)
            </label>
            <div className="space-y-2">
              {jiraLinks.map((link, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={link}
                    onChange={(e) => handleLinkChange(index, e.target.value)}
                    className="flex-1 px-4 py-3 bg-slate-200 border-none rounded-xl shadow-neo-sm-inner focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:shadow-neo transition-all text-slate-700"
                    placeholder="Paste Jira link here..."
                  />
                  {jiraLinks.length > 1 && (
                    <button type="button" onClick={() => removeLinkField(index)} className="p-3 text-slate-400 hover:text-red-500 hover:shadow-neo-sm-inner rounded-xl transition-all shadow-neo-sm bg-slate-200">
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              ))}
              <button type="button" onClick={addLinkField} className="text-sm text-indigo-500 hover:text-indigo-600 font-bold flex items-center gap-1 px-2 py-1.5 rounded-lg hover:shadow-neo-sm-inner transition-all">
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
                  className={`flex-1 p-3 rounded-2xl border-none transition-all flex flex-col items-center gap-2 ${mood === m.value
                    ? 'shadow-neo-inner text-indigo-600 bg-slate-200'
                    : 'shadow-neo hover:shadow-neo-inner text-slate-500 bg-slate-200'
                    }`}
                >
                  <span className="text-2xl">{m.emoji}</span>
                  <span className="text-sm font-medium">{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-6 border-none mt-2">
            {initialData && onDelete ? (
              <button
                type="button"
                onClick={onDelete}
                className="flex items-center gap-2 px-4 py-2.5 font-bold text-red-500 bg-slate-200 rounded-xl shadow-neo hover:shadow-neo-inner transition-all border-none active:scale-[0.98]"
              >
                <Trash2 size={20} />
                <span>Delete Standup</span>
              </button>
            ) : (
              <div></div>
            )}

            <div className="flex gap-4">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 font-bold text-slate-500 bg-slate-200 rounded-xl shadow-neo hover:shadow-neo-inner transition-all border-none active:scale-[0.98]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3 bg-gradient-to-r from-orange-400 to-red-500 text-white font-bold rounded-xl active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[4px_4px_10px_rgba(239,68,68,0.3),-4px_-4px_10px_rgba(255,255,255,0.8)] border-none active:shadow-[inset_4px_4px_10px_rgba(0,0,0,0.1),inset_-4px_-4px_10px_rgba(255,255,255,0.2)]"
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