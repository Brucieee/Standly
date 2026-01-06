import React, { useState } from 'react';
import { Task, User } from '../types';
import { Plus, Calendar, User as UserIcon } from 'lucide-react';

interface TasksWidgetProps {
  tasks: Task[];
  users: User[];
  currentUserId: string;
  onAddTask: (task: Omit<Task, 'id' | 'creatorId'>) => void;
  onUpdateStatus: (taskId: string, status: Task['status']) => void;
}

export const TasksWidget: React.FC<TasksWidgetProps> = ({ tasks, users, currentUserId, onAddTask, onUpdateStatus }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskAssignee, setNewTaskAssignee] = useState(currentUserId);
  const [newTaskDate, setNewTaskDate] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    onAddTask({
      title: newTaskTitle,
      status: 'todo',
      assigneeId: newTaskAssignee,
      dueDate: newTaskDate || new Date().toISOString(),
      description: ''
    });
    setIsAdding(false);
    setNewTaskTitle('');
  };

  const getAssignee = (id: string) => users.find(u => u.id === id);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-slate-800">Team Tasks</h3>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="text-indigo-600 hover:bg-indigo-50 p-1.5 rounded-lg transition-colors"
        >
          <Plus size={20} />
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAdd} className="mb-4 bg-slate-50 p-3 rounded-lg border border-slate-200 animate-in fade-in slide-in-from-top-2">
          <input 
            className="w-full bg-white border border-slate-200 rounded px-2 py-1.5 text-sm mb-2 focus:ring-1 focus:ring-indigo-500 outline-none text-slate-900 placeholder:text-slate-400"
            placeholder="Task title..."
            value={newTaskTitle}
            onChange={e => setNewTaskTitle(e.target.value)}
            required
          />
          <div className="flex space-x-2">
            <select 
              className="flex-1 bg-white border border-slate-200 rounded px-2 py-1 text-xs outline-none text-slate-900"
              value={newTaskAssignee}
              onChange={e => setNewTaskAssignee(e.target.value)}
            >
              {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
            <div className="relative w-32">
              <Calendar className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
              <input 
                type="date"
                className="w-full bg-white border border-slate-200 rounded pl-7 pr-2 py-1 text-xs outline-none text-slate-900 cursor-pointer"
                value={newTaskDate}
                onChange={e => setNewTaskDate(e.target.value)}
                onClick={(e) => {
                  try {
                    if (e.currentTarget.showPicker) e.currentTarget.showPicker();
                  } catch (err) {
                    // ignore
                  }
                }}
              />
            </div>
          </div>
          <button type="submit" className="w-full mt-2 bg-indigo-600 text-white text-xs font-medium py-1.5 rounded hover:bg-indigo-700">Add Task</button>
        </form>
      )}

      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {tasks.length === 0 ? (
           <div className="text-center py-8 text-slate-400 text-sm">No tasks assigned yet.</div>
        ) : (
          tasks.map(task => {
            const assignee = getAssignee(task.assigneeId);
            const isDueSoon = new Date(task.dueDate) < new Date(Date.now() + 86400000 * 2);
            
            return (
              <div key={task.id} className="group flex items-start space-x-3 p-3 rounded-xl border border-slate-100 hover:border-indigo-100 hover:shadow-sm transition-all bg-white">
                <input 
                  type="checkbox" 
                  checked={task.status === 'done'}
                  onChange={() => onUpdateStatus(task.id, task.status === 'done' ? 'in-progress' : 'done')}
                  className="mt-1 w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${task.status === 'done' ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                    {task.title}
                  </p>
                  <div className="flex items-center space-x-3 mt-1.5">
                    <div className="flex items-center space-x-1 text-xs text-slate-500">
                      <UserIcon size={12} />
                      <span className="truncate max-w-[80px]">{assignee?.name}</span>
                    </div>
                    {task.dueDate && (
                      <div className={`flex items-center space-x-1 text-xs ${isDueSoon && task.status !== 'done' ? 'text-orange-500 font-medium' : 'text-slate-400'}`}>
                        <Calendar size={12} />
                        <span>{new Date(task.dueDate).toLocaleDateString(undefined, {month:'short', day:'numeric'})}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  task.status === 'done' ? 'bg-green-400' :
                  task.status === 'in-progress' ? 'bg-indigo-500' : 'bg-slate-300'
                }`}></div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};