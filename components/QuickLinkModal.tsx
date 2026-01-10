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
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-md flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <LinkIcon className="text-indigo-500" size={20} />
            {initialData ? 'Edit Quick Link' : 'Add Quick Link'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Title
            </label>
            <input 
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Jira Board"
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-slate-900"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              URL
            </label>
            <div className="relative">
              <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
              <input 
                type="url"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://..."
                className="w-full pl-10 pr-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Category
            </label>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as QuickLinkCategory)}
                className="w-full pl-10 pr-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-slate-900 appearance-none"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Icon (Optional)
            </label>
            <div className="relative">
              <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
              <input 
                type="file"
                accept="image/*"
                onChange={(e) => setIconFile(e.target.files?.[0] || null)}
                className="w-full pl-10 pr-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-slate-900 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
            </div>
             {initialData?.iconUrl && !iconFile && (
                <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                    <span>Current icon:</span>
                    <img src={initialData.iconUrl} alt="Current icon" className="w-6 h-6 object-contain rounded" />
                </div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            {initialData && onDelete && (
                <button
                type="button"
                onClick={onDelete}
                className="px-4 py-2.5 rounded-lg font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition-all flex items-center gap-2"
                >
                <Trash2 size={18} />
                Delete
                </button>
            )}
            <button
                type="submit"
                disabled={isUploading}
                className="flex-1 bg-indigo-600 text-white py-2.5 rounded-lg font-semibold hover:bg-indigo-700 active:scale-[0.98] transition-all shadow-md shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isUploading ? 'Saving...' : (initialData ? 'Save Changes' : 'Create Link')}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
