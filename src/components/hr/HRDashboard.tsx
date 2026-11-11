import React from 'react';
import { useData } from '../../context/DataContext.tsx';
import { HRTab } from './Sidebar.tsx';
import {
  Users,
  UserCheck,
  FolderLock,
  Clock,
  AlertCircle,
  FileText,
  HeartHandshake,
  ShieldCheck,
  PlusCircle,
  Upload,
  ArrowRight,
  TrendingUp,
  Building2,
  Calendar,
} from 'lucide-react';

interface HRDashboardProps {
  onNavigate: (tab: HRTab) => void;
  onOpenAddEmployee: () => void;
  onOpenScanner: () => void;
}

export const HRDashboard: React.FC<HRDashboardProps> = ({
  onNavigate,
  onOpenAddEmployee,
  onOpenScanner
}) => {
  const { 
    employees, 
    documents, 
    requests, 
    essServiceRequests,
    leaveApplications, 
    wellnessApplications, 
    salnRecords, 
    offices 
  } = useData();

  // Metrics from actual Firestore data
  const totalEmployees = employees.length;
  const activePersonnel = employees.filter(e => e.employmentStatus === 'Active' && e.recordStatus === 'Active').length;
  const total201Files = documents.length;
  const verified201Files = documents.filter(d => d.status === 'verified').length;
  
  const pendingRequests = requests.filter(r => r.status === 'requested' || r.status === 'under_review');
  const pendingESSRequests = essServiceRequests.filter(r => r.status === 'pending' || r.status === 'processing');
  const pendingLeaves = leaveApplications.filter(l => l.status.startsWith('pending_'));
  const pendingWellness = wellnessApplications.filter(w => w.status.startsWith('pending_'));
  const pendingSALN = salnRecords.filter(s => s.status === 'pending_submission');
  
  const totalPendingRequests = pendingRequests.length + pendingESSRequests.length;
  const pendingActivities = totalPendingRequests + pendingLeaves.length + pendingWellness.length;

  // Breakdown by classification
  const classificationCounts = {
    Permanent: employees.filter(e => e.classification === 'Permanent').length,
    Temporary: employees.filter(e => e.classification === 'Temporary').length,
    Casual: employees.filter(e => e.classification === 'Casual').length,
    'Job Order': employees.filter(e => e.classification === 'Job Order').length,
    'Contract of Service': employees.filter(e => e.classification === 'Contract of Service').length,
    'Elective Officials': employees.filter(e => e.classification === 'Elective Officials').length,
  };

  return (
    <div className="space-y-6">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#173B67] to-[#1e4c85] rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="text-xs uppercase font-bold text-blue-200 tracking-wider">
            Municipal Human Resource Management Office (MHRMO)
          </div>
          <h2 className="text-2xl font-bold tracking-tight mt-1">
            Human Resource Management Dashboard
          </h2>
          <p className="text-xs text-blue-100 mt-1 max-w-xl">
            Live personnel administration for the Municipality of San Jose, Occidental Mindoro. Real-time 201 records, document compliance, and transaction approvals.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onOpenAddEmployee}
            className="px-3.5 py-2 bg-[#F28C28] hover:bg-[#d9771a] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center space-x-1.5 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Employee</span>
          </button>
          <button
            type="button"
            onClick={onOpenScanner}
            className="px-3.5 py-2 bg-white/20 hover:bg-white/30 text-white text-xs font-bold rounded-xl transition-colors flex items-center space-x-1.5 cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>Scan / Upload 201</span>
          </button>
        </div>
      </div>

      {/* 4 Compact Summary Cards - Side-by-Side 2x2 Grid on Mobile */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        
        {/* Card 1: Total Employees */}
        <div 
          onClick={() => onNavigate('masterlist')}
          className="bg-white p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider truncate">Total Employees</span>
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-blue-50 text-[#173B67] flex items-center justify-center shrink-0">
              <Users className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">{totalEmployees}</div>
            <div className="text-[10px] sm:text-xs text-slate-500 mt-0.5 sm:mt-1 flex items-center space-x-1 truncate">
              <span className="font-semibold text-emerald-600">{activePersonnel} active</span>
              <span className="hidden sm:inline">across {offices.length} offices</span>
            </div>
          </div>
        </div>

        {/* Card 2: Active Personnel */}
        <div 
          onClick={() => onNavigate('masterlist')}
          className="bg-white p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider truncate">Active Personnel</span>
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <UserCheck className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">{activePersonnel}</div>
            <div className="text-[10px] sm:text-xs text-slate-500 mt-0.5 sm:mt-1 truncate">
              {((activePersonnel / (totalEmployees || 1)) * 100).toFixed(0)}% staffing capacity
            </div>
          </div>
        </div>

        {/* Card 3: 201 Files */}
        <div 
          onClick={() => onNavigate('201_files')}
          className="bg-white p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider truncate">201 Files</span>
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-[#DCEBFA] text-[#173B67] flex items-center justify-center shrink-0">
              <FolderLock className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">{total201Files}</div>
            <div className="text-[10px] sm:text-xs text-slate-500 mt-0.5 sm:mt-1 flex items-center space-x-1 truncate">
              <span className="font-semibold text-blue-700">{verified201Files} verified</span>
              <span className="hidden sm:inline">in 15 categories</span>
            </div>
          </div>
        </div>

        {/* Card 4: Pending Activities */}
        <div 
          onClick={() => onNavigate('requests')}
          className="bg-white p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider truncate">Pending Activities</span>
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-[#F28C28]">{pendingActivities}</div>
            <div className="text-[10px] sm:text-xs text-slate-500 mt-0.5 sm:mt-1 truncate">
              {totalPendingRequests} req ({pendingESSRequests.length} ESS) • {pendingLeaves.length} leave • {pendingWellness.length} well
            </div>
          </div>
        </div>

      </div>

      {/* Main Grid: Personnel Classifications & Pending Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2 cols): Classifications & Active Pending Items */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Employment Classification Breakdown */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Employment Classification Summary</h3>
                <p className="text-xs text-slate-500">Distribution of municipal workforce per Civil Service Commission rules</p>
              </div>
              <button 
                onClick={() => onNavigate('masterlist')}
                className="text-xs font-semibold text-[#173B67] hover:underline flex items-center space-x-1"
              >
                <span>View Masterlist</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {Object.entries(classificationCounts).map(([type, count]) => (
                <div key={type} className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                  <span className="text-[11px] font-semibold text-slate-600 block truncate">{type}</span>
                  <div className="text-xl font-bold text-slate-900 mt-1">{count}</div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div 
                      className="bg-[#173B67] h-full rounded-full" 
                      style={{ width: `${(count / (totalEmployees || 1)) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pending Leave & Wellness Applications Table */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Pending HR Transaction Approvals</h3>
                <p className="text-xs text-slate-500">CSC Form 6 Leave filings & Official Wellness Form applications</p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onNavigate('leave')}
                  className="text-xs font-semibold text-blue-700 hover:underline"
                >
                  Leave ({pendingLeaves.length})
                </button>
                <span className="text-slate-300">•</span>
                <button
                  onClick={() => onNavigate('wellness')}
                  className="text-xs font-semibold text-[#F28C28] hover:underline"
                >
                  Wellness ({pendingWellness.length})
                </button>
              </div>
            </div>

            <div className="space-y-2.5">
              {pendingLeaves.length === 0 && pendingWellness.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl">
                  No pending transactions requiring review.
                </div>
              ) : (
                <>
                  {pendingLeaves.map(leave => (
                    <div 
                      key={leave.id}
                      onClick={() => onNavigate('leave')}
                      className="p-3.5 rounded-xl border border-blue-100 bg-blue-50/30 hover:bg-blue-50/70 transition-colors flex items-center justify-between cursor-pointer"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 text-[#173B67] flex items-center justify-center shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-slate-900">{leave.employeeName}</span>
                          <span className="text-[11px] text-slate-500 block">
                            {leave.leaveType} Leave • {leave.workingDays} working days ({leave.inclusiveDates})
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                          {leave.status === 'pending_supervisor' ? 'For Supervisor' : 'For Mayor'}
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-1">{leave.officeName}</span>
                      </div>
                    </div>
                  ))}

                  {pendingWellness.map(well => (
                    <div 
                      key={well.id}
                      onClick={() => onNavigate('wellness')}
                      className="p-3.5 rounded-xl border border-orange-100 bg-orange-50/30 hover:bg-orange-50/70 transition-colors flex items-center justify-between cursor-pointer"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg bg-orange-100 text-[#F28C28] flex items-center justify-center shrink-0">
                          <HeartHandshake className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-slate-900">{well.employeeName}</span>
                          <span className="text-[11px] text-slate-500 block">
                            Form {well.formType}: {well.formType === 'W-01' ? 'Wellness Leave' : 'Wellness Break'} • {well.duration}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-800 border border-orange-200">
                          {well.status === 'pending_supervisor' ? 'Supervisor Review' : 'Head of Agency'}
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-1">{well.officeName}</span>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>

        </div>

        {/* Right Column: SALN Monitoring & Outstanding Document Requests */}
        <div className="space-y-6">
          
          {/* SALN Monitoring Quick Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-indigo-700" />
                <h3 className="font-bold text-slate-900 text-sm">SALN Monitoring</h3>
              </div>
              <button
                onClick={() => onNavigate('saln')}
                className="text-xs font-semibold text-[#173B67] hover:underline"
              >
                Details
              </button>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Statutory annual deadline for sworn SALN submission is April 30.
            </p>

            <div className="mt-4 p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-600 block">Pending Submissions</span>
                <span className="text-2xl font-extrabold text-indigo-900">{pendingSALN.length}</span>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('saln')}
                className="px-3 py-1.5 bg-indigo-900 text-white rounded-lg text-xs font-bold hover:bg-indigo-950 transition-colors"
              >
                Track Offices
              </button>
            </div>
          </div>

          {/* Outstanding Document Requests */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-slate-900 text-sm">Outstanding Document Requests</h3>
              <button
                onClick={() => onNavigate('requests')}
                className="text-xs font-semibold text-[#173B67] hover:underline"
              >
                View All
              </button>
            </div>

            <div className="space-y-2.5">
              {requests.slice(0, 3).map(req => (
                <div 
                  key={req.id}
                  onClick={() => onNavigate('requests')}
                  className="p-3 rounded-xl border border-slate-200/70 hover:bg-slate-50 transition-colors cursor-pointer text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 truncate max-w-[170px]">{req.employeeName}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                      req.status === 'under_review' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {req.status === 'under_review' ? 'Submitted' : 'Pending'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1 line-clamp-1">{req.documentName}</p>
                  <span className="text-[10px] text-slate-400 mt-1 block">Due: {req.dueDate}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
