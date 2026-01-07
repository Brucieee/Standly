import React, { useState, useEffect } from 'react';
import { X, Calendar, Flag, Link as LinkIcon } from 'lucide-react';
import { Deadline } from '../types';

interface DeadlineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Deadline, 'id' | 'creatorId'>) => void;
  initialData?: Deadline | null;
}

export const DeadlineModal: React.FC<DeadlineModalProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [releaseLink, setReleaseLink] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setTitle(initialData.title);
        setDate(initialData.dueDate ? new Date(initialData.dueDate).toISOString().split('T')[0] : '');
        setReleaseLink(initialData.releaseLink || '');
        setDescription(initialData.description || '');
      } else {
        setTitle('');
        setDate('');
        setReleaseLink('');
        setDescription('');
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!date) {
      return;
    }

    try {
      // Default to end of day for the selected date
      const dueDate = new Date(date).toISOString();
      
      onSubmit({
        title,
        description: description || undefined,
        dueDate,
        releaseLink: releaseLink || undefined,
      });
    } catch (error) {
      console.error('Invalid date:', error);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] flex flex-col animate-fade-in-up"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 flex-shrink-0">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Flag className="text-red-500" size={20} />
            {initialData ? 'Edit Deadline' : 'Add Deadline'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
        <form id="deadline-form" onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Title
            </label>
            <input 
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Q3 Release"
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all text-slate-900"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Due Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
              <input 
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                onClick={(e) => {
                  try { if(e.currentTarget.showPicker) e.currentTarget.showPicker(); } catch(err) {}
                }}
                className="w-full pl-10 pr-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all text-slate-900 cursor-pointer"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Release Link
            </label>
            <div className="relative">
              <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
              <input 
                type="url"
                value={releaseLink}
                onChange={(e) => setReleaseLink(e.target.value)}
                placeholder="https://..."
                className="w-full pl-10 pr-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Additional details..."
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all resize-none h-20 text-slate-900"
            />
          </div>
        </form>
        </div>
        <div className="p-6 border-t border-slate-100 flex-shrink-0 bg-white rounded-b-2xl">
          <button
            type="submit"
            form="deadline-form"
            className="w-full bg-red-600 text-white py-2.5 rounded-lg font-semibold hover:bg-red-700 active:scale-[0.98] transition-all shadow-md shadow-red-200"
          >
            {initialData ? 'Save Changes' : 'Set Deadline'}
          </button>
        </div>
      </div>
    </div>
  );
};