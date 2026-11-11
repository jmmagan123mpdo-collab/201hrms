export type UserRole = 'developer' | 'hr_admin' | 'hr_staff' | 'payroll' | 'employee';

export type EmploymentClassification = 
  | 'Permanent' 
  | 'Temporary' 
  | 'Casual' 
  | 'Job Order' 
  | 'Contract of Service' 
  | 'Elective Officials';

export type EmploymentStatus = 'Active' | 'On Leave' | 'Suspended' | 'Separated' | 'Retired';
export type RecordStatus = 'Active' | 'Archived';

export type HRStaffPermission = 
  | 'view_employees'
  | 'add_employees'
  | 'edit_employees'
  | 'upload_documents'
  | 'scan_documents'
  | 'verify_documents'
  | 'request_documents'
  | 'process_leave'
  | 'process_wellness'
  | 'generate_reports'
  | 'manage_offices';

export interface UserAccount {
  uid: string;
  username: string;
  email: string;
  displayName: string;
  role: UserRole;
  employeeId?: string; // Permanent internal employee ID if linked
  permissions: HRStaffPermission[];
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
}

export interface Employee {
  id: string; // Permanent internal immutable ID (e.g. EMP-2024-001)
  employeeNumber: string; // Current personnel number (can change on promotion/transfer)
  previousEmployeeNumbers?: string[];
  firstName: string;
  middleName?: string;
  lastName: string;
  suffix?: string;
  email: string; // HR-registered official email
  isEmailVerified: boolean;
  phone: string;
  officeId: string;
  officeName: string;
  position: string;
  classification: EmploymentClassification;
  employmentStatus: EmploymentStatus;
  recordStatus: RecordStatus;
  hireDate: string;
  salaryGrade?: string;
  stepIncrement?: string;
  monthlySalary?: number;
  
  // Government Identifiers
  tin?: string;
  gsis?: string;
  philhealth?: string;
  pagibig?: string;
  
  // Personal & Demographic Details
  civilStatus?: 'Single' | 'Married' | 'Widowed' | 'Separated';
  citizenship?: string;
  dateOfBirth?: string;
  placeOfBirth?: string;
  gender?: 'Male' | 'Female';
  bloodType?: string;
  heightCm?: number;
  weightKg?: number;
  residentialAddress?: string;
  permanentAddress?: string;
  
  // Emergency Contact
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;
  
  // ESS Status
  essRegistered: boolean;
  essUsername?: string;
  
  createdAt: string;
  updatedAt: string;
}

export type DocumentStatus = 
  | 'missing_required' 
  | 'missing_optional' 
  | 'for_review' 
  | 'verified' 
  | 'returned';

export type DocumentPrivacy = 
  | 'employee_accessible' 
  | 'hr_restricted' 
  | 'highly_confidential';

export interface DocumentCategory {
  id: string;
  code: string;
  name: string;
  description: string;
  iconName: string;
  documentTypes: {
    code: string;
    name: string;
    isRequiredFor: EmploymentClassification[];
    privacy: DocumentPrivacy;
    description?: string;
  }[];
}

export interface EmployeeDocument {
  id: string;
  employeeId: string; // References Employee.id (permanent)
  categoryId: string;
  documentTypeCode: string;
  documentName: string;
  status: DocumentStatus;
  privacy: DocumentPrivacy;
  isRequired: boolean;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  uploadedBy?: string;
  uploaderRole?: string;
  uploadedAt?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  remarks?: string;
  version: number;
  history?: {
    version: number;
    fileUrl: string;
    uploadedAt: string;
    uploadedBy: string;
    remarks?: string;
  }[];
}

export type RequestStatus = 'requested' | 'submitted' | 'under_review' | 'verified' | 'returned' | 'overdue';

export interface DocumentRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  categoryId: string;
  categoryName: string;
  documentName: string;
  documentTypeCode: string;
  instructions: string;
  dueDate: string;
  isRequired: boolean;
  status: RequestStatus;
  requestedBy: string;
  requestedAt: string;
  submittedFileUrl?: string;
  submittedFileName?: string;
  submittedAt?: string;
  reviewRemarks?: string;
}

