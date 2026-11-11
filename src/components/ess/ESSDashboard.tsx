import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useData } from '../../context/DataContext.tsx';
import { 
  FolderLock, 
  FileText, 
  HeartHandshake, 
  Upload, 
  Camera, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Calendar,
  CreditCard,
  ChevronDown,
  ChevronRight,
  Eye,
  Download,
  PlusCircle,
  FileCheck2,
  Building2,
  User,
  ShieldCheck,
  Send,
  X,
  Award,
  TrendingUp,
  Printer,
  Bell
} from 'lucide-react';
import { LeaveApplication, WellnessApplication, ESSDocumentServiceRequest, ESSRequestType } from '../../types/index.ts';
import { CreateESSRequestModal } from './CreateESSRequestModal.tsx';
import { CertificatePreviewModal } from './CertificatePreviewModal.tsx';
import { PayslipHistoryView } from './PayslipHistoryView.tsx';
import { ESSNotificationBell } from './ESSNotificationBell.tsx';

interface ESSDashboardProps {
  onOpenScanner: (docType?: string, docName?: string, categoryId?: string) => void;
}

export const ESSDashboard: React.FC<ESSDashboardProps> = ({ onOpenScanner }) => {
  const { currentUser, currentEmployee } = useAuth();
  const { 
    categories, 
    documents, 
    requests, 
    essServiceRequests,
    submitDocumentResponse,
    leaveApplications, 
    submitLeaveApplication,
    wellnessApplications, 
    submitWellnessApplication,
    notifications 
  } = useData();

  const [activeTab, setActiveTab] = useState<'overview' | '201_files' | 'requests' | 'leave' | 'wellness' | 'payslips'>('overview');
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({ 'cat-01': true });

  // ESS Service Request State (COE, Payslip, IPCR, etc.)
  const [showCreateRequestModal, setShowCreateRequestModal] = useState(false);
  const [createRequestInitialType, setCreateRequestInitialType] = useState<ESSRequestType>('COE');
  const [selectedCertificate, setSelectedCertificate] = useState<ESSDocumentServiceRequest | null>(null);
  const [requestsSubTab, setRequestsSubTab] = useState<'service_requests' | 'submission_orders'>('service_requests');
  const [serviceRequestFilter, setServiceRequestFilter] = useState<'all' | 'pending' | 'processing' | 'ready' | 'released'>('all');

  // Leave Form State
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaveType, setLeaveType] = useState<any>('Vacation');
  const [leaveDetails, setLeaveDetails] = useState('');
  const [leaveDays, setLeaveDays] = useState(1);
  const [leaveDates, setLeaveDates] = useState('');

  // Wellness Form State
  const [showWellnessModal, setShowWellnessModal] = useState(false);
  const [wellnessFormType, setWellnessFormType] = useState<'W-01' | 'W-02'>('W-01');
  const [wellnessReason, setWellnessReason] = useState('');
  const [wellnessDetails, setWellnessDetails] = useState('');
  const [wellnessDate, setWellnessDate] = useState('');
  const [wellnessDuration, setWellnessDuration] = useState('1 Working Day');

  // Filter items for current logged-in employee
  const employeeId = currentUser?.employeeId || currentEmployee?.id || 'EMP-2022-001';
  const employeeName = currentUser?.displayName || 'Municipal Employee';

  const myDocuments = documents.filter(d => d.employeeId === employeeId && d.privacy === 'employee_accessible');
  const myRequests = requests.filter(r => r.employeeId === employeeId);
  const myServiceRequests = essServiceRequests.filter(r => r.employeeId === employeeId);
  const myLeaves = leaveApplications.filter(l => l.employeeId === employeeId);
  const myWellness = wellnessApplications.filter(w => w.employeeId === employeeId);

  // Employee Notifications (Document requests, payslips, leave approvals)
  const employeeNotifs = notifications.filter(n => {
    if (n.recipientEmployeeId && n.recipientEmployeeId === employeeId) return true;
    if (n.recipientRole === 'employee' || n.recipientRole === 'all') return true;
    return false;
  });
  const unreadNotifs = employeeNotifs.filter(n => !n.isRead);

  // Document Stats
  const verifiedCount = myDocuments.filter(d => d.status === 'verified').length;
  const pendingReviewCount = myDocuments.filter(d => d.status === 'for_review').length;
  const missingCount = myDocuments.filter(d => d.status === 'missing_required').length;

  const toggleCategory = (catId: string) => {
    setExpandedCategories(prev => ({ ...prev, [catId]: !prev[catId] }));
  };

  const handleFileLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentEmployee) return;

    await submitLeaveApplication({
      employeeId: currentEmployee.id,
      employeeName: `${currentEmployee.firstName} ${currentEmployee.lastName}`,
      officeName: currentEmployee.officeName,
      position: currentEmployee.position,
      leaveType,
      detailsOfLeave: leaveDetails,
      workingDays: Number(leaveDays),
      inclusiveDates: leaveDates,
      commutation: 'Not Requested'
    });

    setShowLeaveModal(false);
    setLeaveDetails('');
    setLeaveDates('');
  };

  const handleFileWellness = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentEmployee) return;

    await submitWellnessApplication({
      formType: wellnessFormType,
      employeeId: currentEmployee.id,
      employeeName: `${currentEmployee.firstName} ${currentEmployee.lastName}`,
      officeName: currentEmployee.officeName,
      position: currentEmployee.position,
      reason: wellnessReason,
      activityDetails: wellnessDetails,
      requestedDate: wellnessDate,
      duration: wellnessDuration
    });

    setShowWellnessModal(false);
    setWellnessReason('');
    setWellnessDetails('');
    setWellnessDate('');
  };

  return (
    <div className="min-h-screen bg-orange-50/20 font-sans pb-24 md:pb-12">
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-4 sm:space-y-6">
        
        {/* ESS Top Personnel Banner with Orange Theme (#F28C28) */}
        <div className="bg-gradient-to-r from-[#F28C28] to-[#ea580c] rounded-2xl p-4 sm:p-6 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center text-lg sm:text-xl font-bold shadow-inner shrink-0">
              {employeeName.charAt(0)}
            </div>
            <div>
              <div className="text-[10px] sm:text-[11px] font-bold text-orange-100 uppercase tracking-widest flex items-center space-x-1.5">
                <span>Employee Self-Service (ESS)</span>
                <span>•</span>
                <span className="font-mono">{currentEmployee?.classification || 'Personnel'}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight mt-0.5">{employeeName}</h2>
              <div className="text-[11px] sm:text-xs text-orange-100/90 mt-1 flex flex-wrap items-center gap-x-2 sm:gap-x-3 gap-y-1">
                <span>{currentEmployee?.position || 'Municipal Staff'}</span>
                <span>•</span>
                <span>{currentEmployee?.officeName || "Mayor's Office"}</span>
                <span>•</span>
                <span className="font-mono bg-black/10 px-1.5 sm:px-2 py-0.5 rounded text-[10px]">
                  ID: {employeeId}
                </span>
                <span className="font-mono bg-black/10 px-1.5 sm:px-2 py-0.5 rounded text-[10px]">
                  Emp#: {currentEmployee?.employeeNumber || 'SJ-PERM-0142'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons & Persistent Notification Bell */}
          <div className="w-full md:w-auto flex flex-wrap items-center justify-between sm:justify-end gap-1.5 sm:gap-2 shrink-0">
            {/* Persistent Notification Bell in ESS Header */}
            <ESSNotificationBell 
              variant="banner" 
              onNavigateTab={(tab) => setActiveTab(tab)} 
            />

            <div className="grid grid-cols-3 sm:flex items-center gap-1.5 sm:gap-2 flex-1 sm:flex-initial">
              <button
                type="button"
                onClick={() => onOpenScanner()}
                className="py-2.5 px-2 sm:px-3 bg-white text-[#F28C28] hover:bg-orange-50 text-[11px] sm:text-xs font-bold rounded-xl shadow-xs transition-colors flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-1.5 cursor-pointer text-center min-h-[44px]"
              >
                <Camera className="w-4 h-4 shrink-0" />
                <span>Scanner</span>
              </button>
              <button
                type="button"
                onClick={() => setShowLeaveModal(true)}
                className="py-2.5 px-2 sm:px-3 bg-white/20 hover:bg-white/30 text-white text-[11px] sm:text-xs font-bold rounded-xl transition-colors flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-1.5 cursor-pointer text-center min-h-[44px]"
              >
                <Calendar className="w-4 h-4 shrink-0" />
                <span>Leave</span>
              </button>
              <button
                type="button"
                onClick={() => setShowWellnessModal(true)}
                className="py-2.5 px-2 sm:px-3 bg-white/20 hover:bg-white/30 text-white text-[11px] sm:text-xs font-bold rounded-xl transition-colors flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-1.5 cursor-pointer text-center min-h-[44px]"
              >
                <HeartHandshake className="w-4 h-4 shrink-0" />
                <span>Wellness</span>
              </button>
            </div>
          </div>
        </div>

        {/* Persistent Unread Alert Pill Banner (If any unread notifications exist) */}
        {unreadNotifs.length > 0 && (
          <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50/60 border border-orange-200/80 rounded-2xl p-3 sm:p-3.5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center space-x-2.5 min-w-0">
              <span className="relative flex h-3 w-3 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-600"></span>
              </span>
              <div className="min-w-0">
                <span className="text-[9px] font-black uppercase tracking-wider text-orange-900 bg-orange-200/80 px-1.5 py-0.5 rounded font-mono mr-1.5 inline-block">
                  {unreadNotifs[0].type === 'payslip_available' ? 'PAYSLIP ALERT' : unreadNotifs[0].type === 'leave_update' ? 'LEAVE UPDATE' : 'HR ALERT'}
                </span>
                <span className="text-xs font-bold text-slate-900 align-middle">
                  {unreadNotifs[0].title}
                </span>
                <span className="text-xs text-slate-600 hidden md:inline ml-1.5">
                  — {unreadNotifs[0].message}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                if (unreadNotifs[0].targetTab) {
                  setActiveTab(unreadNotifs[0].targetTab);
                }
              }}
              className="self-end sm:self-center px-3 py-1.5 bg-[#F28C28] hover:bg-[#ea580c] text-white text-xs font-bold rounded-xl transition-all shadow-2xs flex items-center space-x-1 cursor-pointer shrink-0 min-h-[36px]"
            >
              <span>{unreadNotifs[0].actionLabel || 'View Update'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* ESS Navigation Rendered as Interactive Tiles (Side-by-Side 2-col on Mobile, 3-col on Tablet, 6-col on Desktop) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
          {[
            { 
              id: 'overview', 
              label: 'Overview', 
              subtitle: 'Summary & Stats',
              icon: User,
              badge: undefined,
              urgent: false
            },
            { 
              id: '201_files', 
              label: 'My 201 Files', 
              subtitle: `${myDocuments.length} files (${verifiedCount} verified)`,
              icon: FolderLock, 
              badge: `${verifiedCount} ok`,
              urgent: false
            },
            { 
              id: 'requests', 
              label: 'HR Requests', 
              subtitle: myRequests.filter(r => r.status === 'requested').length > 0 
                ? `${myRequests.filter(r => r.status === 'requested').length} Action Required` 
                : 'All cleared',
              icon: FileText, 
              badge: myRequests.filter(r => r.status === 'requested').length > 0 
                ? `${myRequests.filter(r => r.status === 'requested').length} req` 
                : undefined,
              urgent: myRequests.filter(r => r.status === 'requested').length > 0
            },
            { 
              id: 'leave', 
              label: 'Leave Applications', 
              subtitle: `${myLeaves.length} CSC-6 records`,
              icon: Calendar, 
              badge: myLeaves.length > 0 ? `${myLeaves.length}` : undefined,
              urgent: false
            },
            { 
              id: 'wellness', 
              label: 'Wellness Forms', 
              subtitle: `${myWellness.length} W-01/02 filed`,
              icon: HeartHandshake, 
              badge: myWellness.length > 0 ? `${myWellness.length}` : undefined,
              urgent: false
            },
            { 
              id: 'payslips', 
              label: 'Payslip History', 
              subtitle: 'Feb 2026 (₱32,699)',
              icon: CreditCard, 
              badge: 'New',
              urgent: false
            }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`relative p-3 sm:p-3.5 rounded-2xl text-left transition-all duration-200 cursor-pointer flex flex-col justify-between min-h-[82px] sm:min-h-[92px] group ${
                  isActive
                    ? 'bg-gradient-to-br from-[#F28C28] to-[#ea580c] text-white shadow-md ring-2 ring-orange-300 scale-[1.01]'
                    : 'bg-white hover:bg-orange-50/40 text-slate-700 border border-slate-200/90 hover:border-orange-200 shadow-2xs hover:shadow-xs'
                }`}
              >
                {/* Tile Header: Icon & Badge */}
                <div className="flex items-center justify-between w-full">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                    isActive 
                      ? 'bg-white/25 text-white shadow-inner' 
                      : 'bg-orange-50 text-[#F28C28] group-hover:bg-orange-100'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>

                  {tab.urgent ? (
                    <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-rose-600 text-white animate-pulse shadow-2xs">
                      Action
                    </span>
                  ) : tab.badge ? (
                    <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                      isActive 
                        ? 'bg-white text-[#F28C28]' 
                        : 'bg-slate-100 text-slate-600 group-hover:bg-orange-100 group-hover:text-orange-900'
                    }`}>
                      {tab.badge}
                    </span>
                  ) : null}
                </div>

                {/* Tile Body: Title & Context Subtitle */}
                <div className="mt-2.5">
                  <h4 className={`text-xs font-black tracking-tight leading-snug line-clamp-1 ${
                    isActive ? 'text-white' : 'text-slate-900 group-hover:text-[#F28C28]'
                  }`}>
                    {tab.label}
                  </h4>
                  <p className={`text-[10px] mt-0.5 truncate leading-tight ${
                    isActive ? 'text-orange-100' : 'text-slate-500'
                  }`}>
                    {tab.subtitle}
                  </p>
                </div>

                {/* Active Indicator Underline Pill */}
                {isActive && (
                  <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-6 h-1 rounded-full bg-white/80"></div>
                )}
              </button>
            );
          })}
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-4 sm:space-y-6">
            
            {/* Quick Summary Cards - Side-by-Side 4 Tiles (2x2 on Mobile, 4-col on Desktop) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
              <button
                type="button"
                onClick={() => setActiveTab('201_files')}
                className="bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-orange-100 shadow-xs flex flex-col justify-between text-left hover:border-orange-300 transition-colors cursor-pointer"
              >
                <div>
                  <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider block truncate">201 Docs</span>
                  <div className="text-lg sm:text-2xl font-black text-slate-900 mt-1 sm:mt-1.5 truncate">{myDocuments.length} files</div>
                  <div className="text-[10px] sm:text-xs text-emerald-600 font-semibold mt-0.5 truncate">
                    {verifiedCount} verified
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('requests')}
                className="bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-orange-100 shadow-xs flex flex-col justify-between text-left hover:border-orange-300 transition-colors cursor-pointer"
              >
                <div>
                  <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider block truncate">Action Needed</span>
                  <div className="text-lg sm:text-2xl font-black text-[#F28C28] mt-1 sm:mt-1.5 truncate">
                    {myRequests.filter(r => r.status === 'requested').length} req
                  </div>
                  <div className="text-[10px] sm:text-xs text-slate-500 mt-0.5 truncate">
                    Pending submissions
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('leave')}
                className="bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-orange-100 shadow-xs flex flex-col justify-between text-left hover:border-orange-300 transition-colors cursor-pointer"
              >
                <div>
                  <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider block truncate">Leave & Well</span>
                  <div className="text-lg sm:text-2xl font-black text-slate-900 mt-1 sm:mt-1.5 truncate">
                    {myLeaves.length + myWellness.length} filings
                  </div>
                  <div className="text-[10px] sm:text-xs text-slate-500 mt-0.5 truncate">
                    CSC-6 & W-01/02
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('payslips')}
                className="bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-emerald-100 shadow-xs flex flex-col justify-between text-left hover:border-emerald-300 transition-colors cursor-pointer group"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] sm:text-xs font-bold text-emerald-700 uppercase tracking-wider block truncate">Payslip History</span>
                    <CreditCard className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  </div>
                  <div className="text-lg sm:text-2xl font-black text-emerald-700 mt-1 sm:mt-1.5 truncate">
                    ₱{(currentEmployee?.monthlySalary ? Math.round(currentEmployee.monthlySalary + 2000 - (currentEmployee.monthlySalary * 0.165 + 100)) : 32699).toLocaleString()}
                  </div>
                  <div className="text-[10px] sm:text-xs text-emerald-600 font-semibold mt-0.5 truncate flex items-center space-x-1">
                    <span>Latest: Feb 2026</span>
                    <span className="text-[10px] text-slate-400">• View all &rarr;</span>
                  </div>
                </div>
              </button>
            </div>

            {/* Active Requests Callout */}
            {myRequests.filter(r => r.status === 'requested').length > 0 && (
              <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-4 sm:p-5 shadow-xs">
                <div className="flex items-center space-x-2 text-orange-900 font-bold text-xs sm:text-sm mb-2">
                  <AlertCircle className="w-5 h-5 text-[#F28C28] shrink-0" />
                  <span>Pending Document Requests from HR Office</span>
                </div>
                <div className="space-y-2">
                  {myRequests.filter(r => r.status === 'requested').map(req => (
                    <div key={req.id} className="bg-white p-3.5 sm:p-4 rounded-xl border border-orange-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div>
                        <h4 className="font-bold text-xs text-slate-900">{req.documentName}</h4>
                        <p className="text-xs text-slate-600 mt-0.5">{req.instructions}</p>
                        <span className="text-[11px] text-rose-600 font-semibold mt-1 block">
                          Due Date: {req.dueDate}
                        </span>
                      </div>
                      <div className="w-full sm:w-auto">
                        <button
                          type="button"
                          onClick={() => onOpenScanner(req.documentTypeCode, req.documentName, req.categoryId)}
                          className="w-full sm:w-auto px-4 py-2 bg-[#F28C28] hover:bg-[#d9771a] text-white text-xs font-bold rounded-xl shadow-xs flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                        >
                          <Camera className="w-3.5 h-3.5" />
                          <span>Scan / Upload Now</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Filings */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-xs">
              <h3 className="font-bold text-xs sm:text-sm text-slate-900 mb-3">Recent Leave & Wellness Submissions</h3>
              <div className="space-y-2.5">
                {[...myLeaves, ...myWellness].length === 0 ? (
                  <div className="text-center py-6 text-xs text-slate-400">
                    No recent leave or wellness applications filed.
                  </div>
                ) : (
                  [...myLeaves, ...myWellness].slice(0, 4).map((item: any) => (
                    <div key={item.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                      <div className="flex items-center space-x-2.5 sm:space-x-3">
                        <div className="w-8 h-8 rounded-lg bg-orange-100 text-[#F28C28] flex items-center justify-center font-bold text-xs shrink-0">
                          {item.leaveType ? 'LV' : item.formType}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900 line-clamp-1">
                            {item.leaveType ? `${item.leaveType} Leave (${item.workingDays}d)` : `Form ${item.formType}: ${item.formType === 'W-01' ? 'Wellness Leave' : 'Wellness Break'}`}
                          </div>
                          <span className="text-[10px] sm:text-[11px] text-slate-500 block">
                            {item.inclusiveDates || item.requestedDate}
                          </span>
                        </div>
                      </div>
                      <span className={`text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider shrink-0 ${
                        item.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                        item.status === 'disapproved' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {item.status.replace('_', ' ')}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: MY 201 PERSONNEL FILES (Mobile Responsive Stacking) */}
        {activeTab === '201_files' && (
          <div className="space-y-3 sm:space-y-4">
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900">201 Personnel Documents</h3>
                <p className="text-xs text-slate-500">
                  CSC Form 212, appointment papers, TOR, training certificates, and clearances.
                </p>
              </div>
              <button
                type="button"
                onClick={() => onOpenScanner()}
                className="w-full sm:w-auto px-4 py-2.5 bg-[#F28C28] hover:bg-[#d9771a] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <Camera className="w-4 h-4" />
                <span>Scan New Document</span>
              </button>
            </div>

            <div className="space-y-3">
              {categories.map(cat => {
                const accessibleTypes = cat.documentTypes.filter(t => t.privacy === 'employee_accessible');
                if (accessibleTypes.length === 0) return null;

                const isExpanded = !!expandedCategories[cat.id];

                return (
                  <div key={cat.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
                    <button
                      type="button"
                      onClick={() => toggleCategory(cat.id)}
                      className="w-full px-4 py-3 bg-slate-50 hover:bg-slate-100/70 transition-colors flex items-center justify-between text-left cursor-pointer"
                    >
                      <div className="flex items-center space-x-2">
                        {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
                        <span className="font-bold text-xs text-slate-800">{cat.name}</span>
                      </div>
                      <span className="text-[10px] sm:text-[11px] text-slate-500 font-medium shrink-0">
                        {accessibleTypes.length} types
                      </span>
                    </button>

                    {isExpanded && (
                      <div className="p-3 sm:p-4 divide-y divide-slate-100">
                        {accessibleTypes.map(docType => {
                          const docRecord = documents.find(d => 
                            d.employeeId === employeeId && 
                            d.categoryId === cat.id && 
                            d.documentTypeCode === docType.code
                          );

                          const isVerified = docRecord?.status === 'verified';
                          const isForReview = docRecord?.status === 'for_review';
                          const isReturned = docRecord?.status === 'returned';

                          return (
                            <div key={docType.code} className="py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
                              <div>
                                <div className="flex items-center space-x-1.5 flex-wrap">
                                  <span className="text-xs font-bold text-slate-900">{docType.name}</span>
                                  {docType.isRequiredFor.includes(currentEmployee?.classification || 'Permanent') && (
                                    <span className="text-[9px] bg-rose-50 text-rose-700 border border-rose-200 px-1.5 py-0.2 rounded font-bold uppercase">
                                      Required
                                    </span>
                                  )}
                                </div>
                                {docRecord?.fileName && (
                                  <span className="text-[10px] sm:text-[11px] text-slate-500 block font-mono mt-0.5">
                                    File: {docRecord.fileName} • v{docRecord.version}
                                  </span>
                                )}
                              </div>

                              <div className="w-full sm:w-auto flex items-center justify-between sm:justify-end space-x-2 shrink-0 pt-1 sm:pt-0">
                                {isVerified ? (
                                  <span className="inline-flex items-center space-x-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>Verified</span>
                                  </span>
                                ) : isForReview ? (
                                  <span className="inline-flex items-center space-x-1 px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-xs font-bold">
                                    <Clock className="w-3.5 h-3.5" />
                                    <span>In Review</span>
                                  </span>
                                ) : isReturned ? (
                                  <span className="inline-flex items-center space-x-1 px-2.5 py-1 bg-orange-50 text-orange-700 border border-orange-200 rounded-lg text-xs font-bold">
                                    <AlertCircle className="w-3.5 h-3.5" />
                                    <span>Returned</span>
                                  </span>
                                ) : (
                                  <span className="text-xs text-slate-400 font-medium">Missing</span>
                                )}

                                <button
                                  type="button"
                                  onClick={() => onOpenScanner(docType.code, docType.name, cat.id)}
                                  className="px-3 py-1.5 text-xs font-bold text-[#F28C28] hover:bg-orange-50 border border-orange-200 rounded-xl transition-colors cursor-pointer flex items-center space-x-1"
                                >
                                  <Camera className="w-3.5 h-3.5" />
                                  <span>{docRecord ? 'Update' : 'Scan'}</span>
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB: REQUESTS (TWO-WAY: ESS Document & Service Requests + HR Document Submissions) */}
        {activeTab === 'requests' && (
          <div className="space-y-4">
            
            {/* Header & New Request Action */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Document & Service Requests</h3>
                <p className="text-xs text-slate-500">
                  Request Certificate of Employment (COE), certified payslips, IPCR ratings, and track MHRMO approvals.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setCreateRequestInitialType('COE');
                  setShowCreateRequestModal(true);
                }}
                className="w-full sm:w-auto px-4 py-2.5 bg-[#F28C28] hover:bg-[#d9771a] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Request Document / Certificate</span>
              </button>
            </div>

            {/* Quick 1-Tap Document Request Shortcut Tiles (Side-by-side tiles on mobile) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => {
                  setCreateRequestInitialType('COE');
                  setShowCreateRequestModal(true);
                }}
                className="bg-white p-3 rounded-xl border border-slate-200 hover:border-[#F28C28] shadow-xs text-left transition-all group cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                  <Award className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-slate-900 leading-tight">Request COE</div>
                <span className="text-[10px] text-slate-500 block truncate mt-0.5">With/Without salary</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setCreateRequestInitialType('PAYSLIP');
                  setShowCreateRequestModal(true);
                }}
                className="bg-white p-3 rounded-xl border border-slate-200 hover:border-[#F28C28] shadow-xs text-left transition-all group cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-slate-900 leading-tight">Request Payslip</div>
                <span className="text-[10px] text-slate-500 block truncate mt-0.5">Certified monthly copy</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setCreateRequestInitialType('IPCR');
                  setShowCreateRequestModal(true);
                }}
                className="bg-white p-3 rounded-xl border border-slate-200 hover:border-[#F28C28] shadow-xs text-left transition-all group cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-slate-900 leading-tight">Request IPCR</div>
                <span className="text-[10px] text-slate-500 block truncate mt-0.5">Performance rating cert</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setCreateRequestInitialType('SERVICE_RECORD');
                  setShowCreateRequestModal(true);
                }}
                className="bg-white p-3 rounded-xl border border-slate-200 hover:border-[#F28C28] shadow-xs text-left transition-all group cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-slate-900 leading-tight">Service Record</div>
                <span className="text-[10px] text-slate-500 block truncate mt-0.5">CSC Form 126 history</span>
              </button>
            </div>

            {/* Sub-Tabs: My Requests to HR vs HR Orders to Me */}
            <div className="flex border-b border-slate-200">
              <button
                type="button"
                onClick={() => setRequestsSubTab('service_requests')}
                className={`py-2 px-3 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center space-x-1.5 ${
                  requestsSubTab === 'service_requests'
                    ? 'border-[#F28C28] text-[#F28C28]'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <span>My Requests to HR (COE, Payslip, IPCR...)</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-orange-100 text-[#F28C28] font-bold">
                  {myServiceRequests.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setRequestsSubTab('submission_orders')}
                className={`py-2 px-3 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center space-x-1.5 ${
                  requestsSubTab === 'submission_orders'
                    ? 'border-[#F28C28] text-[#F28C28]'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <span>HR Submission Orders</span>
                {myRequests.filter(r => r.status === 'requested').length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-100 text-rose-700 font-bold">
                    {myRequests.filter(r => r.status === 'requested').length}
                  </span>
                )}
              </button>
            </div>

            {/* SUBTAB 1: My Requests to HR */}
            {requestsSubTab === 'service_requests' && (
              <div className="space-y-3">
                
                {/* Filter Pills */}
                <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
                  {['all', 'pending', 'processing', 'ready', 'released'].map(f => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setServiceRequestFilter(f as any)}
                      className={`px-3 py-1 rounded-full font-bold uppercase tracking-wider shrink-0 transition-colors cursor-pointer ${
                        serviceRequestFilter === f
                          ? 'bg-[#173B67] text-white shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {f === 'all' ? 'All Requests' : f}
                    </button>
                  ))}
                </div>

                {/* Request List */}
                <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-xs">
                  {myServiceRequests.filter(r => serviceRequestFilter === 'all' || r.status === serviceRequestFilter).length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-400">
                      No document requests match this filter. Click "+ Request Document" to request COE, Payslip, IPCR, etc.
                    </div>
                  ) : (
                    myServiceRequests
                      .filter(r => serviceRequestFilter === 'all' || r.status === serviceRequestFilter)
                      .map(req => {
                        const isReady = req.status === 'ready' || req.status === 'released';
                        return (
                          <div key={req.id} className="p-3.5 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2 flex-wrap">
                                <span className="font-mono text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                                  {req.trackingNumber || req.id}
                                </span>
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-[#173B67]">
                                  {req.requestType}
                                </span>
                                <span className="text-xs font-bold text-slate-900">{req.title}</span>
                              </div>
                              <p className="text-xs text-slate-600">
                                <span className="font-medium text-slate-500">Purpose:</span> {req.purpose}
                              </p>
                              {req.periodCovered && (
                                <span className="text-[11px] text-slate-500 block">
                                  Period: <span className="font-semibold text-slate-700">{req.periodCovered}</span>
                                </span>
                              )}
                              <div className="text-[10px] text-slate-400 flex items-center space-x-2 pt-0.5">
                                <span>Requested: {new Date(req.submittedAt).toLocaleDateString()}</span>
                                <span>•</span>
                                <span>Preference: {req.deliveryPreference}</span>
                                <span>•</span>
                                <span>{req.copies} {req.copies === 1 ? 'copy' : 'copies'}</span>
                              </div>
                              {req.hrRemarks && (
                                <div className="mt-1.5 p-2 bg-blue-50/70 border border-blue-100 rounded-lg text-[11px] text-[#173B67]">
                                  <strong>MHRMO Note:</strong> {req.hrRemarks}
                                </div>
                              )}
                            </div>

                            <div className="w-full sm:w-auto flex flex-col sm:items-end space-y-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-slate-100">
                              <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider text-center ${
                                req.status === 'ready' ? 'bg-emerald-100 text-emerald-800 ring-2 ring-emerald-300 animate-pulse' :
                                req.status === 'released' ? 'bg-emerald-100 text-emerald-800' :
                                req.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                                req.status === 'declined' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                              }`}>
                                {req.status === 'ready' ? 'Ready for Download / Pickup' :
                                 req.status === 'processing' ? 'Processing by MHRMO' :
                                 req.status === 'released' ? 'Released' :
                                 req.status === 'declined' ? 'Declined' : 'Pending Review'}
                              </span>

                              {isReady && (
                                <button
                                  type="button"
                                  onClick={() => setSelectedCertificate(req)}
                                  className="w-full sm:w-auto px-3.5 py-2 bg-[#173B67] hover:bg-[#122e50] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>View & Download Official Certificate</span>
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })
                  )}
                </div>
              </div>
            )}

            {/* SUBTAB 2: HR Submission Orders */}
            {requestsSubTab === 'submission_orders' && (
              <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-xs">
                {myRequests.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400">
                    No active document submission orders from HR.
                  </div>
                ) : (
                  myRequests.map(req => (
                    <div key={req.id} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                            {req.id}
                          </span>
                          <span className="text-xs font-bold text-slate-900">{req.documentName}</span>
                          {req.isRequired && (
                            <span className="text-[9px] bg-rose-50 text-rose-700 border border-rose-200 px-1.5 py-0.2 rounded font-bold uppercase">
                              Required
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 mt-1">{req.instructions}</p>
                        <span className="text-[11px] text-rose-600 font-semibold mt-1 block">
                          Due Date: {req.dueDate}
                        </span>
                      </div>

                      <div className="w-full sm:w-auto flex items-center justify-between sm:justify-end space-x-2 shrink-0">
                        <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                          req.status === 'verified' ? 'bg-emerald-100 text-emerald-800' :
                          req.status === 'under_review' ? 'bg-blue-100 text-blue-800' :
                          req.status === 'returned' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {req.status.replace('_', ' ')}
                        </span>

                        <button
                          type="button"
                          onClick={() => onOpenScanner(req.documentTypeCode, req.documentName, req.categoryId)}
                          className="px-3.5 py-2 bg-[#F28C28] hover:bg-[#d9771a] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center space-x-1.5 cursor-pointer"
                        >
                          <Camera className="w-3.5 h-3.5" />
                          <span>Scan / Upload Now</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

          </div>
        )}

        {/* TAB: PAYSLIP HISTORY */}
        {activeTab === 'payslips' && (
          <PayslipHistoryView />
        )}

        {/* TAB 3: LEAVE APPLICATIONS (CSC FORM 6) */}
        {activeTab === 'leave' && (
          <div className="space-y-3 sm:space-y-4">
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Application for Leave (CSC Form 6)</h3>
                <p className="text-xs text-slate-500">
                  Routing to Immediate Supervisor, Municipal Mayor, and HR Recording.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowLeaveModal(true)}
                className="w-full sm:w-auto px-4 py-2 bg-[#F28C28] hover:bg-[#d9771a] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>New Leave Application</span>
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-xs">
              {myLeaves.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  You have not submitted any leave applications yet.
                </div>
              ) : (
                myLeaves.map(leave => (
                  <div key={leave.id} className="p-3.5 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-xs text-[#173B67]">{leave.id}</span>
                        <span className="text-xs font-bold text-slate-900">{leave.leaveType} Leave</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">{leave.detailsOfLeave}</p>
                      <span className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 block">
                        Inclusive Dates: {leave.inclusiveDates} ({leave.workingDays} working days)
                      </span>
                    </div>

                    <div className="text-right self-end sm:self-center">
                      <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        leave.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                        leave.status === 'disapproved' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {leave.status === 'pending_supervisor' ? 'Pending Supervisor' :
                         leave.status === 'pending_mayor' ? 'Pending Mayor' : leave.status}
                      </span>
                      {leave.supervisorRemarks && (
                        <span className="text-[10px] text-slate-500 block mt-1">
                          Supv: {leave.supervisorRemarks}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 4: WELLNESS FORMS (W-01 & W-02) */}
        {activeTab === 'wellness' && (
          <div className="space-y-3 sm:space-y-4">
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900">LGU San Jose Wellness Program</h3>
                <p className="text-xs text-slate-500">
                  Form W-01 (Wellness Leave) & Form W-02 (Wellness Break Request)
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowWellnessModal(true)}
                className="w-full sm:w-auto px-4 py-2 bg-[#F28C28] hover:bg-[#d9771a] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>File Wellness Form</span>
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-xs">
              {myWellness.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  No wellness applications filed. You can apply for Form W-01 (Leave) or Form W-02 (Break).
                </div>
              ) : (
                myWellness.map(well => (
                  <div key={well.id} className="p-3.5 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-[#F28C28]">
                          Form {well.formType}
                        </span>
                        <span className="font-mono font-bold text-xs text-slate-800">{well.id}</span>
                        <span className="text-xs font-bold text-slate-900">
                          {well.formType === 'W-01' ? 'Wellness Leave' : 'Wellness Break'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">Reason: {well.reason}</p>
                      <span className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 block">
                        Schedule: {well.requestedDate} • Duration: {well.duration}
                      </span>
                    </div>

                    <div className="text-right self-end sm:self-center">
                      <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        well.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                        well.status === 'disapproved' ? 'bg-rose-100 text-rose-800' : 'bg-orange-100 text-orange-800'
                      }`}>
                        {well.status === 'pending_supervisor' ? 'Pending Supervisor' :
                         well.status === 'pending_head' ? 'Pending Head of Agency' : well.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

      </div>

      {/* Leave Application Modal (CSC Form 6) - Mobile responsive bottom sheet / modal */}
      {showLeaveModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 sm:fade-in">
            <div className="bg-[#173B67] px-5 py-4 text-white flex items-center justify-between shrink-0">
              <h3 className="text-sm font-bold">CSC Form 6 – Application for Leave</h3>
              <button onClick={() => setShowLeaveModal(false)} className="text-slate-300 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleFileLeave} className="p-5 overflow-y-auto space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Type of Leave</label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl bg-white"
                >
                  <option value="Vacation">Vacation Leave (Sec. 51, Rule XVI, Omnibus Rules)</option>
                  <option value="Mandatory/Forced">Mandatory / Forced Leave</option>
                  <option value="Sick">Sick Leave (Sec. 43)</option>
                  <option value="Maternity">Maternity Leave (RA 11210)</option>
                  <option value="Paternity">Paternity Leave (RA 8187)</option>
                  <option value="Special Privilege">Special Privilege Leave</option>
                  <option value="Solo Parent">Solo Parent Leave (RA 8972)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Details of Leave / Specific Purpose</label>
                <textarea
                  required
                  rows={2}
                  value={leaveDetails}
                  onChange={(e) => setLeaveDetails(e.target.value)}
                  placeholder="e.g. Medical consultation, personal emergency, vacation within PH"
                  className="w-full p-2.5 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Working Days</label>
                  <input
                    type="number"
                    min={1}
                    max={60}
                    value={leaveDays}
                    onChange={(e) => setLeaveDays(Number(e.target.value))}
                    className="w-full p-2.5 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Inclusive Dates</label>
                  <input
                    type="text"
                    required
                    value={leaveDates}
                    onChange={(e) => setLeaveDates(e.target.value)}
                    placeholder="e.g. Mar 3 - Mar 5, 2026"
                    className="w-full p-2.5 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end space-x-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowLeaveModal(false)}
                  className="px-4 py-2.5 border rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#F28C28] hover:bg-[#d9771a] text-white font-bold rounded-xl shadow-md cursor-pointer"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Wellness Application Modal (W-01 & W-02) - Mobile responsive bottom sheet / modal */}
      {showWellnessModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl max-w-lg w-full border border-orange-100 overflow-hidden max-h-[92vh] flex flex-col animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 sm:fade-in">
            <div className="bg-[#F28C28] px-5 py-4 text-white flex items-center justify-between shrink-0">
              <h3 className="text-sm font-bold">LGU Wellness Application Form</h3>
              <button onClick={() => setShowWellnessModal(false)} className="text-orange-100 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleFileWellness} className="p-5 overflow-y-auto space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Official Form</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => { setWellnessFormType('W-01'); setWellnessDuration('1 Working Day'); }}
                    className={`p-2.5 rounded-xl border text-left cursor-pointer ${wellnessFormType === 'W-01' ? 'border-[#F28C28] bg-orange-50 font-bold text-[#F28C28]' : 'border-slate-200'}`}
                  >
                    Form W-01
                    <span className="block text-[10px] font-normal text-slate-500">Wellness Leave (Full Day)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setWellnessFormType('W-02'); setWellnessDuration('2 Hours (3:00 PM - 5:00 PM)'); }}
                    className={`p-2.5 rounded-xl border text-left cursor-pointer ${wellnessFormType === 'W-02' ? 'border-[#F28C28] bg-orange-50 font-bold text-[#F28C28]' : 'border-slate-200'}`}
                  >
                    Form W-02
                    <span className="block text-[10px] font-normal text-slate-500">Wellness Break (Short Session)</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Reason / Wellness Goal</label>
                <input
                  type="text"
                  required
                  value={wellnessReason}
                  onChange={(e) => setWellnessReason(e.target.value)}
                  placeholder="e.g. Physical fitness, preventive health check"
                  className="w-full p-2.5 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Activity Details & Venue</label>
                <textarea
                  required
                  rows={2}
                  value={wellnessDetails}
                  onChange={(e) => setWellnessDetails(e.target.value)}
                  placeholder="e.g. Municipal gymnasium physical conditioning"
                  className="w-full p-2.5 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Requested Date</label>
                  <input
                    type="text"
                    required
                    value={wellnessDate}
                    onChange={(e) => setWellnessDate(e.target.value)}
                    placeholder="e.g. Feb 20, 2026"
                    className="w-full p-2.5 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Duration</label>
                  <input
                    type="text"
                    required
                    value={wellnessDuration}
                    onChange={(e) => setWellnessDuration(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end space-x-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowWellnessModal(false)}
                  className="px-4 py-2.5 border rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#F28C28] hover:bg-[#d9771a] text-white font-bold rounded-xl shadow-md cursor-pointer"
                >
                  Submit Wellness Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ESS Fixed Mobile Bottom Navigation Bar (Visible only on mobile md:hidden) */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-orange-200/90 shadow-2xl z-40 px-1 py-1 flex items-center justify-around h-16">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`flex-1 min-h-[48px] flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all cursor-pointer ${
            activeTab === 'overview' ? 'text-[#F28C28] bg-orange-50/80 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <User className="w-4 h-4" />
          <span className="text-[10px] mt-0.5 tracking-tight">Overview</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('201_files')}
          className={`flex-1 min-h-[48px] flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all cursor-pointer ${
            activeTab === '201_files' ? 'text-[#F28C28] bg-orange-50/80 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <FolderLock className="w-4 h-4" />
          <span className="text-[10px] mt-0.5 tracking-tight">201 Files</span>
        </button>

        {/* Center Raised Camera Button */}
        <button
          type="button"
          onClick={() => onOpenScanner()}
          className="flex-1 min-h-[48px] flex flex-col items-center justify-center -mt-4 cursor-pointer"
          aria-label="Scan Document with Camera"
        >
          <div className="w-12 h-12 rounded-full bg-[#F28C28] hover:bg-[#ea580c] text-white flex items-center justify-center shadow-lg transition-transform active:scale-95 border-2 border-white">
            <Camera className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-bold text-[#F28C28] mt-0.5">Scan Doc</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('requests')}
          className={`flex-1 min-h-[48px] flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all relative cursor-pointer ${
            activeTab === 'requests' ? 'text-[#F28C28] bg-orange-50/80 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span className="text-[10px] mt-0.5 tracking-tight">Requests</span>
          {myRequests.filter(r => r.status === 'requested').length > 0 && (
            <span className="absolute top-1 right-3 w-4 h-4 bg-rose-600 text-white rounded-full text-[9px] font-bold flex items-center justify-center shadow-xs">
              {myRequests.filter(r => r.status === 'requested').length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('leave')}
          className={`flex-1 min-h-[48px] flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all cursor-pointer ${
            activeTab === 'leave' || activeTab === 'wellness' ? 'text-[#F28C28] bg-orange-50/80 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span className="text-[10px] mt-0.5 tracking-tight">Leave/Well</span>
        </button>
      </nav>

      {/* Create ESS Document & Service Request Modal (COE, Payslip, IPCR, etc.) */}
      <CreateESSRequestModal
        isOpen={showCreateRequestModal}
        onClose={() => setShowCreateRequestModal(false)}
        initialType={createRequestInitialType}
      />

      {/* Official Certificate / Document Viewer Modal */}
      <CertificatePreviewModal
        isOpen={!!selectedCertificate}
        onClose={() => setSelectedCertificate(null)}
        request={selectedCertificate}
      />

    </div>
  );
};
