import React from 'react';
import { Deadline, User } from '../types';
import { Trash2, Edit2, Flag, Clock, ExternalLink, MessageSquare } from 'lucide-react';

interface DeadlinesWidgetProps {
  deadlines: Deadline[];
  users: User[];
  currentUser: User | null;
  onDelete: (id: string) => void;
  onEdit: (deadline: Deadline) => void;
  onView: (deadline: Deadline) => void;
}

export const DeadlinesWidget: React.FC<DeadlinesWidgetProps> = ({ deadlines, users, currentUser, onDelete, onEdit, onView }) => {
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'Completed': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'In Progress': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-amber-100 text-amber-700 border-amber-200'; // Pending
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
        <Flag className="text-red-500" size={20} />
        Upcoming Deadlines (Next 3 Days)
      </h2>
      
      <div className="flex flex-col gap-3">
        {deadlines.map((deadline) => {
          const creator = users.find(u => u.id === deadline.creatorId);
          const dueDate = new Date(deadline.dueDate);
          const isOverdue = dueDate < new Date() && deadline.status !== 'Completed';
          const isCreator = !!(currentUser?.id && deadline.creatorId && currentUser.id === deadline.creatorId);
          const isAdmin = !!currentUser?.isAdmin;
          const canEdit = isCreator || isAdmin;

          return (
            <div 
              key={deadline.id} 
              title={`Debug: CanEdit=${canEdit} (Creator=${isCreator}, Admin=${isAdmin})`} 
              className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group flex flex-col gap-3"
            >
              {/* Header: Title, Date, Status */}
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1 min-w-0">
                   <h3 className="font-bold text-slate-900 text-base leading-snug break-words mb-1">
                     {deadline.title}
                   </h3>
                   <div className={`flex items-center gap-1.5 text-xs font-medium ${isOverdue ? 'text-red-600' : 'text-slate-500'}`}>
                     <Clock size={14} />
                     {dueDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                   </div>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border shrink-0 ${getStatusColor(deadline.status)}`}>
                  {deadline.status || 'Pending'}
                </span>
              </div>

              {/* Body: Description & Remarks */}
              <div className="flex flex-col gap-3 min-w-0 w-full">
                {deadline.description && (
                  <div className="min-w-0 w-full">
                     <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide mb-1">Description</p>
                     <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap break-words">{deadline.description}</p>
                  </div>
                )}
                {deadline.remarks && (
                  <div className="min-w-0 w-full">
                     <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide mb-1">Remarks</p>
                     <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap break-words">{deadline.remarks}</p>
                  </div>
                )}
              </div>

              {/* Footer: Created By & Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-50 mt-1">
                 <div className="flex items-center gap-2">
                    <img 
                      src={creator?.avatar || `https://ui-avatars.com/api/?name=${creator?.name || 'User'}`} 
                      alt={creator?.name}
                      className="w-6 h-6 rounded-full bg-slate-100 object-cover border border-slate-100"
                    />
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-400 font-bold uppercase leading-none">Created by</span>
                      <span className="text-xs font-medium text-slate-700">{creator?.name || 'Unknown'}</span>
                    </div>
                 </div>

                 <div className="flex items-center gap-3">
                    {deadline.releaseLink && (
                       <a 
                         href={deadline.releaseLink}
                         onClick={(e) => e.stopPropagation()}
                         target="_blank"
                         rel="noopener noreferrer"
                         className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-600 text-xs font-medium hover:bg-indigo-100 transition-colors"
                       >
                         <ExternalLink size={14} />
                         Link
                       </a>
                     )}
                    
                    {canEdit && (
                      <div className="flex gap-1">
                        <button 
                          onClick={(e) => { e.stopPropagation(); onEdit(deadline); }} 
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); onDelete(deadline.id); }} 
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                 </div>
              </div>
            </div>
          );
        })}
        
        {deadlines.length === 0 && (
          <div className="py-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <p className="text-sm text-slate-500">No upcoming deadlines within 3 days.</p>
          </div>
        )}
      </div>
    </div>
  );
};