import React from 'react';
import { User, Deadline } from '../types';
import { AlertTriangle } from 'lucide-react';

interface MissedDeadlinesWidgetProps {
  users: User[];
  deadlines: Deadline[];
  currentUserId: string;
  onEdit: (deadline: Deadline) => void;
}

export const MissedDeadlinesWidget: React.FC<MissedDeadlinesWidgetProps> = ({ users, deadlines, currentUserId, onEdit }) => {
  const formatAssigneeNames = (assignees: User[]) => {
    const names = assignees.map(a => a.name.split(' ')[0]).filter(Boolean);
    if (names.length === 0) return '';
    if (names.length === 1) return names[0];
    const last = names.pop();
    return `${names.join(', ')} and ${last}`;
  };

  return (
    <div className="bg-slate-200 p-6 rounded-3xl border-none shadow-neo">
      <h3 className="text-lg font-bold text-slate-600 mb-4">Missed Deadlines</h3>
      
      {deadlines.length === 0 ? (
        <p className="text-slate-500 text-sm">No missed deadlines! 🎉</p>
      ) : (
        <div className="space-y-4">
          {deadlines.map(deadline => {
            const assignees = (deadline.assigneeIds || []).map(id => users.find(u => u.id === id)).filter(Boolean) as User[];
            const isCreator = deadline.creatorId === currentUserId;
            
            return (
              <div 
                key={`deadline-${deadline.id}`} 
                onClick={() => onEdit(deadline)}
                className="relative bg-slate-200 rounded-2xl p-4 flex items-start gap-3 border border-transparent hover:shadow-neo hover:bg-slate-200 cursor-pointer transition-all active:shadow-neo-sm-inner group"
              >
                {isCreator && (
                  <div className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shadow-lg shadow-red-200" title="You created this missed deadline" />
                )}
                <AlertTriangle className="text-red-500 w-5 h-5 mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform" />
                <div className="pr-4">
                  <p className="font-bold text-sm text-red-600 leading-relaxed">{deadline.title}</p>
                  <div className="flex flex-wrap items-center gap-1 text-xs text-red-400 mt-1">
                    <span>Due on {new Date(deadline.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                    {assignees.length > 0 && (
                      <span>Assigned to {formatAssigneeNames(assignees)}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};