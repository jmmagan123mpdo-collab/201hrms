import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useData } from '../../context/DataContext.tsx';
import { 
  Bell, 
  LogOut, 
  User, 
  Shield, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Building2,
  ChevronDown,
  Sparkles,
  ExternalLink,
  Menu,
  X
} from 'lucide-react';
import { UserRole } from '../../types/index.ts';

interface HeaderProps {
  onToggleMobileMenu?: () => void;
  isMobileMenuOpen?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobileMenu, isMobileMenuOpen }) => {
  const { currentUser, currentEmployee, logout, quickSwitchRole, activePortal, setActivePortal } = useAuth();
  const { notifications, markNotificationRead, markAllNotificationsRead, isFirebaseConnected } = useData();
  const [showNotifDrawer, setShowNotifDrawer] = useState(false);
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);

  // Context-aware notifications based on active portal & employee profile
  const relevantNotifs = notifications.filter(n => {
    if (activePortal === 'ess' || currentUser?.role === 'employee') {
      const empId = currentUser?.employeeId || currentEmployee?.id || 'EMP-2022-001';
      if (n.recipientEmployeeId && n.recipientEmployeeId === empId) return true;
      if (n.recipientRole === 'employee' || n.recipientRole === 'all') return true;
      return false;
    }
    return n.recipientRole !== 'employee';
  });

  const unreadNotifs = relevantNotifs.filter(n => !n.isRead);

  const getRoleBadge = (role?: UserRole) => {
    switch (role) {
      case 'developer':
        return { label: 'System Developer', bg: 'bg-purple-100 text-purple-800 border-purple-200' };
      case 'hr_admin':
        return { label: 'HR Administrator', bg: 'bg-blue-100 text-blue-900 border-blue-200' };
      case 'hr_staff':
        return { label: 'HR Staff', bg: 'bg-sky-100 text-sky-800 border-sky-200' };
      case 'payroll':
        return { label: 'Payroll Personnel', bg: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
      case 'employee':
        return { label: 'Personnel (ESS)', bg: 'bg-amber-100 text-amber-900 border-amber-200' };
      default:
        return { label: 'Guest', bg: 'bg-gray-100 text-gray-800 border-gray-200' };
    }
  };

  const badge = getRoleBadge(currentUser?.role);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          
          {/* Left: Branding & Logos & Hamburger (Mobile) */}
          <div className="flex items-center space-x-1 sm:space-x-3">
            {activePortal === 'hr' && onToggleMobileMenu && (
              <button
                type="button"
                onClick={onToggleMobileMenu}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center -ml-2 text-slate-700 hover:bg-slate-100 rounded-xl md:hidden transition-colors cursor-pointer"
                aria-label="Toggle Navigation Menu"
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5 text-[#173B67]" />
                ) : (
                  <Menu className="w-5 h-5 text-[#173B67]" />
                )}
              </button>
            )}

            <div 
              className="flex items-center space-x-2 cursor-pointer" 
              onClick={() => setActivePortal(currentUser?.role === 'employee' ? 'ess' : 'hr')}
            >
              <img 
                src="/public/assets/aistudio/logo-300x293_45c24a73.png" 
                alt="San Jose Municipal Seal" 
                className="w-8 h-8 sm:w-10 sm:h-10 object-contain drop-shadow-xs"
              />
              <img 
                src="/public/assets/aistudio/HR1_5214d096.png" 
                alt="MHRMO Logo" 
                className="h-7 sm:h-8 w-auto object-contain hidden sm:block"
              />
            </div>
            
            <div className="border-l border-slate-200 pl-2 sm:pl-3">
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                <span className="font-extrabold text-[#173B67] tracking-tight text-base sm:text-lg">SJHR201</span>
                <span className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full font-semibold border bg-slate-100 text-slate-700">
                  {activePortal === 'ess' ? 'ESS' : 'HR'}
                </span>
                {isFirebaseConnected && (
                  <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1 animate-pulse"></span>
                    Live
                  </span>
                )}
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-500 hidden md:block">
                Municipality of San Jose, Occidental Mindoro
              </p>
            </div>
          </div>

          {/* Right: Quick Role Switcher, Notifications & User Info */}
          <div className="flex items-center space-x-1 sm:space-x-3">
            
            {/* Demo Role Switcher Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
                className="min-h-[44px] px-2.5 py-1.5 flex items-center space-x-1 text-xs font-medium rounded-xl text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-colors cursor-pointer"
                title="Switch test account role"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span className="hidden sm:inline">Role Switcher</span>
                <ChevronDown className="w-3 h-3 text-slate-500" />
              </button>

              {showRoleSwitcher && (
                <div className="fixed sm:absolute inset-x-2 sm:inset-x-auto right-auto sm:right-0 top-14 sm:top-auto sm:mt-2 w-[calc(100vw-1rem)] sm:w-56 bg-white rounded-2xl sm:rounded-xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 flex items-center justify-between">
                    <span>Quick Role Test</span>
                    <button 
                      onClick={() => setShowRoleSwitcher(false)}
                      className="sm:hidden text-slate-400 hover:text-slate-600 p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <button
                    onClick={() => { quickSwitchRole('developer'); setShowRoleSwitcher(false); }}
                    className="w-full text-left px-3 py-2.5 text-xs flex items-center justify-between hover:bg-slate-50 text-purple-900 cursor-pointer min-h-[44px]"
                  >
                    <span>Developer</span>
                    <span className="text-[10px] bg-purple-100 px-1.5 py-0.5 rounded text-purple-700 font-semibold">dev_sanjose</span>
                  </button>
                  <button
                    onClick={() => { quickSwitchRole('hr_admin'); setShowRoleSwitcher(false); }}
                    className="w-full text-left px-3 py-2.5 text-xs flex items-center justify-between hover:bg-slate-50 text-blue-900 cursor-pointer min-h-[44px]"
                  >
                    <span>HR Administrator</span>
                    <span className="text-[10px] bg-blue-100 px-1.5 py-0.5 rounded text-blue-700 font-semibold">hr_admin</span>
                  </button>
                  <button
                    onClick={() => { quickSwitchRole('hr_staff'); setShowRoleSwitcher(false); }}
                    className="w-full text-left px-3 py-2.5 text-xs flex items-center justify-between hover:bg-slate-50 text-sky-900 cursor-pointer min-h-[44px]"
                  >
                    <span>HR Staff (Encoder)</span>
                    <span className="text-[10px] bg-sky-100 px-1.5 py-0.5 rounded text-sky-700 font-semibold">hr_staff</span>
                  </button>
                  <button
                    onClick={() => { quickSwitchRole('payroll'); setShowRoleSwitcher(false); }}
                    className="w-full text-left px-3 py-2.5 text-xs flex items-center justify-between hover:bg-slate-50 text-emerald-900 cursor-pointer min-h-[44px]"
                  >
                    <span>Payroll Personnel</span>
                    <span className="text-[10px] bg-emerald-100 px-1.5 py-0.5 rounded text-emerald-700 font-semibold">payroll_officer</span>
                  </button>
                  <button
                    onClick={() => { quickSwitchRole('employee'); setShowRoleSwitcher(false); }}
                    className="w-full text-left px-3 py-2.5 text-xs flex items-center justify-between hover:bg-slate-50 text-amber-900 border-t border-slate-100 cursor-pointer min-h-[44px]"
                  >
                    <span>Employee (ESS)</span>
                    <span className="text-[10px] bg-amber-100 px-1.5 py-0.5 rounded text-amber-700 font-semibold">msantos</span>
                  </button>
                </div>
              )}
            </div>

            {/* Notifications Button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowNotifDrawer(!showNotifDrawer)}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl relative transition-colors cursor-pointer"
                title="Notifications"
                aria-label="View notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadNotifs.length > 0 && (
                  <span className="absolute top-2 right-2 w-4 h-4 bg-rose-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
                    {unreadNotifs.length}
                  </span>
                )}
              </button>

              {/* Notification Drawer */}
              {showNotifDrawer && (
                <div className="fixed sm:absolute inset-x-2 sm:inset-x-auto right-auto sm:right-0 top-14 sm:top-auto sm:mt-2 w-[calc(100vw-1rem)] sm:w-96 bg-white rounded-2xl sm:rounded-xl shadow-2xl border border-slate-200 py-3 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-800 text-sm block">System Notifications</span>
                      <span className="text-[10px] text-slate-500">{unreadNotifs.length} unread • {relevantNotifs.length} total</span>
                    </div>
                    {unreadNotifs.length > 0 && (
                      <button
                        type="button"
                        onClick={() => markAllNotificationsRead()}
                        className="text-[11px] font-bold text-[#F28C28] hover:text-orange-700 cursor-pointer"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {relevantNotifs.length === 0 ? (
                      <div className="px-4 py-8 text-center text-slate-400 text-xs">
                        No notifications currently.
                      </div>
                    ) : (
                      relevantNotifs.map(notif => (
                        <div
                          key={notif.id}
                          onClick={() => {
                            markNotificationRead(notif.id);
                            if (notif.targetTab && activePortal === 'ess') {
                              setShowNotifDrawer(false);
                            }
                          }}
                          className={`p-3.5 hover:bg-orange-50/30 transition-colors cursor-pointer ${notif.isRead ? 'opacity-75' : 'bg-orange-50/40'}`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <h4 className={`text-xs leading-snug ${!notif.isRead ? 'font-black text-slate-900' : 'font-semibold text-slate-700'}`}>
                              {notif.title}
                            </h4>
                            {!notif.isRead && (
                              <span className="w-2 h-2 rounded-full bg-[#F28C28] shrink-0 mt-1"></span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">{notif.message}</p>
                          <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-100 text-[10px] text-slate-400">
                            <span>
                              {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(notif.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                            </span>
                            {notif.actionLabel && (
                              <span className="text-[#F28C28] font-bold">
                                {notif.actionLabel} &rarr;
                              </span>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Summary */}
            <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-[#173B67] text-white flex items-center justify-center text-xs font-bold shadow-xs">
                {currentUser?.displayName ? currentUser.displayName.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="hidden lg:block text-left">
                <div className="text-xs font-semibold text-slate-800 leading-tight">
                  {currentUser?.displayName || 'User'}
                </div>
                <div className="flex items-center space-x-1.5 mt-0.5">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${badge.bg}`}>
                    {badge.label}
                  </span>
                  {currentUser?.employeeId && (
                    <span className="text-[10px] text-slate-400 font-mono">
                      {currentUser.employeeId}
                    </span>
                  )}
                </div>
              </div>

              {/* Logout Button */}
              <button
                type="button"
                onClick={logout}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                title="Sign Out"
                aria-label="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};
