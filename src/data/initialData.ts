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
  headOfAgency: 'Hon. Rey Ladaga (Municipal Mayor)',
  hrmoHead: 'Atty. Maria Elena Castillo, MHRMO Head',
  essSelfRegistrationEnabled: true,
  maintenanceMode: false,
  brandColors: {
    primaryBlue: '#173B67',
    softBlue: '#DCEBFA',
    primaryOrange: '#F28C28'
  }
};

export const INITIAL_OFFICES: Office[] = [
  { id: 'off-01', code: 'MO', name: "Mayor's Office", headName: 'Hon. Rey Ladaga', location: 'Municipal Hall, 2nd Floor', isActive: true, employeeCount: 14, sections: ['Executive Staff', 'Internal Audit', 'BPLO'] },
  { id: 'off-02', code: 'MAO', name: "Municipal Assessor's Office", headName: 'Engr. Roberto Dimaculangan', location: 'Ground Floor, East Wing', isActive: true, employeeCount: 18, sections: ['Tax Mapping', 'Appraisal & Assessment'] },
  { id: 'off-03', code: 'MCRO', name: 'Municipal Civil Registrar', headName: 'Atty. Carmela Bautista', location: 'Ground Floor, North Wing', isActive: true, employeeCount: 12, sections: ['Birth & Death Registration', 'Marriage Licenses'] },
  { id: 'off-04', code: 'MACCO', name: 'Municipal Accounting Office', headName: 'Mr. Leonardo Fernandez, CPA', location: '2nd Floor, Finance Wing', isActive: true, employeeCount: 16, sections: ['Bookkeeping', 'Disbursement', 'Financial Reporting'] },
  { id: 'off-05', code: 'MTCDO', name: 'Municipal Tourism, Culture and Development Office', headName: 'Ms. Clarisse Ramos', location: 'Cultural Center Annex', isActive: true, employeeCount: 9, sections: ['Tourism Promotion', 'Heritage & Culture'] },
  { id: 'off-06', code: 'SB', name: 'Sangguniang Bayan', headName: 'Hon. Sonny Javier (Vice Mayor)', location: 'Legislative Building', isActive: true, employeeCount: 22, sections: ['Secretariat', 'Ordinance Drafting', 'Committee Affairs'] },
  { id: 'off-07', code: 'MBO', name: 'Municipal Budget Office', headName: 'Ms. Teresa Mendoza', location: '2nd Floor, Finance Wing', isActive: true, employeeCount: 10, sections: ['Budget Planning', 'Allotment Control'] },
  { id: 'off-08', code: 'MHO', name: 'Municipal Health Office', headName: 'Dr. Jaime Soriano, MD', location: 'San Jose Municipal Health Center', isActive: true, employeeCount: 42, sections: ['Primary Healthcare', 'Maternal Care', 'Sanitation'] },
  { id: 'off-09', code: 'MENRO', name: 'Municipal Environment and Natural Resources Office', headName: 'For. Edgardo Cruz', location: 'Annex Building, 1st Floor', isActive: true, employeeCount: 15, sections: ['Solid Waste', 'Coastal Resources', 'Forest Protection'] },
  { id: 'off-10', code: 'MIO', name: 'Municipal Information Office', headName: 'Mr. Arthur Villanueva', location: 'Municipal Hall, 2nd Floor', isActive: true, employeeCount: 8, sections: ['Public Relations', 'Digital Media', 'Broadcast'] },
  { id: 'off-11', code: 'MPDO', name: 'Municipal Planning and Development Office', headName: 'EnP. Jerome Magan', location: '2nd Floor, Planning Wing', isActive: true, employeeCount: 14, sections: ['Socio-Economic Planning', 'Zoning & GIS', 'Project Monitoring'] },
  { id: 'off-12', code: 'GSO', name: 'General Services Office', headName: 'Mr. Fernando De Leon', location: 'Motorpool Compound', isActive: true, employeeCount: 28, sections: ['Property Custodianship', 'Procurement & Supply', 'Building Maintenance'] },
  { id: 'off-13', code: 'MSWDO', name: 'Municipal Social Welfare and Development Office', headName: 'Ms. Rosalinda Gutierrez, RSW', location: 'Community Center', isActive: true, employeeCount: 24, sections: ['Child & Youth', 'Senior Citizens & PWD', 'Crisis Intervention'] },
  { id: 'off-14', code: 'MDRRMO', name: 'Municipal Disaster Risk Reduction and Management Office', headName: 'Capt. Danilo Santos', location: 'Emergency Operations Center', isActive: true, employeeCount: 20, sections: ['Operations & Warning', 'Training', 'Logistics'] },
  { id: 'off-15', code: 'HRMO', name: 'Human Resource Office', headName: 'Ms. Elena Castillo', location: 'Ground Floor, Administration Wing', isActive: true, employeeCount: 12, sections: ['Personnel Selection', 'Employee Welfare', '201 Records', 'Payroll'] },
  { id: 'off-16', code: 'PESO', name: 'Public Employment Service Office', headName: 'Mr. Gabriel Aquino', location: 'Ground Floor, Public Wing', isActive: true, employeeCount: 7, sections: ['Job Placement', 'Special Program for Employment of Students'] },
  { id: 'off-17', code: 'MTO', name: 'Municipal Treasurer\'s Office', headName: 'Mr. Vicente Alcantara', location: 'Ground Floor, Treasury Hall', isActive: true, employeeCount: 25, sections: ['Cash Receipts', 'Disbursement', 'Real Property Tax'] },
  { id: 'off-18', code: 'MEO', name: 'Municipal Engineering Office', headName: 'Engr. Manuel Cordero', location: 'Engineering Building', isActive: true, employeeCount: 30, sections: ['Infrastructure & Projects', 'Building Permitting', 'Survey'] },
  { id: 'off-19', code: 'PMO', name: 'Public Market Office', headName: 'Mr. Rolando Pineda', location: 'Public Market Complex', isActive: true, employeeCount: 15, sections: ['Stall Administration', 'Market Sanitation', 'Security'] },
  { id: 'off-20', code: 'MAgro', name: 'Municipal Agriculture Office', headName: 'Ms. Corazon Delos Reyes', location: 'Agricultural Demonstration Station', isActive: true, employeeCount: 19, sections: ['Crop Production', 'Fisheries', 'Veterinary Services'] },
  { id: 'off-21', code: 'MCDO', name: 'Municipal Cooperative Development Office', headName: 'Mr. Joseph Navarro', location: 'Community Center 2nd Floor', isActive: true, employeeCount: 6, sections: ['Cooperative Assistance', 'Livelihood Training'] },
  { id: 'off-22', code: 'BAC', name: 'Bids and Awards Committee', headName: 'Atty. Victoriano Sanchez (Secretariat Head)', location: '2nd Floor, Session Hall Annex', isActive: true, employeeCount: 8, sections: ['Secretariat', 'Technical Working Group'] },
  { id: 'off-23', code: 'TMO', name: 'Traffic Management Office', headName: 'Mr. Salvador Reyes', location: 'Central Terminal Office', isActive: true, employeeCount: 26, sections: ['Traffic Enforcement', 'Road Safety', 'Citation Verification'] },
];

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

