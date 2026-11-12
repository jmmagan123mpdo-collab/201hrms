import {
  TravelOrder,
  PassSlip,
  TrainingRecord,
  PerformanceRating,
  OvertimeRecord,
  SystemBroadcast,
  UserAccount
} from '../types/index.ts';

export const INITIAL_TRAVEL_ORDERS: TravelOrder[] = [
  {
    id: 'TO-2026-001',
    toTrackingNumber: 'TO-LGU-SJ-2026-0012',
    employeeId: 'EMP-2024-001',
    employeeNumber: 'SJ-2024-001',
    employeeName: 'Atty. Maria Elena Castillo',
    officeName: 'Human Resource Office',
    position: 'Municipal Government Department Head I (MHRMO)',
    destination: 'Civil Service Commission Regional Office IV-B, Quezon City',
    departureDate: '2026-02-18',
    returnDate: '2026-02-20',
    purpose: 'Attend Regional HR Symposium on Prime-HRM Level III Certification and Localized CSC Omnibus Rules Consultation.',
    transportationType: 'Commercial Air',
    perDiemEstimated: 8500,
    appropriationCode: '1011-5-02-01-010',
    status: 'Approved',
    recommendingApprovalBy: 'Atty. Maria Elena Castillo, MHRMO Head',
    approvedBy: 'Hon. Rey Ladaga, Municipal Mayor',
    createdAt: '2026-02-05T08:30:00.000Z',
    approvedAt: '2026-02-06T14:15:00.000Z'
  },
  {
    id: 'TO-2026-002',
    toTrackingNumber: 'TO-LGU-SJ-2026-0013',
    employeeId: 'EMP-2024-004',
    employeeNumber: 'SJ-2024-004',
    employeeName: 'Engr. Manuel Cordero',
    officeName: 'Municipal Engineering Office',
    position: 'Municipal Engineer',
    destination: 'DPWH Regional Office IV-B, Calapan City, Oriental Mindoro',
    departureDate: '2026-02-22',
    returnDate: '2026-02-24',
    purpose: 'Coordination meeting for San Jose Coastal Bypass Road and River Flood Control Infrastructure Allotments.',
    transportationType: 'Ferry / RoRo',
    perDiemEstimated: 6200,
    appropriationCode: '1021-5-02-01-010',
    status: 'Approved',
    recommendingApprovalBy: 'Engr. Manuel Cordero',
    approvedBy: 'Hon. Rey Ladaga, Municipal Mayor',
    createdAt: '2026-02-08T09:00:00.000Z',
    approvedAt: '2026-02-09T11:00:00.000Z'
  },
  {
    id: 'TO-2026-003',
    toTrackingNumber: 'TO-LGU-SJ-2026-0014',
    employeeId: 'EMP-2024-003',
    employeeNumber: 'SJ-2024-003',
    employeeName: 'Dr. Jaime Soriano',
    officeName: 'Municipal Health Office',
    position: 'Municipal Health Officer',
    destination: 'DOH Center for Health Development, Batangas City',
    departureDate: '2026-03-02',
    returnDate: '2026-03-04',
    purpose: 'Quarterly Provincial Epidemiological Surveillance Review and Vaccine Cold Chain Logistics Workshop.',
    transportationType: 'Official Vehicle',
    perDiemEstimated: 5400,
    appropriationCode: '1031-5-02-01-010',
    status: 'Pending Approval',
    recommendingApprovalBy: 'Dr. Jaime Soriano, MD',
    approvedBy: 'Hon. Rey Ladaga, Municipal Mayor',
    createdAt: '2026-02-10T10:30:00.000Z'
  }
];

