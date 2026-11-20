import React from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import {
  LayoutDashboard,
  Users,
  FolderLock,
  FileClock,
  ShieldCheck,
  CreditCard,
  History,
  Navigation,
  ClipboardList,
  FileText,
  Award,
  TrendingUp,
  Building2,
  FileSpreadsheet,
  Bell,
  Sparkles,
  X
} from 'lucide-react';

export type HRTab = 
  | 'dashboard'
  | 'masterlist'
  | '201_files'
  | 'leave'
  | 'saln'
  | 'payroll'
  | 'overtime'
  | 'travel_orders'
  | 'pass_slips'
  | 'requests'
  | 'training'
  | 'performance'
  | 'offices'
  | 'reports'
  | 'users'
  | 'notifications'
  | 'audit_logs'
  | 'developer_control';

interface SidebarProps {
  activeTab: HRTab;
  onSelectTab: (tab: HRTab) => void;
  pendingRequestsCount?: number;
  pendingLeavesCount?: number;
  pendingWellnessCount?: number;
  unreadNotificationsCount?: number;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  pendingRequestsCount = 0,
  pendingLeavesCount = 0,
  pendingWellnessCount = 0,
  unreadNotificationsCount = 0,
  isOpenMobile = false,
  onCloseMobile
}) => {
  const { currentUser } = useAuth();
  const isDeveloper = currentUser?.role === 'developer';
  const isHRAdmin = currentUser?.role === 'hr_admin' || isDeveloper;
  const isMayor = currentUser?.role === 'mayor';
  const isDepartmentHead = currentUser?.role === 'department_head';
  const isDivisionHead = currentUser?.role === 'division_head';
  const isSupervisor = isMayor || isDepartmentHead || isDivisionHead;
  const isPayroll = currentUser?.role === 'payroll';
  const isEncoder = currentUser?.role === 'hr_staff';

  const handleSelect = (tab: HRTab) => {
    onSelectTab(tab);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const NavItem = ({ 
    tab, 
    number, 
    label, 
    icon: Icon, 
    badge 
  }: { 
    tab: HRTab; 
    number: number; 
    label: string; 
    icon: any; 
    badge?: number 
  }) => {
    const isActive = activeTab === tab;
    return (
      <button
        type="button"
        onClick={() => handleSelect(tab)}
        className={`w-full min-h-[42px] flex items-center justify-between px-3 py-2 text-xs rounded-xl font-medium transition-all cursor-pointer ${
          isActive
            ? 'bg-white/20 text-white font-bold shadow-xs'
            : 'text-blue-100 hover:bg-white/10 hover:text-white'
        }`}
      >
        <div className="flex items-center space-x-2.5 min-w-0">
          <span className="text-[10px] font-mono text-blue-300 w-4 shrink-0 text-right">{number}.</span>
          <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-blue-200'}`} />
          <span className="truncate">{label}</span>
        </div>
        {badge !== undefined && badge > 0 && (
          <span className="px-1.5 py-0.2 bg-[#F28C28] text-white text-[10px] font-bold rounded-full ml-1">
            {badge}
          </span>
        )}
      </button>
    );
  };

  const SectionHeader = ({ title }: { title: string }) => (
    <div className="px-3 pt-3 pb-1 text-[10px] font-bold text-blue-200/80 uppercase tracking-wider">
      {title}
    </div>
  );

  const totalLeaveBadge = pendingLeavesCount + pendingWellnessCount;

  const sidebarContent = (
    <>
      <div className="p-3 space-y-0.5 overflow-y-auto max-h-[calc(100vh-8rem)] scrollbar-thin scrollbar-thumb-white/20">
        
        {isSupervisor ? (
          <>
            <SectionHeader title={isMayor ? 'EXECUTIVE' : isDepartmentHead ? 'DEPARTMENT' : 'DIVISION'} />
            <NavItem tab="dashboard" number={1} label="Dashboard" icon={LayoutDashboard} />
            {isDepartmentHead && <NavItem tab="masterlist" number={2} label="Department Personnel" icon={Users} />}
            {isDivisionHead && <NavItem tab="masterlist" number={2} label="Division Personnel" icon={Users} />}
            {isDepartmentHead && <NavItem tab="offices" number={3} label="Division Overview" icon={Building2} />}
            <NavItem tab="leave" number={4} label="Assigned Leave Reviews" icon={FileClock} badge={totalLeaveBadge} />
            <NavItem tab="performance" number={5} label="IPCR Review" icon={TrendingUp} />
            <NavItem tab="reports" number={6} label="Reports" icon={FileSpreadsheet} />
            <NavItem tab="notifications" number={7} label="Notifications" icon={Bell} badge={unreadNotificationsCount} />
          </>
        ) : isPayroll ? (
          <>
            <SectionHeader title="PAYROLL" />
            <NavItem tab="dashboard" number={1} label="Dashboard" icon={LayoutDashboard} />
            <NavItem tab="payroll" number={2} label="Payroll & Payslips" icon={CreditCard} />
            <NavItem tab="reports" number={3} label="Payroll Reports" icon={FileSpreadsheet} />
            <NavItem tab="audit_logs" number={4} label="My Activity" icon={History} />
          </>
        ) : (
          <>
            <SectionHeader title="CORE MODULES" />
            <NavItem tab="dashboard" number={1} label="Dashboard" icon={LayoutDashboard} />
            <NavItem tab="masterlist" number={2} label="Employee Masterlist" icon={Users} />
            <NavItem tab="201_files" number={3} label="201 Files" icon={FolderLock} />
            <NavItem tab="leave" number={4} label="Leave Management" icon={FileClock} badge={totalLeaveBadge} />
            {isHRAdmin && <NavItem tab="saln" number={5} label="SALN Administration" icon={ShieldCheck} />}
            {isHRAdmin && <NavItem tab="payroll" number={6} label="Payroll Monitoring" icon={CreditCard} />}
            {isEncoder && <NavItem tab="requests" number={5} label="Assigned Document Requests" icon={FileText} badge={pendingRequestsCount} />}
            {isHRAdmin && <NavItem tab="travel_orders" number={7} label="Travel Orders" icon={Navigation} />}
            {isHRAdmin && <NavItem tab="pass_slips" number={8} label="Pass Slips" icon={ClipboardList} />}
            {isHRAdmin && <NavItem tab="performance" number={9} label="Performance Management" icon={TrendingUp} />}
            {isHRAdmin && <NavItem tab="offices" number={10} label="Office Directory" icon={Building2} />}
            {isHRAdmin && <NavItem tab="reports" number={11} label="Reports" icon={FileSpreadsheet} />}
            {isHRAdmin && <NavItem tab="users" number={12} label="User Management" icon={Users} />}
            {isHRAdmin && <NavItem tab="audit_logs" number={13} label="Audit Logs" icon={History} />}
            {isDeveloper && <NavItem tab="developer_control" number={14} label="Developer Control" icon={Sparkles} />}
            <NavItem tab="notifications" number={15} label="Notifications" icon={Bell} badge={unreadNotificationsCount} />
          </>
        )}

      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-white/10 bg-black/10 text-[11px] text-blue-200">
        <div className="font-semibold text-white">LGU San Jose HRMIS</div>
        <div className="text-[10px] text-blue-300">Role-based access • Occidental Mindoro</div>
      </div>
    </>
  );

  return (
    <>
      {/* 1. Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-[#173B67] text-white shrink-0 min-h-[calc(100vh-4rem)] flex-col justify-between border-r border-[#122e50]">
        {sidebarContent}
      </aside>

      {/* 2. Mobile Drawer */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div 
            onClick={onCloseMobile}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            aria-hidden="true"
          />

          <div className="fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-[#173B67] text-white shadow-2xl flex flex-col justify-between z-50 animate-in slide-in-from-left duration-250">
            <div className="p-4 bg-[#122e50] border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <img 
                  src="/assets/aistudio/logo-300x293_45c24a73.png" 
                  alt="San Jose Logo" 
                  className="w-8 h-8 object-contain"
                />
                <div>
                  <h3 className="font-bold text-sm text-white">SJHR201 Portal</h3>
                  <span className="text-[10px] text-blue-200">18 Dedicated HR Menus</span>
                </div>
              </div>
              <button
                type="button"
                onClick={onCloseMobile}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center text-blue-200 hover:text-white rounded-xl hover:bg-white/10 cursor-pointer"
                aria-label="Close navigation menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {sidebarContent}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
