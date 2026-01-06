import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { StandupFeed } from './components/StandupFeed';
import { CalendarWidget } from './components/CalendarWidget';
import { TasksWidget } from './components/TasksWidget';
import { StandupModal } from './components/StandupModal';
import { AuthPage } from './components/AuthPage';
import { Profile } from './components/Profile';
import { AppState, User, Standup, Task } from './types';
import { apiAuth, apiStandups, apiTasks, apiUsers } from './services/api';
import { Plus, Flag } from 'lucide-react';
import { supabase } from './services/supabase';
import { DeadlineModal } from './components/DeadlineModal';
import { DeadlinesWidget } from './components/DeadlinesWidget';
import { WeeklySummaryWidget } from './components/WeeklySummaryWidget';
import { ConfirmationModal } from './components/ConfirmationModal';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    currentUser: null,
    users: [],
    standups: [],
    tasks: [],
  });

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeadlineModalOpen, setIsDeadlineModalOpen] = useState(false);
  const [editingStandup, setEditingStandup] = useState<Standup | null>(null);
  const [modalInitialDate, setModalInitialDate] = useState<string>('');

  // Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState({
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
        setState(prev => ({ ...prev, currentUser: null, users: [], standups: [], tasks: [] }));
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
      const [users, standups, tasks] = await Promise.all([
        apiUsers.getAll(),
        apiStandups.getAll(),
        apiTasks.getAll()
      ]);
      setState(prev => ({ ...prev, users, standups, tasks }));
    } catch (error) {
      console.error('Failed to load data', error);
    }
  };

  // Sorting standups by date desc
  const sortedStandups = [...state.standups].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const deadlines = state.tasks.filter(t => t.type === 'deadline');
  const teamTasks = state.tasks.filter(t => t.type !== 'deadline');

  // Handlers
  const handleLogin = async (email: string, password: string) => {
     await apiAuth.signIn(email, password);
  };

  const handleRegister = async (email: string, password: string, name: string) => {
    await apiAuth.signUp(email, password, name);
    alert('Please check your email to confirm your account.');
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

  const handleSaveStandup = async (data: { date: string; yesterday: string; today: string; blockers: string; mood: 'happy' | 'neutral' | 'stressed' }) => {
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
        } catch (error) {
          console.error('Failed to delete standup', error);
          alert('Failed to delete standup.');
        }
      }
    });
  };

  const handleAddTask = async (taskData: Omit<Task, 'id' | 'creatorId'>) => {
    if (!state.currentUser) return;

    try {
      const newTask = await apiTasks.create({
        creatorId: state.currentUser.id,
        type: 'task',
        ...taskData
      });

      setState(prev => ({
        ...prev,
        tasks: [...prev.tasks, newTask]
      }));
    } catch (error) {
        console.error('Failed to create task', error);
        alert('Failed to create task.');
    }
  };

  const handleSaveDeadline = async (taskData: Omit<Task, 'id' | 'creatorId' | 'status' | 'assigneeId'>) => {
    if (!state.currentUser) return;

    try {
      const newTask = await apiTasks.create({
        creatorId: state.currentUser.id,
        status: 'todo',
        assigneeId: state.currentUser.id,
        type: 'deadline',
        ...taskData
      });

      setState(prev => ({
        ...prev,
        tasks: [...prev.tasks, newTask]
      }));
    } catch (error) {
        console.error('Failed to create deadline task', error);
        alert('Failed to create deadline.');
    }
  };

  const handleDeleteDeadline = (taskId: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Deadline',
      message: 'Are you sure you want to delete this deadline? This action cannot be undone.',
      isDestructive: true,
      onConfirm: async () => {
        try {
          await apiTasks.delete(taskId);
          setState(prev => ({
            ...prev,
            tasks: prev.tasks.filter(t => t.id !== taskId)
          }));
        } catch (error: any) {
          console.error('Failed to delete deadline', error);
          alert(`Failed to delete deadline: ${error.message || 'Unknown error'}. Please check console.`);
        }
      }
    });
  };

  const handleDeleteTask = (taskId: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Task',
      message: 'Are you sure you want to delete this task? This action cannot be undone.',
      isDestructive: true,
      onConfirm: async () => {
        try {
          await apiTasks.delete(taskId);
          setState(prev => ({
            ...prev,
            tasks: prev.tasks.filter(t => t.id !== taskId)
          }));
        } catch (error: any) {
          console.error('Failed to delete task', error);
          alert(`Failed to delete task: ${error.message || 'Unknown error'}. Please check console.`);
        }
      }
    });
  };

  const handleUpdateTaskStatus = async (taskId: string, status: Task['status']) => {
    try {
      await apiTasks.update(taskId, { status });
      setState(prev => ({
        ...prev,
        tasks: prev.tasks.map(t => t.id === taskId ? { ...t, status } : t)
      }));
    } catch (error) {
        console.error('Failed to update task', error);
    }
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
    return <AuthPage onLogin={handleLogin} onRegister={handleRegister} />;
  }

  return (
    <Layout 
      activeTab={activeTab} 
      onTabChange={setActiveTab}
      onLogout={handleLogout}
      userAvatar={state.currentUser.avatar}
      userName={state.currentUser.name}
      userRole={state.currentUser.role}
    >
      {activeTab === 'dashboard' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Feed */}
          <div className="lg:col-span-2 space-y-8">
            <div className="flex justify-between items-center">
              <div>
                 <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
                 <p className="text-slate-500">Welcome back, {state.currentUser.name.split(' ')[0]}</p>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setIsDeadlineModalOpen(true)}
                  className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-xl font-semibold shadow-sm flex items-center gap-2 transition-all active:scale-[0.98]"
                >
                  <Flag size={20} className="text-red-500" />
                  <span className="hidden sm:inline">Add Deadline</span>
                </button>
                <button 
                  onClick={handleOpenNewStandup}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-semibold shadow-lg shadow-indigo-200 flex items-center gap-2 transition-all active:scale-[0.98]"
                >
                  <Plus size={20} />
                  <span className="hidden sm:inline">New Standup</span>
                </button>
              </div>
            </div>
            
            <WeeklySummaryWidget standups={state.standups} users={state.users} deadlines={deadlines} />

            <StandupFeed 
              standups={sortedStandups} 
              users={state.users} 
              currentUserId={state.currentUser.id}
              onDelete={handleDeleteStandup}
              onEdit={handleEditStandup}
            />
          </div>

          {/* Sidebar Widgets */}
          <div className="space-y-8">
            <DeadlinesWidget tasks={deadlines} onDelete={handleDeleteDeadline} />
            <CalendarWidget 
              standups={state.standups} 
              userId={state.currentUser.id} 
              onDateClick={handleCalendarDateClick}
            />
            <div className="h-[400px]">
               <TasksWidget 
                 tasks={teamTasks} 
                 users={state.users} 
                 currentUserId={state.currentUser.id}
                 onAddTask={handleAddTask}
                 onUpdateStatus={handleUpdateTaskStatus}
                 onDelete={handleDeleteTask}
               />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'tasks' && (
         <div className="h-[calc(100vh-140px)]">
           <TasksWidget 
             tasks={teamTasks} 
             users={state.users} 
             currentUserId={state.currentUser.id}
             onAddTask={handleAddTask}
             onUpdateStatus={handleUpdateTaskStatus}
             onDelete={handleDeleteTask}
           />
         </div>
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
        onClose={() => setIsDeadlineModalOpen(false)}
        onSubmit={handleSaveDeadline}
      />

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