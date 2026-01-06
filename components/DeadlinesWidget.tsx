import React from 'react';
import { Task } from '../types';
import { Flag, Clock, Calendar, Trash2 } from 'lucide-react';

interface DeadlinesWidgetProps {
  tasks: Task[];
  onDelete: (id: string) => void;
}

export const DeadlinesWidget: React.FC<DeadlinesWidgetProps> = ({ tasks, onDelete }) => {
  // Filter tasks that have a due date and sort by date ascending
  // Also show all of them, scrollable
  const upcomingDeadlines = tasks
    .filter(t => t.dueDate && t.status !== 'done')
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <Flag className="text-red-500" size={20} />
          Upcoming Deadlines
        </h2>
      </div>

      <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
        {upcomingDeadlines.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-4">No upcoming deadlines.</p>
        ) : (
          upcomingDeadlines.map(task => {
            const date = new Date(task.dueDate);
            const isUrgent = (date.getTime() - Date.now()) < (48 * 60 * 60 * 1000); // Less than 48h

            return (
              <div key={task.id} className="group flex items-start space-x-3 p-3 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-colors relative">
                 <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${isUrgent ? 'bg-red-500 animate-pulse' : 'bg-indigo-500'}`} />
                 <div className="flex-1 min-w-0">
                   <div className="flex justify-between items-start">
                      <h3 className="font-semibold text-slate-800 text-sm">{task.title}</h3>
                      <button 
                        onClick={() => onDelete(task.id)}
                        className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1"
                        title="Delete Deadline"
                      >
                        <Trash2 size={14} />
                      </button>
                   </div>
                   <div className="flex flex-col gap-1 text-xs text-slate-500 mt-1">
                     <div className="flex items-center">
                        <Calendar size={12} className="mr-1" />
                        <span className={isUrgent ? 'text-red-600 font-medium' : ''}>
                          {date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                     </div>
                     {task.description && (
                       <p className="whitespace-pre-line text-slate-600 bg-white/50 p-1.5 rounded border border-slate-200/50 mt-1">
                         {task.description}
                       </p>
                     )}
                   </div>
                 </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};