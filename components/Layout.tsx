import React from 'react';
import { LayoutDashboard, CheckSquare, History, LogOut, ExternalLink, Monitor, Palmtree, Cloud } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
  onOpenVirtualOffice: () => void;
  userAvatar: string;
  userName: string;
  userRole: string;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  activeTab,
  onTabChange,
  onLogout,
  onOpenVirtualOffice,
  userAvatar,
  userName,
  userRole,
}) => {
  const mainNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'history', label: 'History', icon: History },
    { id: 'leaves', label: 'Leaves', icon: Palmtree },
  ];

  const quickLinks = [
    { id: 'jira', label: 'Jira Board', icon: CheckSquare, href: 'https://cocogenproduct.atlassian.net/jira/software/projects/ECPM/boards/1/timeline' },
    { id: 'onedrive', label: 'OneDrive', icon: Cloud, href: 'https://cocogencom-my.sharepoint.com/personal/jp_salvador_cocogen_com/_layouts/15/onedrive.aspx?id=%2Fpersonal%2Fjp%5Fsalvador%5Fcocogen%5Fcom%2FDocuments%2FInnovation%20Division%2FInnovation%20Division%20Shared%20Drive&ga=1' },
    { id: 'virtual-office', label: 'Virtual Office', icon: Monitor },
  ].filter(item => {
    if (item.id === 'jira' && userRole === 'Intern') return false;
    return true;
  });

  const allNavItems = [...mainNavItems, ...quickLinks];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 fixed h-full z-10 hidden md:flex flex-col">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <img 
              src="https://qizxqbaylaaatskyqzpl.supabase.co/storage/v1/object/public/Standly/assets/logo_1.png" 
              alt="Standly" 
              className="h-8" 
            />
            <span className="font-bold text-xl text-slate-900">Standly</span>
          </div>

          <nav className="space-y-1">
            {mainNavItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  if (item.href) {
                    window.open(item.href, '_blank');
                  } else if (item.id === 'virtual-office') {
                    onOpenVirtualOffice();
                  } else {
                    onTabChange(item.id);
                  }
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  activeTab === item.id
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <item.icon size={20} />
                {item.label}
                {item.href && <ExternalLink size={14} className="ml-auto opacity-50" />}
              </button>
            ))}
          </nav>

          <div className="mt-8">
            <h3 className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Quick Links
            </h3>
            <nav className="space-y-1">
              {quickLinks.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.href) {
                      window.open(item.href, '_blank');
                    } else if (item.id === 'virtual-office') {
                      onOpenVirtualOffice();
                    } else {
                      onTabChange(item.id);
                    }
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all"
                >
                  <item.icon size={20} />
                  {item.label}
                  {item.href && <ExternalLink size={14} className="ml-auto opacity-50" />}
                </button>
              ))}
            </nav>
          </div>
        </div>

        <div className="mt-auto p-6 border-t border-slate-100">
          <div 
            className="flex items-center gap-3 mb-4 cursor-pointer hover:bg-slate-50 p-2 -mx-2 rounded-lg transition-colors group"
            onClick={() => onTabChange('profile')}
          >
            <img
              src={userAvatar}
              alt={userName}
              className="w-10 h-10 rounded-full bg-slate-100 object-cover"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">{userName}</p>
              <p className="text-xs text-slate-500 truncate">{userRole}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2 text-slate-500 hover:text-red-600 text-sm font-medium transition-colors"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Header & Content */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        {/* Mobile Header */}
        <header className="md:hidden bg-white border-b border-slate-200 p-4 flex justify-between items-center sticky top-0 z-20">
           <div className="flex items-center gap-2">
            <img 
              src="https://qizxqbaylaaatskyqzpl.supabase.co/storage/v1/object/public/Standly/assets/logo_1.png" 
              alt="Standly" 
              className="h-6" 
            />
            <span className="font-bold text-lg text-slate-900">Standly</span>
           </div>
           <div className="flex items-center gap-4">
             <img
              src={userAvatar}
              alt={userName}
              className="w-8 h-8 rounded-full bg-slate-100 object-cover cursor-pointer"
              onClick={() => onTabChange('profile')}
            />
           </div>
        </header>

        {/* Mobile Nav */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-2 flex justify-around z-30 pb-safe">
           {allNavItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  if (item.href) {
                    window.open(item.href, '_blank');
                  } else if (item.id === 'virtual-office') {
                    onOpenVirtualOffice();
                  } else {
                    onTabChange(item.id);
                  }
                }}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${
                  activeTab === item.id
                    ? 'text-indigo-600'
                    : 'text-slate-400'
                }`}
              >
                <item.icon size={24} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </button>
            ))}
            <button
                onClick={onLogout}
                className="flex flex-col items-center gap-1 p-2 rounded-lg text-slate-400"
              >
                <LogOut size={24} />
                <span className="text-[10px] font-medium">Logout</span>
            </button>
        </div>

        <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
};