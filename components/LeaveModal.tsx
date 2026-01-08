import React, { useState, useEffect } from 'react';
import { X, Trash2, Sun, Moon, Calendar } from 'lucide-react';
import { Leave } from '../types';

interface LeaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  initialData?: Leave | null;
  onDelete?: () => void;
}

export const LeaveModal: React.FC<LeaveModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
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
        setStartDate(new Date().toISOString().split('T')[0]);
        setEndDate(new Date().toISOString().split('T')[0]);
        setStartTime('');
        setEndTime('');
        setType('vacation');
        setReason('');
        setDuration('full');
      }
    }
  }, [isOpen, initialData]);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-900">{initialData ? 'Edit Leave' : 'New Leave Request'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Duration Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Duration</label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setDuration('full')}
                className={`p-3 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${duration === 'full' ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-100 hover:border-slate-200 text-slate-600'}`}
              >
                <Calendar size={20} />
                <span className="text-xs font-bold">Full Day</span>
              </button>
              <button
                type="button"
                onClick={() => setDuration('morning')}
                className={`p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${duration === 'morning' ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-slate-100 hover:border-slate-200 text-slate-600'}`}
              >
                <Sun size={20} />
                <span className="text-xs font-bold">Morning</span>
                <span className="text-[10px] opacity-75">8AM - 12PM</span>
              </button>
              <button
                type="button"
                onClick={() => setDuration('afternoon')}
                className={`p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${duration === 'afternoon' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-100 hover:border-slate-200 text-slate-600'}`}
              >
                <Moon size={20} />
                <span className="text-xs font-bold">Afternoon</span>
                <span className="text-[10px] opacity-75">1PM - 5PM</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
              <input type="date" required value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
              <input type="date" required value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
            <select value={type} onChange={e => setType(e.target.value as any)} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none">
              <option value="vacation">🏖️ Vacation Leave</option>
              <option value="sick">🤒 Sick Leave</option>
              <option value="personal">🏠 Personal Leave</option>
              <option value="wellness">🧘 Wellness Leave</option>
              <option value="birthday">🎂 Birthday Leave</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Reason (Optional)</label>
            <textarea value={reason} onChange={e => setReason(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none min-h-[80px]" placeholder="Briefly describe your leave..." />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            {initialData && onDelete ? (
              <button type="button" onClick={onDelete} className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                <Trash2 size={20} /> <span>Delete Leave</span>
              </button>
            ) : <div></div>}
            
            <div className="flex gap-3">
              <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg">Cancel</button>
              <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                {isSubmitting ? 'Saving...' : initialData ? 'Update' : 'Post Leave'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};