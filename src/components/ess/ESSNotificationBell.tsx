import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useData } from '../../context/DataContext.tsx';
import { SystemNotification, NotificationType } from '../../types/index.ts';
import { 
  Bell, 
  CreditCard, 
  Calendar, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Award, 
  ChevronRight, 
  CheckCheck, 
  X,
  Sparkles,
  Clock
} from 'lucide-react';

interface ESSNotificationBellProps {
  variant?: 'banner' | 'navbar';
  onNavigateTab?: (tab: 'overview' | '201_files' | 'requests' | 'leave' | 'wellness' | 'payslips') => void;
}

export const ESSNotificationBell: React.FC<ESSNotificationBellProps> = ({ 
  variant = 'banner',
  onNavigateTab 
}) => {
  const { currentUser, currentEmployee } = useAuth();
  const { notifications, markNotificationRead, markAllNotificationsRead } = useData();
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'payslip' | 'approvals'>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const employeeId = currentUser?.employeeId || currentEmployee?.id || 'EMP-2022-001';

  // Filter notifications relevant to current employee (ESS)
  const employeeNotifs = notifications.filter(n => {
    if (n.recipientEmployeeId && n.recipientEmployeeId === employeeId) return true;
    if (n.recipientRole === 'employee' || n.recipientRole === 'all') return true;
    return false;
  });

  const unreadCount = employeeNotifs.filter(n => !n.isRead).length;

  // Filter by category
  const filteredNotifs = employeeNotifs.filter(n => {
    if (filter === 'unread') return !n.isRead;
    if (filter === 'payslip') return n.type === 'payslip_available';
    if (filter === 'approvals') return n.type === 'leave_update' || n.type === 'wellness_update' || n.type === 'document_request' || n.type === 'ess_request_ready';
    return true;
  });

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleItemClick = (notif: SystemNotification) => {
    markNotificationRead(notif.id);
    if (notif.targetTab && onNavigateTab) {
      onNavigateTab(notif.targetTab);
      setIsOpen(false);
    }
  };

  const getNotifIcon = (type: NotificationType) => {
    switch (type) {
      case 'payslip_available':
        return {
          icon: CreditCard,
          bg: 'bg-emerald-100 text-emerald-700',
          badge: 'PAYSLIP'
        };
      case 'leave_update':
        return {
          icon: Calendar,
          bg: 'bg-amber-100 text-amber-800',
          badge: 'LEAVE STATUS'
        };
      case 'wellness_update':
        return {
          icon: Calendar,
          bg: 'bg-teal-100 text-teal-800',
          badge: 'WELLNESS'
        };
      case 'document_request':
        return {
          icon: AlertCircle,
          bg: 'bg-rose-100 text-rose-700',
          badge: 'ACTION NEEDED'
        };
      case 'ess_request_ready':
        return {
          icon: Award,
          bg: 'bg-blue-100 text-blue-700',
          badge: 'SERVICE READY'
        };
      case 'verification':
        return {
          icon: CheckCircle2,
          bg: 'bg-emerald-100 text-emerald-700',
          badge: 'VERIFIED'
        };
      default:
        return {
          icon: Bell,
          bg: 'bg-slate-100 text-slate-700',
          badge: 'NOTICE'
        };
    }
  };

  const isBanner = variant === 'banner';

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="View Employee Notifications"
        className={`group relative transition-all duration-200 cursor-pointer flex items-center justify-center ${
          isBanner
            ? 'min-h-[44px] min-w-[44px] px-3 py-2 bg-white/20 hover:bg-white/30 active:scale-95 text-white rounded-xl border border-white/30 backdrop-blur-xs shadow-xs'
            : 'min-h-[44px] min-w-[44px] p-2 text-slate-600 hover:text-slate-900 hover:bg-orange-50 rounded-xl border border-slate-200 shadow-2xs'
        }`}
        title={`Notifications (${unreadCount} unread)`}
      >
        <div className="relative flex items-center space-x-1.5">
          <Bell className={`w-5 h-5 transition-transform duration-200 ${unreadCount > 0 ? 'group-hover:rotate-12' : ''}`} />
          {isBanner && (
            <span className="hidden sm:inline text-xs font-bold tracking-wide">
              Alerts
            </span>
          )}
        </div>

        {/* Unread Counter Pill Badge with Pulse */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center">
            <span className="absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75 animate-ping"></span>
            <span className="relative min-w-[18px] h-[18px] px-1 bg-rose-600 text-white rounded-full text-[10px] font-black flex items-center justify-center shadow-xs border-2 border-white">
              {unreadCount}
            </span>
          </span>
        )}
      </button>

      {/* Dropdown Drawer / Popover */}
      {isOpen && (
        <div className="fixed inset-x-2 sm:inset-x-auto sm:absolute sm:right-0 top-16 sm:top-full mt-2 w-[calc(100vw-1rem)] sm:w-[420px] max-w-[440px] bg-white rounded-2xl shadow-2xl border border-orange-100/80 z-50 overflow-hidden animate-in fade-in zoom-in-95 font-sans">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 to-[#F28C28] p-3.5 sm:p-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 bg-white/20 rounded-lg">
                  <Bell className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm tracking-tight leading-none">
                    Personnel Alerts & Updates
                  </h3>
                  <span className="text-[10px] text-orange-100 font-medium">
                    {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-1">
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      markAllNotificationsRead();
                    }}
                    className="px-2 py-1 bg-white/20 hover:bg-white/30 text-white text-[10px] font-bold rounded-lg transition-colors flex items-center space-x-1 cursor-pointer"
                    title="Mark all notifications as read"
                  >
                    <CheckCheck className="w-3 h-3" />
                    <span className="hidden xs:inline">Mark read</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors cursor-pointer"
                  aria-label="Close notifications"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick Filter Tabs */}
            <div className="flex items-center space-x-1 mt-3 pt-2 border-t border-white/20 overflow-x-auto scrollbar-none text-[11px] font-bold">
              {[
                { id: 'all', label: 'All' },
                { id: 'unread', label: `Unread (${unreadCount})` },
                { id: 'payslip', label: 'Payslips' },
                { id: 'approvals', label: 'Requests & Leaves' }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id as any)}
                  className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer shrink-0 ${
                    filter === f.id
                      ? 'bg-white text-[#F28C28] shadow-xs'
                      : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-[380px] sm:max-h-[420px] overflow-y-auto divide-y divide-slate-100 bg-white">
            {filteredNotifs.length === 0 ? (
              <div className="py-10 px-4 text-center space-y-2">
                <div className="w-10 h-10 mx-auto rounded-full bg-orange-50 text-orange-400 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-[#F28C28]" />
                </div>
                <div className="text-xs font-bold text-slate-700">No notifications found</div>
                <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                  {filter === 'unread' 
                    ? 'You have addressed all pending status alerts and requirements.' 
                    : 'Any updates to payslips, document requests, or leave approvals will appear here.'}
                </p>
              </div>
            ) : (
              filteredNotifs.map((notif) => {
                const config = getNotifIcon(notif.type);
                const IconComponent = config.icon;
                return (
                  <div
                    key={notif.id}
                    onClick={() => handleItemClick(notif)}
                    className={`p-3.5 sm:p-4 hover:bg-orange-50/40 transition-colors cursor-pointer group flex items-start space-x-3 ${
                      !notif.isRead ? 'bg-orange-50/20' : 'bg-white'
                    }`}
                  >
                    {/* Icon Category Avatar */}
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-2xs mt-0.5 ${config.bg}`}>
                      <IconComponent className="w-4 h-4" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1.5">
                        <div className="flex items-center space-x-1.5 truncate">
                          <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">
                            {config.badge}
                          </span>
                          {!notif.isRead && (
                            <span className="w-2 h-2 rounded-full bg-[#F28C28] shrink-0 animate-pulse"></span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium shrink-0 flex items-center space-x-0.5">
                          <Clock className="w-2.5 h-2.5 inline mr-0.5" />
                          {new Date(notif.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </span>
                      </div>

                      <h4 className={`text-xs mt-1 leading-snug ${!notif.isRead ? 'font-black text-slate-900' : 'font-bold text-slate-700'}`}>
                        {notif.title}
                      </h4>

                      <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-2 leading-relaxed">
                        {notif.message}
                      </p>

                      {/* Action trigger footer */}
                      <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-100/80">
                        <span className="text-[10px] font-bold text-[#F28C28] group-hover:text-orange-600 flex items-center space-x-1">
                          <span>{notif.actionLabel || 'View Details'}</span>
                          <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                        </span>
                        {!notif.isRead && (
                          <span className="text-[9px] text-slate-400 italic">Tap to open</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer note */}
          <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
            <span className="text-[10px] text-slate-400 font-medium">
              Municipality of San Jose MHRMO • Official Alerts
            </span>
          </div>

        </div>
      )}
    </div>
  );
};
