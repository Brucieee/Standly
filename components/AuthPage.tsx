import React, { useState } from 'react';
import { UserRole } from '../types';
import { LogIn, UserPlus, Mail, Lock, User, Briefcase, KeyRound } from 'lucide-react';

interface AuthPageProps {
  onLogin: (email: string, password: string) => void;
  onCodeLogin: (code: string) => void;
  onRegister: (email: string, password: string, name: string, role: string) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onLogin, onRegister, onCodeLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loginMethod, setLoginMethod] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginCode, setLoginCode] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<string>('');
  const [customRole, setCustomRole] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      if (loginMethod === 'email') {
        onLogin(email, password);
      } else {
        onCodeLogin(loginCode);
      }
    } else {
      if (!role) {
        alert('Please select your position');
        return;
      }
      const finalRole = role === 'Others' ? customRole : role;
      if (role === 'Others' && !customRole.trim()) {
        alert('Please specify your position');
        return;
      }
      onRegister(email, password, name, finalRole);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="p-8">
          <div className="text-center mb-8">
            <img 
              src="https://qizxqbaylaaatskyqzpl.supabase.co/storage/v1/object/public/Standly/assets/logo_1.png" 
              alt="Standly" 
              className="h-60 mx-auto mb-4" 
            />
            <h1 className="text-2xl font-bold text-slate-900">
              {isLogin ? (loginMethod === 'code' ? 'Enter Access Code' : 'Welcome Back') : 'Create Account'}
            </h1>
            <p className="text-slate-500 mt-2">
              {isLogin 
                ? (loginMethod === 'code' ? 'Enter your 6-digit secret code to login' : 'Sign in to access your workspace') 
                : 'Join your team on Standly'}
            </p>
          </div>

          {isLogin && (
            <div className="flex p-1 bg-slate-100 rounded-xl mb-6">
              <button
                type="button"
                onClick={() => setLoginMethod('email')}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${loginMethod === 'email' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Email & Password
              </button>
              <button
                type="button"
                onClick={() => setLoginMethod('code')}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${loginMethod === 'code' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Secret Code
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                      placeholder="John Doe"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Position</label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all appearance-none bg-white invalid:text-slate-400"
                    >
                      <option value="" disabled>Select Position</option>
                      {Object.values(UserRole).map((r) => (
                        <option key={r} value={r} className="text-slate-900">{r}</option>
                      ))}
                      <option value="Others" className="text-slate-900">Others</option>
                    </select>
                  </div>
                </div>

                {role === 'Others' && (
                  <div className="animate-fade-in-up">
                    <label className="block text-sm font-bold text-slate-700 mb-1">Specify Position</label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input
                        type="text"
                        required
                        value={customRole}
                        onChange={(e) => setCustomRole(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                        placeholder="e.g. UI/UX Designer"
                      />
                    </div>
                  </div>
                )}
              </>
            )}

            {isLogin && loginMethod === 'code' ? (
              <div className="py-2">
                <div className="relative">
                  <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500" size={24} />
                  <input
                    type="password"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    required
                    value={loginCode}
                    onChange={(e) => setLoginCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-indigo-100 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all tracking-[0.5em] font-mono text-center text-2xl font-bold text-indigo-900 placeholder:text-slate-300"
                    placeholder="000000"
                    maxLength={6}
                    autoFocus
                  />
                </div>
                <p className="text-center text-xs text-slate-400 mt-4">
                  Enter the 6-digit code from your profile settings
                </p>
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </>
            )}

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all active:scale-[0.98] mt-6"
            >
              {isLogin ? (loginMethod === 'code' ? 'Login with Code' : 'Sign In') : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
            >
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};