import React from 'react';
import { X, Calendar, Clock, Edit2, Trash2, Tag } from 'lucide-react';
import { Leave, User } from '../types';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in-up" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-slate-100 flex justify-between items-start">
          <div className="flex items-center gap-4">
            <img 
              src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`} 
              alt={user.name} 
              className="w-14 h-14 rounded-2xl bg-slate-100 object-cover shadow-sm"
              onError={(e) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`; }}
            />
            <div>
              <h3 className="font-bold text-lg text-slate-900">{user.name}</h3>
              <p className="text-sm text-slate-500">{user.role}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-center gap-3 text-slate-700">
            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600"><Tag size={20} /></div>
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase">Type</p>
              <p className="font-medium capitalize">{getLeaveLabel(leave.type)}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-slate-700">
            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600"><Calendar size={20} /></div>
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase">Date Range</p>
              <p className="font-medium">{leave.startDate} <span className="text-slate-400">to</span> {leave.endDate}</p>
            </div>
          </div>

          {((leave as any).startTime || (leave as any).endTime) && (
            <div className="flex items-center gap-3 text-slate-700">
              <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600"><Clock size={20} /></div>
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase">Time</p>
                <p className="font-medium">{(leave as any).startTime || 'Start'} - {(leave as any).endTime || 'End'}</p>
              </div>
            </div>
          )}

          {leave.reason && (
            <div className="bg-slate-50 p-4 rounded-xl">
              <p className="text-xs text-slate-500 font-bold uppercase mb-1">Reason</p>
              <p className="text-slate-700">{leave.reason}</p>
            </div>
          )}

          {isOwner && (
            <div className="flex gap-3 pt-2">
              <button onClick={() => onEdit(leave)} className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 flex items-center justify-center gap-2"><Edit2 size={16} /> Edit</button>
              <button onClick={() => onDelete(leave.id)} className="flex-1 py-2.5 bg-white border border-red-200 text-red-600 rounded-xl font-medium hover:bg-red-50 flex items-center justify-center gap-2"><Trash2 size={16} /> Cancel</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};