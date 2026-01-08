import React, { useState, useRef, useEffect } from 'react';
import { User } from '../types';
import { User as UserIcon, Camera, Save, KeyRound, CheckCircle2, Plus, Trash2 } from 'lucide-react';
import { apiUsers } from '../services/api';
import { supabase } from '../services/supabase';
import { ImageCropper } from './ImageCropper';

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
  const presetInputRef = useRef<HTMLInputElement>(null);
  const [presets, setPresets] = useState<{ name: string; url: string }[]>([]);
  const [croppingImage, setCroppingImage] = useState<string | null>(null);
  const [croppingFor, setCroppingFor] = useState<'avatar' | 'preset' | null>(null);

  useEffect(() => {
    loadPresets();
  }, []);

  const loadPresets = async () => {
    const { data } = await supabase.storage.from('Standly').list('presets', {
      limit: 100,
      offset: 0,
      sortBy: { column: 'created_at', order: 'desc' },
    });

    if (data) {
      const presetList = data
        .filter(file => file.name !== '.emptyFolderPlaceholder' && !file.name.startsWith('.'))
        .map(file => {
        const { data: { publicUrl } } = supabase.storage.from('Standly').getPublicUrl(`presets/${file.name}`);
        return { name: file.name, url: publicUrl };
      });
      setPresets(presetList);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        setCroppingImage(reader.result as string);
        setCroppingFor('avatar');
      };
      reader.readAsDataURL(file);
      e.target.value = ''; // Reset input
    }
  };

  const handlePresetUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      alert('Access Denied: You must be logged in with Email/Password to upload presets.');
      return;
    }

    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      setCroppingImage(reader.result as string);
      setCroppingFor('preset');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const uploadPreset = async (blob: Blob) => {
    const fileExt = 'jpg';
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `presets/${fileName}`;

    setUploading(true);
    try {
      const { error } = await supabase.storage.from('Standly').upload(filePath, blob, {
        contentType: 'image/jpeg'
      });
      if (error) throw error;
      await loadPresets();
    } catch (error: any) {
      console.error('Error uploading preset:', error);
      if (error.statusCode === '403' || error.message?.includes('security policy')) {
        alert('Permission denied: You need to configure Storage RLS policies in Supabase.');
      } else {
        alert('Failed to upload preset');
      }
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePreset = async (fileName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this avatar preset?')) return;

    try {
      const { error } = await supabase.storage.from('Standly').remove([`presets/${fileName}`]);
      if (error) throw error;
      await loadPresets();
    } catch (error: any) {
      console.error('Error deleting preset:', error);
      alert('Failed to delete preset');
    }
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    if (croppingFor === 'avatar') {
       const file = new File([croppedBlob], "avatar.jpg", { type: "image/jpeg" });
       setSelectedFile(file);
       setPreviewUrl(URL.createObjectURL(croppedBlob));
    } else if (croppingFor === 'preset') {
       await uploadPreset(croppedBlob);
    }
    setCroppingImage(null);
    setCroppingFor(null);
  };

  const handleAvatarSelect = (url: string) => {
    setAvatar(url);
    setSelectedFile(null);
    setPreviewUrl(null);
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
      
      const updates: Partial<User> = {};
      if (name !== user.name) updates.name = name;
      if (avatarUrl !== user.avatar) updates.avatar = avatarUrl;
      
      // Only update login code if it's not empty and has changed
      if (loginCode && loginCode !== user.loginCode) {
        updates.loginCode = loginCode;
      }

      if (Object.keys(updates).length > 0) {
        await onUpdate(updates);
      }
      
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
            <div className={`relative group ${user.isAdmin ? 'cursor-pointer' : ''}`} onClick={() => user.isAdmin && fileInputRef.current?.click()}>
              <img 
                src={previewUrl || avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`} 
                alt={name} 
                className="w-24 h-24 rounded-full bg-slate-100 object-cover border-4 border-white shadow-md"
              />
              {user.isAdmin && (
                <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera className="text-white" size={24} />
                </div>
              )}
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*"
                onChange={handleFileChange}
                disabled={!user.isAdmin}
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

            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="block text-sm font-bold text-slate-700">Choose Avatar</label>
                {user.isAdmin && (
                  <button
                    type="button"
                    onClick={() => presetInputRef.current?.click()}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                  >
                    <Plus size={14} /> Upload New
                  </button>
                )}
              </div>
              <input type="file" ref={presetInputRef} className="hidden" accept="image/*" onChange={handlePresetUpload} />
              
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-4">
                {presets.map((preset) => (
                  <div key={preset.name} className="relative group">
                    <button
                      type="button"
                      onClick={() => handleAvatarSelect(preset.url)}
                      className={`relative w-full rounded-full overflow-hidden aspect-square transition-all ${avatar === preset.url ? 'ring-4 ring-indigo-500 scale-110' : 'hover:scale-105 ring-2 ring-transparent hover:ring-slate-200'}`}
                    >
                      <img src={preset.url} alt="Avatar" className="w-full h-full object-cover" />
                      {avatar === preset.url && (
                        <div className="absolute inset-0 bg-indigo-500/20 flex items-center justify-center">
                          <CheckCircle2 className="text-white drop-shadow-md" size={20} />
                        </div>
                      )}
                    </button>
                    {user.isAdmin && (
                      <button
                        type="button"
                        onClick={(e) => handleDeletePreset(preset.name, e)}
                        className="absolute -top-1 -right-1 bg-white text-red-500 border border-red-100 p-1.5 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 z-10"
                        title="Delete Preset"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
                {presets.length === 0 && (
                  <div className="col-span-full text-center py-8 text-slate-400 text-sm bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    No avatars available. {user.isAdmin ? 'Upload one!' : 'Ask an admin to upload some.'}
                  </div>
                )}
              </div>
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

      {croppingImage && (
        <ImageCropper
          imageSrc={croppingImage}
          onCropComplete={handleCropComplete}
          onCancel={() => { setCroppingImage(null); setCroppingFor(null); }}
        />
      )}
    </div>
  );
};