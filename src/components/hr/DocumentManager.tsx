import React, { useState } from 'react';
import { useData } from '../../context/DataContext.tsx';
import { useAuth } from '../../context/AuthContext.tsx';
import { 
  Employee, 
  DocumentCategory, 
  EmployeeDocument, 
  EmploymentClassification,
  DocumentPrivacy 
} from '../../types/index.ts';
import { 
  MASTER_CATEGORIES, 
  MASTER_DOCUMENTS, 
  DocumentDefinition,
  computeEmployeeCompliance,
  RequirementLevel
} from '../../data/documentRequirements.ts';
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
  RefreshCw, 
  Search, 
  Filter, 
  User, 
  ArrowLeft,
  X,
  FileCheck2,
  FileText,
  ShieldAlert,
  Calendar,
  Lock,
  ArrowRightLeft,
  Info
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
  const { employees, documents, updateEmployee, verifyDocument, returnDocument, uploadDocument } = useData();
  const { currentUser, hasPermission } = useAuth();

  const [selectedEmpId, setSelectedEmpId] = useState<string>(
    initialEmployee?.id || employees[0]?.id || 'EMP-2022-001'
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'missing_required' | 'missing_optional' | 'for_review' | 'verified' | 'returned'>('all');
  const [requirementFilter, setRequirementFilter] = useState<'all' | 'REQUIRED' | 'CONDITIONAL' | 'OPTIONAL'>('all');

  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    'cat-01': true,
    'cat-02': true,
    'cat-07': true,
    'cat-14': true
  });

  // Modals
  const [previewDoc, setPreviewDoc] = useState<EmployeeDocument | null>(null);
  const [returnTargetDoc, setReturnTargetDoc] = useState<EmployeeDocument | null>(null);
  const [returnRemarks, setReturnRemarks] = useState('');

  // Change Classification Modal
  const [showClassificationModal, setShowClassificationModal] = useState(false);
  const [newClassification, setNewClassification] = useState<EmploymentClassification>('Permanent');
  const [classificationEffectiveDate, setClassificationEffectiveDate] = useState(new Date().toISOString().split('T')[0]);
  const [classificationRemarks, setClassificationRemarks] = useState('');

  const currentEmployee = employees.find(e => e.id === selectedEmpId) || employees[0];
  const empClassification = currentEmployee?.classification || 'Permanent';

  // Compliance evaluation
  const empDocs = documents.filter(d => d.employeeId === currentEmployee?.id);
  const compliance = computeEmployeeCompliance(empClassification, empDocs);

  const toggleCategory = (catId: string) => {
    setExpandedCategories(prev => ({ ...prev, [catId]: !prev[catId] }));
  };

  // Helper to determine status for a document definition
  const getDocStatus = (docDef: DocumentDefinition): {
    statusKey: 'verified' | 'for_review' | 'returned' | 'missing_required' | 'missing_optional';
    label: string;
    badgeClass: string;
    icon: any;
    uploadedRecord?: EmployeeDocument;
  } => {
    const level = docDef.requirementsByClassification[empClassification];
    const isRequired = level === 'REQUIRED' || level === 'CONDITIONAL';

    const uploaded = empDocs.find(d => d.documentTypeCode === docDef.code);

    if (uploaded) {
      if (uploaded.status === 'verified') {
        return {
          statusKey: 'verified',
          label: 'Verified (Green)',
          badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          icon: CheckCircle2,
          uploadedRecord: uploaded
        };
      }
      if (uploaded.status === 'for_review') {
        return {
          statusKey: 'for_review',
          label: 'For Review (Blue)',
          badgeClass: 'bg-blue-100 text-blue-800 border-blue-300',
          icon: Clock,
          uploadedRecord: uploaded
        };
      }
      if (uploaded.status === 'returned') {
        return {
          statusKey: 'returned',
          label: 'Returned (Orange)',
          badgeClass: 'bg-orange-100 text-orange-800 border-orange-300',
          icon: AlertCircle,
          uploadedRecord: uploaded
        };
      }
    }

    if (isRequired) {
      return {
        statusKey: 'missing_required',
        label: 'Missing Required (Red)',
        badgeClass: 'bg-rose-100 text-rose-800 border-rose-300 font-bold',
        icon: AlertCircle
      };
    }

    return {
      statusKey: 'missing_optional',
      label: 'Missing Optional (Yellow)',
      badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
      icon: Info
    };
  };

  // Handle Return Submission
  const handleConfirmReturn = async () => {
    if (!returnTargetDoc) return;
    await returnDocument(
      returnTargetDoc.id, 
      currentUser?.displayName || 'HR Administrator', 
      returnRemarks || 'Document returned for verification and corrections'
    );
    setReturnTargetDoc(null);
    setReturnRemarks('');
  };

  // Handle Changing Employee Classification (Preserves existing 201 records!)
  const handleChangeClassification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentEmployee) return;

    const existingHistory = currentEmployee.classificationHistory || [];
    const updatedHistory = [
      ...existingHistory,
      {
        classification: newClassification,
        effectiveDate: classificationEffectiveDate,
        remarks: classificationRemarks || `Reclassified from ${currentEmployee.classification} to ${newClassification}`,
        recordedAt: new Date().toISOString(),
        recordedBy: currentUser?.displayName || 'HR Administrator'
      }
    ];

    await updateEmployee(currentEmployee.id, {
      classification: newClassification,
      classificationHistory: updatedHistory
    });

    setShowClassificationModal(false);
    setClassificationRemarks('');
  };

  // Handle Direct Document Upload Simulation / Picker
  const handleFileUpload = async (docDef: DocumentDefinition, file: File) => {
    if (!currentEmployee) return;

    const dummyUrl = URL.createObjectURL(file);
    await uploadDocument({
      employeeId: currentEmployee.id,
      categoryId: docDef.categoryId,
      documentTypeCode: docDef.code,
      documentName: docDef.name,
      status: 'for_review',
      privacy: docDef.privacy,
      isRequired: docDef.requirementsByClassification[empClassification] === 'REQUIRED',
      fileUrl: dummyUrl,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      uploadedBy: currentUser?.displayName || 'HR Officer',
      uploaderRole: currentUser?.role || 'hr_staff'
    });
  };

  return (
    <div className="space-y-4 text-xs font-sans">
      
      {/* 1. Header & Personnel Selector */}
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
              <FolderLock className="w-5 h-5 text-[#173B67]" />
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                201 Personnel Document Management
              </h2>
            </div>
            <p className="text-xs text-slate-500">
              15 CSC categories • Classification-aware requirement profiles • Full audit & compliance
            </p>
          </div>
        </div>

        {/* Employee Switcher */}
        <div className="flex items-center space-x-2 w-full md:w-auto">
          <label htmlFor="emp-selector" className="text-slate-500 text-xs font-medium whitespace-nowrap hidden sm:inline">
            Active Record:
          </label>
          <select
            id="emp-selector"
            value={selectedEmpId}
            onChange={(e) => setSelectedEmpId(e.target.value)}
            className="flex-1 md:w-72 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#173B67] cursor-pointer"
          >
            {employees.map(emp => (
              <option key={emp.id} value={emp.id}>
                {emp.lastName}, {emp.firstName} ({emp.classification} • {emp.id})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 2. Employee Profile Card & Classification Badge */}
      {currentEmployee && (
        <div className="bg-gradient-to-r from-[#173B67] to-[#1e4d88] text-white p-4 sm:p-5 rounded-2xl shadow-sm space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center font-bold text-base shrink-0">
                {currentEmployee.firstName.charAt(0)}{currentEmployee.lastName.charAt(0)}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-bold tracking-tight">
                    {currentEmployee.lastName}, {currentEmployee.firstName} {currentEmployee.middleName || ''}
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#F28C28] text-white uppercase tracking-wider">
                    {empClassification}
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] bg-white/20 text-blue-100 font-mono">
                    ID: {currentEmployee.id}
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] bg-white/20 text-blue-100 font-mono">
                    Emp#: {currentEmployee.employeeNumber}
                  </span>
                </div>
                <div className="text-xs text-blue-200 mt-1 flex flex-wrap gap-x-3">
                  <span>{currentEmployee.position}</span>
                  <span>•</span>
                  <span>{currentEmployee.officeName}</span>
                  <span>•</span>
                  <span>Hired: {currentEmployee.hireDate}</span>
                </div>
              </div>
            </div>

            {/* Change Classification Action Button */}
            {hasPermission('edit_employees') && (
              <button
                type="button"
                onClick={() => {
                  setNewClassification(empClassification);
                  setShowClassificationModal(true);
                }}
                className="self-start sm:self-center px-3 py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer shadow-xs min-h-[38px]"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
                <span>Change Classification</span>
              </button>
            )}
          </div>

          {/* 3. Master Compliance Statistics Strip */}
          <div className="pt-3 border-t border-white/10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            <div className="bg-black/15 p-2.5 rounded-xl">
              <span className="text-[10px] text-blue-200 block uppercase font-medium">Compliance Status</span>
              <div className="flex items-center space-x-1 mt-0.5">
                {compliance.isCompliant ? (
                  <span className="text-xs font-bold text-emerald-300 flex items-center">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Fully Compliant
                  </span>
                ) : (
                  <span className="text-xs font-bold text-rose-300 flex items-center">
                    <AlertCircle className="w-3.5 h-3.5 mr-1" /> Non-Compliant
                  </span>
                )}
              </div>
            </div>

            <div className="bg-black/15 p-2.5 rounded-xl">
              <span className="text-[10px] text-blue-200 block uppercase font-medium">Required Verified</span>
              <div className="text-xs font-bold text-white mt-0.5">
                {compliance.verifiedRequired} / {compliance.totalRequired} ({compliance.complianceScore}%)
              </div>
            </div>

            <div className="bg-rose-950/40 border border-rose-500/30 p-2.5 rounded-xl">
              <span className="text-[10px] text-rose-200 block uppercase font-medium">Missing Required (Red)</span>
              <div className="text-xs font-bold text-rose-300 mt-0.5">
                {compliance.missingRequired}
              </div>
            </div>

            <div className="bg-amber-950/40 border border-amber-500/30 p-2.5 rounded-xl">
              <span className="text-[10px] text-amber-200 block uppercase font-medium">Missing Optional (Yellow)</span>
              <div className="text-xs font-bold text-amber-300 mt-0.5">
                {compliance.missingOptional}
              </div>
            </div>

            <div className="bg-blue-950/40 border border-blue-500/30 p-2.5 rounded-xl">
              <span className="text-[10px] text-blue-200 block uppercase font-medium">For Review (Blue)</span>
              <div className="text-xs font-bold text-blue-300 mt-0.5">
                {compliance.forReview}
              </div>
            </div>

            <div className="bg-emerald-950/40 border border-emerald-500/30 p-2.5 rounded-xl">
              <span className="text-[10px] text-emerald-200 block uppercase font-medium">Verified (Green)</span>
              <div className="text-xs font-bold text-emerald-300 mt-0.5">
                {compliance.verified}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Search and Filters Toolbar */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-2.5">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search document name, code, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs focus:ring-2 focus:ring-[#173B67] focus:outline-hidden"
          />
        </div>

        {/* Category Filter */}
        <select
          value={selectedCategoryFilter}
          onChange={(e) => setSelectedCategoryFilter(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 cursor-pointer"
        >
          <option value="all">All 15 Categories</option>
          {MASTER_CATEGORIES.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>

        {/* Requirement Filter */}
        <select
          value={requirementFilter}
          onChange={(e) => setRequirementFilter(e.target.value as any)}
          className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 cursor-pointer"
        >
          <option value="all">All Requirements</option>
          <option value="REQUIRED">Required Only</option>
          <option value="CONDITIONAL">Conditional Only</option>
          <option value="OPTIONAL">Optional Only</option>
        </select>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 cursor-pointer"
        >
          <option value="all">All Statuses</option>
          <option value="missing_required">Missing Required (Red)</option>
          <option value="missing_optional">Missing Optional (Yellow)</option>
          <option value="for_review">For Review (Blue)</option>
          <option value="returned">Returned (Orange)</option>
          <option value="verified">Verified (Green)</option>
        </select>
      </div>

      {/* 5. Master 15 Categories Accordion List */}
      <div className="space-y-3">
        {MASTER_CATEGORIES.filter(c => selectedCategoryFilter === 'all' || c.id === selectedCategoryFilter).map(cat => {
          const isExpanded = expandedCategories[cat.id] ?? false;

          // Filter documents belonging to this category
          const categoryDocs = MASTER_DOCUMENTS.filter(doc => {
            if (doc.categoryId !== cat.id) return false;
            
            // Classification applicability
            const reqLevel = doc.requirementsByClassification[empClassification];
            if (reqLevel === 'NOT_APPLICABLE') return false;

            // Search query filter
            if (searchQuery.trim()) {
              const q = searchQuery.toLowerCase();
              const match = doc.name.toLowerCase().includes(q) || 
                            doc.code.toLowerCase().includes(q) || 
                            doc.description.toLowerCase().includes(q);
              if (!match) return false;
            }

            // Requirement filter
            if (requirementFilter !== 'all' && reqLevel !== requirementFilter) {
              return false;
            }

            // Status filter
            if (statusFilter !== 'all') {
              const statusInfo = getDocStatus(doc);
              if (statusInfo.statusKey !== statusFilter) return false;
            }

            return true;
          });

          if (categoryDocs.length === 0 && (searchQuery || statusFilter !== 'all' || requirementFilter !== 'all')) {
            return null; // hide empty categories during filtered searches
          }

          // Count category breakdown
          const missingReqInCat = categoryDocs.filter(d => getDocStatus(d).statusKey === 'missing_required').length;
          const missingOptInCat = categoryDocs.filter(d => getDocStatus(d).statusKey === 'missing_optional').length;
          const verifiedInCat = categoryDocs.filter(d => getDocStatus(d).statusKey === 'verified').length;

          return (
            <div key={cat.id} className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              
              {/* Category Header Bar */}
              <button
                type="button"
                onClick={() => toggleCategory(cat.id)}
                className="w-full px-4 sm:px-5 py-3.5 bg-slate-50/80 hover:bg-slate-100 flex items-center justify-between text-left transition-colors cursor-pointer"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    cat.isRestrictedCategory ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-[#173B67]'
                  }`}>
                    {cat.isRestrictedCategory ? <Lock className="w-4 h-4" /> : <FolderLock className="w-4 h-4" />}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                        {cat.name}
                      </h4>
                      {cat.isRestrictedCategory && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-100 text-rose-800">
                          Restricted Access
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 truncate hidden sm:block">
                      {cat.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  {missingReqInCat > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                      {missingReqInCat} Missing Required
                    </span>
                  )}
                  {missingOptInCat > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                      {missingOptInCat} Missing Optional
                    </span>
                  )}
                  {missingReqInCat === 0 && verifiedInCat > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                      {verifiedInCat} Verified
                    </span>
                  )}
                  {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                </div>
              </button>

              {/* Category Documents List */}
              {isExpanded && (
                <div className="divide-y divide-slate-100 p-2 sm:p-4 space-y-2">
                  {categoryDocs.length === 0 ? (
                    <div className="p-4 text-center text-slate-400 text-xs">
                      No documents matching current filters in this category.
                    </div>
                  ) : (
                    categoryDocs.map(docDef => {
                      const status = getDocStatus(docDef);
                      const reqLevel = docDef.requirementsByClassification[empClassification];
                      const uploaded = status.uploadedRecord;
                      const isConfidential = docDef.privacy === 'highly_confidential' || docDef.privacy === 'hr_restricted';

                      return (
                        <div 
                          key={docDef.code} 
                          className={`p-3 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                            status.statusKey === 'missing_required' ? 'bg-rose-50/40 border-rose-200' :
                            status.statusKey === 'missing_optional' ? 'bg-amber-50/30 border-amber-200' :
                            status.statusKey === 'returned' ? 'bg-orange-50/40 border-orange-200' :
                            status.statusKey === 'for_review' ? 'bg-blue-50/40 border-blue-200' :
                            'bg-emerald-50/30 border-emerald-200'
                          }`}
                        >
                          {/* Left: Document Info */}
                          <div className="space-y-1 min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="font-mono text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-bold">
                                {docDef.code}
                              </span>
                              <h5 className="font-bold text-slate-900 text-xs">
                                {docDef.name}
                              </h5>
                              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${status.badgeClass} flex items-center space-x-1`}>
                                <status.icon className="w-3 h-3 mr-0.5 inline" />
                                <span>{status.label}</span>
                              </span>
                            </div>

                            <p className="text-[11px] text-slate-500">
                              {docDef.description}
                            </p>

                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-slate-500 pt-0.5">
                              <span>Requirement: <strong className="text-slate-800">{reqLevel}</strong></span>
                              <span>•</span>
                              <span>Submitter: <strong className="text-slate-800">{docDef.submitter}</strong></span>
                              <span>•</span>
                              <span>Access: <strong className={isConfidential ? 'text-amber-800' : 'text-slate-800'}>{docDef.privacy}</strong></span>
                              {docDef.conditionalNotes && docDef.conditionalNotes[empClassification] && (
                                <>
                                  <span>•</span>
                                  <span className="text-blue-800 italic">Note: {docDef.conditionalNotes[empClassification]}</span>
                                </>
                              )}
                            </div>

                            {/* If uploaded, show details */}
                            {uploaded && (
                              <div className="mt-2 p-2 bg-white rounded-lg border border-slate-200 text-[11px] flex flex-wrap items-center justify-between gap-2">
                                <div className="flex items-center space-x-2">
                                  <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                                  <span className="font-semibold text-slate-800 truncate max-w-xs">{uploaded.fileName || docDef.name}</span>
                                  <span className="text-slate-400">({uploaded.uploadedAt ? new Date(uploaded.uploadedAt).toLocaleDateString() : 'Active'})</span>
                                </div>
                                {uploaded.remarks && (
                                  <div className="w-full text-[10px] text-orange-800 bg-orange-50 p-1.5 rounded">
                                    <strong>Remarks:</strong> {uploaded.remarks}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Right: Actions */}
                          <div className="flex flex-wrap items-center gap-1.5 shrink-0 self-end md:self-center">
                            {/* View / Preview */}
                            {uploaded && (
                              <button
                                type="button"
                                onClick={() => setPreviewDoc(uploaded)}
                                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition-colors flex items-center space-x-1 cursor-pointer"
                                title="View Document"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>View</span>
                              </button>
                            )}

                            {/* Direct Verify (HR with permission) */}
                            {uploaded && uploaded.status !== 'verified' && hasPermission('verify_documents') && (
                              <button
                                type="button"
                                onClick={() => verifyDocument(uploaded.id, currentUser?.displayName || 'HR Administrator')}
                                className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors flex items-center space-x-1 cursor-pointer shadow-2xs"
                                title="Verify Document"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Verify</span>
                              </button>
                            )}

                            {/* Return Document (Needs correction) */}
                            {uploaded && uploaded.status !== 'returned' && hasPermission('verify_documents') && (
                              <button
                                type="button"
                                onClick={() => {
                                  setReturnTargetDoc(uploaded);
                                  setReturnRemarks(uploaded.remarks || '');
                                }}
                                className="px-2.5 py-1.5 bg-orange-100 hover:bg-orange-200 text-orange-800 font-bold rounded-lg transition-colors flex items-center space-x-1 cursor-pointer"
                                title="Return for Correction"
                              >
                                <AlertCircle className="w-3.5 h-3.5" />
                                <span>Return</span>
                              </button>
                            )}

                            {/* Upload / Replace Document File */}
                            {hasPermission('upload_documents') && (
                              <label className="px-2.5 py-1.5 bg-[#173B67] hover:bg-[#122e50] text-white font-bold rounded-lg transition-colors flex items-center space-x-1 cursor-pointer shadow-2xs">
                                <Upload className="w-3.5 h-3.5" />
                                <span>{uploaded ? 'Replace' : 'Upload'}</span>
                                <input
                                  type="file"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleFileUpload(docDef, file);
                                  }}
                                />
                              </label>
                            )}

                            {/* Camera / Scanner */}
                            {hasPermission('scan_documents') && (
                              <button
                                type="button"
                                onClick={() => onOpenScanner(docDef.code, docDef.name, cat.id, currentEmployee.id)}
                                className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
                                title="Scan with Camera"
                              >
                                <Camera className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* MODAL 1: RETURN DOCUMENT WITH REMARKS */}
      {returnTargetDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full border border-slate-200 overflow-hidden space-y-4 p-5">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center space-x-2 text-orange-600">
                <AlertCircle className="w-5 h-5" />
                <h3 className="font-bold text-sm text-slate-900">Return Document for Correction</h3>
              </div>
              <button onClick={() => setReturnTargetDoc(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <p className="text-xs text-slate-600">
                Document: <strong className="text-slate-900">{returnTargetDoc.documentName}</strong>
              </p>
              <label htmlFor="return-remarks" className="block text-xs font-bold text-slate-700 mt-3 mb-1">
                Reason for Return / Required Corrections:
              </label>
              <textarea
                id="return-remarks"
                rows={3}
                value={returnRemarks}
                onChange={(e) => setReturnRemarks(e.target.value)}
                placeholder="Specify missing signatures, blurred scan, expired validity, or missing pages..."
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
              />
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setReturnTargetDoc(null)}
                className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-xl font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReturn}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold transition-colors cursor-pointer"
              >
                Return to Personnel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: CHANGE EMPLOYMENT CLASSIFICATION */}
      {showClassificationModal && currentEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full border border-slate-200 overflow-hidden p-5 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center space-x-2 text-[#173B67]">
                <ArrowRightLeft className="w-5 h-5" />
                <h3 className="font-bold text-base text-slate-900">Change Employment Classification</h3>
              </div>
              <button onClick={() => setShowClassificationModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 text-xs space-y-1">
              <div className="font-bold flex items-center">
                <Info className="w-4 h-4 mr-1 text-blue-700" /> Preservation Guarantee
              </div>
              <p className="text-[11px] text-blue-800">
                All existing 201 documents will be safely preserved and retained. The new classification profile will be applied immediately, and previous appointments will remain intact in audit logs.
              </p>
            </div>

            <form onSubmit={handleChangeClassification} className="space-y-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Current Classification</label>
                <div className="font-mono bg-slate-100 px-3 py-2 rounded-xl text-slate-800 font-bold">
                  {currentEmployee.classification}
                </div>
              </div>

              <div>
                <label htmlFor="new-classification" className="block text-slate-700 font-bold mb-1">New Employment Classification</label>
                <select
                  id="new-classification"
                  value={newClassification}
                  onChange={(e) => setNewClassification(e.target.value as EmploymentClassification)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-900 focus:ring-2 focus:ring-[#173B67] focus:outline-hidden cursor-pointer"
                >
                  <option value="Permanent">Permanent (CSC Plantilla)</option>
                  <option value="Temporary">Temporary (CSC Rule)</option>
                  <option value="Casual">Casual</option>
                  <option value="Job Order">Job Order (JO)</option>
                  <option value="Contract of Service">Contract of Service (COS)</option>
                  <option value="Elective Officials">Elective Officials</option>
                </select>
              </div>

              <div>
                <label htmlFor="effective-date" className="block text-slate-700 font-bold mb-1">Effective Date of New Classification</label>
                <input
                  id="effective-date"
                  type="date"
                  required
                  value={classificationEffectiveDate}
                  onChange={(e) => setClassificationEffectiveDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:ring-2 focus:ring-[#173B67] focus:outline-hidden"
                />
              </div>

              <div>
                <label htmlFor="classification-remarks" className="block text-slate-700 font-bold mb-1">Appointment Order / Remarks</label>
                <input
                  id="classification-remarks"
                  type="text"
                  placeholder="e.g. Promoted via CSC Appointment Paper Form 33 #2026-042"
                  value={classificationRemarks}
                  onChange={(e) => setClassificationRemarks(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:ring-2 focus:ring-[#173B67] focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowClassificationModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#173B67] hover:bg-[#122e50] text-white rounded-xl font-bold transition-colors cursor-pointer"
                >
                  Apply New Classification
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: PREVIEW DOCUMENT */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full border border-slate-200 overflow-hidden space-y-4 p-5">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center space-x-2 text-[#173B67]">
                <FileText className="w-5 h-5" />
                <h3 className="font-bold text-base text-slate-900">{previewDoc.documentName}</h3>
              </div>
              <button onClick={() => setPreviewDoc(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center space-y-3 min-h-[220px] flex flex-col items-center justify-center">
              <FileCheck2 className="w-12 h-12 text-[#173B67]" />
              <div>
                <p className="font-bold text-slate-900">{previewDoc.fileName || previewDoc.documentName}</p>
                <p className="text-[11px] text-slate-500">Document Code: {previewDoc.documentTypeCode} • Version {previewDoc.version}</p>
                <p className="text-[11px] text-slate-500">Uploaded By: {previewDoc.uploadedBy} on {previewDoc.uploadedAt ? new Date(previewDoc.uploadedAt).toLocaleString() : 'N/A'}</p>
              </div>
              {previewDoc.fileUrl && (
                <a
                  href={previewDoc.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 bg-[#173B67] text-white rounded-xl font-bold text-xs hover:bg-[#122e50] transition-colors"
                >
                  Open in New Tab
                </a>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t">
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="px-4 py-2 bg-slate-200 text-slate-800 rounded-xl font-bold text-xs hover:bg-slate-300"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
