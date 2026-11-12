import React, { useState } from 'react';
import { useData } from '../../context/DataContext.tsx';
import { useAuth } from '../../context/AuthContext.tsx';
import { SALNRecord } from '../../types/index.ts';
import { 
  ShieldCheck, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Download, 
  FileSpreadsheet, 
  Building2,
  Calendar
} from 'lucide-react';
import * as XLSX from 'xlsx';

export const SALNManager: React.FC = () => {
  const { salnRecords, employees, offices, verifySALN } = useData();
  const { currentUser, hasPermission } = useAuth();

  const [filterOffice, setFilterOffice] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Do not infer SALN coverage from employment classification. Coverage must follow configured applicable rules.

  const filteredRecords = salnRecords.filter(s => {
    const matchesOffice = filterOffice === 'all' || s.officeName === filterOffice;
    const matchesType = filterType === 'all' || s.filingType === filterType;
    const matchesStatus = filterStatus === 'all' || s.status === filterStatus;
    return matchesOffice && matchesType && matchesStatus;
  });

  const verifiedCount = salnRecords.filter(s => s.status === 'verified').length;
  const pendingCount = salnRecords.filter(s => s.status === 'pending_submission').length;
  const submittedCount = salnRecords.filter(s => s.status === 'submitted').length;

  const handleExport = () => {
    const exportData = filteredRecords.map(s => ({
      'Employee Name': s.employeeName,
      'Office': s.officeName,
      'Classification': s.classification,
      'Filing Type': s.filingType,
      'As of Date': s.asOfDate,
      'Submission Date': s.submissionDate || 'Pending',
      'Compliance Status': s.status,
      'Total Assets (₱)': s.totalAssets || 'N/A',
      'Total Liabilities (₱)': s.totalLiabilities || 'N/A',
      'Net Worth (₱)': s.netWorth || 'N/A',
      'Verified By': s.verifiedBy || 'Pending'
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'SALN_Summary');
    XLSX.writeFile(workbook, `LGU_SanJose_SALN_Compliance_${new Date().getFullYear()}.xlsx`);
  };

  return (
    <div className="space-y-4 text-xs">
      
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-indigo-700" />
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">SALN Compliance & Monitoring</h2>
          </div>
          <p className="text-xs text-slate-500">
            Statement of Assets, Liabilities, and Net Worth tracking per RA 6713 & CSC Directives
          </p>
        </div>

        <button
          type="button"
          onClick={handleExport}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl border border-slate-300 transition-colors flex items-center space-x-1.5 cursor-pointer self-start sm:self-auto"
        >
          <Download className="w-4 h-4 text-slate-600" />
          <span>Export SALN Summary</span>
        </button>
      </div>

      {/* Metrics Row - Side-by-Side 2x2 Grid on Mobile */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
        <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] sm:text-xs text-slate-500 block font-semibold truncate">Employees in Masterlist</span>
          <span className="text-xl sm:text-2xl font-bold text-slate-900 mt-1 block">{employees.length}</span>
          <span className="text-[10px] text-slate-400 block truncate">Coverage determined by applicable rules</span>
        </div>
        <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] sm:text-xs text-slate-500 block font-semibold truncate">Verified Compliant</span>
          <span className="text-xl sm:text-2xl font-bold text-emerald-700 mt-1 block">{verifiedCount}</span>
          <span className="text-[10px] text-emerald-600 font-medium block truncate">Notarized & Reviewed</span>
        </div>
        <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] sm:text-xs text-slate-500 block font-semibold truncate">For Review</span>
          <span className="text-xl sm:text-2xl font-bold text-blue-700 mt-1 block">{submittedCount}</span>
          <span className="text-[10px] text-blue-600 font-medium block truncate">Awaiting HR verify</span>
        </div>
        <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] sm:text-xs text-slate-500 block font-semibold truncate">Pending Submit</span>
          <span className="text-xl sm:text-2xl font-bold text-[#F28C28] mt-1 block">{pendingCount}</span>
          <span className="text-[10px] text-rose-500 font-medium block truncate">Due April 30 statutory</span>
        </div>
      </div>

      {/* Filter Row */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-wrap gap-3">
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="p-2 border rounded-xl bg-white"
        >
          <option value="all">All Filing Types</option>
          <option value="Annual">Annual SALN</option>
          <option value="Entry">Entry SALN</option>
          <option value="Exit">Exit SALN</option>
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="p-2 border rounded-xl bg-white"
        >
          <option value="all">All Compliance Statuses</option>
          <option value="verified">Verified</option>
          <option value="submitted">Submitted (For Review)</option>
          <option value="pending_submission">Pending Submission</option>
        </select>
      </div>

      {/* Table & Mobile Cards */}
      <div className="space-y-3">
        
        {/* Mobile Card Layout (Visible on mobile < 768px) */}
        <div className="block md:hidden space-y-3">
          {filteredRecords.length === 0 ? (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center text-slate-400">
              No SALN records found for this filter.
            </div>
          ) : (
            filteredRecords.map(rec => (
              <div key={rec.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{rec.employeeName}</h4>
                    <span className="text-[11px] text-slate-500 font-medium block">{rec.officeName}</span>
                    <span className="text-[10px] text-slate-400 font-mono">ID: {rec.employeeId}</span>
                  </div>

                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider shrink-0 ${
                    rec.status === 'verified' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                    rec.status === 'submitted' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                    'bg-amber-100 text-amber-800 border-amber-200'
                  }`}>
                    {rec.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl text-[11px] text-slate-600 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Filing Type:</span>
                    <span className="font-semibold text-slate-800">{rec.filingType} SALN</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">As of Date:</span>
                    <span className="font-semibold text-slate-800">{rec.asOfDate}</span>
                  </div>
                  <div className="flex justify-between font-mono">
                    <span className="text-slate-400">Net Worth:</span>
                    <span className="font-bold text-[#173B67]">{rec.netWorth ? `₱${rec.netWorth.toLocaleString()}` : '—'}</span>
                  </div>
                </div>

                {rec.status === 'submitted' && hasPermission('verify_documents') ? (
                  <button
                    type="button"
                    onClick={() => verifySALN(rec.id, currentUser?.displayName || 'HR Administrator')}
                    className="w-full min-h-[44px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center justify-center space-x-1.5 cursor-pointer shadow-xs"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Verify & Confirm SALN</span>
                  </button>
                ) : rec.status === 'verified' ? (
                  <div className="text-center py-1 text-emerald-700 font-bold text-xs">
                    ✓ Verified Compliant
                  </div>
                ) : null}
              </div>
            ))
          )}
        </div>

        {/* Desktop Table View (Hidden on mobile < 768px) */}
        <div className="hidden md:block bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#173B67] text-white uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4 font-bold">Personnel Name</th>
                  <th className="py-3 px-4 font-bold">Office</th>
                  <th className="py-3 px-4 font-bold">Filing Type</th>
                  <th className="py-3 px-4 font-bold">As of Date</th>
                  <th className="py-3 px-4 font-bold">Net Worth (₱)</th>
                  <th className="py-3 px-4 font-bold">Status</th>
                  <th className="py-3 px-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRecords.map(rec => (
                  <tr key={rec.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{rec.employeeName}</div>
                      <span className="text-[10px] text-slate-400 font-mono">ID: {rec.employeeId}</span>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-700">{rec.officeName}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">{rec.filingType} SALN</td>
                    <td className="py-3.5 px-4 text-slate-600">{rec.asOfDate}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {rec.netWorth ? `₱${rec.netWorth.toLocaleString()}` : '—'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${
                        rec.status === 'verified' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                        rec.status === 'submitted' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                        'bg-amber-100 text-amber-800 border-amber-200'
                      }`}>
                        {rec.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {rec.status === 'submitted' && hasPermission('verify_documents') ? (
                        <button
                          type="button"
                          onClick={() => verifySALN(rec.id, currentUser?.displayName || 'HR Administrator')}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg cursor-pointer"
                        >
                          Verify
                        </button>
                      ) : rec.status === 'verified' ? (
                        <span className="text-emerald-700 font-bold text-[11px]">Compliant</span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Awaiting Form</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  );
};
