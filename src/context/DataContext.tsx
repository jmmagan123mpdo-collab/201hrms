import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Employee, 
  Office, 
  DocumentCategory, 
  EmployeeDocument, 
  DocumentRequest, 
  LeaveApplication, 
  WellnessApplication, 
  SALNRecord, 
  SystemNotification, 
  AuditLog, 
  SystemSettings,
  ESSDocumentServiceRequest,
  ESSRequestStatus,
  BiometricRecord,
  BiometricTerminal,
  InteractiveEmailMessage
} from '../types/index.ts';
import {
  createSupervisorLeaveEmail,
  createMayorLeaveEmail,
  createEmployeeApprovedEmail,
  SUPERVISOR_DEFAULT_EMAIL,
  MAYOR_DEFAULT_EMAIL
} from '../data/emailTemplates.ts';
import { 
  INITIAL_EMPLOYEES, 
  INITIAL_OFFICES, 
  INITIAL_CATEGORIES, 
  INITIAL_DOCUMENT_REQUESTS, 
  INITIAL_LEAVE_APPLICATIONS, 
  INITIAL_WELLNESS_APPLICATIONS, 
  INITIAL_SALN_RECORDS, 
  INITIAL_SETTINGS,
  INITIAL_ESS_SERVICE_REQUESTS
} from '../data/initialData.ts';
import { INITIAL_TERMINALS, INITIAL_BIOMETRIC_RECORDS } from '../data/biometricsData.ts';
import { db, testConnection } from '../lib/firebase.ts';
import { collection, getDocs, doc, setDoc, onSnapshot } from 'firebase/firestore';

interface DataContextType {
  employees: Employee[];
  offices: Office[];
  categories: DocumentCategory[];
  documents: EmployeeDocument[];
  requests: DocumentRequest[];
  essServiceRequests: ESSDocumentServiceRequest[];
  leaveApplications: LeaveApplication[];
  wellnessApplications: WellnessApplication[];
  salnRecords: SALNRecord[];
  biometricRecords: BiometricRecord[];
  terminals: BiometricTerminal[];
  notifications: SystemNotification[];
  auditLogs: AuditLog[];
  settings: SystemSettings;
  isFirebaseConnected: boolean;
  interactiveEmails: InteractiveEmailMessage[];
  
  // Actions
  addEmployee: (emp: Omit<Employee, 'id' | 'createdAt' | 'updatedAt' | 'essRegistered'>) => Promise<Employee>;
  updateEmployee: (id: string, updates: Partial<Employee>) => Promise<void>;
  archiveEmployee: (id: string) => Promise<void>;
  
  addOffice: (office: Omit<Office, 'id'>) => Promise<Office>;
  updateOffice: (id: string, updates: Partial<Office>) => Promise<void>;
  
  uploadDocument: (docData: Omit<EmployeeDocument, 'id' | 'uploadedAt' | 'version'>) => Promise<EmployeeDocument>;
  verifyDocument: (docId: string, verifiedBy: string, remarks?: string) => Promise<void>;
  returnDocument: (docId: string, returnedBy: string, remarks: string) => Promise<void>;
  
  createDocumentRequest: (reqData: Omit<DocumentRequest, 'id' | 'requestedAt' | 'status'>) => Promise<DocumentRequest>;
  submitDocumentResponse: (requestId: string, fileName: string, fileUrl: string) => Promise<void>;
  reviewDocumentRequest: (requestId: string, status: 'verified' | 'returned', remarks?: string) => Promise<void>;

  submitESSServiceRequest: (req: Omit<ESSDocumentServiceRequest, 'id' | 'status' | 'submittedAt'>) => Promise<ESSDocumentServiceRequest>;
  updateESSServiceRequestStatus: (id: string, status: ESSRequestStatus, hrRemarks?: string, issuedDocumentUrl?: string, issuedDocumentFileName?: string) => Promise<void>;
  
  submitLeaveApplication: (app: Omit<LeaveApplication, 'id' | 'createdAt' | 'status'>) => Promise<LeaveApplication>;
  processSupervisorLeave: (id: string, decision: 'Approved' | 'Disapproved', remarks: string, supervisorName: string) => Promise<void>;
  processMayorLeave: (id: string, decision: 'Approved' | 'Disapproved', remarks: string, mayorName: string) => Promise<void>;
  processHRFinalLeave: (id: string, decision: 'Approved' | 'Disapproved' | 'Returned', remarks: string, hrOfficerName: string) => Promise<void>;
  addHRClarification: (leaveId: string, clarificationText: string, hrOfficerName: string) => Promise<void>;
  markEmailActionTaken: (emailId: string, action: 'approved' | 'disapproved' | 'printed') => void;
  
  submitWellnessApplication: (app: Omit<WellnessApplication, 'id' | 'createdAt' | 'status'>) => Promise<WellnessApplication>;
  processSupervisorWellness: (id: string, assessment: string, supervisorName: string) => Promise<void>;
  processHeadWellness: (id: string, decision: string, remarks: string, headName: string) => Promise<void>;
  
  submitSALN: (employeeId: string, filingType: 'Annual' | 'Entry' | 'Exit', asOfDate: string, docUrl?: string, netWorth?: number) => Promise<void>;
  verifySALN: (id: string, verifiedBy: string) => Promise<void>;

  // Biometrics & Daily Attendance Actions
  syncBiometrics: (terminalId?: string) => Promise<{ syncedCount: number; newLogsCount: number }>;
  addOrUpdateBiometricRecord: (record: BiometricRecord) => Promise<void>;
  verifyBiometricRecord: (recordId: string, verifiedBy: string) => Promise<void>;
  
  addAuditLog: (action: string, targetEntity: string, targetId: string, details: string, actorName?: string, actorRole?: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  addNotification: (notif: Omit<SystemNotification, 'id' | 'createdAt'>) => void;
  updateSettings: (newSettings: Partial<SystemSettings>) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isFirebaseConnected, setIsFirebaseConnected] = useState(false);
  
