import React, { useState } from 'react';
import { useData } from '../../context/DataContext.tsx';
import { EmploymentClassification, EmploymentStatus } from '../../types/index.ts';
import { X, Plus, UserPlus, Building2, Mail, Phone, ShieldCheck } from 'lucide-react';

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddEmployeeModal: React.FC<AddEmployeeModalProps> = ({ isOpen, onClose }) => {
  const { addEmployee, offices } = useData();

  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [suffix, setSuffix] = useState('');
  const [employeeNumber, setEmployeeNumber] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [officeId, setOfficeId] = useState(offices[0]?.id || 'off-01');
  const [position, setPosition] = useState('');
  const [classification, setClassification] = useState<EmploymentClassification>('Permanent');
  const [salaryGrade, setSalaryGrade] = useState('SG 11');
  const [monthlySalary, setMonthlySalary] = useState<number>(27000);
  const [civilStatus, setCivilStatus] = useState<any>('Single');
  const [tin, setTin] = useState('');
  const [gsis, setGsis] = useState('');
  const [hireDate, setHireDate] = useState(new Date().toISOString().split('T')[0]);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      const selectedOffice = offices.find(o => o.id === officeId);

      await addEmployee({
        employeeNumber: employeeNumber.trim(),
        firstName: firstName.trim(),
        middleName: middleName.trim() || undefined,
        lastName: lastName.trim(),
        suffix: suffix.trim() || undefined,
        email: email.trim().toLowerCase(),
        isEmailVerified: true, // Marked verified by HR for ESS registration eligibility
        phone: phone.trim(),
        officeId,
        officeName: selectedOffice ? selectedOffice.name : 'Municipal Office',
        position: position.trim(),
        classification,
        employmentStatus: 'Active',
        recordStatus: 'Active',
        hireDate,
        salaryGrade,
        monthlySalary: Number(monthlySalary),
        civilStatus,
        tin: tin.trim() || undefined,
        gsis: gsis.trim() || undefined
      });

      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to create employee record.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden flex flex-col h-[94vh] sm:h-auto sm:max-h-[92vh]">
        
        {/* Mobile Drag Handle */}
        <div className="sm:hidden pt-2 pb-1 bg-[#173B67] flex justify-center shrink-0">
          <div className="w-10 h-1 bg-white/40 rounded-full"></div>
        </div>

        {/* Header */}
        <div className="bg-[#173B67] px-4 sm:px-6 py-3.5 sm:py-4 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold">Add Municipal Employee</h3>
              <p className="text-[11px] text-blue-200 line-clamp-1">
                Creates official personnel record and assigns permanent internal ID
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-300 hover:text-white rounded-xl transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl">
              {errorMessage}
            </div>
          )}

          {/* Name Row */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="sm:col-span-1">
              <label className="font-bold text-slate-700 block mb-1">First Name *</label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="e.g. Maria"
                className="w-full p-2 border rounded-xl"
              />
            </div>
            <div className="sm:col-span-1">
              <label className="font-bold text-slate-700 block mb-1">Middle Name</label>
              <input
                type="text"
                value={middleName}
                onChange={(e) => setMiddleName(e.target.value)}
                placeholder="e.g. Santos"
                className="w-full p-2 border rounded-xl"
              />
            </div>
            <div className="sm:col-span-1">
              <label className="font-bold text-slate-700 block mb-1">Last Name *</label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="e.g. Reyes"
                className="w-full p-2 border rounded-xl"
              />
            </div>
            <div className="sm:col-span-1">
              <label className="font-bold text-slate-700 block mb-1">Suffix</label>
              <input
                type="text"
                value={suffix}
                onChange={(e) => setSuffix(e.target.value)}
                placeholder="Jr., III"
                className="w-full p-2 border rounded-xl"
              />
            </div>
          </div>

          {/* Identifiers & Official Email */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Employee Number *</label>
              <input
                type="text"
                required
                value={employeeNumber}
                onChange={(e) => setEmployeeNumber(e.target.value)}
                placeholder="e.g. SJ-PERM-0155"
                className="w-full p-2 border rounded-xl font-mono"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">Unique personnel code</span>
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Official HR-Registered Email *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. employee@sanjose.gov.ph"
                className="w-full p-2 border rounded-xl"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">Used for ESS self-registration</span>
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Contact Phone</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0917-..."
                className="w-full p-2 border rounded-xl"
              />
            </div>
          </div>

          {/* Office, Position & Classification */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Municipal Office *</label>
              <select
                value={officeId}
                onChange={(e) => setOfficeId(e.target.value)}
                className="w-full p-2 border rounded-xl bg-white"
              >
                {offices.map(o => (
                  <option key={o.id} value={o.id}>{o.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Position Title *</label>
              <input
                type="text"
                required
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                placeholder="e.g. Administrative Officer II"
                className="w-full p-2 border rounded-xl"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Classification *</label>
              <select
                value={classification}
                onChange={(e) => setClassification(e.target.value as EmploymentClassification)}
                className="w-full p-2 border rounded-xl bg-white"
              >
                <option value="Permanent">Permanent</option>
                <option value="Temporary">Temporary</option>
                <option value="Casual">Casual</option>
                <option value="Job Order">Job Order (JO)</option>
                <option value="Contract of Service">Contract of Service (COS)</option>
                <option value="Elective Officials">Elective Officials</option>
              </select>
            </div>
          </div>

          {/* Salary & Statutory Info */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Salary Grade</label>
              <input
                type="text"
                value={salaryGrade}
                onChange={(e) => setSalaryGrade(e.target.value)}
                className="w-full p-2 border rounded-xl font-mono"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Monthly Salary (₱)</label>
              <input
                type="number"
                value={monthlySalary}
                onChange={(e) => setMonthlySalary(Number(e.target.value))}
                className="w-full p-2 border rounded-xl"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">TIN</label>
              <input
                type="text"
                value={tin}
                onChange={(e) => setTin(e.target.value)}
                placeholder="123-456-789"
                className="w-full p-2 border rounded-xl font-mono"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">GSIS BP#</label>
              <input
                type="text"
                value={gsis}
                onChange={(e) => setGsis(e.target.value)}
                placeholder="200..."
                className="w-full p-2 border rounded-xl font-mono"
              />
            </div>
          </div>

          {/* Footer Submit */}
          <div className="pt-4 border-t flex flex-col sm:flex-row justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] px-4 py-2.5 border rounded-xl text-slate-600 hover:bg-slate-50 font-semibold cursor-pointer flex items-center justify-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="min-h-[44px] px-5 py-2.5 bg-[#173B67] hover:bg-[#122e50] text-white font-bold rounded-xl shadow-md transition-colors flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span>{isLoading ? 'Creating Record...' : 'Save Employee'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
