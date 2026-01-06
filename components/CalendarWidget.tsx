import React from 'react';
import { Standup } from '../types';

interface CalendarWidgetProps {
  standups: Standup[];
  userId: string;
  onDateClick: (date: string) => void;
}

export const CalendarWidget: React.FC<CalendarWidgetProps> = ({ standups, userId, onDateClick }) => {
  // Generate last 14 days
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    return d;
  });

  const userStandups = standups.filter(s => s.userId === userId);

  const getStatus = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const hasStandup = userStandups.some(s => s.date.startsWith(dateStr));
    const isToday = dateStr === new Date().toISOString().split('T')[0];
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;

    if (hasStandup) return 'present';
    if (isWeekend) return 'weekend';
    if (!hasStandup && !isToday && !isWeekend) return 'missed';
    return 'pending';
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <h3 className="text-lg font-bold text-slate-800 mb-4">Activity Streak</h3>
      <div className="flex justify-between items-end h-24">
        {days.map((date, idx) => {
          const status = getStatus(date);
          const dateStr = date.toISOString().split('T')[0];
          let bgClass = 'bg-slate-100';
          if (status === 'present') bgClass = 'bg-green-500';
          if (status === 'missed') bgClass = 'bg-red-400 cursor-pointer hover:bg-red-500';
          if (status === 'weekend') bgClass = 'bg-slate-200';
          if (status === 'pending') bgClass = 'bg-slate-100 border border-slate-200';
          
          const isInteractable = status === 'missed' || status === 'present' || status === 'pending';

          // Base height based on status
          const baseHeight = status === 'present' ? 'h-8' : 'h-2';

          return (
            <div 
              key={idx} 
              onClick={() => isInteractable && onDateClick(dateStr)}
              className="flex flex-col items-center justify-end h-full group relative cursor-pointer"
              style={{ width: '20px' }}
            >
              <div className="relative flex flex-col items-center justify-end w-full mb-2">
                {/* The Bar */}
                <div 
                  className={`w-3 md:w-4 rounded-full transition-all duration-300 ease-out ${bgClass} ${baseHeight} group-hover:scale-y-125 origin-bottom`}
                ></div>
                
                {/* Tooltip - positioned absolutely above the bar area */}
                <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-xs py-1 px-2 rounded whitespace-nowrap z-50 pointer-events-none shadow-xl">
                  {date.toLocaleDateString()}
                  {status === 'missed' && ' - Missed'}
                </div>
              </div>
              
              <span className="text-[10px] text-slate-400 font-medium">
                {date.toLocaleDateString('en-US', { weekday: 'narrow' })}
              </span>
            </div>
          );
        })}
      </div>
      <div className="mt-6 flex space-x-4 text-xs text-slate-500 justify-center">
        <div className="flex items-center"><div className="w-2 h-2 rounded-full bg-green-500 mr-1"></div> Posted</div>
        <div className="flex items-center"><div className="w-2 h-2 rounded-full bg-red-400 mr-1"></div> Missed</div>
        <div className="flex items-center"><div className="w-2 h-2 rounded-full bg-slate-200 mr-1"></div> Weekend</div>
      </div>
    </div>
  );
};