import React, { useState } from 'react';
import { useData } from '../../context/DataContext.tsx';
import { useAuth } from '../../context/AuthContext.tsx';
import { Office } from '../../types/index.ts';
import { 
  Building2, 
  Plus, 
  Edit2, 
  MapPin, 
  Users, 
  CheckCircle2, 
  XCircle, 
  Search,
  Check,
  X
} from 'lucide-react';

export const OfficeDirectory: React.FC = () => {
  const { offices, addOffice, updateOffice } = useData();
  const { hasPermission } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingOffice, setEditingOffice] = useState<Office | null>(null);

  // Form state
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [headName, setHeadName] = useState('');
  const [location, setLocation] = useState('');

  const filteredOffices = offices.filter(o => 
    o.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.headName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSaveOffice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingOffice) {
      await updateOffice(editingOffice.id, {
        code,
        name,
        headName,
        location
      });
      setEditingOffice(null);
    } else {
      await addOffice({
        code,
        name,
        headName,
        location,
        isActive: true,
        employeeCount: 0
      });
      setShowAddModal(false);
    }

    setCode('');
    setName('');
    setHeadName('');
    setLocation('');
  };

  const openEdit = (office: Office) => {
    setEditingOffice(office);
    setCode(office.code);
    setName(office.name);
    setHeadName(office.headName);
    setLocation(office.location);
  };

  return (
    <div className="space-y-4 text-xs">
      
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Municipal Office Directory</h2>
            <span className="text-xs font-bold bg-blue-100 text-[#173B67] px-2.5 py-0.5 rounded-full">
              {offices.length} Official Offices
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Official department structure, office heads, and staffing distribution of LGU San Jose
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search office or head..."
              className="pl-9 pr-3 py-2 border rounded-xl bg-white outline-none w-52"
            />
          </div>

          {hasPermission('manage_offices') && (
            <button
              type="button"
              onClick={() => {
                setEditingOffice(null);
                setCode('');
                setName('');
                setHeadName('');
                setLocation('');
                setShowAddModal(true);
              }}
              className="px-4 py-2 bg-[#173B67] hover:bg-[#122e50] text-white font-bold rounded-xl shadow-xs transition-colors flex items-center space-x-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Office</span>
            </button>
          )}
        </div>
      </div>

      {/* Offices Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredOffices.map((office, idx) => (
          <div 
            key={office.id} 
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2.5">
                  <span className="font-mono font-bold text-xs bg-slate-100 text-[#173B67] px-2 py-0.5 rounded-lg border">
                    #{idx + 1} • {office.code}
                  </span>
                  {office.isActive ? (
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                      Active
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400 font-bold bg-slate-100 px-2 py-0.5 rounded-full">
                      Inactive
                    </span>
                  )}
                </div>

                {hasPermission('manage_offices') && (
                  <button
                    type="button"
                    onClick={() => openEdit(office)}
                    className="p-1.5 text-slate-400 hover:text-blue-700 hover:bg-slate-100 rounded-lg transition-colors"
                    title="Edit Office"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <h3 className="font-bold text-sm text-slate-900 mt-2.5 leading-snug">
                {office.name}
              </h3>

              <div className="mt-3 space-y-1.5 text-[11px] text-slate-600">
                <div className="flex items-center space-x-2">
                  <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>Head: <strong className="text-slate-800">{office.headName}</strong></span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{office.location}</span>
                </div>
              </div>

              {office.sections && office.sections.length > 0 && (
                <div className="mt-3 pt-2 border-t border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Operating Sections:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {office.sections.map(s => (
                      <span key={s} className="bg-slate-50 border border-slate-200 text-slate-600 px-1.5 py-0.2 rounded text-[10px]">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>Personnel Assigned:</span>
              <span className="font-bold text-[#173B67]">{office.employeeCount || 0} staff</span>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Office Modal */}
      {(showAddModal || editingOffice) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-sm text-slate-900">
                {editingOffice ? 'Edit Municipal Office' : 'Add New Municipal Office'}
              </h3>
              <button 
                onClick={() => { setShowAddModal(false); setEditingOffice(null); }} 
                className="text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveOffice} className="space-y-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Office Code *</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="e.g. MPDO, MHRMO, MAO"
                  className="w-full p-2 border rounded-xl font-mono uppercase"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Office Full Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Municipal Planning and Development Office"
                  className="w-full p-2 border rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Office Head / Department Head *</label>
                <input
                  type="text"
                  required
                  value={headName}
                  onChange={(e) => setHeadName(e.target.value)}
                  placeholder="e.g. EnP. Jerome Magan"
                  className="w-full p-2 border rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Physical Location / Room *</label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. 2nd Floor, Executive Building"
                  className="w-full p-2 border rounded-xl"
                />
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => { setShowAddModal(false); setEditingOffice(null); }}
                  className="px-4 py-2 border rounded-xl text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#173B67] hover:bg-[#122e50] text-white font-bold rounded-xl"
                >
                  {editingOffice ? 'Save Changes' : 'Create Office'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