  // State with LocalStorage & Firestore sync
  const [employees, setEmployees] = useState<Employee[]>(() => {
    const saved = localStorage.getItem('sjhr201_employees');
    return saved ? JSON.parse(saved) : INITIAL_EMPLOYEES;
  });

  const [offices, setOffices] = useState<Office[]>(() => {
    const saved = localStorage.getItem('sjhr201_offices');
    return saved ? JSON.parse(saved) : INITIAL_OFFICES;
  });

  const [categories] = useState<DocumentCategory[]>(INITIAL_CATEGORIES);

  const [documents, setDocuments] = useState<EmployeeDocument[]>(() => {
    const saved = localStorage.getItem('sjhr201_documents');
    if (saved) return JSON.parse(saved);
    // Seed initial documents for first 2 employees
    return [
      {
        id: 'doc-001',
        employeeId: 'EMP-2022-001',
        categoryId: 'cat-01',
        documentTypeCode: 'PDS_212',
        documentName: 'Personal Data Sheet (CS Form 212 Revised 2017)',
        status: 'verified',
        privacy: 'employee_accessible',
        isRequired: true,
        fileName: 'PDS_MariaSantosReyes_2024.pdf',
        fileSize: 2450000,
        uploadedBy: 'Elena Castillo',
        uploaderRole: 'hr_admin',
        uploadedAt: '2024-03-10T10:00:00.000Z',
        verifiedBy: 'Elena Castillo',
        verifiedAt: '2024-03-10T14:00:00.000Z',
        version: 1
      },
      {
        id: 'doc-002',
        employeeId: 'EMP-2022-001',
        categoryId: 'cat-02',
        documentTypeCode: 'APPOINTMENT_PAPER',
        documentName: 'CSC Attested Appointment Paper',
        status: 'verified',
        privacy: 'employee_accessible',
        isRequired: true,
        fileName: 'CSC_Appointment_HRMO_II_MSReyes.pdf',
        fileSize: 1820000,
        uploadedBy: 'Ricardo Manalo',
        uploaderRole: 'hr_staff',
        uploadedAt: '2022-04-01T08:00:00.000Z',
        verifiedBy: 'Elena Castillo',
        verifiedAt: '2022-04-02T09:00:00.000Z',
        version: 1
      },
      {
        id: 'doc-003',
        employeeId: 'EMP-2022-001',
        categoryId: 'cat-07',
        documentTypeCode: 'SALN_ANNUAL',
        documentName: 'Sworn Annual SALN Form (CSC Revised 2015)',
        status: 'missing_required',
        privacy: 'hr_restricted',
        isRequired: true,
        version: 0
      },
      {
        id: 'doc-004',
        employeeId: 'EMP-2023-045',
        categoryId: 'cat-01',
        documentTypeCode: 'PDS_212',
        documentName: 'Personal Data Sheet (CS Form 212 Revised 2017)',
        status: 'verified',
        privacy: 'employee_accessible',
        isRequired: true,
        fileName: 'PDS_Juan_DelaCruz_2025.pdf',
        fileSize: 3100000,
        uploadedBy: 'Juan Dela Cruz',
        uploaderRole: 'employee',
        uploadedAt: '2025-01-20T11:00:00.000Z',
        verifiedBy: 'Elena Castillo',
        verifiedAt: '2025-01-22T10:00:00.000Z',
        version: 1
      }
    ];
  });

  const [requests, setRequests] = useState<DocumentRequest[]>(() => {
    const saved = localStorage.getItem('sjhr201_requests');
    return saved ? JSON.parse(saved) : INITIAL_DOCUMENT_REQUESTS;
  });

  const [essServiceRequests, setEssServiceRequests] = useState<ESSDocumentServiceRequest[]>(() => {
    const saved = localStorage.getItem('sjhr201_ess_service_requests');
    return saved ? JSON.parse(saved) : INITIAL_ESS_SERVICE_REQUESTS;
  });

  const [leaveApplications, setLeaveApplications] = useState<LeaveApplication[]>(() => {
    const saved = localStorage.getItem('sjhr201_leave_applications');
    return saved ? JSON.parse(saved) : INITIAL_LEAVE_APPLICATIONS;
  });

  const [wellnessApplications, setWellnessApplications] = useState<WellnessApplication[]>(() => {
    const saved = localStorage.getItem('sjhr201_wellness_applications');
    return saved ? JSON.parse(saved) : INITIAL_WELLNESS_APPLICATIONS;
  });

  const [salnRecords, setSalnRecords] = useState<SALNRecord[]>(() => {
    const saved = localStorage.getItem('sjhr201_saln_records');
    return saved ? JSON.parse(saved) : INITIAL_SALN_RECORDS;
  });

  const [biometricRecords, setBiometricRecords] = useState<BiometricRecord[]>(() => {
    const saved = localStorage.getItem('sjhr201_biometric_records');
    return saved ? JSON.parse(saved) : INITIAL_BIOMETRIC_RECORDS;
  });

  const [terminals, setTerminals] = useState<BiometricTerminal[]>(() => {
    const saved = localStorage.getItem('sjhr201_terminals');
    return saved ? JSON.parse(saved) : INITIAL_TERMINALS;
  });

