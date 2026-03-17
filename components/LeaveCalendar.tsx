import React, { useState } from 'react';
import { User, Leave, Holiday } from '../types';
import { ChevronLeft, ChevronRight, Plus, Palmtree, Trash2, CalendarPlus, List, LayoutGrid, X } from 'lucide-react';
import { formatDate } from './utils';

interface LeaveCalendarProps {
  users: User[];
  leaves: Leave[];
  holidays: Holiday[];
  currentUserId: string;
  currentUserIsAdmin?: boolean;
  onAddLeave: (date?: Date) => void;
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
    checkDate.setHours(0, 0, 0, 0);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

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
      <div className="w-full lg:w-80 bg-slate-200 rounded-3xl shadow-neo border-none flex flex-col overflow-hidden flex-shrink-0 min-w-0 h-fit lg:sticky lg:top-6">
        {/* Header with Mobile Actions */}
        <div className="p-4 lg:p-6 border-b border-slate-300/30 flex justify-between items-center bg-transparent">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3">
              <Palmtree className="text-indigo-600" size={24} />
              Team
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-1 hidden lg:block uppercase tracking-wider">Hover to highlight</p>
          </div>

          {/* Mobile Actions */}
          <div className="flex gap-3 lg:hidden">
            <button
              onClick={() => onAddLeave()}
              className="bg-slate-200 text-indigo-600 p-3 rounded-xl shadow-neo active:shadow-neo-inner transition-all"
              title="Post Leave"
            >
              <Plus size={20} />
            </button>
            {currentUserIsAdmin && (
              <button
                onClick={onAddHoliday}
                className="bg-slate-200 text-slate-600 p-3 rounded-xl shadow-neo hover:shadow-neo-inner active:shadow-neo-inner transition-all"
                title="Manage Holidays"
              >
                <CalendarPlus size={20} />
              </button>
            )}
          </div>
        </div>

