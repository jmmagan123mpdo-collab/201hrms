import React, { useState } from 'react';
import { InteractiveEmailMessage, LeaveApplication } from '../../types/index.ts';
import { 
  X, 
  Mail, 
  Send, 
  CheckCircle2, 
  Clock, 
  User, 
  ShieldCheck, 
  Printer, 
  Building2, 
  FileText, 
  ExternalLink,
  ChevronRight,
  Inbox,
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
  Sparkles
} from 'lucide-react';

interface InteractiveEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  emails: InteractiveEmailMessage[];
  leaveApplications: LeaveApplication[];
  onSupervisorAction: (leaveId: string, decision: 'Approved' | 'Disapproved', remarks: string, approverName: string) => Promise<void>;
  onMayorAction: (leaveId: string, decision: 'Approved' | 'Disapproved', remarks: string, mayorName: string) => Promise<void>;
  onOpenPrintModal?: (leave: LeaveApplication) => void;
}

export const InteractiveEmailModal: React.FC<InteractiveEmailModalProps> = ({
  isOpen,
  onClose,
  emails,
  leaveApplications,
  onSupervisorAction,
  onMayorAction,
  onOpenPrintModal
}) => {
  const [selectedEmailId, setSelectedEmailId] = useState<string>(emails[0]?.id || '');
  const [remarksInput, setRemarksInput] = useState('');
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const currentEmail = emails.find(e => e.id === selectedEmailId) || emails[0];
  const relatedLeave = currentEmail ? leaveApplications.find(l => l.id === currentEmail.leaveId) : null;

  const handleExecuteSupervisorApproval = async () => {
    if (!currentEmail || !relatedLeave) return;
    setIsProcessing(true);
    try {
      await onSupervisorAction(
        currentEmail.leaveId,
        'Approved',
        remarksInput || 'Endorsed for approval. Office work assignments duly covered.',
        'Engr. Juan Miguel Magan (MPDO Head)'
      );
      setActionSuccessMessage('Supervisor Endorsement recorded! Interactive email automatically dispatched to Municipal Mayor (juanmig488@gmail.com).');
      setTimeout(() => setActionSuccessMessage(null), 5000);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExecuteMayorApproval = async () => {
    if (!currentEmail || !relatedLeave) return;
    setIsProcessing(true);
    try {
      await onMayorAction(
        currentEmail.leaveId,
        'Approved',
        remarksInput || 'Approved for public service continuity.',
        'HON. REY P. LADAGA (Municipal Mayor)'
      );
      setActionSuccessMessage('Mayor Executive Approval recorded! Form saved in app database for HR Final Verification & Recording.');
      setTimeout(() => setActionSuccessMessage(null), 5000);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in font-sans text-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full border border-slate-300 flex flex-col h-[90vh] overflow-hidden">
        
        {/* Top Window Bar */}
        <div className="px-5 py-3.5 bg-[#173B67] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-amber-300">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-sm text-white">LGU San Jose Interactive Email Dispatcher</h3>
                <span className="px-2 py-0.2 bg-emerald-500/20 text-emerald-300 text-[10px] font-bold rounded-full border border-emerald-400/30">
                  Live Automated Workflow
                </span>
              </div>
              <p className="text-[11px] text-blue-200">
                Simulated GovMail inbox delivering interactive action buttons to Supervisor, Mayor, and Employee
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-blue-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Success Toast Banner */}
        {actionSuccessMessage && (
          <div className="bg-emerald-600 text-white px-4 py-2.5 text-xs font-bold flex items-center justify-between shrink-0 animate-in slide-in-from-top">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-200" />
              <span>{actionSuccessMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setActionSuccessMessage(null)}
              className="text-emerald-200 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Content Area: Two-Pane Mail Client Layout */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          
          {/* Left Pane: Email List (Outbox / Inbox) */}
          <div className="w-full md:w-80 bg-slate-50 border-r border-slate-200 flex flex-col shrink-0 overflow-y-auto">
            <div className="p-3 bg-white border-b border-slate-200 flex items-center justify-between">
              <span className="font-bold text-slate-800 uppercase text-[10px] tracking-wider">
                Automated Dispatches ({emails.length})
              </span>
              <span className="text-[10px] text-slate-400">Chronological</span>
            </div>

            <div className="divide-y divide-slate-100 flex-1 overflow-y-auto">
              {emails.length === 0 ? (
                <div className="p-6 text-center text-slate-400">
                  No automated emails dispatched yet. File an online leave form in ESS to trigger the workflow.
                </div>
              ) : (
                emails.map(email => {
                  const isSelected = (currentEmail?.id === email.id);
                  const isSupervisor = email.recipientRole === 'supervisor';
                  const isMayor = email.recipientRole === 'mayor';
                  const isEmployee = email.recipientRole === 'employee';

                  return (
                    <button
                      key={email.id}
                      type="button"
                      onClick={() => {
                        setSelectedEmailId(email.id);
                        setRemarksInput('');
                      }}
                      className={`w-full p-3.5 text-left transition-colors cursor-pointer flex flex-col space-y-1 ${
                        isSelected
                          ? 'bg-blue-50/80 border-l-4 border-[#173B67]'
                          : 'hover:bg-slate-100/80 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded ${
                          isSupervisor ? 'bg-amber-100 text-amber-800' :
                          isMayor ? 'bg-blue-100 text-[#173B67]' :
                          'bg-emerald-100 text-emerald-800'
                        }`}>
                          {isSupervisor ? 'To: Supervisor' : isMayor ? 'To: Mayor' : 'To: Employee'}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(email.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <div className="font-bold text-slate-900 text-xs truncate">
                        {email.toEmail}
                      </div>

                      <div className="text-[11px] text-slate-600 line-clamp-2 leading-tight">
                        {email.subject}
                      </div>

                      <div className="text-[10px] text-slate-400 pt-0.5">
                        Applicant: {email.employeeName} ({email.leaveType})
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Pane: Selected Email View with Interactive Action Card */}
          <div className="flex-1 bg-white flex flex-col overflow-y-auto p-4 sm:p-6">
            {currentEmail ? (
              <div className="space-y-4 max-w-3xl">
                
                {/* Email Header */}
                <div className="border-b border-slate-200 pb-3 space-y-1">
                  <h2 className="text-base font-extrabold text-slate-900 leading-snug">
                    {currentEmail.subject}
                  </h2>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 pt-1">
                    <div>
                      <span className="font-semibold text-slate-700">From:</span> SJHR201 Automated Mailer &lt;notifications@sanjose.gov.ph&gt;
                    </div>
                    <div>
                      <span className="font-semibold text-slate-700">To:</span> <strong className="font-mono text-slate-900">{currentEmail.toEmail}</strong> ({currentEmail.recipientName})
                    </div>
                    <div>
                      <span className="font-semibold text-slate-700">Date:</span> {new Date(currentEmail.sentAt).toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Simulated Email Body Card */}
                <div className="border border-slate-300 rounded-xl p-5 bg-white shadow-xs space-y-4 text-xs text-slate-700">
                  
                  {/* Official Government LGU Letterhead */}
                  <div className="text-center border-b pb-3 space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                      Republic of the Philippines • Province of Occidental Mindoro
                    </span>
                    <h3 className="font-extrabold text-[#173B67] text-sm uppercase">
                      MUNICIPAL GOVERNMENT OF SAN JOSE
                    </h3>
                    <span className="text-[11px] text-slate-500 font-serif italic block">
                      Human Resource Management Information System • Civil Service Leave Routing
                    </span>
                  </div>

                  {/* Greeting */}
                  <div>
                    <p className="font-semibold text-slate-800">
                      Dear {currentEmail.recipientName},
                    </p>
                    <p className="mt-1 text-slate-600">
                      {currentEmail.recipientRole === 'supervisor' && (
                        <span>
                          An online Application for Leave (CSC Form No. 6) has been submitted by personnel under your office. As Immediate Supervisor, please review the application details and provide your official endorsement below.
                        </span>
                      )}
                      {currentEmail.recipientRole === 'mayor' && (
                        <span>
                          The following Application for Leave (CSC Form No. 6) has been <strong>reviewed and endorsed by the Immediate Supervisor</strong>. It is now presented for your executive approval as Head of Agency.
                        </span>
                      )}
                      {currentEmail.recipientRole === 'employee' && (
                        <span>
                          Your Application for Leave (CSC Form No. 6) has successfully concluded all review stages and is <strong>OFFICIALLY APPROVED AND RECORDED</strong> by the Municipal Government of San Jose.
                        </span>
                      )}
                    </p>
                  </div>

                  {/* Leave Details Table in Email */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
                    <div className="font-bold text-slate-900 border-b pb-1 text-xs flex justify-between">
                      <span>CSC Form 6 Details (App Ref: {currentEmail.leaveId})</span>
                      <span className="text-blue-700 font-mono">{currentEmail.leaveType} Leave</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <span className="text-slate-500 block">Applicant Name:</span>
                        <strong className="text-slate-800">{currentEmail.employeeName}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Office / Department:</span>
                        <strong className="text-slate-800">{currentEmail.officeName}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Position / Title:</span>
                        <span className="text-slate-800">{currentEmail.position}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Working Days Applied:</span>
                        <strong className="text-slate-800">{currentEmail.workingDays} Day(s)</strong>
                      </div>
                      <div className="sm:col-span-2">
                        <span className="text-slate-500 block">Inclusive Dates:</span>
                        <strong className="text-slate-900">{currentEmail.inclusiveDates}</strong>
                      </div>
                      <div className="sm:col-span-2">
                        <span className="text-slate-500 block">Purpose / Specific Details:</span>
                        <span className="text-slate-700 italic">"{currentEmail.detailsOfLeave}"</span>
                      </div>
                    </div>
                  </div>

                  {/* Previous Endorsement Stamps in Email */}
                  {currentEmail.supervisorEndorsement && (
                    <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-1">
                      <div className="flex items-center space-x-1.5 text-amber-900 font-bold text-xs">
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                        <span>Stage 2 Endorsement: {currentEmail.supervisorEndorsement.endorsedBy}</span>
                      </div>
                      <p className="text-[11px] text-amber-800">
                        "{currentEmail.supervisorEndorsement.remarks}"
                      </p>
                      <span className="text-[10px] text-amber-600 block">
                        Endorsed on: {new Date(currentEmail.supervisorEndorsement.endorsedAt).toLocaleString()}
                      </span>
                    </div>
                  )}

                  {currentEmail.mayorApproval && (
                    <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl space-y-1">
                      <div className="flex items-center space-x-1.5 text-blue-900 font-bold text-xs">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#173B67]" />
                        <span>Stage 3 Approval: {currentEmail.mayorApproval.approvedBy}</span>
                      </div>
                      <p className="text-[11px] text-blue-800">
                        "{currentEmail.mayorApproval.remarks}"
                      </p>
                      <span className="text-[10px] text-blue-600 block">
                        Approved on: {new Date(currentEmail.mayorApproval.approvedAt).toLocaleString()}
                      </span>
                    </div>
                  )}

                  {currentEmail.hrCertification && (
                    <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1">
                      <div className="flex items-center space-x-1.5 text-emerald-900 font-bold text-xs">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Stage 4 & 5 Final Recording: {currentEmail.hrCertification.certifiedBy}</span>
                      </div>
                      <p className="text-[11px] text-emerald-800">
                        "{currentEmail.hrCertification.remarks}"
                      </p>
                      <span className="text-[10px] text-emerald-600 block">
                        Credits Deducted & Form Released: {new Date(currentEmail.hrCertification.certifiedAt).toLocaleString()}
                      </span>
                    </div>
                  )}

                  {/* INTERACTIVE ACTION BLOCK (Directly in Email Body) */}
                  <div className="pt-2 border-t border-slate-200 space-y-3">
                    
                    {/* 1. SUPERVISOR INTERACTIVE ACTION */}
                    {currentEmail.recipientRole === 'supervisor' && relatedLeave && (
                      <div className="p-4 bg-amber-50/60 border-2 border-amber-300 rounded-xl space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-amber-900 text-xs uppercase tracking-wide flex items-center space-x-1.5">
                            <ThumbsUp className="w-4 h-4 text-amber-600" />
                            <span>Interactive Supervisor Actions</span>
                          </span>
                          <span className="text-[10px] font-mono text-amber-800 bg-amber-100 px-2 py-0.5 rounded font-bold">
                            Current Status: {relatedLeave.status}
                          </span>
                        </div>

                        {relatedLeave.status === 'pending_supervisor' ? (
                          <>
                            <div>
                              <label className="font-bold text-slate-700 block mb-1 text-[11px]">
                                Endorsement Remarks (will be included in email to Mayor)
                              </label>
                              <input
                                type="text"
                                value={remarksInput}
                                onChange={(e) => setRemarksInput(e.target.value)}
                                placeholder="e.g. Endorsed for approval. Substitute personnel assigned."
                                className="w-full p-2 border border-slate-300 rounded-lg bg-white text-xs"
                              />
                            </div>

                            <div className="flex flex-wrap items-center gap-2 pt-1">
                              <button
                                type="button"
                                disabled={isProcessing}
                                onClick={handleExecuteSupervisorApproval}
                                className="px-4 py-2.5 bg-[#173B67] hover:bg-[#122e50] text-white font-bold rounded-xl shadow-xs transition-colors flex items-center space-x-1.5 cursor-pointer text-xs"
                              >
                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                <span>✅ Endorse Application to Mayor</span>
                              </button>

                              <button
                                type="button"
                                disabled={isProcessing}
                                onClick={async () => {
                                  await onSupervisorAction(currentEmail.leaveId, 'Disapproved', remarksInput || 'Disapproved', 'Engr. Juan Miguel Magan');
                                  setActionSuccessMessage('Application marked as Disapproved.');
                                }}
                                className="px-3.5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl transition-colors cursor-pointer text-xs"
                              >
                                ❌ Disapprove
                              </button>
                            </div>
                          </>
                        ) : (
                          <div className="p-2.5 bg-emerald-100 text-emerald-800 font-bold rounded-lg text-xs flex items-center space-x-2">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Action already completed by Supervisor. Form forwarded to Mayor.</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* 2. MAYOR INTERACTIVE ACTION */}
                    {currentEmail.recipientRole === 'mayor' && relatedLeave && (
                      <div className="p-4 bg-blue-50/60 border-2 border-blue-300 rounded-xl space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-blue-900 text-xs uppercase tracking-wide flex items-center space-x-1.5">
                            <ShieldCheck className="w-4 h-4 text-[#173B67]" />
                            <span>Executive Mayor Action (Head of Agency)</span>
                          </span>
                          <span className="text-[10px] font-mono text-blue-800 bg-blue-100 px-2 py-0.5 rounded font-bold">
                            Current Status: {relatedLeave.status}
                          </span>
                        </div>

                        {relatedLeave.status === 'pending_mayor' ? (
                          <>
                            <div>
                              <label className="font-bold text-slate-700 block mb-1 text-[11px]">
                                Mayor Executive Directive / Remarks
                              </label>
                              <input
                                type="text"
                                value={remarksInput}
                                onChange={(e) => setRemarksInput(e.target.value)}
                                placeholder="e.g. Approved for public service continuity."
                                className="w-full p-2 border border-slate-300 rounded-lg bg-white text-xs"
                              />
                            </div>

                            <div className="flex flex-wrap items-center gap-2 pt-1">
                              <button
                                type="button"
                                disabled={isProcessing}
                                onClick={handleExecuteMayorApproval}
                                className="px-4 py-2.5 bg-[#173B67] hover:bg-[#122e50] text-white font-bold rounded-xl shadow-xs transition-colors flex items-center space-x-1.5 cursor-pointer text-xs"
                              >
                                <CheckCircle2 className="w-4 h-4 text-amber-300" />
                                <span>🏛️ Approve Leave Application (Send to HR)</span>
                              </button>

                              <button
                                type="button"
                                disabled={isProcessing}
                                onClick={async () => {
                                  await onMayorAction(currentEmail.leaveId, 'Disapproved', remarksInput || 'Disapproved by Mayor', 'HON. REY P. LADAGA');
                                  setActionSuccessMessage('Application disapproved by Mayor.');
                                }}
                                className="px-3.5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl transition-colors cursor-pointer text-xs"
                              >
                                ❌ Disapprove
                              </button>
                            </div>
                          </>
                        ) : (
                          <div className="p-2.5 bg-emerald-100 text-emerald-800 font-bold rounded-lg text-xs flex items-center space-x-2">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Mayor approval granted. Application saved in app database for HR recording.</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* 3. EMPLOYEE ACCOMPLISHMENT REPORT PRINT ACTION */}
                    {currentEmail.recipientRole === 'employee' && (
                      <div className="p-4 bg-emerald-50 border-2 border-emerald-300 rounded-xl space-y-3">
                        <div className="flex items-center space-x-2 text-emerald-900 font-bold text-xs uppercase tracking-wide">
                          <Printer className="w-4 h-4 text-emerald-700" />
                          <span>Official Approved Document Ready for Printing</span>
                        </div>
                        <p className="text-[11px] text-emerald-800">
                          Per LGU San Jose memorandum, all approved leave applications must be printed and stapled to your <strong>Monthly Accomplishment Report (AR / DTR)</strong> as proof of authorized absence.
                        </p>
                        {relatedLeave && onOpenPrintModal && (
                          <button
                            type="button"
                            onClick={() => onOpenPrintModal(relatedLeave)}
                            className="w-full sm:w-auto px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-md transition-colors flex items-center justify-center space-x-2 cursor-pointer text-xs"
                          >
                            <Printer className="w-4 h-4 text-amber-300" />
                            <span>🖨️ Print Approved CSC Form 6 (Attach to Accomp Report)</span>
                          </button>
                        )}
                      </div>
                    )}

                  </div>

                  {/* Email Footer Notice */}
                  <div className="text-[10px] text-slate-400 text-center pt-2 border-t">
                    This is an automated interactive notification from the LGU San Jose HRMIS. Actions performed in this email are authenticated and cryptographically logged in the municipal audit ledger.
                  </div>
                </div>

              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-center">
                <Inbox className="w-10 h-10 mb-2 opacity-50" />
                <p>Select an automated email from the list to view interactive actions.</p>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
