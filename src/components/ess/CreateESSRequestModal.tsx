import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useData } from '../../context/DataContext.tsx';
import { ESSRequestType } from '../../types/index.ts';
import { 
  Building2, 
  FileText, 
  CreditCard, 
  TrendingUp, 
  Award, 
  ShieldCheck, 
  Calendar, 
  CheckCircle2, 
  Send, 
  X,
  FileCheck2,
  Clock,
  Sparkles
} from 'lucide-react';

interface CreateESSRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: ESSRequestType;
}

export const CreateESSRequestModal: React.FC<CreateESSRequestModalProps> = ({
  isOpen,
  onClose,
  initialType = 'COE'
}) => {
  const { currentEmployee, currentUser } = useAuth();
  const { submitESSServiceRequest } = useData();

  const [requestType, setRequestType] = useState<ESSRequestType>(initialType);
  const [withCompensation, setWithCompensation] = useState(true);
  const [purposeCategory, setPurposeCategory] = useState('Loan Application');
  const [customPurpose, setCustomPurpose] = useState('');
  const [periodCovered, setPeriodCovered] = useState('January 2026');
  const [copies, setCopies] = useState(1);
  const [deliveryPreference, setDeliveryPreference] = useState<'Digital Copy (PDF)' | 'In-Person Pick-up (MHRMO)' | 'Both Digital & In-Person'>('Both Digital & In-Person');
  const [urgency, setUrgency] = useState<'Normal (2-3 days)' | 'Urgent (1 day)'>('Normal (2-3 days)');
  const [remarks, setRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  if (!isOpen) return null;

  const requestOptions: {
    type: ESSRequestType;
    label: string;
    sublabel: string;
    icon: any;
    color: string;
  }[] = [
    {
      type: 'COE',
      label: 'Certificate of Employment (COE)',
      sublabel: 'With or without compensation breakdown',
      icon: Award,
      color: 'bg-blue-50 text-blue-700 border-blue-200'
    },
    {
      type: 'PAYSLIP',
      label: 'Certified Payslip Copy',
      sublabel: 'Official itemized monthly payroll slip',
      icon: CreditCard,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200'
    },
    {
      type: 'IPCR',
      label: 'IPCR Rating Certificate',
      sublabel: 'Individual Performance Rating copy',
      icon: TrendingUp,
      color: 'bg-purple-50 text-purple-700 border-purple-200'
    },
    {
      type: 'SERVICE_RECORD',
      label: 'Service Record (CSC 126)',
      sublabel: 'Complete government service history',
      icon: FileText,
      color: 'bg-amber-50 text-amber-700 border-amber-200'
    },
    {
      type: 'LEAVE_CREDITS_CERT',
      label: 'Leave Credits Certificate',
      sublabel: 'Vacation & sick leave balance certification',
      icon: Calendar,
      color: 'bg-sky-50 text-sky-700 border-sky-200'
    },
    {
      type: 'NO_PENDING_CASE_CERT',
      label: 'No Pending Case Clearance',
      sublabel: 'Administrative integrity clearance',
      icon: ShieldCheck,
      color: 'bg-teal-50 text-teal-700 border-teal-200'
    },
    {
      type: 'BIR_2316',
      label: 'BIR Form 2316',
      sublabel: 'Annual tax withheld certificate',
      icon: FileCheck2,
      color: 'bg-indigo-50 text-indigo-700 border-indigo-200'
    }
  ];

  const getTitle = () => {
    switch (requestType) {
      case 'COE':
        return withCompensation 
          ? 'Certificate of Employment (with Compensation & Allowances)'
          : 'Certificate of Employment (without Compensation)';
      case 'PAYSLIP':
        return `Certified True Copy of Payslip (${periodCovered})`;
      case 'IPCR':
        return `IPCR Rating Certification (${periodCovered})`;
      case 'SERVICE_RECORD':
        return 'Certified Government Service Record (CSC Form 126)';
      case 'LEAVE_CREDITS_CERT':
        return 'Certificate of Available Leave Credits (VL / SL)';
      case 'NO_PENDING_CASE_CERT':
        return 'Certificate of No Pending Administrative Case';
      case 'BIR_2316':
        return `Certificate of Compensation Payment / Tax Withheld (BIR Form 2316 - ${periodCovered})`;
      default:
        return 'Official HR Document Request';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentEmployee) return;

    setIsSubmitting(true);
    const finalPurpose = customPurpose.trim() 
      ? `${purposeCategory}: ${customPurpose.trim()}`
      : purposeCategory;

    await submitESSServiceRequest({
      employeeId: currentEmployee.id,
      employeeName: `${currentEmployee.firstName} ${currentEmployee.lastName}`,
      employeeNumber: currentEmployee.employeeNumber,
      officeName: currentEmployee.officeName,
      position: currentEmployee.position,
      classification: currentEmployee.classification,
      requestType,
      title: getTitle(),
      purpose: finalPurpose,
      periodCovered: (requestType === 'PAYSLIP' || requestType === 'IPCR' || requestType === 'BIR_2316') ? periodCovered : undefined,
      copies: Number(copies),
      withCompensation: requestType === 'COE' ? withCompensation : undefined,
      deliveryPreference,
      urgency,
      remarks: remarks.trim() || undefined
    });

    setIsSubmitting(false);
    setSubmittedSuccess(true);
    setTimeout(() => {
      setSubmittedSuccess(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 sm:fade-in">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#173B67] to-[#1f4e85] px-5 py-4 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight">Request Official Document / Certificate</h3>
              <p className="text-[11px] text-blue-100">Municipal Human Resource Management Office (MHRMO)</p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="text-blue-200 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submittedSuccess ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-base font-bold text-slate-900">Request Successfully Submitted!</h4>
            <p className="text-xs text-slate-600 max-w-md mx-auto">
              Your request for <span className="font-semibold text-slate-900">{getTitle()}</span> has been forwarded to the MHRMO records section. You can monitor live progress in your ESS portal.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs">
            
            {/* Step 1: Select Document Type (Side-by-side tiles on mobile) */}
            <div>
              <label className="block font-bold text-slate-800 mb-2">
                1. Select Document or Service Required
              </label>
              <div className="grid grid-cols-2 gap-2">
                {requestOptions.map(opt => {
                  const Icon = opt.icon;
                  const isSelected = requestType === opt.type;
                  return (
                    <button
                      key={opt.type}
                      type="button"
                      onClick={() => setRequestType(opt.type)}
                      className={`p-2.5 sm:p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected 
                          ? 'border-[#173B67] bg-blue-50/70 ring-2 ring-[#173B67]/20 shadow-xs' 
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${opt.color}`}>
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <span className={`text-xs font-bold leading-tight ${isSelected ? 'text-[#173B67]' : 'text-slate-800'}`}>
                          {opt.label.split('(')[0]}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 mt-1 block truncate">
                        {opt.sublabel}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dynamic Specifics for COE */}
            {requestType === 'COE' && (
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                <span className="font-bold text-slate-800 block text-[11px]">COE Options</span>
                <div className="grid grid-cols-2 gap-2">
                  <label className={`p-2.5 rounded-xl border cursor-pointer flex items-center space-x-2 ${
                    withCompensation ? 'border-[#173B67] bg-white font-bold text-[#173B67]' : 'border-slate-200 bg-white/60'
                  }`}>
                    <input
                      type="radio"
                      name="coeComp"
                      checked={withCompensation}
                      onChange={() => setWithCompensation(true)}
                      className="text-[#173B67]"
                    />
                    <div>
                      <span className="block text-xs">With Compensation</span>
                      <span className="text-[10px] text-slate-500 block">Includes salary & allowances</span>
                    </div>
                  </label>

                  <label className={`p-2.5 rounded-xl border cursor-pointer flex items-center space-x-2 ${
                    !withCompensation ? 'border-[#173B67] bg-white font-bold text-[#173B67]' : 'border-slate-200 bg-white/60'
                  }`}>
                    <input
                      type="radio"
                      name="coeComp"
                      checked={!withCompensation}
                      onChange={() => setWithCompensation(false)}
                      className="text-[#173B67]"
                    />
                    <div>
                      <span className="block text-xs">Without Compensation</span>
                      <span className="text-[10px] text-slate-500 block">Position & tenure only</span>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {/* Dynamic Specifics for PAYSLIP or IPCR or BIR 2316 */}
            {(requestType === 'PAYSLIP' || requestType === 'IPCR' || requestType === 'BIR_2316') && (
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                <span className="font-bold text-slate-800 block text-[11px]">
                  {requestType === 'PAYSLIP' ? 'Payroll Period' : requestType === 'IPCR' ? 'Performance Semester' : 'Tax Calendar Year'}
                </span>
                {requestType === 'PAYSLIP' && (
                  <select
                    value={periodCovered}
                    onChange={(e) => setPeriodCovered(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-xl bg-white font-semibold"
                  >
                    <option value="January 2026 (Full Month)">January 2026 (Full Month)</option>
                    <option value="December 2025 (Full Month)">December 2025 (Full Month)</option>
                    <option value="November 2025 (Full Month)">November 2025 (Full Month)</option>
                    <option value="Latest 3 Consecutive Months (Nov 2025 - Jan 2026)">Latest 3 Consecutive Months (Nov 2025 - Jan 2026)</option>
                    <option value="Latest 6 Months (Aug 2025 - Jan 2026)">Latest 6 Months (Aug 2025 - Jan 2026)</option>
                  </select>
                )}
                {requestType === 'IPCR' && (
                  <select
                    value={periodCovered}
                    onChange={(e) => setPeriodCovered(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-xl bg-white font-semibold"
                  >
                    <option value="2nd Semester 2025 (July - December 2025)">2nd Semester 2025 (July - December 2025)</option>
                    <option value="1st Semester 2025 (January - June 2025)">1st Semester 2025 (January - June 2025)</option>
                    <option value="2nd Semester 2024 (July - December 2024)">2nd Semester 2024 (July - December 2024)</option>
                    <option value="Full Rating Year 2025">Full Rating Year 2025 (Both Semesters)</option>
                  </select>
                )}
                {requestType === 'BIR_2316' && (
                  <select
                    value={periodCovered}
                    onChange={(e) => setPeriodCovered(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-xl bg-white font-semibold"
                  >
                    <option value="Tax Year 2025">Tax Year 2025</option>
                    <option value="Tax Year 2024">Tax Year 2024</option>
                    <option value="Tax Year 2023">Tax Year 2023</option>
                  </select>
                )}
              </div>
            )}

            {/* Purpose & Usage */}
            <div>
              <label className="block font-bold text-slate-800 mb-1">
                2. Purpose of Request
              </label>
              <div className="grid grid-cols-2 gap-2 mb-2">
                {[
                  'Bank / Housing Loan',
                  'GSIS / Pag-IBIG Loan',
                  'Visa / Passport / Embassy',
                  'Promotion / Step Increment',
                  'Scholarship / Study Leave',
                  'Personal Record Reference'
                ].map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setPurposeCategory(cat)}
                    className={`p-2 rounded-xl border text-left text-xs transition-colors cursor-pointer ${
                      purposeCategory === cat 
                        ? 'border-[#173B67] bg-blue-50 font-bold text-[#173B67]' 
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={customPurpose}
                onChange={(e) => setCustomPurpose(e.target.value)}
                placeholder="Specific bank name, loan type, agency, or additional purpose detail..."
                className="w-full p-2.5 border border-slate-300 rounded-xl bg-white text-xs"
              />
            </div>

            {/* Options Row: Copies & Delivery */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-800 mb-1">Number of Copies</label>
                <select
                  value={copies}
                  onChange={(e) => setCopies(Number(e.target.value))}
                  className="w-full p-2.5 border border-slate-300 rounded-xl bg-white font-semibold text-xs"
                >
                  <option value={1}>1 Original Copy</option>
                  <option value={2}>2 Copies</option>
                  <option value={3}>3 Copies</option>
                  <option value={5}>5 Copies</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Urgency</label>
                <select
                  value={urgency}
                  onChange={(e) => setUrgency(e.target.value as any)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl bg-white font-semibold text-xs"
                >
                  <option value="Normal (2-3 days)">Normal (2-3 working days)</option>
                  <option value="Urgent (1 day)">Urgent / Rush (1 working day)</option>
                </select>
              </div>
            </div>

            {/* Delivery Preference */}
            <div>
              <label className="block font-bold text-slate-800 mb-1">Delivery / Issuance Preference</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'Digital Copy (PDF)', label: 'Digital PDF', desc: 'Download in ESS' },
                  { id: 'In-Person Pick-up (MHRMO)', label: 'Pick-up', desc: 'MHRMO Window 2' },
                  { id: 'Both Digital & In-Person', label: 'Both', desc: 'Digital + Hardcopy' }
                ].map(del => (
                  <button
                    key={del.id}
                    type="button"
                    onClick={() => setDeliveryPreference(del.id as any)}
                    className={`p-2 rounded-xl border text-center transition-colors cursor-pointer ${
                      deliveryPreference === del.id
                        ? 'border-[#173B67] bg-blue-50 font-bold text-[#173B67]'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="block text-xs">{del.label}</span>
                    <span className="text-[10px] text-slate-500 block truncate">{del.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Special Instructions */}
            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Special Remarks / Instructions (Optional)
              </label>
              <textarea
                rows={2}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="e.g. Please dry-seal for embassy, or include official travel order citation..."
                className="w-full p-2.5 border border-slate-300 rounded-xl text-xs"
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-3 flex items-center justify-end space-x-2.5 border-t border-slate-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 bg-[#173B67] hover:bg-[#122e50] text-white font-bold rounded-xl shadow-md transition-all flex items-center space-x-1.5 text-xs cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Submitting...' : 'Submit Request to HR'}</span>
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
