import React, { useState } from 'react';
import { useData } from '../../context/DataContext.tsx';
import { useAuth } from '../../context/AuthContext.tsx';
import { Employee, DocumentCategory } from '../../types/index.ts';
import { Send, X, FileText, AlertCircle, Calendar } from 'lucide-react';

interface CreateRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  presetEmployee?: Employee;
  presetCategory?: DocumentCategory;
  presetDocName?: string;
}

export const CreateRequestModal: React.FC<CreateRequestModalProps> = ({
  isOpen,
  onClose,
  presetEmployee,
  presetCategory,
  presetDocName
}) => {
  const { employees, categories, createDocumentRequest } = useData();
  const { currentUser } = useAuth();

  const [employeeId, setEmployeeId] = useState(presetEmployee?.id || employees[0]?.id || '');
  const [categoryId, setCategoryId] = useState(presetCategory?.id || categories[0]?.id || '');
  const [documentName, setDocumentName] = useState(presetDocName || '');
  const [instructions, setInstructions] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [isRequired, setIsRequired] = useState(true);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find(e => e.id === employeeId);
    const cat = categories.find(c => c.id === categoryId);
    if (!emp || !cat) return;

    await createDocumentRequest({
      employeeId: emp.id,
      employeeName: `${emp.firstName} ${emp.lastName}`,
      categoryId: cat.id,
      categoryName: cat.name,
      documentName,
      documentTypeCode: documentName.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase(),
      instructions,
      dueDate,
      isRequired,
      requestedBy: currentUser?.displayName || 'HR Administrator'
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Mobile Drag Handle */}
        <div className="sm:hidden pt-2 pb-1 bg-[#173B67] flex justify-center shrink-0">
          <div className="w-10 h-1 bg-white/40 rounded-full"></div>
        </div>

        <div className="bg-[#173B67] px-5 py-3.5 sm:py-4 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2">
            <Send className="w-4 h-4 text-orange-400" />
            <h3 className="text-sm font-bold">Issue Official Document Request</h3>
          </div>
          <button 
            onClick={onClose} 
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-300 hover:text-white rounded-xl transition-colors cursor-pointer"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 text-xs overflow-y-auto">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Target Personnel</label>
            <select
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              className="w-full p-2.5 border rounded-xl bg-white text-xs font-semibold"
            >
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.lastName}, {emp.firstName} ({emp.employeeNumber} - {emp.officeName})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Document Category</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full p-2.5 border rounded-xl bg-white text-xs"
            >
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Document Required *</label>
            <input
              type="text"
              required
              value={documentName}
              onChange={(e) => setDocumentName(e.target.value)}
              placeholder="e.g. CS Form 211 Medical Certificate or Sworn SALN"
              className="w-full p-2.5 border rounded-xl text-xs"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Instructions for Employee</label>
            <textarea
              required
              rows={2}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Specify requirements, notarization needs, or certified true copy guidelines."
              className="w-full p-2.5 border rounded-xl text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Submission Due Date *</label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full p-2.5 border rounded-xl text-xs"
              />
            </div>
            <div className="flex items-center pt-1 sm:pt-5">
              <label className="flex items-center space-x-2 cursor-pointer font-bold text-slate-700 min-h-[44px]">
                <input
                  type="checkbox"
                  checked={isRequired}
                  onChange={(e) => setIsRequired(e.target.checked)}
                  className="rounded text-[#173B67] w-4 h-4"
                />
                <span>Mandatory / Required</span>
              </label>
            </div>
          </div>

          <div className="pt-3 border-t flex flex-col sm:flex-row justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] px-4 py-2 border rounded-xl text-slate-600 font-semibold cursor-pointer flex items-center justify-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="min-h-[44px] px-5 py-2.5 bg-[#173B67] hover:bg-[#122e50] text-white font-bold rounded-xl shadow-md transition-colors cursor-pointer flex items-center justify-center"
            >
              Dispatch Request to ESS
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
