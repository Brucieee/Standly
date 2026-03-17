import React from 'react';
import { X, Calendar, Clock, Edit2, Trash2, Tag } from 'lucide-react';
import { Leave, User } from '../types';
import { formatDate, formatTime } from './utils';

interface ViewLeaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  leave: Leave | null;
  user?: User;
  onEdit: (leave: Leave) => void;
  onDelete: (id: string) => void;
  currentUserId: string;
}

export const ViewLeaveModal: React.FC<ViewLeaveModalProps> = ({
  isOpen,
  onClose,
  leave,
  user,
  onEdit,
  onDelete,
  currentUserId
}) => {
  if (!isOpen || !leave || !user) return null;

  const isOwner = currentUserId === user.id;

  const getLeaveLabel = (type: string) => {
    switch (type) {
      case 'vacation': return '🏖️ Vacation Leave';
      case 'sick': return '🤒 Sick Leave';
      case 'personal': return '🏠 Personal Leave';
      case 'wellness': return '🧘 Wellness Leave';
      case 'birthday': return '🎂 Birthday Leave';
      default: return type;
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-slate-200 rounded-3xl shadow-neo border-none w-full max-w-md overflow-hidden animate-fade-in-up" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-slate-300/30 bg-transparent flex justify-between items-start">
          <div className="flex items-center gap-4">
            <img 
              src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`} 
              alt={user.name} 
              className="w-14 h-14 rounded-2xl shadow-neo-sm border-2 border-slate-200 object-cover"
              onError={(e) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`; }}
            />
            <div>
              <h3 className="font-bold text-xl text-slate-900">{user.name}</h3>
              <p className="text-sm font-medium text-slate-500">{user.role}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800 transition-colors"><X size={24} /></button>
        </div>

        <div className="p-8 space-y-6">
          <div className="flex items-center gap-4 text-slate-700 bg-slate-200 p-4 rounded-2xl shadow-neo-sm-inner">
            <div className="p-3 bg-slate-200 shadow-neo rounded-xl text-indigo-600"><Tag size={20} /></div>
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-0.5">Type</p>
              <p className="font-bold capitalize">{getLeaveLabel(leave.type)}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-slate-700 bg-slate-200 p-4 rounded-2xl shadow-neo-sm-inner">
            <div className="p-3 bg-slate-200 shadow-neo rounded-xl text-indigo-600"><Calendar size={20} /></div>
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-0.5">Date Range</p>
              <p className="font-bold">{formatDate(leave.startDate)} <span className="text-slate-400 font-medium px-1">to</span> {formatDate(leave.endDate)}</p>
            </div>
          </div>

          {((leave as any).startTime || (leave as any).endTime) && (
            <div className="flex items-center gap-4 text-slate-700 bg-slate-200 p-4 rounded-2xl shadow-neo-sm-inner">
              <div className="p-3 bg-slate-200 shadow-neo rounded-xl text-indigo-600"><Clock size={20} /></div>
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-0.5">Time</p>
                <p className="font-bold">{formatTime((leave as any).startTime) || 'Start'} - {formatTime((leave as any).endTime) || 'End'}</p>
              </div>
            </div>
          )}

          {leave.reason && (
            <div className="bg-slate-200 p-5 rounded-2xl shadow-neo-sm-inner border-none">
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">Reason</p>
              <p className="text-slate-700 font-medium leading-relaxed italic">"{leave.reason}"</p>
            </div>
          )}

          {isOwner && (
            <div className="flex gap-4 pt-4 border-t border-slate-300/30">
              <button onClick={() => onEdit(leave)} className="flex-1 py-3 bg-slate-200 text-indigo-600 shadow-neo hover:shadow-neo-inner rounded-xl font-bold flex items-center justify-center gap-2 transition-all"><Edit2 size={18} /> Edit</button>
              <button onClick={() => onDelete(leave.id)} className="flex-1 py-3 bg-slate-200 text-red-600 shadow-neo hover:shadow-neo-inner rounded-xl font-bold flex items-center justify-center gap-2 transition-all"><Trash2 size={18} /> Cancel</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};