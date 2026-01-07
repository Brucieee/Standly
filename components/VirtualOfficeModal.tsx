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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in-up" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
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
              className="flex items-center justify-between w-full p-3 bg-indigo-50 text-indigo-700 rounded-xl hover:bg-indigo-100 transition-colors border border-indigo-100 group"
            >
              <span className="truncate font-medium">{link}</span>
              <ExternalLink size={18} />
            </a>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Access Password</label>
            <div className="flex gap-2">
              <div className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-600">
                {password}
              </div>
              <button
                onClick={handleCopy}
                className="p-3 bg-white border border-slate-200 hover:border-indigo-300 hover:text-indigo-600 text-slate-500 rounded-xl transition-all active:scale-95"
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
              className="block w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-center font-bold rounded-xl transition-all shadow-lg shadow-indigo-200 active:scale-[0.98]"
            >
              Enter Virtual Office
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};