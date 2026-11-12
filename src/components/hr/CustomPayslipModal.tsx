import React, { useState, useEffect } from 'react';
import { Employee, PayslipRecord, PayslipItem } from '../../types/index.ts';
import { 
  X, 
  CreditCard, 
  Calculator, 
  Plus, 
  Trash2, 
  Printer, 
  CheckCircle2, 
  Sparkles, 
  Calendar, 
  Building2, 
  User, 
  ShieldCheck, 
  Download,
  AlertCircle
} from 'lucide-react';

interface CustomPayslipModalProps {
  isOpen: boolean;
  onClose: () => void;
  employees: Employee[];
  initialEmployee?: Employee | null;
  onSavePayslip: (payslip: PayslipRecord) => void;
  onPrintDirectly?: (payslip: PayslipRecord) => void;
}

export const CustomPayslipModal: React.FC<CustomPayslipModalProps> = ({
  isOpen,
  onClose,
  employees,
  initialEmployee,
  onSavePayslip,
  onPrintDirectly
}) => {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  
  // Custom or selected employee details
  const [employeeName, setEmployeeName] = useState<string>('');
  const [employeeNumber, setEmployeeNumber] = useState<string>('');
  const [officeName, setOfficeName] = useState<string>('');
  const [position, setPosition] = useState<string>('');
  const [salaryGrade, setSalaryGrade] = useState<string>('SG 15');
  const [stepIncrement, setStepIncrement] = useState<string>('Step 1');

  // Period setup
  const [periodType, setPeriodType] = useState<string>('regular_monthly');
  const [year, setYear] = useState<number>(2026);
  const [month, setMonth] = useState<number>(2);
  const [customPeriodLabel, setCustomPeriodLabel] = useState<string>('February 1 - 28, 2026');
  const [payDate, setPayDate] = useState<string>('February 28, 2026');

  // Earnings
  const [basicSalary, setBasicSalary] = useState<number>(36619);
  const [pera, setPera] = useState<number>(2000);
  const [rata, setRata] = useState<number>(0);
  const [customEarnings, setCustomEarnings] = useState<PayslipItem[]>([]);

  // Deductions
  const [gsis, setGsis] = useState<number>(3296); // ~9%
  const [philHealth, setPhilHealth] = useState<number>(915); // ~2.5%
  const [pagIbig, setPagIbig] = useState<number>(100);
  const [withholdingTax, setWithholdingTax] = useState<number>(1831);
  const [gsisLoan, setGsisLoan] = useState<number>(0);
  const [pagIbigLoan, setPagIbigLoan] = useState<number>(0);
  const [landbankLoan, setLandbankLoan] = useState<number>(0);
  const [customDeductions, setCustomDeductions] = useState<PayslipItem[]>([]);

  // Bank & Certification
  const [bankName, setBankName] = useState<string>('Land Bank of the Philippines – San Jose Branch');
  const [accountNumberMasked, setAccountNumberMasked] = useState<string>('0421-****-88');
  const [certifiedBy, setCertifiedBy] = useState<string>('Grace Balmes, Municipal Payroll Officer');
  const [notedBy, setNotedBy] = useState<string>('Atty. Maria Elena Castillo, MHRMO Head');

  // New item inputs
  const [newEarningName, setNewEarningName] = useState('');
  const [newEarningAmount, setNewEarningAmount] = useState<number>(0);
  const [newDeductionName, setNewDeductionName] = useState('');
  const [newDeductionAmount, setNewDeductionAmount] = useState<number>(0);

  // Success indicator
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Sync selected employee
  useEffect(() => {
    if (initialEmployee) {
      populateFromEmployee(initialEmployee);
    } else if (employees.length > 0 && !selectedEmployeeId) {
      populateFromEmployee(employees[0]);
    }
  }, [initialEmployee, employees]);

  const populateFromEmployee = (emp: Employee) => {
    setSelectedEmployeeId(emp.id);
    setEmployeeName(`${emp.firstName} ${emp.lastName}`);
    setEmployeeNumber(emp.employeeNumber);
    setOfficeName(emp.officeName);
    setPosition(emp.position);
    setSalaryGrade(emp.salaryGrade || 'SG 15');
    setStepIncrement(emp.stepIncrement || 'Step 1');
    const salary = emp.monthlySalary || 36619;
    setBasicSalary(salary);
    setGsis(Math.round(salary * 0.09));
    setPhilHealth(Math.round(salary * 0.025));
    setWithholdingTax(Math.round(salary * 0.05));
  };

  const handleEmployeeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedEmployeeId(id);
    const emp = employees.find(em => em.id === id);
    if (emp) {
      populateFromEmployee(emp);
    }
  };

  // Preset Period configurations
  const handlePeriodTypeChange = (type: string) => {
    setPeriodType(type);
    const mNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const currentMName = mNames[month - 1] || 'February';

    if (type === 'regular_monthly') {
      const days = new Date(year, month, 0).getDate();
      setCustomPeriodLabel(`${currentMName} 1 - ${days}, ${year}`);
      setPayDate(`${currentMName} ${days}, ${year}`);
    } else if (type === 'quincena_1') {
      setCustomPeriodLabel(`${currentMName} 1 - 15, ${year} (1st Half Pay)`);
      setPayDate(`${currentMName} 15, ${year}`);
    } else if (type === 'quincena_2') {
      const days = new Date(year, month, 0).getDate();
      setCustomPeriodLabel(`${currentMName} 16 - ${days}, ${year} (2nd Half Pay)`);
      setPayDate(`${currentMName} ${days}, ${year}`);
    } else if (type === 'mid_year_bonus') {
      setCustomPeriodLabel(`FY ${year} Mid-Year Bonus`);
      setPayDate(`May 15, ${year}`);
      setPera(0);
      setGsis(0);
      setPhilHealth(0);
      setPagIbig(0);
      setWithholdingTax(0);
    } else if (type === 'year_end_bonus') {
      setCustomPeriodLabel(`FY ${year} Year-End Bonus & Cash Gift (₱5,000)`);
      setPayDate(`November 15, ${year}`);
      setPera(5000); // Cash gift
      setGsis(0);
      setPhilHealth(0);
      setPagIbig(0);
      setWithholdingTax(0);
    } else if (type === 'clothing_allowance') {
      setCustomPeriodLabel(`FY ${year} Annual Uniform & Clothing Allowance`);
      setPayDate(`March 15, ${year}`);
      setBasicSalary(7000);
      setPera(0);
      setGsis(0);
      setPhilHealth(0);
      setPagIbig(0);
      setWithholdingTax(0);
    } else if (type === 'hazard_overtime') {
      setCustomPeriodLabel(`${currentMName} ${year} Hazard Pay & Overtime Differential`);
      setPayDate(`${currentMName} 20, ${year}`);
    }
  };

  // Computations
  const totalCustomEarnings = customEarnings.reduce((acc, curr) => acc + curr.amount, 0);
  const totalGrossPay = basicSalary + pera + rata + totalCustomEarnings;

  const totalCustomDeductions = customDeductions.reduce((acc, curr) => acc + curr.amount, 0);
  const totalMandatoryDeductions = gsis + philHealth + pagIbig + withholdingTax;
  const totalLoanDeductions = gsisLoan + pagIbigLoan + landbankLoan;
  const totalDeductions = totalMandatoryDeductions + totalLoanDeductions + totalCustomDeductions;
  const netTakeHomePay = Math.max(0, totalGrossPay - totalDeductions);

  // Add Custom Earning
  const handleAddCustomEarning = () => {
    if (!newEarningName.trim() || newEarningAmount <= 0) return;
    setCustomEarnings(prev => [...prev, { name: newEarningName.trim(), amount: newEarningAmount, category: 'earning' }]);
    setNewEarningName('');
    setNewEarningAmount(0);
  };

  // Remove Custom Earning
  const handleRemoveCustomEarning = (index: number) => {
    setCustomEarnings(prev => prev.filter((_, i) => i !== index));
  };

  // Add Custom Deduction
  const handleAddCustomDeduction = () => {
    if (!newDeductionName.trim() || newDeductionAmount <= 0) return;
    setCustomDeductions(prev => [...prev, { name: newDeductionName.trim(), amount: newDeductionAmount, category: 'deduction' }]);
    setNewDeductionName('');
    setNewDeductionAmount(0);
  };

  // Remove Custom Deduction
  const handleRemoveCustomDeduction = (index: number) => {
    setCustomDeductions(prev => prev.filter((_, i) => i !== index));
  };

  // Generate the Payslip Record
  const buildPayslipRecord = (): PayslipRecord => {
    const selectedEmp = employees.find(e => e.id === selectedEmployeeId);
    const mNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const currentMName = mNames[month - 1] || 'February';
    const timestamp = Date.now().toString().slice(-4);

    return {
      id: `PS-${year}-${String(month).padStart(2, '0')}-${selectedEmployeeId || 'CUSTOM'}-${timestamp}`,
      employeeId: selectedEmployeeId || 'EMP-CUSTOM',
      employeeNumber: employeeNumber || 'SJ-CUSTOM',
      employeeName: employeeName || 'Employee Name',
      officeName: officeName || 'LGU Office',
      position: position || 'Government Employee',
      classification: selectedEmp?.classification || 'Permanent',
      salaryGrade,
      stepIncrement,
      year,
      month,
      monthName: currentMName,
      periodLabel: customPeriodLabel,
      payDate,
      basicSalary,
      pera,
      rata: rata > 0 ? rata : undefined,
      otherEarnings: customEarnings.length > 0 ? customEarnings : undefined,
      grossPay: totalGrossPay,
      gsisLifeAndRetirement: gsis,
      philHealth,
      pagIbig,
      withholdingTax,
      gsisLoan: gsisLoan > 0 ? gsisLoan : undefined,
      pagIbigLoan: pagIbigLoan > 0 ? pagIbigLoan : undefined,
      landbankSalaryLoan: landbankLoan > 0 ? landbankLoan : undefined,
      otherDeductions: customDeductions.length > 0 ? customDeductions : undefined,
      totalDeductions,
      netTakeHomePay,
      bankName,
      accountNumberMasked,
      payrollRefNumber: `LGU-SJ-PR-${year}-${String(month).padStart(2, '0')}-${timestamp}`,
      disbursedAt: new Date().toISOString(),
      certifiedBy,
      notedBy
    };
  };

  const handleSaveAndIssue = () => {
    const newPs = buildPayslipRecord();
    onSavePayslip(newPs);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  const handlePrint = () => {
    const newPs = buildPayslipRecord();
    onSavePayslip(newPs);
    if (onPrintDirectly) {
      onPrintDirectly(newPs);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] my-auto">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-[#173B67] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-amber-300">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <div className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-full bg-blue-900/80 text-[10px] font-bold uppercase tracking-wider text-amber-200">
                <Sparkles className="w-3 h-3" />
                <span>Municipal Payroll Computation Engine</span>
              </div>
              <h3 className="text-base sm:text-lg font-extrabold tracking-tight">
                Generate Custom Digital Payslip
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body - Scrollable */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 text-xs text-slate-700">
          
          {/* Section 1: Employee Selection */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 text-xs sm:text-sm flex items-center space-x-2">
                <User className="w-4 h-4 text-[#173B67]" />
                <span>1. Select Municipal Personnel</span>
              </h4>
              <span className="text-[11px] text-slate-500 font-medium">Linked to Active 201 Registry</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Choose Employee from Masterlist
                </label>
                <select
                  value={selectedEmployeeId}
                  onChange={handleEmployeeChange}
                  className="w-full p-2.5 border border-slate-300 rounded-xl bg-white font-bold text-slate-900 text-xs focus:ring-2 focus:ring-[#173B67] focus:outline-none"
                >
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName} ({emp.employeeNumber}) – {emp.officeName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Position & Office Designation
                </label>
                <div className="p-2.5 bg-white border border-slate-200 rounded-xl font-semibold text-slate-700 truncate">
                  {position} • {officeName}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase">Personnel Name</label>
                <input
                  type="text"
                  value={employeeName}
                  onChange={(e) => setEmployeeName(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white font-semibold text-xs"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase">Employee ID</label>
                <input
                  type="text"
                  value={employeeNumber}
                  onChange={(e) => setEmployeeNumber(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white font-mono text-xs"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase">Salary Grade</label>
                <input
                  type="text"
                  value={salaryGrade}
                  onChange={(e) => setSalaryGrade(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white font-semibold text-xs"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase">Step Increment</label>
                <input
                  type="text"
                  value={stepIncrement}
                  onChange={(e) => setStepIncrement(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white font-semibold text-xs"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Pay Period Configuration */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <h4 className="font-bold text-slate-900 text-xs sm:text-sm flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-[#173B67]" />
              <span>2. Pay Period & Payroll Type</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Payroll Schedule Type</label>
                <select
                  value={periodType}
                  onChange={(e) => handlePeriodTypeChange(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl bg-white font-bold text-slate-900 text-xs"
                >
                  <option value="regular_monthly">Regular Monthly Salary (1 - 30/31)</option>
                  <option value="quincena_1">1st Quincena (1 - 15)</option>
                  <option value="quincena_2">2nd Quincena (16 - End of Month)</option>
                  <option value="mid_year_bonus">Mid-Year Bonus (May 15)</option>
                  <option value="year_end_bonus">Year-End Bonus & Cash Gift (Nov 15)</option>
                  <option value="clothing_allowance">Uniform / Clothing Allowance</option>
                  <option value="hazard_overtime">Hazard Pay / Special Differential</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Period Covered Description</label>
                <input
                  type="text"
                  value={customPeriodLabel}
                  onChange={(e) => setCustomPeriodLabel(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl bg-white font-semibold text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Disbursal / Pay Date</label>
                <input
                  type="text"
                  value={payDate}
                  onChange={(e) => setPayDate(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl bg-white font-semibold text-xs"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Dual Column - Earnings & Deductions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Left: Gross Earnings Column */}
            <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-200 space-y-3">
              <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
                <h4 className="font-bold text-emerald-900 text-xs sm:text-sm flex items-center space-x-1.5">
                  <CreditCard className="w-4 h-4 text-emerald-700" />
                  <span>Gross Earnings & Allowances</span>
                </h4>
                <span className="font-mono font-bold text-emerald-800 text-sm">
                  ₱{totalGrossPay.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="space-y-2.5">
                <div>
                  <div className="flex justify-between text-[11px] font-semibold text-slate-700 mb-0.5">
                    <span>Basic Monthly Salary (₱)</span>
                    <span className="font-mono font-bold">₱{basicSalary.toLocaleString()}</span>
                  </div>
                  <input
                    type="number"
                    value={basicSalary}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setBasicSalary(val);
                      // Auto recalculate standard percentages
                      setGsis(Math.round(val * 0.09));
                      setPhilHealth(Math.round(val * 0.025));
                      setWithholdingTax(Math.round(val * 0.05));
                    }}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white font-mono font-bold text-xs"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[11px] font-semibold text-slate-700 mb-0.5">
                    <span>Personnel Economic Relief Allowance (PERA)</span>
                    <span className="font-mono font-bold">₱{pera.toLocaleString()}</span>
                  </div>
                  <input
                    type="number"
                    value={pera}
                    onChange={(e) => setPera(Number(e.target.value))}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white font-mono text-xs"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[11px] font-semibold text-slate-700 mb-0.5">
                    <span>RATA (Representation / Transportation)</span>
                    <span className="font-mono font-bold">₱{rata.toLocaleString()}</span>
                  </div>
                  <input
                    type="number"
                    value={rata}
                    onChange={(e) => setRata(Number(e.target.value))}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white font-mono text-xs"
                  />
                </div>

                {/* Additional Custom Earnings List */}
                {customEarnings.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 bg-white rounded-lg border border-emerald-200">
                    <div>
                      <span className="font-bold text-slate-900 block">{item.name}</span>
                      <span className="text-[10px] text-emerald-700 font-mono font-bold">
                        +₱{item.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveCustomEarning(idx)}
                      className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}

                {/* Add Custom Earning Line */}
                <div className="pt-2 border-t border-emerald-200/80">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase block mb-1.5">
                    + Add Custom Allowance / Differential
                  </span>
                  <div className="flex items-center space-x-1.5">
                    <input
                      type="text"
                      placeholder="e.g. Hazard Pay / Special Bonus"
                      value={newEarningName}
                      onChange={(e) => setNewEarningName(e.target.value)}
                      className="flex-1 p-1.5 border border-slate-300 rounded-lg bg-white text-xs"
                    />
                    <input
                      type="number"
                      placeholder="₱ Amount"
                      value={newEarningAmount || ''}
                      onChange={(e) => setNewEarningAmount(Number(e.target.value))}
                      className="w-24 p-1.5 border border-slate-300 rounded-lg bg-white font-mono text-xs"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomEarning}
                      className="px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg cursor-pointer text-xs flex items-center space-x-1 shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>

              </div>
            </div>

            {/* Right: Deductions Column */}
            <div className="bg-rose-50/50 p-4 rounded-xl border border-rose-200 space-y-3">
              <div className="flex items-center justify-between border-b border-rose-200 pb-2">
                <h4 className="font-bold text-rose-900 text-xs sm:text-sm flex items-center space-x-1.5">
                  <ShieldCheck className="w-4 h-4 text-rose-700" />
                  <span>Mandatory & Loan Deductions</span>
                </h4>
                <span className="font-mono font-bold text-rose-800 text-sm">
                  -₱{totalDeductions.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="space-y-2.5">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-0.5">GSIS (9%)</label>
                    <input
                      type="number"
                      value={gsis}
                      onChange={(e) => setGsis(Number(e.target.value))}
                      className="w-full p-1.5 border border-slate-300 rounded-lg bg-white font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-0.5">PhilHealth (2.5%)</label>
                    <input
                      type="number"
                      value={philHealth}
                      onChange={(e) => setPhilHealth(Number(e.target.value))}
                      className="w-full p-1.5 border border-slate-300 rounded-lg bg-white font-mono text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Pag-IBIG Mandatory</label>
                    <input
                      type="number"
                      value={pagIbig}
                      onChange={(e) => setPagIbig(Number(e.target.value))}
                      className="w-full p-1.5 border border-slate-300 rounded-lg bg-white font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Withholding Tax (BIR)</label>
                    <input
                      type="number"
                      value={withholdingTax}
                      onChange={(e) => setWithholdingTax(Number(e.target.value))}
                      className="w-full p-1.5 border border-slate-300 rounded-lg bg-white font-mono text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-0.5">GSIS Loan</label>
                    <input
                      type="number"
                      value={gsisLoan}
                      onChange={(e) => setGsisLoan(Number(e.target.value))}
                      className="w-full p-1.5 border border-slate-300 rounded-lg bg-white font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Pag-IBIG Loan</label>
                    <input
                      type="number"
                      value={pagIbigLoan}
                      onChange={(e) => setPagIbigLoan(Number(e.target.value))}
                      className="w-full p-1.5 border border-slate-300 rounded-lg bg-white font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Landbank Loan</label>
                    <input
                      type="number"
                      value={landbankLoan}
                      onChange={(e) => setLandbankLoan(Number(e.target.value))}
                      className="w-full p-1.5 border border-slate-300 rounded-lg bg-white font-mono text-xs"
                    />
                  </div>
                </div>

                {/* Additional Custom Deductions List */}
                {customDeductions.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 bg-white rounded-lg border border-rose-200">
                    <div>
                      <span className="font-bold text-slate-900 block">{item.name}</span>
                      <span className="text-[10px] text-rose-700 font-mono font-bold">
                        -₱{item.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveCustomDeduction(idx)}
                      className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}

                {/* Add Custom Deduction Line */}
                <div className="pt-2 border-t border-rose-200/80">
                  <span className="text-[10px] font-bold text-rose-800 uppercase block mb-1.5">
                    + Add Custom Loan / Cooperative / Due
                  </span>
                  <div className="flex items-center space-x-1.5">
                    <input
                      type="text"
                      placeholder="e.g. Coop Loan / Union Due"
                      value={newDeductionName}
                      onChange={(e) => setNewDeductionName(e.target.value)}
                      className="flex-1 p-1.5 border border-slate-300 rounded-lg bg-white text-xs"
                    />
                    <input
                      type="number"
                      placeholder="₱ Amount"
                      value={newDeductionAmount || ''}
                      onChange={(e) => setNewDeductionAmount(Number(e.target.value))}
                      className="w-24 p-1.5 border border-slate-300 rounded-lg bg-white font-mono text-xs"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomDeduction}
                      className="px-2.5 py-1.5 bg-rose-700 hover:bg-rose-800 text-white font-bold rounded-lg cursor-pointer text-xs flex items-center space-x-1 shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>

              </div>
            </div>

          </div>

          {/* Section 4: Live Net Take-Home Pay Highlight Card */}
          <div className="p-4 bg-gradient-to-r from-[#173B67] to-[#1e4e89] text-white rounded-2xl shadow-md flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <span className="text-blue-200 text-[11px] font-bold uppercase tracking-wider block">
                Net Take-Home Pay (Disbursed via Landbank ATM)
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold font-mono text-amber-300 mt-0.5">
                ₱{netTakeHomePay.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <span className="text-xs text-blue-100">
                Gross: ₱{totalGrossPay.toLocaleString()} • Total Deductions: -₱{totalDeductions.toLocaleString()}
              </span>
            </div>

            <div className="text-right text-xs text-blue-200 space-y-0.5">
              <div><span className="font-bold text-white">Bank:</span> {bankName}</div>
              <div><span className="font-bold text-white">Account:</span> {accountNumberMasked}</div>
              <div><span className="font-bold text-white">Ref:</span> LGU-SJ-PR-{year}-{String(month).padStart(2, '0')}</div>
            </div>
          </div>

          {/* Section 5: Signatories & Verification */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Certified Correct By (Disbursing Officer / Accountant)
              </label>
              <input
                type="text"
                value={certifiedBy}
                onChange={(e) => setCertifiedBy(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg bg-white font-semibold text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Noted & Approved By (MHRMO Head / Municipal Mayor)
              </label>
              <input
                type="text"
                value={notedBy}
                onChange={(e) => setNotedBy(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg bg-white font-semibold text-xs"
              />
            </div>
          </div>

        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center space-x-2 text-xs text-slate-500">
            {savedSuccess ? (
              <span className="inline-flex items-center space-x-1 text-emerald-700 font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Custom Payslip Successfully Added to Registry!</span>
              </span>
            ) : (
              <span>Ready to save into LGU San Jose active payroll registry.</span>
            )}
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 sm:w-auto px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 font-bold rounded-xl border border-slate-300 transition-colors cursor-pointer text-xs"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="w-1/3 sm:w-auto px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center space-x-1.5 cursor-pointer text-xs"
            >
              <Printer className="w-4 h-4 text-amber-300" />
              <span>Preview & Print</span>
            </button>

            <button
              type="button"
              onClick={handleSaveAndIssue}
              className="w-1/3 sm:w-auto px-5 py-2 bg-[#173B67] hover:bg-[#122e50] text-white font-bold rounded-xl shadow-md transition-colors flex items-center justify-center space-x-1.5 cursor-pointer text-xs"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Save & Issue to Registry</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
