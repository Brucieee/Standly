import React from 'react';
import { User, Leave, Deadline } from '../types';
import { Calendar, AlertTriangle } from 'lucide-react';

interface AnnouncementsWidgetProps {
  users: User[];
  leaves: Leave[];
  deadlines: Deadline[];
}

export const AnnouncementsWidget: React.FC<AnnouncementsWidgetProps> = ({ users, leaves, deadlines }) => {
  // Logic to find upcoming leaves (next 7 days)
  const upcomingLeaves = leaves.filter(leave => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    
    const leaveStart = new Date(leave.startDate);
    // Fix timezone offset for comparison if needed, but assuming ISO string YYYY-MM-DD
    // standard comparison:
    const leaveStartLocal = new Date(leaveStart.getUTCFullYear(), leaveStart.getUTCMonth(), leaveStart.getUTCDate());
    
    const leaveEnd = new Date(leave.endDate);
    
    const isActive = leaveStart <= today && leaveEnd >= today;
    const isUpcoming = leaveStart > today && leaveStart <= nextWeek;
    
    return isActive || isUpcoming;
  }).sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
  .slice(0, 5); // Limit to 5 items

  const formatAssigneeNames = (assignees: User[]) => {
    const names = assignees.map(a => a.name).filter(Boolean);
    if (names.length === 0) return '';
    if (names.length === 1) return names[0];
    const last = names.pop();
    return `${names.join(', ')} and ${last}`;
  };

  if (upcomingLeaves.length === 0 && deadlines.length === 0) return null;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <h3 className="text-lg font-bold text-slate-800 mb-4">Team Announcements</h3>
      
      <div className="space-y-4">
        {/* Missed Deadlines */}
        {deadlines.length > 0 && (
          <div className="space-y-3">
            {deadlines.map(deadline => {
              const assignees = deadline.assigneeIds?.map(id => users.find(u => u.id === id)).filter(Boolean) as User[];
              return (
                <div key={`deadline-${deadline.id}`} className="bg-red-50 rounded-xl p-3 flex items-start gap-3 border border-red-100">
                  <AlertTriangle className="text-red-500 w-5 h-5 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm text-red-800">
                      Deadline Missed: <span className="font-bold">{deadline.title}</span>
                    </p>
                    <div className="flex items-center gap-1 text-xs text-red-600 mt-0.5">
                      <span>Due on {new Date(deadline.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                      {assignees.length > 0 && (
                        <>
                          <span className="mx-1">&middot;</span>
                          <span>Assigned to {formatAssigneeNames(assignees)}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Upcoming Leaves */}
        {upcomingLeaves.map(leave => {
          const user = users.find(u => u.id === leave.userId);
          if (!user) return null;
          
          const startDate = new Date(leave.startDate);
          const endDate = new Date(leave.endDate);
          const today = new Date();
          const isActive = startDate <= today && endDate >= today;
          
          const dateStr = startDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
          const endStr = endDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
          
          const getLeaveTypeLabel = (type: string) => {
             if (type === 'sick') return 'sick leave';
             return `${type} leave`;
          };

          return (
            <div key={leave.id} className="bg-slate-50 rounded-xl p-3 flex items-center gap-3 border border-slate-100">
              <img 
                src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}`} 
                alt={user.name} 
                className="w-10 h-10 rounded-full bg-white object-cover border border-slate-200"
              />
              <div>
                <p className="font-medium text-sm text-slate-700">
                  <span className="font-bold text-slate-900">{user.name.split(' ')[0]}</span> will be on 
                  <span className="lowercase"> {getLeaveTypeLabel(leave.type)}</span>
                </p>
                <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                  <Calendar size={12} />
                  <span>
                    {isActive ? 'Currently away' : `Starting ${dateStr}`}
                    {startDate.getTime() !== endDate.getTime() && ` - ${endStr}`}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};