export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 'EMP-2022-001',
    employeeNumber: 'SJ-PERM-0142',
    previousEmployeeNumbers: ['SJ-CAS-0089'],
    firstName: 'Maria',
    middleName: 'Santos',
    lastName: 'Reyes',
    email: 'maria.santos@sanjose.gov.ph',
    isEmailVerified: true,
    phone: '0917-882-1402',
    officeId: 'off-15',
    officeName: 'Human Resource Office',
    position: 'Human Resource Management Officer II',
    classification: 'Permanent',
    employmentStatus: 'Active',
    recordStatus: 'Active',
    hireDate: '2019-03-15',
    salaryGrade: 'SG 15',
    stepIncrement: 'Step 2',
    monthlySalary: 36619,
    tin: '245-891-002-000',
    gsis: '20019284102',
    philhealth: '12-050291823-1',
    pagibig: '1210-9284-1823',
    civilStatus: 'Married',
    citizenship: 'Filipino',
    dateOfBirth: '1990-05-18',
    residentialAddress: 'Brgy. Central, San Jose, Occidental Mindoro',
    permanentAddress: 'Brgy. Central, San Jose, Occidental Mindoro',
    emergencyContactName: 'Carlos Reyes (Spouse)',
    emergencyContactPhone: '0917-555-9012',
    emergencyContactRelation: 'Spouse',
    essRegistered: true,
    essUsername: 'msantos',
    createdAt: '2022-01-10T08:00:00.000Z',
    updatedAt: '2026-01-15T09:30:00.000Z'
  },
  {
    id: 'EMP-2023-045',
    employeeNumber: 'SJ-PERM-0188',
    firstName: 'Juan',
    middleName: 'Bautista',
    lastName: 'Dela Cruz',
    email: 'juan.delacruz@sanjose.gov.ph',
    isEmailVerified: true,
    phone: '0928-119-4820',
    officeId: 'off-11',
    officeName: 'Municipal Planning and Development Office',
    position: 'Planning Officer III',
    classification: 'Permanent',
    employmentStatus: 'Active',
    recordStatus: 'Active',
    hireDate: '2021-08-01',
    salaryGrade: 'SG 18',
    stepIncrement: 'Step 1',
    monthlySalary: 46725,
    tin: '192-849-112-000',
    gsis: '19982716254',
    philhealth: '04-201928374-9',
    pagibig: '1029-3847-5612',
    civilStatus: 'Single',
    citizenship: 'Filipino',
    dateOfBirth: '1988-11-23',
    residentialAddress: 'Brgy. San Roque, San Jose, Occidental Mindoro',
    emergencyContactName: 'Elena Dela Cruz (Mother)',
    emergencyContactPhone: '0920-444-1290',
    essRegistered: true,
    essUsername: 'jdelacruz',
    createdAt: '2023-02-14T08:00:00.000Z',
    updatedAt: '2026-02-10T11:00:00.000Z'
  },
  {
    id: 'EMP-2024-102',
    employeeNumber: 'SJ-CAS-0312',
    firstName: 'Clarisse',
    middleName: 'Gomez',
    lastName: 'Villanueva',
    email: 'clarisse.villanueva@sanjose.gov.ph',
    isEmailVerified: true,
    phone: '0995-341-9081',
    officeId: 'off-03',
    officeName: 'Municipal Civil Registrar',
    position: 'Administrative Aide IV',
    classification: 'Casual',
    employmentStatus: 'Active',
    recordStatus: 'Active',
    hireDate: '2023-01-16',
    salaryGrade: 'SG 4',
    stepIncrement: 'Step 1',
    monthlySalary: 15586,
    tin: '381-902-311-000',
    civilStatus: 'Single',
    citizenship: 'Filipino',
    dateOfBirth: '1998-04-12',
    residentialAddress: 'Brgy. Bubog, San Jose, Occidental Mindoro',
    essRegistered: false,
    createdAt: '2024-01-16T08:00:00.000Z',
    updatedAt: '2026-01-10T14:20:00.000Z'
  },
  {
    id: 'EMP-2024-219',
    employeeNumber: 'SJ-JO-0518',
    firstName: 'Mark Anthony',
    middleName: 'Perez',
    lastName: 'Tolentino',
    email: 'mark.tolentino@sanjose.gov.ph',
    isEmailVerified: true,
    phone: '0949-881-2390',
    officeId: 'off-14',
    officeName: 'Municipal Disaster Risk Reduction and Management Office',
    position: 'Emergency Response Technician',
    classification: 'Job Order',
    employmentStatus: 'Active',
    recordStatus: 'Active',
    hireDate: '2024-02-01',
    monthlySalary: 18000,
    tin: '419-029-381-000',
    civilStatus: 'Single',
    citizenship: 'Filipino',
    dateOfBirth: '1996-09-08',
    residentialAddress: 'Brgy. Caminawit, San Jose, Occidental Mindoro',
    essRegistered: false,
    createdAt: '2024-02-01T08:00:00.000Z',
    updatedAt: '2026-01-05T10:00:00.000Z'
  },
  {
    id: 'EMP-2025-011',
    employeeNumber: 'SJ-COS-0082',
    firstName: 'Engr. Paulo',
    middleName: 'Mendoza',
    lastName: 'Aquino',
    email: 'paulo.aquino@sanjose.gov.ph',
    isEmailVerified: true,
    phone: '0919-281-7409',
    officeId: 'off-18',
    officeName: 'Municipal Engineering Office',
    position: 'Structural Project Consultant',
    classification: 'Contract of Service',
    employmentStatus: 'Active',
    recordStatus: 'Active',
    hireDate: '2025-03-01',
    monthlySalary: 45000,
    tin: '209-182-390-000',
    civilStatus: 'Married',
    citizenship: 'Filipino',
    dateOfBirth: '1985-07-29',
    residentialAddress: 'Brgy. Labangan Poblacion, San Jose, Occidental Mindoro',
    essRegistered: false,
    createdAt: '2025-03-01T08:00:00.000Z',
    updatedAt: '2026-02-01T15:00:00.000Z'
  },
  {
    id: 'EMP-2022-005',
    employeeNumber: 'SJ-ELEC-0002',
    firstName: 'Hon. Sonny',
    lastName: 'Javier',
    email: 'sonny.javier@sanjose.gov.ph',
    isEmailVerified: true,
    phone: '0918-999-0012',
    officeId: 'off-06',
    officeName: 'Sangguniang Bayan',
    position: 'Municipal Vice Mayor & Presiding Officer',
    classification: 'Elective Officials',
    employmentStatus: 'Active',
    recordStatus: 'Active',
    hireDate: '2022-06-30',
    salaryGrade: 'SG 26',
    monthlySalary: 116040,
    tin: '102-394-819-000',
    civilStatus: 'Married',
    citizenship: 'Filipino',
    dateOfBirth: '1974-03-14',
    residentialAddress: 'Brgy. Poblacion, San Jose, Occidental Mindoro',
    essRegistered: false,
    createdAt: '2022-06-30T08:00:00.000Z',
    updatedAt: '2026-01-01T09:00:00.000Z'
  }
];

