import React from 'react';
import { PayslipRecord } from '../../types/index.ts';
import { 
  Printer, 
  Download, 
  X, 
  CreditCard, 
  Building2, 
  ShieldCheck, 
  CheckCircle2,
  FileCheck2,
  Calendar
} from 'lucide-react';

interface PayslipPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  payslip: PayslipRecord | null;
  onRequestCertifiedCopy?: (payslip: PayslipRecord) => void;
}

export const PayslipPrintModal: React.FC<PayslipPrintModalProps> = ({
  isOpen,
  onClose,
  payslip,
  onRequestCertifiedCopy
}) => {
  if (!isOpen || !payslip) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full border border-slate-200 overflow-hidden my-auto max-h-[96vh] flex flex-col font-sans animate-in fade-in">
        
        {/* Top Control Bar (Hidden when printing) */}
        <div className="bg-slate-900 px-5 py-3 text-white flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center space-x-2">
            <CreditCard className="w-4 h-4 text-orange-400" />
            <span className="text-xs font-bold tracking-wide">
              Official Digital Payslip • Ref: {payslip.payrollRefNumber}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            {onRequestCertifiedCopy && (
              <button
                type="button"
                onClick={() => {
                  onRequestCertifiedCopy(payslip);
                  onClose();
                }}
                className="px-3 py-1.5 bg-[#F28C28] hover:bg-[#d9771a] text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-xs"
              >
                Request Certified Copy
              </button>
            )}
            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-colors flex items-center space-x-1.5 cursor-pointer shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Payslip</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Payslip Body */}
        <div className="p-6 sm:p-9 overflow-y-auto bg-white text-slate-800 relative select-text text-xs">
          
          {/* Subtle Watermark Seal */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
            <img 
              src="/public/assets/aistudio/logo-300x293_45c24a73.png" 
              alt="LGU Seal Watermark" 
              className="w-96 h-96 object-contain"
            />
          </div>

          {/* Official Letterhead */}
          <div className="border-b-2 border-slate-900 pb-4 mb-5">
            <div className="flex items-center justify-between">
              <img 
                src="/public/assets/aistudio/logo-300x293_45c24a73.png" 
                alt="San Jose Seal" 
                className="w-16 h-16 sm:w-18 sm:h-18 object-contain shrink-0"
              />
              <div className="text-center flex-1 px-4">
                <div className="text-[10px] sm:text-[11px] font-semibold text-slate-600 tracking-wider uppercase">
                  Republic of the Philippines • Province of Occidental Mindoro
                </div>
                <h1 className="text-base sm:text-xl font-extrabold text-[#173B67] tracking-tight mt-0.5">
                  MUNICIPALITY OF SAN JOSE
                </h1>
                <div className="text-xs font-bold text-slate-700">
                  OFFICE OF THE MUNICIPAL ACCOUNTANT & MHRMO
                </div>
                <div className="text-[10px] text-slate-500 font-medium tracking-wide uppercase mt-0.5">
                  General Fund Personnel Computerized Payroll
                </div>
              </div>
              <img 
                src="/public/assets/aistudio/HR1_5214d096.png" 
                alt="MHRMO Logo" 
                className="h-9 sm:h-11 w-auto object-contain shrink-0"
              />
            </div>
          </div>

          {/* Document Title Banner */}
          <div className="bg-slate-100 p-2.5 rounded-xl border border-slate-300 flex flex-col sm:flex-row items-center justify-between gap-2 mb-5">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-sm text-[#173B67] uppercase tracking-wide">
                INDIVIDUAL PAYROLL SLIP
              </span>
              <span className="bg-[#173B67] text-white px-2 py-0.5 rounded text-[10px] font-mono font-bold">
                {payslip.monthName.toUpperCase()} {payslip.year}
              </span>
            </div>
            <div className="text-[11px] font-mono text-slate-600">
              Payroll Ref: <strong className="text-slate-900">{payslip.payrollRefNumber}</strong>
            </div>
          </div>

          {/* Employee Identification Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 mb-5">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Employee Name</span>
              <span className="text-xs font-bold text-slate-900 block truncate">{payslip.employeeName}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Employee / Plantilla No.</span>
              <span className="text-xs font-mono font-bold text-slate-900 block">{payslip.employeeNumber}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Position & Grade</span>
              <span className="text-xs font-semibold text-slate-900 block truncate">{payslip.position} ({payslip.salaryGrade})</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Office / Department</span>
              <span className="text-xs font-semibold text-slate-900 block truncate">{payslip.officeName}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Employment Status</span>
              <span className="text-xs font-semibold text-slate-900 block">{payslip.classification}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Pay Period</span>
              <span className="text-xs font-semibold text-slate-900 block">{payslip.periodLabel}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Bank & Account</span>
              <span className="text-xs font-mono font-semibold text-slate-900 block">{payslip.accountNumberMasked}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Disbursal Date</span>
              <span className="text-xs font-semibold text-slate-900 block">{payslip.payDate}</span>
            </div>
          </div>

          {/* Side-by-Side Breakdown: Compensation vs Deductions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
            
            {/* Column 1: Gross Compensation & Allowances */}
            <div className="border border-slate-300 rounded-xl overflow-hidden shadow-2xs">
              <div className="bg-slate-100 px-3.5 py-2 border-b border-slate-300 font-bold text-slate-800 text-xs flex justify-between">
                <span>COMPENSATION & ALLOWANCES</span>
                <span>AMOUNT (PHP)</span>
              </div>
              <div className="p-3.5 space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">Basic Monthly Salary ({payslip.salaryGrade} {payslip.stepIncrement}):</span>
                  <span className="font-mono font-bold text-slate-900">₱{payslip.basicSalary.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">Personnel Economic Relief Allowance (PERA):</span>
                  <span className="font-mono font-bold text-slate-900">₱{payslip.pera.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
                {payslip.rata && (
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-600">Representation & Transportation Allowance:</span>
                    <span className="font-mono font-bold text-slate-900">₱{payslip.rata.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-3 font-bold text-slate-900 bg-blue-50/70 p-2 rounded-lg mt-2">
                  <span>TOTAL GROSS COMPENSATION:</span>
                  <span className="font-mono text-sm text-[#173B67]">₱{payslip.grossPay.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>

            {/* Column 2: Mandatory & Other Deductions */}
            <div className="border border-slate-300 rounded-xl overflow-hidden shadow-2xs">
              <div className="bg-slate-100 px-3.5 py-2 border-b border-slate-300 font-bold text-slate-800 text-xs flex justify-between">
                <span>PAYROLL DEDUCTIONS</span>
                <span>AMOUNT (PHP)</span>
              </div>
              <div className="p-3.5 space-y-1.5 text-xs">
                <div className="flex justify-between py-0.5 border-b border-slate-100">
                  <span className="text-slate-600">GSIS Life & Retirement (9%):</span>
                  <span className="font-mono text-slate-900">₱{payslip.gsisLifeAndRetirement.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between py-0.5 border-b border-slate-100">
                  <span className="text-slate-600">PhilHealth National Health Insurance (2.5%):</span>
                  <span className="font-mono text-slate-900">₱{payslip.philHealth.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between py-0.5 border-b border-slate-100">
                  <span className="text-slate-600">Pag-IBIG Fund Mandatory:</span>
                  <span className="font-mono text-slate-900">₱{payslip.pagIbig.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between py-0.5 border-b border-slate-100">
                  <span className="text-slate-600">Withholding Tax (BIR Form 2316):</span>
                  <span className="font-mono text-slate-900">₱{payslip.withholdingTax.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
                {payslip.gsisLoan && payslip.gsisLoan > 0 && (
                  <div className="flex justify-between py-0.5 border-b border-slate-100 text-slate-600">
                    <span>GSIS ConsoLoan Amortization:</span>
                    <span className="font-mono text-slate-900">₱{payslip.gsisLoan.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
                {payslip.pagIbigLoan && payslip.pagIbigLoan > 0 && (
                  <div className="flex justify-between py-0.5 border-b border-slate-100 text-slate-600">
                    <span>Pag-IBIG Multi-Purpose Loan:</span>
                    <span className="font-mono text-slate-900">₱{payslip.pagIbigLoan.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-2 font-bold text-rose-800 bg-rose-50/70 p-2 rounded-lg mt-1">
                  <span>TOTAL PAYROLL DEDUCTIONS:</span>
                  <span className="font-mono text-sm">₱{payslip.totalDeductions.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>

          </div>

          {/* NET TAKE-HOME PAY CALLOUT */}
          <div className="bg-gradient-to-r from-emerald-700 to-teal-800 text-white p-4 sm:p-5 rounded-xl shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
            <div>
              <span className="text-[10px] font-bold text-emerald-200 uppercase tracking-widest block">
                NET TAKE-HOME PAY FOR THIS PERIOD
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold font-mono tracking-tight mt-0.5">
                ₱{payslip.netTakeHomePay.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <span className="text-[11px] text-emerald-100 font-medium">
                Credit to Land Bank of the Philippines ATM Account • San Jose Branch
              </span>
            </div>

            <div className="flex items-center space-x-1.5 text-xs font-bold bg-white/10 px-3 py-1.5 rounded-lg border border-white/20">
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span>Direct Deposit Credited</span>
            </div>
          </div>

          {/* Official Signatures & Certification Block */}
          <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-300 text-center">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-500 uppercase block">Certified Correct:</span>
              <div className="pt-6 font-bold text-slate-900 text-xs uppercase underline">
                GRACE BALMES
              </div>
              <div className="text-[10px] text-slate-600 font-medium">
                Municipal Payroll Officer • Office of the Municipal Accountant
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] text-slate-500 uppercase block">Noted by:</span>
              <div className="pt-6 font-bold text-slate-900 text-xs uppercase underline">
                ATTY. MARIA ELENA CASTILLO
              </div>
              <div className="text-[10px] text-slate-600 font-medium">
                Municipal HRMO Head • Municipality of San Jose
              </div>
            </div>
          </div>

          {/* Legal Certification Footer */}
          <div className="mt-6 pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-[9px] text-slate-400 gap-2">
            <div>
              <span>Official Electronic Payslip generated under CSC Memorandum Circular No. 19, s. 2012</span>
            </div>
            <div className="flex items-center space-x-1 text-slate-500 font-medium">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              <span>Tamper-evident digital extract • Municipality of San Jose, Occidental Mindoro</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