export interface Office {
  id: string;
  code: string;
  name: string;
  headName: string;
  location: string;
  isActive: boolean;
  employeeCount?: number;
  sections?: string[];
}

export type LeaveStatus = 'pending_supervisor' | 'pending_mayor' | 'approved' | 'disapproved' | 'cancelled';

export interface LeaveApplication {
  id: string;
  employeeId: string;
  employeeName: string;
  officeName: string;
  position: string;
  leaveType: 'Vacation' | 'Mandatory/Forced' | 'Sick' | 'Maternity' | 'Paternity' | 'Special Privilege' | 'Solo Parent' | 'Study' | '10-Day VAWC' | 'Rehabilitation' | 'Special Leave for Women' | 'Special Emergency (Calamity)' | 'Adoption' | 'Other';
  detailsOfLeave: string;
  workingDays: number;
  inclusiveDates: string;
  commutation: 'Requested' | 'Not Requested';
  status: LeaveStatus;
  supervisorAssessment?: 'Approved' | 'Disapproved';
  supervisorRemarks?: string;
  supervisorName?: string;
  supervisorDate?: string;
  mayorDecision?: 'Approved' | 'Disapproved';
  mayorRemarks?: string;
  mayorName?: string;
  mayorDate?: string;
  createdAt: string;
}

export type WellnessStatus = 'pending_supervisor' | 'pending_head' | 'approved' | 'disapproved';

export interface WellnessApplication {
  id: string;
  formType: 'W-01' | 'W-02'; // W-01: Wellness Leave (1-2 days), W-02: Wellness Break (1-2 hours)
  employeeId: string;
  employeeName: string;
  officeName: string;
  position: string;
  reason: string;
  activityDetails: string;
  requestedDate: string;
  duration: string; // e.g. "1 Day" or "2 Hours (2:00 PM - 4:00 PM)"
  status: WellnessStatus;
  supervisorAssessment?: string;
  supervisorName?: string;
  supervisorDate?: string;
  headDecision?: string;
  headRemarks?: string;
  headName?: string;
  headDate?: string;
  createdAt: string;
}

export interface SALNRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  officeName: string;
  classification: EmploymentClassification;
  filingType: 'Annual' | 'Entry' | 'Exit';
  asOfDate: string; // e.g., "December 31, 2025"
  submissionDate?: string;
  status: 'pending_submission' | 'submitted' | 'verified' | 'returned';
  documentUrl?: string;
  totalAssets?: number;
  totalLiabilities?: number;
  netWorth?: number;
  verifiedBy?: string;
  verifiedAt?: string;
  remarks?: string;
}

export interface PayslipItem {
  name: string;
  amount: number;
  category: 'earning' | 'deduction';
  code?: string;
}

export interface PayslipRecord {
  id: string; // e.g. PS-2026-01-EMP001
  employeeId: string;
  employeeNumber: string;
  employeeName: string;
  officeName: string;
  position: string;
  classification: EmploymentClassification;
  salaryGrade?: string;
  stepIncrement?: string;
  year: number; // e.g. 2026, 2025, 2024
  month: number; // 1-12
  monthName: string; // e.g. "January"
  periodLabel: string; // e.g. "January 1 - 31, 2026"
  payDate: string; // e.g. "January 31, 2026"
  basicSalary: number;
  pera: number; // Personnel Economic Relief Allowance
  rata?: number; // Representation and Transportation Allowance
  otherEarnings?: PayslipItem[];
  grossPay: number;
  
  // Mandatory Deductions
  gsisLifeAndRetirement: number; // 9%
  philHealth: number; // 2.5%
  pagIbig: number; // ₱100
  withholdingTax: number;
  
  // Optional / Loan Deductions
  gsisLoan?: number;
  pagIbigLoan?: number;
  landbankSalaryLoan?: number;
  coopLoan?: number;
  otherDeductions?: PayslipItem[];
  
  totalDeductions: number;
  netTakeHomePay: number;
  
  // Official Banking / Disbursal Details
  bankName: string;
  accountNumberMasked: string;
  payrollRefNumber: string;
  disbursedAt: string;
  certifiedBy: string;
  notedBy: string;
}