export const INITIAL_ACCOUNTS: UserAccount[] = [
  {
    uid: 'usr-developer',
    username: 'dev_sanjose',
    email: 'jmmagan123mpdo@gmail.com',
    displayName: 'Lead System Developer',
    role: 'developer',
    permissions: [
      'view_employees', 'add_employees', 'edit_employees',
      'upload_documents', 'scan_documents', 'verify_documents',
      'request_documents', 'process_leave', 'process_wellness',
      'generate_reports', 'manage_offices'
    ],
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    uid: 'usr-hr-admin',
    username: 'hr_admin',
    email: 'hrmo.admin@sanjose.gov.ph',
    displayName: 'Elena Castillo (HR Administrator)',
    role: 'hr_admin',
    permissions: [
      'view_employees', 'add_employees', 'edit_employees',
      'upload_documents', 'scan_documents', 'verify_documents',
      'request_documents', 'process_leave', 'process_wellness',
      'generate_reports', 'manage_offices'
    ],
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    uid: 'usr-hr-staff',
    username: 'hr_staff',
    email: 'hrstaff.records@sanjose.gov.ph',
    displayName: 'Ricardo Manalo (HR Staff)',
    role: 'hr_staff',
    permissions: [
      'view_employees', 'add_employees', 'edit_employees',
      'upload_documents', 'scan_documents', 'verify_documents',
      'request_documents', 'process_leave', 'process_wellness',
      'generate_reports'
    ],
    isActive: true,
    createdAt: '2026-01-05T00:00:00.000Z'
  },
  {
    uid: 'usr-payroll',
    username: 'payroll_officer',
    email: 'payroll@sanjose.gov.ph',
    displayName: 'Grace Balmes (Payroll Personnel)',
    role: 'payroll',
    permissions: ['view_employees', 'generate_reports'],
    isActive: true,
    createdAt: '2026-01-05T00:00:00.000Z'
  },
  {
    uid: 'usr-emp-maria',
    username: 'msantos',
    email: 'maria.santos@sanjose.gov.ph',
    displayName: 'Maria Santos Reyes',
    role: 'employee',
    employeeId: 'EMP-2022-001',
    permissions: [],
    isActive: true,
    createdAt: '2026-01-10T00:00:00.000Z'
  },
  {
    uid: 'usr-emp-juan',
    username: 'jdelacruz',
    email: 'juan.delacruz@sanjose.gov.ph',
    displayName: 'Juan B. Dela Cruz',
    role: 'employee',
    employeeId: 'EMP-2023-045',
    permissions: [],
    isActive: true,
    createdAt: '2026-01-15T00:00:00.000Z'
  }
];

