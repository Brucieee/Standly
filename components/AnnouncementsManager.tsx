import React, { useState } from 'react';
import { Announcement, User } from '../types';
import { Plus, Edit2, Trash2, X, Eye, EyeOff } from 'lucide-react';
import moment from 'moment-timezone';

interface AnnouncementsManagerProps {
    announcements: Announcement[];
    onEdit: (announcement: Announcement) => void;
    onDelete: (id: string) => void;
    onCreate: () => void;
    users: User[];
}

export const AnnouncementsManager: React.FC<AnnouncementsManagerProps> = ({
    announcements,
    onEdit,
    onDelete,
    onCreate,
    users
}) => {
    return (
        <div className="h-full flex flex-col bg-slate-50">
            <div className="p-6 border-b border-slate-200 bg-white flex justify-between items-center sticky top-0 z-10">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Manage Announcements</h2>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={onCreate}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm shadow-sm"
                    >
                        <Plus size={16} />
                        New Announcement
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-auto p-6">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-slate-200">
                            <th className="py-3 px-4 text-sm font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                            <th className="py-3 px-4 text-sm font-semibold text-slate-500 uppercase tracking-wider">Title</th>
                            <th className="py-3 px-4 text-sm font-semibold text-slate-500 uppercase tracking-wider">Schedule</th>
                            <th className="py-3 px-4 text-sm font-semibold text-slate-500 uppercase tracking-wider">Created By</th>
                            <th className="py-3 px-4 text-sm font-semibold text-slate-500 uppercase tracking-wider">Created At</th>
                            <th className="py-3 px-4 text-sm font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {announcements.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="py-8 text-center text-slate-500">
                                    No announcements found. Click "New Announcement" to create one.
                                </td>
                            </tr>
                        ) : (
                            announcements.map((announcement) => {
                                const creator = users.find(u => u.id === announcement.createdBy);
                                const isScheduled = announcement.scheduledDate && new Date(announcement.scheduledDate) > new Date();
                                const isExpired = announcement.expiryDate && new Date(announcement.expiryDate) < new Date();

                                let statusColor = "bg-green-100 text-green-700";
                                let statusText = "Active";

                                if (!announcement.isActive) {
                                    statusColor = "bg-slate-100 text-slate-500";
                                    statusText = "Draft/Hidden";
                                } else if (isExpired) {
                                    statusColor = "bg-red-100 text-red-700";
                                    statusText = "Expired";
                                } else if (isScheduled) {
                                    statusColor = "bg-yellow-100 text-yellow-700";
                                    statusText = "Scheduled";
                                }

                                return (
                                    <tr key={announcement.id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="py-3 px-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor}`}>
                                                {statusText}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="font-medium text-slate-900">{announcement.title}</div>
                                            {announcement.imageUrl && (
                                                <span className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                                                    <Eye size={10} /> Has banner image
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="text-sm text-slate-600">
                                                {announcement.scheduledDate ? moment(announcement.scheduledDate).format('MMM D, YYYY') : 'Immediate'}
                                                {announcement.expiryDate && (
                                                    <span className="text-slate-400"> → {moment(announcement.expiryDate).format('MMM D, YYYY')}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-2">
                                                {creator?.avatar && <img src={creator.avatar} alt="" className="w-6 h-6 rounded-full" />}
                                                <span className="text-sm text-slate-600">{creator?.name || 'Unknown'}</span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className="text-sm text-slate-500">
                                                {moment(announcement.createdAt).format('MMM D, YYYY')}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => onEdit(announcement)}
                                                    className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => onDelete(announcement.id)}
                                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
