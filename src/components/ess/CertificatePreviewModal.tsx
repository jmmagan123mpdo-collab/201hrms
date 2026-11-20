import React from 'react';
import { ESSDocumentServiceRequest } from '../../types/index.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import { 
  Printer, 
  Download, 
  X, 
  ShieldCheck, 
  Building2, 
  CheckCircle2,
  QrCode,
  FileText
} from 'lucide-react';

interface CertificatePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: ESSDocumentServiceRequest | null;
}

export const CertificatePreviewModal: React.FC<CertificatePreviewModalProps> = ({
  isOpen,
  onClose,
  request
}) => {
  const { currentEmployee } = useAuth();

  if (!isOpen || !request) return null;

  const handlePrint = () => {
    window.print();
  };

  const todayStr = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  // Calculate realistic breakdown if COE with compensation or payslip
  const monthlySalary = currentEmployee?.monthlySalary || 36619;
  const peraAllowance = 2000;
  const grossMonthly = monthlySalary + peraAllowance;
  const gsisDed = Math.round(monthlySalary * 0.09);
  const philhealthDed = Math.round(monthlySalary * 0.025);
  const pagibigDed = 100;
  const wTax = Math.round(monthlySalary * 0.05);
  const totalDeductions = gsisDed + philhealthDed + pagibigDed + wTax;
  const netTakeHome = grossMonthly - totalDeductions;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full border border-slate-200 overflow-hidden my-auto max-h-[96vh] flex flex-col">
        
        {/* Top Control Bar */}
        <div className="bg-slate-900 px-5 py-3 text-white flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold tracking-wide">
              Official MHRMO Document Viewer • Ref: {request.trackingNumber || request.id}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-colors flex items-center space-x-1.5 cursor-pointer shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save as PDF</span>
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

        {/* Printable Official Certificate Body */}
        <div className="p-6 sm:p-10 overflow-y-auto bg-white font-serif text-slate-800 relative select-text">
          
          {/* Subtle Watermark Seal */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.04]">
            <img 
              src="/public/assets/aistudio/logo-300x293_45c24a73.png" 
              alt="LGU Seal Watermark" 
              className="w-96 h-96 object-contain"
            />
          </div>

          {/* Official Letterhead */}
          <div className="border-b-2 border-slate-900 pb-4 mb-6">
            <div className="flex items-center justify-between">
              <img 
                src="/public/assets/aistudio/logo-300x293_45c24a73.png" 
                alt="San Jose Seal" 
                className="w-16 h-16 sm:w-20 sm:h-20 object-contain shrink-0"
              />
              <div className="text-center flex-1 px-4 font-sans">
                <div className="text-[10px] sm:text-xs font-semibold text-slate-600 tracking-wider uppercase">
                  Republic of the Philippines
                </div>
                <div className="text-xs sm:text-sm font-bold text-slate-800 uppercase tracking-widest">
                  Province of Occidental Mindoro
                </div>
                <h1 className="text-base sm:text-xl font-extrabold text-[#173B67] tracking-tight mt-0.5">
                  MUNICIPALITY OF SAN JOSE
                </h1>
                <div className="text-[11px] sm:text-xs font-bold text-slate-700 mt-0.5">
                  MUNICIPAL HUMAN RESOURCE MANAGEMENT OFFICE
                </div>
                <div className="text-[9px] sm:text-[10px] text-slate-500 font-normal">
                  Municipal Hall Compound, Rizal St., San Jose, Occidental Mindoro 5100
                </div>
              </div>
              <img 
                src="/public/assets/aistudio/HR1_5214d096.png" 
                alt="MHRMO Logo" 
                className="h-10 sm:h-12 w-auto object-contain shrink-0"
              />
            </div>
          </div>

          {/* Reference & Date */}
          <div className="flex justify-between items-start text-xs font-sans mb-6">
            <div>
              <span className="text-slate-500 block">Control Reference No.:</span>
              <span className="font-mono font-bold text-slate-900">{request.trackingNumber || `MHRMO-${request.id}`}</span>
            </div>
            <div className="text-right">
              <span className="text-slate-500 block">Date of Issuance:</span>
              <span className="font-semibold text-slate-900">{todayStr}</span>
            </div>
          </div>

          {/* Certificate Main Title */}
          <div className="text-center my-6">
            <h2 className="text-lg sm:text-2xl font-bold uppercase tracking-wider text-slate-900 underline underline-offset-8">
              {request.requestType === 'COE' 
                ? (request.withCompensation ? 'CERTIFICATE OF EMPLOYMENT AND COMPENSATION' : 'CERTIFICATE OF EMPLOYMENT')
                : request.requestType === 'IPCR'
                ? 'INDIVIDUAL PERFORMANCE COMMITMENT & REVIEW (IPCR) CERTIFICATION'
                : request.requestType === 'PAYSLIP'
                ? 'CERTIFIED TRUE COPY OF PAYROLL SLIP'
                : request.requestType === 'SERVICE_RECORD'
                ? 'CERTIFIED GOVERNMENT SERVICE RECORD'
                : 'OFFICIAL HR CERTIFICATION'
              }
            </h2>
          </div>

          {/* Salutation */}
          <div className="text-xs sm:text-sm font-sans mb-4">
            <p className="font-bold uppercase tracking-wide">TO WHOM IT MAY CONCERN:</p>
          </div>

          {/* Body Paragraphs depending on Request Type */}
          <div className="space-y-4 text-xs sm:text-sm leading-relaxed text-justify font-serif">
            
            {/* COE Content */}
            {request.requestType === 'COE' && (
              <>
                <p>
                  THIS IS TO CERTIFY that according to records available in this Office, <strong className="font-sans font-bold text-slate-900 uppercase">{request.employeeName}</strong> (Employee No. <span className="font-mono font-bold">{request.employeeNumber}</span>) is a bona fide employee of the Local Government Unit of San Jose, Occidental Mindoro, holding the position of <strong className="font-sans font-bold text-slate-900">{request.position}</strong> under <strong className="font-sans font-bold text-slate-900">{request.classification}</strong> status in the <strong className="font-sans font-bold text-slate-900">{request.officeName}</strong>, having assumed office on <span className="font-semibold">{currentEmployee?.hireDate || 'March 15, 2019'}</span> to present.
                </p>

                {request.withCompensation && (
                  <div>
                    <p className="mb-2">
                      It is further certified that as of this date, the subject employee receives the following monthly compensation and allowable statutory benefits:
                    </p>
                    <div className="font-sans bg-slate-50 p-4 rounded-xl border border-slate-300 text-xs max-w-md mx-auto space-y-1.5 shadow-2xs">
                      <div className="flex justify-between py-0.5 border-b border-slate-200">
                        <span className="text-slate-600">Basic Monthly Salary ({currentEmployee?.salaryGrade || 'SG 15'}):</span>
                        <span className="font-mono font-bold">₱{monthlySalary.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between py-0.5 border-b border-slate-200">
                        <span className="text-slate-600">Personnel Economic Relief Allowance (PERA):</span>
                        <span className="font-mono font-bold">₱{peraAllowance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between py-1 font-bold text-slate-900 bg-blue-50/80 px-2 rounded">
                        <span>GROSS MONTHLY COMPENSATION:</span>
                        <span className="font-mono text-[#173B67]">₱{grossMonthly.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  </div>
                )}

                <p>
                  This certification is issued upon the official request of <strong className="font-sans">{request.employeeName}</strong> for the purpose of <strong className="font-sans underline">{request.purpose}</strong>, and for whatever lawful intent it may serve.
                </p>
              </>
            )}

            {/* IPCR Content */}
            {request.requestType === 'IPCR' && (
              <>
                <p>
                  THIS IS TO CERTIFY that <strong className="font-sans font-bold text-slate-900 uppercase">{request.employeeName}</strong>, holding the position of <strong className="font-sans font-bold text-slate-900">{request.position}</strong> in the <strong className="font-sans font-bold text-slate-900">{request.officeName}</strong>, has completed and submitted his/her Individual Performance Commitment and Review (IPCR) for the rating period of <strong className="font-sans font-bold text-[#173B67]">{request.periodCovered || 'July - December 2025'}</strong> in accordance with the Strategic Performance Management System (SPMS) of the Municipality of San Jose.
                </p>

                <div className="font-sans bg-purple-50/50 p-4 rounded-xl border border-purple-200 text-xs max-w-md mx-auto space-y-2 text-center">
                  <span className="text-purple-900 text-[11px] font-bold uppercase tracking-wider block">Official Validated Performance Rating</span>
                  <div className="text-3xl font-extrabold text-purple-950 font-mono">4.85</div>
                  <div className="inline-block px-3 py-1 rounded-full bg-purple-100 text-purple-900 font-bold text-xs uppercase tracking-wider">
                    VERY SATISFACTORY / OUTSTANDING
                  </div>
                  <p className="text-[10px] text-slate-500 pt-1">
                    Validated by the LGU San Jose Performance Management Team (PMT)
                  </p>
                </div>

                <p>
                  Issued this {todayStr} in the Municipality of San Jose, Occidental Mindoro for <strong className="font-sans underline">{request.purpose}</strong>.
                </p>
              </>
            )}

            {/* PAYSLIP Content */}
            {request.requestType === 'PAYSLIP' && (
              <>
                <p>
                  THIS IS A CERTIFIED TRUE AND CORRECT EXTRACT from the official Landbank Payroll Register and computerized payroll records of the Local Government Unit of San Jose, Occidental Mindoro for <strong className="font-sans font-bold text-slate-900 uppercase">{request.employeeName}</strong> (Emp No. <span className="font-mono font-bold">{request.employeeNumber}</span>):
                </p>

                <div className="font-sans bg-slate-50 p-4 rounded-xl border border-slate-300 text-xs space-y-2">
                  <div className="flex justify-between border-b pb-1 font-bold text-slate-900">
                    <span>Pay Period: {request.periodCovered || 'January 2026'}</span>
                    <span>Office: {request.officeName}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-1">
                    <div className="space-y-1">
                      <span className="text-[11px] font-bold text-slate-700 block uppercase">Earnings / Allowances:</span>
                      <div className="flex justify-between text-[11px]">
                        <span>Basic Pay:</span>
                        <span className="font-mono">₱{monthlySalary.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span>PERA:</span>
                        <span className="font-mono">₱{peraAllowance.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-[11px] font-bold border-t pt-0.5">
                        <span>Total Gross:</span>
                        <span className="font-mono">₱{grossMonthly.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[11px] font-bold text-slate-700 block uppercase">Mandatory Deductions:</span>
                      <div className="flex justify-between text-[11px]">
                        <span>GSIS Life/Ret (9%):</span>
                        <span className="font-mono">₱{gsisDed.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span>PhilHealth (2.5%):</span>
                        <span className="font-mono">₱{philhealthDed.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span>Pag-IBIG Fund:</span>
                        <span className="font-mono">₱{pagibigDed.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span>Withholding Tax:</span>
                        <span className="font-mono">₱{wTax.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-[11px] font-bold border-t pt-0.5 text-rose-700">
                        <span>Total Deductions:</span>
                        <span className="font-mono">₱{totalDeductions.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center bg-emerald-50 p-2.5 rounded-lg border border-emerald-200 font-bold text-emerald-950 mt-2">
                    <span className="text-xs">NET TAKE-HOME PAY:</span>
                    <span className="font-mono text-sm sm:text-base">₱{netTakeHome.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>

                <p>
                  Certified correct and issued for <strong className="font-sans underline">{request.purpose}</strong>.
                </p>
              </>
            )}

            {/* Other Certificates */}
            {request.requestType !== 'COE' && request.requestType !== 'IPCR' && request.requestType !== 'PAYSLIP' && (
              <>
                <p>
                  THIS IS TO CERTIFY that according to records in the custody of this Office, <strong className="font-sans font-bold text-slate-900 uppercase">{request.employeeName}</strong> is an active employee of the Municipality of San Jose, Occidental Mindoro, assigned at <strong className="font-sans font-bold text-slate-900">{request.officeName}</strong> as <strong className="font-sans font-bold text-slate-900">{request.position}</strong>.
                </p>
                <p>
                  This official certification is issued upon the request of the interested party for <strong className="font-sans underline">{request.purpose}</strong>.
                </p>
              </>
            )}

          </div>

          {/* Signature & Seal Block */}
          <div className="mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-6 font-sans">
            <div className="flex items-center space-x-3 text-left">
              <div className="w-14 h-14 border-2 border-dashed border-slate-300 rounded-full flex flex-col items-center justify-center text-[8px] text-slate-400 font-bold uppercase tracking-wider text-center p-1">
                <span>Official MHRMO Dry Seal</span>
              </div>
              <div className="text-[10px] text-slate-400">
                <span className="block font-mono font-bold text-slate-600">ID: {request.trackingNumber || request.id}</span>
                <span>Digitally Authenticated</span>
              </div>
            </div>

            <div className="text-center sm:text-right">
              <div className="font-serif italic text-xs text-slate-500 mb-1">By Authority of the Municipal Mayor:</div>
              <div className="font-bold text-sm text-slate-900 uppercase tracking-tight">
                ATTY. MARIA ELENA CASTILLO
              </div>
              <div className="text-xs text-slate-600 font-medium">
                Municipal Human Resource Management Officer (MHRMO)
              </div>
              <div className="text-[10px] text-slate-400">
                Municipality of San Jose • Occidental Mindoro
              </div>
            </div>
          </div>

          {/* Footer Verification Notice */}
          <div className="mt-10 pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-[10px] text-slate-400 font-sans gap-2">
            <div>
              <span>Official Government Document • Valid without erasures or alterations</span>
            </div>
            <div className="flex items-center space-x-1 text-emerald-700 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Verified against LGU San Jose Personnel Masterlist</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
