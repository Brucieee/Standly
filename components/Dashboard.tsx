import moment from 'moment-timezone';
import React from 'react';
import { User, Standup, Deadline, Leave } from '../types';
import { Plus, Flag, FileText, Sparkles } from 'lucide-react';
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
      return d.status !== 'Completed' && d.status !== 'Completed Beyond Schedule' && d.status !== 'Submitted for Approval' && dueDate.isSameOrAfter(today) && dueDate.isSameOrBefore(fiveDaysFromNow);
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

    return now.isAfter(dueDate) && d.status !== 'Completed' && d.status !== 'Completed Beyond Schedule' && d.status !== 'Submitted for Approval';
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Feed */}
      <div className="lg:col-span-2 space-y-8">
        <div className="flex justify-between items-center px-1">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-sm text-slate-500">Welcome back, {currentUser.name.split(' ')[0]}</p>
          </div>
          <div className="flex items-center gap-3">
            {currentUser.isAdmin && (
              <button
                onClick={onGenerateReport}
                className="bg-slate-200 text-slate-500 p-2.5 rounded-2xl shadow-neo hover:shadow-neo-inner hover:text-indigo-500 transition-all active:scale-95 border-none"
                title="Generate Report"
              >
                <FileText size={18} className="text-indigo-500" />
              </button>
            )}
            <button
              onClick={onAddDeadline}
              className="bg-slate-200 text-slate-500 hover:text-red-500 px-4 py-2.5 rounded-2xl text-sm font-semibold shadow-neo hover:shadow-neo-inner flex items-center gap-2 transition-all active:scale-95 border-none"
            >
              <Flag size={16} className="text-red-500" />
              <span className="hidden sm:inline">Add Deadline</span>
            </button>
            <button
              onClick={onNewStandup}
              className="bg-gradient-to-r from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600 text-white px-4 py-2.5 rounded-2xl text-sm font-semibold shadow-[4px_4px_10px_rgba(239,68,68,0.3),-4px_-4px_10px_rgba(255,255,255,0.8)] active:shadow-[inset_4px_4px_10px_rgba(0,0,0,0.1),inset_-4px_-4px_10px_rgba(255,255,255,0.2)] flex items-center gap-2 transition-all active:scale-95 border-none"
            >
              <Plus size={16} />
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
      <div className="space-y-6">
        {/* Tap Portal Advertisement Banner */}
        <div className="bg-slate-200 p-6 rounded-3xl border-none shadow-neo relative overflow-hidden group">
          <div className="relative space-y-3">
            <div className="flex items-center gap-3">
              <svg 
                width="36" 
                height="36" 
                viewBox="0 0 120 110" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                className="flex-shrink-0"
              >
                {/* Deep Indigo Background Dial Face */}
                <circle cx="60" cy="55" r="30" fill="#4f46e5" />
                {/* Indicator Dots */}
                <circle cx="60" cy="35" r="2" fill="#ffffff" opacity="0.9" />
                <circle cx="60" cy="75" r="2" fill="#ffffff" opacity="0.9" />
                <circle cx="40" cy="55" r="2" fill="#ffffff" opacity="0.9" />
                <circle cx="80" cy="55" r="2" fill="#ffffff" opacity="0.9" />
                {/* Segmented Clock Outer Arcs */}
                <path d="M 41 22.1 A 38 38 0 0 1 79 22.1" stroke="#4f46e5" strokeWidth="4.5" strokeLinecap="round" fill="none" />
                <path d="M 89.1 30.6 A 38 38 0 0 1 66.6 92.4" stroke="#4f46e5" strokeWidth="4.5" strokeLinecap="round" fill="none" />
                <path d="M 53.4 92.4 A 38 38 0 0 1 30.9 30.6" stroke="#4f46e5" strokeWidth="4.5" strokeLinecap="round" fill="none" />
                {/* Clock Hands */}
                <line x1="60" y1="55" x2="43.7" y2="38.7" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />
                <line x1="60" y1="55" x2="69.9" y2="45.1" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />
                {/* Central Pin */}
                <circle cx="60" cy="55" r="4.5" fill="#ffffff" />
                <circle cx="60" cy="55" r="1.5" fill="#4f46e5" />
              </svg>
              <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200/50">
                Tap Portal
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-700 leading-snug">
              Sync Leaves & Timelogs to MyPortal
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Automate timelogs, MyPortal filings, and leave submissions.
            </p>
            <a 
              href="https://tap-timelog.vercel.app/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md hover:shadow-indigo-500/20 transition-all active:scale-95 border-none mt-2"
            >
              Get Started →
            </a>
          </div>
        </div>

        <CalendarWidget
          standups={standups}
          userId={currentUser.id}
          onDateClick={onCalendarDateClick}
        />
        <MissedDeadlinesWidget 
          users={users} 
          deadlines={missedDeadlines} 
          currentUserId={currentUser.id} 
          onEdit={onEditDeadline}
        />
        <AnnouncementsWidget users={users} leaves={leaves} />
      </div>
    </div>
  );
};