import React, { useState, useMemo } from 'react';
import { Employee, PassSlip, PassSlipStatus, PassSlipType } from '../../types/index.ts';
import { INITIAL_PASS_SLIPS } from '../../data/operationalData.ts';
import { 
  Clock, 
  Search, 
  Filter, 
  Plus, 
  Printer, 
  CheckCircle2, 
  MapPin, 
  Building2, 
  User, 
  X, 
  FileText,
  AlertCircle
} from 'lucide-react';

interface PassSlipsManagerProps {
  employees: Employee[];
}

export const PassSlipsManager: React.FC<PassSlipsManagerProps> = ({ employees }) => {
  const [slips, setSlips] = useState<PassSlip[]>(INITIAL_PASS_SLIPS);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedSlipForPrint, setSelectedSlipForPrint] = useState<PassSlip | null>(null);

  // Form State
  const [selectedEmpId, setSelectedEmpId] = useState(employees[0]?.id || '');
  const [slipType, setSlipType] = useState<PassSlipType>('Official Business (OB)');
  const [destination, setDestination] = useState('');
  const [timeOut, setTimeOut] = useState('09:00 AM');
  const [expectedTimeIn, setExpectedTimeIn] = useState('11:30 AM');
  const [purpose, setPurpose] = useState('');
  const [authorizingOfficer, setAuthorizingOfficer] = useState('Atty. Maria Elena Castillo, MHRMO Head');

  // Filtered
  const filteredSlips = useMemo(() => {
    return slips.filter(s => {
      if (typeFilter !== 'all' && s.slipType !== typeFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = s.employeeName.toLowerCase().includes(q);
        const matchDest = s.destination.toLowerCase().includes(q);
        const matchPurpose = s.purpose.toLowerCase().includes(q);
        if (!matchName && !matchDest && !matchPurpose) return false;
      }
      return true;
    });
  }, [slips, typeFilter, searchQuery]);

  // Statistics
  const totalSlips = slips.length;
  const obCount = slips.filter(s => s.slipType === 'Official Business (OB)').length;
  const personalCount = slips.filter(s => s.slipType === 'Personal Undertaking').length;
  const activeOutCount = slips.filter(s => s.status === 'Approved' && !s.actualTimeIn).length;

  const handleCreateSlip = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find(e => e.id === selectedEmpId) || employees[0];
    if (!destination.trim() || !purpose.trim()) {
      alert('Please fill in Destination and Purpose.');
      return;
    }

    const newSlip: PassSlip = {
      id: `PS-2026-${Date.now().toString().slice(-4)}`,
      employeeId: emp.id,
      employeeNumber: emp.employeeNumber,
      employeeName: `${emp.firstName} ${emp.lastName}`,
      officeName: emp.officeName,
      position: emp.position,
      date: new Date().toISOString().split('T')[0],
      slipType,
      destination: destination.trim(),
      timeOut,
      expectedTimeIn,
      purpose: purpose.trim(),
      authorizingOfficer,
      status: 'Approved',
      createdAt: new Date().toISOString()
    };

    setSlips(prev => [newSlip, ...prev]);
    setShowCreateModal(false);
    setDestination('');
    setPurpose('');
  };

  const handleMarkReturned = (id: string) => {
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setSlips(prev => prev.map(s => s.id === id ? { ...s, actualTimeIn: nowTime, status: 'Returned' as PassSlipStatus } : s));
  };

  return (
    <div className="space-y-4 font-sans text-xs">
      
      {/* Top Banner Header */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-blue-100 text-[#173B67] text-[10px] font-bold uppercase tracking-wider mb-1">
            <Clock className="w-3 h-3 text-[#173B67]" />
            <span>Personnel Locator & Pass Slip Registry</span>
          </div>
          <h2 className="text-base sm:text-xl font-extrabold text-slate-900 tracking-tight">
            Pass Slips & Locator Authorization
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor official outside business, local office visitations, and authorized personal grace leaves with biometric synchronization.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 bg-[#173B67] hover:bg-[#122e50] text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center space-x-1.5 cursor-pointer text-xs shrink-0"
        >
          <Plus className="w-4 h-4 text-amber-300" />
          <span>Issue Pass Slip / Locator</span>
        </button>
      </div>

      {/* 4 Stat KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
        <div className="bg-white p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider block truncate">
            Total Pass Slips
          </span>
          <div className="text-lg sm:text-2xl font-extrabold text-[#173B67] mt-1 font-mono">
            {totalSlips}
          </div>
          <span className="text-[10px] text-slate-400 block mt-0.5">Active Log</span>
        </div>

        <div className="bg-white p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider block truncate">
            Official Business (OB)
          </span>
          <div className="text-lg sm:text-2xl font-extrabold text-emerald-600 mt-1 font-mono">
            {obCount}
          </div>
          <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">LGU Duty / Agency Visits</span>
        </div>

        <div className="bg-white p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider block truncate">
            Personal Undertakings
          </span>
          <div className="text-lg sm:text-2xl font-extrabold text-amber-600 mt-1 font-mono">
            {personalCount}
          </div>
          <span className="text-[10px] text-amber-600 font-semibold block mt-0.5">Authorized Grace Time</span>
        </div>

        <div className="bg-white p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider block truncate">
            Currently Out on Pass
          </span>
          <div className="text-lg sm:text-2xl font-extrabold text-indigo-600 mt-1 font-mono">
            {activeOutCount}
          </div>
          <span className="text-[10px] text-indigo-600 font-semibold block mt-0.5">Awaiting Time-In Return</span>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
          <div className="sm:col-span-3 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by Personnel Name, Destination, or Purpose..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl bg-white text-xs focus:ring-2 focus:ring-[#173B67] focus:outline-none"
            />
          </div>

          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-xl bg-white text-xs font-semibold text-slate-800"
            >
              <option value="all">All Pass Slip Types</option>
              <option value="Official Business (OB)">Official Business (OB)</option>
              <option value="Personal Undertaking">Personal Undertaking</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
            Pass Slips & Locator Registry ({filteredSlips.length})
          </h3>
          <span className="text-[11px] text-slate-500">
            CSC Omnibus Attendance Rules Compliant
          </span>
        </div>

        {filteredSlips.length === 0 ? (
          <div className="p-8 text-center text-slate-500 space-y-2">
            <Clock className="w-8 h-8 mx-auto text-slate-300" />
            <p className="font-bold text-slate-700">No pass slips match criteria</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-200">
                  <th className="py-3 px-4">Date & Slip ID</th>
                  <th className="py-3 px-4">Personnel & Office</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Destination & Purpose</th>
                  <th className="py-3 px-4 text-center">Schedule</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredSlips.map(ps => (
                  <tr key={ps.id} className="hover:bg-blue-50/40 transition-colors">
                    
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{ps.date}</div>
                      <div className="font-mono text-[10px] text-slate-400">{ps.id}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-[#173B67]">{ps.employeeName}</div>
                      <div className="text-[11px] text-slate-500 truncate max-w-[180px]">
                        {ps.position} • {ps.officeName}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        ps.slipType === 'Official Business (OB)' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                        'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {ps.slipType}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-800 flex items-center space-x-1">
                        <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        <span className="truncate max-w-[200px]">{ps.destination}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 truncate max-w-[200px] mt-0.5">
                        {ps.purpose}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <div className="font-mono font-semibold text-slate-700">
                        {ps.timeOut} - {ps.expectedTimeIn}
                      </div>
                      {ps.actualTimeIn ? (
                        <div className="text-[10px] text-emerald-600 font-bold">
                          Returned: {ps.actualTimeIn}
                        </div>
                      ) : (
                        <div className="text-[10px] text-amber-600 italic">
                          Currently Out
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        ps.status === 'Returned' ? 'bg-slate-100 text-slate-700' :
                        ps.status === 'Approved' ? 'bg-emerald-50 text-emerald-700' :
                        'bg-amber-50 text-amber-700'
                      }`}>
                        {ps.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right space-x-1.5">
                      {!ps.actualTimeIn && (
                        <button
                          type="button"
                          onClick={() => handleMarkReturned(ps.id)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg cursor-pointer text-xs"
                        >
                          Mark Returned
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setSelectedSlipForPrint(ps)}
                        className="px-2.5 py-1 bg-[#173B67] hover:bg-[#122e50] text-white font-bold rounded-lg cursor-pointer text-xs inline-flex items-center space-x-1"
                      >
                        <Printer className="w-3 h-3 text-amber-300" />
                        <span>Print</span>
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden flex flex-col my-auto">
            
            <div className="p-4 bg-[#173B67] text-white flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-2.5">
                <Clock className="w-5 h-5 text-amber-300" />
                <h3 className="font-bold text-base">Issue Pass Slip / Locator Authorization</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSlip} className="p-5 space-y-4 text-xs">
              
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Select Employee
                </label>
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

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Pass Slip Category</label>
                <select
                  value={slipType}
                  onChange={(e) => setSlipType(e.target.value as PassSlipType)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl bg-white text-xs font-semibold"
                >
                  <option value="Official Business (OB)">Official Business (OB) – On official municipal mission</option>
                  <option value="Personal Undertaking">Personal Undertaking – Personal urgent matters</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Destination</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Land Bank San Jose, Post Office, Registry of Deeds"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-xl bg-white text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Time Out</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 09:30 AM"
                    value={timeOut}
                    onChange={(e) => setTimeOut(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-xl bg-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Expected Time In</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 11:30 AM"
                    value={expectedTimeIn}
                    onChange={(e) => setExpectedTimeIn(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-xl bg-white text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Specific Purpose</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Detail the purpose of departure from station..."
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-xl bg-white text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Authorizing Officer</label>
                <input
                  type="text"
                  value={authorizingOfficer}
                  onChange={(e) => setAuthorizingOfficer(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-xl bg-white text-xs font-semibold"
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
                  <span>Issue Pass Slip</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Print View Modal */}
      {selectedSlipForPrint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden flex flex-col my-auto">
            
            <div className="p-4 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
              <span className="font-bold text-slate-800 text-xs">Official Pass Slip / Locator</span>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-[#173B67] text-white font-bold rounded-lg cursor-pointer text-xs flex items-center space-x-1"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Slip</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedSlipForPrint(null)}
                  className="p-1 rounded-lg text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4 text-slate-900 font-sans text-xs bg-white">
              <div className="text-center border-b pb-3 space-y-0.5">
                <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  MUNICIPALITY OF SAN JOSE • OCCIDENTAL MINDORO
                </p>
                <h4 className="font-extrabold text-sm text-[#173B67]">
                  MUNICIPAL PASS SLIP & LOCATOR AUTHORIZATION
                </h4>
                <p className="text-[10px] text-slate-500">Ref: {selectedSlipForPrint.id}</p>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between border-b pb-1">
                  <span className="text-slate-500">Date:</span>
                  <span className="font-bold">{selectedSlipForPrint.date}</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span className="text-slate-500">Personnel:</span>
                  <span className="font-bold">{selectedSlipForPrint.employeeName} ({selectedSlipForPrint.employeeNumber})</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span className="text-slate-500">Office / Designation:</span>
                  <span className="font-semibold">{selectedSlipForPrint.position} • {selectedSlipForPrint.officeName}</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span className="text-slate-500">Classification:</span>
                  <span className="font-bold text-blue-700">{selectedSlipForPrint.slipType}</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span className="text-slate-500">Destination:</span>
                  <span className="font-bold">{selectedSlipForPrint.destination}</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span className="text-slate-500">Time Out:</span>
                  <span className="font-mono font-bold">{selectedSlipForPrint.timeOut}</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span className="text-slate-500">Expected Time In:</span>
                  <span className="font-mono font-bold">{selectedSlipForPrint.expectedTimeIn}</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Purpose:</span>
                  <p className="text-xs italic text-slate-800">"{selectedSlipForPrint.purpose}"</p>
                </div>
              </div>

              <div className="pt-4 border-t text-center">
                <div className="border-b border-slate-300 pb-1 font-bold text-xs inline-block min-w-[200px]">
                  {selectedSlipForPrint.authorizingOfficer}
                </div>
                <div className="text-[10px] text-slate-500 uppercase mt-0.5">Authorizing Supervisor / HRMO</div>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};
