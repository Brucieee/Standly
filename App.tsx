import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Layout } from './components/Layout';
import { StandupModal } from './components/StandupModal';
import { AuthPage } from './components/AuthPage';
import { Profile } from './components/Profile';
import { Dashboard } from './components/Dashboard';
import { AppState, User, Standup, Deadline, Leave } from './types';
import { apiAuth, apiStandups, apiUsers, apiDeadlines, apiLeaves } from './services/api';
import { supabase } from './services/supabase';
import { DeadlineModal } from './components/DeadlineModal';
import { WeeklySummaryWidget } from './components/WeeklySummaryWidget';
import { ConfirmationModal } from './components/ConfirmationModal';
import { History } from './components/History';
import { SuccessModal } from './components/SuccessModal';
import { VirtualOfficeModal } from './components/VirtualOfficeModal';
import { LeaveCalendar } from './components/LeaveCalendar';
import { CodeErrorModal } from './components/CodeErrorModal';
import { LeaveModal } from './components/LeaveModal';
import { ViewLeaveModal } from './components/ViewLeaveModal';
import { HolidayModal } from './components/HolidayModal';

interface ConfirmModalState {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void | Promise<void>;
  isDestructive: boolean;
}

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    currentUser: null,
    users: [],
    standups: [],
    deadlines: [],
    leaves: [],
    holidays: [],
  });

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeadlineModalOpen, setIsDeadlineModalOpen] = useState(false);
  const [editingStandup, setEditingStandup] = useState<Standup | null>(null);
  const [editingDeadline, setEditingDeadline] = useState<Deadline | null>(null);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [modalInitialDate, setModalInitialDate] = useState<string>('');
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [isVirtualOfficeModalOpen, setIsVirtualOfficeModalOpen] = useState(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [isViewLeaveModalOpen, setIsViewLeaveModalOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState<Leave | null>(null);
  const [editingLeave, setEditingLeave] = useState<Leave | null>(null);
  const [isHolidayModalOpen, setIsHolidayModalOpen] = useState(false);
  const [authKey, setAuthKey] = useState(0); // Used to reset AuthPage state

  // Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState<ConfirmModalState>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    isDestructive: false,
  });

  useEffect(() => {
    // Update document title and favicon
    document.title = 'Standly';
    const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
    if (link) {
      link.href = 'https://qizxqbaylaaatskyqzpl.supabase.co/storage/v1/object/public/Standly/assets/logo.png';
    } else {
      const newLink = document.createElement('link');
      newLink.rel = 'icon';
      newLink.href = 'https://qizxqbaylaaatskyqzpl.supabase.co/storage/v1/object/public/Standly/assets/logo.png';
      document.head.appendChild(newLink);
    }

    // Check for code login first, otherwise check supabase session
    const storedCode = localStorage.getItem('standly_login_code');
    if (storedCode) {
      handleCodeLogin(storedCode);
    } else {
      checkSession();
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const user = await apiAuth.getCurrentUser();
        if (user) {
           setState(prev => ({ ...prev, currentUser: user }));
           loadData(); // Reload data on auth change
        }
      } else {
        // Only clear state if we are NOT using a code login
        // This prevents Supabase Auth (which is null for code login) from wiping the code login session
        if (!localStorage.getItem('standly_login_code')) {
          setState(prev => ({ ...prev, currentUser: null, users: [], standups: [], deadlines: [], leaves: [] }));
        }
      }
      setLoading(false);
    });

    // Safety timeout: If auth takes too long (e.g. network issues), stop loading so user sees something
    const safetyTimeout = setTimeout(() => {
      setLoading(false);
    }, 5000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(safetyTimeout);
    };
  }, []);

  const checkSession = async () => {
    try {
      const user = await apiAuth.getCurrentUser();
      if (user) {
        setState(prev => ({ ...prev, currentUser: user }));
        await loadData();
      }
    } catch (error) {
      console.error('Session check failed', error);
    } finally {
      setLoading(false);
    }
  };

  const loadData = async () => {
    try {
      // Fetch users directly from profiles
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('*');

      if (usersError) throw usersError;

      // Helper to map DB profile to User type (handles different column names)
      const mapProfileToUser = (profile: any) => ({
        id: profile.id,
        name: profile.name || profile.full_name || 'Unknown',
        avatar: profile.avatar || profile.avatar_url || null,
        role: profile.role || 'user',
        isAdmin: profile.is_admin || false,
        email: profile.email || ''
      });

      const mappedUsers = (usersData || []).map(mapProfileToUser);

      // Fetch standups with relations
      const { data: standupsData, error: standupsError } = await supabase
        .from('standups')
        .select(`
          *,
          user:profiles(*),
          comments:standup_comments(*, user:profiles(*)),
          reactions:standup_reactions(*, user:profiles(*))
        `)
        .order('date', { ascending: false });

      if (standupsError) throw standupsError;

      const unknownUser = { id: 'unknown', name: 'Unknown User', avatar: null, role: 'user', email: '' };

      // Map standups to include mapped user details
      const mappedStandups = (standupsData || []).map((s: any) => {
        const standupUserRaw = Array.isArray(s.user) ? s.user[0] : s.user;
        const standupUser = (standupUserRaw ? mapProfileToUser(standupUserRaw) : mappedUsers.find(u => u.id === (s.user_id || s.userId))) || unknownUser;

        const comments = (s.comments || []).map((c: any) => {
          const commentUserRaw = Array.isArray(c.user) ? c.user[0] : c.user;
          const commentUser = (commentUserRaw ? mapProfileToUser(commentUserRaw) : mappedUsers.find(u => u.id === (c.user_id || c.userId))) || unknownUser;
          return {
            ...c,
            userId: c.user_id || c.userId,
            user: commentUser,
            createdAt: c.created_at
          };
        }).sort((a: any, b: any) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime());

        const reactions = (s.reactions || []).map((r: any) => {
          const reactionUserRaw = Array.isArray(r.user) ? r.user[0] : r.user;
          const reactionUser = (reactionUserRaw ? mapProfileToUser(reactionUserRaw) : mappedUsers.find(u => u.id === (r.user_id || r.userId))) || unknownUser;
          return {
            ...r,
            userId: r.user_id || r.userId,
            user: reactionUser
          };
        });

        return {
          ...s,
          userId: s.user_id || s.userId,
          user: standupUser,
          comments,
          reactions,
          createdAt: s.created_at
        };
      });

      // Fetch holidays
      const { data: holidaysData } = await supabase
        .from('holidays')
        .select('*');

      // Fetch leaves directly to ensure correct mapping of time fields
      const { data: leavesData, error: leavesError } = await supabase
        .from('leaves')
        .select('*');

      if (leavesError) throw leavesError;

      const mappedLeaves = (leavesData || []).map((l: any) => ({
        ...l,
        userId: l.user_id,
        startDate: l.start_date,
        endDate: l.end_date,
        startTime: l.start_time,
        endTime: l.end_time
      }));

      const [deadlines] = await Promise.all([
        apiDeadlines.getAll()
      ]);
      
      setState(prev => ({ 
        ...prev, 
        users: mappedUsers, 
        // Refresh current user role from latest profile data
        currentUser: prev.currentUser ? (mappedUsers.find(u => u.id === prev.currentUser.id) || prev.currentUser) : prev.currentUser,
        standups: mappedStandups as any, 
        deadlines, 
        leaves: mappedLeaves, 
        holidays: holidaysData || [] 
      }));
    } catch (error) {
      console.error('Failed to load data', error);
    }
  };

  const sortedStandups = [...state.standups].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Handlers
  const handleLogin = async (email: string, password: string) => {
    try {
      await apiAuth.signIn(email, password);
    } catch (error: any) {
      console.error('Login failed', error);
      alert(error.message || 'Failed to login. Please check your credentials.');
    }
  };

  const handleCodeLogin = async (code: string) => {
    try {
      const user = await apiAuth.loginWithCode(code);
      setState(prev => ({ ...prev, currentUser: user }));
      localStorage.setItem('standly_login_code', code); // Persist login
      await loadData();
    } catch (error: any) {
      console.error('Code login failed', error);
      localStorage.removeItem('standly_login_code'); // Clear invalid code
      alert(error.message || 'Invalid login code.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (email: string, password: string, name: string, role: string) => {
    try {
      const { user, session } = await apiAuth.signUp(email, password, name, role);
      if (user && !session) {
        setSuccessModalOpen(true);
        setAuthKey(prev => prev + 1); // Remount AuthPage to reset to Login view
      }
    } catch (error: any) {
      console.error('Registration failed', error);
      alert(error.message || 'Failed to register.');
    }
  };

  const handleLogout = async () => {
    await apiAuth.signOut();
    localStorage.removeItem('standly_login_code');
    setActiveTab('dashboard');
  };

  const handleOpenNewStandup = () => {
    setEditingStandup(null);
    setModalInitialDate(new Date().toISOString().split('T')[0]);
    setIsModalOpen(true);
  };

  const handleEditStandup = (standup: Standup) => {
    setEditingStandup(standup);
    setModalInitialDate('');
    setIsModalOpen(true);
  };

  const handleCalendarDateClick = (dateStr: string) => {
    const existing = state.standups.find(s => 
      s.userId === state.currentUser?.id && s.date.startsWith(dateStr)
    );
    if (existing) {
      handleEditStandup(existing);
    } else {
      setEditingStandup(null);
      setModalInitialDate(dateStr);
      setIsModalOpen(true);
    }
  };

  const handleSaveStandup = async (data: { date: string; yesterday: string; today: string; blockers: string; mood: 'happy' | 'neutral' | 'stressed'; jiraLinks?: string[] }) => {
    if (!state.currentUser) return;
    
    try {
      if (editingStandup) {
        await apiStandups.update(editingStandup.id, data);
        setState(prev => ({
          ...prev,
          standups: prev.standups.map(s => s.id === editingStandup.id ? { ...s, ...data } : s)
        }));
      } else {
        const newStandup = await apiStandups.create({
          userId: state.currentUser.id,
          ...data
        });
        setState(prev => ({
          ...prev,
          standups: [newStandup, ...prev.standups]
        }));
      }
      setIsModalOpen(false); // Close modal on success
    } catch (error) {
      console.error('Failed to save standup', error);
      alert('Failed to save standup. Please try again.');
    }
  };

  const handleViewStandup = async (standup: Standup) => {
    if (!state.currentUser) return;
    if (standup.views?.includes(state.currentUser.id)) return;

    try {
      await apiStandups.markViewed(standup.id, state.currentUser.id);
      setState(prev => ({
        ...prev,
        standups: prev.standups.map(s => 
          s.id === standup.id ? { ...s, views: [...(s.views || []), state.currentUser!.id] } : s
        )
      }));
    } catch (error) {
      console.error('Failed to mark standup as viewed', error);
    }
  };

  const handleReact = async (standupId: string, reactionType: string) => {
    if (!state.currentUser) return;

    try {
      // Check if reaction already exists
      const { data: existing, error: fetchError } = await supabase
        .from('standup_reactions')
        .select('id, type')
        .eq('standup_id', standupId)
        .eq('user_id', state.currentUser.id)
        .limit(1)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (existing) {
        if (existing.type === reactionType) {
          const { error: deleteError } = await supabase.from('standup_reactions').delete().eq('id', existing.id);
          if (deleteError) throw deleteError;
        } else {
          const { error: updateError } = await supabase.from('standup_reactions').update({ type: reactionType }).eq('id', existing.id);
          if (updateError) throw updateError;
        }
      } else {
        const { error: insertError } = await supabase.from('standup_reactions').insert({
          standup_id: standupId,
          user_id: state.currentUser.id,
          type: reactionType
        });
        if (insertError) throw insertError;
      }
      
      // Refresh data
      await loadData();
    } catch (error) {
      console.error('Error updating reaction:', error);
      if ((error as any).code === '42501') {
        alert('Permission denied: You need to enable RLS policies in Supabase for "standup_reactions".');
      } else {
        alert('Failed to update reaction. Please try again.');
      }
    }
  };

  const handleComment = async (standupId: string, text: string, parentId?: string) => {
    if (!state.currentUser) return;

    try {
      const { error } = await supabase
        .from('standup_comments')
        .insert({
          standup_id: standupId,
          user_id: state.currentUser.id,
          text: text,
          parent_id: parentId || null
        });

      if (error) throw error;

      // Refresh data
      await loadData();
    } catch (error) {
      console.error('Error adding comment:', error);
      if ((error as any).code === '42501') {
        alert('Permission denied: You need to enable RLS policies in Supabase for "standup_comments".');
      } else {
        alert('Failed to add comment. Please try again.');
      }
    }
  };

  const handleEditComment = async (commentId: string, text: string) => {
    if (!state.currentUser) return;
    try {
      const { error } = await supabase
        .from('standup_comments')
        .update({ text })
        .eq('id', commentId);

      if (error) throw error;
      await loadData();
    } catch (error) {
      console.error('Error editing comment:', error);
      if ((error as any).code === '42501') {
        alert('Permission denied: You need to enable UPDATE RLS policies for "standup_comments".');
      } else {
        alert('Failed to edit comment.');
      }
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!state.currentUser) return;
    try {
      const { error } = await supabase
        .from('standup_comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;
      await loadData();
    } catch (error) {
      console.error('Error deleting comment:', error);
      if ((error as any).code === '42501') {
        alert('Permission denied: You need to enable DELETE RLS policies for "standup_comments".');
      } else {
        alert('Failed to delete comment.');
      }
    }
  };

  const handleDeleteStandup = (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Standup',
      message: 'Are you sure you want to delete this standup? This action cannot be undone.',
      isDestructive: true,
      onConfirm: async () => {
        try {
          await apiStandups.delete(id);
          setState(prev => ({
            ...prev,
            standups: prev.standups.filter(s => s.id !== id)
          }));
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        } catch (error) {
          console.error('Failed to delete standup', error);
          alert('Failed to delete standup.');
        }
      }
    });
  };

  const handleSaveDeadline = async (data: Partial<Deadline>) => {
    if (!state.currentUser) return;

    try {
      if (editingDeadline) {
        await apiDeadlines.update(editingDeadline.id, data);
        setState(prev => ({
          ...prev,
          deadlines: prev.deadlines.map(t => t.id === editingDeadline.id ? { ...t, ...data } : t)
        }));
      } else {
        const newDeadline = await apiDeadlines.create({
          creatorId: state.currentUser.id,
          ...data as any
        });

        setState(prev => ({
          ...prev,
          deadlines: [...prev.deadlines, newDeadline]
        }));
      }
      setIsDeadlineModalOpen(false);
      setEditingDeadline(null);
    } catch (error) {
        console.error('Failed to save deadline', error);
        alert('Failed to save deadline.');
    }
  };

  const handleEditDeadline = (deadline: Deadline) => {
    setEditingDeadline(deadline);
    setIsDeadlineModalOpen(true);
  };

  const handleDeleteDeadline = (taskId: string) => {
    if (!taskId) {
      return;
    }

    setConfirmModal({
      isOpen: true,
      title: 'Delete Deadline',
      message: 'Are you sure you want to delete this deadline? This action cannot be undone.',
      isDestructive: true,
      onConfirm: async () => {
        try {
          await apiDeadlines.delete(taskId);
          setState(prev => ({
            ...prev,
            deadlines: prev.deadlines.filter(t => t.id !== taskId)
          }));
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        } catch (error: any) {
          console.error('Failed to delete deadline', error);
          alert(`Failed to delete deadline: ${error.message || 'Unknown error'}. Please check console.`);
        }
      }
    });
  };

  const handleUpdateProfile = async (updated: Partial<User>) => {
    if (!state.currentUser) return;
    
    try {
      await apiAuth.updateProfile(state.currentUser.id, updated);
      
      const updatedUser = { ...state.currentUser, ...updated };
      setState(prev => ({
        ...prev,
        currentUser: updatedUser,
        users: prev.users.map(u => u.id === prev.currentUser!.id ? updatedUser : u)
      }));
    } catch (error) {
        console.error('Failed to update profile', error);
        alert(error.message || 'Failed to update profile.');
    }
  };

  const handleSaveLeave = async (data: Omit<Leave, 'id' | 'userId'>) => {
    if (!state.currentUser) return;
    
    // Map data to match database columns (snake_case for time fields)
    const dbData = {
      ...data,
      start_date: data.startDate,
      end_date: data.endDate,
      start_time: (data as any).startTime || null,
      end_time: (data as any).endTime || null
    };
    // Remove camelCase keys to avoid errors if API is strict
    delete (dbData as any).startDate;
    delete (dbData as any).endDate;
    delete (dbData as any).startTime;
    delete (dbData as any).endTime;

    try {
      if (editingLeave) {
        await supabase.from('leaves').update(dbData).eq('id', editingLeave.id);
        setState(prev => ({
          ...prev,
          leaves: prev.leaves.map(l => l.id === editingLeave.id ? { ...l, ...data } : l)
        }));
      } else {
        const { data: newLeaveData, error } = await supabase.from('leaves').insert({
          user_id: state.currentUser.id,
          ...dbData
        }).select().single();
        
        if (error) throw error;
        
        // Map back to frontend model
        const newLeave = {
            ...newLeaveData,
            userId: newLeaveData.user_id,
            startDate: newLeaveData.start_date,
            endDate: newLeaveData.end_date,
            startTime: newLeaveData.start_time,
            endTime: newLeaveData.end_time
        };

        setState(prev => ({
          ...prev,
          leaves: [...prev.leaves, newLeave]
        }));
      }
      setIsLeaveModalOpen(false);
      setEditingLeave(null);
    } catch (error) {
      console.error('Failed to save leave', error);
      alert('Failed to save leave.');
    }
  };

  const handleDeleteLeave = async (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Cancel Leave',
      message: 'Are you sure you want to cancel this leave request? This action cannot be undone.',
      isDestructive: true,
      onConfirm: async () => {
        try {
          await apiLeaves.delete(id);
          setState(prev => ({
            ...prev,
            leaves: prev.leaves.filter(l => l.id !== id)
          }));
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
          setIsLeaveModalOpen(false);
          setIsViewLeaveModalOpen(false);
        } catch (error) {
          console.error('Failed to delete leave', error);
          alert('Failed to delete leave.');
        }
      }
    });
  };

  const handleSaveHoliday = async (date: string, name: string) => {
    try {
      const { data, error } = await supabase.from('holidays').insert({ date, name }).select().single();
      if (error) throw error;
      setState(prev => ({ ...prev, holidays: [...(prev.holidays || []), data] }));
    } catch (error) {
      console.error('Failed to save holiday', error);
      if ((error as any).code === '42501') {
        alert('Permission denied: Only admins can add holidays. Please ensure your account has "is_admin" set to TRUE in the database.');
      } else {
        alert('Failed to save holiday.');
      }
    }
  };

  const handleDeleteHoliday = async (id: string) => {
    if (!confirm('Delete this holiday?')) return;
    
    try {
      const { error } = await supabase.from('holidays').delete().eq('id', id);
      if (error) throw error;
      setState(prev => ({ ...prev, holidays: (prev.holidays || []).filter(h => h.id !== id) }));
    } catch (error) {
      console.error('Failed to delete holiday', error);
      if ((error as any).code === '42501') {
        alert('Permission denied: Only admins can delete holidays.');
      } else {
        alert('Failed to delete holiday.');
      }
    }
  };

  const getPreviousStandup = () => {
    if (!state.currentUser) return undefined;
    const targetDate = editingStandup ? editingStandup.date : modalInitialDate;
    
    // Filter user's standups
    const userStandups = state.standups.filter(s => s.userId === state.currentUser?.id);
    
    // Sort descending
    const sorted = [...userStandups].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    // Find first one strictly before targetDate
    return sorted.find(s => s.date < targetDate);
  };

  const handleLeaveClick = (leave: Leave) => {
    if (state.currentUser && leave.userId === state.currentUser.id) {
      setEditingLeave(leave);
      setIsLeaveModalOpen(true);
    } else {
      setSelectedLeave(leave);
      setIsViewLeaveModalOpen(true);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500">Loading...</div>;
  }

  // Auth Guard
  if (!state.currentUser) {
    return (
      <>
        <AuthPage key={authKey} onLogin={handleLogin} onCodeLogin={handleCodeLogin} onRegister={handleRegister} />
        <SuccessModal 
          isOpen={successModalOpen} 
          onClose={() => setSuccessModalOpen(false)}
          title="Account Created Successfully!"
          message="Please check your email to confirm your registration before logging in."
        />
      </>
    );
  }

  return (
    <>
      <Layout 
      activeTab={activeTab} 
      onTabChange={setActiveTab}
      onLogout={handleLogout}
      onOpenVirtualOffice={() => setIsVirtualOfficeModalOpen(true)}
      userAvatar={state.currentUser.avatar}
      userName={state.currentUser.name}
      userRole={state.currentUser.role}
    >
      {activeTab === 'dashboard' && (
        <Dashboard
          currentUser={state.currentUser}
          users={state.users}
          standups={sortedStandups}
          deadlines={state.deadlines}
          onGenerateReport={() => setIsSummaryModalOpen(true)}
          onAddDeadline={() => {
            setEditingDeadline(null);
            setIsDeadlineModalOpen(true);
          }}
          onNewStandup={handleOpenNewStandup}
          onDeleteDeadline={handleDeleteDeadline}
          onEditDeadline={handleEditDeadline}
          onEditStandup={handleEditStandup}
          onDeleteStandup={handleDeleteStandup}
          onViewStandup={handleViewStandup}
          onCalendarDateClick={handleCalendarDateClick}
          onReact={handleReact}
          onComment={handleComment}
          onEditComment={handleEditComment}
          onDeleteComment={handleDeleteComment}
        />
      )}

      {activeTab === 'history' && (
        <History 
          standups={sortedStandups}
          deadlines={state.deadlines}
          users={state.users}
          currentUser={state.currentUser}
          onEditDeadline={handleEditDeadline}
          onDeleteDeadline={handleDeleteDeadline}
        />
      )}

      {activeTab === 'leaves' && (
        <LeaveCalendar
          users={state.users}
          leaves={state.leaves}
          holidays={state.holidays || []}
          currentUserId={state.currentUser.id}
          currentUserIsAdmin={state.currentUser.isAdmin}
          onAddLeave={() => {
            setEditingLeave(null);
            setIsLeaveModalOpen(true);
          }}
          onDeleteLeave={handleDeleteLeave}
          onLeaveClick={handleLeaveClick}
          onAddHoliday={() => setIsHolidayModalOpen(true)}
          onDeleteHoliday={handleDeleteHoliday}
        />
      )}

      {activeTab === 'profile' && (
        <Profile user={state.currentUser} onUpdate={handleUpdateProfile} />
      )}
      </Layout>

      <StandupModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSubmit={handleSaveStandup}
        initialData={editingStandup}
        initialDate={modalInitialDate}
        onDelete={editingStandup ? () => handleDeleteStandup(editingStandup.id) : undefined}
        previousStandup={getPreviousStandup()}
      />

      <DeadlineModal
        isOpen={isDeadlineModalOpen}
        onClose={() => {
          setIsDeadlineModalOpen(false);
          setEditingDeadline(null);
        }}
        onSubmit={handleSaveDeadline}
        initialData={editingDeadline}
        onDelete={editingDeadline ? () => handleDeleteDeadline(editingDeadline.id) : undefined}
      />

      <VirtualOfficeModal
        isOpen={isVirtualOfficeModalOpen}
        onClose={() => setIsVirtualOfficeModalOpen(false)}
      />

      <LeaveModal
        isOpen={isLeaveModalOpen}
        onClose={() => setIsLeaveModalOpen(false)}
        onSubmit={handleSaveLeave}
        initialData={editingLeave}
        onDelete={editingLeave ? () => handleDeleteLeave(editingLeave.id) : undefined}
      />

      <ViewLeaveModal
        isOpen={isViewLeaveModalOpen}
        onClose={() => setIsViewLeaveModalOpen(false)}
        leave={selectedLeave}
        user={state.users.find(u => u.id === selectedLeave?.userId)}
        onEdit={(leave) => {
          setIsViewLeaveModalOpen(false);
          setEditingLeave(leave);
          setIsLeaveModalOpen(true);
        }}
        onDelete={(id) => {
          setIsViewLeaveModalOpen(false);
          handleDeleteLeave(id);
        }}
        currentUserId={state.currentUser.id}
      />

      <HolidayModal
        isOpen={isHolidayModalOpen}
        onClose={() => setIsHolidayModalOpen(false)}
        onSubmit={handleSaveHoliday}
      />

      {isSummaryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-slate-900">Weekly AI Summary</h2>
              <button 
                onClick={() => setIsSummaryModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <WeeklySummaryWidget standups={state.standups} users={state.users} deadlines={state.deadlines} />
            </div>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        isDestructive={confirmModal.isDestructive}
      />
    </>
  );
};

export default App;