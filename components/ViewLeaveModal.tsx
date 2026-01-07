import React from 'react';
import { X, Palmtree, Calendar, User as UserIcon } from 'lucide-react';
import { Leave, User } from '../types';

interface ViewLeaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  leave: Leave | null;
  user: User | undefined;
}

export const ViewLeaveModal: React.FC<ViewLeaveModalProps> = ({ isOpen, onClose, leave, user }) => {
  if (!isOpen || !leave) return null;

  const getTypeEmoji = (type: Leave['type']) => {
    switch (type) {
      case 'vacation': return '🏖️';
      case 'sick': return '🤒';
      case 'personal': return '🏠';
      case 'wellness': return '🧘';
      default: return '📅';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-fade-in-up" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Palmtree className="text-indigo-500" size={24} />
            Leave Details
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-center gap-4">
            <img src={user?.avatar} alt={user?.name} className="w-16 h-16 rounded-full bg-slate-100 object-cover border-4 border-slate-50" />
            <div>
              <h3 className="font-bold text-lg text-slate-900">{user?.name}</h3>
              <p className="text-slate-500 text-sm">{user?.role}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Type</div>
              <div className="font-medium text-slate-900 capitalize flex items-center gap-2">
                {getTypeEmoji(leave.type)} {leave.type}
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Duration</div>
              <div className="font-medium text-slate-900 flex items-center gap-2">
                <Calendar size={16} className="text-indigo-500" />
                {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
              </div>
            </div>

            {leave.reason && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Reason</div>
                <p className="text-slate-700 leading-relaxed">{leave.reason}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};