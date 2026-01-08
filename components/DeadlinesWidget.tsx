import React from 'react';
import { Deadline, User } from '../types';
import { Trash2, Edit2, Flag, Clock, ExternalLink } from 'lucide-react';

interface DeadlinesWidgetProps {
  deadlines: Deadline[];
  users: User[];
  onDelete: (id: string) => void;
  onEdit: (deadline: Deadline) => void;
  onView: (deadline: Deadline) => void;
}

export const DeadlinesWidget: React.FC<DeadlinesWidgetProps> = ({ deadlines, users, onDelete, onEdit, onView }) => {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
        <Flag className="text-red-500" size={20} />
        Upcoming Deadlines (Next 3 Days)
      </h2>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {deadlines.map((deadline) => {
          const creator = users.find(u => u.id === deadline.creatorId);
          const dueDate = new Date(deadline.dueDate);
          const isOverdue = dueDate < new Date();

          return (
            <div 
              key={deadline.id} 
              onClick={() => onView(deadline)}
              className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group flex flex-col h-full cursor-pointer"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2 min-w-0">
                  <div className={`p-2 rounded-lg shrink-0 ${isOverdue ? 'bg-red-50 text-red-600' : 'bg-indigo-50 text-indigo-600'}`}>
                    <Clock size={16} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-slate-900 text-sm truncate" title={deadline.title}>{deadline.title}</h3>
                    <p className={`text-xs font-medium ${isOverdue ? 'text-red-500' : 'text-slate-500'}`}>
                      {dueDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                   <button 
                     onClick={(e) => { e.stopPropagation(); onEdit(deadline); }} 
                     className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                   >
                     <Edit2 size={14} />
                   </button>
                   <button 
                     onClick={(e) => { e.stopPropagation(); onDelete(deadline.id); }} 
                     className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                   >
                     <Trash2 size={14} />
                   </button>
                </div>
              </div>

              {deadline.description && (
                <p className="text-xs text-slate-500 mb-3 line-clamp-2 flex-1">
                  {deadline.description}
                </p>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-slate-50 mt-auto">
                 <div className="flex items-center gap-2 min-w-0">
                    <img 
                      src={creator?.avatar || `https://ui-avatars.com/api/?name=${creator?.name || 'User'}`} 
                      alt={creator?.name}
                      className="w-5 h-5 rounded-full bg-slate-100 object-cover shrink-0"
                    />
                    <span className="text-xs text-slate-400 truncate">
                      {creator?.name || 'Unknown'}
                    </span>
                 </div>
                 
                 {deadline.releaseLink && (
                   <a 
                     href={deadline.releaseLink}
                     onClick={(e) => e.stopPropagation()}
                     target="_blank"
                     rel="noopener noreferrer"
                     className="text-xs font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1 shrink-0 ml-2"
                   >
                     Link <ExternalLink size={10} />
                   </a>
                 )}
              </div>
            </div>
          );
        })}
        
        {deadlines.length === 0 && (
          <div className="col-span-full py-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <p className="text-sm text-slate-500">No upcoming deadlines within 3 days.</p>
          </div>
        )}
      </div>
    </div>
  );
};