import React, { useState } from 'react';
import { useData } from '../../context/DataContext.tsx';
import { useAuth } from '../../context/AuthContext.tsx';
import { DocumentRequest, RequestStatus, ESSDocumentServiceRequest, ESSRequestStatus } from '../../types/index.ts';
import { CertificatePreviewModal } from '../ess/CertificatePreviewModal.tsx';
import { 
  FileText, 
  Plus, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Send, 
  Eye, 
  Check, 
  X, 
  Building2, 
  User, 
  Calendar,
  CreditCard,
  Award,
  TrendingUp,
  FileCheck2,
  Inbox,
  ArrowUpRight,
  Filter
} from 'lucide-react';

interface DocumentRequestsViewProps {
  onOpenCreateRequest: () => void;
}

export const DocumentRequestsView: React.FC<DocumentRequestsViewProps> = ({ onOpenCreateRequest }) => {
  const { requests, reviewDocumentRequest, essServiceRequests, updateESSServiceRequestStatus } = useData();
  const { currentUser, hasPermission } = useAuth();

  const [activeMainTab, setActiveMainTab] = useState<'incoming_ess' | 'outgoing_hr'>('incoming_ess');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [essFilterStatus, setEssFilterStatus] = useState<string>('all');
  
  // Selection states
  const [selectedRequest, setSelectedRequest] = useState<DocumentRequest | null>(null);
  const [remarks, setRemarks] = useState('');
  
  // ESS Request Action state
  const [selectedESSRequest, setSelectedESSRequest] = useState<ESSDocumentServiceRequest | null>(null);
  const [essActionType, setEssActionType] = useState<'process' | 'ready' | 'released' | 'decline' | null>(null);
  const [essRemarks, setEssRemarks] = useState('');
  const [previewCertRequest, setPreviewCertRequest] = useState<ESSDocumentServiceRequest | null>(null);

  const filteredHRRequests = requests.filter(r => {
    return filterStatus === 'all' || r.status === filterStatus;
  });

  const filteredESSRequests = essServiceRequests.filter(r => {
    return essFilterStatus === 'all' || r.status === essFilterStatus;
  });

  const pendingESSCount = essServiceRequests.filter(r => r.status === 'pending' || r.status === 'processing').length;
  const readyESSCount = essServiceRequests.filter(r => r.status === 'ready').length;

  const handleUpdateESSStatus = async (status: ESSRequestStatus, defaultRemark?: string) => {
    if (!selectedESSRequest) return;
    const finalRemark = essRemarks.trim() || defaultRemark || '';
    await updateESSServiceRequestStatus(
      selectedESSRequest.id,
      status,
      finalRemark || undefined,
      selectedESSRequest.issuedDocumentUrl || '#',
      selectedESSRequest.issuedDocumentFileName || `${selectedESSRequest.requestType}_${selectedESSRequest.employeeName.replace(/\s+/g, '_')}_Official.pdf`
    );
    setSelectedESSRequest(null);
    setEssActionType(null);
    setEssRemarks('');
  };

  return (
    <div className="space-y-4 text-xs font-sans">
      
      {/* Top Header & Mode Toggle */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Two-Way Document Requests & Certifications</h2>
          <p className="text-xs text-slate-500">
            Process incoming employee requests (COE, Payslips, IPCR) and issue 201 document submission orders
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {hasPermission('request_documents') && (
            <button
              type="button"
              onClick={onOpenCreateRequest}
              className="px-4 py-2 bg-[#173B67] hover:bg-[#122e50] text-white font-bold rounded-xl shadow-xs transition-colors flex items-center space-x-1.5 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Issue 201 Order to Staff</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Dual Segmented Navigation Tabs */}
      <div className="bg-white p-1 rounded-2xl border border-slate-200 shadow-2xs flex">
        <button
          type="button"
          onClick={() => setActiveMainTab('incoming_ess')}
          className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs transition-all flex items-center justify-center space-x-2 cursor-pointer ${
            activeMainTab === 'incoming_ess'
              ? 'bg-[#173B67] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Inbox className="w-4 h-4" />
          <span>Incoming Employee Requests (COE, Payslip, IPCR...)</span>
          {pendingESSCount > 0 && (
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
              activeMainTab === 'incoming_ess' ? 'bg-[#F28C28] text-white' : 'bg-orange-100 text-[#F28C28]'
            }`}>
              {pendingESSCount} new
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveMainTab('outgoing_hr')}
          className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs transition-all flex items-center justify-center space-x-2 cursor-pointer ${
            activeMainTab === 'outgoing_hr'
              ? 'bg-[#173B67] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Send className="w-4 h-4" />
          <span>HR Orders to Employees (201 File Submissions)</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-200 text-slate-800 font-bold">
            {requests.length}
          </span>
        </button>
      </div>

      {/* TAB 1: INCOMING EMPLOYEE REQUESTS (COE, PAYSLIP, IPCR, SERVICE RECORD...) */}
      {activeMainTab === 'incoming_ess' && (
        <div className="space-y-4">
          
          {/* Quick Metrics Bar (Side-by-side tiles on mobile) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
            <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[10px] sm:text-xs text-slate-500 font-semibold uppercase block truncate">Total Requests</span>
              <div className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">{essServiceRequests.length}</div>
              <span className="text-[10px] text-slate-400 block truncate">COE, Payslips, IPCR</span>
            </div>

            <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[10px] sm:text-xs text-amber-600 font-semibold uppercase block truncate">Pending Action</span>
              <div className="text-xl sm:text-2xl font-bold text-amber-700 mt-1">
                {essServiceRequests.filter(r => r.status === 'pending').length}
              </div>
              <span className="text-[10px] text-amber-500 block truncate">Requires assignment</span>
            </div>

            <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[10px] sm:text-xs text-blue-600 font-semibold uppercase block truncate">In Processing</span>
              <div className="text-xl sm:text-2xl font-bold text-blue-700 mt-1">
                {essServiceRequests.filter(r => r.status === 'processing').length}
              </div>
              <span className="text-[10px] text-blue-500 block truncate">Verification / Sign-off</span>
            </div>

            <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[10px] sm:text-xs text-emerald-600 font-semibold uppercase block truncate">Ready / Issued</span>
              <div className="text-xl sm:text-2xl font-bold text-emerald-700 mt-1">
                {readyESSCount + essServiceRequests.filter(r => r.status === 'released').length}
              </div>
              <span className="text-[10px] text-emerald-500 block truncate">Available for pickup</span>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center space-x-1.5 overflow-x-auto scrollbar-none">
              {['all', 'pending', 'processing', 'ready', 'released', 'declined'].map(st => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setEssFilterStatus(st)}
                  className={`px-3 py-1.5 rounded-xl font-bold uppercase tracking-wider text-[11px] transition-colors cursor-pointer ${
                    essFilterStatus === st
                      ? 'bg-[#173B67] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {st === 'all' ? 'All Requests' : st}
                </button>
              ))}
            </div>

            <span className="text-xs text-slate-500 font-medium">
              Showing {filteredESSRequests.length} of {essServiceRequests.length} personnel requests
            </span>
          </div>

          {/* Requests List */}
          <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-xs">
            {filteredESSRequests.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                No employee service requests match the selected status filter.
              </div>
            ) : (
              filteredESSRequests.map(req => {
                const isReady = req.status === 'ready' || req.status === 'released';
                return (
                  <div key={req.id} className="p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
                    
                    {/* Left Info */}
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center space-x-2 flex-wrap">
                        <span className="font-mono text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border">
                          {req.trackingNumber || req.id}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                          req.requestType === 'COE' ? 'bg-blue-100 text-blue-800' :
                          req.requestType === 'PAYSLIP' ? 'bg-emerald-100 text-emerald-800' :
                          req.requestType === 'IPCR' ? 'bg-purple-100 text-purple-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {req.requestType}
                        </span>
                        <span className="font-bold text-xs sm:text-sm text-slate-900">{req.title}</span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-slate-600 text-xs">
                        <span className="font-semibold text-slate-800">{req.employeeName}</span>
                        <span>•</span>
                        <span>{req.officeName}</span>
                        <span>•</span>
                        <span className="font-mono text-[11px] text-slate-500">Emp#: {req.employeeNumber}</span>
                        <span>•</span>
                        <span className="text-slate-500">{req.classification}</span>
                      </div>

                      <p className="text-xs text-slate-600">
                        <strong className="text-slate-700">Purpose:</strong> {req.purpose}
                      </p>

                      {req.periodCovered && (
                        <div className="text-[11px] text-slate-600">
                          <strong>Period Covered:</strong> {req.periodCovered}
                        </div>
                      )}

                      <div className="flex items-center space-x-3 text-[10px] text-slate-400 pt-0.5">
                        <span>Submitted: {new Date(req.submittedAt).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>Copies: {req.copies}</span>
                        <span>•</span>
                        <span>Preference: {req.deliveryPreference}</span>
                        <span>•</span>
                        <span>Urgency: {req.urgency || 'Normal'}</span>
                      </div>

                      {req.hrRemarks && (
                        <div className="mt-1 p-2 bg-slate-100 border border-slate-200 rounded-lg text-[11px] text-slate-700">
                          <strong>HR Remarks:</strong> {req.hrRemarks}
                        </div>
                      )}
                    </div>

                    {/* Right Action Buttons */}
                    <div className="w-full md:w-auto flex flex-col md:items-end space-y-2 shrink-0 pt-2 md:pt-0 border-t md:border-0 border-slate-100">
                      <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider text-center ${
                        req.status === 'ready' ? 'bg-emerald-100 text-emerald-800 ring-2 ring-emerald-300' :
                        req.status === 'released' ? 'bg-emerald-100 text-emerald-800' :
                        req.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                        req.status === 'declined' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {req.status === 'ready' ? 'Ready for Pickup / Download' :
                         req.status === 'processing' ? 'In Processing' :
                         req.status === 'released' ? 'Issued & Released' :
                         req.status === 'declined' ? 'Declined' : 'Pending Action'}
                      </span>

                      {/* State transitions */}
                      <div className="flex items-center space-x-1.5 flex-wrap">
                        {req.status === 'pending' && (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedESSRequest(req);
                                setEssActionType('process');
                              }}
                              className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-lg transition-colors cursor-pointer text-xs"
                            >
                              Process
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedESSRequest(req);
                                setEssActionType('ready');
                              }}
                              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-xs transition-colors cursor-pointer text-xs flex items-center space-x-1"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>1-Click Issue</span>
                            </button>
                          </>
                        )}

                        {req.status === 'processing' && (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedESSRequest(req);
                              setEssActionType('ready');
                            }}
                            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-xs transition-colors cursor-pointer text-xs flex items-center space-x-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Mark Ready & Release Digital Copy</span>
                          </button>
                        )}

                        {req.status === 'ready' && (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedESSRequest(req);
                              setEssActionType('released');
                            }}
                            className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg shadow-xs transition-colors cursor-pointer text-xs"
                          >
                            Mark Picked Up / Released
                          </button>
                        )}

                        {/* Certificate Viewer for HR */}
                        <button
                          type="button"
                          onClick={() => setPreviewCertRequest(req)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg transition-colors cursor-pointer text-xs flex items-center space-x-1"
                          title="Preview Official Certificate"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Preview Cert</span>
                        </button>
                      </div>

                    </div>

                  </div>
                );
              })
            )}
          </div>

        </div>
      )}

      {/* TAB 2: OUTGOING HR ORDERS (ORIGINAL 201 SUBMISSION ORDERS) */}
      {activeMainTab === 'outgoing_hr' && (
        <div className="space-y-3">
          
          {/* Filter Bar */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="p-2 border border-slate-300 rounded-xl bg-white font-semibold text-slate-700"
            >
              <option value="all">All Request Statuses ({requests.length})</option>
              <option value="requested">Requested / Awaiting ({requests.filter(r => r.status === 'requested').length})</option>
              <option value="under_review">Under Review ({requests.filter(r => r.status === 'under_review').length})</option>
              <option value="verified">Verified ({requests.filter(r => r.status === 'verified').length})</option>
              <option value="returned">Returned ({requests.filter(r => r.status === 'returned').length})</option>
            </select>

            <span className="text-xs text-slate-500 font-medium">
              Showing {filteredHRRequests.length} orders
            </span>
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
                  <th className="p-4">Req ID</th>
                  <th className="p-4">Employee</th>
                  <th className="p-4">Category & Document</th>
                  <th className="p-4">Due Date</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredHRRequests.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">
                      No document orders match this filter.
                    </td>
                  </tr>
                ) : (
                  filteredHRRequests.map(req => (
                    <tr key={req.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-4 font-mono font-bold text-[#173B67]">{req.id}</td>
                      <td className="p-4 font-bold text-slate-900">{req.employeeName}</td>
                      <td className="p-4">
                        <div className="font-bold text-slate-900">{req.documentName}</div>
                        <div className="text-[11px] text-slate-500">{req.categoryName}</div>
                      </td>
                      <td className="p-4 font-semibold text-slate-600">{req.dueDate}</td>
                      <td className="p-4">
                        <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                          req.status === 'verified' ? 'bg-emerald-100 text-emerald-800' :
                          req.status === 'under_review' ? 'bg-blue-100 text-blue-800' :
                          req.status === 'returned' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {req.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        {req.submittedFileName ? (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedRequest(req);
                              setRemarks(req.reviewRemarks || '');
                            }}
                            className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-lg transition-colors cursor-pointer"
                          >
                            Review File
                          </button>
                        ) : (
                          <span className="text-slate-400 italic">Awaiting upload</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards View */}
          <div className="block md:hidden space-y-3">
            {filteredHRRequests.map(req => (
              <div key={req.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-mono font-bold text-xs text-[#173B67]">{req.id}</span>
                    <h4 className="font-bold text-xs text-slate-900 mt-0.5">{req.documentName}</h4>
                    <span className="text-[11px] text-slate-500">{req.employeeName}</span>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                    req.status === 'verified' ? 'bg-emerald-100 text-emerald-800' :
                    req.status === 'under_review' ? 'bg-blue-100 text-blue-800' :
                    req.status === 'returned' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {req.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t text-[11px] text-slate-500">
                  <span>Due: {req.dueDate}</span>
                  {req.submittedFileName && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedRequest(req);
                        setRemarks(req.reviewRemarks || '');
                      }}
                      className="px-3 py-1 bg-blue-600 text-white font-bold rounded-lg"
                    >
                      Review File
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* HR Action Modal for Incoming ESS Service Requests */}
      {selectedESSRequest && essActionType && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 p-5 sm:p-6 space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="sm:hidden -mt-1 pb-1 flex justify-center">
              <div className="w-10 h-1 bg-slate-300 rounded-full"></div>
            </div>
            <h3 className="font-bold text-sm text-slate-900">
              {essActionType === 'ready' ? 'Issue & Generate Official Certificate' :
               essActionType === 'process' ? 'Mark Request in Processing' :
               essActionType === 'released' ? 'Mark Document Released / Picked Up' : 'Decline Request'}
            </h3>
            
            <div className="p-3 bg-slate-50 rounded-xl space-y-1 text-xs">
              <div><strong>Employee:</strong> {selectedESSRequest.employeeName} ({selectedESSRequest.officeName})</div>
              <div><strong>Document:</strong> {selectedESSRequest.title}</div>
              <div><strong>Purpose:</strong> {selectedESSRequest.purpose}</div>
              {selectedESSRequest.periodCovered && (
                <div><strong>Period:</strong> {selectedESSRequest.periodCovered}</div>
              )}
              <div><strong>Copies & Preference:</strong> {selectedESSRequest.copies} copy • {selectedESSRequest.deliveryPreference}</div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">MHRMO Remarks / Instructions for Employee</label>
              <textarea
                rows={2}
                value={essRemarks}
                onChange={(e) => setEssRemarks(e.target.value)}
                placeholder={essActionType === 'ready' ? "e.g. Official signed copy ready for download. Original hardcopy available at Window 2." : "Add optional remarks..."}
                className="w-full p-2.5 border rounded-xl text-xs"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => {
                  setSelectedESSRequest(null);
                  setEssActionType(null);
                }}
                className="px-4 py-2 border rounded-xl font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (essActionType === 'ready') handleUpdateESSStatus('ready', 'Official signed document generated. Available for download and pickup at MHRMO Window 2.');
                  if (essActionType === 'process') handleUpdateESSStatus('processing', 'Your request has been queued and is undergoing records verification.');
                  if (essActionType === 'released') handleUpdateESSStatus('released', 'Official hardcopy released to employee.');
                  if (essActionType === 'decline') handleUpdateESSStatus('declined', 'Request could not be processed.');
                }}
                className={`px-5 py-2 text-white font-bold rounded-xl cursor-pointer shadow-md ${
                  essActionType === 'ready' ? 'bg-emerald-600 hover:bg-emerald-700' :
                  essActionType === 'process' ? 'bg-blue-600 hover:bg-blue-700' :
                  essActionType === 'released' ? 'bg-emerald-700 hover:bg-emerald-800' : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                Confirm Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Request Modal (For 201 Uploaded Files) */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 p-5 sm:p-6 space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="sm:hidden -mt-1 pb-1 flex justify-center">
              <div className="w-10 h-1 bg-slate-300 rounded-full"></div>
            </div>
            <h3 className="font-bold text-sm text-slate-900">Review Employee Submission</h3>
            <div className="p-3 bg-slate-50 rounded-xl space-y-1 text-xs">
              <div><strong>Employee:</strong> {selectedRequest.employeeName}</div>
              <div><strong>Document:</strong> {selectedRequest.documentName}</div>
              <div><strong>Submitted File:</strong> {selectedRequest.submittedFileName || 'N/A'}</div>
              <div><strong>Date:</strong> {selectedRequest.submittedAt}</div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Review Remarks</label>
              <textarea
                rows={2}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Optional comments or return instructions..."
                className="w-full p-2.5 border rounded-xl"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
              <button
                type="button"
                onClick={() => setSelectedRequest(null)}
                className="min-h-[44px] px-4 py-2 border rounded-xl font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  await reviewDocumentRequest(selectedRequest.id, 'returned', remarks);
                  setSelectedRequest(null);
                }}
                className="min-h-[44px] px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl cursor-pointer"
              >
                Return
              </button>
              <button
                type="button"
                onClick={async () => {
                  await reviewDocumentRequest(selectedRequest.id, 'verified', remarks);
                  setSelectedRequest(null);
                }}
                className="min-h-[44px] px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl cursor-pointer shadow-md"
              >
                Approve & Verify
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Official Certificate / Document Viewer Modal for HR Staff */}
      <CertificatePreviewModal
        isOpen={!!previewCertRequest}
        onClose={() => setPreviewCertRequest(null)}
        request={previewCertRequest}
      />

    </div>
  );
};
