import React, { useState, useEffect } from 'react';
import { LayoutDashboard, CheckSquare, History, LogOut, ExternalLink, Monitor, Palmtree, Cloud, FileText, Link as LinkIcon, X, Plus, ChevronDown, ChevronRight, Settings, Trash2 } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { apiQuickLinks } from '../services/api';
import { QuickLink, QuickLinkCategory } from '../types';
import { QuickLinkModal } from './QuickLinkModal';
import { ConfirmationModal } from './ConfirmationModal';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
  onOpenVirtualOffice: () => void;
  userAvatar: string;
  userName: string;
  userRole: string;
  isAdmin: boolean;
}

const CATEGORY_ORDER: QuickLinkCategory[] = [
  'General',
  'Development',
  'Design',
  'Resources',
  'Social',
  'Tools'
];

export const Layout: React.FC<LayoutProps> = ({
  children,
  activeTab,
  onTabChange,
  onLogout,
  onOpenVirtualOffice,
  userAvatar,
  userName,
  userRole,
  isAdmin,
}) => {
  const [isMobileLinksOpen, setIsMobileLinksOpen] = useState(false);
  const [quickLinks, setQuickLinks] = useState<QuickLink[]>([]);
  const [isQuickLinkModalOpen, setIsQuickLinkModalOpen] = useState(false);
  const [editingQuickLink, setEditingQuickLink] = useState<QuickLink | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    'General': true,
    'Development': true,
    'Design': true,
    'Resources': true,
    'Social': true,
    'Tools': true
  });
  
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    linkId: string | null;
    linkTitle: string;
  }>({
    isOpen: false,
    linkId: null,
    linkTitle: '',
  });

  useEffect(() => {
    loadQuickLinks();
  }, []);

  const loadQuickLinks = async () => {
    try {
      const links = await apiQuickLinks.getAll();
      setQuickLinks(links);
    } catch (error) {
      console.error('Failed to load quick links:', error);
    }
  };

  const handleSaveQuickLink = async (data: { title: string; url: string; category: QuickLinkCategory; iconUrl?: string }) => {
    try {
      if (editingQuickLink) {
        await apiQuickLinks.update(editingQuickLink.id, data);
      } else {
        await apiQuickLinks.create(data);
      }
      await loadQuickLinks();
      setIsQuickLinkModalOpen(false);
      setEditingQuickLink(null);
    } catch (error) {
      console.error('Failed to save quick link:', error);
      alert('Failed to save quick link.');
    }
  };

  const confirmDelete = (link: QuickLink) => {
    setDeleteConfirmation({
      isOpen: true,
      linkId: link.id,
      linkTitle: link.title,
    });
  };

  const handleDeleteQuickLink = async () => {
    if (!deleteConfirmation.linkId) return;
    
    try {
        await apiQuickLinks.delete(deleteConfirmation.linkId);
        await loadQuickLinks();
        // Close other modals if open
        setIsQuickLinkModalOpen(false);
        setEditingQuickLink(null);
    } catch (error) {
        console.error('Failed to delete quick link:', error);
        alert('Failed to delete quick link.');
    } finally {
        setDeleteConfirmation({ isOpen: false, linkId: null, linkTitle: '' });
    }
  };

  const openAddModal = () => {
    setEditingQuickLink(null);
    setIsQuickLinkModalOpen(true);
  };

  const openEditModal = (link: QuickLink, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening the link
    setEditingQuickLink(link);
    setIsQuickLinkModalOpen(true);
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const mainNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'history', label: 'History', icon: History },
    { id: 'leaves', label: 'Leaves', icon: Palmtree },
    { id: 'virtual-office', label: 'Virtual Office', icon: Monitor },
  ].filter(item => !(item.id === 'leaves' && userRole === 'Intern'));

  const groupedLinks = CATEGORY_ORDER.reduce((acc, category) => {
    const links = quickLinks.filter(link => link.category === category);
    if (links.length > 0) {
      acc[category] = links;
    }
    return acc;
  }, {} as Record<QuickLinkCategory, QuickLink[]>);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 fixed h-full z-10 hidden md:flex flex-col overflow-y-auto custom-scrollbar">
        <div className="p-6">
          <div 
            className="flex items-center gap-3 mb-8 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => onTabChange('dashboard')}
          >
            <img 
              src="/assets/logo.png" 
              alt="Standly" 
              className="h-8" 
            />
            <img 
              src="/assets/logo_text.png" 
              alt="Standly" 
              className="h-6" 
            />
          </div>

          <nav className="space-y-1">
            {mainNavItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === 'virtual-office') {
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
              </button>
            ))}
          </nav>

          <div className="mt-8">
            <div className="flex items-center justify-between px-4 mb-2">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Quick Links
              </h3>
              {isAdmin && (
                <button 
                  onClick={openAddModal}
                  className="text-slate-400 hover:text-indigo-600 transition-colors"
                  title="Add Quick Link"
                >
                  <Plus size={16} />
                </button>
              )}
            </div>
            
            <div className="space-y-4">
              {Object.entries(groupedLinks).map(([category, links]) => (
                <div key={category} className="space-y-1">
                   <button 
                     onClick={() => toggleCategory(category)}
                     className="w-full flex items-center justify-between px-4 py-1 text-xs font-medium text-slate-500 hover:text-slate-700 transition-colors"
                   >
                     {category}
                     {expandedCategories[category] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                   </button>
                   
                   <AnimatePresence>
                     {expandedCategories[category] && (
                       <motion.div
                         initial={{ height: 0, opacity: 0 }}
                         animate={{ height: 'auto', opacity: 1 }}
                         exit={{ height: 0, opacity: 0 }}
                         className="overflow-hidden"
                       >
                         {links.map((link) => (
                           <div key={link.id} className="group relative">
                             <button
                               onClick={() => window.open(link.url, '_blank')}
                               className="w-full flex items-center gap-3 px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all pr-14 text-left"
                             >
                               {link.iconUrl ? (
                                 <img src={link.iconUrl} alt="" className="w-5 h-5 object-contain rounded-md flex-shrink-0" />
                               ) : (
                                 <LinkIcon size={20} className="text-slate-400 group-hover:text-indigo-500 transition-colors flex-shrink-0" />
                               )}
                               <span className="flex-1 whitespace-normal break-words">{link.title}</span>
                             </button>
                             {isAdmin && (
                                <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all bg-white shadow-sm rounded-lg border border-slate-100 p-0.5">
                                    <button
                                        onClick={(e) => openEditModal(link, e)}
                                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                                        title="Edit Link"
                                    >
                                        <Settings size={14} />
                                    </button>
                                    <div className="w-[1px] h-4 bg-slate-200" />
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            confirmDelete(link);
                                        }}
                                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                        title="Delete Link"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                             )}
                           </div>
                         ))}
                       </motion.div>
                     )}
                   </AnimatePresence>
                </div>
              ))}
              
              {Object.keys(groupedLinks).length === 0 && (
                <div className="px-4 py-4 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-lg mx-4">
                  No links yet
                </div>
              )}
            </div>
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
           <div 
             className="flex items-center gap-2 cursor-pointer active:opacity-70 transition-opacity"
             onClick={() => onTabChange('dashboard')}
           >
            <img 
              src="/assets/logo_1.png" 
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
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-2 z-30 pb-safe">
           {/* Quick Links Menu */}
           <AnimatePresence>
             {isMobileLinksOpen && (
               <>
                 <motion.div 
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   exit={{ opacity: 0 }}
                   onClick={() => setIsMobileLinksOpen(false)}
                   className="fixed inset-0 bg-black/20 z-40"
                 />
                 <motion.div
                   initial={{ y: '100%', opacity: 0 }}
                   animate={{ y: 0, opacity: 1 }}
                   exit={{ y: '100%', opacity: 0 }}
                   transition={{ type: "spring", damping: 25, stiffness: 200 }}
                   className="absolute bottom-full left-2 right-2 mb-2 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50 p-2 max-h-[60vh] overflow-y-auto"
                 >
                   <div className="flex justify-between items-center p-2 mb-2 border-b border-slate-100">
                     <span className="font-bold text-slate-900 text-sm">Quick Links</span>
                     <button onClick={() => setIsMobileLinksOpen(false)} className="p-1 text-slate-400 hover:bg-slate-100 rounded-full">
                       <X size={16} />
                     </button>
                   </div>
                   
                   {/* Mobile Virtual Office Button */}
                    <button
                      onClick={() => {
                        onOpenVirtualOffice();
                        setIsMobileLinksOpen(false);
                      }}
                      className="w-full flex items-center gap-3 p-3 mb-2 rounded-xl bg-indigo-50 text-indigo-700 font-medium"
                    >
                      <Monitor size={20} />
                      Virtual Office
                    </button>

                   <div className="space-y-4">
                    {Object.entries(groupedLinks).map(([category, links]) => (
                      <div key={category}>
                        <h4 className="px-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">{category}</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {links.map((item) => (
                            <button
                              key={item.id}
                              onClick={() => {
                                window.open(item.url, '_blank');
                                setIsMobileLinksOpen(false);
                              }}
                              className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl bg-slate-50 hover:bg-indigo-50 active:scale-95 transition-all min-h-[6rem] h-auto relative"
                            >
                               {item.iconUrl ? (
                                <img src={item.iconUrl} alt="" className="w-8 h-8 object-contain rounded-md" />
                              ) : (
                                <div className="p-2 rounded-full bg-white shadow-sm text-slate-600">
                                  <LinkIcon size={20} />
                                </div>
                              )}
                              <span className="text-xs font-medium text-slate-700 text-center whitespace-normal break-words">{item.title}</span>
                              
                              {/* Mobile Edit Button (Only for Admins) */}
                              {isAdmin && (
                                <div 
                                    className="absolute top-1 right-1 flex gap-1 bg-white/90 rounded-full p-1 shadow-sm"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <div 
                                        className="p-1 text-slate-400 hover:text-indigo-600"
                                        onClick={(e) => {
                                            openEditModal(item, e);
                                            setIsMobileLinksOpen(false);
                                        }}
                                    >
                                        <Settings size={12} />
                                    </div>
                                    <div 
                                        className="p-1 text-slate-400 hover:text-red-600"
                                        onClick={(e) => {
                                            confirmDelete(item);
                                            // setIsMobileLinksOpen(false); // Keep open or close? Closing seems better for modal focus
                                        }}
                                    >
                                        <Trash2 size={12} />
                                    </div>
                                </div>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                   </div>
                 </motion.div>
               </>
             )}
           </AnimatePresence>

           <div className="flex justify-between items-end px-2">
              <button
                onClick={() => onTabChange('history')}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all w-16 ${
                  activeTab === 'history' ? 'text-indigo-600' : 'text-slate-400'
                }`}
              >
                <History size={24} strokeWidth={activeTab === 'history' ? 2.5 : 2} />
                <span className="text-[10px] font-medium">History</span>
              </button>

              {userRole !== 'Intern' && (
                <button
                  onClick={() => onTabChange('leaves')}
                  className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all w-16 ${
                    activeTab === 'leaves' ? 'text-indigo-600' : 'text-slate-400'
                  }`}
                >
                  <Palmtree size={24} strokeWidth={activeTab === 'leaves' ? 2.5 : 2} />
                  <span className="text-[10px] font-medium">Leaves</span>
                </button>
              )}

              <div className="relative -top-5">
                <button
                  onClick={() => onTabChange('dashboard')}
                  className={`flex items-center justify-center w-14 h-14 rounded-full shadow-lg border-4 border-white transition-all transform active:scale-95 ${
                    activeTab === 'dashboard'
                      ? 'bg-indigo-600 text-white shadow-indigo-200'
                      : 'bg-slate-900 text-white shadow-slate-200'
                  }`}
                >
                  <LayoutDashboard size={24} />
                </button>
                <span className={`absolute top-full left-1/2 -translate-x-1/2 mt-1 text-[10px] font-bold ${activeTab === 'dashboard' ? 'text-indigo-600' : 'text-slate-400'}`}>
                  Home
                </span>
              </div>

              <button
                onClick={() => setIsMobileLinksOpen(!isMobileLinksOpen)}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all w-16 ${
                  isMobileLinksOpen ? 'text-indigo-600' : 'text-slate-400'
                }`}
              >
                <LinkIcon size={24} strokeWidth={isMobileLinksOpen ? 2.5 : 2} />
                <span className="text-[10px] font-medium">Links</span>
              </button>

              <button
                onClick={onLogout}
                className="flex flex-col items-center gap-1 p-2 rounded-lg text-slate-400 hover:text-red-500 w-16 transition-colors"
              >
                <LogOut size={24} />
                <span className="text-[10px] font-medium">Logout</span>
              </button>
           </div>
        </div>

        <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>

      <QuickLinkModal 
        isOpen={isQuickLinkModalOpen}
        onClose={() => {
            setIsQuickLinkModalOpen(false);
            setEditingQuickLink(null);
        }}
        onSubmit={handleSaveQuickLink}
        initialData={editingQuickLink}
        onDelete={editingQuickLink ? () => confirmDelete(editingQuickLink) : undefined}
      />
      
      <ConfirmationModal
        isOpen={deleteConfirmation.isOpen}
        onClose={() => setDeleteConfirmation({ isOpen: false, linkId: null, linkTitle: '' })}
        onConfirm={handleDeleteQuickLink}
        title="Delete Quick Link"
        message={`Are you sure you want to delete "${deleteConfirmation.linkTitle}"? This action cannot be undone.`}
        confirmLabel="Delete"
        isDestructive={true}
      />
    </div>
  );
};