export const INITIAL_DOCUMENT_REQUESTS: DocumentRequest[] = [
  {
    id: 'req-2026-001',
    employeeId: 'EMP-2022-001',
    employeeName: 'Maria Santos Reyes',
    categoryId: 'cat-07',
    categoryName: '7. SALN and Accountability Documents',
    documentName: 'Sworn Annual SALN Form (CSC Revised 2015) as of Dec 31, 2025',
    documentTypeCode: 'SALN_ANNUAL',
    instructions: 'Please upload or scan the notarized SALN form with all attached schedules. Due before statutory deadline of April 30.',
    dueDate: '2026-04-15',
    isRequired: true,
    status: 'requested',
    requestedBy: 'Elena Castillo (HR Admin)',
    requestedAt: '2026-02-01T09:00:00.000Z'
  },
  {
    id: 'req-2026-002',
    employeeId: 'EMP-2023-045',
    employeeName: 'Juan Dela Cruz',
    categoryId: 'cat-09',
    categoryName: '9. Performance Management',
    documentName: 'IPCR Form (2nd Semester 2025)',
    documentTypeCode: 'IPCR_2ND_SEM',
    instructions: 'Upload approved IPCR signed by Planning Head EnP. Jerome Magan with Numerical and Adjectival rating.',
    dueDate: '2026-02-28',
    isRequired: true,
    status: 'under_review',
    requestedBy: 'Ricardo Manalo (HR Staff)',
    requestedAt: '2026-01-15T10:30:00.000Z',
    submittedFileName: 'IPCR_2025_2ndSem_Signed_JDelaCruz.pdf',
    submittedAt: '2026-02-05T14:22:00.000Z'
  }
];

