import React, { useState } from 'react';
import { useData } from '../../context/DataContext.tsx';
import { useAuth } from '../../context/AuthContext.tsx';
import { Employee, DocumentCategory, EmployeeDocument, DocumentStatus, DocumentPrivacy } from '../../types/index.ts';
import { 
  FolderLock, 
  ChevronDown, 
  ChevronRight, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Camera, 
  Upload, 
  Eye, 
  Download, 
  RefreshCw, 
  Plus, 
  FileText, 
  ShieldCheck, 
  User, 
  ArrowLeft,
  X,
  FileCheck2,
  Send
} from 'lucide-react';

interface DocumentManagerProps {
  initialEmployee?: Employee;
  onOpenScanner: (docType?: string, docName?: string, categoryId?: string, empId?: string) => void;
  onRequestDocument: (emp: Employee, cat: DocumentCategory, docType: string) => void;
  onBackToMasterlist?: () => void;
}

export const DocumentManager: React.FC<DocumentManagerProps> = ({
  initialEmployee,
  onOpenScanner,
  onRequestDocument,
  onBackToMasterlist
}) => {
  const { employees, categories, documents, verifyDocument, returnDocument } = useData();
  const { currentUser, hasPermission } = useAuth();

  const [selectedEmpId, setSelectedEmpId] = useState<string>(
    initialEmployee?.id || employees[0]?.id || 'EMP-2022-001'
  );
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    'cat-01': true,
    'cat-02': true
  });

  const [previewDoc, setPreviewDoc] = useState<EmployeeDocument | null>(null);
  const [returnRemarks, setReturnRemarks] = useState('');
  const [showReturnModal, setShowReturnModal] = useState<string | null>(null);

  const currentEmployee = employees.find(e => e.id === selectedEmpId) || employees[0];

  const toggleCategory = (catId: string) => {
    setExpandedCategories(prev => ({ ...prev, [catId]: !prev[catId] }));
  };

  // Status Badge Helper adhering strictly to Section 9 color requirements:
  // RED — Missing (Required)
  // YELLOW — Missing (Optional)
  // GREEN — Verified
  // BLUE — For Review
  // ORANGE — Returned
  const getStatusBadge = (status: DocumentStatus, isRequired: boolean) => {
    switch (status) {
      case 'verified':
        return { label: 'Verified', bg: 'bg-emerald-100 text-emerald-800 border-emerald-300', icon: CheckCircle2 };
      case 'for_review':
        return { label: 'For Review', bg: 'bg-blue-100 text-blue-800 border-blue-300', icon: Clock };
      case 'returned':
        return { label: 'Returned', bg: 'bg-orange-100 text-orange-800 border-orange-300', icon: AlertCircle };
      case 'missing_required':
        return { label: 'Missing (Required)', bg: 'bg-rose-100 text-rose-800 border-rose-300', icon: AlertCircle };
      case 'missing_optional':
      default:
        return { label: isRequired ? 'Missing (Required)' : 'Missing (Optional)', bg: isRequired ? 'bg-rose-100 text-rose-800 border-rose-300' : 'bg-amber-100 text-amber-800 border-amber-300', icon: AlertCircle };
    }
  };

  // Calculate Category Compliance Status
  const getCategoryStatus = (cat: DocumentCategory) => {
    if (!currentEmployee) return { label: 'Complete', color: 'text-emerald-600' };

    let requiredMissingCount = 0;
    let optionalMissingCount = 0;

    cat.documentTypes.forEach(docType => {
      const isRequired = docType.isRequiredFor.includes(currentEmployee.classification);
      const docRecord = documents.find(d => 
        d.employeeId === currentEmployee.id && 
        d.categoryId === cat.id && 
        d.documentTypeCode === docType.code
      );

      const isVerified = docRecord && docRecord.status === 'verified';

      if (!isVerified) {
        if (isRequired) requiredMissingCount++;
        else optionalMissingCount++;
      }
    });

    if (requiredMissingCount > 0) {
      return { 
        label: `Missing Required (${requiredMissingCount})`, 
        color: 'bg-rose-100 text-rose-800 border border-rose-200' 
      };
    }
    if (optionalMissingCount > 0) {
      return { 
        label: 'Missing (Optional)', 
        color: 'bg-amber-100 text-amber-800 border border-amber-200' 
      };
    }
    return { 
      label: 'Complete', 
      color: 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
    };
  };

  return (
    <div className="space-y-4">
      
      {/* Top Header & Employee Selector */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center space-x-3">
          {onBackToMasterlist && (
            <button
              onClick={onBackToMasterlist}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 cursor-pointer shrink-0"
              aria-label="Back to Masterlist"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">201 Personnel Files Repository</h2>
              <span className="text-[10px] sm:text-xs bg-blue-100 text-[#173B67] px-2 py-0.5 rounded-full font-bold">
                15 Categories
              </span>
            </div>
            <p className="text-xs text-slate-500 line-clamp-1">
              Two-way document management, mobile scanning, and CSC statutory compliance
            </p>
          </div>
        </div>

        {/* Employee Switcher (Full-width on mobile) */}
        <div className="w-full md:w-auto flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2">
          <label className="text-xs font-bold text-slate-600 shrink-0">Employee Record:</label>
          <select
            value={selectedEmpId}
            onChange={(e) => setSelectedEmpId(e.target.value)}
            className="w-full sm:w-auto p-2.5 text-xs border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-[#173B67] font-semibold text-slate-800"
          >
            {employees.map(emp => (
              <option key={emp.id} value={emp.id}>
                {emp.lastName}, {emp.firstName} ({emp.employeeNumber} • {emp.classification})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Selected Employee Quick Card */}
      {currentEmployee && (
        <div className="bg-blue-50/60 border border-blue-200/80 rounded-2xl p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-[#173B67] text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
              {currentEmployee.firstName.charAt(0)}
            </div>
            <div>
              <div className="font-bold text-sm text-slate-900">
                {currentEmployee.firstName} {currentEmployee.lastName}
              </div>
              <span className="text-slate-500 text-xs block">
                {currentEmployee.position} • {currentEmployee.officeName}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
            <span className="font-mono bg-white px-2.5 py-1 rounded-xl border border-blue-200 text-[#173B67] font-bold">
              ID: {currentEmployee.id}
            </span>
            <span className="font-mono bg-white px-2.5 py-1 rounded-xl border border-blue-200 text-slate-700 font-bold">
              Emp#: {currentEmployee.employeeNumber}
            </span>
          </div>
        </div>
      )}

      {/* 15 Collapsible Categories Explorer */}
      <div className="space-y-3">
        {categories.map(cat => {
          const isExpanded = !!expandedCategories[cat.id];
          const catStatus = getCategoryStatus(cat);

          return (
            <div key={cat.id} className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              
              {/* Category Header (Collapsible) */}
              <button
                type="button"
                onClick={() => toggleCategory(cat.id)}
                className="w-full px-4 sm:px-5 py-3.5 sm:py-4 bg-slate-50/80 hover:bg-slate-100/80 transition-colors flex items-center justify-between text-left cursor-pointer border-b border-slate-200/60 min-h-[52px]"
              >
                <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0 pr-2">
                  <div className="w-7 h-7 rounded-lg bg-[#173B67]/10 text-[#173B67] flex items-center justify-center shrink-0">
                    {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-xs sm:text-sm text-slate-900 truncate">{cat.name}</h3>
                    <p className="text-[11px] text-slate-500 line-clamp-1 hidden sm:block">{cat.description}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold ${catStatus.color}`}>
                    {catStatus.label}
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
                    {cat.documentTypes.length} docs
                  </span>
                </div>
              </button>

              {/* Collapsed Document Items List */}
              {isExpanded && (
                <div className="divide-y divide-slate-100">
                  {cat.documentTypes.map(docType => {
                    const isRequired = currentEmployee 
                      ? docType.isRequiredFor.includes(currentEmployee.classification) 
                      : false;

                    const docRecord = documents.find(d => 
                      d.employeeId === selectedEmpId && 
                      d.categoryId === cat.id && 
                      d.documentTypeCode === docType.code
                    );

                    const status: DocumentStatus = docRecord 
                      ? docRecord.status 
                      : (isRequired ? 'missing_required' : 'missing_optional');

                    const badge = getStatusBadge(status, isRequired);
                    const StatusIcon = badge.icon;

                    return (
                      <div key={docType.code} className="p-3.5 sm:p-4 hover:bg-slate-50/50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                        
                        {/* Doc Info */}
                        <div className="max-w-xl">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <h4 className="font-bold text-slate-900 text-xs sm:text-sm">{docType.name}</h4>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center space-x-1 ${badge.bg}`}>
                              <StatusIcon className="w-3 h-3" />
                              <span>{badge.label}</span>
                            </span>
                            {docType.privacy === 'hr_restricted' && (
                              <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-medium">
                                HR Restricted
                              </span>
                            )}
                            {docType.privacy === 'highly_confidential' && (
                              <span className="text-[10px] bg-purple-100 text-purple-800 px-1.5 py-0.2 rounded font-medium">
                                Confidential
                              </span>
                            )}
                          </div>

                          {docRecord && docRecord.fileName && (
                            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-slate-500 font-mono">
                              <span>File: {docRecord.fileName}</span>
                              <span>•</span>
                              <span>v{docRecord.version}</span>
                              <span>•</span>
                              <span>Uploaded by: {docRecord.uploadedBy}</span>
                              {docRecord.remarks && (
                                <span className="text-orange-600 font-sans">({docRecord.remarks})</span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Individual Document Actions (Mobile Touch-Optimized Grid) */}
                        <div className="grid grid-cols-2 sm:flex sm:items-center gap-1.5 shrink-0 pt-1 md:pt-0">
                          
                          {/* Scan Button (Camera) */}
                          <button
                            type="button"
                            onClick={() => onOpenScanner(docType.code, docType.name, cat.id, selectedEmpId)}
                            className="min-h-[40px] px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-[#173B67] rounded-xl font-bold text-xs border border-blue-200 transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
                            title="Scan with Mobile Camera"
                          >
                            <Camera className="w-3.5 h-3.5" />
                            <span>Scan</span>
                          </button>

                          {/* Upload / Replace */}
                          <button
                            type="button"
                            onClick={() => onOpenScanner(docType.code, docType.name, cat.id, selectedEmpId)}
                            className="min-h-[40px] px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs border border-slate-300 transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
                            title="Upload or Replace File"
                          >
                            <Upload className="w-3.5 h-3.5 text-slate-500" />
                            <span>{docRecord ? 'Replace' : 'Upload'}</span>
                          </button>

                          {/* Preview if uploaded */}
                          {docRecord && docRecord.fileName && (
                            <button
                              type="button"
                              onClick={() => setPreviewDoc(docRecord)}
                              className="min-h-[40px] px-3 py-1.5 text-blue-700 hover:bg-blue-50 border border-blue-200 rounded-xl transition-colors cursor-pointer flex items-center justify-center space-x-1"
                              title="Preview Document"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span className="sm:hidden">Preview</span>
                            </button>
                          )}

                          {/* HR Verification Actions */}
                          {docRecord && docRecord.status === 'for_review' && hasPermission('verify_documents') && (
                            <>
                              <button
                                type="button"
                                onClick={() => verifyDocument(docRecord.id, currentUser?.displayName || 'HR Administrator')}
                                className="min-h-[40px] px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center justify-center space-x-1 cursor-pointer shadow-xs"
                                title="Approve & Verify"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Verify</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setShowReturnModal(docRecord.id)}
                                className="min-h-[40px] px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold text-xs flex items-center justify-center space-x-1 cursor-pointer shadow-xs"
                                title="Return to Employee"
                              >
                                <AlertCircle className="w-3.5 h-3.5" />
                                <span>Return</span>
                              </button>
                            </>
                          )}

                          {/* Request Document from Employee */}
                          {!docRecord && currentEmployee && hasPermission('request_documents') && (
                            <button
                              type="button"
                              onClick={() => onRequestDocument(currentEmployee, cat, docType.name)}
                              className="min-h-[40px] col-span-2 sm:col-span-1 px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-[#F28C28] rounded-xl font-bold text-xs border border-orange-200 transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
                              title="Send Request to Employee ESS"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>Request from Personnel</span>
                            </button>
                          )}

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

      {/* Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col">
            <div className="sm:hidden pt-2 pb-1 bg-[#173B67] flex justify-center shrink-0">
              <div className="w-10 h-1 bg-white/40 rounded-full"></div>
            </div>
            <div className="bg-[#173B67] px-5 py-3.5 text-white flex items-center justify-between shrink-0">
              <h3 className="text-sm font-bold truncate pr-2">{previewDoc.documentName}</h3>
              <button 
                onClick={() => setPreviewDoc(null)} 
                className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-300 hover:text-white rounded-xl cursor-pointer"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <div className="p-5 text-xs space-y-3 overflow-y-auto">
              <div className="p-4 bg-slate-50 border rounded-xl space-y-2 font-mono">
                <div><strong>File:</strong> {previewDoc.fileName}</div>
                <div><strong>Version:</strong> v{previewDoc.version}</div>
                <div><strong>Status:</strong> {previewDoc.status}</div>
                <div><strong>Uploaded:</strong> {previewDoc.uploadedAt} by {previewDoc.uploadedBy}</div>
                {previewDoc.verifiedBy && (
                  <div className="text-emerald-700"><strong>Verified by:</strong> {previewDoc.verifiedBy} ({previewDoc.verifiedAt})</div>
                )}
              </div>
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setPreviewDoc(null)}
                  className="w-full sm:w-auto min-h-[44px] px-5 py-2.5 bg-slate-800 text-white font-bold rounded-xl cursor-pointer flex items-center justify-center"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Return Remarks Modal */}
      {showReturnModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 p-5 space-y-4 max-h-[92vh]">
            <div className="sm:hidden -mt-1 pb-1 flex justify-center">
              <div className="w-10 h-1 bg-slate-300 rounded-full"></div>
            </div>
            <h3 className="font-bold text-sm text-slate-900">Return Document for Correction</h3>
            <p className="text-xs text-slate-500">Provide instructions to the employee regarding needed corrections:</p>
            <textarea
              rows={3}
              value={returnRemarks}
              onChange={(e) => setReturnRemarks(e.target.value)}
              placeholder="e.g. Incomplete notarization or missing signature on page 4."
              className="w-full p-3 border border-slate-300 rounded-xl text-xs"
            />
            <div className="flex flex-col sm:flex-row justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setShowReturnModal(null)}
                className="min-h-[44px] px-4 py-2.5 border border-slate-300 rounded-xl font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  returnDocument(showReturnModal, currentUser?.displayName || 'HR Staff', returnRemarks);
                  setShowReturnModal(null);
                  setReturnRemarks('');
                }}
                className="min-h-[44px] px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl cursor-pointer flex items-center justify-center shadow-md"
              >
                Confirm Return
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
