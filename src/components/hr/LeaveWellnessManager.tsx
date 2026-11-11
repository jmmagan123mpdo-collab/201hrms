import React, { useState } from 'react';
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
  ShieldCheck
} from 'lucide-react';

export const LeaveWellnessManager: React.FC = () => {
  const { 
    leaveApplications, 
    wellnessApplications, 
    processSupervisorLeave, 
    processMayorLeave, 
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
          
          {/* Mobile Card Layout (Visible on mobile < 768px) */}
          <div className="block md:hidden space-y-3">
            {leaveApplications.length === 0 ? (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center text-slate-400">
                No leave applications recorded in system.
              </div>
            ) : (
              leaveApplications.map(leave => (
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
                      'bg-amber-100 text-amber-800 border-amber-200'
                    }`}>
                      {leave.status === 'pending_supervisor' ? 'For Supervisor' :
                       leave.status === 'pending_mayor' ? 'For Mayor' : leave.status}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl text-[11px] text-slate-600 space-y-1">
                    <div><strong>Dates:</strong> {leave.inclusiveDates} ({leave.workingDays} working days)</div>
                    <div className="line-clamp-2"><strong>Purpose:</strong> {leave.detailsOfLeave}</div>
                  </div>

                  {leave.status.startsWith('pending_') && (
                    <button
                      type="button"
                      onClick={() => { setSelectedLeave(leave); setRemarks(''); }}
                      className="w-full min-h-[44px] bg-[#173B67] hover:bg-[#122e50] text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-1.5 cursor-pointer shadow-xs"
                    >
                      <Check className="w-4 h-4" />
                      <span>Process Official Action</span>
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
                <thead className="bg-[#173B67] text-white uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4 font-bold">App ID</th>
                    <th className="py-3 px-4 font-bold">Employee Name</th>
                    <th className="py-3 px-4 font-bold">Office</th>
                    <th className="py-3 px-4 font-bold">Leave Type</th>
                    <th className="py-3 px-4 font-bold">Inclusive Dates</th>
                    <th className="py-3 px-4 font-bold">Status</th>
                    <th className="py-3 px-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {leaveApplications.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-slate-400">
                        No leave applications recorded in system.
                      </td>
                    </tr>
                  ) : (
                    leaveApplications.map(leave => (
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
                            'bg-amber-100 text-amber-800 border-amber-200'
                          }`}>
                            {leave.status === 'pending_supervisor' ? 'For Supervisor' :
                             leave.status === 'pending_mayor' ? 'For Mayor' : leave.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {leave.status.startsWith('pending_') ? (
                            <button
                              type="button"
                              onClick={() => { setSelectedLeave(leave); setRemarks(''); }}
                              className="px-3 py-1 bg-[#173B67] hover:bg-[#122e50] text-white font-bold rounded-lg cursor-pointer"
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
            <h3 className="font-bold text-sm text-slate-900">
              {selectedLeave.status === 'pending_supervisor' ? 'Supervisor Assessment (CSC Form 6)' : 'Head of Agency Decision'}
            </h3>
            
            <div className="p-3 bg-slate-50 rounded-xl space-y-1 text-xs">
              <div><strong>Applicant:</strong> {selectedLeave.employeeName} ({selectedLeave.officeName})</div>
              <div><strong>Leave Type:</strong> {selectedLeave.leaveType} Leave</div>
              <div><strong>Dates:</strong> {selectedLeave.inclusiveDates} ({selectedLeave.workingDays} working days)</div>
              <div><strong>Details:</strong> {selectedLeave.detailsOfLeave}</div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Approver Name & Title</label>
              <input
                type="text"
                value={approverName}
                onChange={(e) => setApproverName(e.target.value)}
                className="w-full p-2.5 border rounded-xl"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Assessment Remarks</label>
              <textarea
                rows={2}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="e.g. Endorsed with substitute employee assigned."
                className="w-full p-2.5 border rounded-xl"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
              <button
                type="button"
                onClick={() => setSelectedLeave(null)}
                className="min-h-[44px] px-4 py-2 border rounded-xl font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (selectedLeave.status === 'pending_supervisor') {
                    await processSupervisorLeave(selectedLeave.id, 'Disapproved', remarks, approverName);
                  } else {
                    await processMayorLeave(selectedLeave.id, 'Disapproved', remarks, approverName);
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
                  } else {
                    await processMayorLeave(selectedLeave.id, 'Approved', remarks, approverName);
                  }
                  setSelectedLeave(null);
                }}
                className="min-h-[44px] px-4 py-2 bg-[#173B67] hover:bg-[#122e50] text-white font-bold rounded-xl cursor-pointer shadow-md"
              >
                Approve Leave
              </button>
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
