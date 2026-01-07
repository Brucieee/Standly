import React, { useState } from 'react';
import { Standup, User } from '../types';
import { Trash2, Edit2, Clock, X, CheckCircle2, AlertCircle, ExternalLink, Smile, Meh, Frown, Eye } from 'lucide-react';

interface StandupFeedProps {
  standups: Standup[];
  users: User[];
  currentUserId: string;
  onDelete: (id: string) => void;
  onEdit: (standup: Standup) => void;
  onView: (standup: Standup) => void;
}

export const StandupFeed: React.FC<StandupFeedProps> = ({ standups, users, currentUserId, onDelete, onEdit, onView }) => {
  const [selectedStandup, setSelectedStandup] = useState<Standup | null>(null);

  const getMoodIcon = (mood: string, size: number = 28) => {
    switch (mood) {
      case 'happy': return <Smile className="text-green-500" size={size} />;
      case 'neutral': return <Meh className="text-yellow-500" size={size} />;
      case 'stressed': return <Frown className="text-red-500" size={size} />;
      default: return <Smile className="text-slate-400" size={size} />;
    }
  };

  // Group standups by date to create sections
  const groupedStandups = standups.reduce((groups, standup) => {
    const dateObj = new Date(standup.date);
    const dateLabel = dateObj.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
    
    if (!groups[dateLabel]) {
      groups[dateLabel] = [];
    }
    groups[dateLabel].push(standup);
    return groups;
  }, {} as Record<string, Standup[]>);

  return (
    <>
    <div className="space-y-10">
      {Object.entries(groupedStandups).map(([dateLabel, groupStandups]) => (
        <div key={dateLabel} className="space-y-5 animate-fade-in-up">
          {/* Date Header */}
          <div className="flex items-center gap-4">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">
              {dateLabel}
            </h3>
            <div className="h-px bg-slate-100 w-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {groupStandups.map((standup) => {
              const user = users.find(u => u.id === standup.userId);
              const isCurrentUser = standup.userId === currentUserId;
              const date = new Date(standup.date);
              const isViewed = standup.views?.includes(currentUserId);
              const creationDate = standup.createdAt ? new Date(standup.createdAt) : new Date(standup.date);
              const timeStr = creationDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

              return (
                <div 
                  key={standup.id} 
                  onClick={() => {
                    setSelectedStandup(standup);
                    onView(standup);
                  }}
                  className={`
                    relative bg-white rounded-2xl p-5 cursor-pointer group transition-all duration-300
                    border shadow-sm hover:shadow-xl hover:-translate-y-1
                    overflow-hidden
                    ${isViewed ? 'border-indigo-500 ring-1 ring-indigo-500/20' : 'border-slate-100'}
                  `}
                >
                  {/* Gradient Top Border Effect on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 h-1 top-0 w-full" />
                  
                  {/* Unread Indicator */}
                  {!isViewed && !isCurrentUser && (
                     <div className="absolute top-5 right-5 w-2 h-2 bg-indigo-500 rounded-full animate-pulse shadow-lg shadow-indigo-200" />
                  )}

                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                          <img 
                            src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name || 'User'}`} 
                            alt={user?.name}
                            className="w-12 h-12 rounded-xl bg-slate-100 object-cover shadow-sm group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
                              {getMoodIcon(standup.mood, 14)}
                          </div>
                      </div>
                      
                      <div>
                        <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                          {user?.name || 'Unknown User'}
                        </h3>
                        <p className="text-xs font-medium text-indigo-500 mb-0.5">
                          {user?.role || 'Developer'}
                        </p>
                        <p className="text-[10px] text-slate-400 flex items-center gap-1 font-medium uppercase tracking-wide">
                          {timeStr}
                        </p>
                      </div>
                    </div>
                    
                    {isCurrentUser && (
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(standup);
                          }}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Edit Standup"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(standup.id);
                          }}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Standup"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
      
      {standups.length === 0 && (
        <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
          <p className="text-slate-500">No standups yet. Be the first to post!</p>
        </div>
      )}
    </div>

    {selectedStandup && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedStandup(null)}>
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-fade-in-up" onClick={e => e.stopPropagation()}>
          {/* Header */}
          <div className="p-6 border-b border-slate-100 flex justify-between items-center flex-shrink-0">
            <div className="flex items-center gap-3">
              <img 
                src={users.find(u => u.id === selectedStandup.userId)?.avatar || `https://ui-avatars.com/api/?name=User`} 
                alt="User"
                className="w-10 h-10 rounded-full bg-slate-100 object-cover"
              />
              <div>
                <h3 className="font-bold text-slate-900">{users.find(u => u.id === selectedStandup.userId)?.name || 'Unknown User'}</h3>
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  <Clock size={12} />
                  {new Date(selectedStandup.date).toLocaleString(undefined, { weekday: 'long', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' })}
                </p>
              </div>
            </div>
            <button onClick={() => setSelectedStandup(null)} className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Column */}
                <div className="space-y-8">
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-green-500" />
                      Yesterday
                    </h4>
                    <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">{selectedStandup.yesterday}</p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                      <AlertCircle size={14} className="text-red-500" />
                      Blockers
                    </h4>
                    <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
                      {selectedStandup.blockers || <span className="text-slate-400 italic">None</span>}
                    </p>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-8">
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                      <Clock size={14} className="text-indigo-500" />
                      Today
                    </h4>
                    <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">{selectedStandup.today}</p>
                  </div>

                  <div className="space-y-2">
                     <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mood</h4>
                     <div className="flex items-center gap-2">
                        {getMoodIcon(selectedStandup.mood)}
                        <span className="text-sm font-medium text-slate-700 capitalize">{selectedStandup.mood}</span>
                     </div>
                  </div>
                </div>
             </div>

             {selectedStandup.jiraLinks && selectedStandup.jiraLinks.length > 0 && (
                <div className="pt-4 border-t border-slate-100 space-y-2">
                  {selectedStandup.jiraLinks.map((link, index) => (
                    <a key={index} href={link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:underline bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors mr-2 mb-2">
                      <ExternalLink size={14} />
                      View Jira Ticket {selectedStandup.jiraLinks!.length > 1 ? `#${index + 1}` : ''}
                    </a>
                  ))}
                </div>
             )}

             {/* Viewers Section */}
             <div className="pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Eye size={14} />
                  Viewed By
                </h4>
                <div className="flex flex-wrap gap-2">
                  {(selectedStandup.views || []).length > 0 ? (selectedStandup.views || []).map(viewerId => {
                    const viewer = users.find(u => u.id === viewerId);
                    if (!viewer) return null;
                    return (
                      <img 
                        key={viewerId}
                        src={viewer.avatar} 
                        alt={viewer.name}
                        title={viewer.name}
                        className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                      />
                    );
                  }) : (
                    <span className="text-sm text-slate-400 italic">No views yet</span>
                  )}
                </div>
             </div>
          </div>
        </div>
      </div>
    )}
    </>
  );
};
