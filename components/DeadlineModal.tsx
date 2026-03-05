import React, { useState, useEffect } from 'react';
import { X, Calendar, Flag, Link as LinkIcon, CheckCircle, MessageSquare, User as UserIcon, Users } from 'lucide-react';
import { Deadline, User } from '../types';

interface DeadlineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Deadline, 'id' | 'creatorId' | 'assigneeId'> & { assigneeIds: string[] | null }) => void;
  initialData?: Deadline | null;
  onDelete?: () => void;
  users: User[];
}

export const DeadlineModal: React.FC<DeadlineModalProps> = ({ isOpen, onClose, onSubmit, initialData, onDelete, users }) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [releaseLink, setReleaseLink] = useState('');
  const [description, setDescription] = useState('');
  // @ts-ignore
  const [status, setStatus] = useState<Deadline['status']>('Pending');
  const [remarks, setRemarks] = useState('');
  const [assigneeIds, setAssigneeIds] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setTitle(initialData.title);
        setDate(initialData.dueDate ? new Date(initialData.dueDate).toISOString().split('T')[0] : '');
        setReleaseLink(initialData.releaseLink || '');
        setDescription(initialData.description || '');
        setStatus(initialData.status || 'Pending');
        setRemarks(initialData.remarks || '');
        // Handle legacy single assigneeId if present
        const legacyData = initialData as any;
        setAssigneeIds(legacyData.assigneeIds || (legacyData.assigneeId ? [legacyData.assigneeId] : []));
      } else {
        setTitle('');
        setDate('');
        setReleaseLink('');
        setDescription('');
        setStatus('Pending');
        setRemarks('');
        setAssigneeIds([]);
      }
    }
  }, [isOpen, initialData]);

  const addAssignee = (id: string) => {
    if (id && !assigneeIds.includes(id)) {
      setAssigneeIds([...assigneeIds, id]);
    }
  };

  const removeAssignee = (id: string) => {
    setAssigneeIds(assigneeIds.filter(assigneeId => assigneeId !== id));
  };


  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!date) {
      return;
    }

    try {
      // Default to end of day for the selected date
      const dueDate = new Date(date).toISOString();

      onSubmit({
        title,
        description: description,
        dueDate,
        releaseLink: releaseLink,
        status,
        remarks,
        assigneeIds: assigneeIds.length > 0 ? assigneeIds : null,
      });
    } catch (error) {
      console.error('Invalid date:', error);
    }
  };

  const unassignedUsers = users.filter(u => !assigneeIds.includes(u.id));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-fade-in-up"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 flex-shrink-0">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Flag className="text-red-500" size={20} />
            {initialData ? 'Edit Deadline' : 'Add Deadline'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <form id="deadline-form" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Q3 Release"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all text-slate-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Due Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    onClick={(e) => {
                      try { if (e.currentTarget.showPicker) e.currentTarget.showPicker(); } catch (err) { }
                    }}
                    className="w-full pl-10 pr-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all text-slate-900 cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Status
                </label>
                <div className="relative">
                  <CheckCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as Deadline['status'])}
                    className="w-full pl-10 pr-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all text-slate-900 appearance-none"
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="For QA">For QA</option>
                    <option value="For Approval">For Approval</option>
                    <option value="Completed">Completed</option>
                    <option value="Completed Beyond Schedule">Completed Beyond Schedule</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Assignees
              </label>
              <div className="p-2 border border-slate-200 rounded-lg min-h-[42px] flex flex-col justify-center">
                <div className="flex flex-wrap gap-2 max-h-16 overflow-y-auto pr-2">
                  {assigneeIds.map(id => {
                    const user = users.find(u => u.id === id);
                    return (
                      <div key={id} className="flex items-center gap-2 bg-indigo-50 text-indigo-700 rounded-full px-3 py-1 text-sm font-medium animate-fade-in-up">
                        <img src={user?.avatar} alt={user?.name} className="w-5 h-5 rounded-full object-cover" />
                        <span>{user?.name || 'Unknown User'}</span>
                        <button type="button" onClick={() => removeAssignee(id)} className="text-indigo-400 hover:text-indigo-600">
                          <X size={14} />
                        </button>
                      </div>
                    );
                  })}
                </div>

                {unassignedUsers.length > 0 && (
                  <div className="relative mt-2">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                    <select
                      value=""
                      onChange={(e) => addAssignee(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 bg-white border-0 focus:ring-0 focus:border-transparent outline-none transition-all text-slate-900 appearance-none rounded-lg"
                    >
                      <option value="" disabled>Add an assignee...</option>
                      {unassignedUsers.map(user => (
                        <option key={user.id} value={user.id}>{user.name}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Release Link
              </label>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                <input
                  type="url"
                  value={releaseLink}
                  onChange={(e) => setReleaseLink(e.target.value)}
                  placeholder="https://..."
                  className="w-full pl-10 pr-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Description (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Additional details..."
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all resize-none h-20 text-slate-900"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Remarks
              </label>
              <div className="relative">
                <MessageSquare className="absolute left-3 top-3 text-slate-400 pointer-events-none" size={18} />
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Any remarks..."
                  className="w-full pl-10 pr-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all resize-none h-20 text-slate-900"
                />
              </div>
            </div>
          </form>
        </div>
        <div className="p-6 border-t border-slate-100 flex-shrink-0 bg-white rounded-b-2xl flex gap-3">
          {initialData && onDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="px-4 py-2.5 rounded-lg font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition-all"
            >
              Delete
            </button>
          )}
          <button
            type="submit"
            form="deadline-form"
            className="flex-1 bg-red-600 text-white py-2.5 rounded-lg font-semibold hover:bg-red-700 active:scale-[0.98] transition-all shadow-md shadow-red-200"
          >
            {initialData ? 'Save Changes' : 'Set Deadline'}
          </button>
        </div>
      </div>
    </div>
  );
};