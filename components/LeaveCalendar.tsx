import React, { useState } from 'react';
import { User, Leave } from '../types';
import { ChevronLeft, ChevronRight, Plus, Palmtree, Trash2, CalendarPlus, List, LayoutGrid } from 'lucide-react';

interface LeaveCalendarProps {
  users: User[];
  leaves: Leave[];
  holidays: any[];
  currentUserId: string;
  currentUserIsAdmin?: boolean;
  onAddLeave: () => void;
  onDeleteLeave: (id: string) => void;
  onLeaveClick: (leave: Leave) => void;
  onAddHoliday: () => void;
  onDeleteHoliday: (id: string) => void;
}

export const LeaveCalendar: React.FC<LeaveCalendarProps> = ({ users, leaves, holidays, currentUserId, currentUserIsAdmin, onAddLeave, onDeleteLeave, onLeaveClick, onAddHoliday, onDeleteHoliday }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [hoveredUserId, setHoveredUserId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'calendar' | 'months'>('calendar');
  const [displayMode, setDisplayMode] = useState<'calendar' | 'list'>('calendar');

  const [selectedHoliday, setSelectedHoliday] = useState<{ id: string, name: string, date: string } | null>(null);

  // Helper to parse YYYY-MM-DD as local date to avoid timezone issues
  const parseLocalDate = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d);
  };

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
    const start = parseLocalDate(leave.startDate);
    const end = parseLocalDate(leave.endDate);
    // Reset hours for accurate comparison
    checkDate.setHours(0,0,0,0);
    start.setHours(0,0,0,0);
    end.setHours(0,0,0,0);
    
    const isActive = checkDate >= start && checkDate <= end;
    
    // Exclude weekends for wellness leaves
    if (isActive && leave.type === 'wellness') {
      const dayOfWeek = checkDate.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) return false;
    }
    
    return isActive;
  };

  const getLeaveColor = (type: Leave['type']) => {
    switch (type) {
      case 'vacation': return 'bg-blue-500';
      case 'sick': return 'bg-red-500';
      case 'personal': return 'bg-green-500';
      case 'wellness': return 'bg-purple-500';
      case 'birthday': return 'bg-pink-500';
      default: return 'bg-slate-500';
    }
  };

  const handleUserClick = (userId: string) => {
    const userLeaves = leaves.filter(l => l.userId === userId);
    if (userLeaves.length === 0) return;

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    // Sort leaves by start date
    const sortedLeaves = [...userLeaves].sort((a, b) => a.startDate.localeCompare(b.startDate));

    // Try to find the leave that matches the current view exactly (same start date)
    let currentIndex = sortedLeaves.findIndex(l => {
        const d = parseLocalDate(l.startDate);
        return d.getTime() === currentDate.getTime();
    });

    // If not found, try to find a leave in the current month view
    if (currentIndex === -1) {
         currentIndex = sortedLeaves.findIndex(l => {
            const d = parseLocalDate(l.startDate);
            return d.getFullYear() === currentDate.getFullYear() && d.getMonth() === currentDate.getMonth();
        });
    }

    // Determine the next leave to show (Cycle through them)
    let nextIndex = 0;
    if (currentIndex !== -1) {
        nextIndex = (currentIndex + 1) % sortedLeaves.length;
    } else {
        // If no leave is currently in view, find the first upcoming one
        const upcomingIndex = sortedLeaves.findIndex(l => parseLocalDate(l.endDate) >= now);
        nextIndex = upcomingIndex !== -1 ? upcomingIndex : sortedLeaves.length - 1;
    }

    setCurrentDate(parseLocalDate(sortedLeaves[nextIndex].startDate));
  };

  const getLeaveEmoji = (type: Leave['type']) => {
    switch (type) {
      case 'vacation': return '🏖️';
      case 'sick': return '🤒';
      case 'personal': return '🏠';
      case 'wellness': return '🧘';
      case 'birthday': return '🎂';
      default: return '📅';
    }
  };

  // Calculate rows for dynamic grid sizing
  const totalSlots = firstDay + days;
  const numRows = Math.ceil(totalSlots / 7);

  return (
    <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 h-auto w-full min-w-0">
      {/* Sidebar - Users List */}
      <div className="w-full lg:w-80 bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col overflow-hidden flex-shrink-0 min-w-0 h-fit sticky top-6">
        {/* Header with Mobile Actions */}
        <div className="p-4 lg:p-6 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Palmtree className="text-indigo-500" size={20} />
              Team
            </h2>
            <p className="text-xs text-slate-500 mt-1 hidden lg:block">Hover to highlight leaves</p>
          </div>
          
          {/* Mobile Actions */}
          <div className="flex gap-2 lg:hidden">
            <button
              onClick={onAddLeave}
              className="bg-indigo-600 text-white p-2 rounded-lg shadow-sm active:scale-95 transition-all"
              title="Post Leave"
            >
              <Plus size={18} />
            </button>
            {currentUserIsAdmin && (
              <button
                onClick={onAddHoliday}
                className="bg-white border border-slate-200 text-slate-600 p-2 rounded-lg active:scale-95 transition-all"
                title="Manage Holidays"
              >
                <CalendarPlus size={18} />
              </button>
            )}
          </div>
        </div>

        {/* User List - Vertical List */}
        <div className="flex-1 p-4 flex flex-col gap-2 overflow-y-auto max-h-48 lg:max-h-[600px] lg:overflow-y-auto lg:block lg:space-y-2 custom-scrollbar w-full">
          {users.map(user => {
            const userLeaves = leaves.filter(l => l.userId === user.id);
            const upcomingLeaves = userLeaves.filter(l => new Date(l.endDate) >= new Date());
            
            return (
              <div
                key={user.id}
                onClick={() => handleUserClick(user.id)}
                onMouseEnter={() => setHoveredUserId(user.id)}
                onMouseLeave={() => setHoveredUserId(null)}
                className={`p-2 lg:p-3 rounded-xl transition-all cursor-pointer border lg:min-w-0 flex-shrink-0 ${
                  hoveredUserId === user.id 
                    ? 'bg-indigo-50 border-indigo-200 shadow-sm scale-[1.02]' 
                    : 'bg-white border-transparent hover:bg-slate-50 hover:border-slate-100 border-slate-100 lg:border-transparent'
                }`}
              >
                <div className="flex items-center gap-2 lg:gap-3">
                  <img 
                    src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`} 
                    alt={user.name} 
                    className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-slate-100 object-cover" 
                    onError={(e) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`; }}
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-bold text-xs lg:text-sm truncate ${hoveredUserId === user.id ? 'text-indigo-700' : 'text-slate-900'}`}>
                      {user.name.split(' ')[0]}
                    </h3>
                    <p className="text-[10px] lg:text-xs text-slate-500 truncate">{user.role}</p>
                  </div>
                  {upcomingLeaves.length > 0 && (
                    <span className="px-1.5 py-0.5 bg-indigo-100 text-indigo-600 text-[9px] lg:text-[10px] font-bold rounded-full">
                      {upcomingLeaves.length}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Desktop Actions */}
        <div className="hidden lg:block p-4 border-t border-slate-100 space-y-2">
          <button
            onClick={onAddLeave}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-semibold transition-all shadow-lg shadow-indigo-200 active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <Plus size={18} />
            Post Leave
          </button>
          
          {currentUserIsAdmin && (
            <button
              onClick={onAddHoliday}
              className="w-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
            >
              <CalendarPlus size={18} />
              Manage Holidays
            </button>
          )}
        </div>
      </div>

      {/* Main - Calendar */}
      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col overflow-hidden min-w-0 h-fit">
        {/* Calendar Header */}
        <div className="p-4 lg:p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0 flex-shrink-0">
          <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-start">
            <button onClick={() => setViewMode(viewMode === 'calendar' ? 'months' : 'calendar')} className="text-2xl font-bold text-slate-900 hover:text-indigo-600 transition-colors flex items-center gap-2">
              {monthName} <span className="text-slate-400">{year}</span>
            </button>
            
            <div className="flex bg-slate-100 p-1 rounded-lg">
              <button 
                onClick={() => setDisplayMode('calendar')} 
                className={`p-1.5 rounded-md transition-all ${displayMode === 'calendar' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                title="Calendar View"
              >
                <LayoutGrid size={18} />
              </button>
              <button 
                onClick={() => setDisplayMode('list')} 
                className={`p-1.5 rounded-md transition-all ${displayMode === 'list' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                title="List View"
              >
                <List size={18} />
              </button>
            </div>
          </div>

          {displayMode === 'calendar' && (
          <div className={`flex gap-2 ${viewMode === 'months' ? 'invisible' : ''}`}>
            <button onClick={prevMonth} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors" >
              <ChevronLeft size={24} />
            </button>
            <button onClick={nextMonth} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors">
              <ChevronRight size={24} />
            </button>
          </div>
          )}
        </div>

        {/* Calendar Grid */}
        {displayMode === 'list' ? (
          <div className="flex-1 overflow-y-auto p-4 lg:p-6 animate-fade-in-up">
            {/* Mobile List View */}
            <div className="lg:hidden space-y-3">
              {[...leaves].sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()).map(leave => {
                const user = users.find(u => u.id === leave.userId);
                if (!user) return null;
                
                return (
                  <div 
                    key={leave.id} 
                    onClick={() => onLeaveClick(leave)}
                    className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col gap-3 active:scale-[0.98] transition-all"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <img 
                          src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`} 
                          alt={user.name} 
                          className="w-10 h-10 rounded-full bg-white object-cover shadow-sm" 
                          onError={(e) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`; }}
                        />
                        <div>
                          <h3 className="font-bold text-slate-900">{user.name}</h3>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-600 text-[10px] font-bold mt-0.5">
                            {getLeaveEmoji(leave.type)} <span className="capitalize">{leave.type}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-white p-2 rounded-lg border border-slate-100">
                        <span className="text-slate-400 block mb-0.5">From</span>
                        <span className="font-semibold text-slate-700">{new Date(leave.startDate).toLocaleDateString()}</span>
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-slate-100">
                        <span className="text-slate-400 block mb-0.5">To</span>
                        <span className="font-semibold text-slate-700">{new Date(leave.endDate).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {leave.reason && (
                      <div className="text-xs text-slate-500 bg-white p-2 rounded-lg border border-slate-100 italic">
                        "{leave.reason}"
                      </div>
                    )}
                  </div>
                );
              })}
              {leaves.length === 0 && (
                <div className="text-center py-12 text-slate-400">No leaves found.</div>
              )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    <th className="pb-3 pl-2">User</th>
                    <th className="pb-3">Type</th>
                    <th className="pb-3">Dates</th>
                    <th className="pb-3">Reason</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-slate-50">
                {[...leaves].sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()).map(leave => {
                  const user = users.find(u => u.id === leave.userId);
                  if (!user) return null;
                  const isCurrentUser = currentUserId === leave.userId;
                  
                  return (
                    <tr key={leave.id} className="group hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => onLeaveClick(leave)}>
                      <td className="py-3 pl-2">
                        <div className="flex items-center gap-3">
                           <img 
                            src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`} 
                            alt={user.name} 
                            className="w-8 h-8 rounded-full bg-slate-100 object-cover" 
                            onError={(e) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`; }}
                          />
                          <span className="font-medium text-slate-900">{user.name}</span>
                        </div>
                      </td>
                      <td className="py-3">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-medium">
                          {getLeaveEmoji(leave.type)} <span className="capitalize">{leave.type === 'sick' ? 'Sick Leave' : `${leave.type} Leave`}</span>
                        </span>
                      </td>
                      <td className="py-3 text-slate-600">
                        {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                      </td>
                      <td className="py-3 text-slate-500 max-w-xs truncate">
                        {leave.reason || <span className="italic text-slate-400">No reason provided</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {leaves.length === 0 && (
                <div className="text-center py-12 text-slate-400">No leaves found.</div>
            )}
            </div>
          </div>
        ) : viewMode === 'months' ? (
          <div className="flex-1 p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 overflow-y-auto animate-fade-in-up">
            {Array.from({ length: 12 }).map((_, i) => {
              const date = new Date(year, i, 1);
              const isCurrentMonth = i === new Date().getMonth() && year === new Date().getFullYear();
              return (
                <button
                  key={i}
                  onClick={() => { setCurrentDate(date); setViewMode('calendar'); }}
                  className={`p-4 sm:p-6 rounded-2xl text-base sm:text-lg font-bold transition-all ${isCurrentMonth ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-slate-50 text-slate-700 hover:bg-indigo-50 hover:text-indigo-600'}`}
                >
                  {date.toLocaleString('default', { month: 'long' })}
                </button>
              );
            })}
          </div>
        ) : (
        <div className="flex-1 p-0 lg:p-6 flex flex-col min-h-0 animate-fade-in-up w-full max-w-full min-w-0">
          <div className="grid grid-cols-7 gap-px lg:gap-4 mb-2 flex-shrink-0 w-full">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-xs lg:text-sm font-bold text-slate-400 uppercase tracking-wider">
                {day.slice(0, 3)}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-px lg:gap-4 flex-1 lg:min-h-0 w-full max-w-full pr-1" style={{ gridTemplateRows: `repeat(${numRows}, minmax(110px, 1fr))` }}>
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="" />
            ))}
            {Array.from({ length: days }).map((_, i) => {
              const day = i + 1;
              const dayLeaves = leaves.filter(l => isLeaveDay(day, l));
              const isHoveredUserOnLeave = hoveredUserId && dayLeaves.some(l => l.userId === hoveredUserId);
              const isToday = new Date().getDate() === day && new Date().getMonth() === currentDate.getMonth() && new Date().getFullYear() === currentDate.getFullYear();
              const holiday = holidays.find(h => parseLocalDate(h.date).getDate() === day && parseLocalDate(h.date).getMonth() === currentDate.getMonth() && parseLocalDate(h.date).getFullYear() === currentDate.getFullYear());

              return (
                <div 
                  key={day} 
                  className={`
                    p-0.5 lg:p-2 rounded-md lg:rounded-xl border transition-all duration-300 relative group flex flex-col overflow-hidden min-w-0 min-h-[80px] lg:min-h-[110px]
                    ${holiday ? 'bg-red-50 border-red-100' : isHoveredUserOnLeave 
                      ? 'bg-indigo-50 border-indigo-200 shadow-md scale-105 z-10' 
                      : isToday 
                        ? 'bg-white border-indigo-500 ring-1 ring-indigo-500/20' 
                        : 'bg-white border-slate-100 hover:border-slate-200'
                    }
                  `}
                >
                  <span className={`text-xs lg:text-sm font-bold ${isToday ? 'text-indigo-600' : 'text-slate-700'}`}>{day}</span>
                  
                  {holiday && (
                    <div className="mb-1 min-w-0 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setSelectedHoliday(holiday)}>
                      <div 
                        className="text-[10px] font-bold text-red-500 w-full truncate"
                        title={holiday.name}
                      >
                        {holiday.name}
                      </div>
                    </div>
                  )}

                  <div className="mt-1 space-y-1 overflow-y-auto custom-scrollbar flex-1">
                    {dayLeaves.map(leave => {
                      const user = users.find(u => u.id === leave.userId);
                      if (!user) return null;
                      const isHovered = hoveredUserId === leave.userId;
                      const isCurrentUser = currentUserId === leave.userId;
                      const isMorning = (leave as any).startTime?.startsWith('08') || (leave as any).startTime?.startsWith('8');
                      const isAfternoon = (leave as any).startTime?.startsWith('13');

                      return (
                        <div 
                          key={leave.id}
                          onClick={(e) => { e.stopPropagation(); onLeaveClick(leave); }}
                          className={`
                            text-[10px] px-2 py-1 rounded-md flex items-start justify-between gap-1 transition-all cursor-pointer min-w-0
                            ${isHovered ? 'opacity-100 font-bold shadow-sm' : hoveredUserId ? 'opacity-30' : 'opacity-100'}
                            ${isHovered ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}
                          `}
                          title={`${user.name} - ${leave.type}`}
                        >
                          <span className="flex items-center gap-1 w-full min-w-0">
                            <span className="shrink-0">{getLeaveEmoji(leave.type)}</span>
                            <span className="truncate">{user.name.split(' ')[0]}</span>
                            {isMorning && <span className="px-1 rounded bg-amber-200 text-amber-800 text-[8px] font-bold leading-none shrink-0 hidden lg:inline">AM</span>}
                            {isAfternoon && <span className="px-1 rounded bg-blue-200 text-blue-800 text-[8px] font-bold leading-none shrink-0 hidden lg:inline">PM</span>}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        )}
      </div>

      {/* Holiday Detail Modal */}
      {selectedHoliday && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={() => setSelectedHoliday(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm animate-scale-in overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 bg-red-50 border-b border-red-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-red-600 flex items-center gap-2">
                <CalendarPlus size={20} />
                Holiday Details
              </h3>
              <button 
                onClick={() => setSelectedHoliday(null)}
                className="p-1 text-red-400 hover:bg-red-100 rounded-full transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-6">
                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Holiday Name</h4>
                <p className="text-xl font-bold text-slate-900">{selectedHoliday.name}</p>
              </div>
              
              <div className="mb-6">
                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Date</h4>
                <p className="text-base font-medium text-slate-700 flex items-center gap-2">
                  <span className="bg-slate-100 p-1.5 rounded-md">📅</span>
                  {new Date(selectedHoliday.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>

              {currentUserIsAdmin && (
                <button
                  onClick={() => {
                    onDeleteHoliday(selectedHoliday.id);
                    setSelectedHoliday(null);
                  }}
                  className="w-full py-3 px-4 bg-white border border-red-200 text-red-600 font-bold rounded-xl hover:bg-red-50 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  <Trash2 size={18} />
                  Remove Holiday
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};