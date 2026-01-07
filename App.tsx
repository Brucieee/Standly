import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { StandupModal } from './components/StandupModal';
import { AuthPage } from './components/AuthPage';
import { Profile } from './components/Profile';
import { Dashboard } from './components/Dashboard';
import { AppState, User, Standup, Deadline } from './types';
import { apiAuth, apiStandups, apiUsers, apiDeadlines } from './services/api';
import { supabase } from './services/supabase';
import { DeadlineModal } from './components/DeadlineModal';
import { WeeklySummaryWidget } from './components/WeeklySummaryWidget';
import { ConfirmationModal } from './components/ConfirmationModal';
import { History } from './components/History';
import { SuccessModal } from './components/SuccessModal';
import { VirtualOfficeModal } from './components/VirtualOfficeModal';

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
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const user = await apiAuth.getCurrentUser();
        if (user) {
           setState(prev => ({ ...prev, currentUser: user }));
           loadData(); // Reload data on auth change
        }
      } else {
        setState(prev => ({ ...prev, currentUser: null, users: [], standups: [], deadlines: [] }));
      }
      setLoading(false);
    });
    return () => subscription.unsubscribe();
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
      const [users, standups, deadlines] = await Promise.all([
        apiUsers.getAll(),
        apiStandups.getAll(),
        apiDeadlines.getAll()
      ]);
      setState(prev => ({ ...prev, users, standups, deadlines }));
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

  const handleRegister = async (email: string, password: string, name: string) => {
    try {
      const { user, session } = await apiAuth.signUp(email, password, name);
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
        alert('Failed to update profile.');
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500">Loading...</div>;
  }

  // Auth Guard
  if (!state.currentUser) {
    return (
      <>
        <AuthPage key={authKey} onLogin={handleLogin} onRegister={handleRegister} />
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
        />
      )}

      {activeTab === 'history' && (
        <History 
          standups={sortedStandups}
          deadlines={state.deadlines}
          users={state.users}
        />
      )}

      {activeTab === 'profile' && (
        <Profile user={state.currentUser} onUpdate={handleUpdateProfile} />
      )}

      <StandupModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSubmit={handleSaveStandup}
        initialData={editingStandup}
        initialDate={modalInitialDate}
      />

      <DeadlineModal
        isOpen={isDeadlineModalOpen}
        onClose={() => {
          setIsDeadlineModalOpen(false);
          setEditingDeadline(null);
        }}
        onSubmit={handleSaveDeadline}
        initialData={editingDeadline}
      />

      <VirtualOfficeModal
        isOpen={isVirtualOfficeModalOpen}
        onClose={() => setIsVirtualOfficeModalOpen(false)}
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
    </Layout>
  );
};

export default App;