export const INITIAL_PASS_SLIPS: PassSlip[] = [
  {
    id: 'PS-2026-001',
    employeeId: 'EMP-2024-002',
    employeeNumber: 'SJ-2024-002',
    employeeName: 'Juan Dela Cruz',
    officeName: 'Municipal Planning and Development Office',
    position: 'Planning Officer II',
    date: '2026-02-11',
    slipType: 'Official Business (OB)',
    destination: 'Land Transportation Office (LTO) San Jose District Office',
    timeOut: '09:30 AM',
    expectedTimeIn: '11:45 AM',
    actualTimeIn: '11:30 AM',
    purpose: 'Verification of municipal motorpool vehicle registration records and public transport route franchising documents.',
    authorizingOfficer: 'EnP. Jerome Magan, MPDO Head',
    status: 'Approved',
    createdAt: '2026-02-11T09:15:00.000Z'
  },
  {
    id: 'PS-2026-002',
    employeeId: 'EMP-2024-005',
    employeeNumber: 'SJ-2024-005',
    employeeName: 'Ms. Clarisse Ramos',
    officeName: 'Municipal Tourism, Culture and Development Office',
    position: 'Tourism Operations Officer I',
    date: '2026-02-11',
    slipType: 'Official Business (OB)',
    destination: 'Aroma Beach Eco-Park and Resort Stakeholders Site',
    timeOut: '01:30 PM',
    expectedTimeIn: '04:30 PM',
    actualTimeIn: undefined,
    purpose: 'On-site tourism facility accreditation inspection and cultural mapping validation.',
    authorizingOfficer: 'Hon. Rey Ladaga, Municipal Mayor',
    status: 'Approved',
    createdAt: '2026-02-11T13:00:00.000Z'
  },
  {
    id: 'PS-2026-003',
    employeeId: 'EMP-2024-006',
    employeeNumber: 'SJ-2024-006',
    employeeName: 'Grace Balmes',
    officeName: 'Human Resource Office',
    position: 'Administrative Officer IV (HRMO II)',
    date: '2026-02-12',
    slipType: 'Personal Undertaking',
    destination: 'Land Bank of the Philippines - San Jose Branch',
    timeOut: '10:00 AM',
    expectedTimeIn: '11:00 AM',
    actualTimeIn: undefined,
    purpose: 'Personal banking transaction and ATM card renewal during official grace break.',
    authorizingOfficer: 'Atty. Maria Elena Castillo, MHRMO Head',
    status: 'Pending',
    createdAt: '2026-02-11T16:00:00.000Z'
  }
];

export const INITIAL_TRAININGS: TrainingRecord[] = [
  {
    id: 'TR-2026-001',
    title: 'PRIME-HRM Level III Systems and Evidence-Based Assessment Workshop',
    category: 'Leadership & Management',
    provider: 'Civil Service Commission (CSC) Regional Office IV-B',
    venue: 'Municipal Session Hall, San Jose Municipal Capitol',
    startDate: '2026-02-25',
    endDate: '2026-02-27',
    numberOfHours: 24,
    targetParticipants: ['Permanent', 'Temporary'],
    enrolledEmployeeIds: ['EMP-2024-001', 'EMP-2024-002', 'EMP-2024-006'],
    enrolledEmployeesCount: 18,
    budgetAllocated: 45000,
    status: 'Scheduled',
    createdAt: '2026-01-15T08:00:00.000Z'
  },
  {
    id: 'TR-2026-002',
    title: 'Disaster Risk Reduction and Basic Life Support / First Aid Responder Course',
    category: 'Disaster Preparedness & Safety',
    provider: 'Municipal Disaster Risk Reduction & Management Office (MDRRMO)',
    venue: 'San Jose Municipal Gymnasium',
    startDate: '2026-03-05',
    endDate: '2026-03-06',
    numberOfHours: 16,
    targetParticipants: ['Permanent', 'Temporary', 'Casual', 'Job Order', 'Contract of Service'],
    enrolledEmployeeIds: ['EMP-2024-002', 'EMP-2024-004', 'EMP-2024-007'],
    enrolledEmployeesCount: 40,
    budgetAllocated: 28000,
    status: 'Scheduled',
    createdAt: '2026-01-20T08:00:00.000Z'
  },
  {
    id: 'TR-2026-003',
    title: 'Public Sector Ethics, Accountability and RA 6713 Code of Conduct Orientation',
    category: 'Values & CSC Ethics',
    provider: 'LGU San Jose MHRMO & CSC Field Office Occidental Mindoro',
    venue: 'Municipal Cultural Center Auditorium',
    startDate: '2026-01-10',
    endDate: '2026-01-11',
    numberOfHours: 16,
    targetParticipants: ['Permanent', 'Casual', 'Job Order'],
    enrolledEmployeeIds: ['EMP-2024-001', 'EMP-2024-002', 'EMP-2024-003', 'EMP-2024-004', 'EMP-2024-005'],
    enrolledEmployeesCount: 65,
    budgetAllocated: 20000,
    status: 'Completed',
    createdAt: '2025-12-15T08:00:00.000Z'
  }
];

