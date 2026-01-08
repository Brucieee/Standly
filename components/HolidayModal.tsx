import React, { useState } from 'react';
import { X } from 'lucide-react';

interface HolidayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (date: string, name: string) => Promise<void>;
}

export const HolidayModal: React.FC<HolidayModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [date, setDate] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !name) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit(date, name);
      setDate('');
      setName('');
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-900">Add Holiday</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
            <input type="date" required value={date} onChange={e => setDate(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Holiday Name</label>
            <input type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Christmas Day" className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="flex-1 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">
              {isSubmitting ? 'Adding...' : 'Add Holiday'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};