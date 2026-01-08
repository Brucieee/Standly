import React, { useState, useRef } from 'react';
import { User } from '../types';
import { User as UserIcon, Camera, Save, KeyRound, CheckCircle2 } from 'lucide-react';
import { apiUsers } from '../services/api';

interface ProfileProps {
  user: User;
  onUpdate: (data: Partial<User>) => Promise<void>;
}

export const Profile: React.FC<ProfileProps> = ({ user, onUpdate }) => {
  const [name, setName] = useState(user.name);
  const [avatar, setAvatar] = useState(user.avatar);
  const [loginCode, setLoginCode] = useState(user.loginCode || '');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    setShowSuccess(false);
    try {
      let avatarUrl = avatar;
      if (selectedFile) {
        avatarUrl = await apiUsers.uploadAvatar(user.id, selectedFile);
      }
      await onUpdate({ name, avatar: avatarUrl, loginCode });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error: any) {
      console.error('Failed to update profile', error);
      alert(error.message || 'Failed to update profile');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-900 mb-2">Profile Settings</h1>
      <p className="text-slate-500 mb-8">Manage your account information</p>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="flex items-center gap-6">
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <img 
                src={previewUrl || avatar} 
                alt={name} 
                className="w-24 h-24 rounded-full bg-slate-100 object-cover border-4 border-white shadow-md"
              />
              <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera className="text-white" size={24} />
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900">{name}</h3>
              <p className="text-slate-500">{user.role}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Full Name</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Secret Login Code (6 Digits)</label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  value={loginCode}
                  onChange={(e) => setLoginCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all tracking-widest font-mono"
                  placeholder="000000"
                  maxLength={6}
                />
              </div>
              <p className="text-xs text-slate-400 mt-1">Used for quick login. Must be unique.</p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end items-center gap-4">
            {showSuccess && (
              <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1.5 rounded-lg animate-fade-in">
                <CheckCircle2 size={16} />
                <span className="text-sm font-medium">Saved successfully</span>
              </div>
            )}
            <button
              type="submit"
              disabled={uploading}
              className={`bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-semibold shadow-lg shadow-indigo-200 flex items-center gap-2 transition-all active:scale-[0.98] ${uploading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              <Save size={20} />
              {uploading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};