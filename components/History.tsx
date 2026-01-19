import React, { useState, useMemo } from 'react';
import { Standup, Deadline, User } from '../types';
import { Timeline } from './timeline';
import { Edit2, Trash2, Search, Calendar, X, Download, ChevronDown } from 'lucide-react';

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
  const [filterUser, setFilterUser] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [expandedDeadlineIds, setExpandedDeadlineIds] = useState<Set<string>>(new Set());

  const toggleDeadline = (id: string) => {
    const newSet = new Set(expandedDeadlineIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setExpandedDeadlineIds(newSet);
  };

  const getUserName = (id: string) => users.find(u => u.id === id)?.name || 'Unknown';

  const formatAssigneeNames = (assignees: User[]) => {
    const names = assignees.map(a => a.name).filter(Boolean);
    if (names.length === 0) return '';
    if (names.length === 1) return names[0];
    const last = names.pop();
    return `${names.join(', ')} and ${last}`;
  };

  const filteredStandups = standups.filter(standup => {
    const userName = getUserName(standup.userId);
    const matchesUser = userName.toLowerCase().includes(filterUser.toLowerCase());
    
    let matchesDate = true;
    if (filterDate) {
      const d = new Date(standup.date);
      const localDateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      matchesDate = localDateStr === filterDate;
    }
    
    return matchesUser && matchesDate;
  });

  const deadlineStats = useMemo(() => {
    return {
      total: deadlines.length,
      completed: deadlines.filter(d => d.status === 'Completed').length,
      inProgress: deadlines.filter(d => d.status === 'In Progress').length,
      pending: deadlines.filter(d => !d.status || d.status === 'Pending').length,
      qa: deadlines.filter(d => d.status === 'Ready for QA').length,
      uat: deadlines.filter(d => d.status === 'Ready for UAT').length,
    };
  }, [deadlines]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">History & Logs</h1>
          <p className="text-slate-500">View past activities and records.</p>
        </div>
        
        <div className="flex items-center gap-3 bg-slate-100 p-1 rounded-xl self-start md:self-auto">
           <button
            onClick={() => {
              if (activeTab === 'standups') {
                const headers = ['Date', 'User', 'Yesterday', 'Today', 'Blockers', 'Jira Links'];
                const csvContent = [
                  headers.join(','),
                  ...filteredStandups.map(s => {
                    const userName = getUserName(s.userId);
                    const links = s.jiraLinks?.join('; ') || '';
                    return [
                      `"${new Date(s.date).toLocaleDateString()}"`,
                      `"${userName}"`,
                      `"${s.yesterday.replace(/"/g, '""')}"`,
                      `"${s.today.replace(/"/g, '""')}"`,
                      `"${(s.blockers || '').replace(/"/g, '""')}"`,
                      `"${links}"`
                    ].join(',');
                  })
                ].join('\n');
                
                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                const link = document.createElement('a');
                if (link.download !== undefined) {
                  const url = URL.createObjectURL(blob);
                  link.setAttribute('href', url);
                  link.setAttribute('download', `standups_export_${new Date().toISOString().split('T')[0]}.csv`);
                  link.style.visibility = 'hidden';
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }
              } else {
                const headers = ['Title', 'Status', 'Due Date', 'Assignees', 'Creator', 'Description', 'Remarks', 'Release Link'];
                const csvContent = [
                  headers.join(','),
                  ...deadlines.map(d => {
                    const assignees = d.assigneeIds?.map(id => users.find(u => u.id === id)?.name).filter(Boolean).join('; ') || '';
                    const creator = users.find(u => u.id === d.creatorId)?.name || '';
                    return [
                      `"${d.title.replace(/"/g, '""')}"`,
                      `"${d.status || 'Pending'}"`,
                      `"${new Date(d.dueDate).toLocaleDateString()}"`,
                      `"${assignees}"`,
                      `"${creator}"`,
                      `"${(d.description || '').replace(/"/g, '""')}"`,
                      `"${(d.remarks || '').replace(/"/g, '""')}"`,
                      `"${d.releaseLink || ''}"`
                    ].join(',');
                  })
                ].join('\n');
                
                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                const link = document.createElement('a');
                if (link.download !== undefined) {
                  const url = URL.createObjectURL(blob);
                  link.setAttribute('href', url);
                  link.setAttribute('download', `deadlines_export_${new Date().toISOString().split('T')[0]}.csv`);
                  link.style.visibility = 'hidden';
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }
              }
            }}
            className="mr-2 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg text-sm font-semibold shadow-sm flex items-center gap-2 transition-all active:scale-[0.98]"
            title="Export to CSV"
          >
            <Download size={16} />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
          <div className="w-px h-6 bg-slate-300 mx-1"></div>
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
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  placeholder="Filter by user..."
                  value={filterUser}
                  onChange={(e) => setFilterUser(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
              <div className="relative flex-1 max-w-xs">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-600"
                />
              </div>
              {(filterUser || filterDate) && (
                <button
                  onClick={() => { setFilterUser(''); setFilterDate(''); }}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X size={16} />
                  Clear
                </button>
              )}
            </div>

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
                  {filteredStandups.map((standup) => (
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
                  {filteredStandups.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-slate-500">No standup records found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-slate-100">
              {filteredStandups.map((standup) => (
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
                    {standup.jiraLinks && standup.jiraLinks.length > 0 && (
                      <div>
                        <span className="text-xs font-bold text-indigo-500 uppercase">Links</span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {standup.jiraLinks.map((link, i) => (
                            <a 
                              key={i} 
                              href={link} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="text-indigo-600 hover:underline text-xs bg-indigo-50 px-2 py-1 rounded border border-indigo-100"
                              onClick={(e) => e.stopPropagation()}
                            >
                              Ticket #{i + 1}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {filteredStandups.length === 0 && (
                <div className="p-8 text-center text-slate-500">No standup records found.</div>
              )}
            </div>
          </>
        )}

        {activeTab === 'deadlines' && (
          <div className="p-4 md:p-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
              <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
                <div className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">Pending</div>
                <div className="text-2xl font-bold text-amber-700">{deadlineStats.pending}</div>
              </div>
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                <div className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">In Progress</div>
                <div className="text-2xl font-bold text-blue-700">{deadlineStats.inProgress}</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                <div className="text-xs font-bold text-purple-600 uppercase tracking-wider mb-1">QA</div>
                <div className="text-2xl font-bold text-purple-700">{deadlineStats.qa}</div>
              </div>
              <div className="bg-cyan-50 p-4 rounded-xl border border-cyan-100">
                <div className="text-xs font-bold text-cyan-600 uppercase tracking-wider mb-1">UAT</div>
                <div className="text-2xl font-bold text-cyan-700">{deadlineStats.uat}</div>
              </div>
              <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">Completed</div>
                <div className="text-2xl font-bold text-emerald-700">{deadlineStats.completed}</div>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Total</div>
                <div className="text-2xl font-bold text-slate-900">{deadlineStats.total}</div>
              </div>
            </div>
            {deadlines.length > 0 ? (
              <Timeline 
                variant="spacious"
                items={deadlines.map(deadline => {
                  const creator = users.find(u => u.id === deadline.creatorId);
                  const isCreator = !!(currentUser?.id && deadline.creatorId && currentUser.id === deadline.creatorId);
                  const isAdmin = !!currentUser?.isAdmin;
                  const canEdit = isCreator || isAdmin;
                  const assignees = deadline.assigneeIds?.map(id => users.find(u => u.id === id)).filter(Boolean) as User[] || [];
                  const isAssignee = !!(currentUser?.id && deadline.assigneeIds?.includes(currentUser.id));
                  const isExpanded = expandedDeadlineIds.has(deadline.id);

                  const getStatusColor = (status?: string) => {
                    switch (status) {
                      case 'Completed': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
                      case 'In Progress': return 'bg-blue-100 text-blue-700 border-blue-200';
                      case 'Ready for QA': return 'bg-purple-100 text-purple-700 border-purple-200';
                      case 'Ready for UAT': return 'bg-cyan-100 text-cyan-700 border-cyan-200';
                      default: return 'bg-amber-100 text-amber-700 border-amber-200'; // Pending
                    }
                  };

                  return {
                    id: deadline.id,
                    title: deadline.title,
                    description: (
                      <div className="space-y-3">
                        <div 
                          className="flex justify-between items-center cursor-pointer select-none"
                          onClick={() => toggleDeadline(deadline.id)}
                        >
                          <div className="flex flex-wrap gap-2 items-center">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${getStatusColor(deadline.status)}`}>
                              {deadline.status || 'Pending'}
                            </span>
                            {isAssignee && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-bold border border-indigo-100">
                                <span className="relative flex h-2 w-2">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                                </span>
                                Assigned to you
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {canEdit && (
                              <div className="flex gap-1 mr-2">
                                <button 
                                  onClick={(e) => { e.stopPropagation(); onEditDeadline(deadline); }} 
                                  className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                  title="Edit Deadline"
                                >
                                  <Edit2 size={14} />
                                </button>
                                <button 
                                  onClick={(e) => { e.stopPropagation(); onDeleteDeadline(deadline.id); }} 
                                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Delete Deadline"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            )}
                            <div className={`text-slate-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                              <ChevronDown size={16} />
                            </div>
                          </div>
                        </div>
                      </div>
                    ),
                    timestamp: new Date(deadline.dueDate),
                    status: new Date(deadline.dueDate) < new Date() ? 'completed' : 'active',
                    content: isExpanded ? (
                      <div className="space-y-3 pt-2 animate-in fade-in slide-in-from-top-1 duration-200">
                        {deadline.description && (
                          <div>
                             <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide mb-1">Description</p>
                             <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{deadline.description}</p>
                          </div>
                        )}
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
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                               <img src={creator?.avatar || `https://ui-avatars.com/api/?name=${creator?.name || 'User'}`} alt={creator?.name} className="w-5 h-5 rounded-full bg-slate-100 object-cover" />
                               <span className="text-xs text-slate-500">Posted by {creator?.name || 'Unknown'}</span>
                            </div>
                            {assignees && assignees.length > 0 && (
                              <div className="flex items-center gap-2 border-l border-slate-100 pl-4">
                                <div className="flex -space-x-2 overflow-hidden">
                                  {assignees.map(assignee => (
                                    <img 
                                      key={assignee.id}
                                      src={assignee.avatar || `https://ui-avatars.com/api/?name=${assignee.name}`} 
                                      alt={assignee.name}
                                      title={assignee.name}
                                      className="w-5 h-5 rounded-full bg-slate-100 object-cover border-2 border-white"
                                    />
                                  ))}
                                </div>
                                <span className="text-xs text-slate-500">Assigned to {formatAssigneeNames(assignees)}</span>
                              </div>
                            )}
                          </div>

                        </div>
                      </div>
                    ) : null
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