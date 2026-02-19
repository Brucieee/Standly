import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { X, Calendar, Image as ImageIcon, Save, Trash2, Eye, EyeOff } from 'lucide-react';
import { Announcement, UserRole } from '../types';

interface AnnouncementModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: Omit<Announcement, 'id' | 'createdAt' | 'views'>) => Promise<void>;
    onDelete?: (id: string) => Promise<void>;
    initialData?: Announcement | null;
    currentUserRole: string;
    isManager: boolean; // Can create/edit
    onUploadImage?: (file: File) => Promise<string>;
}

export const AnnouncementModal: React.FC<AnnouncementModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    onDelete,
    initialData,
    currentUserRole,
    isManager,
    onUploadImage
}) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [isActive, setIsActive] = useState(true);
    const [scheduledDate, setScheduledDate] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isPosterMode, setIsPosterMode] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setTitle(initialData.title);
                setContent(initialData.content || '');
                setImageUrl(initialData.imageUrl || '');
                setIsActive(initialData.isActive);
                setScheduledDate(initialData.scheduledDate ? initialData.scheduledDate.split('T')[0] : '');
                setExpiryDate(initialData.expiryDate ? initialData.expiryDate.split('T')[0] : '');
                // If it has image but no content, assume poster mode
                if (initialData.imageUrl && !initialData.content) {
                    setIsPosterMode(true);
                } else {
                    setIsPosterMode(false);
                }
            } else {
                // Reset form for new
                setTitle('');
                setContent('');
                setImageUrl('');
                setIsActive(true);
                setIsPosterMode(false);
                // Default start date to today
                const today = new Date().toISOString().split('T')[0];
                setScheduledDate(today);
                setExpiryDate('');
            }
        }
    }, [isOpen, initialData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const finalTitle = isPosterMode ? (title || `Poster ${new Date().toLocaleDateString()}`) : title;
            const finalContent = isPosterMode ? '' : content;

            await onSubmit({
                title: finalTitle,
                content: finalContent,
                imageUrl,
                isActive,
                createdBy: 'current-user-id-placeholder',
                scheduledDate: scheduledDate || undefined,
                expiryDate: expiryDate || undefined,
            });
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    // View Mode for non-managers (or just viewing in general if we had a separate view mode, 
    // but requirements say "Management Posting" is for creating. Users see it on load.
    // This modal is primarily for the MANAGEMENT side. The user view might be this same modal in read-only props?
    // Let's assume this modal is for BOTH: 
    // If `isManager` is false, it's Read-Only.
    // If `isManager` is true, it's Edit/Create.

    const isReadOnly = !isManager;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
                onClick={e => e.stopPropagation()}
            >
                {/* Header - Image Banner (Read Mode Only) */}
                {imageUrl && isReadOnly && (
                    <div className="w-full relative bg-black flex justify-center min-h-0">
                        <img
                            src={imageUrl}
                            alt="Announcement"
                            className="max-h-[85vh] w-auto max-w-full object-contain"
                        />
                    </div>
                )}

                {/* Regular Header */}
                <div className={`p-6 flex justify-between items-start border-b border-slate-100 ${(isReadOnly && isPosterMode) ? 'hidden' : ''}`}>
                    <h2 className="text-2xl font-bold text-slate-800">{isReadOnly ? title : (initialData ? 'Edit Announcement' : 'New Announcement')}</h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
                        <X size={24} />
                    </button>
                </div>

                {/* Close button overlap for Image Banner mode */}
                {imageUrl && isReadOnly && (
                    <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors backdrop-blur-sm z-10">
                        <X size={24} />
                    </button>
                )}

                <div className={`flex-1 overflow-y-auto ${(isReadOnly && (isPosterMode || !content)) ? 'hidden' : 'p-6'}`}>
                    {isReadOnly ? (
                        <div className="prose prose-slate max-w-none">
                            {/* Render HTML Content safely */}
                            <div dangerouslySetInnerHTML={{ __html: content }} />
                        </div>
                    ) : (
                        <form id="announcement-form" onSubmit={handleSubmit} className="space-y-6">
                            {/* Poster Mode Toggle */}
                            <div className="grid grid-cols-2 gap-4">
                                {/* Poster Mode Toggle */}
                                <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                                    <span className="text-sm font-medium text-indigo-900">Poster Mode</span>
                                    <button
                                        type="button"
                                        onClick={() => setIsPosterMode(!isPosterMode)}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isPosterMode ? 'bg-indigo-600' : 'bg-slate-300'}`}
                                    >
                                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isPosterMode ? 'translate-x-6' : 'translate-x-1'}`} />
                                    </button>
                                </div>

                                {/* Visibility Status Toggle */}
                                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                                    <span className="text-sm font-medium text-slate-700">Visibility</span>
                                    <div className="flex items-center gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setIsActive(!isActive)}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isActive ? 'bg-indigo-600' : 'bg-slate-300'}`}
                                        >
                                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                                        </button>
                                        <span className={`text-sm font-medium ${isActive ? 'text-indigo-600' : 'text-slate-500'}`}>
                                            {isActive ? 'Active' : 'Hidden'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {!isPosterMode && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                                    <input
                                        type="text"
                                        required={!isPosterMode}
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-lg font-bold"
                                        placeholder="Announcement Title..."
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                                    <ImageIcon size={16} /> {isPosterMode ? 'Poster Image' : 'Banner Image'}
                                </label>

                                <div className="space-y-3">
                                    {imageUrl ? (
                                        <div className="relative h-64 w-full rounded-xl overflow-hidden border border-slate-200 group bg-slate-100 flex items-center justify-center">
                                            <img src={imageUrl} alt="Preview" className="h-full w-auto max-w-full object-contain" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <button
                                                    type="button"
                                                    onClick={() => setImageUrl('')}
                                                    className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
                                                >
                                                    <Trash2 size={16} /> Remove Image
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div
                                            className="h-32 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center text-slate-500 hover:border-indigo-500 hover:bg-indigo-50 transition-all cursor-pointer relative"
                                        >
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="absolute inset-0 opacity-0 cursor-pointer"
                                                onChange={async (e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file && onUploadImage) {
                                                        try {
                                                            const url = await onUploadImage(file);
                                                            setImageUrl(url);
                                                        } catch (error) {
                                                            console.error("Upload failed", error);
                                                            alert("Failed to upload image.");
                                                        }
                                                    }
                                                }}
                                            />
                                            <ImageIcon size={32} className="mb-2 opacity-50" />
                                            <span className="text-sm font-medium">Click to upload banner image</span>
                                            <span className="text-xs text-slate-400 mt-1">PNG, JPG, GIF up to 5MB</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                                        <Calendar size={16} /> Start Showing Date
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        value={scheduledDate}
                                        onChange={(e) => setScheduledDate(e.target.value)}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2 text-slate-500">
                                        Stop Showing Date (Optional)
                                    </label>
                                    <input
                                        type="date"
                                        value={expiryDate}
                                        onChange={(e) => setExpiryDate(e.target.value)}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                    />
                                </div>
                            </div>



                            {!isPosterMode && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Content {imageUrl && <span className="text-slate-400 font-normal">(Optional)</span>}
                                    </label>
                                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent transition-all">
                                        <textarea
                                            value={content}
                                            onChange={(e) => setContent(e.target.value)}
                                            className="w-full h-32 p-4 outline-none resize-none"
                                            placeholder="Write your announcement here..."
                                        />
                                    </div>
                                </div>
                            )}
                        </form>
                    )}
                </div>

                {/* Footer for Edit Mode */}
                {!isReadOnly && (
                    <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
                        {initialData && onDelete ? (
                            <button
                                type="button"
                                onClick={() => onDelete(initialData.id)}
                                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium text-sm"
                            >
                                <Trash2 size={16} /> Delete
                            </button>
                        ) : <div />}

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors font-medium text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                form="announcement-form"
                                type="submit"
                                disabled={isSubmitting}
                                className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm disabled:opacity-50"
                            >
                                {isSubmitting ? (
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <Save size={16} />
                                )}
                                {initialData ? 'Save Changes' : 'Post Announcement'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
