import React, { useState, useEffect } from 'react';
import { X, Trash2, Sun, Moon, Calendar } from 'lucide-react';
import { Leave } from '../types';

interface LeaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  initialData?: Leave | null;
  initialDate?: Date;
  onDelete?: () => void;
}

export const LeaveModal: React.FC<LeaveModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  initialDate,
  onDelete,
}) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [type, setType] = useState<Leave['type']>('vacation');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [duration, setDuration] = useState<'full' | 'morning' | 'afternoon'>('full');

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setStartDate(initialData.startDate);
        setEndDate(initialData.endDate);
        setStartTime((initialData as any).startTime || '');
        setEndTime((initialData as any).endTime || '');
        setType(initialData.type);
        setReason(initialData.reason);
        
        const sTime = (initialData as any).startTime;
        if (sTime && (sTime.startsWith('08:00') || sTime.startsWith('8:00'))) {
          setDuration('morning');
        } else if (sTime && (sTime.startsWith('13:00') || sTime.startsWith('13:00'))) {
          setDuration('afternoon');
        } else {
          setDuration('full');
        }
      } else {
        const defaultDate = initialDate 
          ? new Date(initialDate.getTime() - (initialDate.getTimezoneOffset() * 60000)).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0];
          
        setStartDate(defaultDate);
        setEndDate(defaultDate);
        setStartTime('');
        setEndTime('');
        setType('vacation');
        setReason('');
        setDuration('full');
      }
    }
  }, [isOpen, initialData, initialDate]);

  useEffect(() => {
    if (duration === 'morning') {
      setStartTime('08:00');
      setEndTime('12:00');
    } else if (duration === 'afternoon') {
      setStartTime('13:00');
      setEndTime('17:00');
    } else {
      setStartTime('');
      setEndTime('');
    }
  }, [duration]);

  // Auto-calculate end date for Wellness leave (5 business days)
  useEffect(() => {
    if (type === 'wellness' && startDate) {
      const start = new Date(startDate);
      let count = 0;
      let current = new Date(start);
      
      // Add 4 more days (total 5 days) skipping weekends
      while (count < 4) {
        current.setDate(current.getDate() + 1);
        const day = current.getDay();
        if (day !== 0 && day !== 6) { // 0 is Sunday, 6 is Saturday
          count++;
        }
      }
      setEndDate(current.toISOString().split('T')[0]);
    }
  }, [startDate, type]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit({ 
        startDate, 
        endDate, 
        startTime: startTime || null, 
        endTime: endTime || null, 
        type, 
        reason 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-slate-200 rounded-3xl shadow-neo border-none w-full max-w-lg" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-slate-300/30 flex justify-between items-center bg-transparent">
          <h2 className="text-xl font-bold text-slate-900">{initialData ? 'Edit Leave' : 'New Leave Request'}</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800 transition-colors"><X size={24} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Duration Selection */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Duration</label>
            <div className="grid grid-cols-3 gap-4">
              <button
                type="button"
                onClick={() => setDuration('full')}
                className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all ${duration === 'full' ? 'bg-indigo-50 text-indigo-700 shadow-neo-inner border border-indigo-200' : 'bg-slate-200 shadow-neo hover:shadow-neo-inner text-slate-600 border border-transparent'}`}
              >
                <Calendar size={20} />
                <span className="text-xs font-bold">Full Day</span>
              </button>
              <button
                type="button"
                onClick={() => setDuration('morning')}
                className={`p-4 rounded-2xl flex flex-col items-center gap-2 transition-all ${duration === 'morning' ? 'bg-amber-50 text-amber-700 shadow-neo-inner border border-amber-200' : 'bg-slate-200 shadow-neo hover:shadow-neo-inner text-slate-600 border border-transparent'}`}
              >
                <Sun size={20} />
                <span className="text-xs font-bold">Morning</span>
                <span className="text-[10px] opacity-75 font-medium">8AM - 12PM</span>
              </button>
              <button
                type="button"
                onClick={() => setDuration('afternoon')}
                className={`p-4 rounded-2xl flex flex-col items-center gap-2 transition-all ${duration === 'afternoon' ? 'bg-blue-50 text-blue-700 shadow-neo-inner border border-blue-200' : 'bg-slate-200 shadow-neo hover:shadow-neo-inner text-slate-600 border border-transparent'}`}
              >
                <Moon size={20} />
                <span className="text-xs font-bold">Afternoon</span>
                <span className="text-[10px] opacity-75 font-medium">1PM - 5PM</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Start Date</label>
              <input type="date" required value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full px-4 py-3 bg-slate-200 border-none rounded-xl shadow-neo-sm-inner focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:shadow-neo transition-all text-slate-700 font-medium" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">End Date</label>
              <input type="date" required value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full px-4 py-3 bg-slate-200 border-none rounded-xl shadow-neo-sm-inner focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:shadow-neo transition-all text-slate-700 font-medium" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Type</label>
            <select value={type} onChange={e => setType(e.target.value as any)} className="w-full px-4 py-3 bg-slate-200 border-none rounded-xl shadow-neo-sm-inner focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:shadow-neo transition-all text-slate-700 font-medium appearance-none">
              <option value="vacation">🏖️ Vacation Leave</option>
              <option value="sick">🤒 Sick Leave</option>
              <option value="personal">🏠 Personal Leave</option>
              <option value="wellness">🧘 Wellness Leave</option>
              <option value="birthday">🎂 Birthday Leave</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Reason (Optional)</label>
            <textarea value={reason} onChange={e => setReason(e.target.value)} className="w-full px-4 py-3 bg-slate-200 border-none rounded-xl shadow-neo-sm-inner focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:shadow-neo transition-all text-slate-700 min-h-[100px] resize-y font-medium" placeholder="Briefly describe your leave..." />
          </div>

          <div className="flex items-center justify-between pt-6 border-t border-slate-300/30">
            {initialData && onDelete ? (
              <button type="button" onClick={onDelete} className="flex items-center gap-2 px-6 py-3 text-red-600 bg-slate-200 shadow-neo hover:shadow-neo-inner rounded-xl font-bold transition-all">
                <Trash2 size={20} /> <span className="hidden sm:inline">Delete Leave</span>
              </button>
            ) : <div></div>}
            
            <div className="flex gap-4 w-full sm:w-auto mt-4 sm:mt-0">
              <button type="button" onClick={onClose} className="flex-1 sm:flex-none px-6 py-3 text-slate-600 shadow-neo hover:shadow-neo-inner bg-slate-200 rounded-xl font-bold transition-all">Cancel</button>
              <button type="submit" disabled={isSubmitting} className="flex-1 sm:flex-none px-8 py-3 text-white font-bold rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 shadow-[4px_4px_10px_rgba(79,70,229,0.3),-4px_-4px_10px_rgba(255,255,255,0.8)] active:shadow-[inset_4px_4px_10px_rgba(0,0,0,0.1),inset_-4px_-4px_10px_rgba(255,255,255,0.2)] hover:from-indigo-600 hover:to-indigo-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                {isSubmitting ? 'Saving...' : initialData ? 'Update' : 'Post Leave'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};