export const INITIAL_LEAVE_APPLICATIONS: LeaveApplication[] = [
  {
    id: 'LV-2026-010',
    employeeId: 'EMP-2022-001',
    employeeName: 'Maria Santos Reyes',
    officeName: 'Human Resource Office',
    position: 'Human Resource Management Officer II',
    leaveType: 'Vacation',
    detailsOfLeave: 'Family vacation within the Philippines',
    workingDays: 3,
    inclusiveDates: 'Feb 18, 2026 - Feb 20, 2026',
    commutation: 'Not Requested',
    status: 'pending_supervisor',
    createdAt: '2026-02-08T08:15:00.000Z'
  },
  {
    id: 'LV-2026-008',
    employeeId: 'EMP-2023-045',
    employeeName: 'Juan Dela Cruz',
    officeName: 'Municipal Planning and Development Office',
    position: 'Planning Officer III',
    leaveType: 'Special Privilege',
    detailsOfLeave: 'Personal milestones / children school activities',
    workingDays: 1,
    inclusiveDates: 'Feb 12, 2026',
    commutation: 'Not Requested',
    status: 'approved',
    supervisorAssessment: 'Approved',
    supervisorRemarks: 'Endorsed. Work coverage assigned.',
    supervisorName: 'EnP. Jerome Magan',
    supervisorDate: '2026-02-09T10:00:00.000Z',
    mayorDecision: 'Approved',
    mayorRemarks: 'Approved as recommended.',
    mayorName: 'Hon. Rey Ladaga',
    mayorDate: '2026-02-09T14:30:00.000Z',
    createdAt: '2026-02-07T11:20:00.000Z'
  }
];