export const INITIAL_PERFORMANCE_RATINGS: PerformanceRating[] = [
  {
    id: 'IPCR-2025-02-EMP001',
    employeeId: 'EMP-2024-001',
    employeeNumber: 'SJ-2024-001',
    employeeName: 'Atty. Maria Elena Castillo',
    officeName: 'Human Resource Office',
    position: 'Municipal Government Department Head I (MHRMO)',
    classification: 'Permanent',
    ratingPeriod: 'July - December 2025 (2nd Semester)',
    periodYear: 2025,
    periodSemester: '2nd Semester',
    numericalRating: 4.88,
    adjectivalRating: 'Outstanding',
    coreFunctionsRating: 4.90,
    supportFunctionsRating: 4.80,
    spmsStatus: 'Approved & Official',
    evaluatedBy: 'Hon. Rey Ladaga, Municipal Mayor',
    approvedBy: 'Performance Management Team (PMT)',
    evaluatedAt: '2026-01-08T10:00:00.000Z',
    remarks: 'Exemplary leadership in leading 100% digitalization of 201 records and achieving Level II PRIME-HRM maturity.'
  },
  {
    id: 'IPCR-2025-02-EMP002',
    employeeId: 'EMP-2024-002',
    employeeNumber: 'SJ-2024-002',
    employeeName: 'Juan Dela Cruz',
    officeName: 'Municipal Planning and Development Office',
    position: 'Planning Officer II',
    classification: 'Permanent',
    ratingPeriod: 'July - December 2025 (2nd Semester)',
    periodYear: 2025,
    periodSemester: '2nd Semester',
    numericalRating: 4.62,
    adjectivalRating: 'Outstanding',
    coreFunctionsRating: 4.65,
    supportFunctionsRating: 4.55,
    spmsStatus: 'Approved & Official',
    evaluatedBy: 'EnP. Jerome Magan, MPDO Head',
    approvedBy: 'Performance Management Team (PMT)',
    evaluatedAt: '2026-01-09T14:30:00.000Z',
    remarks: 'Consistent delivery of Annual Investment Program (AIP) outputs and Comprehensive Development Plan (CDP) monitoring.'
  },
  {
    id: 'IPCR-2025-02-EMP003',
    employeeId: 'EMP-2024-003',
    employeeNumber: 'SJ-2024-003',
    employeeName: 'Dr. Jaime Soriano',
    officeName: 'Municipal Health Office',
    position: 'Municipal Health Officer',
    classification: 'Permanent',
    ratingPeriod: 'July - December 2025 (2nd Semester)',
    periodYear: 2025,
    periodSemester: '2nd Semester',
    numericalRating: 4.75,
    adjectivalRating: 'Outstanding',
    coreFunctionsRating: 4.80,
    supportFunctionsRating: 4.60,
    spmsStatus: 'Approved & Official',
    evaluatedBy: 'Hon. Rey Ladaga, Municipal Mayor',
    approvedBy: 'Performance Management Team (PMT)',
    evaluatedAt: '2026-01-10T11:00:00.000Z',
    remarks: 'Outstanding management of universal healthcare accreditation and Barangay Health Station supervision.'
  }
];

export const INITIAL_OVERTIME: OvertimeRecord[] = [
  {
    id: 'OT-2026-001',
    employeeId: 'EMP-2024-002',
    employeeNumber: 'SJ-2024-002',
    employeeName: 'Juan Dela Cruz',
    officeName: 'Municipal Planning and Development Office',
    date: '2026-02-07',
    startTime: '05:00 PM',
    endTime: '09:00 PM',
    hoursRendered: 4.0,
    purpose: 'Urgent finalization and consolidation of the LGU San Jose 2026 Annual Investment Program (AIP) for Sangguniang Bayan review.',
    compensationType: 'Overtime Pay',
    rateMultiplier: 1.25,
    status: 'Approved',
    approvedBy: 'EnP. Jerome Magan, MPDO Head',
    createdAt: '2026-02-08T08:00:00.000Z'
  },
  {
    id: 'OT-2026-002',
    employeeId: 'EMP-2024-006',
    employeeNumber: 'SJ-2024-006',
    employeeName: 'Grace Balmes',
    officeName: 'Human Resource Office',
    date: '2026-02-08',
    startTime: '08:00 AM',
    endTime: '05:00 PM',
    hoursRendered: 8.0,
    purpose: 'Saturday Special Payroll Processing and GSIS / PhilHealth monthly remittance reconciliation.',
    compensationType: 'Compensatory Time-Off (CTO)',
    rateMultiplier: 1.50,
    status: 'Approved',
    approvedBy: 'Atty. Maria Elena Castillo, MHRMO Head',
    createdAt: '2026-02-09T08:00:00.000Z'
  }
];

