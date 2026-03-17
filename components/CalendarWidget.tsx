import React from 'react';
import { Standup } from '../types';

interface CalendarWidgetProps {
  standups: Standup[];
  userId: string;
  onDateClick: (date: string) => void;
}

export const CalendarWidget: React.FC<CalendarWidgetProps> = ({ standups, userId, onDateClick }) => {
  // Helper to manually format YYYY-MM-DD from a local Date object
  // This avoids timezone issues completely by using the browser's local interpretation
  const formatYMD = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  // Generate current week (Sunday to Saturday) based on local time
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize to start of day
  
  const currentDay = today.getDay(); // 0 (Sun) to 6 (Sat)
  const diff = today.getDate() - currentDay; 
  
  const startOfWeek = new Date(today);
  startOfWeek.setDate(diff); // Set to Sunday of this week

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(d.getDate() + i);
    return d;
  });

  const userStandups = standups.filter(s => s.userId === userId);

  const getStatus = (date: Date) => {
    const dateStr = formatYMD(date);
    const hasStandup = userStandups.some(s => s.date.startsWith(dateStr));
    
    const todayStr = formatYMD(new Date());
    const isToday = dateStr === todayStr;
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    
    // Check if date is strictly in the future (tomorrow or later)
    // We compare strings or timestamps. Since 'date' is normalized to 00:00:00
    // and 'today' is normalized to 00:00:00, simple comparison works.
    const isFuture = date > today;

    if (hasStandup) return 'present';
    if (isFuture) return 'future';
    if (isWeekend) return 'weekend';
    if (!hasStandup && !isToday && !isWeekend) return 'missed';
    return 'pending'; // For today if no standup yet
  };

  return (
    <div className="bg-slate-200 p-6 rounded-3xl border-none shadow-neo">
      <h3 className="text-lg font-bold text-slate-600 mb-4">Activity Streak</h3>
      <div className="flex justify-between items-end h-24">
        {days.map((date, idx) => {
          const status = getStatus(date);
          const dateStr = formatYMD(date);
          
          let bgClass = 'bg-slate-200 shadow-neo-sm-inner';
          if (status === 'present') bgClass = 'bg-green-400 shadow-[inset_2px_2px_5px_rgba(0,0,0,0.1),inset_-2px_-2px_5px_rgba(255,255,255,0.3)]';
          if (status === 'missed') bgClass = 'bg-red-400 cursor-pointer shadow-[2px_2px_5px_rgba(239,68,68,0.4),-2px_-2px_5px_rgba(255,255,255,0.8)] hover:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.1),inset_-2px_-2px_5px_rgba(255,255,255,0.3)]';
          if (status === 'weekend') bgClass = 'bg-slate-200 shadow-neo-sm-inner opacity-70';
          if (status === 'pending') bgClass = 'bg-slate-200 shadow-neo-sm-inner';
          if (status === 'future') bgClass = 'bg-slate-200 opacity-30 shadow-neo-sm-inner';
          
          const isInteractable = (status === 'missed' || status === 'present' || status === 'pending' || status === 'weekend');

          // Base height based on status
          const baseHeight = status === 'present' ? 'h-8' : 'h-2';

          return (
            <div 
              key={idx} 
              onClick={() => isInteractable && onDateClick(dateStr)}
              className={`flex flex-col items-center justify-end h-full group relative ${isInteractable ? 'cursor-pointer' : 'cursor-default'}`}
              style={{ width: '14%' }}
            >
              <div className="relative flex flex-col items-center justify-end w-full mb-2">
                {/* The Bar */}
                <div 
                  className={`w-3 md:w-4 rounded-full transition-all duration-300 ease-out ${bgClass} ${baseHeight} ${isInteractable ? 'group-hover:scale-y-125' : ''} origin-bottom`}
                ></div>
                
                {/* Tooltip */}
                {status !== 'future' && (
                  <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-700 text-white text-xs py-1 px-2 rounded-xl whitespace-nowrap z-50 pointer-events-none shadow-neo">
                    {date.toLocaleDateString()}
                    {status === 'missed' && ' - Missed'}
                    {status === 'present' && ' - Posted'}
                  </div>
                )}
              </div>
              
              <span className={`text-[10px] font-medium ${date.getDate() === new Date().getDate() ? 'text-indigo-500 font-bold' : 'text-slate-400'}`}>
                {date.toLocaleDateString('en-US', { weekday: 'narrow' })}
              </span>
            </div>
          );
        })}
      </div>
      <div className="mt-6 flex space-x-4 text-xs text-slate-500 justify-center">
        <div className="flex items-center"><div className="w-2 h-2 rounded-full bg-green-400 mr-1 shadow-sm"></div> Posted</div>
        <div className="flex items-center"><div className="w-2 h-2 rounded-full bg-red-400 mr-1 shadow-sm"></div> Missed</div>
        <div className="flex items-center"><div className="w-2 h-2 rounded-full bg-slate-300 mr-1 shadow-inner"></div> Weekend</div>
      </div>
    </div>
  );
};