import React, { useState, useEffect } from 'react';
import { X, Link as LinkIcon, Image as ImageIcon, Tag, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { QuickLink, QuickLinkCategory } from '../types';
import { apiQuickLinks } from '../services/api';

interface QuickLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { title: string; url: string; category: QuickLinkCategory; iconUrl?: string }) => void;
  initialData?: QuickLink | null;
  onDelete?: () => void;
}

const CATEGORIES: QuickLinkCategory[] = [
  'General',
  'Development',
  'Design',
  'Resources',
  'Social',
  'Tools'
];

export const QuickLinkModal: React.FC<QuickLinkModalProps> = ({ isOpen, onClose, onSubmit, initialData, onDelete }) => {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState<QuickLinkCategory>('General');
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setTitle(initialData.title);
        setUrl(initialData.url);
        setCategory(initialData.category);
        setIconFile(null); // Reset file input
      } else {
        setTitle('');
        setUrl('');
        setCategory('General');
        setIconFile(null);
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);

    try {
      let iconUrl = initialData?.iconUrl; // Default to existing icon URL
      
      if (iconFile) {
        iconUrl = await apiQuickLinks.uploadIcon(iconFile);
      }

      onSubmit({
        title,
        url,
        category,
        iconUrl,
      });

      // Form reset is handled by useEffect or parent closing modal
    } catch (error) {
      console.error('Error saving quick link:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="bg-slate-200 rounded-3xl shadow-neo border-none w-full max-w-md flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-6 py-5 border-b border-slate-300/30 flex justify-between items-center bg-transparent">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <LinkIcon className="text-indigo-600" size={24} />
            {initialData ? 'Edit Quick Link' : 'Add Quick Link'}
          </h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Title
            </label>
            <input 
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Jira Board"
              className="w-full px-4 py-3 bg-slate-200 border-none rounded-xl shadow-neo-sm-inner focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:shadow-neo transition-all text-slate-700"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              URL
            </label>
            <div className="relative">
              <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
              <input 
                type="url"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://..."
                className="w-full pl-12 pr-4 py-3 bg-slate-200 border-none rounded-xl shadow-neo-sm-inner focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:shadow-neo transition-all text-slate-700"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Category
            </label>
            <div className="relative">
              <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as QuickLinkCategory)}
                className="w-full pl-12 pr-4 py-3 bg-slate-200 border-none rounded-xl shadow-neo-sm-inner focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:shadow-neo transition-all text-slate-700 appearance-none font-medium"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Icon (Optional)
            </label>
            <div className="relative">
              <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
              <input 
                type="file"
                accept="image/*"
                onChange={(e) => setIconFile(e.target.files?.[0] || null)}
                className="w-full pl-12 pr-4 py-3 bg-slate-200 border-none rounded-xl shadow-neo-sm-inner focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:shadow-neo transition-all text-slate-700 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-none file:text-sm file:font-bold file:bg-slate-200 file:text-indigo-600 file:shadow-neo hover:file:shadow-neo-inner cursor-pointer"
              />
            </div>
             {initialData?.iconUrl && !iconFile && (
                <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                    <span>Current icon:</span>
                    <img src={initialData.iconUrl} alt="Current icon" className="w-6 h-6 object-contain rounded" />
                </div>
            )}
          </div>

          <div className="flex gap-4 pt-4">
            {initialData && onDelete && (
                <button
                type="button"
                onClick={onDelete}
                className="px-6 py-3 rounded-xl font-bold text-red-600 bg-slate-200 shadow-neo hover:shadow-neo-inner transition-all flex items-center gap-2"
                >
                <Trash2 size={18} />
                Delete
                </button>
            )}
            <button
                type="submit"
                disabled={isUploading}
                className="flex-1 py-3 text-white font-bold rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 shadow-[4px_4px_10px_rgba(79,70,229,0.3),-4px_-4px_10px_rgba(255,255,255,0.8)] active:shadow-[inset_4px_4px_10px_rgba(0,0,0,0.1),inset_-4px_-4px_10px_rgba(255,255,255,0.2)] hover:from-indigo-600 hover:to-indigo-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isUploading ? 'Saving...' : (initialData ? 'Save Changes' : 'Create Link')}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
