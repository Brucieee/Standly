import React, { useState } from 'react';
import { Sparkles, Loader2, FileText, CalendarRange } from 'lucide-react';
import Markdown from 'react-markdown';
import { generateWeeklySummary } from '../services/geminiService';
import { Standup, User, Deadline } from '../types';

interface WeeklySummaryWidgetProps {
  standups: Standup[];
  users: User[];
  deadlines: Deadline[];
}

export const WeeklySummaryWidget: React.FC<WeeklySummaryWidgetProps> = ({ standups, users, deadlines }) => {
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date();
    return now.toISOString().split('T')[0];
  });

  const handleGenerate = async () => {
    setLoading(true);
    
    // Determine the week based on selectedDate
    const referenceDate = new Date(selectedDate);
    // Ensure we are working with local time interpretation or UTC? 
    // Creating date from "YYYY-MM-DD" usually defaults to UTC in some parsers, but "YYYY-MM-DDT00:00" is local.
    // Let's safe-parse by splitting
    const [y, m, d] = selectedDate.split('-').map(Number);
    referenceDate.setFullYear(y, m - 1, d);
    referenceDate.setHours(12, 0, 0, 0); // Set to noon to avoid timezone rollover issues with day calculation

    const startOfWeek = new Date(referenceDate);
    const day = referenceDate.getDay(); // 0 (Sun) - 6 (Sat)
    const diff = referenceDate.getDate() - day;
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0); // Start of Sunday

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999); // End of Saturday

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

    // Filter relevant deadlines (e.g., upcoming within this week or next)
    const relevantDeadlines = deadlines.map(d => ({
        title: d.title,
        description: d.description,
        date: d.dueDate,
        status: d.status || 'Pending'
    }));

    const result = await generateWeeklySummary(relevantStandups, relevantDeadlines);
    setSummary(result);
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

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
      {/* Header Section */}
      <div className="p-6 bg-gradient-to-r from-indigo-50 to-white border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
           <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
             <Sparkles className="text-indigo-500" size={20} />
             Weekly AI Summary
           </h2>
           <p className="text-slate-500 text-sm mt-1">
             Summarizing team progress for {getWeekLabel()}
           </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <input 
            type="date" 
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-600 shadow-sm"
          />
          <button 
            onClick={handleGenerate}
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-md shadow-indigo-100 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
            {loading ? 'Analyzing...' : 'Generate Report'}
          </button>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6 flex-1 min-h-[300px] bg-slate-50/50">
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
             <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
               <CalendarRange size={32} className="text-slate-300" />
             </div>
             <p className="font-medium text-slate-500">No report generated yet</p>
             <p className="text-xs max-w-xs text-center mt-2">
               Click "Generate Report" to analyze standups from the current week.
             </p>
           </div>
        )}
      </div>
    </div>
  );
};
