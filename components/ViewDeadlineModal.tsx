import React from 'react';
import { X, Calendar, Edit2, Trash2, Flag, Link as LinkIcon, User as UserIcon } from 'lucide-react';
import { Deadline, User } from '../types';

interface ViewDeadlineModalProps {
  isOpen: boolean;
  onClose: () => void;
  deadline: Deadline | null;
  creator?: User;
  onEdit: (deadline: Deadline) => void;
  onDelete: (id: string) => void;
}

export const ViewDeadlineModal: React.FC<ViewDeadlineModalProps> = ({
  isOpen,
  onClose,
  deadline,
  creator,
  onEdit,
  onDelete
}) => {
  if (!isOpen || !deadline) return null;

  const dueDate = new Date(deadline.dueDate);
  const isOverdue = dueDate < new Date();

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" 
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in-up" 
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${isOverdue ? 'bg-red-100 text-red-600' : 'bg-indigo-100 text-indigo-600'}`}>
              <Flag size={24} />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Deadline</p>
              <h3 className="font-bold text-lg text-slate-900 leading-tight">{deadline.title}</h3>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-slate-50 rounded-lg text-slate-500 mt-0.5">
              <Calendar size={20} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Due Date</p>
              <p className={`text-base ${isOverdue ? 'text-red-600 font-medium' : 'text-slate-600'}`}>
                {dueDate.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
              {isOverdue && (
                 <span className="inline-block mt-1 text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                   Overdue
                 </span>
              )}
            </div>
          </div>

          {deadline.description && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <p className="text-xs text-slate-500 font-bold uppercase mb-2">Description</p>
              <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">{deadline.description}</p>
            </div>
          )}

          {deadline.releaseLink && (
            <div className="flex items-center gap-4">
              <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                <LinkIcon size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900">Release Link</p>
                <a 
                  href={deadline.releaseLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:text-indigo-700 truncate block hover:underline"
                >
                  {deadline.releaseLink}
                </a>
              </div>
            </div>
          )}

          <div className="flex items-center gap-4 pt-2 border-t border-slate-100">
             <div className="flex items-center gap-3 flex-1">
                <img 
                  src={creator?.avatar || `https://ui-avatars.com/api/?name=${creator?.name || 'User'}`} 
                  alt={creator?.name}
                  className="w-10 h-10 rounded-full bg-slate-100 object-cover border border-slate-200"
                />
                <div>
                  <p className="text-xs text-slate-500">Created by</p>
                  <p className="text-sm font-medium text-slate-900">{creator?.name || 'Unknown'}</p>
                </div>
             </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button 
              onClick={() => {
                onEdit(deadline);
                onClose();
              }} 
              className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              <Edit2 size={16} /> Edit
            </button>
            <button 
              onClick={() => {
                onDelete(deadline.id);
                onClose();
              }} 
              className="flex-1 py-2.5 bg-white border border-red-200 text-red-600 rounded-xl font-medium hover:bg-red-50 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              <Trash2 size={16} /> Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};