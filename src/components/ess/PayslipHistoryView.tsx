import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { PayslipRecord } from '../../types/index.ts';
import { generateHistoricalPayslips } from '../../data/payslipData.ts';
import { PayslipPrintModal } from './PayslipPrintModal.tsx';
import { CreateESSRequestModal } from './CreateESSRequestModal.tsx';
import { 
  CreditCard, 
  Printer, 
  Eye, 
  Calendar, 
  Download, 
  PlusCircle, 
  CheckCircle2, 
  Building2, 
  TrendingUp, 
  ShieldCheck,
  Search,
  ChevronRight,
  Sparkles
} from 'lucide-react';

export const PayslipHistoryView: React.FC = () => {
  const { currentEmployee } = useAuth();

  // Generate historical payslips for current employee
  const historicalPayslips = useMemo(() => {
    if (!currentEmployee) return [];
    return generateHistoricalPayslips(currentEmployee);
  }, [currentEmployee]);

  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedMonthFilter, setSelectedMonthFilter] = useState<string>('all');
  const [selectedPayslipForModal, setSelectedPayslipForModal] = useState<PayslipRecord | null>(null);
  const [showRequestCertifiedModal, setShowRequestCertifiedModal] = useState<boolean>(false);

  // Available Years
  const availableYears = [2026, 2025, 2024];

  // Filter payslips for the selected year
  const yearPayslips = useMemo(() => {
    return historicalPayslips.filter(p => p.year === selectedYear);
  }, [historicalPayslips, selectedYear]);

  // Apply month filter
  const displayedPayslips = useMemo(() => {
    if (selectedMonthFilter === 'all') return yearPayslips;
    return yearPayslips.filter(p => p.month === Number(selectedMonthFilter));
  }, [yearPayslips, selectedMonthFilter]);

  // Annual Totals for selected year
  const annualGross = yearPayslips.reduce((acc, p) => acc + p.grossPay, 0);
  const annualDeductions = yearPayslips.reduce((acc, p) => acc + p.totalDeductions, 0);
  const annualNet = yearPayslips.reduce((acc, p) => acc + p.netTakeHomePay, 0);
  const annualGSIS = yearPayslips.reduce((acc, p) => acc + p.gsisLifeAndRetirement, 0);
  const annualPhilHealth = yearPayslips.reduce((acc, p) => acc + p.philHealth, 0);
  const annualPagIbig = yearPayslips.reduce((acc, p) => acc + p.pagIbig, 0);
  const annualTax = yearPayslips.reduce((acc, p) => acc + p.withholdingTax, 0);

  return (
    <div className="space-y-4 font-sans text-xs">
      
      {/* Top Banner Header */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-orange-100 text-[#F28C28] text-[10px] font-bold uppercase tracking-wider mb-1">
            <CreditCard className="w-3 h-3" />
            <span>Employee Self-Service Payroll Records</span>
          </div>
          <h2 className="text-base sm:text-xl font-extrabold text-slate-900 tracking-tight">
            Payslip History & Digital Records
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Securely review, verify, and print your historical monthly payslips organized by fiscal year and pay period.
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            type="button"
            onClick={() => setShowRequestCertifiedModal(true)}
            className="w-full sm:w-auto px-4 py-2.5 bg-[#F28C28] hover:bg-[#d9771a] text-white font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center space-x-1.5 cursor-pointer text-xs"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Request Certified True Copy</span>
          </button>
        </div>
      </div>

      {/* Year Selector Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center space-x-1 bg-white p-1 rounded-2xl border border-slate-200 shadow-2xs">
          {availableYears.map(yr => (
            <button
              key={yr}
              type="button"
              onClick={() => {
                setSelectedYear(yr);
                setSelectedMonthFilter('all');
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                selectedYear === yr
                  ? 'bg-[#173B67] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Fiscal Year {yr}</span>
              {yr === 2026 && (
                <span className="text-[9px] bg-[#F28C28] text-white px-1.5 py-0.2 rounded font-mono">Current</span>
              )}
            </button>
          ))}
        </div>

        {/* Month Filter Dropdown */}
        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-500 font-semibold">Month:</span>
          <select
            value={selectedMonthFilter}
            onChange={(e) => setSelectedMonthFilter(e.target.value)}
            className="p-2 border border-slate-300 rounded-xl bg-white text-xs font-bold text-slate-800"
          >
            <option value="all">All Months in {selectedYear} ({yearPayslips.length})</option>
            {yearPayslips.map(p => (
              <option key={p.month} value={p.month}>
                {p.monthName} ({p.payDate})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Annual Summary Statistic Tiles (Side-by-side 2x2 on mobile, 4 cols on desktop) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
        
        {/* Card 1: Annual Gross Compensation */}
        <div className="bg-white p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider block truncate">
            {selectedYear} Gross Compensation
          </span>
          <div className="text-lg sm:text-2xl font-extrabold text-[#173B67] mt-1 font-mono truncate">
            ₱{annualGross.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-slate-400 block mt-0.5 truncate">
            Basic pay + PERA allowances
          </span>
        </div>

        {/* Card 2: Annual Deductions */}
        <div className="bg-white p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider block truncate">
            {selectedYear} Total Deductions
          </span>
          <div className="text-lg sm:text-2xl font-extrabold text-rose-700 mt-1 font-mono truncate">
            ₱{annualDeductions.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-slate-400 block mt-0.5 truncate">
            GSIS, PhilHealth, Pag-IBIG & Tax
          </span>
        </div>

        {/* Card 3: Annual Net Take-Home */}
        <div className="bg-white p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-emerald-100 shadow-xs bg-gradient-to-br from-emerald-50/50 to-white">
          <span className="text-[10px] sm:text-xs font-bold text-emerald-800 uppercase tracking-wider block truncate">
            {selectedYear} Net Disbursed
          </span>
          <div className="text-lg sm:text-2xl font-extrabold text-emerald-700 mt-1 font-mono truncate">
            ₱{annualNet.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5 truncate">
            Total take-home credited
          </span>
        </div>

        {/* Card 4: Disbursed Periods */}
        <div className="bg-white p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider block truncate">
            Issued Pay Periods
          </span>
          <div className="text-lg sm:text-2xl font-extrabold text-slate-900 mt-1 font-mono">
            {yearPayslips.length} <span className="text-xs font-sans text-slate-500">months</span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-0.5 truncate">
            {selectedYear === 2026 ? 'Active fiscal year' : '100% complete year'}
          </span>
        </div>

      </div>

      {/* Monthly Payslips List & Cards */}
      <div className="space-y-3">
        
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900">
            Monthly Digital Payslips for {selectedYear}
          </h3>
          <span className="text-xs text-slate-500 font-medium">
            Showing {displayedPayslips.length} pay periods
          </span>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-bold">
                <th className="p-4">Pay Period / Month</th>
                <th className="p-4">Reference No.</th>
                <th className="p-4 text-right">Gross Pay</th>
                <th className="p-4 text-right">Deductions</th>
                <th className="p-4 text-right">Net Take-Home</th>
                <th className="p-4">Disbursal Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayedPayslips.map(ps => (
                <tr key={ps.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-slate-900 text-xs">{ps.monthName} {ps.year}</div>
                    <div className="text-[11px] text-slate-500">{ps.periodLabel}</div>
                  </td>
                  <td className="p-4 font-mono font-bold text-slate-600 text-[11px]">
                    {ps.payrollRefNumber}
                  </td>
                  <td className="p-4 text-right font-mono text-slate-700">
                    ₱{ps.grossPay.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-4 text-right font-mono text-rose-700">
                    -₱{ps.totalDeductions.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-4 text-right font-mono font-bold text-emerald-700 text-sm">
                    ₱{ps.netTakeHomePay.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>Credited ATM</span>
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        type="button"
                        onClick={() => setSelectedPayslipForModal(ps)}
                        className="px-3 py-1.5 bg-[#173B67] hover:bg-[#122e50] text-white text-xs font-bold rounded-xl transition-colors flex items-center space-x-1 cursor-pointer shadow-2xs"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View / Print</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile View: High-density interactive cards (Side-by-side elements) */}
        <div className="block md:hidden space-y-3">
          {displayedPayslips.map(ps => (
            <div 
              key={ps.id} 
              className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3"
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-mono text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                    {ps.payrollRefNumber}
                  </span>
                  <h4 className="font-extrabold text-sm text-slate-900 mt-1">
                    {ps.monthName} {ps.year}
                  </h4>
                  <span className="text-[11px] text-slate-500 font-medium block">
                    {ps.periodLabel}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Net Take-Home
                  </span>
                  <span className="text-base font-extrabold font-mono text-emerald-700 block">
                    ₱{ps.netTakeHomePay.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Breakdown Grid: Gross vs Deductions */}
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block font-semibold">Gross Pay</span>
                  <span className="font-mono font-bold text-slate-800">₱{ps.grossPay.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block font-semibold">Deductions</span>
                  <span className="font-mono font-bold text-rose-700">-₱{ps.totalDeductions.toLocaleString()}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-1">
                <span className="inline-flex items-center space-x-1 text-[10px] font-bold text-emerald-700">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Landbank ATM Credited</span>
                </span>

                <button
                  type="button"
                  onClick={() => setSelectedPayslipForModal(ps)}
                  className="px-3.5 py-2 bg-[#173B67] hover:bg-[#122e50] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center space-x-1.5 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View / Print Payslip</span>
                </button>
              </div>

            </div>
          ))}
        </div>

      </div>

      {/* Annual Statutory Contributions Breakdown Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-blue-700" />
            <h4 className="font-bold text-xs sm:text-sm text-slate-900">
              Fiscal Year {selectedYear} Statutory Remittances Summary (GSIS, PhilHealth, Pag-IBIG & BIR)
            </h4>
          </div>
          <span className="text-[11px] text-slate-500">Government Remittance Compliance</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[10px] text-slate-500 uppercase font-semibold block truncate">GSIS Life & Retirement</span>
            <span className="text-sm font-bold font-mono text-slate-900 mt-1 block">
              ₱{annualGSIS.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[10px] text-slate-500 uppercase font-semibold block truncate">PhilHealth Coverage</span>
            <span className="text-sm font-bold font-mono text-slate-900 mt-1 block">
              ₱{annualPhilHealth.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[10px] text-slate-500 uppercase font-semibold block truncate">Pag-IBIG Mandatory</span>
            <span className="text-sm font-bold font-mono text-slate-900 mt-1 block">
              ₱{annualPagIbig.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[10px] text-slate-500 uppercase font-semibold block truncate">Withholding Tax (BIR)</span>
            <span className="text-sm font-bold font-mono text-slate-900 mt-1 block">
              ₱{annualTax.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      {/* Payslip Print / Detail Modal */}
      <PayslipPrintModal
        isOpen={!!selectedPayslipForModal}
        onClose={() => setSelectedPayslipForModal(null)}
        payslip={selectedPayslipForModal}
        onRequestCertifiedCopy={(ps) => {
          setShowRequestCertifiedModal(true);
        }}
      />

      {/* Create Certified Copy Request Modal */}
      <CreateESSRequestModal
        isOpen={showRequestCertifiedModal}
        onClose={() => setShowRequestCertifiedModal(false)}
        initialType="PAYSLIP"
      />

    </div>
  );
};
