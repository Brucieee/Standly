import React from 'react';
import { XCircle } from 'lucide-react';

interface CodeErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CodeErrorModal: React.FC<CodeErrorModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-fade-in-up" onClick={e => e.stopPropagation()}>
        <div className="p-6 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle size={32} className="text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Invalid Code</h2>
          <p className="text-slate-600 mb-6">The secret code you entered is incorrect. Please check your code and try again.</p>
          <button
            onClick={onClose}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-semibold transition-all active:scale-[0.98]"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
};