  const [notifications, setNotifications] = useState<SystemNotification[]>(() => {
    const defaultNotifs: SystemNotification[] = [
      {
        id: 'notif-ps-2026-02',
        recipientRole: 'employee',
        recipientEmployeeId: 'EMP-2022-001',
        title: 'February 2026 Payslip Available',
        message: 'Your official monthly electronic payslip for February 2026 is now available. Net Take-Home Pay: ₱32,699.00 disbursed via Landbank ATM Payroll.',
        type: 'payslip_available',
        targetTab: 'payslips',
        actionLabel: 'View Payslip',
        isRead: false,
        createdAt: '2026-02-10T16:30:00.000Z'
      },
      {
        id: 'notif-leave-001',
        recipientRole: 'employee',
        recipientEmployeeId: 'EMP-2022-001',
        title: 'Leave Approved: CSC Form 6 (Vacation)',
        message: 'Your 3-day Vacation Leave application (Feb 18-20, 2026) has been approved by Municipal Mayor Rey P. Ladaga and recorded by MHRMO.',
        type: 'leave_update',
        targetTab: 'leave',
        actionLabel: 'View Approval',
        isRead: false,
        createdAt: '2026-02-09T11:15:00.000Z'
      },
      {
        id: 'notif-doc-saln-01',
        recipientRole: 'employee',
        recipientEmployeeId: 'EMP-2022-001',
        title: 'New Document Request: Annual SALN',
        message: 'MHRMO Compliance: The HR Office has requested your Annual SALN Form as of Dec 31, 2025. Due date: April 15, 2026.',
        type: 'document_request',
        targetTab: 'requests',
        actionLabel: 'Upload SALN',
        isRead: false,
        createdAt: '2026-02-08T09:05:00.000Z'
      },
      {
        id: 'notif-coe-001',
        recipientRole: 'employee',
        recipientEmployeeId: 'EMP-2022-001',
        title: 'COE Service Request Ready',
        message: 'Your Certificate of Employment (COE) with Compensation is officially sealed by MHRMO and ready for download or municipal pickup.',
        type: 'ess_request_ready',
        targetTab: 'requests',
        actionLabel: 'Download COE',
        isRead: false,
        createdAt: '2026-02-07T14:20:00.000Z'
      },
      {
        id: 'notif-doc-ver-01',
        recipientRole: 'employee',
        recipientEmployeeId: 'EMP-2022-001',
        title: '201 Document Verified: Appointment Paper',
        message: 'Your CSC Attested Permanent Appointment (HRMO II) has been verified and permanently cataloged under Category B in your 201 Digital File.',
        type: 'verification',
        targetTab: '201_files',
        actionLabel: 'View 201 Files',
        isRead: true,
        createdAt: '2026-02-03T10:00:00.000Z'
      },
      {
        id: 'notif-ps-2026-01',
        recipientRole: 'employee',
        recipientEmployeeId: 'EMP-2022-001',
        title: 'January 2026 Payslip Available',
        message: 'Your January 2026 computerized payroll extract is archived and accessible in your Payslip History.',
        type: 'payslip_available',
        targetTab: 'payslips',
        actionLabel: 'View Payslip',
        isRead: true,
        createdAt: '2026-01-31T17:00:00.000Z'
      },
      {
        id: 'notif-hr-01',
        recipientRole: 'hr_staff',
        title: 'Document Submitted for Review',
        message: 'Juan Dela Cruz submitted IPCR Form (2nd Semester 2025) for verification.',
        type: 'submission',
        targetPath: 'verification',
        isRead: false,
        createdAt: '2026-02-05T14:23:00.000Z'
      }
    ];

    const saved = localStorage.getItem('sjhr201_notifications');
    if (saved) {
      try {
        const parsed: SystemNotification[] = JSON.parse(saved);
        // Ensure new notification types are merged if user had older localStorage
        const hasPayslipNotif = parsed.some(n => n.type === 'payslip_available');
        if (!hasPayslipNotif) {
          const merged = [...defaultNotifs.filter(d => !parsed.some(p => p.id === d.id)), ...parsed];
          localStorage.setItem('sjhr201_notifications', JSON.stringify(merged));
          return merged;
        }
        return parsed;
      } catch {
        return defaultNotifs;
      }
    }
    return defaultNotifs;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('sjhr201_audit_logs');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'log-1',
        actorUid: 'usr-developer',
        actorName: 'Lead System Developer',
        actorRole: 'Developer',
        action: 'System Initialization',
        targetEntity: 'System',
        targetId: 'SJHR201',
        details: 'Initial system boot and municipal database schema loaded for San Jose, Occidental Mindoro.',
        timestamp: '2026-02-10T08:00:00.000Z'
      }
    ];
  });

  const [settings, setSettings] = useState<SystemSettings>(() => {
    const saved = localStorage.getItem('sjhr201_settings');
    return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
  });

  const [interactiveEmails, setInteractiveEmails] = useState<InteractiveEmailMessage[]>(() => {
    const saved = localStorage.getItem('sjhr201_interactive_emails');
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return [
      {
        id: 'email-init-01',
        leaveId: 'LV-2026-001',
        toEmail: SUPERVISOR_DEFAULT_EMAIL,
        recipientName: 'Engr. Juan Miguel Magan (Immediate Supervisor / MPDO Head)',
        recipientRole: 'supervisor',
        subject: '[ACTION REQUIRED] CSC Form 6 Leave Application for Endorsement: Maria Santos Reyes (Vacation Leave)',
        sentAt: '2026-02-10T08:30:00.000Z',
        status: 'sent',
        employeeName: 'Maria Santos Reyes',
        officeName: 'Municipal Planning and Development Office',
        position: 'Planning Officer II',
        leaveType: 'Vacation',
        workingDays: 3,
        inclusiveDates: 'February 16 - 18, 2026',
        detailsOfLeave: 'Family wellness and rest'
      },
      {
        id: 'email-init-02',
        leaveId: 'LV-2026-002',
        toEmail: MAYOR_DEFAULT_EMAIL,
        recipientName: 'Hon. Rey P. Ladaga (Municipal Mayor)',
        recipientRole: 'mayor',
        subject: '[FOR EXECUTIVE APPROVAL] Endorsed Leave Application (CSC Form 6) – Juan Dela Cruz | Endorsed by Supv. Engr. Juan Miguel Magan',
        sentAt: '2026-02-09T10:00:00.000Z',
        status: 'sent',
        employeeName: 'Juan Dela Cruz',
        officeName: 'Municipal Health Office',
        position: 'Administrative Aide IV',
        leaveType: 'Sick',
        workingDays: 2,
        inclusiveDates: 'February 12 - 13, 2026',
        detailsOfLeave: 'Acute gastroenteritis (Medical certificate attached)',
        supervisorEndorsement: {
          endorsedBy: 'Engr. Juan Miguel Magan, MPDO Head',
          endorsedAt: '2026-02-09T09:45:00.000Z',
          remarks: 'Endorsed for executive approval. Office duty assignment covered.'
        }
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('sjhr201_interactive_emails', JSON.stringify(interactiveEmails));
  }, [interactiveEmails]);

  // Verify connection to Firestore on boot
  useEffect(() => {
    testConnection().then(connected => {
      setIsFirebaseConnected(connected);
    });
  }, []);

  // Keep the shared employee master record live across HR Management and ESS.
  // Firestore is authoritative whenever employee documents are available.
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'employees'),
      snapshot => {
        if (!snapshot.empty) {
          const liveEmployees = snapshot.docs.map(item => ({ ...item.data(), id: item.id } as Employee));
          setEmployees(liveEmployees);
          setIsFirebaseConnected(true);
        }
      },
      error => {
        console.error('Employee live synchronization failed:', error);
        setIsFirebaseConnected(false);
      }
    );
    return () => unsubscribe();
  }, []);

  // Save changes to LocalStorage for offline reliability
  useEffect(() => {
    localStorage.setItem('sjhr201_employees', JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem('sjhr201_offices', JSON.stringify(offices));
  }, [offices]);

  useEffect(() => {
    localStorage.setItem('sjhr201_documents', JSON.stringify(documents));
  }, [documents]);

  useEffect(() => {
    localStorage.setItem('sjhr201_requests', JSON.stringify(requests));
  }, [requests]);

  useEffect(() => {
    localStorage.setItem('sjhr201_ess_service_requests', JSON.stringify(essServiceRequests));
  }, [essServiceRequests]);

  useEffect(() => {
    localStorage.setItem('sjhr201_leave_applications', JSON.stringify(leaveApplications));
  }, [leaveApplications]);

  useEffect(() => {
    localStorage.setItem('sjhr201_wellness_applications', JSON.stringify(wellnessApplications));
  }, [wellnessApplications]);

  useEffect(() => {
    localStorage.setItem('sjhr201_saln_records', JSON.stringify(salnRecords));
  }, [salnRecords]);

  useEffect(() => {
    localStorage.setItem('sjhr201_biometric_records', JSON.stringify(biometricRecords));
  }, [biometricRecords]);

  useEffect(() => {
    localStorage.setItem('sjhr201_terminals', JSON.stringify(terminals));
  }, [terminals]);

  useEffect(() => {
    localStorage.setItem('sjhr201_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('sjhr201_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem('sjhr201_settings', JSON.stringify(settings));
  }, [settings]);

  // Logging helper
  const addAuditLog = (
    action: string, 
    targetEntity: string, 
    targetId: string, 
    details: string,
    actorName = 'System User',
    actorRole = 'HR Personnel'
  ) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      actorUid: 'usr-current',
      actorName,
      actorRole,
      action,
      targetEntity,
      targetId,
      details,
      timestamp: new Date().toISOString()
    };
    setAuditLogs(prev => [newLog, ...prev]);

    // Async write to Firestore auditLogs
    try {
      setDoc(doc(db, 'auditLogs', newLog.id), newLog).catch(() => {});
    } catch (e) {}
  };

  // Actions
  const addEmployee = async (empData: Omit<Employee, 'id' | 'createdAt' | 'updatedAt' | 'essRegistered'>): Promise<Employee> => {
    const count = employees.length + 1;
    const year = new Date().getFullYear();
    const newId = `EMP-${year}-${String(count).padStart(3, '0')}`;
    
    const newEmp: Employee = {
      ...empData,
      id: newId,
      essRegistered: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setEmployees(prev => [newEmp, ...prev]);
    addAuditLog('Add Employee', 'Employee', newEmp.id, `Created employee record for ${newEmp.firstName} ${newEmp.lastName} (${newEmp.employeeNumber})`);

    // Async sync to Firestore
    try {
      await setDoc(doc(db, 'employees', newEmp.id), newEmp);
    } catch (err) {}

    return newEmp;
  };

  const updateEmployee = async (id: string, updates: Partial<Employee>): Promise<void> => {
    const existing = employees.find(e => e.id === id);
    if (!existing) return;

    // Check if employeeNumber changed - keep previous employee numbers in history!
    let prevList = existing.previousEmployeeNumbers || [];
    if (updates.employeeNumber && updates.employeeNumber !== existing.employeeNumber) {
      prevList = [...prevList, existing.employeeNumber];
    }

    const updated: Employee = {
      ...existing,
      ...updates,
      previousEmployeeNumbers: prevList,
      updatedAt: new Date().toISOString()
    };

    // Persist first. Do not report a successful update when Firestore rejects it.
    await setDoc(doc(db, 'employees', id), updated);
    setEmployees(prev => prev.map(e => e.id === id ? updated : e));
    addAuditLog('Edit Employee', 'Employee', id, `Updated information for ${updated.firstName} ${updated.lastName}`);
  };

  const archiveEmployee = async (id: string): Promise<void> => {
    setEmployees(prev => prev.map(e => e.id === id ? { ...e, recordStatus: 'Archived', updatedAt: new Date().toISOString() } : e));
    addAuditLog('Archive Employee', 'Employee', id, `Archived personnel record`);
  };

  const addOffice = async (officeData: Omit<Office, 'id'>): Promise<Office> => {
    const newOffice: Office = {
      ...officeData,
      id: `off-${Date.now()}`
    };
    setOffices(prev => [...prev, newOffice]);
    addAuditLog('Add Office', 'Office', newOffice.id, `Added municipal office ${newOffice.name}`);
    return newOffice;
  };

  const updateOffice = async (id: string, updates: Partial<Office>): Promise<void> => {
    setOffices(prev => prev.map(o => o.id === id ? { ...o, ...updates } : o));
    addAuditLog('Update Office', 'Office', id, `Updated office details`);
  };

  const uploadDocument = async (docData: Omit<EmployeeDocument, 'id' | 'uploadedAt' | 'version'>): Promise<EmployeeDocument> => {
    const existingDoc = documents.find(d => 
      d.employeeId === docData.employeeId && 
      d.categoryId === docData.categoryId && 
      d.documentTypeCode === docData.documentTypeCode
    );

    const version = existingDoc ? existingDoc.version + 1 : 1;
    const newDoc: EmployeeDocument = {
      ...docData,
      id: existingDoc ? existingDoc.id : `doc-${Date.now()}`,
      version,
      uploadedAt: new Date().toISOString(),
      history: existingDoc ? [
        ...(existingDoc.history || []),
        {
          version: existingDoc.version,
          fileUrl: existingDoc.fileUrl || '',
          uploadedAt: existingDoc.uploadedAt || '',
          uploadedBy: existingDoc.uploadedBy || 'HR'
        }
      ] : []
    };

    if (existingDoc) {
      setDocuments(prev => prev.map(d => d.id === newDoc.id ? newDoc : d));
    } else {
      setDocuments(prev => [...prev, newDoc]);
    }

    addAuditLog('Upload Document', '201 Document', newDoc.id, `Uploaded ${newDoc.documentName} for employee ${newDoc.employeeId}`);

    try {
      await setDoc(doc(db, 'employeeDocuments', newDoc.id), newDoc);
    } catch (e) {}

    return newDoc;
  };

  const verifyDocument = async (docId: string, verifiedBy: string, remarks?: string): Promise<void> => {
    setDocuments(prev => prev.map(d => {
      if (d.id === docId) {
        return {
          ...d,
          status: 'verified',
          verifiedBy,
          verifiedAt: new Date().toISOString(),
          remarks: remarks || d.remarks
        };
      }
      return d;
    }));
    addAuditLog('Verify Document', '201 Document', docId, `Verified document by ${verifiedBy}`);
  };

  const returnDocument = async (docId: string, returnedBy: string, remarks: string): Promise<void> => {
    setDocuments(prev => prev.map(d => {
      if (d.id === docId) {
        return {
          ...d,
          status: 'returned',
          remarks
        };
      }
      return d;
    }));
    addAuditLog('Return Document', '201 Document', docId, `Returned document with remarks: ${remarks}`);
  };

  const createDocumentRequest = async (reqData: Omit<DocumentRequest, 'id' | 'requestedAt' | 'status'>): Promise<DocumentRequest> => {
    const newReq: DocumentRequest = {
      ...reqData,
      id: `req-${Date.now()}`,
      status: 'requested',
      requestedAt: new Date().toISOString()
    };
    setRequests(prev => [newReq, ...prev]);

    // Send in-app notification to employee
    const newNotif: SystemNotification = {
      id: `notif-${Date.now()}`,
      recipientRole: 'employee',
      title: `HR Document Request: ${newReq.documentName}`,
      message: `HR requested: ${newReq.documentName}. Instructions: ${newReq.instructions} (Due: ${newReq.dueDate})`,
      type: 'document_request',
      targetPath: 'requests',
      isRead: false,
      createdAt: new Date().toISOString()
    };
    setNotifications(prev => [newNotif, ...prev]);

    addAuditLog('Request Document', 'Document Request', newReq.id, `Requested ${newReq.documentName} from ${newReq.employeeName}`);
    return newReq;
  };

  const submitDocumentResponse = async (requestId: string, fileName: string, fileUrl: string): Promise<void> => {
    setRequests(prev => prev.map(r => {
      if (r.id === requestId) {
        return {
          ...r,
          status: 'under_review',
          submittedFileName: fileName,
          submittedFileUrl: fileUrl,
          submittedAt: new Date().toISOString()
        };
      }
      return r;
    }));

    // Notify HR
    const newNotif: SystemNotification = {
      id: `notif-${Date.now()}`,
      recipientRole: 'hr_staff',
      title: `Document Submitted for Review`,
      message: `Personnel submitted file for request ID ${requestId}`,
      type: 'submission',
      targetPath: 'verification',
      isRead: false,
      createdAt: new Date().toISOString()
    };
    setNotifications(prev => [newNotif, ...prev]);
    addAuditLog('Submit Request Response', 'Document Request', requestId, `Personnel uploaded file ${fileName}`);
  };

  const reviewDocumentRequest = async (requestId: string, status: 'verified' | 'returned', remarks?: string): Promise<void> => {
    setRequests(prev => prev.map(r => {
      if (r.id === requestId) {
        return {
          ...r,
          status,
          reviewRemarks: remarks
        };
      }
      return r;
    }));
    addAuditLog('Review Document Request', 'Document Request', requestId, `Status updated to ${status}`);
  };

  const submitESSServiceRequest = async (req: Omit<ESSDocumentServiceRequest, 'id' | 'status' | 'submittedAt'>): Promise<ESSDocumentServiceRequest> => {
    const newReq: ESSDocumentServiceRequest = {
      ...req,
      id: `ESSR-${new Date().getFullYear()}-${String(essServiceRequests.length + 1).padStart(3, '0')}`,
      trackingNumber: `MHRMO-${req.requestType}-${new Date().getFullYear()}-${String(Math.floor(1000 + Math.random() * 9000))}`,
      status: 'pending',
      submittedAt: new Date().toISOString()
    };
    setEssServiceRequests(prev => [newReq, ...prev]);

    // Create notification for HR
    const newNotif: SystemNotification = {
      id: `notif-${Date.now()}`,
      recipientRole: 'hr_staff',
      title: `New Employee Request: ${req.title}`,
      message: `${req.employeeName} (${req.officeName}) requested ${req.title} for ${req.purpose}.`,
      type: 'document_request',
      targetPath: 'requests',
      isRead: false,
      createdAt: new Date().toISOString()
    };
    setNotifications(prev => [newNotif, ...prev]);
    addAuditLog('Submit ESS Request', 'ESS Service Request', newReq.id, `${req.employeeName} submitted request for ${req.title}`);
    return newReq;
  };

  const updateESSServiceRequestStatus = async (
    id: string, 
    status: ESSRequestStatus, 
    hrRemarks?: string, 
    issuedDocumentUrl?: string, 
    issuedDocumentFileName?: string
  ): Promise<void> => {
    const now = new Date().toISOString();
    setEssServiceRequests(prev => prev.map(r => {
      if (r.id === id) {
        return {
          ...r,
          status,
          hrRemarks: hrRemarks !== undefined ? hrRemarks : r.hrRemarks,
          issuedDocumentUrl: issuedDocumentUrl || r.issuedDocumentUrl || '#',
          issuedDocumentFileName: issuedDocumentFileName || r.issuedDocumentFileName,
          processedAt: status === 'processing' || status === 'ready' || status === 'released' ? (r.processedAt || now) : r.processedAt,
          readyAt: status === 'ready' ? now : r.readyAt,
          releasedAt: status === 'released' ? now : r.releasedAt
        };
      }
      return r;
    }));

    // Notify employee
    const target = essServiceRequests.find(r => r.id === id);
    if (target) {
      const newNotif: SystemNotification = {
        id: `notif-${Date.now()}`,
        recipientRole: 'employee',
        title: `Request ${status === 'ready' ? 'Ready for Pickup / Download' : status === 'released' ? 'Released' : status === 'processing' ? 'Processing' : 'Status Updated'}: ${target.title}`,
        message: hrRemarks || `Your request for ${target.title} is now ${status.replace('_', ' ')}.`,
        type: 'verification',
        targetPath: 'requests',
        isRead: false,
        createdAt: now
      };
      setNotifications(prev => [newNotif, ...prev]);
    }
    addAuditLog('Update ESS Request Status', 'ESS Service Request', id, `Updated to ${status}${hrRemarks ? `: ${hrRemarks}` : ''}`);
  };

  const submitLeaveApplication = async (app: Omit<LeaveApplication, 'id' | 'createdAt' | 'status'>): Promise<LeaveApplication> => {
    const newApp: LeaveApplication = {
      ...app,
      id: `LV-${new Date().getFullYear()}-${String(leaveApplications.length + 1).padStart(3, '0')}`,
      status: 'pending_supervisor',
      supervisorEmail: SUPERVISOR_DEFAULT_EMAIL,
      mayorEmail: MAYOR_DEFAULT_EMAIL,
      createdAt: new Date().toISOString()
    };
    setLeaveApplications(prev => [newApp, ...prev]);

    // 1. Automatically dispatch interactive email to supervisor
    const supervisorEmailMsg = createSupervisorLeaveEmail(newApp, SUPERVISOR_DEFAULT_EMAIL);
    setInteractiveEmails(prev => [supervisorEmailMsg, ...prev]);

    // Dispatch notification
    const newNotif: SystemNotification = {
      id: `notif-${Date.now()}`,
      recipientRole: 'employee',
      title: 'Leave Submitted & Interactive Email Dispatched',
      message: `Your CSC Form 6 leave application (${newApp.id}) was submitted. Interactive email automatically sent to Immediate Supervisor (${SUPERVISOR_DEFAULT_EMAIL}) for endorsement.`,
      type: 'verification',
      targetPath: 'leave',
      isRead: false,
      createdAt: new Date().toISOString()
    };
    setNotifications(prev => [newNotif, ...prev]);

    addAuditLog('File Leave & Auto-Dispatch Email', 'Leave', newApp.id, `${newApp.employeeName} applied for ${newApp.leaveType} leave. Interactive email automatically sent to supervisor (${SUPERVISOR_DEFAULT_EMAIL}).`);
    return newApp;
  };

  const processSupervisorLeave = async (id: string, decision: 'Approved' | 'Disapproved', remarks: string, supervisorName: string): Promise<void> => {
    let targetLeave: LeaveApplication | undefined;

    setLeaveApplications(prev => prev.map(l => {
      if (l.id === id) {
        targetLeave = {
          ...l,
          supervisorAssessment: decision,
          supervisorRemarks: remarks,
          supervisorName,
          supervisorDate: new Date().toISOString(),
          status: decision === 'Approved' ? 'pending_mayor' : 'disapproved'
        };
        return targetLeave;
      }
      return l;
    }));

    // Update supervisor email status
    setInteractiveEmails(prev => prev.map(e => e.leaveId === id && e.recipientRole === 'supervisor' ? {
      ...e,
      status: 'action_taken',
      actionTaken: decision === 'Approved' ? 'approved' : 'disapproved',
      actionTakenAt: new Date().toISOString()
    } : e));

    if (decision === 'Approved' && targetLeave) {
      // 2. Automatically dispatch interactive email with approved supervisor to Municipal Mayor
      const mayorEmailMsg = createMayorLeaveEmail(targetLeave, MAYOR_DEFAULT_EMAIL);
      setInteractiveEmails(prev => [mayorEmailMsg, ...prev]);

      const hrNotif: SystemNotification = {
        id: `notif-${Date.now()}`,
        recipientRole: 'hr_staff',
        title: `Supervisor Endorsed Leave (${id})`,
        message: `Supervisor ${supervisorName} endorsed leave for ${targetLeave.employeeName}. Interactive email automatically forwarded to Municipal Mayor (${MAYOR_DEFAULT_EMAIL}).`,
        type: 'verification',
        targetPath: 'leave',
        isRead: false,
        createdAt: new Date().toISOString()
      };
      setNotifications(prev => [hrNotif, ...prev]);
    }

    addAuditLog('Supervisor Leave Assessment', 'Leave', id, `Supervisor ${supervisorName} marked leave as ${decision}. ${decision === 'Approved' ? `Forwarded via interactive email to Mayor (${MAYOR_DEFAULT_EMAIL})` : ''}`);
  };

  const processMayorLeave = async (id: string, decision: 'Approved' | 'Disapproved', remarks: string, mayorName: string): Promise<void> => {
    let targetLeave: LeaveApplication | undefined;

    setLeaveApplications(prev => prev.map(l => {
      if (l.id === id) {
        targetLeave = {
          ...l,
          mayorDecision: decision,
          mayorRemarks: remarks,
          mayorName,
          mayorDate: new Date().toISOString(),
          status: decision === 'Approved' ? 'pending_hr_final' : 'disapproved'
        };
        return targetLeave;
      }
      return l;
    }));

    // Update mayor email status
    setInteractiveEmails(prev => prev.map(e => e.leaveId === id && e.recipientRole === 'mayor' ? {
      ...e,
      status: 'action_taken',
      actionTaken: decision === 'Approved' ? 'approved' : 'disapproved',
      actionTakenAt: new Date().toISOString()
    } : e));

    if (decision === 'Approved' && targetLeave) {
      // 3. Saved in app database for HR review & clarification
      const hrNotif: SystemNotification = {
        id: `notif-${Date.now()}`,
        recipientRole: 'hr_staff',
        title: `Mayor Approved Leave (${id}) – Staged for HR Review`,
        message: `Municipal Mayor approved leave for ${targetLeave.employeeName}. Form is saved in app for HR verification, clarifications, and final recording.`,
        type: 'verification',
        targetPath: 'leave',
        isRead: false,
        createdAt: new Date().toISOString()
      };
      setNotifications(prev => [hrNotif, ...prev]);
    }

    addAuditLog('Mayor Leave Decision', 'Leave', id, `Head of Agency decision: ${decision}. Application saved in app database for HR Stage 4 & 5 recording.`);
  };

  const processHRFinalLeave = async (id: string, decision: 'Approved' | 'Disapproved' | 'Returned', remarks: string, hrOfficerName: string): Promise<void> => {
    let targetLeave: LeaveApplication | undefined;

    setLeaveApplications(prev => prev.map(l => {
      if (l.id === id) {
        targetLeave = {
          ...l,
          hrReviewRemarks: remarks,
          hrRecordedBy: hrOfficerName,
          hrRecordedAt: new Date().toISOString(),
          hrFinalAction: decision === 'Approved' ? 'Accepted & Finalized' : decision === 'Disapproved' ? 'Rejected' : 'Returned',
          status: decision === 'Approved' ? 'approved' : decision === 'Disapproved' ? 'disapproved' : 'returned_hr'
        };
        return targetLeave;
      }
      return l;
    }));

    if (decision === 'Approved' && targetLeave) {
      // 4. Automatically dispatch sealed approved form email to employee to print for Accomplishment Report
      const empEmailMsg = createEmployeeApprovedEmail(targetLeave, targetLeave.employeeEmail || 'maria.santos@sanjose.gov.ph');
      setInteractiveEmails(prev => [empEmailMsg, ...prev]);

      const empNotif: SystemNotification = {
        id: `notif-${Date.now()}`,
        recipientRole: 'employee',
        title: `Approved CSC Form 6 (${id}) Ready to Print`,
        message: `Your CSC Form 6 leave application is fully approved and recorded by MHRMO. Print your certified form now to attach to your Monthly Accomplishment Report (AR/DTR).`,
        type: 'verification',
        targetPath: 'leave',
        isRead: false,
        createdAt: new Date().toISOString()
      };
      setNotifications(prev => [empNotif, ...prev]);
    }

    addAuditLog('HR Final Recording & Release', 'Leave', id, `HR Officer ${hrOfficerName} finalized leave: ${decision}. ${decision === 'Approved' ? 'Form released to employee for Accomplishment Report.' : ''}`);
  };

  const addHRClarification = async (leaveId: string, clarificationText: string, hrOfficerName: string): Promise<void> => {
    setLeaveApplications(prev => prev.map(l => {
      if (l.id === leaveId) {
        const existing = l.hrClarifications || [];
        return {
          ...l,
          hrClarifications: [
            ...existing,
            {
              text: clarificationText,
              date: new Date().toISOString(),
              officer: hrOfficerName
            }
          ]
        };
      }
      return l;
    }));
    addAuditLog('HR Leave Clarification', 'Leave', leaveId, `Clarification recorded by ${hrOfficerName}: ${clarificationText}`);
  };

  const markEmailActionTaken = (emailId: string, action: 'approved' | 'disapproved' | 'printed') => {
    setInteractiveEmails(prev => prev.map(e => e.id === emailId ? {
      ...e,
      status: 'action_taken',
      actionTaken: action,
      actionTakenAt: new Date().toISOString()
    } : e));
  };

  const submitWellnessApplication = async (app: Omit<WellnessApplication, 'id' | 'createdAt' | 'status'>): Promise<WellnessApplication> => {
    const newApp: WellnessApplication = {
      ...app,
      id: `WEL-${new Date().getFullYear()}-${String(wellnessApplications.length + 1).padStart(3, '0')}`,
      status: 'pending_supervisor',
      createdAt: new Date().toISOString()
    };
    setWellnessApplications(prev => [newApp, ...prev]);
    addAuditLog('File Wellness Application', 'Wellness', newApp.id, `${newApp.employeeName} filed Form ${newApp.formType}`);
    return newApp;
  };

  const processSupervisorWellness = async (id: string, assessment: string, supervisorName: string): Promise<void> => {
    setWellnessApplications(prev => prev.map(w => {
      if (w.id === id) {
        return {
          ...w,
          supervisorAssessment: assessment,
          supervisorName,
          supervisorDate: new Date().toISOString(),
          status: 'pending_head'
        };
      }
      return w;
    }));
    addAuditLog('Supervisor Wellness Assessment', 'Wellness', id, `Supervisor assessed wellness request`);
  };

  const processHeadWellness = async (id: string, decision: string, remarks: string, headName: string): Promise<void> => {
    setWellnessApplications(prev => prev.map(w => {
      if (w.id === id) {
        return {
          ...w,
          headDecision: decision,
          headRemarks: remarks,
          headName,
          headDate: new Date().toISOString(),
          status: decision === 'Approved' ? 'approved' : 'disapproved'
        };
      }
      return w;
    }));
    addAuditLog('Head Wellness Decision', 'Wellness', id, `Agency head final decision: ${decision}`);
  };

  const submitSALN = async (employeeId: string, filingType: 'Annual' | 'Entry' | 'Exit', asOfDate: string, docUrl?: string, netWorth?: number): Promise<void> => {
    const emp = employees.find(e => e.id === employeeId);
    if (!emp) return;

    const newRecord: SALNRecord = {
      id: `saln-${Date.now()}`,
      employeeId,
      employeeName: `${emp.firstName} ${emp.lastName}`,
      officeName: emp.officeName,
      classification: emp.classification,
      filingType,
      asOfDate,
      submissionDate: new Date().toISOString().split('T')[0],
      status: 'submitted',
      documentUrl: docUrl,
      netWorth
    };
    setSalnRecords(prev => [newRecord, ...prev]);
    addAuditLog('Submit SALN', 'SALN', newRecord.id, `Submitted ${filingType} SALN for ${emp.firstName} ${emp.lastName}`);
  };

  const verifySALN = async (id: string, verifiedBy: string): Promise<void> => {
    setSalnRecords(prev => prev.map(s => {
      if (s.id === id) {
        return {
          ...s,
          status: 'verified',
          verifiedBy,
          verifiedAt: new Date().toISOString()
        };
      }
      return s;
    }));
    addAuditLog('Verify SALN', 'SALN', id, `SALN verified by ${verifiedBy}`);
  };

  // Biometrics & Attendance Actions
  const syncBiometrics = async (terminalId?: string): Promise<{ syncedCount: number; newLogsCount: number }> => {
    // Simulate real device sync latency
    await new Promise(resolve => setTimeout(resolve, 800));

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setTerminals(prev => prev.map(t => {
      if (!terminalId || t.id === terminalId) {
        return {
          ...t,
          status: 'online',
          lastPing: 'Just now',
          totalLogsStored: t.totalLogsStored + Math.floor(Math.random() * 5) + 1
        };
      }
      return t;
    }));

    setBiometricRecords(prev => prev.map(r => ({
      ...r,
      syncStatus: 'synced',
      syncedAt: now.toISOString()
    })));

    const affectedDevice = terminalId ? `Terminal ${terminalId}` : 'All 4 Municipal Biometric Terminals';
    addAuditLog('Sync Biometrics', 'Biometrics', terminalId || 'ALL_TERMINALS', `Synchronized attendance logs from ${affectedDevice} at ${timeStr}`);
    
    addNotification({
      recipientRole: 'hr_staff',
      title: 'Biometrics Device Sync Completed',
      message: `Successfully synchronized daily time records from ${affectedDevice}. Attendance data is updated.`,
      type: 'system',
      targetPath: 'biometrics',
      isRead: false
    });

    return { syncedCount: biometricRecords.length, newLogsCount: 4 };
  };

  const addOrUpdateBiometricRecord = async (record: BiometricRecord): Promise<void> => {
    setBiometricRecords(prev => {
      const idx = prev.findIndex(r => r.id === record.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = record;
        return updated;
      }
      return [record, ...prev];
    });
    addAuditLog('Update Attendance Log', 'Biometrics', record.id, `Manual adjustment/entry for ${record.employeeName} on ${record.date}`);
  };

  const verifyBiometricRecord = async (recordId: string, verifiedBy: string): Promise<void> => {
    setBiometricRecords(prev => prev.map(r => {
      if (r.id === recordId) {
        return {
          ...r,
          verifiedBy,
          verifiedAt: new Date().toISOString()
        };
      }
      return r;
    }));
    addAuditLog('Verify Attendance Record', 'Biometrics', recordId, `DTR record verified by ${verifiedBy}`);
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const addNotification = (notif: Omit<SystemNotification, 'id' | 'createdAt'>) => {
    const newNotif: SystemNotification = {
      ...notif,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      createdAt: new Date().toISOString()
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const updateSettings = (newSettings: Partial<SystemSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
    addAuditLog('Update System Settings', 'System', 'Settings', 'Updated municipal system configuration');
  };

  return (
    <DataContext.Provider
      value={{
        employees,
        offices,
        categories,
        documents,
        requests,
        essServiceRequests,
        leaveApplications,
        wellnessApplications,
        salnRecords,
        biometricRecords,
        terminals,
        notifications,
        auditLogs,
        settings,
        isFirebaseConnected,
        addEmployee,
        updateEmployee,
        archiveEmployee,
        addOffice,
        updateOffice,
        uploadDocument,
        verifyDocument,
        returnDocument,
        createDocumentRequest,
        submitDocumentResponse,
        reviewDocumentRequest,
        submitESSServiceRequest,
        updateESSServiceRequestStatus,
        submitLeaveApplication,
        processSupervisorLeave,
        processMayorLeave,
        processHRFinalLeave,
        addHRClarification,
        markEmailActionTaken,
        interactiveEmails,
        submitWellnessApplication,
        processSupervisorWellness,
        processHeadWellness,
        submitSALN,
        verifySALN,
        syncBiometrics,
        addOrUpdateBiometricRecord,
        verifyBiometricRecord,
        addAuditLog,
        markNotificationRead,
        markAllNotificationsRead,
        addNotification,
        updateSettings
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
