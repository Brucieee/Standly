import React, { useState } from 'react';
import { Standup, Deadline, User } from '../types';
import { Timeline } from './timeline';

interface HistoryProps {
  standups: Standup[];
  deadlines: Deadline[];
  users: User[];
}

export const History: React.FC<HistoryProps> = ({ standups, deadlines, users }) => {
  const [activeTab, setActiveTab] = useState<'standups' | 'deadlines'>('standups');

  const getUserName = (id: string) => users.find(u => u.id === id)?.name || 'Unknown';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">History & Logs</h1>
          <p className="text-slate-500">View past activities and records.</p>
        </div>
        
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('standups')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'standups' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Standups
          </button>
          <button
            onClick={() => setActiveTab('deadlines')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'deadlines' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Deadlines
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {activeTab === 'standups' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 font-semibold text-slate-700">Date</th>
                  <th className="px-6 py-4 font-semibold text-slate-700">User</th>
                  <th className="px-6 py-4 font-semibold text-slate-700">Yesterday</th>
                  <th className="px-6 py-4 font-semibold text-slate-700">Today</th>
                  <th className="px-6 py-4 font-semibold text-slate-700">Blockers</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {standups.map((standup) => (
                  <tr key={standup.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-slate-600 whitespace-nowrap">
                      {new Date(standup.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs font-bold">
                          {getUserName(standup.userId)[0]}
                        </div>
                        <span className="font-medium text-slate-900">{getUserName(standup.userId)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 max-w-xs truncate" title={standup.yesterday}>{standup.yesterday}</td>
                    <td className="px-6 py-4 text-slate-600 max-w-xs truncate" title={standup.today}>{standup.today}</td>
                    <td className="px-6 py-4 text-slate-600 max-w-xs truncate" title={standup.blockers}>
                      {standup.blockers || <span className="text-slate-400 italic">None</span>}
                    </td>
                  </tr>
                ))}
                {standups.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">No standup records found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'deadlines' && (
          <div className="p-8">
            {deadlines.length > 0 ? (
              <Timeline 
                variant="spacious"
                items={deadlines.map(deadline => {
                  const creator = users.find(u => u.id === deadline.creatorId);
                  return {
                    id: deadline.id,
                    title: deadline.title,
                    description: deadline.description,
                    timestamp: new Date(deadline.dueDate),
                    status: new Date(deadline.dueDate) < new Date() ? 'completed' : 'active',
                    content: (
                      <div className="space-y-2">
                        {deadline.releaseLink && (
                          <a href={deadline.releaseLink} target="_blank" rel="noreferrer" className="text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:underline inline-flex items-center gap-1">
                            View Release Link
                          </a>
                        )}
                        <div className="flex items-center gap-2">
                           <img src={creator?.avatar || `https://ui-avatars.com/api/?name=${creator?.name || 'User'}`} alt={creator?.name} className="w-5 h-5 rounded-full bg-slate-100 object-cover" />
                           <span className="text-xs text-slate-500">Posted by {creator?.name || 'Unknown'}</span>
                        </div>
                      </div>
                    )
                  };
                })}
              />
            ) : (
              <div className="text-center py-12 text-slate-500">No deadlines found.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};