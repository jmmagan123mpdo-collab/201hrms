import React, { useState, useMemo } from 'react';
import { AuditLog } from '../../types/index.ts';
import { 
  ShieldCheck, 
  Search, 
  Filter, 
  Calendar, 
  User, 
  FileText, 
  Clock, 
  CheckCircle2, 
  Download,
  AlertCircle
} from 'lucide-react';

const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'LOG-001',
    actorUid: 'user-001',
    actorName: 'Atty. Maria Elena Castillo',
    actorRole: 'hr_admin',
    action: 'VERIFIED_DOCUMENT',
    targetEntity: 'EmployeeDocument',
    targetId: 'DOC-PSA-EMP001',
    details: 'Verified PSA Birth Certificate for Juan Dela Cruz (EMP-2024-002) as authentic.',
    timestamp: '2026-02-12T08:15:22.000Z'
  },
  {
    id: 'LOG-002',
    actorUid: 'user-003',
    actorName: 'Leonardo Fernandez, CPA',
    actorRole: 'payroll',
    action: 'GENERATED_CUSTOM_PAYSLIP',
    targetEntity: 'PayslipRecord',
    targetId: 'PS-2026-02-EMP002',
    details: 'Generated February 2026 Digital Payslip for Planning Officer II Juan Dela Cruz.',
    timestamp: '2026-02-12T08:02:11.000Z'
  },
  {
    id: 'LOG-003',
    actorUid: 'user-002',
    actorName: 'Grace Balmes',
    actorRole: 'hr_staff',
    action: 'APPROVED_TRAVEL_ORDER',
    targetEntity: 'TravelOrder',
    targetId: 'TO-2026-001',
    details: 'Recorded Mayor approval for Official Travel Order TO-LGU-SJ-2026-0012 to CSC Regional IV-B.',
    timestamp: '2026-02-11T16:30:00.000Z'
  },
  {
    id: 'LOG-004',
    actorUid: 'user-001',
    actorName: 'Atty. Maria Elena Castillo',
    actorRole: 'hr_admin',
    action: 'ISSUED_PASS_SLIP',
    targetEntity: 'PassSlip',
    targetId: 'PS-2026-001',
    details: 'Authorized Official Business Pass Slip for Juan Dela Cruz to LTO San Jose.',
    timestamp: '2026-02-11T09:15:00.000Z'
  },
  {
    id: 'LOG-005',
    actorUid: 'user-001',
    actorName: 'Atty. Maria Elena Castillo',
    actorRole: 'hr_admin',
    action: 'SYSTEM_BROADCAST_DISPATCHED',
    targetEntity: 'SystemBroadcast',
    targetId: 'BC-2026-001',
    details: 'Dispatched mandatory SALN submission advisory to all LGU personnel.',
    timestamp: '2026-02-01T08:00:00.000Z'
  }
];

export const AuditLogsManager: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('all');

  const filteredLogs = useMemo(() => {
    return logs.filter(l => {
      if (actionFilter !== 'all' && l.action !== actionFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchActor = l.actorName.toLowerCase().includes(q);
        const matchDet = l.details.toLowerCase().includes(q);
        const matchAction = l.action.toLowerCase().includes(q);
        if (!matchActor && !matchDet && !matchAction) return false;
      }
      return true;
    });
  }, [logs, actionFilter, searchQuery]);

  return (
    <div className="space-y-4 font-sans text-xs">
      
      {/* Top Banner Header */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-blue-100 text-[#173B67] text-[10px] font-bold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-3 h-3 text-[#173B67]" />
            <span>Immutable Security & Transaction Audit Trail</span>
          </div>
          <h2 className="text-base sm:text-xl font-extrabold text-slate-900 tracking-tight">
            Audit Trail & Transaction Logs
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Tamper-evident chronological log of all administrative actions, document verifications, role changes, and payroll issuances.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            const content = 'data:text/csv;charset=utf-8,' + ['ID,Actor,Role,Action,Details,Timestamp'].concat(
              filteredLogs.map(l => `${l.id},"${l.actorName}",${l.actorRole},${l.action},"${l.details}",${l.timestamp}`)
            ).join('\n');
            const link = document.createElement('a');
            link.href = encodeURI(content);
            link.download = 'LGU_San_Jose_Audit_Trail.csv';
            link.click();
          }}
          className="px-4 py-2.5 bg-[#173B67] hover:bg-[#122e50] text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center space-x-1.5 cursor-pointer text-xs shrink-0"
        >
          <Download className="w-4 h-4 text-amber-300" />
          <span>Export Audit Log (CSV)</span>
        </button>
      </div>

      {/* 4 Stat KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
        <div className="bg-white p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider block truncate">
            Total Logged Events
          </span>
          <div className="text-lg sm:text-2xl font-extrabold text-[#173B67] mt-1 font-mono">
            {logs.length}
          </div>
          <span className="text-[10px] text-slate-400 block mt-0.5">Immutable Events</span>
        </div>

        <div className="bg-white p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider block truncate">
            Document Verifications
          </span>
          <div className="text-lg sm:text-2xl font-extrabold text-emerald-600 mt-1 font-mono">
            {logs.filter(l => l.action.includes('DOCUMENT') || l.action.includes('VERIFIED')).length}
          </div>
          <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">201 Validation Actions</span>
        </div>

        <div className="bg-white p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider block truncate">
            Payroll Operations
          </span>
          <div className="text-lg sm:text-2xl font-extrabold text-blue-700 mt-1 font-mono">
            {logs.filter(l => l.action.includes('PAYSLIP')).length}
          </div>
          <span className="text-[10px] text-slate-400 block mt-0.5">Compensation Records</span>
        </div>

        <div className="bg-white p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider block truncate">
            Security Status
          </span>
          <div className="text-lg sm:text-2xl font-extrabold text-emerald-700 mt-1 font-mono">
            Active
          </div>
          <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">Zero Breaches Logged</span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
            Audit Trail Events Registry ({filteredLogs.length})
          </h3>
          <span className="text-[11px] text-slate-500">
            Compliant with RA 10173 Data Privacy Act
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredLogs.map(l => (
            <div key={l.id} className="p-4 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded-full bg-blue-100 text-[#173B67] font-bold text-[10px]">
                    {l.action}
                  </span>
                  <span className="font-mono text-[10px] text-slate-400">{l.id}</span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {new Date(l.timestamp).toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-slate-800 font-medium">{l.details}</p>
                <div className="text-[11px] text-slate-500">
                  By: <strong>{l.actorName}</strong> ({l.actorRole.toUpperCase()})
                </div>
              </div>

              <span className="inline-flex items-center space-x-1 text-[11px] text-emerald-700 font-semibold shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Recorded</span>
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
