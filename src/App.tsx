/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { DataProvider, useData } from './context/DataContext.tsx';
import { Header } from './components/common/Header.tsx';
import { LandingPage } from './components/landing/LandingPage.tsx';
import { Sidebar, HRTab } from './components/hr/Sidebar.tsx';
import { HRDashboard } from './components/hr/HRDashboard.tsx';
import { EmployeeMasterlist } from './components/hr/EmployeeMasterlist.tsx';
import { EmployeeProfileModal } from './components/hr/EmployeeProfileModal.tsx';
import { DocumentManager } from './components/hr/DocumentManager.tsx';
import { DocumentRequestsView } from './components/hr/DocumentRequestsView.tsx';
import { LeaveWellnessManager } from './components/hr/LeaveWellnessManager.tsx';
import { OfficeDirectory } from './components/hr/OfficeDirectory.tsx';
import { SALNManager } from './components/hr/SALNManager.tsx';
import { MigrationCenter } from './components/hr/MigrationCenter.tsx';
import { BiometricsManager } from './components/hr/BiometricsManager.tsx';
import { DeveloperCenter } from './components/hr/DeveloperCenter.tsx';
import { AddEmployeeModal } from './components/hr/AddEmployeeModal.tsx';
import { CreateRequestModal } from './components/hr/CreateRequestModal.tsx';
import { ScannerModal } from './components/hr/ScannerModal.tsx';
import { ESSDashboard } from './components/ess/ESSDashboard.tsx';
import { Employee, DocumentCategory } from './types/index.ts';
import { LayoutDashboard, Users, FolderLock, FileText, Menu } from 'lucide-react';

