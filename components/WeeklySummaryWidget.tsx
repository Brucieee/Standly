import React, { useState } from 'react';
import { Sparkles, Loader2, FileText } from 'lucide-react';
import { generateWeeklySummary } from '../services/geminiService';
import { Standup, User } from '../types';
import ReactMarkdown from 'react-markdown'; // Assuming we might want markdown, but simple text is safer for now. We'll use whitespace-pre-line.

interface WeeklySummaryWidgetProps {
  standups: Standup[];
  users: User[];
}

export const WeeklySummaryWidget: React.FC<WeeklySummaryWidgetProps> = ({ standups, users }) => {
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    
    // Filter for current week (last 7 days for simplicity)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const relevantStandups = standups
      .filter(s => new Date(s.date) >= oneWeekAgo)
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

    const result = await generateWeeklySummary(relevantStandups);
    setSummary(result);
    setLoading(false);
  };

  return (
    <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl shadow-lg p-6 text-white relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div>
             <h2 className="text-xl font-bold flex items-center gap-2">
               <Sparkles className="text-yellow-300" size={24} />
               Weekly AI Summary
             </h2>
             <p className="text-indigo-200 text-sm mt-1">Get a quick overview of the team's progress.</p>
          </div>
          <button 
            onClick={handleGenerate}
            disabled={loading}
            className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all backdrop-blur-md border border-white/20 flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
            {loading ? 'Analyzing...' : 'Generate Report'}
          </button>
        </div>

        {summary && (
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 animate-fade-in text-sm leading-relaxed text-indigo-50 max-h-60 overflow-y-auto custom-scrollbar">
             <div className="whitespace-pre-line">{summary}</div>
          </div>
        )}
        
        {!summary && !loading && (
           <div className="text-center py-6 text-indigo-200 text-sm border-2 border-dashed border-indigo-400/30 rounded-xl">
             Hit generate to analyze {standups.length} standups from this week.
           </div>
        )}
      </div>
    </div>
  );
};