export const INITIAL_BROADCASTS: SystemBroadcast[] = [
  {
    id: 'BC-2026-001',
    title: 'Submission of 2025 Statement of Assets, Liabilities and Net Worth (SALN)',
    message: 'All Permanent, Temporary, Casual personnel and Elective Officials are reminded to submit their notarized SALN as of December 31, 2025 on or before April 30, 2026 pursuant to RA 6713. Upload via the 201 File portal or submit hard copies to MHRMO.',
    targetAudience: 'All Employees',
    priority: 'CSC Memorandum',
    issuedBy: 'Atty. Maria Elena Castillo, MHRMO Head',
    expiresAt: '2026-04-30',
    createdAt: '2026-02-01T08:00:00.000Z',
    readCount: 142
  },
  {
    id: 'BC-2026-002',
    title: 'Flag Raising Ceremony and Biometrics Schedule Alignment',
    message: 'Pursuant to Executive Order No. 04-2026, Monday Convocation and Flag Raising Ceremony commences promptly at 7:45 AM at the Municipal Hall Grounds. Please ensure morning biometrics are logged prior to assembly.',
    targetAudience: 'All Employees',
    priority: 'Normal',
    issuedBy: 'Office of the Municipal Mayor',
    createdAt: '2026-02-05T08:00:00.000Z',
    readCount: 189
  },
  {
    id: 'BC-2026-003',
    title: 'Civil Service Examination Applications - March 2026 Pen-and-Paper Test',
    message: 'CSC Occidental Mindoro Field Office is now accepting applications for the Career Service Examination (Professional and Sub-Professional levels). Job Order and Casual employees desiring to attain eligibility are encouraged to coordinate with MHRMO for advisory.',
    targetAudience: 'Casual & Job Order',
    priority: 'Normal',
    issuedBy: 'MHRMO Training Division',
    createdAt: '2026-02-08T09:00:00.000Z',
    readCount: 68
  }
];

export const INITIAL_ACCOUNTS: UserAccount[] = [
  {
    uid: 'user-001',
    username: 'admin',
    email: 'admin@sanjose.gov.ph',
    displayName: 'Atty. Maria Elena Castillo (MHRMO Head)',
    role: 'hr_admin',
    employeeId: 'EMP-2024-001',
    permissions: [
      'view_employees', 'add_employees', 'edit_employees',
      'upload_documents', 'scan_documents', 'verify_documents',
      'request_documents', 'process_leave', 'process_wellness',
      'generate_reports', 'manage_offices'
    ],
    isActive: true,
    lastLogin: '2026-02-12 08:14 AM',
    createdAt: '2024-01-01'
  },
  {
    uid: 'user-002',
    username: 'hrstaff',
    email: 'hrstaff@sanjose.gov.ph',
    displayName: 'Grace Balmes (HR Specialist)',
    role: 'hr_staff',
    employeeId: 'EMP-2024-006',
    permissions: [
      'view_employees', 'upload_documents', 'scan_documents',
      'verify_documents', 'request_documents', 'process_leave',
      'process_wellness', 'generate_reports'
    ],
    isActive: true,
    lastLogin: '2026-02-12 08:02 AM',
    createdAt: '2024-01-15'
  },
  {
    uid: 'user-003',
    username: 'payroll',
    email: 'payroll@sanjose.gov.ph',
    displayName: 'Leonardo Fernandez, CPA (Payroll & Disbursing)',
    role: 'payroll',
    employeeId: 'EMP-2024-008',
    permissions: [
      'view_employees', 'generate_reports'
    ],
    isActive: true,
    lastLogin: '2026-02-11 04:30 PM',
    createdAt: '2024-02-01'
  },
  {
    uid: 'user-004',
    username: 'emp.juandelacruz',
    email: 'juandelacruz@sanjose.gov.ph',
    displayName: 'Juan Dela Cruz (Planning Officer II)',
    role: 'employee',
    employeeId: 'EMP-2024-002',
    permissions: [],
    isActive: true,
    lastLogin: '2026-02-12 08:35 AM',
    createdAt: '2024-03-01'
  }
];
