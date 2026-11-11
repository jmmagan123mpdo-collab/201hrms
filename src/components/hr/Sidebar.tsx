import React from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import {
  LayoutDashboard,
  Users,
  UserSquare2,
  FolderLock,
  FileCheck2,
  FileText,
  FileInput,
  FileClock,
  HeartHandshake,
  Navigation,
  CreditCard,
  Building2,
  History,
  Settings,
  ShieldCheck,
  Award,
  TrendingUp,
  FileSpreadsheet,
  Wallet,
  Sparkles,
  ClipboardList,
  X
} from 'lucide-react';

export type HRTab = 
  | 'dashboard'
  | 'masterlist'
  | 'profiles'
  | '201_files'
  | 'requests'
  | 'verification'
  | 'migration'
  | 'leave'
  | 'wellness'
  | 'travel_orders'
  | 'pass_slips'
  | 'coe'
  | 'other_requests'
  | 'overtime'
  | 'payroll'
  | 'payslips'
  | 'training'
  | 'performance'
  | 'reports_employees'
  | 'reports_201_compliance'
  | 'saln'
  | 'reports_transactions'
  | 'users'
  | 'offices'
  | 'audit_logs'
  | 'settings'
  | 'developer_control';

interface SidebarProps {
  activeTab: HRTab;
  onSelectTab: (tab: HRTab) => void;
  pendingRequestsCount?: number;
  pendingLeavesCount?: number;
  pendingWellnessCount?: number;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  pendingRequestsCount = 0,
  pendingLeavesCount = 0,
  pendingWellnessCount = 0,
  isOpenMobile = false,
  onCloseMobile
}) => {
  const { currentUser } = useAuth();
  const isDeveloper = currentUser?.role === 'developer';
  const isHRAdmin = currentUser?.role === 'hr_admin' || isDeveloper;
  const isPayroll = currentUser?.role === 'payroll';

  const handleSelect = (tab: HRTab) => {
    onSelectTab(tab);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const NavItem = ({ tab, label, icon: Icon, badge }: { tab: HRTab; label: string; icon: any; badge?: number }) => {
    const isActive = activeTab === tab;
    return (
      <button
        type="button"
        onClick={() => handleSelect(tab)}
        className={`w-full min-h-[44px] flex items-center justify-between px-3 py-2.5 text-xs rounded-xl font-medium transition-all cursor-pointer ${
          isActive
            ? 'bg-white/20 text-white font-bold shadow-xs'
            : 'text-blue-100 hover:bg-white/10 hover:text-white'
        }`}
      >
        <div className="flex items-center space-x-2.5 min-w-0">
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
    <div className="px-3 pt-4 pb-1 text-[10px] font-bold text-blue-200/80 uppercase tracking-wider">
      {title}
    </div>
  );

  const sidebarContent = (
    <>
      <div className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-8rem)] scrollbar-thin scrollbar-thumb-white/20">
        
        {/* OVERVIEW */}
        <SectionHeader title="OVERVIEW" />
        <NavItem tab="dashboard" label="Dashboard" icon={LayoutDashboard} />

        {/* EMPLOYEE RECORDS */}
        <SectionHeader title="EMPLOYEE RECORDS" />
        <NavItem tab="masterlist" label="Employee Masterlist" icon={Users} />
        <NavItem tab="201_files" label="201 Files" icon={FolderLock} />

        {/* DOCUMENT MANAGEMENT */}
        <SectionHeader title="DOCUMENT MANAGEMENT" />
        <NavItem tab="requests" label="Document Requests" icon={FileText} badge={pendingRequestsCount} />
        <NavItem tab="verification" label="Document Verification" icon={FileCheck2} />
        <NavItem tab="migration" label="Migration Center" icon={FileInput} />

        {/* HR TRANSACTIONS */}
        <SectionHeader title="HR TRANSACTIONS" />
        <NavItem tab="leave" label="Leave Management" icon={FileClock} badge={pendingLeavesCount} />
        <NavItem tab="wellness" label="Wellness Leave / Break" icon={HeartHandshake} badge={pendingWellnessCount} />
        <NavItem tab="travel_orders" label="Travel Orders" icon={Navigation} />
        <NavItem tab="pass_slips" label="Pass Slips" icon={ClipboardList} />
        <NavItem tab="coe" label="Certificate of Employment" icon={Award} />
        <NavItem tab="other_requests" label="Other HR Requests" icon={FileText} />

        {/* HR OPERATIONS */}
        <SectionHeader title="HR OPERATIONS" />
        <NavItem tab="overtime" label="Overtime" icon={History} />
        <NavItem tab="payroll" label="Payroll" icon={Wallet} />
        <NavItem tab="payslips" label="Payslips" icon={CreditCard} />
        <NavItem tab="training" label="Training & Development" icon={Award} />
        <NavItem tab="performance" label="Performance Management" icon={TrendingUp} />

        {/* REPORTS */}
        <SectionHeader title="REPORTS" />
        <NavItem tab="reports_employees" label="Employee Reports" icon={FileSpreadsheet} />
        <NavItem tab="reports_201_compliance" label="201 Files Compliance" icon={FolderLock} />
        <NavItem tab="saln" label="SALN Monitoring" icon={ShieldCheck} />
        <NavItem tab="reports_transactions" label="HR Transaction Reports" icon={FileText} />

        {/* ADMINISTRATION */}
        <SectionHeader title="ADMINISTRATION" />
        {isHRAdmin && <NavItem tab="users" label="User Management" icon={Users} />}
        <NavItem tab="offices" label="Offices" icon={Building2} />
        {isHRAdmin && <NavItem tab="audit_logs" label="Audit Logs" icon={History} />}
        {isHRAdmin && <NavItem tab="settings" label="Settings" icon={Settings} />}

        {/* DEVELOPER SYSTEM CONTROL CENTER (Developer Exclusive) */}
        {isDeveloper && (
          <>
            <SectionHeader title="DEVELOPER SPECIAL" />
            <NavItem 
              tab="developer_control" 
              label="System Control Center" 
              icon={Sparkles} 
            />
          </>
        )}

      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-white/10 bg-black/10 text-[11px] text-blue-200">
        <div className="font-semibold text-white">LGU San Jose HRMIS</div>
        <div className="text-[10px] text-blue-300">Municipal Hall, Occidental Mindoro</div>
      </div>
    </>
  );

  return (
    <>
      {/* 1. Desktop Sidebar (hidden on mobile, visible on md and up) */}
      <aside className="hidden md:flex w-64 bg-[#173B67] text-white shrink-0 min-h-[calc(100vh-4rem)] flex-col justify-between border-r border-[#122e50]">
        {sidebarContent}
      </aside>

      {/* 2. Mobile Drawer & Backdrop (only on mobile screens) */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div 
            onClick={onCloseMobile}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            aria-hidden="true"
          />

          {/* Drawer Panel */}
          <div className="fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-[#173B67] text-white shadow-2xl flex flex-col justify-between z-50 animate-in slide-in-from-left duration-250">
            {/* Mobile Drawer Top Banner */}
            <div className="p-4 bg-[#122e50] border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <img 
                  src="/public/assets/aistudio/logo-300x293_45c24a73.png" 
                  alt="San Jose Logo" 
                  className="w-8 h-8 object-contain"
                />
                <div>
                  <h3 className="font-bold text-sm text-white">SJHR201 Portal</h3>
                  <span className="text-[10px] text-blue-200">HR Navigation Menu</span>
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

            {/* Modules List */}
            <div className="flex-1 overflow-y-auto">
              {sidebarContent}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
