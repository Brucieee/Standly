import React, { useState } from 'react';
import { Standup, User, Comment, Reaction } from '../types';
import { X, Clock, CheckCircle2, AlertCircle, ExternalLink, MessageCircle, Reply, Send, Eye, Smile, Meh, Frown, Trash2, Edit2 } from 'lucide-react';
import { renderTextWithMentions, isUserMentioned } from './mentionUtils';

const REACTION_TYPES = [
  { id: 'like', icon: '👍', label: 'Like' },
  { id: 'love', icon: '❤️', label: 'Love' },
  { id: 'haha', icon: '😂', label: 'Haha' },
  { id: 'wow', icon: '😮', label: 'Wow' },
  { id: 'sad', icon: '😢', label: 'Sad' },
  { id: 'angry', icon: '😡', label: 'Angry' },
];

interface StandupFeedModalProps {
  standup: Standup;
  users: User[];
  currentUserId: string;
  initialReadCount: number;
  onClose: () => void;
  onReact: (standupId: string, reactionType: string) => void;
  onComment: (standupId: string, text: string, parentId?: string) => void;
  onEditComment?: (commentId: string, text: string) => void;
  onDeleteComment?: (commentId: string) => void;
}

export const StandupFeedModal: React.FC<StandupFeedModalProps> = ({
  standup,
  users,
  currentUserId,
  initialReadCount,
  onClose,
  onReact,
  onComment,
  onEditComment,
  onDeleteComment
}) => {
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editCommentText, setEditCommentText] = useState('');
  
  // Mention states
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  
  type SuggestionItem = User | { name: string; isEveryone: boolean; id: string; role: string; avatar: string };

  const filteredUsers: SuggestionItem[] = mentionQuery !== null 
    ? [
        ...(users
            .filter(u => u.name.toLowerCase().includes(mentionQuery.toLowerCase()) && u.id !== currentUserId)
            .map(u => ({ ...u, isEveryone: false }))),
        ...('everyone'.includes(mentionQuery.toLowerCase()) ? [{ name: 'everyone', isEveryone: true, id: 'everyone', role: 'Notify all users', avatar: '' }] : [])
      ]
    : [];

  // Reset highlighted index when query changes
  React.useEffect(() => {
    setHighlightedIndex(0);
  }, [mentionQuery]);

  // We'll focus on the main "new comment" input for this feature to keep it clean first
  const handleCommentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewComment(value);

    // Check for mention trigger
    const cursorPosition = e.target.selectionStart || 0;
    const textBeforeCursor = value.slice(0, cursorPosition);
    const lastWord = textBeforeCursor.split(' ').pop();

    if (lastWord && lastWord.startsWith('@')) {
      setMentionQuery(lastWord.slice(1));
    } else {
      setMentionQuery(null);
    }
  };

  const handleSelectUser = (user: SuggestionItem) => {
    if (mentionQuery === null) return;
    
    // Replace the last @partial with @Name
    // Use First Name only unless it's "everyone"
    const nameToInsert = 'isEveryone' in user && user.isEveryone ? 'everyone' : user.name.split(' ')[0];

    const lastIndex = newComment.lastIndexOf(`@${mentionQuery}`);
    if (lastIndex !== -1) {
      const prefix = newComment.substring(0, lastIndex);
      const suffix = newComment.substring(lastIndex + mentionQuery.length + 1);
      const newValue = `${prefix}@${nameToInsert} ${suffix}`;
      setNewComment(newValue);
      setMentionQuery(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (mentionQuery !== null && filteredUsers.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlightedIndex(prev => (prev + 1) % filteredUsers.length);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlightedIndex(prev => (prev - 1 + filteredUsers.length) % filteredUsers.length);
        return;
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSelectUser(filteredUsers[highlightedIndex]);
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        setMentionQuery(null);
        return;
      }
    }

    if (e.key === 'Enter' && newComment.trim()) {
      onComment(standup.id, newComment);
      setNewComment('');
      setMentionQuery(null); // Ensure dropdown is closed on submit
    }
  };

  const getMoodIcon = (mood: string, size: number = 28) => {
    switch (mood) {
      case 'happy': return <Smile className="text-green-500" size={size} />;
      case 'neutral': return <Meh className="text-yellow-500" size={size} />;
      case 'stressed': return <Frown className="text-red-500" size={size} />;
      default: return <Smile className="text-slate-400" size={size} />;
    }
  };

  const handleStartEdit = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditCommentText(comment.text);
    setReplyingTo(null);
  };

  const handleSaveEdit = () => {
    if (editingCommentId && editCommentText.trim() && onEditComment) {
      onEditComment(editingCommentId, editCommentText);
      setEditingCommentId(null);
      setEditCommentText('');
    }
  };

  const renderCommentContent = (text: string) => {
    // First, get the mentions processed
    const nodes = renderTextWithMentions(text, users);
    
    // Then process links in any string nodes
    return nodes.map((node, index) => {
      if (typeof node === 'string') {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const parts = node.split(urlRegex);
        return (
          <React.Fragment key={index}>
            {parts.map((part, partIndex) => {
              if (part.match(urlRegex)) {
                return (
                  <a
                    key={partIndex}
                    href={part}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:underline break-all"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {part}
                  </a>
                );
              }
              return part;
            })}
          </React.Fragment>
        );
      }
      return <React.Fragment key={index}>{node}</React.Fragment>;
    });
  };

  // Helper to render a single comment item (used for both root comments and replies)
  const renderCommentItem = (comment: any, isReply = false) => {
    const user = users.find(u => u.id === comment.userId);
    const isAuthor = comment.userId === currentUserId;
    const isEditing = editingCommentId === comment.id;
    
    // Check for highlighting
    const currentUser = users.find(u => u.id === currentUserId);
    const originalIndex = standup.comments?.findIndex((c: any) => c.id === comment.id) ?? -1;
    const isUnread = originalIndex !== -1 && originalIndex >= initialReadCount;
    // We assume 'isUserMentioned' handles the logic correctly including @everyone
    const isMentioned = currentUser ? isUserMentioned(comment.text, currentUser) : false;
    const shouldHighlight = isUnread && isMentioned;

    return (
      <div key={comment.id} className={`flex gap-3 ${isReply ? 'mt-3' : ''}`}>
        <img 
          src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name || 'User'}`} 
          alt="User"
          className={`${isReply ? 'w-6 h-6' : 'w-8 h-8'} rounded-full bg-slate-100 object-cover flex-shrink-0`}
          onError={(e) => {
            e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=random`;
          }}
        />
        <div className="flex-1 space-y-2">
          <div className={`
            rounded-2xl rounded-tl-none p-4 group relative break-words transition-colors duration-300
            ${shouldHighlight ? 'bg-purple-50 border border-purple-200 shadow-sm' : 'bg-slate-50'}
          `}>
            <div className="flex justify-between items-start mb-1 gap-2">
              <div className="flex items-baseline gap-2">
                <span className={`font-bold ${isReply ? 'text-xs' : 'text-sm'} text-slate-900`}>
                    {user?.name || 'Unknown'}
                </span>
                <span className="text-xs text-slate-400">
                    {new Date(comment.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
              </div>

              {/* Edit/Delete Actions - Moved here to avoid overlap */}
              {isAuthor && !isEditing && (
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleStartEdit(comment)} className="p-1 text-slate-400 hover:text-indigo-600 rounded">
                    <Edit2 size={12} />
                  </button>
                  {onDeleteComment && (
                    <button onClick={() => onDeleteComment(comment.id)} className="p-1 text-slate-400 hover:text-red-600 rounded">
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              )}
            </div>
            
            {isEditing ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={editCommentText}
                  onChange={(e) => setEditCommentText(e.target.value)}
                  className="flex-1 bg-white border border-indigo-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveEdit();
                    if (e.key === 'Escape') setEditingCommentId(null);
                  }}
                />
                <button onClick={handleSaveEdit} className="text-xs bg-indigo-600 text-white px-2 py-1 rounded-md">Save</button>
                <button onClick={() => setEditingCommentId(null)} className="text-xs text-slate-500 px-2 py-1">Cancel</button>
              </div>
            ) : (
              <p className={`${isReply ? 'text-xs' : 'text-sm'} text-slate-700 whitespace-pre-wrap leading-relaxed`}>
                 {renderCommentContent(comment.text)}
              </p>
            )}
          </div>
          
          {!isReply && (
            <div className="flex items-center gap-4 px-2">
              <button 
                onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                className="text-xs font-bold text-slate-500 hover:text-indigo-600 flex items-center gap-1"
              >
                <Reply size={12} /> Reply
              </button>
            </div>
          )}

          {/* Render Replies */}
          {!isReply && comment.replies && comment.replies.length > 0 && (
            <div className="pl-4 border-l-2 border-slate-100">
              {comment.replies.map((reply: any) => renderCommentItem(reply, true))}
            </div>
          )}

          {/* Reply Input */}
          {!isReply && replyingTo === comment.id && (
            <div className="flex gap-2 mt-2 animate-fade-in-up pl-4">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write a reply..."
                className="flex-1 bg-slate-50 border-0 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && replyText.trim()) {
                    onComment(standup.id, replyText, comment.id);
                    setReplyText('');
                    setReplyingTo(null);
                  }
                }}
              />
              <button 
                onClick={() => {
                  if (replyText.trim()) {
                    onComment(standup.id, replyText, comment.id);
                    setReplyText('');
                    setReplyingTo(null);
                  }
                }}
                className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
              >
                <Send size={14} />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Prepare comments data
  const rawComments = standup.comments || [];
  const rootComments = rawComments
    .filter((c: any) => !c.parentId && !c.parent_id)
    .map((c: any) => ({
      ...c,
      userId: c.userId || c.user_id,
      createdAt: c.createdAt || c.created_at,
      replies: rawComments
        .filter((r: any) => r.parentId === c.id || r.parent_id === c.id)
        .map((r: any) => ({
          ...r,
          userId: r.userId || r.user_id,
          createdAt: r.createdAt || r.created_at
        }))
    }));

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-fade-in-up" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center flex-shrink-0">
          <div className="flex items-center gap-3">
            <img 
              src={users.find(u => u.id === standup.userId)?.avatar || `https://ui-avatars.com/api/?name=${users.find(u => u.id === standup.userId)?.name || 'User'}`} 
              alt="User"
              className="w-10 h-10 rounded-full bg-slate-100 object-cover"
              onError={(e) => {
                e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(users.find(u => u.id === standup.userId)?.name || 'User')}&background=random`;
              }}
            />
            <div>
              <h3 className="font-bold text-slate-900">{users.find(u => u.id === standup.userId)?.name || 'Unknown User'}</h3>
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <Clock size={12} />
                {new Date(standup.createdAt || standup.date + 'T00:00:00').toLocaleString(undefined, { weekday: 'long', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' })}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8 gap-y-8">
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2"><CheckCircle2 size={14} className="text-green-500" /> Yesterday</h4>
                  <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">{standup.yesterday}</p>
                </div>
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2"><Clock size={14} className="text-indigo-500" /> Today</h4>
                  <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">{standup.today}</p>
                </div>
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2"><AlertCircle size={14} className="text-red-500" /> Blockers</h4>
                  <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">{standup.blockers || <span className="text-slate-400 italic">None</span>}</p>
                </div>
                <div className="space-y-2">
                   <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mood</h4>
                   <div className="flex items-center gap-2">{getMoodIcon(standup.mood)}<span className="text-sm font-medium text-slate-700 capitalize">{standup.mood}</span></div>
                </div>
           </div>

           {standup.jiraLinks && standup.jiraLinks.length > 0 && (
              <div className="pt-4 border-t border-slate-100 space-y-2">
                {standup.jiraLinks.map((link, index) => (
                  <a key={index} href={link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:underline bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors mr-2 mb-2">
                    <ExternalLink size={14} /> View Jira Ticket {standup.jiraLinks!.length > 1 ? `#${index + 1}` : ''}
                  </a>
                ))}
              </div>
           )}

           {/* Reactions & Comments */}
           <div className="pt-6 border-t border-slate-100">
              <div className="flex items-center gap-4 mb-6">
                <div className="flex gap-2">
                  {REACTION_TYPES.map((reaction) => {
                    const isSelected = standup.reactions?.some(r => r.userId === currentUserId && r.type === reaction.id);
                    return (
                      <button 
                        key={reaction.id} 
                        onClick={() => onReact(standup.id, reaction.id)} 
                        className={`w-10 h-10 flex items-center justify-center rounded-full text-xl transition-all hover:scale-110 active:scale-95 ${isSelected ? 'bg-indigo-100 border-2 border-indigo-200 shadow-inner' : 'bg-slate-50 hover:bg-slate-100'}`} 
                        title={reaction.label}
                      >
                        {reaction.icon}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Who Reacted Section */}
              {standup.reactions && standup.reactions.length > 0 && (
                <div className="flex flex-wrap gap-3 mb-6">
                  {Object.entries(
                    standup.reactions.reduce((acc: any, r: Reaction) => {
                      if (!acc[r.type]) acc[r.type] = [];
                      acc[r.type].push(r);
                      return acc;
                    }, {})
                  ).map(([type, reactions]: [string, any]) => (
                    <div key={type} className="flex items-center gap-2 bg-slate-50 rounded-full pl-2 pr-3 py-1 border border-slate-100">
                      <span className="text-sm">{REACTION_TYPES.find(t => t.id === type)?.icon}</span>
                      <div className="flex -space-x-2">
                        {reactions.map((r: any) => (
                          <img 
                            key={r.id} 
                            src={r.user?.avatar || `https://ui-avatars.com/api/?name=${r.user?.name || 'User'}`} 
                            alt={r.user?.name} 
                            title={r.user?.name}
                            className="w-5 h-5 rounded-full border border-white object-cover" 
                            onError={(e) => {
                              e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(r.user?.name || 'User')}&background=random`;
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-6">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2"><MessageCircle size={14} /> Comments ({standup.comments?.length || 0})</h4>
                <div className="space-y-6">{rootComments.map(comment => renderCommentItem(comment))}</div>
                <div className="flex gap-3 pt-2 relative">
                  {/* Mention Suggestions */}
                  {mentionQuery !== null && filteredUsers.length > 0 && (
                    <div className="absolute bottom-full left-12 mb-2 w-64 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-20 animate-fade-in-up">
                      <div className="max-h-48 overflow-y-auto">
                        {filteredUsers.map((user, index) => (
                          <button
                            key={user.id}
                            onClick={() => handleSelectUser(user)}
                            className={`w-full flex items-center gap-3 p-3 transition-colors text-left ${index === highlightedIndex ? 'bg-indigo-50' : 'hover:bg-slate-50'}`}
                          >
                            {'isEveryone' in user && user.isEveryone ? (
                                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                                    <span className="font-bold text-xs">ALL</span>
                                </div>
                            ) : (
                                <img 
                                src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}`} 
                                alt={user.name}
                                className="w-8 h-8 rounded-full bg-slate-100 object-cover"
                                onError={(e) => {
                                    e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`;
                                }}
                                />
                            )}
                            <div>
                              <p className="text-sm font-bold text-slate-900">{'isEveryone' in user && user.isEveryone ? '@everyone' : user.name}</p>
                              <p className="text-xs text-slate-500">{user.role}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <img 
                    src={users.find(u => u.id === currentUserId)?.avatar || `https://ui-avatars.com/api/?name=${users.find(u => u.id === currentUserId)?.name || 'Me'}`} 
                    alt="Me" 
                    className="w-8 h-8 rounded-full bg-slate-100 object-cover" 
                    onError={(e) => {
                      e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(users.find(u => u.id === currentUserId)?.name || 'Me')}&background=random`;
                    }}
                  />
                  <div className="flex-1 relative">
                    <input 
                      type="text" 
                      value={newComment} 
                      onChange={handleCommentChange} 
                      placeholder="Write a comment... (Type @ to mention)" 
                      className="w-full bg-slate-50 border-0 rounded-xl pl-4 pr-12 py-3 text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all" 
                      onKeyDown={handleKeyDown} 
                    />
                    <button className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-all ${newComment.trim() ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`} disabled={!newComment.trim()} onClick={() => { if (newComment.trim()) { onComment(standup.id, newComment); setNewComment(''); setMentionQuery(null); } }}><Send size={16} /></button>
                  </div>
                </div>
              </div>
           </div>

           <div className="pt-4 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2"><Eye size={14} /> Viewed By</h4>
              <div className="flex flex-wrap gap-2">
                {(standup.views || []).length > 0 ? (standup.views || []).map(viewerId => {
                  const viewer = users.find(u => u.id === viewerId);
                  if (!viewer) return null;
                  return <img 
                    key={viewerId} 
                    src={viewer.avatar || `https://ui-avatars.com/api/?name=${viewer.name || 'User'}`} 
                    alt={viewer.name} 
                    title={viewer.name} 
                    className="w-8 h-8 rounded-full border-2 border-white shadow-sm" 
                    onError={(e) => {
                      e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(viewer.name || 'User')}&background=random`;
                    }}
                  />;
                }) : <span className="text-sm text-slate-400 italic">No views yet</span>}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};