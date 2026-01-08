import React, { useState } from 'react';
import { X, Calendar, Edit2, Trash2, Plus, Search } from 'lucide-react';

interface Holiday {
  id: string;
  date: string;
  name: string;
}

interface HolidayManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  holidays: Holiday[];
  onAdd: () => void;
  onEdit: (holiday: Holiday) => void;
  onDelete: (id: string) => void;
}

export const HolidayManagerModal: React.FC<HolidayManagerModalProps> = ({ 
  isOpen, 
  onClose, 
  holidays, 
  onAdd, 
  onEdit, 
  onDelete 
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const sortedHolidays = [...holidays].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const filteredHolidays = sortedHolidays.filter(h => 
    h.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    h.date.includes(searchTerm)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col animate-fade-in-up" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-2xl">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="text-indigo-600" size={24} />
              Manage Holidays
            </h2>
            <p className="text-sm text-slate-500 mt-1">Add, edit, or remove company holidays</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search holidays..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
            />
          </div>
          <button 
            onClick={onAdd}
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all active:scale-[0.98] flex items-center gap-2"
          >
            <Plus size={18} />
            Add Holiday
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-2">
          {filteredHolidays.length > 0 ? (
            <div className="space-y-1">
              {filteredHolidays.map(holiday => (
                <div key={holiday.id} className="group p-4 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex flex-col items-center justify-center font-bold border border-indigo-100">
                      <span className="text-xs uppercase tracking-wider">{new Date(holiday.date).toLocaleString('default', { month: 'short' })}</span>
                      <span className="text-lg leading-none">{new Date(holiday.date).getDate()}</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">{holiday.name}</h3>
                      <p className="text-xs text-slate-500">{new Date(holiday.date).getFullYear()} • {new Date(holiday.date).toLocaleDateString(undefined, { weekday: 'long' })}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => onEdit(holiday)}
                      className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-white hover:shadow-sm rounded-lg border border-transparent hover:border-slate-200 transition-all"
                      title="Edit"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => onDelete(holiday.id)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-white hover:shadow-sm rounded-lg border border-transparent hover:border-slate-200 transition-all"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <Calendar className="text-slate-300" size={32} />
              </div>
              <h3 className="text-slate-900 font-medium">No holidays found</h3>
              <p className="text-slate-500 text-sm">Try adjusting your search or add a new one.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};