export type ESSRequestType = 
  | 'COE' 
  | 'PAYSLIP' 
  | 'IPCR' 
  | 'SERVICE_RECORD' 
  | 'LEAVE_CREDITS_CERT' 
  | 'NO_PENDING_CASE_CERT' 
  | 'BIR_2316' 
  | 'OTHER_CERTIFICATE';

export type ESSRequestStatus = 
  | 'pending' 
  | 'processing' 
  | 'ready' 
  | 'released' 
  | 'declined';

export interface ESSDocumentServiceRequest {
  id: string; // e.g. REQ-2026-001
  employeeId: string;
  employeeName: string;
  employeeNumber: string;
  officeName: string;
  position: string;
  classification: EmploymentClassification;
  requestType: ESSRequestType;
  title: string;
  purpose: string;
  periodCovered?: string;
  copies: number;
  withCompensation?: boolean;
  deliveryPreference: 'Digital Copy (PDF)' | 'In-Person Pick-up (MHRMO)' | 'Both Digital & In-Person';
  urgency?: 'Normal (2-3 days)' | 'Urgent (1 day)';
  remarks?: string;
  status: ESSRequestStatus;
  submittedAt: string;
  processedBy?: string;
  processedAt?: string;
  readyAt?: string;
  releasedAt?: string;
  hrRemarks?: string;
  trackingNumber?: string;
  issuedDocumentUrl?: string;
  issuedDocumentFileName?: string;
}

export type NotificationType = 
  | 'document_request' 
  | 'submission' 
  | 'verification' 
  | 'returned' 
  | 'leave_update' 
  | 'wellness_update' 
  | 'saln_reminder' 
  | 'system'
  | 'payslip_available'
  | 'ess_request_ready';

export interface SystemNotification {
  id: string;
  recipientUid?: string; // Specific user or null for role broadcast
  recipientRole?: UserRole | 'all';
  recipientEmployeeId?: string;
  title: string;
  message: string;
  type: NotificationType;
  targetPath?: string;
  targetTab?: 'overview' | '201_files' | 'requests' | 'leave' | 'wellness' | 'payslips';
  actionLabel?: string;
  isRead: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  actorUid: string;
  actorName: string;
  actorRole: string;
  action: string;
  targetEntity: string;
  targetId: string;
  details: string;
  timestamp: string;
}

export interface SystemSettings {
  systemName: string;
  lguName: string;
  provinceName: string;
  currentTermYear: number;
  headOfAgency: string; // Municipal Mayor
  hrmoHead: string;
  essSelfRegistrationEnabled: boolean;
  maintenanceMode: boolean;
  brandColors: {
    primaryBlue: string;
    softBlue: string;
    primaryOrange: string;
  };
}

export type AttendanceStatus = 
  | 'On Time' 
  | 'Late / Tardy' 
  | 'Undertime' 
  | 'Half Day' 
  | 'Absent' 
  | 'On Leave' 
  | 'Official Business (OB)';

export interface BiometricTerminal {
  id: string;
  name: string;
  location: string;
  ipAddress: string;
  model: string;
  status: 'online' | 'offline' | 'syncing';
  lastPing: string;
  totalLogsStored: number;
}

export interface BiometricRecord {
  id: string; // e.g. BIO-2026-02-10-EMP001
  employeeId: string;
  employeeName: string;
  employeeNumber: string;
  officeName: string;
  position: string;
  classification: EmploymentClassification;
  date: string; // YYYY-MM-DD
  amIn: string | null; // e.g. "07:54 AM"
  amOut: string | null; // e.g. "12:02 PM"
  pmIn: string | null; // e.g. "12:51 PM"
  pmOut: string | null; // e.g. "05:05 PM"
  tardyMinutes: number; // e.g. 0, 15
  undertimeMinutes: number; // e.g. 0
  totalHours: number; // e.g. 8.0
  status: AttendanceStatus;
  terminalId: string;
  terminalName: string;
  verificationMethod: 'Fingerprint' | 'Facial Recognition' | 'RFID Card' | 'Manual Log';
  syncStatus: 'synced' | 'pending_sync' | 'manual';
  syncedAt: string;
  verifiedBy?: string;
  verifiedAt?: string;
  remarks?: string;
}
