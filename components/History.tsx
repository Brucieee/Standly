import React, { useState, useMemo, useEffect } from 'react';
import { Standup, Deadline, User } from '../types';
import { Timeline } from './timeline';
import { Edit2, Trash2, Search, Calendar, X, Download, ChevronDown, ChevronLeft, ChevronRight, User as UserIcon } from 'lucide-react';
import * as XLSX from 'xlsx';

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

  // Filters
  const [selectedUserId, setSelectedUserId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  // Show more items if a user is selected, otherwise default to 3 days
  const itemsPerPage = selectedUserId ? 50 : 3;
  const [expandedDeadlineIds, setExpandedDeadlineIds] = useState<Set<string>>(new Set());
  const [hideCompleted, setHideCompleted] = useState(false);

  // Initialize dates to past 3 days on mount
  useEffect(() => {
    const today = new Date();
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(today.getDate() - 3);

    const formatDate = (date: Date) => {
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    };

    setEndDate(formatDate(today));
    setStartDate(formatDate(threeDaysAgo));
  }, []);

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

  const filteredStandups = useMemo(() => {
    return standups.filter(standup => {
      let matchUser = true;
      let matchDate = true;

      // 1. User Filter
      if (selectedUserId) {
        matchUser = standup.userId === selectedUserId;
      }

      // 2. Date Range Filter
      if (startDate && endDate) {
        const standupDate = new Date(standup.date);
        const start = new Date(startDate);
        const end = new Date(endDate);
        // Normalize times to midnight
        standupDate.setHours(0, 0, 0, 0);
        start.setHours(0, 0, 0, 0);
        end.setHours(0, 0, 0, 0);

        matchDate = standupDate >= start && standupDate <= end;
      }

      return matchUser && matchDate;
    });
  }, [standups, selectedUserId, startDate, endDate]);

  // Pagination logic
  const uniqueDates = useMemo(() => {
    const dates = Array.from(new Set(filteredStandups.map(s => new Date(s.date).toDateString())));
    return dates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  }, [filteredStandups]);

  const totalPages = Math.ceil(uniqueDates.length / itemsPerPage);

  const paginatedDates = uniqueDates.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const displayStandups = filteredStandups.filter(s =>
    paginatedDates.includes(new Date(s.date).toDateString())
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedUserId, startDate, endDate]);

  const handleExport = () => {
    if (activeTab === 'standups') {
      const data = filteredStandups.map(s => ({
        Date: new Date(s.date).toLocaleDateString(),
        User: getUserName(s.userId),
        Yesterday: s.yesterday,
        Today: s.today,
        Blockers: s.blockers,
        Likes: s.reactions?.filter(r => r.type === 'like').length || 0,
        JiraLinks: s.jiraLinks?.join(', ') || ''
      }));

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Standups");
      XLSX.writeFile(wb, `standups_export_${new Date().toISOString().split('T')[0]}.xlsx`);

    } else {
      // Filter deadlines based on current visibility (though filters currently only apply to standups in UI, 
      // usually history filters might want to apply to deadlines too, but requirement was specific to "Shows past 3 days")
      // The current deadline list is passed as `deadlines` prop and filtered by `hideCompleted` in `visibleDeadlines`
      // We will export `visibleDeadlines`
      const data = visibleDeadlines.map(d => {
        const assignees = d.assigneeIds?.map(id => users.find(u => u.id === id)?.name).filter(Boolean).join('; ') || '';
        const creator = users.find(u => u.id === d.creatorId)?.name || '';
        return {
          Title: d.title,
          Status: d.status,
          DueDate: new Date(d.dueDate).toLocaleDateString(),
          Assignees: assignees,
          Creator: creator,
          Description: d.description,
          Remarks: d.remarks,
          ReleaseLink: d.releaseLink
        };
      });

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Deadlines");
      XLSX.writeFile(wb, `deadlines_export_${new Date().toISOString().split('T')[0]}.xlsx`);
    }
  };

  const visibleDeadlines = useMemo(() => {
    return hideCompleted ? deadlines.filter(d => d.status !== 'Completed' && d.status !== 'Completed Beyond Schedule') : deadlines;
  }, [deadlines, hideCompleted]);

  const deadlineStats = useMemo(() => {
    return {
      total: deadlines.length,
      completed: deadlines.filter(d => d.status === 'Completed').length,
      inProgress: deadlines.filter(d => d.status === 'In Progress').length,
      pending: deadlines.filter(d => !d.status || d.status === 'Pending').length,
      forQA: deadlines.filter(d => d.status === 'For QA').length,
      completedBeyondSchedule: deadlines.filter(d => d.status === 'Completed Beyond Schedule').length,
    };
  }, [deadlines]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">History & Logs</h1>
          <p className="text-slate-500">View past activities and records.</p>
        </div>

        <div className="flex items-center gap-3 bg-slate-200 shadow-neo-sm-inner p-2 rounded-2xl self-start md:self-auto">
          <button
            onClick={handleExport}
            className="mr-2 flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-neo transition-all active:scale-[0.98]"
            title="Export to Excel"
          >
            <Download size={16} />
            <span className="hidden sm:inline whitespace-nowrap">Export Excel</span>
          </button>
          <div className="w-px h-6 bg-slate-300 mx-1"></div>
          <button
            onClick={() => setActiveTab('standups')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'standups' ? 'bg-slate-200 text-indigo-600 shadow-neo-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Standups
          </button>
          <button
            onClick={() => setActiveTab('deadlines')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'deadlines' ? 'bg-slate-200 text-indigo-600 shadow-neo-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Deadlines
          </button>
        </div>
      </div>

      <div className="bg-slate-200 rounded-3xl shadow-neo border-none overflow-hidden">
        {activeTab === 'standups' && (
          <>
            <div className="p-5 border-none bg-transparent flex flex-col sm:flex-row gap-4">
              {/* User Dropdown */}
              <div className="relative flex-1 max-w-xs">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <select
                  value={selectedUserId}
                  onChange={(e) => {
                    setSelectedUserId(e.target.value);
                    if (e.target.value) {
                      setStartDate('');
                      setEndDate('');
                    }
                  }}
                  className="w-full pl-9 pr-4 py-3 rounded-xl border-none shadow-neo-sm-inner bg-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:shadow-neo appearance-none text-slate-600 transition-all font-medium"
                >
                  <option value="">All Users</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>{user.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
              </div>

              {/* Date Range */}
              <div className="flex items-center gap-2 flex-1">
                <div className="relative flex-1 max-w-xs">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full pl-9 pr-4 py-3 rounded-xl border-none shadow-neo-sm-inner bg-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:shadow-neo text-slate-600 transition-all font-medium"
                    placeholder="Start Date"
                  />
                </div>
                <span className="text-slate-400">-</span>
                <div className="relative flex-1 max-w-xs">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full pl-9 pr-4 py-3 rounded-xl border-none shadow-neo-sm-inner bg-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:shadow-neo text-slate-600 transition-all font-medium"
                    placeholder="End Date"
                  />
                </div>
              </div>

              {/* Clear Button */}
              {(selectedUserId || startDate || endDate) && (
                <button
                  onClick={() => {
                    setSelectedUserId('');
                    // Reset to default 3 days
                    const today = new Date();
                    const threeDaysAgo = new Date();
                    threeDaysAgo.setDate(today.getDate() - 3);

                    const formatDate = (date: Date) => {
                      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                    };

                    setEndDate(formatDate(today));
                    setStartDate(formatDate(threeDaysAgo));
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-slate-500 font-bold hover:text-slate-700 bg-slate-200 rounded-xl shadow-neo hover:shadow-neo-inner transition-colors active:scale-95"
                >
                  <X size={16} />
                  Reset
                </button>
              )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-transparent border-none">
                  <tr>
                    <th className="px-6 py-4 font-bold text-slate-400 tracking-wider text-xs uppercase">Date</th>
                    <th className="px-6 py-4 font-bold text-slate-400 tracking-wider text-xs uppercase">User</th>
                    <th className="px-6 py-4 font-bold text-slate-400 tracking-wider text-xs uppercase">Yesterday</th>
                    <th className="px-6 py-4 font-bold text-slate-400 tracking-wider text-xs uppercase">Today</th>
                    <th className="px-6 py-4 font-bold text-slate-400 tracking-wider text-xs uppercase">Blockers</th>
                    <th className="px-6 py-4 font-bold text-slate-400 tracking-wider text-xs uppercase">Links</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-300/30">
                  {displayStandups.map((standup) => (
                    <tr
                      key={standup.id}
                      className="hover:bg-slate-200 hover:shadow-neo-sm-inner transition-all cursor-pointer"
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
                      <td className="px-6 py-4 text-slate-600 max-w-sm whitespace-pre-wrap">{standup.yesterday}</td>
                      <td className="px-6 py-4 text-slate-600 max-w-sm whitespace-pre-wrap">{standup.today}</td>
                      <td className="px-6 py-4 text-slate-600 max-w-sm whitespace-pre-wrap">
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
                  {displayStandups.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-slate-500">No standup records found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-slate-100">
              {displayStandups.map((standup) => (
                <div
                  key={standup.id}
                  className="p-5 space-y-3 cursor-pointer hover:shadow-neo-sm-inner transition-all"
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
              {displayStandups.length === 0 && (
                <div className="p-8 text-center text-slate-500">No standup records found.</div>
              )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-none bg-transparent">
                <div className="text-sm font-medium text-slate-500 hidden sm:block">
                  Showing {paginatedDates.length} days of standups
                </div>
                <div className="flex items-center gap-4 mx-auto sm:mx-0">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-3 bg-slate-200 rounded-xl shadow-neo hover:shadow-neo-inner disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="text-sm font-bold text-slate-700">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-3 bg-slate-200 rounded-xl shadow-neo hover:shadow-neo-inner disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === 'deadlines' && (
          <div className="p-5 md:p-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
              <div className="bg-slate-200 shadow-neo-sm-inner p-4 rounded-2xl border-none">
                <div className="text-xs font-bold text-amber-500 uppercase tracking-wider mb-1">Pending</div>
                <div className="text-2xl font-bold text-amber-600">{deadlineStats.pending}</div>
              </div>
              <div className="bg-slate-200 shadow-neo-sm-inner p-4 rounded-2xl border-none">
                <div className="text-xs font-bold text-blue-500 uppercase tracking-wider mb-1">In Progress</div>
                <div className="text-2xl font-bold text-blue-600">{deadlineStats.inProgress}</div>
              </div>
              <div className="bg-slate-200 shadow-neo-sm-inner p-4 rounded-2xl border-none">
                <div className="text-xs font-bold text-purple-500 uppercase tracking-wider mb-1">For QA</div>
                <div className="text-2xl font-bold text-purple-600">{deadlineStats.forQA}</div>
              </div>
              <div className="bg-slate-200 shadow-neo-sm-inner p-4 rounded-2xl border-none">
                <div className="text-xs font-bold text-orange-500 uppercase tracking-wider mb-1">Beyond Schedule</div>
                <div className="text-2xl font-bold text-orange-600">{deadlineStats.completedBeyondSchedule}</div>
              </div>
              <div className="bg-slate-200 shadow-neo-sm-inner p-4 rounded-2xl border-none">
                <div className="text-xs font-bold text-emerald-500 uppercase tracking-wider mb-1">Completed</div>
                <div className="text-2xl font-bold text-emerald-600">{deadlineStats.completed}</div>
              </div>
              <div className="bg-slate-200 shadow-neo-sm-inner p-4 rounded-2xl border-none">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Total</div>
                <div className="text-2xl font-bold text-slate-900">{deadlineStats.total}</div>
              </div>
            </div>

            <div className="flex justify-end mb-6">
              <label className="inline-flex items-center cursor-pointer select-none group">
                <input
                  type="checkbox"
                  checked={hideCompleted}
                  onChange={(e) => setHideCompleted(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="relative w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600 group-hover:bg-slate-300 peer-checked:group-hover:bg-indigo-700"></div>
                <span className="ms-3 text-sm font-medium text-slate-600 group-hover:text-slate-800 transition-colors">Hide Completed</span>
              </label>
            </div>

            {visibleDeadlines.length > 0 ? (
              <Timeline
                variant="spacious"
                items={visibleDeadlines.map(deadline => {
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
                      case 'For QA': return 'bg-purple-100 text-purple-700 border-purple-200';
                      case 'Completed Beyond Schedule': return 'bg-orange-100 text-orange-700 border-orange-200';
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