import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { StandupFeed } from './components/StandupFeed';
import { CalendarWidget } from './components/CalendarWidget';
import { TasksWidget } from './components/TasksWidget';
import { StandupModal } from './components/StandupModal';
import { AuthPage } from './components/AuthPage';
import { Profile } from './components/Profile';
import { AppState, User, Standup, Task, UserRole } from './types';
import { MOCK_USERS, MOCK_STANDUPS, MOCK_TASKS } from './services/mockData';
import { Plus } from 'lucide-react';

const App: React.FC = () => {
  // Global State (mimicking a database connection + Auth Context)
  const [state, setState] = useState<AppState>({
    currentUser: null,
    users: MOCK_USERS,
    standups: MOCK_STANDUPS,
    tasks: MOCK_TASKS,
  });

  const [activeTab, setActiveTab] = useState('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStandup, setEditingStandup] = useState<Standup | null>(null);
  const [modalInitialDate, setModalInitialDate] = useState<string>('');

  // Sorting standups by date desc
  const sortedStandups = [...state.standups].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Handlers
  const handleLogin = (email: string) => {
    const user = state.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user) {
      setState(prev => ({ ...prev, currentUser: user }));
    } else {
      // Create new user for demo if not found
      const newUser: User = {
        id: `u${Date.now()}`,
        name: email.split('@')[0],
        email,
        avatar: `https://picsum.photos/200/200?random=${Date.now()}`,
        role: UserRole.DEVELOPER, // Default to Dev
        isAdmin: false
      };
      setState(prev => ({ 
        ...prev, 
        users: [...prev.users, newUser],
        currentUser: newUser 
      }));
    }
  };

  const handleLogout = () => {
    setState(prev => ({ ...prev, currentUser: null }));
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

  const handleSaveStandup = (data: { date: string; yesterday: string; today: string; blockers: string; mood: 'happy' | 'neutral' | 'stressed' }) => {
    if (!state.currentUser) return;
    
    if (editingStandup) {
      // Edit mode
      setState(prev => ({
        ...prev,
        standups: prev.standups.map(s => s.id === editingStandup.id ? { ...s, ...data } : s)
      }));
    } else {
      // Create mode
      const newStandup: Standup = {
        id: `s${Date.now()}`,
        userId: state.currentUser.id,
        ...data
      };
      setState(prev => ({
        ...prev,
        standups: [newStandup, ...prev.standups]
      }));
    }
  };

  const handleDeleteStandup = (id: string) => {
    if (window.confirm("Are you sure you want to delete this standup?")) {
      setState(prev => ({
        ...prev,
        standups: prev.standups.filter(s => s.id !== id)
      }));
    }
  };

  const handleAddTask = (taskData: Omit<Task, 'id' | 'creatorId'>) => {
    if (!state.currentUser) return;

    const newTask: Task = {
      id: `t${Date.now()}`,
      creatorId: state.currentUser.id,
      ...taskData
    };

    setState(prev => ({
      ...prev,
      tasks: [...prev.tasks, newTask]
    }));
  };

  const handleUpdateTaskStatus = (taskId: string, status: Task['status']) => {
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === taskId ? { ...t, status } : t)
    }));
  };

  const handleUpdateProfile = (updated: Partial<User>) => {
    if (!state.currentUser) return;
    
    const updatedUser = { ...state.currentUser, ...updated };
    
    setState(prev => ({
      ...prev,
      currentUser: updatedUser,
      users: prev.users.map(u => u.id === prev.currentUser!.id ? updatedUser : u)
    }));
  };

  // Auth Guard
  if (!state.currentUser) {
    return <AuthPage onLogin={handleLogin} />;
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
              <button 
                onClick={handleOpenNewStandup}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-semibold shadow-lg shadow-indigo-200 flex items-center gap-2 transition-all active:scale-[0.98]"
              >
                <Plus size={20} />
                <span className="hidden sm:inline">New Standup</span>
              </button>
            </div>
            
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
            <CalendarWidget 
              standups={state.standups} 
              userId={state.currentUser.id} 
              onDateClick={handleCalendarDateClick}
            />
            <div className="h-[400px]">
               <TasksWidget 
                 tasks={state.tasks} 
                 users={state.users} 
                 currentUserId={state.currentUser.id}
                 onAddTask={handleAddTask}
                 onUpdateStatus={handleUpdateTaskStatus}
               />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'tasks' && (
         <div className="h-[calc(100vh-140px)]">
           <TasksWidget 
             tasks={state.tasks} 
             users={state.users} 
             currentUserId={state.currentUser.id}
             onAddTask={handleAddTask}
             onUpdateStatus={handleUpdateTaskStatus}
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
    </Layout>
  );
};

export default App;