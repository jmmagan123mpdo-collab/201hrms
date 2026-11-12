import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext.tsx';
import { useAuth } from '../../context/AuthContext.tsx';
import { LeaveApplication, WellnessApplication } from '../../types/index.ts';
import { 
  FileClock, 
  HeartHandshake, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  User, 
  Check, 
  X, 
  Calendar,
  Building2,
  FileText,
  ShieldCheck,
  Printer,
  Eye,
  Filter
} from 'lucide-react';

export const LeaveWellnessManager: React.FC = () => {
  const { 
    leaveApplications, 
    wellnessApplications, 
    processSupervisorLeave, 
    processMayorLeave, 
    processHRFinalLeave,
    processSupervisorWellness, 
    processHeadWellness 
  } = useData();

  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'leave' | 'wellness'>('leave');

  // Approval state
  const [selectedLeave, setSelectedLeave] = useState<LeaveApplication | null>(null);
  const [selectedWellness, setSelectedWellness] = useState<WellnessApplication | null>(null);
  const [remarks, setRemarks] = useState('');
  const [approverName, setApproverName] = useState(currentUser?.displayName || 'Hon. Rey Ladaga');

  // Leave stage filter & Form 6 preview
  const [leaveFilter, setLeaveFilter] = useState<'all' | 'pending_supervisor' | 'pending_mayor' | 'pending_hr_final' | 'approved' | 'disapproved'>('all');
  const [previewForm6Leave, setPreviewForm6Leave] = useState<LeaveApplication | null>(null);

  const displayedLeaves = useMemo(() => {
    if (leaveFilter === 'all') return leaveApplications;
    return leaveApplications.filter(l => l.status === leaveFilter);
  }, [leaveApplications, leaveFilter]);

  const pendingLeaves = leaveApplications.filter(l => l.status.startsWith('pending_'));
  const approvedLeaves = leaveApplications.filter(l => l.status === 'approved');

  const pendingWellness = wellnessApplications.filter(w => w.status.startsWith('pending_'));
  const approvedWellness = wellnessApplications.filter(w => w.status === 'approved');

  return (
    <div className="space-y-4 text-xs">
      
      {/* Top Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Leave & Wellness Transaction Approvals
          </h2>
          <p className="text-xs text-slate-500">
            Official CSC Form 6 Leaves and LGU Wellness Forms W-01 & W-02 multi-tier routing
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab('leave')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center space-x-1.5 ${
              activeTab === 'leave' ? 'bg-[#173B67] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileClock className="w-4 h-4" />
            <span>CSC Form 6 Leaves ({pendingLeaves.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('wellness')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center space-x-1.5 ${
              activeTab === 'wellness' ? 'bg-[#F28C28] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <HeartHandshake className="w-4 h-4" />
            <span>Wellness W-01 & W-02 ({pendingWellness.length})</span>
          </button>
        </div>
      </div>

      {/* TAB 1: CSC FORM 6 LEAVE APPLICATIONS */}
      {activeTab === 'leave' && (
        <div className="space-y-3">
          
          {/* Multi-Tier Workflow Stage Filter Pills */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
            <button
              type="button"
              onClick={() => setLeaveFilter('all')}
              className={`px-3 py-1.5 rounded-full font-bold uppercase tracking-wider shrink-0 transition-colors cursor-pointer ${
                leaveFilter === 'all'
                  ? 'bg-[#173B67] text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              All Applications ({leaveApplications.length})
            </button>

            <button
              type="button"
              onClick={() => setLeaveFilter('pending_supervisor')}
              className={`px-3 py-1.5 rounded-full font-bold uppercase tracking-wider shrink-0 transition-colors cursor-pointer ${
                leaveFilter === 'pending_supervisor'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-amber-700 hover:bg-amber-50'
              }`}
            >
              Stage 2: Supervisor ({leaveApplications.filter(l => l.status === 'pending_supervisor').length})
            </button>

            <button
              type="button"
              onClick={() => setLeaveFilter('pending_mayor')}
              className={`px-3 py-1.5 rounded-full font-bold uppercase tracking-wider shrink-0 transition-colors cursor-pointer ${
                leaveFilter === 'pending_mayor'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-blue-700 hover:bg-blue-50'
              }`}
            >
              Stage 3: Mayor ({leaveApplications.filter(l => l.status === 'pending_mayor').length})
            </button>

            <button
              type="button"
              onClick={() => setLeaveFilter('pending_hr_final')}
              className={`px-3 py-1.5 rounded-full font-bold uppercase tracking-wider shrink-0 transition-colors cursor-pointer ${
                leaveFilter === 'pending_hr_final'
                  ? 'bg-purple-700 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-purple-700 hover:bg-purple-50'
              }`}
            >
              Stage 4 & 5: HR Final Recording ({leaveApplications.filter(l => l.status === 'pending_hr_final').length})
            </button>

            <button
              type="button"
              onClick={() => setLeaveFilter('approved')}
              className={`px-3 py-1.5 rounded-full font-bold uppercase tracking-wider shrink-0 transition-colors cursor-pointer ${
                leaveFilter === 'approved'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-emerald-700 hover:bg-emerald-50'
              }`}
            >
              Approved Archive ({approvedLeaves.length})
            </button>

            <button
              type="button"
              onClick={() => setLeaveFilter('disapproved')}
              className={`px-3 py-1.5 rounded-full font-bold uppercase tracking-wider shrink-0 transition-colors cursor-pointer ${
                leaveFilter === 'disapproved'
                  ? 'bg-rose-700 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-rose-700 hover:bg-rose-50'
              }`}
            >
              Disapproved ({leaveApplications.filter(l => l.status === 'disapproved').length})
            </button>
          </div>

          {/* Mobile Card Layout (Visible on mobile < 768px) */}
          <div className="block md:hidden space-y-3">
            {displayedLeaves.length === 0 ? (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center text-slate-400">
                No leave applications found for this filter.
              </div>
            ) : (
              displayedLeaves.map(leave => (
                <div key={leave.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <span className="font-mono font-bold text-xs text-[#173B67]">{leave.id}</span>
                        <span className="font-bold text-sm text-slate-900">• {leave.leaveType} Leave</span>
                      </div>
                      <h4 className="font-bold text-xs text-slate-800 mt-1">{leave.employeeName}</h4>
                      <span className="text-[11px] text-slate-500">{leave.position} • {leave.officeName}</span>
                    </div>

                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider shrink-0 ${
                      leave.status === 'approved' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                      leave.status === 'disapproved' ? 'bg-rose-100 text-rose-800 border-rose-200' :
                      leave.status === 'pending_hr_final' ? 'bg-purple-100 text-purple-800 border-purple-200 animate-pulse' :
                      leave.status === 'pending_mayor' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                      'bg-amber-100 text-amber-800 border-amber-200'
                    }`}>
                      {leave.status === 'pending_supervisor' ? 'For Supervisor' :
                       leave.status === 'pending_mayor' ? 'For Mayor' :
                       leave.status === 'pending_hr_final' ? 'For HR Final Recording' : leave.status}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl text-[11px] text-slate-600 space-y-1">
                    <div><strong>Dates:</strong> {leave.inclusiveDates} ({leave.workingDays} working days)</div>
                    <div className="line-clamp-2"><strong>Purpose:</strong> {leave.detailsOfLeave}</div>
                  </div>

                  <div className="flex items-center space-x-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setPreviewForm6Leave(leave)}
                      className="flex-1 min-h-[40px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center space-x-1 cursor-pointer border border-slate-300"
                    >
                      <Printer className="w-3.5 h-3.5 text-slate-600" />
                      <span>Form 6 Preview</span>
                    </button>

                    {leave.status.startsWith('pending_') && (
                      <button
                        type="button"
                        onClick={() => { setSelectedLeave(leave); setRemarks(''); }}
                        className="flex-1 min-h-[40px] bg-[#173B67] hover:bg-[#122e50] text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-1 cursor-pointer shadow-xs"
                      >
                        <Check className="w-4 h-4" />
                        <span>Action</span>
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Desktop Table View (Hidden on mobile < 768px) */}
          <div className="hidden md:block bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[#173B67] text-white uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4 font-bold">App ID</th>
                    <th className="py-3 px-4 font-bold">Employee Name</th>
                    <th className="py-3 px-4 font-bold">Office</th>
                    <th className="py-3 px-4 font-bold">Leave Type</th>
                    <th className="py-3 px-4 font-bold">Inclusive Dates</th>
                    <th className="py-3 px-4 font-bold">Workflow Stage</th>
                    <th className="py-3 px-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {displayedLeaves.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-slate-400">
                        No leave applications match this filter.
                      </td>
                    </tr>
                  ) : (
                    displayedLeaves.map(leave => (
                      <tr key={leave.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-800">{leave.id}</td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">{leave.employeeName}</div>
                          <span className="text-[10px] text-slate-400">{leave.position}</span>
                        </td>
                        <td className="py-3.5 px-4 font-medium text-slate-700">{leave.officeName}</td>
                        <td className="py-3.5 px-4 font-semibold text-slate-800">{leave.leaveType}</td>
                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-slate-800 block">{leave.inclusiveDates}</span>
                          <span className="text-[10px] text-slate-500">{leave.workingDays} working days</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${
                            leave.status === 'approved' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                            leave.status === 'disapproved' ? 'bg-rose-100 text-rose-800 border-rose-200' :
                            leave.status === 'pending_hr_final' ? 'bg-purple-100 text-purple-800 border-purple-200 animate-pulse' :
                            leave.status === 'pending_mayor' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                            'bg-amber-100 text-amber-800 border-amber-200'
                          }`}>
                            {leave.status === 'pending_supervisor' ? 'Stage 2: Supervisor' :
                             leave.status === 'pending_mayor' ? 'Stage 3: Mayor' :
                             leave.status === 'pending_hr_final' ? 'Stage 4 & 5: HR Final' : 
                             leave.status === 'approved' ? 'Stage 5: Recorded & Deducted' : leave.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="inline-flex items-center space-x-1.5 justify-end">
                            <button
                              type="button"
                              onClick={() => setPreviewForm6Leave(leave)}
                              title="Print CSC Form 6"
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg cursor-pointer border border-slate-300 flex items-center space-x-1"
                            >
                              <Printer className="w-3.5 h-3.5 text-slate-600" />
                              <span>Form 6</span>
                            </button>

                            {leave.status.startsWith('pending_') ? (
                              <button
                                type="button"
                                onClick={() => { setSelectedLeave(leave); setRemarks(''); }}
                                className={`px-3 py-1 font-bold rounded-lg cursor-pointer text-white shadow-xs ${
                                  leave.status === 'pending_hr_final'
                                    ? 'bg-purple-700 hover:bg-purple-800'
                                    : 'bg-[#173B67] hover:bg-[#122e50]'
                                }`}
                              >
                                {leave.status === 'pending_supervisor' ? 'Supervisor Endorse' :
                                 leave.status === 'pending_mayor' ? 'Mayor Approve' : 'HR Finalize'}
                              </button>
                            ) : (
                              <span className="text-slate-400 text-[11px] font-medium px-2">Archived</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: WELLNESS APPLICATIONS (W-01 & W-02) */}
      {activeTab === 'wellness' && (
        <div className="space-y-3">
          
          {/* Mobile Card Layout (Visible on mobile < 768px) */}
          <div className="block md:hidden space-y-3">
            {wellnessApplications.length === 0 ? (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center text-slate-400">
                No wellness applications filed.
              </div>
            ) : (
              wellnessApplications.map(well => (
                <div key={well.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-[#F28C28]">
                          Form {well.formType}
                        </span>
                        <span className="font-mono font-bold text-xs text-slate-800">{well.id}</span>
                      </div>
                      <h4 className="font-bold text-xs text-slate-800 mt-1">{well.employeeName}</h4>
                      <span className="text-[11px] text-slate-500">{well.position} • {well.officeName}</span>
                    </div>

                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider shrink-0 ${
                      well.status === 'approved' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                      well.status === 'disapproved' ? 'bg-rose-100 text-rose-800 border-rose-200' :
                      'bg-orange-100 text-orange-800 border-orange-200'
                    }`}>
                      {well.status === 'pending_supervisor' ? 'Supervisor Review' :
                       well.status === 'pending_head' ? 'For Mayor / Head' : well.status}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl text-[11px] text-slate-600 space-y-1">
                    <div><strong>Date & Duration:</strong> {well.requestedDate} ({well.duration})</div>
                    <div><strong>Reason:</strong> {well.reason}</div>
                  </div>

                  {well.status.startsWith('pending_') && (
                    <button
                      type="button"
                      onClick={() => { setSelectedWellness(well); setRemarks(''); }}
                      className="w-full min-h-[44px] bg-[#F28C28] hover:bg-[#d9771a] text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-1.5 cursor-pointer shadow-xs"
                    >
                      <Check className="w-4 h-4" />
                      <span>Process Wellness Action</span>
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Desktop Table View (Hidden on mobile < 768px) */}
          <div className="hidden md:block bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[#F28C28] text-white uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4 font-bold">Form Type</th>
                    <th className="py-3 px-4 font-bold">Employee Name</th>
                    <th className="py-3 px-4 font-bold">Office</th>
                    <th className="py-3 px-4 font-bold">Schedule & Duration</th>
                    <th className="py-3 px-4 font-bold">Reason / Objective</th>
                    <th className="py-3 px-4 font-bold">Status</th>
                    <th className="py-3 px-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {wellnessApplications.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-slate-400">
                        No wellness applications filed.
                      </td>
                    </tr>
                  ) : (
                    wellnessApplications.map(well => (
                      <tr key={well.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-[#F28C28]">
                            Form {well.formType}
                          </span>
                          <span className="block text-[10px] text-slate-400 font-normal mt-0.5">{well.id}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">{well.employeeName}</div>
                          <span className="text-[10px] text-slate-400">{well.position}</span>
                        </td>
                        <td className="py-3.5 px-4 font-medium text-slate-700">{well.officeName}</td>
                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-slate-800 block">{well.requestedDate}</span>
                          <span className="text-[10px] text-slate-500">{well.duration}</span>
                        </td>
                        <td className="py-3.5 px-4 max-w-xs">
                          <p className="text-slate-700 truncate">{well.reason}</p>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${
                            well.status === 'approved' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                            well.status === 'disapproved' ? 'bg-rose-100 text-rose-800 border-rose-200' :
                            'bg-orange-100 text-orange-800 border-orange-200'
                          }`}>
                            {well.status === 'pending_supervisor' ? 'Supervisor Review' :
                             well.status === 'pending_head' ? 'For Mayor / Head' : well.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {well.status.startsWith('pending_') ? (
                            <button
                              type="button"
                              onClick={() => { setSelectedWellness(well); setRemarks(''); }}
                              className="px-3 py-1 bg-[#F28C28] hover:bg-[#d9771a] text-white font-bold rounded-lg cursor-pointer"
                            >
                              Process Action
                            </button>
                          ) : (
                            <span className="text-slate-400 text-[11px] font-medium">Completed</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Leave Approval Modal (Mobile Bottom-Sheet / Desktop Centered) */}
      {selectedLeave && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 p-5 sm:p-6 space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="sm:hidden -mt-1 pb-1 flex justify-center">
              <div className="w-10 h-1 bg-slate-300 rounded-full"></div>
            </div>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900">
                {selectedLeave.status === 'pending_supervisor'
                  ? 'Stage 2: Supervisor Recommendation (CSC Form 6)'
                  : selectedLeave.status === 'pending_mayor'
                  ? 'Stage 3: Municipal Mayor Executive Decision'
                  : 'Stage 4 & 5: HR Final Recording & Credit Deduction'}
              </h3>
              <button
                type="button"
                onClick={() => setSelectedLeave(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {selectedLeave.status === 'pending_hr_final' && (
              <div className="p-2.5 bg-purple-50 border border-purple-200 rounded-xl text-[11px] text-purple-900">
                <strong>Civil Service Rule:</strong> Only HR Final Recording deducts leave credits from employee ledger. Mayor and Supervisor endorsements have been validated.
              </div>
            )}
            
            <div className="p-3 bg-slate-50 rounded-xl space-y-1 text-xs">
              <div><strong>Applicant:</strong> {selectedLeave.employeeName} ({selectedLeave.officeName})</div>
              <div><strong>Leave Type:</strong> {selectedLeave.leaveType} Leave</div>
              <div><strong>Dates:</strong> {selectedLeave.inclusiveDates} ({selectedLeave.workingDays} working days)</div>
              <div><strong>Details:</strong> {selectedLeave.detailsOfLeave}</div>
              {selectedLeave.supervisorRemarks && (
                <div className="text-[11px] text-amber-700"><strong>Supervisor Endorsement:</strong> {selectedLeave.supervisorRemarks}</div>
              )}
              {selectedLeave.mayorRemarks && (
                <div className="text-[11px] text-blue-700"><strong>Mayor Directive:</strong> {selectedLeave.mayorRemarks}</div>
              )}
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Acting Officer Name & Designation</label>
              <input
                type="text"
                value={approverName}
                onChange={(e) => setApproverName(e.target.value)}
                className="w-full p-2.5 border rounded-xl"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Assessment / Official Remarks</label>
              <textarea
                rows={2}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="e.g. Approved with pay / Certified complete per CSC MC No. 41 s. 1998"
                className="w-full p-2.5 border rounded-xl"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
              <button
                type="button"
                onClick={() => setSelectedLeave(null)}
                className="min-h-[44px] px-4 py-2 border rounded-xl font-semibold cursor-pointer text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (selectedLeave.status === 'pending_supervisor') {
                    await processSupervisorLeave(selectedLeave.id, 'Disapproved', remarks, approverName);
                  } else if (selectedLeave.status === 'pending_mayor') {
                    await processMayorLeave(selectedLeave.id, 'Disapproved', remarks, approverName);
                  } else {
                    await processHRFinalLeave(selectedLeave.id, 'Disapproved', remarks, approverName);
                  }
                  setSelectedLeave(null);
                }}
                className="min-h-[44px] px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl cursor-pointer"
              >
                Disapprove
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (selectedLeave.status === 'pending_supervisor') {
                    await processSupervisorLeave(selectedLeave.id, 'Approved', remarks, approverName);
                  } else if (selectedLeave.status === 'pending_mayor') {
                    await processMayorLeave(selectedLeave.id, 'Approved', remarks, approverName);
                  } else {
                    await processHRFinalLeave(selectedLeave.id, 'Approved', remarks, approverName);
                  }
                  setSelectedLeave(null);
                }}
                className={`min-h-[44px] px-4 py-2 font-bold rounded-xl cursor-pointer shadow-md text-white ${
                  selectedLeave.status === 'pending_hr_final'
                    ? 'bg-purple-700 hover:bg-purple-800'
                    : 'bg-[#173B67] hover:bg-[#122e50]'
                }`}
              >
                {selectedLeave.status === 'pending_supervisor'
                  ? 'Endorse to Mayor'
                  : selectedLeave.status === 'pending_mayor'
                  ? 'Approve (Send to HR)'
                  : 'Certify & Deduct'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Official CSC Form No. 6 (Revised 2020) Printable Modal */}
      {previewForm6Leave && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full border border-slate-300 p-6 space-y-4 max-h-[92vh] overflow-y-auto font-sans text-xs">
            {/* Modal Actions */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-[#173B67]" />
                <h3 className="font-bold text-sm text-slate-900">
                  Civil Service Commission Form No. 6 (Revised 2020)
                </h3>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 bg-[#173B67] hover:bg-[#122e50] text-white font-bold rounded-xl shadow-xs transition-colors flex items-center space-x-1.5 cursor-pointer text-xs"
                >
                  <Printer className="w-3.5 h-3.5 text-amber-300" />
                  <span>Print CSC Form 6</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewForm6Leave(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Document Printable Sheet */}
            <div className="p-6 bg-white border border-slate-400 rounded-lg space-y-4 shadow-xs">
              {/* CSC Form Header */}
              <div className="text-center space-y-0.5 border-b pb-3">
                <div className="text-[10px] text-slate-500 uppercase tracking-widest font-serif font-bold">
                  Republic of the Philippines
                </div>
                <div className="text-[11px] font-bold text-slate-800">
                  PROVINCE OF OCCIDENTAL MINDORO
                </div>
                <div className="text-sm font-extrabold text-[#173B67] uppercase">
                  MUNICIPALITY OF SAN JOSE
                </div>
                <div className="text-[10px] text-slate-600 font-serif italic pt-1">
                  MUNICIPAL HUMAN RESOURCE MANAGEMENT OFFICE
                </div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-900 pt-2 border-t mt-2">
                  APPLICATION FOR LEAVE (CSC FORM NO. 6, REVISED 2020)
                </div>
                <div className="text-[10px] font-mono text-slate-500">
                  Application Tracking No: {previewForm6Leave.id}
                </div>
              </div>

              {/* Box 1: Personnel Information */}
              <div className="border border-slate-300 p-3 rounded-lg grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-slate-500 uppercase font-semibold text-[9px] block">1. Office / Department</span>
                  <span className="font-bold text-slate-900">{previewForm6Leave.officeName}</span>
                </div>
                <div>
                  <span className="text-slate-500 uppercase font-semibold text-[9px] block">2. Name (Last, First, Middle)</span>
                  <span className="font-bold text-slate-900">{previewForm6Leave.employeeName}</span>
                </div>
                <div>
                  <span className="text-slate-500 uppercase font-semibold text-[9px] block">3. Date of Filing</span>
                  <span className="font-medium text-slate-800">{new Date(previewForm6Leave.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                <div>
                  <span className="text-slate-500 uppercase font-semibold text-[9px] block">4. Position / Salary Grade</span>
                  <span className="font-medium text-slate-800">{previewForm6Leave.position} (Salary Grade 15, Step 1)</span>
                </div>
              </div>

              {/* Box 2: 7.A Details of Application */}
              <div className="border border-slate-300 p-3 rounded-lg space-y-2 text-[11px]">
                <div className="font-bold text-slate-900 border-b pb-1 text-[11px]">
                  7. DETAILS OF APPLICATION
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <span className="text-slate-500 uppercase font-semibold text-[9px] block">7.A Type of Leave to be Availed Of</span>
                    <span className="font-extrabold text-[#173B67] text-xs">{previewForm6Leave.leaveType} Leave</span>
                  </div>
                  <div>
                    <span className="text-slate-500 uppercase font-semibold text-[9px] block">7.B Details of Leave / Specific Purpose</span>
                    <span className="font-medium text-slate-800">{previewForm6Leave.detailsOfLeave}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 uppercase font-semibold text-[9px] block">7.C Number of Working Days Applied For</span>
                    <span className="font-bold text-slate-900">{previewForm6Leave.workingDays} Day(s)</span>
                  </div>
                  <div>
                    <span className="text-slate-500 uppercase font-semibold text-[9px] block">Inclusive Dates</span>
                    <span className="font-bold text-slate-900">{previewForm6Leave.inclusiveDates}</span>
                  </div>
                </div>
              </div>

              {/* Box 3: 7.B Certification of Leave Credits (HR Record) */}
              <div className="border border-slate-300 p-3 rounded-lg space-y-2 text-[11px]">
                <div className="font-bold text-slate-900 border-b pb-1 text-[11px] flex justify-between items-center">
                  <span>7.B CERTIFICATION OF LEAVE CREDITS (MHRMO Recording)</span>
                  <span className="text-[10px] font-normal text-slate-500">As of February 2026</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-[10px] bg-slate-50 p-2 rounded border border-slate-200">
                  <div>
                    <span className="text-slate-500 font-bold uppercase block">Vacation Leave</span>
                    <span className="font-mono font-bold text-slate-900 text-xs">15.000 Days</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-bold uppercase block">Sick Leave</span>
                    <span className="font-mono font-bold text-slate-900 text-xs">14.500 Days</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-bold uppercase block">Special Privilege</span>
                    <span className="font-mono font-bold text-slate-900 text-xs">3.000 Days</span>
                  </div>
                </div>
                <div className="text-right text-[10px] text-slate-500 pt-1">
                  Certified by: <strong>Atty. Maria Elena Castillo</strong>, Municipal HRMO Head
                </div>
              </div>

              {/* Box 4: Multi-Tier Approvals (Section 14 & 15 Invariants) */}
              <div className="border border-slate-300 p-3 rounded-lg grid grid-cols-1 sm:grid-cols-2 gap-4 text-[11px]">
                <div className="border border-slate-200 p-2.5 rounded bg-slate-50/50">
                  <div className="font-bold text-slate-800 text-[10px] uppercase tracking-wide">
                    7.C Recommendation (Immediate Supervisor)
                  </div>
                  <div className="mt-1 text-slate-700">
                    Status: <strong className={previewForm6Leave.supervisorAssessment === 'Approved' ? 'text-emerald-700' : 'text-amber-700'}>
                      {previewForm6Leave.supervisorAssessment || 'Endorsed per schedule'}
                    </strong>
                  </div>
                  <div className="text-[10px] text-slate-500 italic mt-0.5">
                    "{previewForm6Leave.supervisorRemarks || 'No work disruption anticipated.'}"
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-200 text-center font-bold text-slate-900">
                    {previewForm6Leave.supervisorName || 'Engr. Juan Miguel Magan'}
                    <span className="block text-[9px] font-normal text-slate-500">Immediate Supervisor / MPDO Head</span>
                  </div>
                </div>

                <div className="border border-slate-200 p-2.5 rounded bg-slate-50/50">
                  <div className="font-bold text-slate-800 text-[10px] uppercase tracking-wide">
                    7.D Approval (Head of Agency)
                  </div>
                  <div className="mt-1 text-slate-700">
                    Status: <strong className={previewForm6Leave.status === 'approved' || previewForm6Leave.status === 'pending_hr_final' ? 'text-emerald-700' : 'text-blue-700'}>
                      {previewForm6Leave.status === 'approved' || previewForm6Leave.status === 'pending_hr_final' ? 'Approved by Mayor' : 'Under Executive Review'}
                    </strong>
                  </div>
                  <div className="text-[10px] text-slate-500 italic mt-0.5">
                    "{previewForm6Leave.mayorRemarks || 'Approved for public service continuity.'}"
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-200 text-center font-bold text-slate-900">
                    HON. REY P. LADAGA
                    <span className="block text-[9px] font-normal text-slate-500">Municipal Mayor, LGU San Jose</span>
                  </div>
                </div>
              </div>

              {/* Footer Notice */}
              <div className="text-[9px] text-slate-400 text-center pt-2">
                Document digitally verified and authenticated by SJHR201 HRMIS • Municipal Government of San Jose, Occidental Mindoro
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Wellness Approval Modal (Mobile Bottom-Sheet / Desktop Centered) */}
      {selectedWellness && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl max-w-md w-full border border-orange-100 p-5 sm:p-6 space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="sm:hidden -mt-1 pb-1 flex justify-center">
              <div className="w-10 h-1 bg-slate-300 rounded-full"></div>
            </div>
            <h3 className="font-bold text-sm text-slate-900">
              Wellness Action: Form {selectedWellness.formType} ({selectedWellness.formType === 'W-01' ? 'Wellness Leave' : 'Wellness Break'})
            </h3>

            <div className="p-3 bg-orange-50 rounded-xl space-y-1 text-xs">
              <div><strong>Personnel:</strong> {selectedWellness.employeeName}</div>
              <div><strong>Schedule:</strong> {selectedWellness.requestedDate} ({selectedWellness.duration})</div>
              <div><strong>Goal:</strong> {selectedWellness.reason}</div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Remarks</label>
              <textarea
                rows={2}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Endorsement or approval conditions..."
                className="w-full p-2.5 border rounded-xl"
              />
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setSelectedWellness(null)}
                className="min-h-[44px] px-4 py-2 border rounded-xl font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (selectedWellness.status === 'pending_supervisor') {
                    await processSupervisorWellness(selectedWellness.id, remarks, approverName);
                  } else {
                    await processHeadWellness(selectedWellness.id, 'Approved', remarks, approverName);
                  }
                  setSelectedWellness(null);
                }}
                className="min-h-[44px] px-5 py-2.5 bg-[#F28C28] hover:bg-[#d9771a] text-white font-bold rounded-xl cursor-pointer shadow-md"
              >
                Confirm Approval
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
