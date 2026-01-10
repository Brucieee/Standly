import React, { useState } from 'react';
import { Standup, Deadline, User } from '../types';
import { Timeline } from './timeline';
import { Edit2, Trash2 } from 'lucide-react';

interface HistoryProps {
  standups: Standup[];
  deadlines: Deadline[];
  users: User[];
  currentUser: User | null;
  onEditDeadline: (deadline: Deadline) => void;
  onDeleteDeadline: (id: string) => void;
  onViewStandup: (standup: Standup) => void;
}

export const History: React.FC<HistoryProps> = ({ standups, deadlines, users, currentUser, onEditDeadline, onDeleteDeadline, onViewStandup }) => {
  const [activeTab, setActiveTab] = useState<'standups' | 'deadlines'>('standups');

  const getUserName = (id: string) => users.find(u => u.id === id)?.name || 'Unknown';

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">History & Logs</h1>
          <p className="text-slate-500">View past activities and records.</p>
        </div>
        
        <div className="flex bg-slate-100 p-1 rounded-xl self-start md:self-auto">
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
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 font-semibold text-slate-700">Date</th>
                    <th className="px-6 py-4 font-semibold text-slate-700">User</th>
                    <th className="px-6 py-4 font-semibold text-slate-700">Yesterday</th>
                    <th className="px-6 py-4 font-semibold text-slate-700">Today</th>
                    <th className="px-6 py-4 font-semibold text-slate-700">Blockers</th>
                    <th className="px-6 py-4 font-semibold text-slate-700">Links</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {standups.map((standup) => (
                    <tr 
                      key={standup.id} 
                      className="hover:bg-slate-50/50 transition-colors cursor-pointer"
                      onClick={() => onViewStandup(standup)}
                    >
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
                      <td className="px-6 py-4">
                        {standup.jiraLinks && standup.jiraLinks.length > 0 ? (
                          <div className="flex flex-col gap-1">
                            {standup.jiraLinks.map((link, i) => (
                              <a 
                                key={i} 
                                href={link} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-indigo-600 hover:underline text-xs whitespace-nowrap"
                                onClick={(e) => e.stopPropagation()} // Prevent row click
                              >
                                Ticket #{i + 1}
                              </a>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-xs">None</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {standups.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-slate-500">No standup records found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-slate-100">
              {standups.map((standup) => (
                <div 
                  key={standup.id} 
                  className="p-4 space-y-3 cursor-pointer hover:bg-slate-50 transition-colors"
                  onClick={() => onViewStandup(standup)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-sm font-bold">
                        {getUserName(standup.userId)[0]}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-sm">{getUserName(standup.userId)}</div>
                        <div className="text-xs text-slate-500">{new Date(standup.date).toLocaleDateString()}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-xs font-bold text-slate-500 uppercase">Yesterday</span>
                      <p className="text-slate-700 line-clamp-2">{standup.yesterday}</p>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-500 uppercase">Today</span>
                      <p className="text-slate-700 line-clamp-2">{standup.today}</p>
                    </div>
                    {standup.blockers && (
                      <div>
                        <span className="text-xs font-bold text-red-500 uppercase">Blockers</span>
                        <p className="text-slate-700 line-clamp-2">{standup.blockers}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {standups.length === 0 && (
                <div className="p-8 text-center text-slate-500">No standup records found.</div>
              )}
            </div>
          </>
        )}

        {activeTab === 'deadlines' && (
          <div className="p-4 md:p-8">
            {deadlines.length > 0 ? (
              <Timeline 
                variant="spacious"
                items={deadlines.map(deadline => {
                  const creator = users.find(u => u.id === deadline.creatorId);
                  const isCreator = !!(currentUser?.id && deadline.creatorId && currentUser.id === deadline.creatorId);
                  const isAdmin = !!currentUser?.isAdmin;
                  const canEdit = isCreator || isAdmin;

                  const getStatusColor = (status?: string) => {
                    switch (status) {
                      case 'Completed': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
                      case 'In Progress': return 'bg-blue-100 text-blue-700 border-blue-200';
                      default: return 'bg-amber-100 text-amber-700 border-amber-200'; // Pending
                    }
                  };

                  return {
                    id: deadline.id,
                    title: deadline.title,
                    description: (
                      <div className="space-y-3">
                        <div className="flex flex-wrap gap-2">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${getStatusColor(deadline.status)}`}>
                            {deadline.status || 'Pending'}
                          </span>
                        </div>

                        {deadline.description && (
                          <div>
                             <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide mb-1">Description</p>
                             <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{deadline.description}</p>
                          </div>
                        )}
                      </div>
                    ),
                    timestamp: new Date(deadline.dueDate),
                    status: new Date(deadline.dueDate) < new Date() ? 'completed' : 'active',
                    content: (
                      <div className="space-y-3">
                        {deadline.remarks && (
                          <div className="mt-2">
                             <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide mb-1">Remarks</p>
                             <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{deadline.remarks}</p>
                          </div>
                        )}

                        {deadline.releaseLink && (
                          <a href={deadline.releaseLink} target="_blank" rel="noreferrer" className="text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:underline inline-flex items-center gap-1">
                            View Release Link
                          </a>
                        )}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                          <div className="flex items-center gap-2">
                             <img src={creator?.avatar || `https://ui-avatars.com/api/?name=${creator?.name || 'User'}`} alt={creator?.name} className="w-5 h-5 rounded-full bg-slate-100 object-cover" />
                             <span className="text-xs text-slate-500">Posted by {creator?.name || 'Unknown'}</span>
                          </div>
                          {canEdit && (
                            <div className="flex gap-1">
                              <button 
                                onClick={() => onEditDeadline(deadline)} 
                                className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                title="Edit Deadline"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button 
                                onClick={() => onDeleteDeadline(deadline.id)} 
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete Deadline"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          )}
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