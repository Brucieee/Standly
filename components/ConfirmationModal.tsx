import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  isDestructive?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  isDestructive = false,
}) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-slate-200 rounded-3xl shadow-neo border-none w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className={`p-4 rounded-2xl shadow-neo-sm-inner border-none ${isDestructive ? 'bg-[#ffedec] text-red-500' : 'bg-indigo-50 text-indigo-500'}`}>
              <AlertTriangle size={28} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800">{title}</h3>
            </div>
          </div>
          
          <p className="text-slate-600 mb-8 font-medium leading-relaxed">
            {message}
          </p>

          <div className="flex gap-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-slate-200 text-slate-600 font-bold rounded-xl shadow-neo hover:shadow-neo-inner transition-all active:scale-[0.98]"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`flex-1 px-4 py-3 text-white font-bold rounded-xl transition-all active:scale-[0.98] ${
                isDestructive 
                  ? 'bg-gradient-to-r from-red-500 to-red-600 shadow-[4px_4px_10px_rgba(239,68,68,0.3),-4px_-4px_10px_rgba(255,255,255,0.8)] active:shadow-[inset_4px_4px_10px_rgba(0,0,0,0.1),inset_-4px_-4px_10px_rgba(255,255,255,0.2)] hover:from-red-600 hover:to-red-700' 
                  : 'bg-gradient-to-r from-indigo-500 to-indigo-600 shadow-[4px_4px_10px_rgba(79,70,229,0.3),-4px_-4px_10px_rgba(255,255,255,0.8)] active:shadow-[inset_4px_4px_10px_rgba(0,0,0,0.1),inset_-4px_-4px_10px_rgba(255,255,255,0.2)] hover:from-indigo-600 hover:to-indigo-700'
              }`}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};