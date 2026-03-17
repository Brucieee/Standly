import React, { useState } from 'react';
import { X, Copy, Check, ExternalLink, Monitor } from 'lucide-react';

interface VirtualOfficeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VirtualOfficeModal: React.FC<VirtualOfficeModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const link = "https://zep.us/play/LB0Mqj";
  const password = "#Innovationdivision";

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-slate-200 rounded-3xl shadow-neo border-none w-full max-w-md overflow-hidden animate-fade-in-up" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-slate-300/30 flex justify-between items-center bg-transparent">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Monitor className="text-indigo-600" size={24} />
            Virtual Office
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Office Link</label>
            <a 
              href={link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-between w-full p-4 bg-slate-200 text-indigo-600 rounded-xl shadow-neo-sm-inner focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:shadow-neo transition-all group"
            >
              <span className="truncate font-bold">{link}</span>
              <ExternalLink size={18} />
            </a>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Access Password</label>
            <div className="flex gap-4">
              <div className="flex-1 p-4 bg-slate-200 shadow-neo-sm-inner rounded-xl font-mono font-bold text-slate-700 flex items-center">
                {password}
              </div>
              <button
                onClick={handleCopy}
                className="p-4 bg-slate-200 shadow-neo hover:shadow-neo-inner text-indigo-600 rounded-xl transition-all active:scale-95 flex items-center justify-center"
                title="Copy Password"
              >
                {copied ? <Check size={20} className="text-green-500" /> : <Copy size={20} />}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <a 
              href={link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="block w-full py-4 text-white text-center font-bold rounded-2xl bg-gradient-to-r from-orange-400 to-red-500 shadow-[4px_4px_10px_rgba(239,68,68,0.3),-4px_-4px_10px_rgba(255,255,255,0.8)] active:shadow-[inset_4px_4px_10px_rgba(0,0,0,0.1),inset_-4px_-4px_10px_rgba(255,255,255,0.2)] hover:from-orange-500 hover:to-red-600 transition-all active:scale-[0.98]"
            >
              Enter Virtual Office
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};