export const INITIAL_WELLNESS_APPLICATIONS: WellnessApplication[] = [
  {
    id: 'WEL-2026-004',
    formType: 'W-01', // Wellness Leave
    employeeId: 'EMP-2022-001',
    employeeName: 'Maria Santos Reyes',
    officeName: 'Human Resource Office',
    position: 'Human Resource Management Officer II',
    reason: 'Preventive health screening and mental wellness break per LGU Wellness Directive.',
    activityDetails: 'Annual physical examination and executive rest session.',
    requestedDate: 'Feb 26, 2026',
    duration: '1 Working Day',
    status: 'pending_supervisor',
    createdAt: '2026-02-09T13:40:00.000Z'
  },
  {
    id: 'WEL-2026-002',
    formType: 'W-02', // Wellness Break
    employeeId: 'EMP-2023-045',
    employeeName: 'Juan Dela Cruz',
    officeName: 'Municipal Planning and Development Office',
    position: 'Planning Officer III',
    reason: 'LGU Physical Fitness and Aerobics session.',
    activityDetails: 'Municipal gym cardiovascular workout break.',
    requestedDate: 'Feb 13, 2026',
    duration: '2 Hours (3:00 PM – 5:00 PM)',
    status: 'approved',
    supervisorAssessment: 'Approved',
    supervisorName: 'EnP. Jerome Magan',
    supervisorDate: '2026-02-08T09:00:00.000Z',
    headDecision: 'Approved',
    headRemarks: 'Granted under wellness program rules.',
    headName: 'Hon. Rey Ladaga',
    headDate: '2026-02-08T16:00:00.000Z',
    createdAt: '2026-02-07T14:00:00.000Z'
  }
];

export const INITIAL_SALN_RECORDS: SALNRecord[] = [
  {
    id: 'saln-2025-001',
    employeeId: 'EMP-2022-001',
    employeeName: 'Maria Santos Reyes',
    officeName: 'Human Resource Office',
    classification: 'Permanent',
    filingType: 'Annual',
    asOfDate: 'December 31, 2025',
    status: 'pending_submission'
  },
  {
    id: 'saln-2025-002',
    employeeId: 'EMP-2023-045',
    employeeName: 'Juan Dela Cruz',
    officeName: 'Municipal Planning and Development Office',
    classification: 'Permanent',
    filingType: 'Annual',
    asOfDate: 'December 31, 2025',
    submissionDate: '2026-02-01',
    status: 'verified',
    totalAssets: 1450000,
    totalLiabilities: 320000,
    netWorth: 1130000,
    verifiedBy: 'Elena Castillo (HR Admin)',
    verifiedAt: '2026-02-03T11:00:00.000Z'
  },
  {
    id: 'saln-2025-003',
    employeeId: 'EMP-2022-005',
    employeeName: 'Hon. Sonny Javier',
    officeName: 'Sangguniang Bayan',
    classification: 'Elective Officials',
    filingType: 'Annual',
    asOfDate: 'December 31, 2025',
    status: 'pending_submission'
  }
];

