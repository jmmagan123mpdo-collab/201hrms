import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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
  EmailLog,
  EmailProvider,
  EmailRecipientRole,
  EmailWorkflowStage,
  EmailWorkflowType
} from '../types/index.ts';
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
import { auth, db, testConnection, handleFirestoreError, OperationType } from '../lib/firebase.ts';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import {
  collection,
  doc,
  setDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';

export interface EmailServiceHealth {
  configuredProvider: EmailProvider;
  hasSendGrid: boolean;
  hasMailgun: boolean;
  fromEmail: string;
  mailgunDomain: string | null;
  mailgunRegion: string;
  serverReachable: boolean;
  checkedAt?: string;
}

export interface DispatchLeaveEmailParams {
  leaveApplicationId: string;
  workflowType: EmailWorkflowType;
  workflowStage: EmailWorkflowStage;
  applicantName: string;
  officeName?: string;
  position?: string;
  leaveType?: string;
  inclusiveDates?: string;
  workingDays?: number | string;
  detailsOfLeave?: string;
  recipientEmail: string;
  recipientRole: EmailRecipientRole;
  recipientName?: string;
  actorName?: string;
  remarks?: string;
  forceSendWhenDisabled?: boolean;
}

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
  emailLogs: EmailLog[];
  emailServiceHealth: EmailServiceHealth | null;
  firestoreSyncError: string | null;
  firebaseUser: FirebaseUser | null;
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
  processHRFinalLeave: (id: string, decision: 'Approved' | 'Disapproved' | 'Returned', remarks: string, hrOfficerName: string) => Promise<void>;

  submitWellnessApplication: (app: Omit<WellnessApplication, 'id' | 'createdAt' | 'status'>) => Promise<WellnessApplication>;
  processSupervisorWellness: (id: string, assessment: string, supervisorName: string) => Promise<void>;
  processHeadWellness: (id: string, decision: string, remarks: string, headName: string) => Promise<void>;

  submitSALN: (employeeId: string, filingType: 'Annual' | 'Entry' | 'Exit', asOfDate: string, docUrl?: string, netWorth?: number) => Promise<void>;
  verifySALN: (id: string, verifiedBy: string) => Promise<void>;

  // Biometrics & Daily Attendance Actions
  syncBiometrics: (terminalId?: string) => Promise<{ syncedCount: number; newLogsCount: number }>;
  addOrUpdateBiometricRecord: (record: BiometricRecord) => Promise<void>;
  verifyBiometricRecord: (recordId: string, verifiedBy: string) => Promise<void>;

  // Transactional Email & Firestore Email Log Actions
  refreshEmailServiceHealth: () => Promise<EmailServiceHealth>;
  sendTestWorkflowEmail: (recipientEmail: string, recipientRole: EmailRecipientRole, recipientName?: string) => Promise<EmailLog>;
  retryEmailLog: (logId: string) => Promise<EmailLog | null>;
  clearFirestoreSyncError: () => void;

  addAuditLog: (action: string, targetEntity: string, targetId: string, details: string, actorName?: string, actorRole?: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  addNotification: (notif: Omit<SystemNotification, 'id' | 'createdAt'>) => void;
  updateSettings: (newSettings: Partial<SystemSettings>) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

function parseTimestamp(val: unknown): string {
  if (val instanceof Timestamp) {
    return val.toDate().toISOString();
  }
  if (val && typeof val === 'object' && 'toDate' in val && typeof (val as { toDate: () => Date }).toDate === 'function') {
    return (val as { toDate: () => Date }).toDate().toISOString();
  }
  if (typeof val === 'string' && val) {
    return val;
  }
  return new Date().toISOString();
}

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Preserve existing browser-side SJHR201 cache. Never clear user data automatically.
  const [isFirebaseConnected, setIsFirebaseConnected] = useState(false);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [firestoreSyncError, setFirestoreSyncError] = useState<string | null>(null);
  const [emailServiceHealth, setEmailServiceHealth] = useState<EmailServiceHealth | null>(null);

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
    return saved ? JSON.parse(saved) : [];
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

  const [biometricRecords, setBiometricRecords] = useState<BiometricRecord[]>(() => {
    const saved = localStorage.getItem('sjhr201_biometric_records');
    return saved ? JSON.parse(saved) : [];
  });

  const [terminals, setTerminals] = useState<BiometricTerminal[]>(() => {
    const saved = localStorage.getItem('sjhr201_terminals');
    return saved ? JSON.parse(saved) : [];
  });

  const [notifications, setNotifications] = useState<SystemNotification[]>(() => {
    const saved = localStorage.getItem('sjhr201_notifications');
    return saved ? JSON.parse(saved) : [];
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('sjhr201_audit_logs');
    return saved ? JSON.parse(saved) : [];
  });

  const [emailLogs, setEmailLogs] = useState<EmailLog[]>(() => {
    const saved = localStorage.getItem('sjhr201_email_logs');
    if (!saved) return [];
    try {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  const [settings, setSettings] = useState<SystemSettings>(() => {
    const saved = localStorage.getItem('sjhr201_settings');
    if (!saved) return INITIAL_SETTINGS;
    try {
      const parsed = JSON.parse(saved);
      return {
        ...INITIAL_SETTINGS,
        ...parsed,
        leaveWorkflowRouting: {
          ...INITIAL_SETTINGS.leaveWorkflowRouting,
          ...(parsed?.leaveWorkflowRouting || {})
        },
        brandColors: {
          ...INITIAL_SETTINGS.brandColors,
          ...(parsed?.brandColors || {})
        }
      };
    } catch {
      return INITIAL_SETTINGS;
    }
  });

  const clearFirestoreSyncError = useCallback(() => {
    setFirestoreSyncError(null);
  }, []);

  const refreshEmailServiceHealth = useCallback(async (): Promise<EmailServiceHealth> => {
    try {
      const res = await fetch('/api/health');
      if (!res.ok) {
        throw new Error(`Health check failed with HTTP ${res.status}`);
      }
      const data = await res.json();
      const status: EmailServiceHealth = {
        configuredProvider: data?.emailService?.configuredProvider || 'none',
        hasSendGrid: Boolean(data?.emailService?.hasSendGrid),
        hasMailgun: Boolean(data?.emailService?.hasMailgun),
        fromEmail: data?.emailService?.fromEmail || 'SJHR201 LGU San Jose HRMIS <noreply@sanjose-occmdo.gov.ph>',
        mailgunDomain: data?.emailService?.mailgunDomain || null,
        mailgunRegion: data?.emailService?.mailgunRegion || 'us',
        serverReachable: true,
        checkedAt: new Date().toISOString()
      };
      setEmailServiceHealth(status);
      return status;
    } catch {
      const fallback: EmailServiceHealth = {
        configuredProvider: 'none',
        hasSendGrid: false,
        hasMailgun: false,
        fromEmail: 'SJHR201 LGU San Jose HRMIS <noreply@sanjose-occmdo.gov.ph>',
        mailgunDomain: null,
        mailgunRegion: 'us',
        serverReachable: false,
        checkedAt: new Date().toISOString()
      };
      setEmailServiceHealth(fallback);
      return fallback;
    }
  }, []);

  // Verify connection to Firestore and server health on boot
  useEffect(() => {
    testConnection().then(connected => {
      setIsFirebaseConnected(connected);
    });
    refreshEmailServiceHealth();
  }, [refreshEmailServiceHealth]);

  // Listen to Firebase Auth state for Firestore rules compliance
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        setFirestoreSyncError(null);
      }
    });
    return () => unsub();
  }, []);

  // Attach real-time Firestore listeners for Email Logs & System Settings ONLY when authenticated
  useEffect(() => {
    if (!firebaseUser) return;

    const isBootstrappedAdmin = firebaseUser.email?.toLowerCase() === 'jmmagan123mpdo@gmail.com' && firebaseUser.emailVerified;
    const emailLogsQuery = isBootstrappedAdmin
      ? query(collection(db, 'emailLogs'), orderBy('createdAt', 'desc'), limit(100))
      : query(collection(db, 'emailLogs'), where('triggeredByUid', '==', firebaseUser.uid), limit(100));

    const unsubEmailLogs = onSnapshot(
      emailLogsQuery,
      (snapshot) => {
        const remoteLogs: EmailLog[] = snapshot.docs.map((docSnap) => {
          const d = docSnap.data();
          return {
            id: String(d.id || docSnap.id),
            leaveApplicationId: String(d.leaveApplicationId || ''),
            workflowType: d.workflowType || 'CSC_FORM_6',
            workflowStage: d.workflowStage || 'stage_1_submitted',
            applicantName: d.applicantName ? String(d.applicantName) : undefined,
            recipientEmail: String(d.recipientEmail || ''),
            recipientRole: d.recipientRole || 'supervisor',
            recipientName: d.recipientName ? String(d.recipientName) : undefined,
            subject: String(d.subject || ''),
            bodyPreview: d.bodyPreview ? String(d.bodyPreview) : undefined,
            provider: d.provider || 'none',
            providerMessageId: d.providerMessageId ? String(d.providerMessageId) : undefined,
            httpStatusCode: typeof d.httpStatusCode === 'number' ? d.httpStatusCode : undefined,
            status: d.status || 'unconfigured',
            errorMessage: d.errorMessage ? String(d.errorMessage) : undefined,
            triggeredByUid: String(d.triggeredByUid || ''),
            triggeredByName: d.triggeredByName ? String(d.triggeredByName) : undefined,
            persistedToFirestore: true,
            createdAt: parseTimestamp(d.createdAt)
          };
        });

        remoteLogs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        setEmailLogs(prev => {
          const remoteIds = new Set(remoteLogs.map(r => r.id));
          const localOnly = prev.filter(p => !remoteIds.has(p.id) && !p.persistedToFirestore);
          return [...localOnly, ...remoteLogs].sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        });
      },
      (error) => {
        const msg = error instanceof Error ? error.message : 'Unable to sync emailLogs from Cloud Firestore.';
        setFirestoreSyncError(msg);
        handleFirestoreError(error, OperationType.LIST, 'emailLogs');
      }
    );

    const settingsDocRef = doc(db, 'systemSettings', 'leaveWorkflow');
    const unsubSettings = onSnapshot(
      settingsDocRef,
      (snap) => {
        if (!snap.exists()) return;
        const d = snap.data();
        setSettings(prev => ({
          ...prev,
          ...(typeof d.systemName === 'string' ? { systemName: d.systemName } : {}),
          ...(typeof d.lguName === 'string' ? { lguName: d.lguName } : {}),
          ...(typeof d.provinceName === 'string' ? { provinceName: d.provinceName } : {}),
          ...(typeof d.currentTermYear === 'number' ? { currentTermYear: d.currentTermYear } : {}),
          ...(typeof d.headOfAgency === 'string' ? { headOfAgency: d.headOfAgency } : {}),
          ...(typeof d.hrmoHead === 'string' ? { hrmoHead: d.hrmoHead } : {}),
          ...(typeof d.essSelfRegistrationEnabled === 'boolean' ? { essSelfRegistrationEnabled: d.essSelfRegistrationEnabled } : {}),
          ...(typeof d.maintenanceMode === 'boolean' ? { maintenanceMode: d.maintenanceMode } : {}),
          leaveWorkflowRouting: {
            supervisorEmail: typeof d.supervisorEmail === 'string' ? d.supervisorEmail : prev.leaveWorkflowRouting.supervisorEmail,
            mayorEmail: typeof d.mayorEmail === 'string' ? d.mayorEmail : prev.leaveWorkflowRouting.mayorEmail,
            hrFinalReviewerEmail: typeof d.hrFinalReviewerEmail === 'string' ? d.hrFinalReviewerEmail : prev.leaveWorkflowRouting.hrFinalReviewerEmail,
            emailNotificationsEnabled:
              typeof d.emailNotificationsEnabled === 'boolean'
                ? d.emailNotificationsEnabled
                : prev.leaveWorkflowRouting.emailNotificationsEnabled
          }
        }));
      },
      (error) => {
        const msg = error instanceof Error ? error.message : 'Unable to sync systemSettings from Cloud Firestore.';
        setFirestoreSyncError(msg);
        handleFirestoreError(error, OperationType.GET, 'systemSettings/leaveWorkflow');
      }
    );

    return () => {
      unsubEmailLogs();
      unsubSettings();
    };
  }, [firebaseUser]);

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
    localStorage.setItem('sjhr201_email_logs', JSON.stringify(emailLogs));
  }, [emailLogs]);

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
      actorUid: auth.currentUser?.uid || 'usr-current',
      actorName,
      actorRole,
      action,
      targetEntity,
      targetId,
      details,
      timestamp: new Date().toISOString()
    };
    setAuditLogs(prev => [newLog, ...prev]);

    if (auth.currentUser) {
      setDoc(doc(db, 'auditLogs', newLog.id), newLog).catch((err) => {
        console.warn('Firestore auditLog write warning:', err);
      });
    }
  };

  // Persist an EmailLog document to Cloud Firestore (enforcing strict blueprint & security rules contract)
  const persistEmailLogToFirestore = useCallback(async (log: EmailLog): Promise<boolean> => {
    if (!auth.currentUser) {
      return false;
    }

    const cleanPayload: Record<string, unknown> = {
      id: log.id.slice(0, 128),
      leaveApplicationId: (log.leaveApplicationId || 'UNKNOWN').slice(0, 128),
      workflowType: log.workflowType,
      workflowStage: log.workflowStage,
      recipientEmail: (log.recipientEmail || 'unknown@sanjose.gov.ph').slice(0, 160),
      recipientRole: log.recipientRole,
      subject: (log.subject || 'Leave Notification').slice(0, 240),
      provider: log.provider,
      status: log.status,
      triggeredByUid: auth.currentUser.uid,
      createdAt: serverTimestamp()
    };

    if (log.applicantName) cleanPayload.applicantName = log.applicantName.slice(0, 120);
    if (log.recipientName) cleanPayload.recipientName = log.recipientName.slice(0, 120);
    if (log.bodyPreview) cleanPayload.bodyPreview = log.bodyPreview.slice(0, 1000);
    if (log.providerMessageId) cleanPayload.providerMessageId = log.providerMessageId.slice(0, 200);
    if (typeof log.httpStatusCode === 'number') cleanPayload.httpStatusCode = log.httpStatusCode;
    if (log.errorMessage) cleanPayload.errorMessage = log.errorMessage.slice(0, 500);
    if (log.triggeredByName) cleanPayload.triggeredByName = log.triggeredByName.slice(0, 120);

    const path = `emailLogs/${log.id}`;
    try {
      await setDoc(doc(db, 'emailLogs', log.id), cleanPayload);
      return true;
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to persist email log to Cloud Firestore.';
      setFirestoreSyncError(msg);
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  }, []);

  // Server-side transactional email dispatch + Email Log persistence
  const dispatchLeaveWorkflowEmail = useCallback(
    async (params: DispatchLeaveEmailParams): Promise<EmailLog> => {
      const routingEnabled = settings.leaveWorkflowRouting?.emailNotificationsEnabled ?? true;
      const actorUid = auth.currentUser?.uid || 'local-session';
      const actorDisplay = params.actorName || auth.currentUser?.displayName || 'SJHR201 Workflow Engine';

      let resultLog: EmailLog;

      if (!routingEnabled && !params.forceSendWhenDisabled) {
        resultLog = {
          id: `EML-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
          leaveApplicationId: params.leaveApplicationId,
          workflowType: params.workflowType,
          workflowStage: params.workflowStage,
          applicantName: params.applicantName,
          recipientEmail: params.recipientEmail,
          recipientRole: params.recipientRole,
          recipientName: params.recipientName,
          subject: `[SJHR201 LGU San Jose] ${params.workflowStage} (${params.leaveApplicationId})`.slice(0, 240),
          bodyPreview: `Skipped transactional dispatch because automated email notifications are disabled in Settings.`,
          provider: 'none',
          status: 'skipped',
          errorMessage: 'Automated leave approval email notifications are disabled in System Settings.',
          triggeredByUid: actorUid,
          triggeredByName: actorDisplay,
          persistedToFirestore: false,
          createdAt: new Date().toISOString()
        };
      } else {
        try {
          const response = await fetch('/api/emails/leave-workflow', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...params,
              triggeredByUid: actorUid,
              triggeredByName: actorDisplay
            })
          });

          const data = await response.json().catch(() => null);
          if (!response.ok || !data?.emailLog) {
            throw new Error(data?.error || `Email API responded with HTTP ${response.status}`);
          }

          resultLog = {
            ...(data.emailLog as EmailLog),
            triggeredByUid: actorUid,
            triggeredByName: actorDisplay,
            persistedToFirestore: false
          };
        } catch (err: unknown) {
          resultLog = {
            id: `EML-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
            leaveApplicationId: params.leaveApplicationId,
            workflowType: params.workflowType,
            workflowStage: params.workflowStage,
            applicantName: params.applicantName,
            recipientEmail: params.recipientEmail,
            recipientRole: params.recipientRole,
            recipientName: params.recipientName,
            subject: `[SJHR201 LGU San Jose] ${params.workflowStage} (${params.leaveApplicationId})`.slice(0, 240),
            bodyPreview: `Dispatch failed to ${params.recipientEmail}`,
            provider: 'none',
            status: 'failed',
            errorMessage: err instanceof Error ? err.message : 'Unable to reach transactional email helper API.',
            triggeredByUid: actorUid,
            triggeredByName: actorDisplay,
            persistedToFirestore: false,
            createdAt: new Date().toISOString()
          };
        }
      }

      setEmailLogs(prev => [resultLog, ...prev]);

      if (auth.currentUser) {
        try {
          const savedToDb = await persistEmailLogToFirestore(resultLog);
          if (savedToDb) {
            resultLog = { ...resultLog, persistedToFirestore: true };
            setEmailLogs(prev => prev.map(item => (item.id === resultLog.id ? resultLog : item)));
          }
        } catch (err) {
          console.error('Firestore EmailLog persistence error:', err);
        }
      }

      addAuditLog(
        'Workflow Email Dispatch',
        'EmailLog',
        resultLog.id,
        `Stage ${resultLog.workflowStage} email to ${resultLog.recipientEmail} (${resultLog.recipientRole}) -> status: ${resultLog.status} via ${resultLog.provider}`,
        actorDisplay
      );

      return resultLog;
    },
    [settings.leaveWorkflowRouting?.emailNotificationsEnabled, persistEmailLogToFirestore]
  );

  const sendTestWorkflowEmail = async (
    recipientEmail: string,
    recipientRole: EmailRecipientRole,
    recipientName?: string
  ): Promise<EmailLog> => {
    return dispatchLeaveWorkflowEmail({
      leaveApplicationId: `TEST-${new Date().getFullYear()}`,
      workflowType: 'SYSTEM_TEST',
      workflowStage: 'test_dispatch',
      applicantName: 'SJHR201 Routing Verification',
      officeName: 'Municipal Human Resource Management Office',
      leaveType: 'Routing Verification',
      inclusiveDates: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }),
      workingDays: 1,
      detailsOfLeave: 'Automated leave approval routing test triggered from Developer Control Center.',
      recipientEmail: recipientEmail.trim(),
      recipientRole,
      recipientName,
      actorName: auth.currentUser?.displayName || 'System Administrator',
      remarks: 'Verification dispatch to confirm SendGrid / Mailgun delivery and Cloud Firestore Email Log persistence.',
      forceSendWhenDisabled: true
    });
  };

  const retryEmailLog = async (logId: string): Promise<EmailLog | null> => {
    const existing = emailLogs.find(l => l.id === logId);
    if (!existing) return null;

    const matchedLeave = leaveApplications.find(l => l.id === existing.leaveApplicationId);
    const matchedWellness = wellnessApplications.find(w => w.id === existing.leaveApplicationId);

    return dispatchLeaveWorkflowEmail({
      leaveApplicationId: existing.leaveApplicationId,
      workflowType: existing.workflowType,
      workflowStage: existing.workflowStage,
      applicantName: existing.applicantName || matchedLeave?.employeeName || matchedWellness?.employeeName || 'LGU Personnel',
      officeName: matchedLeave?.officeName || matchedWellness?.officeName,
      position: matchedLeave?.position || matchedWellness?.position,
      leaveType: matchedLeave?.leaveType || (matchedWellness ? `Wellness ${matchedWellness.formType}` : undefined),
      inclusiveDates: matchedLeave?.inclusiveDates || matchedWellness?.requestedDate,
      workingDays: matchedLeave?.workingDays || matchedWellness?.duration,
      detailsOfLeave: matchedLeave?.detailsOfLeave || matchedWellness?.reason,
      recipientEmail: existing.recipientEmail,
      recipientRole: existing.recipientRole,
      recipientName: existing.recipientName,
      actorName: auth.currentUser?.displayName || 'HR Administrator',
      remarks: 'Manual retry from SJHR201 Email Log monitor.',
      forceSendWhenDisabled: true
    });
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

    if (auth.currentUser) {
      setDoc(doc(db, 'employees', newEmp.id), newEmp).catch((err) => {
        console.warn('Firestore employee sync warning:', err);
      });
    }

    return newEmp;
  };

  const updateEmployee = async (id: string, updates: Partial<Employee>): Promise<void> => {
    const existing = employees.find(e => e.id === id);
    if (!existing) return;

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

    if (auth.currentUser) {
      setDoc(doc(db, 'employees', id), updated).catch((err) => {
        console.warn('Firestore employee update warning:', err);
      });
    }
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

    if (auth.currentUser) {
      setDoc(doc(db, 'employeeDocuments', newDoc.id), newDoc).catch((err) => {
        console.warn('Firestore employeeDocument sync warning:', err);
      });
    }

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
    addAuditLog('Return Document', '201 Document', docId, `Returned document (${returnedBy}) with remarks: ${remarks}`);
  };

  const createDocumentRequest = async (reqData: Omit<DocumentRequest, 'id' | 'requestedAt' | 'status'>): Promise<DocumentRequest> => {
    const newReq: DocumentRequest = {
      ...reqData,
      id: `req-${Date.now()}`,
      status: 'requested',
      requestedAt: new Date().toISOString()
    };
    setRequests(prev => [newReq, ...prev]);

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

  // Stage 1 -> Stage 2: Employee files CSC Form 6 -> Emails Immediate Supervisor
  const submitLeaveApplication = async (app: Omit<LeaveApplication, 'id' | 'createdAt' | 'status'>): Promise<LeaveApplication> => {
    const newApp: LeaveApplication = {
      ...app,
      id: `LV-${new Date().getFullYear()}-${String(leaveApplications.length + 1).padStart(3, '0')}`,
      status: 'pending_supervisor',
      createdAt: new Date().toISOString()
    };
    setLeaveApplications(prev => [newApp, ...prev]);
    addAuditLog('File Leave Application', 'Leave', newApp.id, `${newApp.employeeName} applied for ${newApp.leaveType} leave (${newApp.workingDays} days)`);

    // Notify Immediate Supervisor by email
    await dispatchLeaveWorkflowEmail({
      leaveApplicationId: newApp.id,
      workflowType: 'CSC_FORM_6',
      workflowStage: 'stage_1_submitted',
      applicantName: newApp.employeeName,
      officeName: newApp.officeName,
      position: newApp.position,
      leaveType: newApp.leaveType,
      inclusiveDates: newApp.inclusiveDates,
      workingDays: newApp.workingDays,
      detailsOfLeave: newApp.detailsOfLeave,
      recipientEmail: settings.leaveWorkflowRouting.supervisorEmail,
      recipientRole: 'supervisor',
      recipientName: 'Immediate Supervisor',
      actorName: newApp.employeeName
    });

    return newApp;
  };

  // Stage 2 -> Stage 3: Supervisor recommends -> Emails Municipal Mayor (or Employee if disapproved)
  const processSupervisorLeave = async (id: string, decision: 'Approved' | 'Disapproved', remarks: string, supervisorName: string): Promise<void> => {
    const target = leaveApplications.find(l => l.id === id);

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

    if (target) {
      const applicant = employees.find(e => e.id === target.employeeId);
      const isApproved = decision === 'Approved';

      await dispatchLeaveWorkflowEmail({
        leaveApplicationId: target.id,
        workflowType: 'CSC_FORM_6',
        workflowStage: isApproved ? 'stage_2_supervisor_approved' : 'stage_2_supervisor_disapproved',
        applicantName: target.employeeName,
        officeName: target.officeName,
        position: target.position,
        leaveType: target.leaveType,
        inclusiveDates: target.inclusiveDates,
        workingDays: target.workingDays,
        detailsOfLeave: target.detailsOfLeave,
        recipientEmail: isApproved
          ? settings.leaveWorkflowRouting.mayorEmail
          : (applicant?.email || settings.leaveWorkflowRouting.hrFinalReviewerEmail),
        recipientRole: isApproved ? 'mayor' : 'employee',
        recipientName: isApproved ? settings.headOfAgency : target.employeeName,
        actorName: supervisorName,
        remarks
      });
    }
  };

  // Stage 3 -> Stage 4: Municipal Mayor decides -> Emails HR Final Reviewer (or Employee if disapproved)
  const processMayorLeave = async (id: string, decision: 'Approved' | 'Disapproved', remarks: string, mayorName: string): Promise<void> => {
    const target = leaveApplications.find(l => l.id === id);

    setLeaveApplications(prev => prev.map(l => {
      if (l.id === id) {
        return {
          ...l,
          mayorDecision: decision,
          mayorRemarks: remarks,
          mayorName,
          mayorDate: new Date().toISOString(),
          status: decision === 'Approved' ? 'pending_hr_final' : 'disapproved'
        };
      }
      return l;
    }));
    addAuditLog('Mayor Leave Decision', 'Leave', id, `Head of Agency decision: ${decision} (Stage 3 Complete -> Stage 4 HR Final Recording)`);

    if (target) {
      const applicant = employees.find(e => e.id === target.employeeId);
      const isApproved = decision === 'Approved';

      await dispatchLeaveWorkflowEmail({
        leaveApplicationId: target.id,
        workflowType: 'CSC_FORM_6',
        workflowStage: isApproved ? 'stage_3_mayor_approved' : 'stage_3_mayor_disapproved',
        applicantName: target.employeeName,
        officeName: target.officeName,
        position: target.position,
        leaveType: target.leaveType,
        inclusiveDates: target.inclusiveDates,
        workingDays: target.workingDays,
        detailsOfLeave: target.detailsOfLeave,
        recipientEmail: isApproved
          ? settings.leaveWorkflowRouting.hrFinalReviewerEmail
          : (applicant?.email || settings.leaveWorkflowRouting.hrFinalReviewerEmail),
        recipientRole: isApproved ? 'hr_final_reviewer' : 'employee',
        recipientName: isApproved ? settings.hrmoHead : target.employeeName,
        actorName: mayorName,
        remarks
      });
    }
  };

  // Stage 4 & 5: HR Final Recording & Credit Deduction -> Emails Employee
  const processHRFinalLeave = async (id: string, decision: 'Approved' | 'Disapproved' | 'Returned', remarks: string, hrOfficerName: string): Promise<void> => {
    const target = leaveApplications.find(l => l.id === id);

    setLeaveApplications(prev => prev.map(l => {
      if (l.id === id) {
        return {
          ...l,
          hrFinalAction: decision === 'Approved' ? 'Accepted & Finalized' : decision === 'Disapproved' ? 'Rejected' : 'Returned',
          hrFinalRemarks: remarks,
          hrFinalOfficer: hrOfficerName,
          hrFinalDate: new Date().toISOString(),
          status: decision === 'Approved' ? 'approved' : decision === 'Disapproved' ? 'disapproved' : 'returned_hr'
        };
      }
      return l;
    }));
    addAuditLog('HR Final Recording & Credit Deduction', 'Leave', id, `HR Officer ${hrOfficerName} finalized leave: ${decision}`);

    if (target) {
      const applicant = employees.find(e => e.id === target.employeeId);
      const isApproved = decision === 'Approved';

      addNotification({
        recipientRole: 'employee',
        recipientEmployeeId: target.employeeId,
        title: `Leave ${isApproved ? 'Finalized & Credits Recorded' : decision}: ${target.leaveType}`,
        message: isApproved
          ? `Your ${target.leaveType} Leave (${target.inclusiveDates}) has been finalized by ${hrOfficerName}.`
          : `Your ${target.leaveType} Leave (${target.inclusiveDates}) was marked ${decision} by HR. ${remarks}`,
        type: 'leave_update',
        targetTab: 'leave',
        actionLabel: 'View Leave Status',
        isRead: false
      });

      await dispatchLeaveWorkflowEmail({
        leaveApplicationId: target.id,
        workflowType: 'CSC_FORM_6',
        workflowStage: isApproved ? 'stage_5_hr_finalized' : 'stage_5_hr_returned',
        applicantName: target.employeeName,
        officeName: target.officeName,
        position: target.position,
        leaveType: target.leaveType,
        inclusiveDates: target.inclusiveDates,
        workingDays: target.workingDays,
        detailsOfLeave: target.detailsOfLeave,
        recipientEmail: applicant?.email || settings.leaveWorkflowRouting.hrFinalReviewerEmail,
        recipientRole: 'employee',
        recipientName: target.employeeName,
        actorName: hrOfficerName,
        remarks
      });
    }
  };

  // Wellness Stage 1 -> Emails Supervisor
  const submitWellnessApplication = async (app: Omit<WellnessApplication, 'id' | 'createdAt' | 'status'>): Promise<WellnessApplication> => {
    const newApp: WellnessApplication = {
      ...app,
      id: `WEL-${new Date().getFullYear()}-${String(wellnessApplications.length + 1).padStart(3, '0')}`,
      status: 'pending_supervisor',
      createdAt: new Date().toISOString()
    };
    setWellnessApplications(prev => [newApp, ...prev]);
    addAuditLog('File Wellness Application', 'Wellness', newApp.id, `${newApp.employeeName} filed Form ${newApp.formType}`);

    await dispatchLeaveWorkflowEmail({
      leaveApplicationId: newApp.id,
      workflowType: newApp.formType === 'W-02' ? 'WELLNESS_W02' : 'WELLNESS_W01',
      workflowStage: 'stage_1_submitted',
      applicantName: newApp.employeeName,
      officeName: newApp.officeName,
      position: newApp.position,
      leaveType: `Wellness Form ${newApp.formType}`,
      inclusiveDates: newApp.requestedDate,
      workingDays: newApp.duration,
      detailsOfLeave: newApp.reason,
      recipientEmail: settings.leaveWorkflowRouting.supervisorEmail,
      recipientRole: 'supervisor',
      recipientName: 'Immediate Supervisor',
      actorName: newApp.employeeName
    });

    return newApp;
  };

  // Wellness Stage 2 -> Emails Municipal Mayor / Head of Agency
  const processSupervisorWellness = async (id: string, assessment: string, supervisorName: string): Promise<void> => {
    const target = wellnessApplications.find(w => w.id === id);

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

    if (target) {
      await dispatchLeaveWorkflowEmail({
        leaveApplicationId: target.id,
        workflowType: target.formType === 'W-02' ? 'WELLNESS_W02' : 'WELLNESS_W01',
        workflowStage: 'stage_2_supervisor_approved',
        applicantName: target.employeeName,
        officeName: target.officeName,
        position: target.position,
        leaveType: `Wellness Form ${target.formType}`,
        inclusiveDates: target.requestedDate,
        workingDays: target.duration,
        detailsOfLeave: target.reason,
        recipientEmail: settings.leaveWorkflowRouting.mayorEmail,
        recipientRole: 'mayor',
        recipientName: settings.headOfAgency,
        actorName: supervisorName,
        remarks: assessment
      });
    }
  };

  // Wellness Head Decision -> Emails Employee
  const processHeadWellness = async (id: string, decision: string, remarks: string, headName: string): Promise<void> => {
    const target = wellnessApplications.find(w => w.id === id);

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

    if (target) {
      const applicant = employees.find(e => e.id === target.employeeId);
      const isApproved = decision === 'Approved';

      await dispatchLeaveWorkflowEmail({
        leaveApplicationId: target.id,
        workflowType: target.formType === 'W-02' ? 'WELLNESS_W02' : 'WELLNESS_W01',
        workflowStage: isApproved ? 'stage_5_hr_finalized' : 'stage_3_mayor_disapproved',
        applicantName: target.employeeName,
        officeName: target.officeName,
        position: target.position,
        leaveType: `Wellness Form ${target.formType}`,
        inclusiveDates: target.requestedDate,
        workingDays: target.duration,
        detailsOfLeave: target.reason,
        recipientEmail: applicant?.email || settings.leaveWorkflowRouting.hrFinalReviewerEmail,
        recipientRole: 'employee',
        recipientName: target.employeeName,
        actorName: headName,
        remarks
      });
    }
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

  const updateSettings = async (newSettings: Partial<SystemSettings>): Promise<void> => {
    const merged: SystemSettings = {
      ...settings,
      ...newSettings,
      leaveWorkflowRouting: {
        ...settings.leaveWorkflowRouting,
        ...(newSettings.leaveWorkflowRouting || {})
      },
      brandColors: {
        ...settings.brandColors,
        ...(newSettings.brandColors || {})
      }
    };

    setSettings(merged);
    addAuditLog('Update System Settings', 'System', 'Settings', 'Updated municipal system and leave approver routing configuration');

    if (auth.currentUser) {
      const path = 'systemSettings/leaveWorkflow';
      const firestorePayload = {
        systemName: merged.systemName.slice(0, 150),
        lguName: merged.lguName.slice(0, 150),
        provinceName: merged.provinceName.slice(0, 150),
        currentTermYear: merged.currentTermYear,
        headOfAgency: merged.headOfAgency.slice(0, 150),
        hrmoHead: merged.hrmoHead.slice(0, 150),
        essSelfRegistrationEnabled: Boolean(merged.essSelfRegistrationEnabled),
        maintenanceMode: Boolean(merged.maintenanceMode),
        supervisorEmail: merged.leaveWorkflowRouting.supervisorEmail.slice(0, 160),
        mayorEmail: merged.leaveWorkflowRouting.mayorEmail.slice(0, 160),
        hrFinalReviewerEmail: merged.leaveWorkflowRouting.hrFinalReviewerEmail.slice(0, 160),
        emailNotificationsEnabled: Boolean(merged.leaveWorkflowRouting.emailNotificationsEnabled),
        updatedByUid: auth.currentUser.uid,
        updatedAt: serverTimestamp()
      };

      try {
        await setDoc(doc(db, 'systemSettings', 'leaveWorkflow'), firestorePayload);
      } catch (error) {
        const msg = error instanceof Error ? error.message : 'Failed to sync settings to Cloud Firestore.';
        setFirestoreSyncError(msg);
        handleFirestoreError(error, OperationType.WRITE, path);
      }
    }
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
        emailLogs,
        emailServiceHealth,
        firestoreSyncError,
        firebaseUser,
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
        submitWellnessApplication,
        processSupervisorWellness,
        processHeadWellness,
        submitSALN,
        verifySALN,
        syncBiometrics,
        addOrUpdateBiometricRecord,
        verifyBiometricRecord,
        refreshEmailServiceHealth,
        sendTestWorkflowEmail,
        retryEmailLog,
        clearFirestoreSyncError,
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
