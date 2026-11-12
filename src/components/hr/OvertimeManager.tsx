import React, { useState, useMemo } from 'react';
import { Employee, OvertimeRecord } from '../../types/index.ts';
import { INITIAL_OVERTIME } from '../../data/operationalData.ts';
import { 
  Clock, 
  Search, 
  Filter, 
  Plus, 
  CheckCircle2, 
  Calendar, 
  Building2, 
  User, 
  Printer, 
  X,
  FileText
} from 'lucide-react';

interface OvertimeManagerProps {
  employees: Employee[];
}

export const OvertimeManager: React.FC<OvertimeManagerProps> = ({ employees }) => {
  const [records, setRecords] = useState<OvertimeRecord[]>(INITIAL_OVERTIME);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form State
  const [selectedEmpId, setSelectedEmpId] = useState(employees[0]?.id || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('05:00 PM');
  const [endTime, setEndTime] = useState('08:00 PM');
  const [hoursRendered, setHoursRendered] = useState<number>(3.0);
  const [purpose, setPurpose] = useState('');
  const [compensationType, setCompensationType] = useState<OvertimeRecord['compensationType']>('Overtime Pay');
  const [rateMultiplier, setRateMultiplier] = useState<number>(1.25);
  const [approvedBy, setApprovedBy] = useState('Atty. Maria Elena Castillo, MHRMO Head');

  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      if (typeFilter !== 'all' && r.compensationType !== typeFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = r.employeeName.toLowerCase().includes(q);
        const matchPurp = r.purpose.toLowerCase().includes(q);
        if (!matchName && !matchPurp) return false;
      }
      return true;
    });
  }, [records, typeFilter, searchQuery]);

  const totalHours = records.reduce((acc, r) => acc + r.hoursRendered, 0);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find(e => e.id === selectedEmpId) || employees[0];
    if (!purpose.trim()) {
      alert('Please state the urgent official overtime purpose.');
      return;
    }

    const newOT: OvertimeRecord = {
      id: `OT-2026-${Date.now().toString().slice(-4)}`,
      employeeId: emp.id,
      employeeNumber: emp.employeeNumber,
      employeeName: `${emp.firstName} ${emp.lastName}`,
      officeName: emp.officeName,
      date,
      startTime,
      endTime,
      hoursRendered,
      purpose: purpose.trim(),
      compensationType,
      rateMultiplier,
      status: 'Approved',
      approvedBy,
      createdAt: new Date().toISOString()
    };

    setRecords(prev => [newOT, ...prev]);
    setShowCreateModal(false);
    setPurpose('');
  };

  return (
    <div className="space-y-4 font-sans text-xs">
      
      {/* Top Banner Header */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-blue-100 text-[#173B67] text-[10px] font-bold uppercase tracking-wider mb-1">
            <Clock className="w-3 h-3 text-[#173B67]" />
            <span>Overtime Authorization & Computation</span>
          </div>
          <h2 className="text-base sm:text-xl font-extrabold text-slate-900 tracking-tight">
            Overtime & Compensatory Time-Off (CTO) Registry
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            CSC-DBM Joint Circular No. 2, s. 2015 compliant overtime authoring, 125%/150% differential rates, and CTO credit tracking.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 bg-[#173B67] hover:bg-[#122e50] text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center space-x-1.5 cursor-pointer text-xs shrink-0"
        >
          <Plus className="w-4 h-4 text-amber-300" />
          <span>Authorize Overtime Request</span>
        </button>
      </div>

      {/* 3 Stat KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-4">
        <div className="bg-white p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider block truncate">
            Total OT Authorizations
          </span>
          <div className="text-lg sm:text-2xl font-extrabold text-[#173B67] mt-1 font-mono">
            {records.length}
          </div>
          <span className="text-[10px] text-slate-400 block mt-0.5">Active Cycle</span>
        </div>

        <div className="bg-white p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider block truncate">
            Total OT Hours Rendered
          </span>
          <div className="text-lg sm:text-2xl font-extrabold text-indigo-600 mt-1 font-mono">
            {totalHours.toFixed(1)} hrs
          </div>
          <span className="text-[10px] text-indigo-600 font-semibold block mt-0.5">Duly Verified by Biometrics</span>
        </div>

        <div className="bg-white p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider block truncate">
            Compensatory Time-Off (CTO)
          </span>
          <div className="text-lg sm:text-2xl font-extrabold text-emerald-600 mt-1 font-mono">
            {records.filter(r => r.compensationType === 'Compensatory Time-Off (CTO)').length} Credits
          </div>
          <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">Converted to Leave Credits</span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
            Overtime Authorization Ledger ({filteredRecords.length})
          </h3>
          <span className="text-[11px] text-slate-500">
            Civil Service Commission & COA Circular Compliant
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-200">
                <th className="py-3 px-4">Date & Personnel</th>
                <th className="py-3 px-4">Office & Time Window</th>
                <th className="py-3 px-4 text-center">Hours</th>
                <th className="py-3 px-4 text-center">Compensation Type</th>
                <th className="py-3 px-4">Purpose / Accomplishment</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredRecords.map(r => (
                <tr key={r.id} className="hover:bg-blue-50/40 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-bold text-[#173B67]">{r.employeeName}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{r.date}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-800">{r.officeName}</div>
                    <div className="text-[11px] text-slate-500 font-mono">{r.startTime} – {r.endTime}</div>
                  </td>
                  <td className="py-3 px-4 text-center font-mono font-bold text-slate-900">
                    {r.hoursRendered.toFixed(1)} hrs
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold text-[10px]">
                      {r.compensationType} ({r.rateMultiplier}x)
                    </span>
                  </td>
                  <td className="py-3 px-4 max-w-[240px]">
                    <p className="truncate text-slate-700">{r.purpose}</p>
                    <span className="text-[10px] text-slate-400">Approved by: {r.approvedBy}</span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px]">
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden flex flex-col my-auto">
            
            <div className="p-4 bg-[#173B67] text-white flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-2.5">
                <Clock className="w-5 h-5 text-amber-300" />
                <h3 className="font-bold text-base">Authorize Overtime Request</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-5 space-y-4 text-xs">
              
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Personnel</label>
                <select
                  value={selectedEmpId}
                  onChange={(e) => setSelectedEmpId(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl bg-white font-bold text-xs"
                >
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName} ({emp.employeeNumber}) – {emp.officeName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">OT Date</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-xl bg-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Start Time</label>
                  <input
                    type="text"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-xl bg-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">End Time</label>
                  <input
                    type="text"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-xl bg-white text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Hours Rendered</label>
                  <input
                    type="number"
                    step="0.5"
                    value={hoursRendered}
                    onChange={(e) => setHoursRendered(Number(e.target.value))}
                    className="w-full p-2 border border-slate-300 rounded-xl bg-white font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Compensation</label>
                  <select
                    value={compensationType}
                    onChange={(e) => setCompensationType(e.target.value as any)}
                    className="w-full p-2 border border-slate-300 rounded-xl bg-white text-xs"
                  >
                    <option value="Overtime Pay">Overtime Pay (125% - 150%)</option>
                    <option value="Compensatory Time-Off (CTO)">Compensatory Time-Off (CTO)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Urgent Official Purpose</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Detail the emergency project, legislative session, disaster response, or deadline..."
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-xl bg-white text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl bg-white text-slate-700 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#173B67] hover:bg-[#122e50] text-white font-bold rounded-xl shadow-md cursor-pointer flex items-center space-x-1.5"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Authorize OT</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