export const INITIAL_ESS_SERVICE_REQUESTS: ESSDocumentServiceRequest[] = [
  {
    id: 'ESSR-2026-001',
    employeeId: 'EMP-2022-001',
    employeeName: 'Maria Santos Reyes',
    employeeNumber: 'SJ-PERM-0142',
    officeName: 'Human Resource Office',
    position: 'Human Resource Management Officer II',
    classification: 'Permanent',
    requestType: 'COE',
    title: 'Certificate of Employment (with Compensation & Allowances)',
    purpose: 'Pag-IBIG Housing Loan Application',
    copies: 2,
    withCompensation: true,
    deliveryPreference: 'Both Digital & In-Person',
    urgency: 'Normal (2-3 days)',
    status: 'ready',
    trackingNumber: 'MHRMO-COE-2026-0042',
    submittedAt: '2026-02-04T08:30:00.000Z',
    processedBy: 'Elena Castillo (HR Admin)',
    processedAt: '2026-02-04T11:15:00.000Z',
    readyAt: '2026-02-04T14:00:00.000Z',
    hrRemarks: 'Official sealed COE generated and signed. Digital copy ready for download, original hard copy available at MHRMO Window 2.',
    issuedDocumentFileName: 'COE_MariaSantosReyes_Compensation_2026.pdf',
    issuedDocumentUrl: '#'
  },
  {
    id: 'ESSR-2026-002',
    employeeId: 'EMP-2022-001',
    employeeName: 'Maria Santos Reyes',
    employeeNumber: 'SJ-PERM-0142',
    officeName: 'Human Resource Office',
    position: 'Human Resource Management Officer II',
    classification: 'Permanent',
    requestType: 'PAYSLIP',
    title: 'Certified True Copy of Payslip',
    purpose: 'GSIS Multi-Purpose Loan (MPL) Application',
    periodCovered: 'January 2026 (Full Pay Period)',
    copies: 1,
    deliveryPreference: 'Digital Copy (PDF)',
    urgency: 'Normal (2-3 days)',
    status: 'released',
    trackingNumber: 'MHRMO-PAY-2026-0118',
    submittedAt: '2026-02-02T10:00:00.000Z',
    processedBy: 'Grace Balmes (Payroll)',
    processedAt: '2026-02-02T14:30:00.000Z',
    readyAt: '2026-02-02T15:00:00.000Z',
    releasedAt: '2026-02-02T16:00:00.000Z',
    hrRemarks: 'Itemized payroll slip verified against Landbank payroll register. Digital certified copy released.',
    issuedDocumentFileName: 'Payslip_Jan2026_Certified_MariaReyes.pdf',
    issuedDocumentUrl: '#'
  },
  {
    id: 'ESSR-2026-003',
    employeeId: 'EMP-2022-001',
    employeeName: 'Maria Santos Reyes',
    employeeNumber: 'SJ-PERM-0142',
    officeName: 'Human Resource Office',
    position: 'Human Resource Management Officer II',
    classification: 'Permanent',
    requestType: 'IPCR',
    title: 'IPCR Rating Certificate (2nd Semester 2025)',
    purpose: 'Promotion & Step Increment Requirement',
    periodCovered: 'July - December 2025 (Rating: 4.85 / Outstanding)',
    copies: 1,
    deliveryPreference: 'Both Digital & In-Person',
    urgency: 'Normal (2-3 days)',
    status: 'processing',
    trackingNumber: 'MHRMO-IPCR-2026-0029',
    submittedAt: '2026-02-08T09:20:00.000Z',
    processedBy: 'Ricardo Manalo (HR Staff)',
    processedAt: '2026-02-08T11:00:00.000Z',
    hrRemarks: 'Under verification with PMT (Performance Management Team) evaluation records.'
  },
  {
    id: 'ESSR-2026-004',
    employeeId: 'EMP-2023-045',
    employeeName: 'Juan Dela Cruz',
    employeeNumber: 'SJ-PERM-0188',
    officeName: 'Municipal Planning and Development Office',
    position: 'Planning Officer III',
    classification: 'Permanent',
    requestType: 'SERVICE_RECORD',
    title: 'Certified Service Record (CSC Form 126)',
    purpose: 'Step Increment Certification',
    copies: 2,
    deliveryPreference: 'In-Person Pick-up (MHRMO)',
    urgency: 'Normal (2-3 days)',
    status: 'pending',
    trackingNumber: 'MHRMO-SR-2026-0081',
    submittedAt: '2026-02-09T14:10:00.000Z'
  }
];
