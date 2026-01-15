import React from 'react';
import { User, Deadline } from '../types';
import { AlertTriangle } from 'lucide-react';

interface MissedDeadlinesWidgetProps {
  users: User[];
  deadlines: Deadline[];
}

export const MissedDeadlinesWidget: React.FC<MissedDeadlinesWidgetProps> = ({ users, deadlines }) => {
  const formatAssigneeNames = (assignees: User[]) => {
    const names = assignees.map(a => a.name.split(' ')[0]).filter(Boolean);
    if (names.length === 0) return '';
    if (names.length === 1) return names[0];
    const last = names.pop();
    return `${names.join(', ')} and ${last}`;
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <h3 className="text-lg font-bold text-slate-800 mb-4">Missed Deadlines</h3>
      
      {deadlines.length === 0 ? (
        <p className="text-slate-500 text-sm">No missed deadlines! 🎉</p>
      ) : (
        <div className="space-y-4">
          {deadlines.map(deadline => {
            const assignees = deadline.assigneeIds?.map(id => users.find(u => u.id === id)).filter(Boolean) as User[];
            return (
              <div key={`deadline-${deadline.id}`} className="bg-red-50 rounded-xl p-4 flex items-start gap-3 border border-red-100">
                <AlertTriangle className="text-red-500 w-5 h-5 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-bold text-sm text-red-800 leading-relaxed">{deadline.title}</p>
                  <div className="flex flex-wrap items-center gap-1 text-xs text-red-600 mt-1">
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