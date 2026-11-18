import {
  Office,
  DocumentCategory,
  Employee,
  UserAccount,
  DocumentRequest,
  LeaveApplication,
  WellnessApplication,
  SALNRecord,
  SystemSettings,
  ESSDocumentServiceRequest
} from '../types/index.ts';

export const INITIAL_SETTINGS: SystemSettings = {
  systemName: 'SJHR201 – Human Resource Management System',
  lguName: 'Municipality of San Jose',
  provinceName: 'Occidental Mindoro',
  currentTermYear: 2026,
  headOfAgency: '',
  hrmoHead: '',
  essSelfRegistrationEnabled: true,
  maintenanceMode: false,
  leaveWorkflowRouting: {
    supervisorEmail: '',
    mayorEmail: '',
    hrFinalReviewerEmail: '',
    emailNotificationsEnabled: true
  },
  brandColors: {
    primaryBlue: '#173B67',
    softBlue: '#DCEBFA',
    primaryOrange: '#F28C28'
  }
};

export const INITIAL_OFFICES: Office[] = [];

export const INITIAL_CATEGORIES: DocumentCategory[] = [
  {
    id: 'cat-01',
    code: 'PERSONAL',
    name: '1. Personal Information',
    description: 'Personal data sheets, civil registry certificates, and identity records',
    iconName: 'User',
    documentTypes: [
      { code: 'PDS_212', name: 'Personal Data Sheet (CS Form 212 Revised 2017)', isRequiredFor: ['Permanent', 'Temporary', 'Casual', 'Job Order', 'Contract of Service', 'Elective Officials'], privacy: 'employee_accessible', description: 'Notarized CS Form 212 with passport-size photo' },
      { code: 'WES', name: 'Work Experience Sheet', isRequiredFor: ['Permanent', 'Temporary', 'Casual'], privacy: 'employee_accessible' },
      { code: 'PSA_BIRTH', name: 'PSA Birth Certificate', isRequiredFor: ['Permanent', 'Temporary', 'Casual'], privacy: 'employee_accessible' },
      { code: 'PSA_MARRIAGE', name: 'PSA Marriage Certificate (if applicable)', isRequiredFor: [], privacy: 'employee_accessible' },
      { code: 'PSA_DEPENDENTS', name: 'PSA Dependent Birth Certificates', isRequiredFor: [], privacy: 'employee_accessible' }
    ]
  },
  {
    id: 'cat-02',
    code: 'APPOINTMENT',
    name: '2. Appointment and Employment',
    description: 'Official appointment papers, assumption of duty, contracts, and oaths',
    iconName: 'FileCheck',
    documentTypes: [
      { code: 'APPOINTMENT_PAPER', name: 'CSC Attested Appointment Paper', isRequiredFor: ['Permanent', 'Temporary', 'Casual'], privacy: 'employee_accessible' },
      { code: 'OATH_OF_OFFICE', name: 'Oath of Office', isRequiredFor: ['Permanent', 'Temporary', 'Casual', 'Elective Officials'], privacy: 'employee_accessible' },
      { code: 'ASSUMPTION_DUTY', name: 'Certificate of Assumption to Duty', isRequiredFor: ['Permanent', 'Temporary', 'Casual'], privacy: 'employee_accessible' },
      { code: 'PDF_FORM', name: 'Position Description Form (PDF)', isRequiredFor: ['Permanent', 'Temporary', 'Casual'], privacy: 'employee_accessible' },
      { code: 'JO_COS_CONTRACT', name: 'Contract of Service / Job Order Agreement', isRequiredFor: ['Job Order', 'Contract of Service'], privacy: 'employee_accessible' },
      { code: 'CONTRACT_EXTENSION', name: 'Contract Extension / Renewal Notice', isRequiredFor: ['Job Order', 'Contract of Service'], privacy: 'employee_accessible' },
      { code: 'PROMOTION_ORDER', name: 'Promotion / Transfer Order', isRequiredFor: [], privacy: 'employee_accessible' }
    ]
  },
  {
    id: 'cat-03',
    code: 'EDUCATION',
    name: '3. Educational Records',
    description: 'Diplomas, transcripts of records, and academic certifications',
    iconName: 'GraduationCap',
    documentTypes: [
      { code: 'TOR', name: 'Official Transcript of Records (TOR)', isRequiredFor: ['Permanent', 'Temporary', 'Casual'], privacy: 'employee_accessible' },
      { code: 'DIPLOMA', name: 'College / Post-Graduate Diploma', isRequiredFor: ['Permanent', 'Temporary', 'Casual'], privacy: 'employee_accessible' },
      { code: 'CAV', name: 'CHED / DepEd Certification, Authentication & Verification (CAV)', isRequiredFor: [], privacy: 'employee_accessible' }
    ]
  },
  {
    id: 'cat-04',
    code: 'ELIGIBILITY',
    name: '4. Eligibility and Professional Licenses',
    description: 'Civil Service eligibilities, PRC licenses, and bar admissions',
    iconName: 'Award',
    documentTypes: [
      { code: 'CSC_ELIGIBILITY', name: 'Certificate of Civil Service Eligibility (Professional / Sub-Professional)', isRequiredFor: ['Permanent', 'Temporary'], privacy: 'employee_accessible' },
      { code: 'PRC_LICENSE', name: 'PRC Identification Card & Board Certificate', isRequiredFor: [], privacy: 'employee_accessible' },
      { code: 'DRIVERS_LICENSE', name: 'LTO Driver\'s License (for drivers / field operators)', isRequiredFor: [], privacy: 'employee_accessible' }
    ]
  },
  {
    id: 'cat-05',
    code: 'MEDICAL',
    name: '5. Medical and Pre-Employment Requirements',
    description: 'CS Form 211 medical certificates, drug tests, and laboratory results',
    iconName: 'HeartPulse',
    documentTypes: [
      { code: 'CS_FORM_211', name: 'Medical Certificate (CS Form 211)', isRequiredFor: ['Permanent', 'Temporary', 'Casual', 'Job Order', 'Contract of Service'], privacy: 'hr_restricted' },
      { code: 'DRUG_TEST', name: 'Official Drug Test Result (Accredited Lab)', isRequiredFor: ['Permanent', 'Temporary', 'Casual', 'Job Order', 'Contract of Service'], privacy: 'hr_restricted' },
      { code: 'CHEST_XRAY', name: 'Chest X-Ray / Lab Examinations', isRequiredFor: ['Permanent', 'Temporary', 'Casual'], privacy: 'hr_restricted' },
      { code: 'NEURO_PSYCH', name: 'Neuro-Psychiatric Examination Result', isRequiredFor: ['Permanent'], privacy: 'highly_confidential' }
    ]
  },
  {
    id: 'cat-06',
    code: 'GOV_IDS',
    name: '6. Government IDs and Contributions',
    description: 'TIN, GSIS, PhilHealth, Pag-IBIG registration and IDs',
    iconName: 'CreditCard',
    documentTypes: [
      { code: 'TIN_VERIFICATION', name: 'BIR Form 1902 / 2316 or TIN ID', isRequiredFor: ['Permanent', 'Temporary', 'Casual', 'Job Order', 'Contract of Service', 'Elective Officials'], privacy: 'employee_accessible' },
      { code: 'GSIS_BP', name: 'GSIS Business Partner Number (BP#) / UMID Form', isRequiredFor: ['Permanent', 'Temporary', 'Casual'], privacy: 'employee_accessible' },
      { code: 'PHILHEALTH_MDR', name: 'PhilHealth Member Data Record (MDR)', isRequiredFor: ['Permanent', 'Temporary', 'Casual', 'Job Order', 'Contract of Service'], privacy: 'employee_accessible' },
      { code: 'PAGIBIG_MID', name: 'Pag-IBIG Member\'s Identification (MID) / Form', isRequiredFor: ['Permanent', 'Temporary', 'Casual', 'Job Order', 'Contract of Service'], privacy: 'employee_accessible' },
      { code: 'LGU_LANDBANK', name: 'Land Bank of the Philippines Payroll Account Details', isRequiredFor: ['Permanent', 'Temporary', 'Casual', 'Job Order', 'Contract of Service', 'Elective Officials'], privacy: 'employee_accessible' }
    ]
  },
  {
    id: 'cat-07',
    code: 'SALN',
    name: '7. SALN and Accountability Documents',
    description: 'Sworn Statement of Assets, Liabilities and Net Worth',
    iconName: 'ShieldAlert',
    documentTypes: [
      { code: 'SALN_ANNUAL', name: 'Sworn Annual SALN Form (CSC Revised 2015)', isRequiredFor: ['Permanent', 'Temporary', 'Casual', 'Elective Officials'], privacy: 'hr_restricted' },
      { code: 'SALN_ENTRY', name: 'Entry SALN Form', isRequiredFor: ['Permanent', 'Temporary', 'Casual', 'Elective Officials'], privacy: 'hr_restricted' },
      { code: 'SALN_EXIT', name: 'Exit SALN Form', isRequiredFor: [], privacy: 'hr_restricted' }
    ]
  },
  {
    id: 'cat-08',
    code: 'TRAINING',
    name: '8. Training and Development',
    description: 'Certificates of seminars, workshops, and leadership conferences',
    iconName: 'BookOpen',
    documentTypes: [
      { code: 'TRAINING_CERT', name: 'Certificates of Training / Seminars (Min. 40 hours)', isRequiredFor: ['Permanent'], privacy: 'employee_accessible' },
      { code: 'SPECIALIZED_TRAINING', name: 'Specialized Capacity Development Certificates', isRequiredFor: [], privacy: 'employee_accessible' }
    ]
  },
  {
    id: 'cat-09',
    code: 'PERFORMANCE',
    name: '9. Performance Management',
    description: 'Individual Performance Commitment and Review (IPCR) records',
    iconName: 'TrendingUp',
    documentTypes: [
      { code: 'IPCR_1ST_SEM', name: 'IPCR Form (1st Semester)', isRequiredFor: ['Permanent', 'Temporary', 'Casual'], privacy: 'employee_accessible' },
      { code: 'IPCR_2ND_SEM', name: 'IPCR Form (2nd Semester)', isRequiredFor: ['Permanent', 'Temporary', 'Casual'], privacy: 'employee_accessible' },
      { code: 'OPCR', name: 'Office Performance Commitment and Review (OPCR)', isRequiredFor: [], privacy: 'hr_restricted' }
    ]
  },
  {
    id: 'cat-10',
    code: 'LEAVE_WELLNESS',
    name: '10. Leave and Wellness Records',
    description: 'CSC Form 6 Leave Applications, Wellness Forms W-01 & W-02',
    iconName: 'CalendarCheck',
    documentTypes: [
      { code: 'CSC_FORM_6', name: 'Application for Leave (CSC Form No. 6 Revised 2020)', isRequiredFor: [], privacy: 'employee_accessible' },
      { code: 'WELLNESS_W01', name: 'Wellness Leave Application Form (W-01)', isRequiredFor: [], privacy: 'employee_accessible' },
      { code: 'WELLNESS_W02', name: 'Wellness Break Request Form (W-02)', isRequiredFor: [], privacy: 'employee_accessible' },
      { code: 'LEAVE_CARD', name: 'Employee Leave Card Record', isRequiredFor: ['Permanent', 'Temporary', 'Casual'], privacy: 'employee_accessible' }
    ]
  },
  {
    id: 'cat-11',
    code: 'COMPENSATION',
    name: '11. Compensation and Benefits',
    description: 'Notice of Salary Adjustment, Step Increment, and allowances',
    iconName: 'Banknote',
    documentTypes: [
      { code: 'NOSA', name: 'Notice of Salary Adjustment (NOSA)', isRequiredFor: [], privacy: 'employee_accessible' },
      { code: 'NOSI', name: 'Notice of Step Increment (NOSI)', isRequiredFor: [], privacy: 'employee_accessible' },
      { code: 'LOYALTY_AWARD', name: 'Loyalty Award Notice & Certification', isRequiredFor: [], privacy: 'employee_accessible' }
    ]
  },
  {
    id: 'cat-12',
    code: 'LEGAL',
    name: '12. Administrative and Legal Records',
    description: 'Disciplinary proceedings, notices, and legal orders',
    iconName: 'Scale',
    documentTypes: [
      { code: 'SHOW_CAUSE', name: 'Show Cause Order / Explanation', isRequiredFor: [], privacy: 'highly_confidential' },
      { code: 'ADMIN_DECISION', name: 'Administrative Investigation Resolution', isRequiredFor: [], privacy: 'highly_confidential' }
    ]
  },
  {
    id: 'cat-13',
    code: 'CLEARANCES',
    name: '13. Personnel Clearances',
    description: 'NBI, Police, Barangay clearances, and CS Form 7 clearance',
    iconName: 'ShieldCheck',
    documentTypes: [
      { code: 'NBI_CLEARANCE', name: 'NBI Clearance (Valid)', isRequiredFor: ['Permanent', 'Temporary', 'Casual', 'Job Order', 'Contract of Service'], privacy: 'employee_accessible' },
      { code: 'POLICE_CLEARANCE', name: 'Police Clearance (San Jose MPS)', isRequiredFor: ['Permanent', 'Temporary', 'Casual'], privacy: 'employee_accessible' },
      { code: 'OMBUDSMAN_CLEARANCE', name: 'Ombudsman Clearance (for Promotions/Retirement)', isRequiredFor: [], privacy: 'hr_restricted' },
      { code: 'CSC_FORM_7', name: 'Clearance from Property and Money Accountability (CS Form 7)', isRequiredFor: [], privacy: 'employee_accessible' }
    ]
  },
  {
    id: 'cat-14',
    code: 'SEPARATION',
    name: '14. Separation, Retirement and Transfer',
    description: 'Terminal leave papers, retirement claims, and resignation letters',
    iconName: 'UserMinus',
    documentTypes: [
      { code: 'RESIGNATION_LETTER', name: 'Letter of Resignation & Acceptance', isRequiredFor: [], privacy: 'hr_restricted' },
      { code: 'RETIREMENT_PAPERS', name: 'GSIS / LGU Retirement Application and Order', isRequiredFor: [], privacy: 'hr_restricted' },
      { code: 'CERT_FINAL_SALARY', name: 'Certificate of Last Payment and Clearance', isRequiredFor: [], privacy: 'employee_accessible' }
    ]
  },
  {
    id: 'cat-15',
    code: 'OTHER',
    name: '15. Other Personnel Documents',
    description: 'Travel orders, pass slips, COE copies, and commendations',
    iconName: 'FolderPlus',
    documentTypes: [
      { code: 'TRAVEL_ORDER', name: 'Approved LGU Travel Order', isRequiredFor: [], privacy: 'employee_accessible' },
      { code: 'PASS_SLIP', name: 'Official Pass Slip', isRequiredFor: [], privacy: 'employee_accessible' },
      { code: 'COE_ISSUED', name: 'Certificate of Employment Issued', isRequiredFor: [], privacy: 'employee_accessible' },
      { code: 'COMMENDATION', name: 'Letter of Commendation / Special Citation', isRequiredFor: [], privacy: 'employee_accessible' }
    ]
  }
];

export const INITIAL_EMPLOYEES: Employee[] = [];

export const INITIAL_ACCOUNTS: UserAccount[] = [];

export const INITIAL_DOCUMENT_REQUESTS: DocumentRequest[] = [];

export const INITIAL_LEAVE_APPLICATIONS: LeaveApplication[] = [];

export const INITIAL_WELLNESS_APPLICATIONS: WellnessApplication[] = [];

export const INITIAL_SALN_RECORDS: SALNRecord[] = [];

export const INITIAL_ESS_SERVICE_REQUESTS: ESSDocumentServiceRequest[] = [];

