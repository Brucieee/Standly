import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Standup, User, Comment, Reaction } from '../types';
import { Trash2, Edit2, ExternalLink, Smile, Meh, Frown, MessageCircle } from 'lucide-react';
import { StandupFeedModal } from './StandupFeedModal';
import { isUserMentioned } from './mentionUtils';

const REACTION_TYPES = [
  { id: 'like', icon: '👍', label: 'Like' },
  { id: 'love', icon: '❤️', label: 'Love' },
  { id: 'haha', icon: '😂', label: 'Haha' },
  { id: 'wow', icon: '😮', label: 'Wow' },
  { id: 'sad', icon: '😢', label: 'Sad' },
  { id: 'angry', icon: '😡', label: 'Angry' },
];

interface StandupFeedProps {
  standups: Standup[];
  users: User[];
  currentUserId: string;
  onDelete: (id: string) => void;
  onEdit: (standup: Standup) => void;
  onView: (standup: Standup) => void;
  onReact: (standupId: string, reactionType: string) => void;
  onComment: (standupId: string, text: string, parentId?: string) => void;
  onEditComment?: (commentId: string, text: string) => void;
  onDeleteComment?: (commentId: string) => void;
}

export const StandupFeed: React.FC<StandupFeedProps> = ({ standups, users, currentUserId, onDelete, onEdit, onView, onReact, onComment, onEditComment, onDeleteComment }) => {
  const [selectedStandupId, setSelectedStandupId] = useState<string | null>(null);
  const storageKey = `standly_read_counts_${currentUserId}`;
  const [readCounts, setReadCounts] = useState<Record<string, number>>({});

  // Sync with local storage when user changes or on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      // If there's stored data, parse and set it. Otherwise, reset to an empty object.
      // This ensures that changing users doesn't leave stale read counts in state.
      setReadCounts(stored ? JSON.parse(stored) : {});
    } catch {
      // If parsing fails, reset to an empty object.
      setReadCounts({});
    }
  }, [storageKey]);

  const updateReadCount = (standupId: string, count: number) => {
    // Use a functional update to ensure we're always working with the latest state,
    // preventing race conditions and ensuring previously read counts are preserved.
    setReadCounts(prevCounts => {
      const newCounts = { ...prevCounts, [standupId]: count };
      localStorage.setItem(storageKey, JSON.stringify(newCounts));
      return newCounts;
    });
  };

  const selectedStandup = selectedStandupId ? standups.find(s => s.id === selectedStandupId) || null : null;

  const getMoodIcon = (mood: string, size: number = 28) => {
    switch (mood) {
      case 'happy': return <Smile className="text-green-500" size={size} />;
      case 'neutral': return <Meh className="text-yellow-500" size={size} />;
      case 'stressed': return <Frown className="text-red-500" size={size} />;
      default: return <Smile className="text-slate-400" size={size} />;
    }
  };

  // Filter standups to show only today's entries
  const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD format in local time
  const todaysStandups = standups.filter(s => {
    const standupDate = s.date.includes('T') ? s.date.split('T')[0] : s.date;
    return standupDate === today;
  });

  // Group standups by date to create sections
  const groupedStandups = todaysStandups.reduce((groups, standup) => {
    // Check if date string already has time component (contains 'T') to avoid double appending
    const dateStr = standup.date && standup.date.includes('T') ? standup.date : (standup.date + 'T00:00:00');
    const dateObj = new Date(dateStr);
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

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {groupStandups.map((standup) => {
              const user = users.find(u => u.id === standup.userId);
              const isCurrentUser = standup.userId === currentUserId;
              const date = new Date(standup.date);
              const isViewed = standup.views?.includes(currentUserId);
              const creationDate = standup.createdAt ? new Date(standup.createdAt) : new Date(standup.date + 'T00:00:00');
              const timeStr = creationDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              const hasLinks = standup.jiraLinks && standup.jiraLinks.length > 0;
              
              // Mock data for UI demonstration if fields don't exist
              const comments = standup.comments || [];
              const reactions = standup.reactions || [];
              
              // Calculate unread comments and check for relevant notifications
              const lastReadCount = readCounts[standup.id] || 0;
              const rawUnreadCount = Math.max(0, comments.length - lastReadCount);
              
              let showNotification = false;
              let notificationCount = 0;

              if (rawUnreadCount > 0) {
                 // Get the actual new comments based on count
                 // We assume comments are appended, so the last 'rawUnreadCount' are new.
                 const newComments = comments.slice(comments.length - rawUnreadCount);
                 const currentUser = users.find(u => u.id === currentUserId);
                 
                 if (isCurrentUser) {
                     // If it's my standup, notify me about any comments from others
                     const commentsFromOthers = newComments.filter(c => c.userId !== currentUserId);
                     if (commentsFromOthers.length > 0) {
                         showNotification = true;
                         notificationCount = commentsFromOthers.length;
                     }
                 } else {
                     // If it's someone else's standup, only notify if I am tagged
                     if (currentUser) {
                         const taggedComments = newComments.filter(c => isUserMentioned(c.text, currentUser));
                         
                         if (taggedComments.length > 0) {
                             showNotification = true;
                             notificationCount = taggedComments.length;
                         }
                     }
                 }
              }

              return (
                <div 
                  key={standup.id} 
                  onClick={() => {
                    setSelectedStandupId(standup.id);
                    onView(standup);
                    updateReadCount(standup.id, comments.length);
                  }}
                  className={`
                    relative bg-white rounded-2xl p-6 cursor-pointer group transition-all duration-300
                    border shadow-sm hover:shadow-xl hover:-translate-y-1 hover:z-10
                    ${isViewed ? 'border-indigo-500 ring-1 ring-indigo-500/20' : 'border-slate-100'}
                  `}
                >
                  {/* Gradient Top Border Effect on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 h-1 top-0 w-full rounded-t-2xl" />
                  
                  {/* Unread Indicator (Blue Dot) - Shows if I haven't viewed the standup itself yet */}
                  {!isViewed && !isCurrentUser && (
                     <div className="absolute top-5 right-5 w-2 h-2 bg-indigo-500 rounded-full animate-pulse shadow-lg shadow-indigo-200" />
                  )}

                  {/* New Comments Ping Notification (Red Badge) - Specific Logic */}
                  {showNotification && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 z-20">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <div className="relative inline-flex rounded-full h-6 w-6 bg-red-500 text-white text-xs font-bold items-center justify-center border-2 border-white shadow-md">
                        {notificationCount}
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-4">
                      <div className="relative flex-shrink-0">
                          <img 
                            src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name || 'User'}`} 
                            alt={user?.name}
                            className="w-12 h-12 rounded-xl bg-slate-100 object-cover shadow-sm group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=random`;
                            }}
                          />
                          <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
                              {getMoodIcon(standup.mood, 18)}
                          </div>
                      </div>
                      
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors leading-tight">
                          {user?.name || 'Unknown User'}
                        </h3>
                        <p className="text-xs font-medium text-indigo-500 mb-0.5">
                          {user?.role || 'Software Developer'}
                        </p>
                        <div className="flex justify-between items-end">
                          <p className="text-[10px] text-slate-400 flex items-center gap-1 font-medium uppercase tracking-wide">
                            {timeStr}
                          </p>
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
                  </div>

                  {/* Jira Links on Card */}
                  {hasLinks && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {standup.jiraLinks!.map((link, i) => (
                        <a 
                          key={i}
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 text-[10px] font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md hover:bg-indigo-100 transition-colors border border-indigo-100"
                          title={link}
                        >
                          <ExternalLink size={10} />
                          Ticket {i + 1}
                        </a>
                      ))}
                    </div>
                  )}

                  {/* Card Footer: Reactions & Comments */}
                  <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-2 relative">
                      {/* Reaction Picker on Hover */}
                      <div className="absolute top-full left-0 mt-2 bg-white rounded-full shadow-xl border border-slate-100 p-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 scale-90 group-hover:scale-100 origin-top-left z-20">
                        {REACTION_TYPES.map((reaction) => (
                          <button
                            key={reaction.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              onReact(standup.id, reaction.id);
                            }}
                            className="w-8 h-8 flex items-center justify-center hover:bg-slate-50 rounded-full text-lg transition-transform hover:scale-125"
                            title={reaction.label}
                          >
                            {reaction.icon}
                          </button>
                        ))}
                      </div>

                      {/* Existing Reactions */}
                      <div className="flex -space-x-1">
                        {reactions.length > 0 ? (
                          // Group reactions by type and show top 3
                          [...new Set(reactions.map((r: Reaction) => r.type))].slice(0, 3).map((type: string) => {
                            const rIcon = REACTION_TYPES.find(rt => rt.id === type)?.icon;
                            return (
                              <div key={type} className="w-8 h-8 rounded-full bg-slate-50 border border-white flex items-center justify-center text-sm shadow-sm">
                                {rIcon}
                              </div>
                            );
                          })
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-slate-50 border border-white flex items-center justify-center text-slate-300 shadow-sm">
                            <Smile size={12} />
                          </div>
                        )}
                      </div>
                      <span className="text-xs font-medium text-slate-500">
                        {reactions.length > 0 ? reactions.length : 'React'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-slate-400">
                      <MessageCircle size={14} />
                      <span className="text-xs font-medium">{comments.length}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
      
      {todaysStandups.length === 0 && (
        <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
          <p className="text-slate-500">No Standup entries posted for today</p>
        </div>
      )}
    </div>

    {selectedStandup && createPortal(
      <StandupFeedModal
        standup={selectedStandup}
        users={users}
        currentUserId={currentUserId}
        onClose={() => {
          if (selectedStandup) {
            updateReadCount(selectedStandup.id, (selectedStandup.comments || []).length);
          }
          setSelectedStandupId(null);
        }}
        onReact={onReact}
        onComment={onComment}
        onEditComment={onEditComment}
        onDeleteComment={onDeleteComment}
      />,
      document.body
    )}
    </>
  );
};
