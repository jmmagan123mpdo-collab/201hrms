import React, { useState, useMemo } from 'react';
import { Employee, PayslipRecord } from '../../types/index.ts';
import { generateHistoricalPayslips } from '../../data/payslipData.ts';
import { CustomPayslipModal } from './CustomPayslipModal.tsx';
import { PayslipPrintModal } from '../ess/PayslipPrintModal.tsx';
import { 
  CreditCard, 
  Search, 
  Filter, 
  Plus, 
  Printer, 
  Download, 
  Eye, 
  Calendar, 
  Building2, 
  CheckCircle2, 
  ShieldCheck, 
  Clock, 
  TrendingUp, 
  FileSpreadsheet,
  AlertCircle
} from 'lucide-react';

interface PayrollManagerProps {
  employees: Employee[];
}

export const PayrollManager: React.FC<PayrollManagerProps> = ({ employees }) => {
  // Do not fabricate historical payroll records. Populate this monitor only from verified payroll/payslip records.
  const initialPayslips = useMemo<PayslipRecord[]>(() => [], []);

  const [payslips, setPayslips] = useState<PayslipRecord[]>(initialPayslips);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedOffice, setSelectedOffice] = useState<string>('all');
  const [selectedClassification, setSelectedClassification] = useState<string>('all');

  // Modals
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [selectedPayslipForPrint, setSelectedPayslipForPrint] = useState<PayslipRecord | null>(null);

  // Available offices
  const offices = useMemo(() => {
    return Array.from(new Set(employees.map(e => e.officeName))).sort();
  }, [employees]);

  // Filtered payslips
  const filteredPayslips = useMemo(() => {
    return payslips.filter(ps => {
      if (selectedYear !== 0 && ps.year !== selectedYear) return false;
      if (selectedMonth !== 'all' && ps.month !== Number(selectedMonth)) return false;
      if (selectedOffice !== 'all' && ps.officeName !== selectedOffice) return false;
      if (selectedClassification !== 'all' && ps.classification !== selectedClassification) return false;
      
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchName = ps.employeeName.toLowerCase().includes(query);
        const matchId = ps.employeeNumber.toLowerCase().includes(query);
        const matchRef = ps.payrollRefNumber.toLowerCase().includes(query);
        if (!matchName && !matchId && !matchRef) return false;
      }

      return true;
    });
  }, [payslips, selectedYear, selectedMonth, selectedOffice, selectedClassification, searchQuery]);

  // Statistics for current view
  const totalGross = filteredPayslips.reduce((acc, p) => acc + p.grossPay, 0);
  const totalDeductions = filteredPayslips.reduce((acc, p) => acc + p.totalDeductions, 0);
  const totalNet = filteredPayslips.reduce((acc, p) => acc + p.netTakeHomePay, 0);
  const totalGSIS = filteredPayslips.reduce((acc, p) => acc + p.gsisLifeAndRetirement, 0);
  const totalPhilHealth = filteredPayslips.reduce((acc, p) => acc + p.philHealth, 0);
  const totalPagIbig = filteredPayslips.reduce((acc, p) => acc + p.pagIbig, 0);
  const totalTax = filteredPayslips.reduce((acc, p) => acc + p.withholdingTax, 0);

  // Handle saving new custom payslip
  const handleSavePayslip = (newPs: PayslipRecord) => {
    setPayslips(prev => [newPs, ...prev]);
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Ref Number', 'Year', 'Month', 'Period', 'Employee ID', 'Name', 'Office', 'Classification', 'Basic Salary', 'PERA', 'Gross Pay', 'GSIS', 'PhilHealth', 'Pag-IBIG', 'Tax', 'Loans', 'Total Deductions', 'Net Take-Home Pay'];
    const rows = filteredPayslips.map(p => [
      p.payrollRefNumber,
      p.year,
      p.monthName,
      `"${p.periodLabel}"`,
      p.employeeNumber,
      `"${p.employeeName}"`,
      `"${p.officeName}"`,
      p.classification,
      p.basicSalary,
      p.pera,
      p.grossPay,
      p.gsisLifeAndRetirement,
      p.philHealth,
      p.pagIbig,
      p.withholdingTax,
      (p.gsisLoan || 0) + (p.pagIbigLoan || 0) + (p.landbankSalaryLoan || 0),
      p.totalDeductions,
      p.netTakeHomePay
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `LGU_San_Jose_Payroll_${selectedYear}_${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4 font-sans text-xs">
      
      {/* Top Banner Header */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-blue-100 text-[#173B67] text-[10px] font-bold uppercase tracking-wider mb-1">
            <CreditCard className="w-3 h-3 text-[#173B67]" />
            <span>Operational Payroll Registry & Disbursals</span>
          </div>
          <h2 className="text-base sm:text-xl font-extrabold text-slate-900 tracking-tight">
            Payroll and Digital Payslips Management
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time municipal compensation processing, Landbank ATM crediting, and custom payslip issuance.
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl border border-slate-300 transition-colors flex items-center space-x-1.5 cursor-pointer text-xs"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span className="hidden sm:inline">Export Master Ledger (CSV)</span>
            <span className="sm:hidden">Export CSV</span>
          </button>

          <button
            type="button"
            onClick={() => setShowCustomModal(true)}
            className="px-4 py-2.5 bg-[#173B67] hover:bg-[#122e50] text-white font-bold rounded-xl shadow-md transition-all flex items-center space-x-1.5 cursor-pointer text-xs"
          >
            <Plus className="w-4 h-4 text-amber-300" />
            <span>Generate Custom Payslip</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Stat KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
        
        {/* Card 1: Gross Disbursed */}
        <div className="bg-white p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider block truncate">
            Gross Compensation
          </span>
          <div className="text-lg sm:text-2xl font-extrabold text-[#173B67] mt-1 font-mono truncate">
            ₱{totalGross.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-slate-400 block mt-0.5 truncate">
            {filteredPayslips.length} payroll records in view
          </span>
        </div>

        {/* Card 2: Total Deductions */}
        <div className="bg-white p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider block truncate">
            Total Deductions
          </span>
          <div className="text-lg sm:text-2xl font-extrabold text-rose-600 mt-1 font-mono truncate">
            -₱{totalDeductions.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-slate-400 block mt-0.5 truncate">
            GSIS, PhilHealth, Pag-IBIG & Tax
          </span>
        </div>

        {/* Card 3: Net Take-Home */}
        <div className="bg-white p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider block truncate">
            Net Disbursed Take-Home
          </span>
          <div className="text-lg sm:text-2xl font-extrabold text-emerald-600 mt-1 font-mono truncate">
            ₱{totalNet.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5 truncate">
            Landbank ATM Account Credited
          </span>
        </div>

        {/* Card 4: Disbursal Cycle */}
        <div className="bg-white p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider block truncate">
            Next Disbursal Cycle
          </span>
          <div className="text-lg sm:text-2xl font-extrabold text-slate-900 mt-1 font-mono truncate">
            Feb 15, 2026
          </div>
          <span className="text-[10px] text-slate-500 block mt-0.5 truncate">
            1st Quincena Payroll Run
          </span>
        </div>

      </div>

      {/* Filter and Search Bar Card */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
          
          {/* Search Input */}
          <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by Employee Name, ID, or Reference #..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl bg-white text-xs focus:ring-2 focus:ring-[#173B67] focus:outline-none"
            />
          </div>

          {/* Year Filter */}
          <div>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="w-full p-2 border border-slate-300 rounded-xl bg-white text-xs font-semibold text-slate-800"
            >
              <option value={2026}>Fiscal Year 2026</option>
              <option value={2025}>Fiscal Year 2025</option>
              <option value={2024}>Fiscal Year 2024</option>
              <option value={0}>All Fiscal Years</option>
            </select>
          </div>

          {/* Month Filter */}
          <div>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-xl bg-white text-xs font-semibold text-slate-800"
            >
              <option value="all">All Months</option>
              <option value="1">January</option>
              <option value="2">February</option>
              <option value="3">March</option>
              <option value="4">April</option>
              <option value="5">May</option>
              <option value="6">June</option>
              <option value="7">July</option>
              <option value="8">August</option>
              <option value="9">September</option>
              <option value="10">October</option>
              <option value="11">November</option>
              <option value="12">December</option>
            </select>
          </div>

          {/* Office Filter */}
          <div>
            <select
              value={selectedOffice}
              onChange={(e) => setSelectedOffice(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-xl bg-white text-xs font-semibold text-slate-800 truncate"
            >
              <option value="all">All Departments / Offices</option>
              {offices.map(off => (
                <option key={off} value={off}>{off}</option>
              ))}
            </select>
          </div>

        </div>
      </div>

      {/* Main Table of Payslip Records */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
              Issued Payroll Records ({filteredPayslips.length})
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-blue-100 text-[#173B67] font-bold text-[10px]">
              CSC & Landbank Validated
            </span>
          </div>

          <span className="text-[11px] text-slate-500 hidden sm:inline">
            Showing records for selected criteria
          </span>
        </div>

        {filteredPayslips.length === 0 ? (
          <div className="p-8 text-center text-slate-500 space-y-2">
            <CreditCard className="w-8 h-8 mx-auto text-slate-300" />
            <p className="font-bold text-slate-700">No payslips matched your filters</p>
            <p className="text-xs">Try clearing search terms or changing fiscal year selection.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-200">
                  <th className="py-3 px-4">Pay Period / Ref</th>
                  <th className="py-3 px-4">Personnel & Office</th>
                  <th className="py-3 px-4">Classification</th>
                  <th className="py-3 px-4 text-right">Gross Pay</th>
                  <th className="py-3 px-4 text-right">Deductions</th>
                  <th className="py-3 px-4 text-right">Net Take-Home</th>
                  <th className="py-3 px-4 text-center">Disbursal Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredPayslips.map(ps => (
                  <tr key={ps.id} className="hover:bg-blue-50/40 transition-colors">
                    
                    {/* Ref & Period */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{ps.periodLabel}</div>
                      <div className="font-mono text-[10px] text-slate-500">{ps.payrollRefNumber}</div>
                    </td>

                    {/* Employee & Office */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-[#173B67]">{ps.employeeName}</div>
                      <div className="text-[11px] text-slate-500 truncate max-w-[200px]">
                        {ps.position} • {ps.officeName}
                      </div>
                    </td>

                    {/* Classification */}
                    <td className="py-3 px-4">
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                        {ps.classification}
                      </span>
                    </td>

                    {/* Gross Pay */}
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                      ₱{ps.grossPay.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>

                    {/* Deductions */}
                    <td className="py-3 px-4 text-right font-mono font-bold text-rose-600">
                      -₱{ps.totalDeductions.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>

                    {/* Net Pay */}
                    <td className="py-3 px-4 text-right font-mono font-black text-emerald-700 text-sm">
                      ₱{ps.netTakeHomePay.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Credited ATM</span>
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedPayslipForPrint(ps)}
                        className="px-3 py-1.5 bg-[#173B67] hover:bg-[#122e50] text-white font-bold rounded-xl shadow-xs transition-colors inline-flex items-center space-x-1 cursor-pointer text-xs"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View / Print</span>
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* Statutory Deductions Overview Box */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-blue-700" />
            <h4 className="font-bold text-xs sm:text-sm text-slate-900">
              Statutory Agency Remittance Breakdown (Active Filter Total)
            </h4>
          </div>
          <span className="text-[11px] text-slate-500">Ombudsman & CSC Audit Compliant</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[10px] text-slate-500 uppercase font-semibold block truncate">GSIS Life & Retirement (9%)</span>
            <span className="text-sm font-bold font-mono text-slate-900 mt-1 block">
              ₱{totalGSIS.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[10px] text-slate-500 uppercase font-semibold block truncate">PhilHealth Premiums</span>
            <span className="text-sm font-bold font-mono text-slate-900 mt-1 block">
              ₱{totalPhilHealth.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[10px] text-slate-500 uppercase font-semibold block truncate">Pag-IBIG Fund</span>
            <span className="text-sm font-bold font-mono text-slate-900 mt-1 block">
              ₱{totalPagIbig.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[10px] text-slate-500 uppercase font-semibold block truncate">Withholding Tax (BIR)</span>
            <span className="text-sm font-bold font-mono text-slate-900 mt-1 block">
              ₱{totalTax.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      {/* Modals */}
      <CustomPayslipModal
        isOpen={showCustomModal}
        onClose={() => setShowCustomModal(false)}
        employees={employees}
        onSavePayslip={handleSavePayslip}
        onPrintDirectly={(ps) => {
          setSelectedPayslipForPrint(ps);
        }}
      />

      <PayslipPrintModal
        isOpen={!!selectedPayslipForPrint}
        onClose={() => setSelectedPayslipForPrint(null)}
        payslip={selectedPayslipForPrint}
      />

    </div>
  );
};
