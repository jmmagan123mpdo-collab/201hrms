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
} from '../types/index.ts';
import { 
  INITIAL_OFFICES, 
  INITIAL_CATEGORIES, 
  INITIAL_SETTINGS
} from '../data/initialData.ts';
import { db, testConnection } from '../lib/firebase.ts';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';

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
  notifications: SystemNotification[];
  auditLogs: AuditLog[];
  settings: SystemSettings;
  isFirebaseConnected: boolean;
  
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
  
  submitWellnessApplication: (app: Omit<WellnessApplication, 'id' | 'createdAt' | 'status'>) => Promise<WellnessApplication>;
  processSupervisorWellness: (id: string, assessment: string, supervisorName: string) => Promise<void>;
  processHeadWellness: (id: string, decision: string, remarks: string, headName: string) => Promise<void>;
  
  submitSALN: (employeeId: string, filingType: 'Annual' | 'Entry' | 'Exit', asOfDate: string, docUrl?: string, netWorth?: number) => Promise<void>;
  verifySALN: (id: string, verifiedBy: string) => Promise<void>;

  
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
    return saved ? JSON.parse(saved) : [];
  });

  const [offices, setOffices] = useState<Office[]>(() => {
    const saved = localStorage.getItem('sjhr201_offices');
    return saved ? JSON.parse(saved) : INITIAL_OFFICES;
  });

  const [categories] = useState<DocumentCategory[]>(INITIAL_CATEGORIES);

  const [documents, setDocuments] = useState<EmployeeDocument[]>(() => {
    const saved = localStorage.getItem('sjhr201_documents');
    if (saved) return JSON.parse(saved);
    // Start with an empty document register; no demonstration records.
    return [];
  });

  const [requests, setRequests] = useState<DocumentRequest[]>(() => {
    const saved = localStorage.getItem('sjhr201_requests');
    return saved ? JSON.parse(saved) : [];
  });

  const [essServiceRequests, setEssServiceRequests] = useState<ESSDocumentServiceRequest[]>(() => {
    const saved = localStorage.getItem('sjhr201_ess_service_requests');
    return saved ? JSON.parse(saved) : [];
  });

  const [leaveApplications, setLeaveApplications] = useState<LeaveApplication[]>(() => {
    const saved = localStorage.getItem('sjhr201_leave_applications');
    return saved ? JSON.parse(saved) : [];
  });

  const [wellnessApplications, setWellnessApplications] = useState<WellnessApplication[]>(() => {
    const saved = localStorage.getItem('sjhr201_wellness_applications');
    return saved ? JSON.parse(saved) : [];
  });

  const [salnRecords, setSalnRecords] = useState<SALNRecord[]>(() => {
    const saved = localStorage.getItem('sjhr201_saln_records');
    return saved ? JSON.parse(saved) : [];
  });

  const [notifications, setNotifications] = useState<SystemNotification[]>(() => {
    try { return JSON.parse(localStorage.getItem('sjhr201_notifications') || '[]'); }
    catch { return []; }
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    try { return JSON.parse(localStorage.getItem('sjhr201_audit_logs') || '[]'); }
    catch { return []; }
  });

  const [settings, setSettings] = useState<SystemSettings>(() => {
    const saved = localStorage.getItem('sjhr201_settings');
    return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
  });

  // Verify connection to Firestore on boot
  useEffect(() => {
    testConnection().then(connected => {
      setIsFirebaseConnected(connected);
    });
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

    setEmployees(prev => prev.map(e => e.id === id ? updated : e));
    addAuditLog('Edit Employee', 'Employee', id, `Updated information for ${updated.firstName} ${updated.lastName}`);

    try {
      await setDoc(doc(db, 'employees', id), updated);
    } catch (err) {}
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
      createdAt: new Date().toISOString()
    };
    setLeaveApplications(prev => [newApp, ...prev]);
    addAuditLog('File Leave Application', 'Leave', newApp.id, `${newApp.employeeName} applied for ${newApp.leaveType} leave (${newApp.workingDays} days)`);
    return newApp;
  };

  const processSupervisorLeave = async (id: string, decision: 'Approved' | 'Disapproved', remarks: string, supervisorName: string): Promise<void> => {
    setLeaveApplications(prev => prev.map(l => {
      if (l.id === id) {
        return {
          ...l,
          supervisorAssessment: decision,
          supervisorRemarks: remarks,
          supervisorName,
          supervisorDate: new Date().toISOString(),
          status: decision === 'Approved' ? 'pending_mayor' : 'disapproved'
        };
      }
      return l;
    }));
    addAuditLog('Supervisor Leave Assessment', 'Leave', id, `Supervisor ${supervisorName} marked leave as ${decision}`);
  };

  const processMayorLeave = async (id: string, decision: 'Approved' | 'Disapproved', remarks: string, mayorName: string): Promise<void> => {
    setLeaveApplications(prev => prev.map(l => {
      if (l.id === id) {
        return {
          ...l,
          mayorDecision: decision,
          mayorRemarks: remarks,
          mayorName,
          mayorDate: new Date().toISOString(),
          status: decision === 'Approved' ? 'approved' : 'disapproved'
        };
      }
      return l;
    }));
    addAuditLog('Mayor Leave Decision', 'Leave', id, `Head of Agency decision: ${decision}`);
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
        submitWellnessApplication,
        processSupervisorWellness,
        processHeadWellness,
        submitSALN,
        verifySALN,
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
