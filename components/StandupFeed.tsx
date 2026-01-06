import React from 'react';
import { Standup, User } from '../types';
import { AlertCircle, Clock, Trash2, Edit2 } from 'lucide-react';

interface StandupFeedProps {
  standups: Standup[];
  users: User[];
  currentUserId: string;
  onDelete: (id: string) => void;
  onEdit: (standup: Standup) => void;
}

export const StandupFeed: React.FC<StandupFeedProps> = ({ standups, users, currentUserId, onDelete, onEdit }) => {
  const getUser = (id: string) => users.find(u => u.id === id);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-slate-800 px-1">Recent Updates</h2>
      {standups.length === 0 && (
        <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-slate-300 text-slate-500">
          No standups posted yet. Be the first!
        </div>
      )}
      {standups.map((standup) => {
        const user = getUser(standup.userId);
        if (!user) return null;
        const isOwner = standup.userId === currentUserId;

        return (
          <div key={standup.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 transition-all hover:shadow-md relative group">
            {isOwner && (
              <div className="absolute top-4 right-4 flex space-x-1 opacity-0 group-hover:opacity-100 transition-all">
                <button 
                  onClick={() => onEdit(standup)}
                  className="text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 p-2 rounded-lg transition-all"
                  title="Edit Standup"
                >
                  <Edit2 size={16} />
                </button>
                <button 
                  onClick={() => onDelete(standup.id)}
                  className="text-slate-300 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-all"
                  title="Delete Standup"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )}

            <div className="flex items-start justify-between mb-4 pr-16">
              <div className="flex items-center space-x-3">
                <img src={user.avatar} alt={user.name} className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm" />
                <div>
                  <h3 className="font-bold text-slate-900">{user.name}</h3>
                  <div className="flex items-center space-x-2 text-xs text-slate-500">
                    <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-medium">{user.role}</span>
                    <span>•</span>
                    <span className="flex items-center">
                      <Clock size={12} className="mr-1" /> 
                      {new Date(standup.date).toLocaleDateString()} {new Date(standup.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-2xl" title={`Mood: ${standup.mood}`}>
                {standup.mood === 'happy' ? '😄' : standup.mood === 'neutral' ? '😐' : '😫'}
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Yesterday</p>
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{standup.yesterday}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Today</p>
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{standup.today}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-1">
                   Blockers
                </p>
                <p className={`text-sm leading-relaxed whitespace-pre-line ${standup.blockers && standup.blockers.toLowerCase() !== 'none' ? 'text-red-600 font-medium' : 'text-slate-400'}`}>
                  {standup.blockers || "None"}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};