import React, { useState } from 'react';
import { User, Leave } from '../types';
import { ChevronLeft, ChevronRight, Plus, Palmtree, Trash2 } from 'lucide-react';

interface LeaveCalendarProps {
  users: User[];
  leaves: Leave[];
  currentUserId: string;
  onAddLeave: () => void;
  onDeleteLeave: (id: string) => void;
  onLeaveClick: (leave: Leave) => void;
}

export const LeaveCalendar: React.FC<LeaveCalendarProps> = ({ users, leaves, currentUserId, onAddLeave, onDeleteLeave, onLeaveClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [hoveredUserId, setHoveredUserId] = useState<string | null>(null);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const days = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    return { days, firstDay };
  };

  const { days, firstDay } = getDaysInMonth(currentDate);
  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const year = currentDate.getFullYear();

  const prevMonth = () => setCurrentDate(new Date(year, currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, currentDate.getMonth() + 1, 1));

  const isLeaveDay = (day: number, leave: Leave) => {
    const checkDate = new Date(year, currentDate.getMonth(), day);
    const start = new Date(leave.startDate);
    const end = new Date(leave.endDate);
    // Reset hours for accurate comparison
    checkDate.setHours(0,0,0,0);
    start.setHours(0,0,0,0);
    end.setHours(0,0,0,0);
    return checkDate >= start && checkDate <= end;
  };

  const getLeaveColor = (type: Leave['type']) => {
    switch (type) {
      case 'vacation': return 'bg-blue-500';
      case 'sick': return 'bg-red-500';
      case 'personal': return 'bg-green-500';
      case 'wellness': return 'bg-purple-500';
      default: return 'bg-slate-500';
    }
  };

  const getLeaveEmoji = (type: Leave['type']) => {
    switch (type) {
      case 'vacation': return '🏖️';
      case 'sick': return '🤒';
      case 'personal': return '🏠';
      case 'wellness': return '🧘';
      default: return '📅';
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-140px)]">
      {/* Sidebar - Users List */}
      <div className="w-full lg:w-80 bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col overflow-hidden flex-shrink-0">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Palmtree className="text-indigo-500" size={20} />
            Team Members
          </h2>
          <p className="text-xs text-slate-500 mt-1">Hover to highlight leaves</p>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {users.map(user => {
            const userLeaves = leaves.filter(l => l.userId === user.id);
            const upcomingLeaves = userLeaves.filter(l => new Date(l.endDate) >= new Date());
            
            return (
              <div
                key={user.id}
                onMouseEnter={() => setHoveredUserId(user.id)}
                onMouseLeave={() => setHoveredUserId(null)}
                className={`p-3 rounded-xl transition-all cursor-pointer border ${
                  hoveredUserId === user.id 
                    ? 'bg-indigo-50 border-indigo-200 shadow-sm scale-[1.02]' 
                    : 'bg-white border-transparent hover:bg-slate-50 hover:border-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full bg-slate-100 object-cover" />
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-bold text-sm truncate ${hoveredUserId === user.id ? 'text-indigo-700' : 'text-slate-900'}`}>
                      {user.name}
                    </h3>
                    <p className="text-xs text-slate-500 truncate">{user.role}</p>
                  </div>
                  {upcomingLeaves.length > 0 && (
                    <span className="px-2 py-1 bg-indigo-100 text-indigo-600 text-[10px] font-bold rounded-full">
                      {upcomingLeaves.length}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <div className="p-4 border-t border-slate-100">
          <button
            onClick={onAddLeave}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-semibold transition-all shadow-lg shadow-indigo-200 active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <Plus size={18} />
            Post Leave
          </button>
        </div>
      </div>

      {/* Main - Calendar */}
      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col overflow-hidden">
        {/* Calendar Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-slate-900">
            {monthName} <span className="text-slate-400">{year}</span>
          </h2>
          <div className="flex gap-2">
            <button onClick={prevMonth} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors">
              <ChevronLeft size={24} />
            </button>
            <button onClick={nextMonth} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors">
              <ChevronRight size={24} />
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="grid grid-cols-7 gap-4 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-sm font-bold text-slate-400 uppercase tracking-wider">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-4 auto-rows-[1fr]">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-[100px]" />
            ))}
            {Array.from({ length: days }).map((_, i) => {
              const day = i + 1;
              const dayLeaves = leaves.filter(l => isLeaveDay(day, l));
              const isHoveredUserOnLeave = hoveredUserId && dayLeaves.some(l => l.userId === hoveredUserId);
              const isToday = new Date().getDate() === day && new Date().getMonth() === currentDate.getMonth() && new Date().getFullYear() === currentDate.getFullYear();

              return (
                <div 
                  key={day} 
                  className={`
                    min-h-[100px] p-3 rounded-2xl border transition-all duration-300 relative group
                    ${isHoveredUserOnLeave 
                      ? 'bg-indigo-50 border-indigo-200 shadow-md scale-105 z-10' 
                      : isToday 
                        ? 'bg-white border-indigo-500 ring-1 ring-indigo-500/20' 
                        : 'bg-white border-slate-100 hover:border-slate-200'
                    }
                  `}
                >
                  <span className={`text-sm font-bold ${isToday ? 'text-indigo-600' : 'text-slate-700'}`}>{day}</span>
                  
                  <div className="mt-2 space-y-1">
                    {dayLeaves.map(leave => {
                      const user = users.find(u => u.id === leave.userId);
                      if (!user) return null;
                      const isHovered = hoveredUserId === leave.userId;
                      const isCurrentUser = currentUserId === leave.userId;

                      return (
                        <div 
                          key={leave.id}
                          onClick={(e) => { e.stopPropagation(); onLeaveClick(leave); }}
                          className={`
                            text-[10px] px-2 py-1 rounded-md truncate flex items-center justify-between gap-1 transition-all cursor-pointer
                            ${isHovered ? 'opacity-100 font-bold shadow-sm' : hoveredUserId ? 'opacity-30' : 'opacity-100'}
                            ${isHovered ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}
                          `}
                          title={`${user.name} - ${leave.type}`}
                        >
                          <span className="flex items-center gap-1">{getLeaveEmoji(leave.type)} {user.name.split(' ')[0]}</span>
                          {isCurrentUser && (
                            <button onClick={(e) => { e.stopPropagation(); onDeleteLeave(leave.id); }} className="hover:text-red-500"><Trash2 size={10} /></button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};