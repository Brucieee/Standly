import React from 'react';
import { X, Calendar, Edit2, Trash2, Flag, Link as LinkIcon, User as UserIcon, CheckCircle, MessageSquare } from 'lucide-react';
import { Deadline, User } from '../types';

interface ViewDeadlineModalProps {
  isOpen: boolean;
  onClose: () => void;
  deadline: Deadline | null;
  creator?: User;
  onEdit: (deadline: Deadline) => void;
  onDelete: (id: string) => void;
  users: User[];
}

export const ViewDeadlineModal: React.FC<ViewDeadlineModalProps> = ({
  isOpen,
  onClose,
  deadline,
  creator,
  onEdit,
  onDelete,
  users
}) => {
  if (!isOpen || !deadline) return null;

  const dueDate = new Date(deadline.dueDate);
  const isOverdue = dueDate < new Date() && deadline.status !== 'Completed';
  const assignees = deadline.assigneeIds
    ? deadline.assigneeIds.map(id => users.find(u => u.id === id)).filter(Boolean) as User[]
    : [];

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'Completed': return 'text-emerald-700 bg-emerald-100';
      case 'In Progress': return 'text-blue-700 bg-blue-100';
      case 'For QA': return 'text-purple-700 bg-purple-100';
      case 'Submitted for Approval': return 'text-cyan-700 bg-cyan-100';
      case 'Completed Beyond Schedule': return 'text-orange-700 bg-orange-100';
      default: return 'text-amber-700 bg-amber-100'; // Pending
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-slate-200 rounded-3xl shadow-neo border-none w-full max-w-md overflow-hidden animate-fade-in-up max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-none flex justify-between items-start bg-transparent flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-2xl shadow-neo-sm ${isOverdue ? 'text-red-500 bg-slate-200' : 'text-indigo-500 bg-slate-200'}`}>
              <Flag size={24} />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-0.5">Deadline</p>
              <h3 className="font-bold text-lg text-slate-800 leading-tight">{deadline.title}</h3>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto w-full">
          <div className="flex items-start gap-4">
            <div className="p-2.5 bg-slate-200 shadow-neo-sm rounded-xl text-slate-500 mt-0.5">
              <Calendar size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">Due Date</p>
              <p className={`text-base font-medium ${isOverdue ? 'text-red-500' : 'text-slate-600'}`}>
                {dueDate.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
              {isOverdue && (
                <span className="inline-block mt-1 text-[10px] font-bold text-red-500 uppercase tracking-widest bg-slate-200 shadow-neo-sm px-2.5 py-1 rounded-full">
                  Overdue
                </span>
              )}
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-2.5 bg-slate-200 shadow-neo-sm rounded-xl text-slate-500 mt-0.5">
              <CheckCircle size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">Status</p>
              <span className={`inline-block mt-2 px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold shadow-neo-sm bg-slate-200 ${getStatusColor(deadline.status).replace('bg-', 'border border-')}`}>
                {deadline.status || 'Pending'}
              </span>
            </div>
          </div>

          {deadline.description && (
            <div className="bg-slate-200 shadow-neo-sm-inner p-5 rounded-2xl border-none">
              <p className="text-[10px] text-slate-400 font-bold uppercase mb-2 tracking-wide">Description</p>
              <p className="text-slate-600 text-sm whitespace-pre-wrap leading-relaxed">{deadline.description}</p>
            </div>
          )}

          {deadline.remarks && (
            <div className="bg-slate-200 shadow-neo-sm-inner p-5 rounded-2xl border-none">
              <p className="text-[10px] text-slate-400 font-bold uppercase mb-2 tracking-wide">Remarks</p>
              <p className="text-slate-600 text-sm whitespace-pre-wrap leading-relaxed">{deadline.remarks}</p>
            </div>
          )}

          {deadline.releaseLink && (
            <div className="flex items-center gap-4">
              <div className="p-2.5 bg-slate-200 shadow-neo-sm rounded-xl text-indigo-500">
                <LinkIcon size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-800">Release Link</p>
                <a
                  href={deadline.releaseLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-500 hover:text-indigo-600 text-sm font-medium pt-0.5 truncate block hover:underline"
                >
                  {deadline.releaseLink}
                </a>
              </div>
            </div>
          )}

          <div className="flex items-center gap-4 pt-4 border-none border-slate-300">
            <div className="flex items-center gap-3 flex-1">
              <img
                src={creator?.avatar || `https://ui-avatars.com/api/?name=${creator?.name || 'User'}`}
                alt={creator?.name}
                className="w-10 h-10 rounded-full bg-slate-200 object-cover shadow-neo-sm border border-slate-200"
              />
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Created by</p>
                <p className="text-sm font-bold text-slate-800">{creator?.name || 'Unknown'}</p>
              </div>
            </div>

            {assignees.length > 0 && (
              <div className="flex items-center gap-3 flex-1">
                <div className="flex -space-x-3 overflow-hidden ml-2">
                  {assignees.map(assignee => (
                    <img
                      key={assignee.id}
                      src={assignee.avatar || `https://ui-avatars.com/api/?name=${assignee.name}`}
                      alt={assignee.name}
                      title={assignee.name}
                      className="inline-block w-8 h-8 rounded-full shadow-neo-sm object-cover border border-slate-200"
                    />
                  ))}
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Assigned to</p>
                  <p className="text-sm font-bold text-slate-800">
                    {assignees.length === 1 ? assignees[0].name : `${assignees.length} people`}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-4 pt-4 mt-2">
            <button
              onClick={() => {
                onEdit(deadline);
                onClose();
              }}
              className="flex-1 py-3 bg-slate-200 text-indigo-500 rounded-2xl font-bold shadow-neo hover:shadow-neo-inner flex items-center justify-center gap-2 transition-all active:scale-[0.98] border-none"
            >
              <Edit2 size={16} /> Edit
            </button>
            <button
              onClick={() => {
                onDelete(deadline.id);
                onClose();
              }}
              className="flex-1 py-3 bg-slate-200 text-red-500 rounded-2xl font-bold shadow-neo hover:shadow-neo-inner flex items-center justify-center gap-2 transition-all active:scale-[0.98] border-none"
            >
              <Trash2 size={16} /> Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};