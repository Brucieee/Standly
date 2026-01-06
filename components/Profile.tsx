import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { Save, Camera, Loader2 } from 'lucide-react';
import { supabase } from '../services/supabase';

interface ProfileProps {
  user: User;
  onUpdate: (updatedUser: Partial<User>) => void;
}

export const Profile: React.FC<ProfileProps> = ({ user, onUpdate }) => {
  const [name, setName] = useState(user.name);
  const [role, setRole] = useState(user.role);
  const [avatar, setAvatar] = useState(user.avatar);
  const [isSaved, setIsSaved] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate({ name, role, avatar });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }

    setUploading(true);
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}-${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      setAvatar(data.publicUrl);
    } catch (error) {
      console.error('Error uploading avatar:', error);
      alert('Error uploading avatar');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Profile Settings</h2>
      
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="h-32 bg-indigo-600"></div>
        <div className="px-8 pb-8">
          <div className="relative -mt-16 mb-6 inline-block">
            <img 
              src={avatar} 
              alt="Profile" 
              className={`w-32 h-32 rounded-full border-4 border-white object-cover shadow-md bg-white ${uploading ? 'opacity-50' : ''}`} 
            />
            
            <label className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-md cursor-pointer hover:bg-slate-50 transition-colors group">
              {uploading ? (
                <Loader2 size={20} className="text-indigo-600 animate-spin" />
              ) : (
                <Camera size={20} className="text-slate-600 group-hover:text-indigo-600" />
              )}
              <input 
                type="file" 
                className="hidden" 
                accept="image/*" 
                onChange={handleFileUpload}
                disabled={uploading}
              />
            </label>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 bg-white text-black focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Role</label>
                <select 
                  value={role}
                  onChange={e => setRole(e.target.value as UserRole)}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 bg-white text-black focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                >
                  {Object.values(UserRole).map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
              <input 
                type="email" 
                value={user.email}
                disabled
                className="w-full px-4 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed"
              />
              <p className="text-xs text-slate-400 mt-1">Email cannot be changed manually. Contact admin.</p>
            </div>

            <div className="pt-4 flex items-center justify-between">
               <span className={`text-sm font-medium text-green-600 transition-opacity ${isSaved ? 'opacity-100' : 'opacity-0'}`}>
                 Saved successfully!
               </span>
               <button 
                type="submit" 
                className="flex items-center space-x-2 bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200"
              >
                <Save size={18} />
                <span>Save Changes</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};