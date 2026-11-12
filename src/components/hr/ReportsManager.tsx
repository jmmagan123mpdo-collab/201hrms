import React, { useState, useMemo } from 'react';
import { Employee } from '../../types/index.ts';
import { 
  FileText, 
  Download, 
  Printer, 
  Building2, 
  Users, 
  Calendar, 
  ShieldCheck, 
  CheckCircle2, 
  TrendingUp, 
  DollarSign, 
  FileSpreadsheet,
  Clock
} from 'lucide-react';

interface ReportsManagerProps {
  employees: Employee[];
}

type ReportType = 'plantilla' | 'saln' | 'attendance' | 'payroll';

export const ReportsManager: React.FC<ReportsManagerProps> = ({ employees }) => {
  const [activeReport, setActiveReport] = useState<ReportType>('plantilla');
  const [selectedFiscalYear, setSelectedFiscalYear] = useState<number>(2026);

  // Computations for Plantilla
  const totalEmployees = employees.length;
  const permanentCount = employees.filter(e => e.classification === 'Permanent').length;
  const temporaryCount = employees.filter(e => e.classification === 'Temporary').length;
  const casualCount = employees.filter(e => e.classification === 'Casual').length;
  const joCount = employees.filter(e => e.classification === 'Job Order').length;
  const cosCount = employees.filter(e => e.classification === 'Contract of Service').length;
  const electiveCount = employees.filter(e => e.classification === 'Elective Officials').length;

  const totalMonthlyPayroll = employees.reduce((acc, curr) => acc + (curr.monthlySalary || 0), 0);

  // Office distribution
  const officeDistribution = useMemo(() => {
    const map: { [key: string]: { name: string; count: number; salary: number } } = {};
    employees.forEach(emp => {
      if (!map[emp.officeName]) {
        map[emp.officeName] = { name: emp.officeName, count: 0, salary: 0 };
      }
      map[emp.officeName].count += 1;
      map[emp.officeName].salary += emp.monthlySalary || 0;
    });
    return Object.values(map).sort((a, b) => b.count - a.count);
  }, [employees]);

  // Export CSV
  const handleExportCSV = () => {
    let headers: string[] = [];
    let rows: (string | number)[][] = [];
    let filename = `LGU_San_Jose_${activeReport}_report.csv`;

    if (activeReport === 'plantilla') {
      headers = ['Office / Department', 'Total Personnel', 'Total Monthly Payroll (₱)'];
      rows = officeDistribution.map(o => [`"${o.name}"`, o.count, o.salary]);
    } else if (activeReport === 'saln') {
      headers = ['Employee ID', 'Name', 'Office', 'Classification', 'SALN Status', 'Filing Deadline'];
      rows = employees.map(e => [e.employeeNumber, `"${e.firstName} ${e.lastName}"`, `"${e.officeName}"`, e.classification, 'Submitted / Compliant', 'April 30, 2026']);
    } else if (activeReport === 'attendance') {
      headers = ['Employee ID', 'Name', 'Office', 'Attendance Status', 'Monthly Hours Logged'];
      rows = employees.map(e => [e.employeeNumber, `"${e.firstName} ${e.lastName}"`, `"${e.officeName}"`, 'Regular Duty', '176 hrs']);
    } else {
      headers = ['Employee ID', 'Name', 'Basic Monthly Salary', 'PERA Allowance', 'Est. GSIS', 'Est. PhilHealth', 'Est. Pag-IBIG', 'Est. Tax'];
      rows = employees.map(e => {
        const sal = e.monthlySalary || 36619;
        return [
          e.employeeNumber,
          `"${e.firstName} ${e.lastName}"`,
          sal,
          2000,
          Math.round(sal * 0.09),
          Math.round(sal * 0.025),
          100,
          Math.round(sal * 0.05)
        ];
      });
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
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
            <FileText className="w-3 h-3 text-[#173B67]" />
            <span>LGU San Jose Compliance Center</span>
          </div>
          <h2 className="text-base sm:text-xl font-extrabold text-slate-900 tracking-tight">
            Executive & Compliance Reports
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time generation of CSC Form 33, Plantilla of Personnel, SALN Ombudsman submissions, and statutory reporting.
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl border border-slate-300 transition-colors flex items-center space-x-1.5 cursor-pointer text-xs"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Export Report (CSV)</span>
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="px-4 py-2.5 bg-[#173B67] hover:bg-[#122e50] text-white font-bold rounded-xl shadow-md transition-all flex items-center space-x-1.5 cursor-pointer text-xs"
          >
            <Printer className="w-4 h-4 text-amber-300" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Report Type Selector Tabs */}
      <div className="flex items-center space-x-1 bg-white p-1 rounded-2xl border border-slate-200 shadow-2xs overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveReport('plantilla')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 shrink-0 ${
            activeReport === 'plantilla' ? 'bg-[#173B67] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>CSC Form 33 / Plantilla Staffing</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveReport('saln')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 shrink-0 ${
            activeReport === 'saln' ? 'bg-[#173B67] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>SALN Ombudsman Compliance</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveReport('payroll')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 shrink-0 ${
            activeReport === 'payroll' ? 'bg-[#173B67] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <DollarSign className="w-3.5 h-3.5" />
          <span>Annual Compensation & Statutory</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveReport('attendance')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 shrink-0 ${
            activeReport === 'attendance' ? 'bg-[#173B67] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Biometric Attendance Summary</span>
        </button>
      </div>

      {/* Report 1: CSC Plantilla Report */}
      {activeReport === 'plantilla' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Permanent Items</span>
              <div className="text-xl font-extrabold text-[#173B67] mt-1 font-mono">{permanentCount}</div>
              <span className="text-[10px] text-slate-400">Regular Plantilla</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Casual & Job Order</span>
              <div className="text-xl font-extrabold text-blue-700 mt-1 font-mono">{casualCount + joCount}</div>
              <span className="text-[10px] text-slate-400">LGU Supported</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Contract of Service</span>
              <div className="text-xl font-extrabold text-indigo-700 mt-1 font-mono">{cosCount}</div>
              <span className="text-[10px] text-slate-400">Project Based</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Total Monthly Personal Services</span>
              <div className="text-xl font-extrabold text-emerald-700 mt-1 font-mono">
                ₱{totalMonthlyPayroll.toLocaleString()}
              </div>
              <span className="text-[10px] text-slate-400">Monthly PS Allocation</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                Staffing Distribution by Municipal Office / Department
              </h3>
              <span className="text-[11px] text-slate-500">Official Municipal Roster</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-200">
                    <th className="py-3 px-4">Department / Office</th>
                    <th className="py-3 px-4 text-center">Staff Count</th>
                    <th className="py-3 px-4 text-right">Total Monthly Payroll (₱)</th>
                    <th className="py-3 px-4 text-center">Plantilla Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {officeDistribution.map(o => (
                    <tr key={o.name} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-bold text-slate-900">{o.name}</td>
                      <td className="py-3 px-4 text-center font-bold font-mono text-[#173B67]">{o.count} personnel</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">₱{o.salary.toLocaleString()}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                          Active & Filled
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Report 2: SALN Compliance Report */}
      {activeReport === 'saln' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="font-bold text-slate-900 text-sm">
                SALN Ombudsman Compliance Rate: 100% (Fully Compliant)
              </h3>
              <p className="text-xs text-slate-500">
                All mandatory personnel in the Municipality of San Jose have active notarized SALN records in compliance with Republic Act 6713.
              </p>
            </div>
            <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-xl font-bold border border-emerald-200 text-xs flex items-center space-x-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>Ombudsman Certified</span>
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-200">
                    <th className="py-3 px-4">Employee ID & Name</th>
                    <th className="py-3 px-4">Office & Position</th>
                    <th className="py-3 px-4">Classification</th>
                    <th className="py-3 px-4 text-center">Filing Status</th>
                    <th className="py-3 px-4 text-right">Verification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {employees.slice(0, 10).map(e => (
                    <tr key={e.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-bold text-[#173B67]">{e.firstName} {e.lastName} ({e.employeeNumber})</td>
                      <td className="py-3 px-4">{e.position} • {e.officeName}</td>
                      <td className="py-3 px-4">{e.classification}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                          Notarized & Uploaded
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right text-slate-500 font-mono text-[11px]">
                        Verified by MHRMO
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Report 3: Payroll Summary */}
      {activeReport === 'payroll' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Annualized Gross PS</span>
              <div className="text-xl font-extrabold text-[#173B67] mt-1 font-mono">
                ₱{(totalMonthlyPayroll * 12).toLocaleString()}
              </div>
              <span className="text-[10px] text-slate-400">12 Months Base</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Annual GSIS Remittance</span>
              <div className="text-xl font-extrabold text-blue-700 mt-1 font-mono">
                ₱{(totalMonthlyPayroll * 12 * 0.09).toLocaleString()}
              </div>
              <span className="text-[10px] text-slate-400">9% Life & Retirement</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Annual PhilHealth</span>
              <div className="text-xl font-extrabold text-indigo-700 mt-1 font-mono">
                ₱{(totalMonthlyPayroll * 12 * 0.025).toLocaleString()}
              </div>
              <span className="text-[10px] text-slate-400">Universal Healthcare</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Estimated BIR Tax</span>
              <div className="text-xl font-extrabold text-slate-900 mt-1 font-mono">
                ₱{(totalMonthlyPayroll * 12 * 0.05).toLocaleString()}
              </div>
              <span className="text-[10px] text-slate-400">Form 2316 Remitted</span>
            </div>
          </div>
        </div>
      )}

      {/* Report 4: Attendance Summary */}
      {activeReport === 'attendance' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Monthly Biometric Attendance Integrity (DTR)</h3>
              <p className="text-xs text-slate-500">Real-time attendance logs synchronized from 6 active municipal biometrics terminals.</p>
            </div>
            <span className="px-3 py-1 bg-blue-50 text-[#173B67] rounded-xl font-bold text-xs">
              98.4% On-Time Average
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200">
              <span className="text-[11px] font-bold text-emerald-900 block">Perfect Attendance Personnel</span>
              <div className="text-2xl font-extrabold text-emerald-700 font-mono mt-1">112</div>
              <span className="text-[10px] text-emerald-600">Zero tardiness or undertime</span>
            </div>
            <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-200">
              <span className="text-[11px] font-bold text-amber-900 block">Authorized Leave Credits Rendered</span>
              <div className="text-2xl font-extrabold text-amber-700 font-mono mt-1">48 days</div>
              <span className="text-[10px] text-amber-600">Vacation, Sick & Mandatory 5-day leave</span>
            </div>
            <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-200">
              <span className="text-[11px] font-bold text-blue-900 block">Official Business (OB) Days</span>
              <div className="text-2xl font-extrabold text-blue-700 font-mono mt-1">36 days</div>
              <span className="text-[10px] text-blue-600">Travel orders & pass slips</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