const MainApp: React.FC = () => {
  const { activePortal, setActivePortal, currentUser } = useAuth();
  const { requests, essServiceRequests, leaveApplications, wellnessApplications } = useData();

  // HR Navigation State
  const [activeHRTab, setActiveHRTab] = useState<HRTab>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Modal States
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [selectedProfileEmployee, setSelectedProfileEmployee] = useState<Employee | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const [documentManagerEmp, setDocumentManagerEmp] = useState<Employee | undefined>(undefined);

  // Scanner Modal
  const [showScanner, setShowScanner] = useState(false);
  const [scannerParams, setScannerParams] = useState<{
    docType?: string;
    docName?: string;
    categoryId?: string;
    empId?: string;
  }>({});

  // Create Request Modal
  const [showCreateRequest, setShowCreateRequest] = useState(false);
  const [requestTarget, setRequestTarget] = useState<{
    emp?: Employee;
    cat?: DocumentCategory;
    docName?: string;
  }>({});

  // Handlers
  const handleOpenProfile = (emp: Employee) => {
    setSelectedProfileEmployee(emp);
    setShowProfileModal(true);
  };

  const handleOpen201Files = (emp: Employee) => {
    setDocumentManagerEmp(emp);
    setActiveHRTab('201_files');
  };

  const handleOpenScanner = (docType?: string, docName?: string, categoryId?: string, empId?: string) => {
    setScannerParams({ docType, docName, categoryId, empId });
    setShowScanner(true);
  };

  const handleOpenRequest = (emp: Employee, cat: DocumentCategory, docName: string) => {
    setRequestTarget({ emp, cat, docName });
    setShowCreateRequest(true);
  };

  // 1. If at Landing Page
  if (activePortal === 'landing' || !currentUser) {
    return <LandingPage />;
  }

  // 2. If at Employee Self-Service (ESS)
  if (activePortal === 'ess') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <Header />
        <main className="flex-1">
          <ESSDashboard onOpenScanner={handleOpenScanner} />
        </main>

        <ScannerModal
          isOpen={showScanner}
          onClose={() => setShowScanner(false)}
          targetDocType={scannerParams.docType}
          targetDocName={scannerParams.docName}
          targetCategoryId={scannerParams.categoryId}
          targetEmployeeId={scannerParams.empId}
        />
      </div>
    );
  }

  // 3. HR Management Portal (Approved Soft Blue Theme)
  const pendingRequestsCount = requests.filter(r => r.status === 'requested' || r.status === 'under_review').length + essServiceRequests.filter(r => r.status === 'pending' || r.status === 'processing').length;
  const pendingLeavesCount = leaveApplications.filter(l => l.status.startsWith('pending_')).length;
  const pendingWellnessCount = wellnessApplications.filter(w => w.status.startsWith('pending_')).length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header 
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
        isMobileMenuOpen={isMobileMenuOpen}
      />

      <div className="flex-1 flex overflow-hidden relative">
        {/* Expanded Desktop Sidebar & Slide-in Mobile Drawer */}
        <Sidebar
          activeTab={activeHRTab}
          onSelectTab={(tab) => {
            setActiveHRTab(tab);
            setIsMobileMenuOpen(false);
          }}
          pendingRequestsCount={pendingRequestsCount}
          pendingLeavesCount={pendingLeavesCount}
          pendingWellnessCount={pendingWellnessCount}
          isOpenMobile={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />

        {/* HR Main Workspace Area */}
        <main className="flex-1 p-3.5 sm:p-6 overflow-y-auto max-h-[calc(100vh-3.5rem)] sm:max-h-[calc(100vh-4rem)] pb-24 md:pb-6">
          <div className="max-w-7xl mx-auto">
            
            {activeHRTab === 'dashboard' && (
              <HRDashboard
                onNavigate={setActiveHRTab}
                onOpenAddEmployee={() => setShowAddEmployee(true)}
                onOpenScanner={() => handleOpenScanner()}
              />
            )}

            {(activeHRTab === 'masterlist' || activeHRTab === 'profiles') && (
              <EmployeeMasterlist
                onOpenProfile={handleOpenProfile}
                onOpen201Files={handleOpen201Files}
                onOpenAddModal={() => setShowAddEmployee(true)}
              />
            )}

            {(activeHRTab === '201_files' || activeHRTab === 'verification' || activeHRTab === 'reports_201_compliance') && (
              <DocumentManager
                initialEmployee={documentManagerEmp}
                onOpenScanner={handleOpenScanner}
                onRequestDocument={handleOpenRequest}
                onBackToMasterlist={() => setActiveHRTab('masterlist')}
              />
            )}

            {activeHRTab === 'requests' && (
              <DocumentRequestsView
                onOpenCreateRequest={() => setShowCreateRequest(true)}
              />
            )}

            {(activeHRTab === 'leave' || activeHRTab === 'wellness') && (
              <LeaveWellnessManager />
            )}

            {activeHRTab === 'saln' && (
              <SALNManager />
            )}

            {activeHRTab === 'offices' && (
              <OfficeDirectory />
            )}

            {activeHRTab === 'migration' && (
              <MigrationCenter />
            )}

            {activeHRTab === 'biometrics' && (
              <BiometricsManager />
            )}

            {activeHRTab === 'developer_control' && (
              <DeveloperCenter />
            )}

            {/* Fallback for informational/report submodules */}
            {(activeHRTab === 'reports_employees' || 
              activeHRTab === 'reports_transactions' || 
              activeHRTab === 'travel_orders' || 
              activeHRTab === 'pass_slips' || 
              activeHRTab === 'coe' || 
              activeHRTab === 'other_requests' || 
              activeHRTab === 'overtime' || 
              activeHRTab === 'payroll' || 
              activeHRTab === 'payslips' || 
              activeHRTab === 'training' || 
              activeHRTab === 'performance' ||
              activeHRTab === 'users' ||
              activeHRTab === 'audit_logs' ||
              activeHRTab === 'settings') && (
              <div className="space-y-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 tracking-tight capitalize">
                      {activeHRTab.replace('_', ' ')}
                    </h2>
                    <p className="text-xs text-slate-500">
                      Standard operational records and CSC-compliant registry
                    </p>
                  </div>
                </div>

                <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-blue-100 text-[#173B67] flex items-center justify-center mx-auto font-bold text-sm">
                    HR
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 capitalize">
                    {activeHRTab.replace('_', ' ')} Registry
                  </h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Operating records for this module are active and linked to the municipal employee masterlist and audit history.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveHRTab('masterlist')}
                    className="px-4 py-2 bg-[#173B67] text-white font-bold rounded-xl text-xs hover:bg-[#122e50] cursor-pointer"
                  >
                    View Active Personnel Records
                  </button>
                </div>
              </div>
            )}

          </div>
        </main>

        {/* Mobile Bottom Navigation Bar (Thumb-friendly 44px+ hitboxes) */}
        <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-2xl z-40 px-1 py-1 flex items-center justify-around h-16">
          <button
            type="button"
            onClick={() => setActiveHRTab('dashboard')}
            className={`flex-1 min-h-[48px] flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all cursor-pointer ${
              activeHRTab === 'dashboard' ? 'text-[#173B67] bg-blue-50/80 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span className="text-[10px] mt-0.5 tracking-tight">Dashboard</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveHRTab('masterlist')}
            className={`flex-1 min-h-[48px] flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all cursor-pointer ${
              activeHRTab === 'masterlist' ? 'text-[#173B67] bg-blue-50/80 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span className="text-[10px] mt-0.5 tracking-tight">Personnel</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveHRTab('201_files')}
            className={`flex-1 min-h-[48px] flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all cursor-pointer ${
              activeHRTab === '201_files' ? 'text-[#173B67] bg-blue-50/80 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <FolderLock className="w-4 h-4" />
            <span className="text-[10px] mt-0.5 tracking-tight">201 Files</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveHRTab('requests')}
            className={`flex-1 min-h-[48px] flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all relative cursor-pointer ${
              activeHRTab === 'requests' ? 'text-[#173B67] bg-blue-50/80 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span className="text-[10px] mt-0.5 tracking-tight">Requests</span>
            {pendingRequestsCount > 0 && (
              <span className="absolute top-1 right-3 w-4 h-4 bg-[#F28C28] text-white rounded-full text-[9px] font-bold flex items-center justify-center shadow-xs">
                {pendingRequestsCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(true)}
            className="flex-1 min-h-[48px] flex flex-col items-center justify-center py-1 px-1 rounded-xl text-slate-500 hover:text-slate-800 transition-all cursor-pointer"
          >
            <Menu className="w-4 h-4" />
            <span className="text-[10px] mt-0.5 tracking-tight">All Menu</span>
          </button>
        </nav>

      </div>

      {/* Modals */}
      <AddEmployeeModal
        isOpen={showAddEmployee}
        onClose={() => setShowAddEmployee(false)}
      />

      <EmployeeProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        employee={selectedProfileEmployee}
        onOpen201Files={handleOpen201Files}
      />

      <ScannerModal
        isOpen={showScanner}
        onClose={() => setShowScanner(false)}
        targetDocType={scannerParams.docType}
        targetDocName={scannerParams.docName}
        targetCategoryId={scannerParams.categoryId}
        targetEmployeeId={scannerParams.empId}
      />

      <CreateRequestModal
        isOpen={showCreateRequest}
        onClose={() => setShowCreateRequest(false)}
        presetEmployee={requestTarget.emp}
        presetCategory={requestTarget.cat}
        presetDocName={requestTarget.docName}
      />

    </div>
  );
};

export default function App() {
  return (
    <DataProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </DataProvider>
  );
}