        {/* User List - Vertical List */}
        <div className="flex-1 p-5 flex flex-col gap-3 overflow-y-auto max-h-48 lg:max-h-[600px] lg:overflow-y-auto lg:block lg:space-y-3 custom-scrollbar w-full bg-transparent">
          {users.map(user => {
            const userLeaves = leaves.filter(l => l.userId === user.id);
            const upcomingLeaves = userLeaves.filter(l => new Date(l.endDate) >= new Date());

            return (
              <div
                key={user.id}
                onClick={() => handleUserClick(user.id)}
                onMouseEnter={() => setHoveredUserId(user.id)}
                onMouseLeave={() => setHoveredUserId(null)}
                className={`p-3 lg:p-4 rounded-xl transition-all cursor-pointer border-none lg:min-w-0 flex-shrink-0 ${hoveredUserId === user.id
                    ? 'bg-slate-200 shadow-neo-sm-inner border-transparent'
                    : 'bg-slate-200 shadow-neo hover:shadow-neo-inner border-transparent'
                  }`}
              >
                <div className="flex items-center gap-3 lg:gap-4">
                  <img
                    src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`}
                    alt={user.name}
                    className="w-10 h-10 lg:w-12 lg:h-12 rounded-full shadow-neo-sm border-2 border-slate-200 object-cover"
                    onError={(e) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`; }}
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-bold text-sm lg:text-base truncate ${hoveredUserId === user.id ? 'text-indigo-600' : 'text-slate-900'}`}>
                      {user.name.split(' ')[0]}
                    </h3>
                    <p className="text-[11px] lg:text-xs text-slate-500 font-medium truncate">{user.role}</p>
                  </div>
                  {upcomingLeaves.length > 0 && (
                    <span className="px-2 py-1 bg-slate-200 shadow-neo-sm-inner text-indigo-600 text-[10px] lg:text-xs font-bold rounded-full">
                      {upcomingLeaves.length}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop Actions */}
        <div className="hidden lg:block p-6 border-t border-slate-300/30 space-y-4 bg-transparent">
          <button
            onClick={() => onAddLeave()}
            className="w-full text-white py-4 rounded-xl font-bold transition-all bg-gradient-to-r from-indigo-500 to-indigo-600 shadow-[4px_4px_10px_rgba(79,70,229,0.3),-4px_-4px_10px_rgba(255,255,255,0.8)] active:shadow-[inset_4px_4px_10px_rgba(0,0,0,0.1),inset_-4px_-4px_10px_rgba(255,255,255,0.2)] hover:from-indigo-600 hover:to-indigo-700 active:scale-[0.98] flex items-center justify-center gap-2 text-base"
          >
            <Plus size={20} />
            Post Leave
          </button>

          {currentUserIsAdmin && (
            <button
              onClick={onAddHoliday}
              className="w-full bg-slate-200 shadow-neo hover:shadow-neo-inner text-slate-700 py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 text-base"
            >
              <CalendarPlus size={20} />
              Manage Holidays
            </button>
          )}
        </div>
      </div>

      {/* Main - Calendar */}
      <div className="flex-1 bg-slate-200 rounded-3xl shadow-neo border-none flex flex-col overflow-hidden min-w-0 h-fit">
        {/* Calendar Header */}
        <div className="p-4 lg:p-6 border-b border-slate-300/30 flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0 flex-shrink-0 bg-transparent">
          <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-start">
            <button onClick={() => setViewMode(viewMode === 'calendar' ? 'months' : 'calendar')} className="text-2xl font-bold text-slate-900 hover:text-indigo-600 transition-colors flex items-center gap-2">
              {monthName} <span className="text-indigo-600/70">{year}</span>
            </button>

            <div className="flex bg-slate-200 shadow-neo-sm-inner p-1.5 rounded-xl gap-1">
              <button
                onClick={() => setDisplayMode('calendar')}
                className={`p-2 rounded-lg transition-all font-bold ${displayMode === 'calendar' ? 'bg-slate-200 shadow-neo text-indigo-600 scale-105' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
                title="Calendar View"
              >
                <LayoutGrid size={18} />
              </button>
              <button
                onClick={() => setDisplayMode('list')}
                className={`p-2 rounded-lg transition-all font-bold ${displayMode === 'list' ? 'bg-slate-200 shadow-neo text-indigo-600 scale-105' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
                title="List View"
              >
                <List size={18} />
              </button>
            </div>
          </div>

          {displayMode === 'calendar' && (
            <div className={`flex gap-3 ${viewMode === 'months' ? 'invisible' : ''}`}>
              <button onClick={prevMonth} className="p-3 bg-slate-200 shadow-neo hover:shadow-neo-inner rounded-xl text-slate-600 transition-all font-bold" >
                <ChevronLeft size={24} />
              </button>
              <button onClick={nextMonth} className="p-3 bg-slate-200 shadow-neo hover:shadow-neo-inner rounded-xl text-slate-600 transition-all font-bold">
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
                    className="bg-slate-200 p-5 rounded-2xl shadow-neo border-none flex flex-col gap-4 active:scale-[0.98] transition-all"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-4">
                        <img
                          src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`}
                          alt={user.name}
                          className="w-12 h-12 rounded-full shadow-neo border-2 border-slate-200 object-cover"
                          onError={(e) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`; }}
                        />
                        <div>
                          <h3 className="font-bold text-lg text-slate-900">{user.name}</h3>
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-200 shadow-neo-sm-inner text-indigo-600 text-xs font-bold mt-1">
                            {getLeaveEmoji(leave.type)} <span className="capitalize">{leave.type}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="bg-slate-200 p-3 rounded-xl shadow-neo-sm-inner border-none">
                        <span className="text-slate-500 font-bold uppercase tracking-wider block mb-1">From</span>
                        <span className="font-bold text-slate-700 text-sm">{formatDate(leave.startDate)}</span>
                      </div>
                      <div className="bg-slate-200 p-3 rounded-xl shadow-neo-sm-inner border-none">
                        <span className="text-slate-500 font-bold uppercase tracking-wider block mb-1">To</span>
                        <span className="font-bold text-slate-700 text-sm">{formatDate(leave.endDate)}</span>
                      </div>
                    </div>

                    {leave.reason && (
                      <div className="text-sm text-slate-600 bg-slate-200 p-4 rounded-xl shadow-neo-sm-inner border-none font-medium italic">
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
                  <tr className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-300/30">
                    <th className="pb-4 pl-4">User</th>
                    <th className="pb-4">Type</th>
                    <th className="pb-4">Dates</th>
                    <th className="pb-4">Reason</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {[...leaves].sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()).map(leave => {
                    const user = users.find(u => u.id === leave.userId);
                    if (!user) return null;
                    const isCurrentUser = currentUserId === leave.userId;

                    return (
                      <tr key={leave.id} className="group hover:bg-slate-200/50 transition-colors cursor-pointer" onClick={() => onLeaveClick(leave)}>
                        <td className="py-4 pl-4 border-b border-slate-300/20">
                          <div className="flex items-center gap-4">
                            <img
                              src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`}
                              alt={user.name}
                              className="w-10 h-10 rounded-full shadow-neo border-2 border-slate-200 object-cover"
                              onError={(e) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`; }}
                            />
                            <span className="font-bold text-slate-900">{user.name}</span>
                          </div>
                        </td>
                        <td className="py-4 border-b border-slate-300/20">
                          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-200 shadow-neo-sm-inner text-indigo-600 text-xs font-bold">
                            {getLeaveEmoji(leave.type)} <span className="capitalize">{leave.type === 'sick' ? 'Sick Leave' : `${leave.type} Leave`}</span>
                          </span>
                        </td>
                        <td className="py-4 font-bold text-slate-700 border-b border-slate-300/20">
                          {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                        </td>
                        <td className="py-4 font-medium text-slate-500 max-w-xs truncate border-b border-slate-300/20">
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
                  className={`p-6 sm:p-8 rounded-3xl text-lg sm:text-xl font-bold transition-all ${isCurrentMonth ? 'bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-[6px_6px_15px_rgba(79,70,229,0.4),-6px_-6px_15px_rgba(255,255,255,0.8)]' : 'bg-slate-200 text-slate-600 hover:text-indigo-600 shadow-neo hover:shadow-neo-inner'}`}
                >
                  {date.toLocaleString('default', { month: 'long' })}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="flex-1 p-2 lg:p-6 flex flex-col min-h-0 animate-fade-in-up w-full max-w-full min-w-0 bg-transparent">
            <div className="grid grid-cols-7 gap-1 lg:gap-4 mb-3 flex-shrink-0 w-full">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-xs lg:text-sm font-bold text-slate-500 uppercase tracking-widest bg-slate-200/50 py-2 rounded-lg">
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
                    onClick={() => onAddLeave(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))}
                    className={`
                    cursor-pointer p-1 lg:p-3 rounded-xl lg:rounded-2xl transition-all duration-300 relative group flex flex-col overflow-hidden min-w-0 min-h-[90px] lg:min-h-[120px] 
                    ${holiday ? 'bg-[#ffedec] shadow-neo-sm-inner border-none hover:shadow-neo' : isHoveredUserOnLeave
                        ? 'bg-indigo-50 shadow-neo-inner scale-[1.03] z-10 border-none'
                        : isToday
                          ? 'bg-slate-200 shadow-neo-sm border-2 border-indigo-400 ring-4 ring-indigo-400/20'
                          : 'bg-slate-200 shadow-neo-sm-inner hover:shadow-neo border-none'
                      }
                  `}
                  >
                    <span className={`text-sm lg:text-base font-bold pl-1 ${isToday ? 'text-indigo-600' : 'text-slate-500'}`}>{day}</span>

                    {holiday && (
                      <div className="mb-2 mt-1 min-w-0 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setSelectedHoliday(holiday)}>
                        <div
                          className="text-[10px] lg:text-xs font-bold text-red-500 w-full truncate bg-white/50 px-2 py-1 rounded border border-red-100"
                          title={holiday.name}
                        >
                          {holiday.name}
                        </div>
                      </div>
                    )}

                    <div className="mt-1 space-y-1.5 overflow-y-auto custom-scrollbar flex-1">
                      {dayLeaves.map(leave => {
                        const user = users.find(u => u.id === leave.userId);
                        if (!user) return null;
                        const isHovered = hoveredUserId === leave.userId;
                        const isCurrentUser = currentUserId === leave.userId;
                        const isMorning = leave.startTime?.startsWith('08') || leave.startTime?.startsWith('8');
                        const isAfternoon = leave.startTime?.startsWith('13');

                        return (
                          <div
                            key={leave.id}
                            onClick={(e) => { e.stopPropagation(); onLeaveClick(leave); }}
                            className={`
                            text-[10px] lg:text-xs font-bold px-2 py-1.5 rounded-lg flex items-start justify-between gap-1 transition-all cursor-pointer min-w-0
                            ${isHovered ? 'opacity-100 shadow-md scale-105 z-10' : hoveredUserId ? 'opacity-30' : 'opacity-100 shadow-sm border border-black/5'}
                            ${isHovered ? 'bg-indigo-600 text-white' : 'bg-white text-slate-700'}
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in" onClick={() => setSelectedHoliday(null)}>
          <div className="bg-slate-200 rounded-3xl shadow-neo border-none w-full max-w-sm animate-scale-in overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-300/30 flex items-center justify-between bg-transparent">
              <h3 className="text-xl font-bold text-red-500 flex items-center gap-3">
                <CalendarPlus size={20} />
                Holiday Details
              </h3>
              <button
                onClick={() => setSelectedHoliday(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl transition-colors bg-slate-200 shadow-neo hover:shadow-neo-inner"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-8">
              <div className="mb-8">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Holiday Name</h4>
                <p className="text-xl font-bold text-slate-800 leading-tight">{selectedHoliday.name}</p>
              </div>

              <div className="mb-8">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Date</h4>
                <p className="text-base font-bold text-slate-700 flex items-center gap-3 bg-slate-200 p-4 rounded-2xl shadow-neo-sm-inner">
                  <span className="bg-slate-200 shadow-neo p-2 rounded-xl text-lg">📅</span>
                  {new Date(selectedHoliday.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>

              {currentUserIsAdmin && (
                <button
                  onClick={() => {
                    onDeleteHoliday(selectedHoliday.id);
                    setSelectedHoliday(null);
                  }}
                  className="w-full py-4 px-4 bg-slate-200 text-red-500 font-bold rounded-xl shadow-neo hover:shadow-neo-inner hover:text-red-600 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  <Trash2 size={20} />
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