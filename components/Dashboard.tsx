import moment from 'moment-timezone';
import React from 'react';
import { User, Standup, Deadline, Leave } from '../types';
import { Plus, Flag, FileText } from 'lucide-react';
import { DeadlinesWidget } from './DeadlinesWidget';
import { StandupFeed } from './StandupFeed';
import { CalendarWidget } from './CalendarWidget';
import { AnnouncementsWidget } from './AnnouncementsWidget';
import { MissedDeadlinesWidget } from './MissedDeadlinesWidget';

interface DashboardProps {
  currentUser: User;
  users: User[];
  standups: Standup[];
  deadlines: Deadline[];
  leaves: Leave[];
  onGenerateReport: () => void;
  onAddDeadline: () => void;
  onNewStandup: () => void;
  onDeleteDeadline: (id: string) => void;
  onEditDeadline: (deadline: Deadline) => void;
  onViewDeadline: (deadline: Deadline) => void;
  onEditStandup: (standup: Standup) => void;
  onDeleteStandup: (id: string) => void;
  onViewStandup: (standup: Standup) => void;
  onCalendarDateClick: (date: string) => void;
  onReact: (standupId: string, reactionType: string) => void;
  onComment: (standupId: string, text: string, parentId?: string) => void;
  onEditComment?: (commentId: string, text: string) => void;
  onDeleteComment?: (commentId: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  currentUser,
  users,
  standups,
  deadlines,
  leaves,
  onGenerateReport,
  onAddDeadline,
  onNewStandup,
  onDeleteDeadline,
  onEditDeadline,
  onViewDeadline,
  onEditStandup,
  onDeleteStandup,
  onViewStandup,
  onCalendarDateClick,
  onReact,
  onComment,
  onEditComment,
  onDeleteComment,
}) => {
// Filter deadlines: upcoming within 5 days, max 3 items
const upcomingDeadlines = deadlines
  .filter(d => {
    const dueDate = moment(d.dueDate).startOf('day');
    const today = moment().startOf('day');
    const fiveDaysFromNow = moment().add(5, 'days').endOf('day');
    return d.status !== 'Completed' && dueDate.isSameOrAfter(today) && dueDate.isSameOrBefore(fiveDaysFromNow);
  });

  const missedDeadlines = deadlines.filter(d => {
    const dueDate = moment(d.dueDate).tz('Asia/Manila');
    const now = moment().tz('Asia/Manila');
    
    // Set deadline to 5 PM of the due date
    dueDate.set({
      hour: 17,
      minute: 0,
      second: 0,
      millisecond: 0
    });
    
    return now.isAfter(dueDate) && d.status !== 'Completed';
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Main Feed */}
      <div className="lg:col-span-2 space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-slate-500">Welcome back, {currentUser.name.split(' ')[0]}</p>
          </div>
          <div className="flex items-center gap-3">
            {currentUser.isAdmin && (
              <button 
                onClick={onGenerateReport}
                className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-xl font-semibold shadow-sm flex items-center gap-2 transition-all active:scale-[0.98]"
              >
                <FileText size={20} className="text-indigo-500" />
                <span className="hidden sm:inline">Weekly AI Summary</span>
              </button>
            )}
            <button 
              onClick={onAddDeadline}
              className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-xl font-semibold shadow-sm flex items-center gap-2 transition-all active:scale-[0.98]"
            >
              <Flag size={20} className="text-red-500" />
              <span className="hidden sm:inline">Add Deadline</span>
            </button>
            <button 
              onClick={onNewStandup}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-semibold shadow-lg shadow-indigo-200 flex items-center gap-2 transition-all active:scale-[0.98]"
            >
              <Plus size={20} />
              <span className="hidden sm:inline">New Standup</span>
            </button>
          </div>
        </div>
        
        <DeadlinesWidget 
          deadlines={upcomingDeadlines} 
          users={users}
          currentUser={currentUser}
          onDelete={(id) => onDeleteDeadline(id)}
          onEdit={onEditDeadline}
          onView={onViewDeadline}
        />
        <StandupFeed 
          standups={standups} 
          users={users} 
          currentUserId={currentUser.id}
          onDelete={onDeleteStandup}
          onEdit={onEditStandup}
          onView={onViewStandup}
          onReact={onReact}
          onComment={onComment}
          onEditComment={onEditComment}
          onDeleteComment={onDeleteComment}
        />
      </div>

      {/* Sidebar Widgets */}
      <div className="space-y-8">
        <CalendarWidget 
          standups={standups} 
          userId={currentUser.id} 
          onDateClick={onCalendarDateClick}
        />
        <MissedDeadlinesWidget users={users} deadlines={missedDeadlines} />
        <AnnouncementsWidget users={users} leaves={leaves} />
      </div>
    </div>
  );
};