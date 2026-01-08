import React from 'react';
import { User, Leave } from '../types';
import { Calendar } from 'lucide-react';

interface AnnouncementsWidgetProps {
  users: User[];
  leaves: Leave[];
}

export const AnnouncementsWidget: React.FC<AnnouncementsWidgetProps> = ({ users, leaves }) => {
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
    
    // We want leaves starting in the future (>= today) but within next 7 days
    // Or leaves currently active? "someone will be on leave" usually implies future.
    // Let's show leaves starting in the next 7 days OR currently active leaves.
    
    const leaveEnd = new Date(leave.endDate);
    
    // Active leaves: start <= today && end >= today
    // Upcoming: start > today && start <= nextWeek
    
    const isActive = leaveStart <= today && leaveEnd >= today;
    const isUpcoming = leaveStart > today && leaveStart <= nextWeek;
    
    return isActive || isUpcoming;
  }).sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
  .slice(0, 5); // Limit to 5 items

  if (upcomingLeaves.length === 0) return null;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <h3 className="text-lg font-bold text-slate-800 mb-4">Team Announcements</h3>
      
      <div className="space-y-3">
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