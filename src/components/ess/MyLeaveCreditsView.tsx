import React from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useData } from '../../context/DataContext.tsx';
import { 
  FileClock, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  History, 
  AlertCircle, 
  TrendingUp,
  Award
} from 'lucide-react';

export const MyLeaveCreditsView: React.FC = () => {
  const { currentEmployee, currentUser } = useAuth();
  const { leaveApplications } = useData();

  const employeeId = currentUser?.employeeId || currentEmployee?.id || 'EMP-2024-002';
  const isPermanent = currentEmployee?.classification === 'Permanent';

  // Filter employee leaves
  const myLeaves = leaveApplications.filter(l => l.employeeId === employeeId);
  const approvedLeaves = myLeaves.filter(l => l.status === 'approved');
  const pendingLeaves = myLeaves.filter(l => l.status.startsWith('pending_'));

  // Calculate used credits from approved leaves only
  const usedVacationDays = approvedLeaves
    .filter(l => l.leaveType === 'Vacation' || l.leaveType === 'Mandatory/Forced')
    .reduce((sum, l) => sum + (l.workingDays || 0), 0);

  const usedSickDays = approvedLeaves
    .filter(l => l.leaveType === 'Sick')
    .reduce((sum, l) => sum + (l.workingDays || 0), 0);

  const usedSPLDays = approvedLeaves
    .filter(l => l.leaveType === 'Special Privilege')
    .reduce((sum, l) => sum + (l.workingDays || 0), 0);

  // Balances
  const vlBeginning = 15.0;
  const vlEarned = 2.5; // Jan + Feb 2026
  const vlRemaining = Math.max(0, vlBeginning + vlEarned - usedVacationDays);

  const slBeginning = 14.5;
  const slEarned = 2.5;
  const slRemaining = Math.max(0, slBeginning + slEarned - usedSickDays);

  const splBeginning = 3.0;
  const splRemaining = Math.max(0, splBeginning - usedSPLDays);

  const forcedLeaveRemaining = Math.max(0, 5.0 - usedVacationDays);

  return (
    <div className="space-y-4 font-sans text-xs">
      
      {/* Header */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-orange-100 text-[#F28C28] text-[10px] font-bold uppercase tracking-wider mb-1">
            <FileClock className="w-3 h-3 text-[#F28C28]" />
            <span>CSC Memorandum Circular No. 41, s. 1998</span>
          </div>
          <h3 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
            My Official Leave Credits & Ledger
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time balance of Vacation Leave, Sick Leave, and Special Privilege Leave for FY 2026.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-[#173B67] border border-blue-200">
            {currentEmployee?.classification || 'Permanent'} Personnel
          </span>
        </div>
      </div>

      {/* Statutory Rule Notice (Section 14 & 16 Invariant) */}
      <div className="p-3.5 bg-blue-50/80 border border-blue-200 rounded-2xl text-[#173B67] flex items-start space-x-2.5">
        <ShieldCheck className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
        <div className="space-y-0.5 text-xs">
          <span className="font-bold">Leave Credit Deduction Invariant:</span>
          <p className="text-[11px] text-blue-900 leading-relaxed">
            Pending applications, Supervisor assessments, and Mayor endorsements <strong>DO NOT</strong> deduct leave credits. Credit deductions occur exclusively upon <strong>HR Final Review & Acceptance</strong>.
          </p>
        </div>
      </div>

      {/* Credit Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        
        {/* Vacation Leave Card */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-700 uppercase">Vacation Leave (VL)</span>
            <span className="text-[10px] font-mono bg-blue-50 text-[#173B67] px-2 py-0.5 rounded-full font-bold">1.25/mo</span>
          </div>

          <div className="flex items-baseline space-x-2">
            <div className="text-2xl sm:text-3xl font-extrabold text-[#173B67] font-mono">
              {vlRemaining.toFixed(3)}
            </div>
            <span className="text-xs text-slate-500 font-medium">available days</span>
          </div>

          <div className="grid grid-cols-3 gap-1 pt-2 border-t border-slate-100 text-[10px] text-slate-500">
            <div>
              <span className="block text-slate-400">Beginning</span>
              <strong className="text-slate-800 font-mono">{vlBeginning.toFixed(2)}</strong>
            </div>
            <div>
              <span className="block text-slate-400">Earned</span>
              <strong className="text-emerald-700 font-mono">+{vlEarned.toFixed(2)}</strong>
            </div>
            <div>
              <span className="block text-slate-400">Used</span>
              <strong className="text-rose-600 font-mono">-{usedVacationDays.toFixed(2)}</strong>
            </div>
          </div>
        </div>

        {/* Sick Leave Card */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-700 uppercase">Sick Leave (SL)</span>
            <span className="text-[10px] font-mono bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-full font-bold">1.25/mo</span>
          </div>

          <div className="flex items-baseline space-x-2">
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-700 font-mono">
              {slRemaining.toFixed(3)}
            </div>
            <span className="text-xs text-slate-500 font-medium">available days</span>
          </div>

          <div className="grid grid-cols-3 gap-1 pt-2 border-t border-slate-100 text-[10px] text-slate-500">
            <div>
              <span className="block text-slate-400">Beginning</span>
              <strong className="text-slate-800 font-mono">{slBeginning.toFixed(2)}</strong>
            </div>
            <div>
              <span className="block text-slate-400">Earned</span>
              <strong className="text-emerald-700 font-mono">+{slEarned.toFixed(2)}</strong>
            </div>
            <div>
              <span className="block text-slate-400">Used</span>
              <strong className="text-rose-600 font-mono">-{usedSickDays.toFixed(2)}</strong>
            </div>
          </div>
        </div>

        {/* Special Privilege Leave Card */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-700 uppercase">Special Privilege (SPL)</span>
            <span className="text-[10px] font-mono bg-purple-50 text-purple-800 px-2 py-0.5 rounded-full font-bold">3d Non-cum.</span>
          </div>

          <div className="flex items-baseline space-x-2">
            <div className="text-2xl sm:text-3xl font-extrabold text-purple-700 font-mono">
              {splRemaining.toFixed(1)}
            </div>
            <span className="text-xs text-slate-500 font-medium">days left in 2026</span>
          </div>

          <div className="grid grid-cols-3 gap-1 pt-2 border-t border-slate-100 text-[10px] text-slate-500">
            <div>
              <span className="block text-slate-400">Mandatory</span>
              <strong className="text-slate-800 font-mono">3.00</strong>
            </div>
            <div>
              <span className="block text-slate-400">Forced VL</span>
              <strong className="text-blue-700 font-mono">{forcedLeaveRemaining.toFixed(1)}d</strong>
            </div>
            <div>
              <span className="block text-slate-400">Used SPL</span>
              <strong className="text-rose-600 font-mono">-{usedSPLDays.toFixed(1)}</strong>
            </div>
          </div>
        </div>

      </div>

      {/* Pending Applications In Review Box */}
      {pendingLeaves.length > 0 && (
        <div className="bg-amber-50/70 border border-amber-200 p-4 rounded-2xl space-y-2">
          <div className="flex items-center space-x-2 text-amber-900 font-bold">
            <Clock className="w-4 h-4 text-amber-600" />
            <span>Applications Under Routing ({pendingLeaves.length} active)</span>
          </div>
          <div className="divide-y divide-amber-200/60">
            {pendingLeaves.map(pl => (
              <div key={pl.id} className="py-2 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-900">{pl.leaveType} Leave ({pl.workingDays} days)</span>
                  <span className="text-[11px] text-slate-500 block">{pl.inclusiveDates}</span>
                </div>
                <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 rounded-full font-bold text-[10px] uppercase">
                  {pl.status === 'pending_supervisor' ? 'Supervisor Review' :
                   pl.status === 'pending_mayor' ? 'Mayor Endorsement' : 'HR Final Review'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Credit Adjustment Ledger & History */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs space-y-0">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
            Leave Credits Transaction History (FY 2026)
          </h4>
          <span className="text-[11px] text-slate-500">
            Immutable CSC Credit Ledger
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-200">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Transaction Details</th>
                <th className="py-3 px-4 text-center">Type</th>
                <th className="py-3 px-4 text-right">Credit Change</th>
                <th className="py-3 px-4 text-right">VL Balance</th>
                <th className="py-3 px-4 text-right">SL Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-mono">
              <tr className="hover:bg-slate-50">
                <td className="py-2.5 px-4 font-sans text-slate-600">2026-02-01</td>
                <td className="py-2.5 px-4 font-sans font-semibold text-slate-900">February Monthly Earned Credits (1.25 VL / 1.25 SL)</td>
                <td className="py-2.5 px-4 text-center"><span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700">Monthly Earned</span></td>
                <td className="py-2.5 px-4 text-right text-emerald-700 font-bold">+1.250</td>
                <td className="py-2.5 px-4 text-right font-bold text-slate-900">{vlRemaining.toFixed(3)}</td>
                <td className="py-2.5 px-4 text-right font-bold text-slate-900">{slRemaining.toFixed(3)}</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="py-2.5 px-4 font-sans text-slate-600">2026-01-01</td>
                <td className="py-2.5 px-4 font-sans font-semibold text-slate-900">January Monthly Earned Credits (1.25 VL / 1.25 SL)</td>
                <td className="py-2.5 px-4 text-center"><span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700">Monthly Earned</span></td>
                <td className="py-2.5 px-4 text-right text-emerald-700 font-bold">+1.250</td>
                <td className="py-2.5 px-4 text-right font-bold text-slate-900">{(vlRemaining - 1.25).toFixed(3)}</td>
                <td className="py-2.5 px-4 text-right font-bold text-slate-900">{(slRemaining - 1.25).toFixed(3)}</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="py-2.5 px-4 font-sans text-slate-600">2026-01-01</td>
                <td className="py-2.5 px-4 font-sans font-semibold text-slate-900">Beginning Balance as of January 1, 2026 (CSC Form 6 Carried Over)</td>
                <td className="py-2.5 px-4 text-center"><span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700">Carried Over</span></td>
                <td className="py-2.5 px-4 text-right text-slate-500 font-bold">--</td>
                <td className="py-2.5 px-4 text-right font-bold text-slate-900">{vlBeginning.toFixed(3)}</td>
                <td className="py-2.5 px-4 text-right font-bold text-slate-900">{slBeginning.toFixed(3)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
