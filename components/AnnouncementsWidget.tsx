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
    
    const leaveEnd = new Date(leave.endDate);
    
    const isActive = leaveStart <= today && leaveEnd >= today;
    const isUpcoming = leaveStart > today && leaveStart <= nextWeek;
    
    return isActive || isUpcoming;
  }).sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
  .slice(0, 5); // Limit to 5 items

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <h3 className="text-lg font-bold text-slate-800 mb-4">Team Announcements</h3>
      
      <div className="space-y-4">
        {/* Upcoming Leaves */}
        {upcomingLeaves.length === 0 ? (
          <p className="text-slate-500 text-sm">No upcoming leaves.</p>
        ) : (
          upcomingLeaves.map(leave => {
            const user = users.find(u => u.id === leave.userId);
            if (!user) return null;
            
            const startDate = new Date(leave.startDate);
            const endDate = new Date(leave.endDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const sDate = new Date(startDate.getUTCFullYear(), startDate.getUTCMonth(), startDate.getUTCDate());
            const eDate = new Date(endDate.getUTCFullYear(), endDate.getUTCMonth(), endDate.getUTCDate());
            const isActive = sDate <= today && eDate >= today;
            
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
                    <span className="font-bold text-slate-900">{user.name.split(' ')[0]}</span> {isActive ? 'is on' : 'will be on'} 
                    <span className="lowercase"> {getLeaveTypeLabel(leave.type)}</span>
                    {isActive && ' today'}
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
          })
        )}
      </div>
    </div>
  );
};