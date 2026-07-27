import React, { useState } from 'react';
import { Sparkles, Loader2, FileText, CalendarRange, X } from 'lucide-react';
import Markdown from 'react-markdown';
import { generateWeeklySummary, generateMonthlySummary } from '../services/geminiService';
import { Standup, User, Deadline } from '../types';

interface WeeklySummaryWidgetProps {
  standups: Standup[];
  users: User[];
  deadlines: Deadline[];
  onClose?: () => void;
}

export const WeeklySummaryWidget: React.FC<WeeklySummaryWidgetProps> = ({ standups, users, deadlines, onClose }) => {
  const [reportType, setReportType] = useState<'weekly' | 'monthly'>('weekly');
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date();
    return now.toISOString().split('T')[0];
  });
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  });

  const handleGenerate = async () => {
    setLoading(true);

    if (reportType === 'weekly') {
      const [y, m, d] = selectedDate.split('-').map(Number);
      const referenceDate = new Date(y, m - 1, d, 12, 0, 0, 0);

      const startOfWeek = new Date(referenceDate);
      const day = referenceDate.getDay();
      const diff = referenceDate.getDate() - day;
      startOfWeek.setDate(diff);
      startOfWeek.setHours(0, 0, 0, 0);

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);

      const relevantStandups = standups
        .filter(s => {
          const standupDate = new Date(s.date);
          return standupDate >= startOfWeek && standupDate <= endOfWeek;
        })
        .map(s => {
          const user = users.find(u => u.id === s.userId);
          return {
            name: user ? user.name : 'Unknown',
            date: s.date,
            yesterday: s.yesterday,
            today: s.today,
            blockers: s.blockers
          };
        });

      const relevantDeadlines = deadlines.map(d => ({
        title: d.title,
        description: d.description,
        date: d.dueDate,
        status: d.status || 'Pending'
      }));

      const result = await generateWeeklySummary(relevantStandups, relevantDeadlines);
      setSummary(result);
    } else {
      // Monthly report logic
      const [year, month] = selectedMonth.split('-').map(Number);
      const startOfMonth = new Date(year, month - 1, 1, 0, 0, 0, 0);
      const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

      const relevantStandups = standups
        .filter(s => {
          const standupDate = new Date(s.date);
          return standupDate >= startOfMonth && standupDate <= endOfMonth;
        })
        .map(s => {
          const user = users.find(u => u.id === s.userId);
          return {
            name: user ? user.name : 'Unknown',
            date: s.date,
            yesterday: s.yesterday,
            today: s.today,
            blockers: s.blockers
          };
        });

      const relevantDeadlines = deadlines
        .filter(d => {
          const deadlineDate = new Date(d.dueDate);
          return deadlineDate >= startOfMonth && deadlineDate <= endOfMonth;
        })
        .map(d => ({
          title: d.title,
          description: d.description,
          date: d.dueDate,
          status: d.status || 'Pending'
        }));

      const monthLabel = getMonthLabel();
      const result = await generateMonthlySummary(relevantStandups, relevantDeadlines, monthLabel);
      setSummary(result);
    }

    setLoading(false);
  };

  const getWeekLabel = () => {
    if (!selectedDate) return 'this week';
    const [y, m, d] = selectedDate.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    const day = date.getDay();
    const startDiff = date.getDate() - day;
    const startOfWeek = new Date(date);
    startOfWeek.setDate(startDiff);
    
    return `the week of ${startOfWeek.toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}`;
  };

  const getMonthLabel = () => {
    if (!selectedMonth) return 'this month';
    const [year, month] = selectedMonth.split('-').map(Number);
    const date = new Date(year, month - 1, 1);
    return date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  };

  return (
    <div className="bg-slate-200 rounded-3xl shadow-neo border-none overflow-hidden flex flex-col max-h-[90vh]">
      {/* Header Section */}
      <div className="p-6 border-b border-slate-300/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-transparent shrink-0">
        <div className="flex-1">
           <div className="flex justify-between items-start w-full">
             <div className="flex flex-wrap items-center gap-3">
               <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                 <Sparkles className="text-indigo-600" size={24} />
                 {reportType === 'weekly' ? 'Weekly AI Summary' : 'Monthly AI Summary'}
               </h2>
               
               {/* Mode Switcher */}
               <div className="flex bg-slate-300/60 p-1 rounded-xl shadow-neo-sm-inner">
                 <button
                   onClick={() => { setReportType('weekly'); setSummary(null); }}
                   className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                     reportType === 'weekly' 
                       ? 'bg-indigo-600 text-white shadow-neo-sm' 
                       : 'text-slate-600 hover:text-slate-900'
                   }`}
                 >
                   Weekly
                 </button>
                 <button
                   onClick={() => { setReportType('monthly'); setSummary(null); }}
                   className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                     reportType === 'monthly' 
                       ? 'bg-indigo-600 text-white shadow-neo-sm' 
                       : 'text-slate-600 hover:text-slate-900'
                   }`}
                 >
                   Monthly
                 </button>
               </div>
             </div>
             {onClose && (
               <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors sm:hidden">
                 <X size={20} />
               </button>
             )}
           </div>
           <p className="text-slate-500 text-sm mt-1">
             Summarizing team progress for {reportType === 'weekly' ? getWeekLabel() : getMonthLabel()}
           </p>
        </div>
        <div className="flex items-center gap-4 w-full sm:w-auto">
          {reportType === 'weekly' ? (
            <input 
              type="date" 
              value={selectedDate}
              onChange={(e) => { setSelectedDate(e.target.value); setSummary(null); }}
              className="px-4 py-3 rounded-xl border-none shadow-neo-sm-inner bg-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:shadow-neo text-slate-600 transition-all font-medium"
            />
          ) : (
            <input 
              type="month" 
              value={selectedMonth}
              onChange={(e) => { setSelectedMonth(e.target.value); setSummary(null); }}
              className="px-4 py-3 rounded-xl border-none shadow-neo-sm-inner bg-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:shadow-neo text-slate-600 transition-all font-medium"
            />
          )}
          <button 
            onClick={handleGenerate}
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-xl text-sm font-bold transition-all shadow-neo active:scale-[0.98] flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none whitespace-nowrap"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
            {loading ? 'Analyzing...' : 'Generate Report'}
          </button>
          
          {onClose && (
             <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors hidden sm:block ml-2">
               <X size={24} />
             </button>
          )}
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6 flex-1 min-h-[300px] bg-transparent overflow-y-auto">
        {summary ? (
          <div className="prose prose-sm max-w-none text-slate-700">
             <Markdown 
               components={{
                 // Remove generic h1/h2 to avoid repetition if AI generates titles
                 h1: ({node, ...props}) => <h3 className="text-lg font-bold text-indigo-900 mt-0 mb-4 pb-2 border-b border-indigo-100" {...props} />,
                 h2: ({node, ...props}) => <h4 className="text-base font-bold text-slate-800 mt-6 mb-3 flex items-center gap-2" {...props} />,
                 h3: ({node, ...props}) => <h5 className="text-sm font-bold text-slate-700 mt-4 mb-2" {...props} />,
                 p: ({node, ...props}) => <p className="mb-3 text-slate-600 leading-relaxed" {...props} />,
                 ul: ({node, ...props}) => <ul className="space-y-2 mb-4 bg-white p-4 rounded-xl border border-slate-100 shadow-sm" {...props} />,
                 li: ({node, ...props}) => (
                   <li className="flex items-start gap-2 text-slate-700" {...props}>
                     <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0" />
                     <span>{props.children}</span>
                   </li>
                 ),
                 strong: ({node, ...props}) => <span className="font-semibold text-slate-900" {...props} />,
               }}
             >
               {summary}
             </Markdown>
          </div>
        ) : (
           <div className="h-full flex flex-col items-center justify-center text-slate-400 py-12">
             <div className="w-20 h-20 bg-slate-200 shadow-neo rounded-full flex items-center justify-center mb-6">
               <CalendarRange size={32} className="text-indigo-400" />
             </div>
             <p className="font-bold text-slate-500">No report generated yet</p>
             <p className="text-xs max-w-xs text-center mt-2">
               {reportType === 'weekly' 
                 ? 'Click "Generate Report" to analyze standups from the selected week.' 
                 : 'Click "Generate Report" to analyze standups from the selected month.'}
             </p>
           </div>
        )}
      </div>
    </div>
  );
};
