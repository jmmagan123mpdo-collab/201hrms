import React from 'react';
import { HRTab } from './Sidebar';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Users, CalendarDays, ClipboardCheck, FileText, Wallet, ChartNoAxesCombined } from 'lucide-react';

interface Props { onNavigate: (tab: HRTab) => void }

export const RoleDashboard: React.FC<Props> = ({ onNavigate }) => {
  const { currentUser } = useAuth();
  const { employees, leaveApplications, requests, essServiceRequests } = useData();
  const role = currentUser?.role;
  const title = role === 'mayor' ? 'Executive Dashboard' : role === 'department_head' ? 'Department Dashboard' : role === 'division_head' ? 'Division Dashboard' : role === 'payroll' ? 'Payroll Dashboard' : 'HR Staff Dashboard';
  const isExecutive = role === 'mayor';
  const isDepartment = role === 'department_head';
  const isDivision = role === 'division_head';
  const isPayroll = role === 'payroll';
  const cards = isPayroll
    ? [{ label: 'Personnel Records', value: employees.length, icon: Users }, { label: 'Payroll Tasks', value: '—', icon: Wallet }, { label: 'Payslip Publication', value: '—', icon: FileText }]
    : isExecutive
      ? [{ label: 'LGU Personnel', value: employees.length, icon: Users }, { label: 'Pending Leave', value: leaveApplications.filter(x => String(x.status).startsWith('pending_')).length, icon: CalendarDays }, { label: 'Assigned Reviews', value: '—', icon: ClipboardCheck }]
      : [{ label: isDepartment ? 'Department Personnel' : isDivision ? 'Division Personnel' : 'Assigned Personnel', value: employees.length, icon: Users }, { label: 'Pending Leave', value: leaveApplications.filter(x => String(x.status).startsWith('pending_')).length, icon: CalendarDays }, { label: 'Document Requests', value: requests.length + essServiceRequests.length, icon: FileText }];
  const actions: { label: string; tab: HRTab; icon: React.ElementType }[] = isPayroll
    ? [{ label: 'Payroll & Payslips', tab: 'payroll', icon: Wallet }, { label: 'Payroll Reports', tab: 'reports', icon: ChartNoAxesCombined }]
    : isExecutive
      ? [{ label: 'Assigned Approvals', tab: 'leave', icon: ClipboardCheck }, { label: 'Performance Overview', tab: 'performance', icon: ChartNoAxesCombined }, { label: 'Executive Reports', tab: 'reports', icon: FileText }]
      : [{ label: 'Personnel', tab: 'masterlist', icon: Users }, { label: 'IPCR Review', tab: 'performance', icon: ClipboardCheck }, { label: 'Leave Review', tab: 'leave', icon: CalendarDays }, { label: 'Reports', tab: 'reports', icon: FileText }];

  return <section className="space-y-5">
    <header><p className="text-xs font-bold uppercase tracking-wide text-slate-500">SJHR201 • {currentUser?.displayName || 'Authorized Personnel'}</p><h1 className="text-2xl font-extrabold text-[#173B67]">{title}</h1><p className="text-sm text-slate-500">Your assigned work and authorized information.</p></header>
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">{cards.map(({ label, value, icon: Icon }) => <div key={label} className="bg-white border border-slate-200 rounded-xl p-4"><div className="flex items-center justify-between"><span className="text-xs text-slate-500">{label}</span><Icon className="w-5 h-5 text-[#F28C28]"/></div><div className="text-2xl font-bold text-[#173B67] mt-2">{value}</div></div>)}</div>
    <div className="bg-white border border-slate-200 rounded-xl p-4"><h2 className="font-bold text-slate-900 mb-3">Quick Access</h2><div className="grid grid-cols-2 sm:grid-cols-4 gap-2">{actions.map(({ label, tab, icon: Icon }) => <button key={label} onClick={() => onNavigate(tab)} className="min-h-20 rounded-lg border border-slate-200 hover:border-[#F28C28] hover:bg-orange-50 p-3 text-left"><Icon className="w-5 h-5 text-[#F28C28] mb-2"/><span className="text-xs font-semibold text-slate-800">{label}</span></button>)}</div></div>
    <div className="rounded-xl bg-blue-50 border border-blue-100 p-4 text-sm text-[#173B67]">Your access is limited to your assigned role and organizational scope. Confidential HR records are not included unless separately authorized.</div>
  </section>;
};
