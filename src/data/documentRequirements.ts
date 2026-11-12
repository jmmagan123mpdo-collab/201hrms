import { EmploymentClassification, DocumentPrivacy } from '../types/index.ts';

export type RequirementLevel = 'REQUIRED' | 'CONDITIONAL' | 'OPTIONAL' | 'NOT_APPLICABLE';
export type SubmitterType = 'EMPLOYEE' | 'HR' | 'EXTERNAL';

export interface DocumentDefinition {
  code: string;
  name: string;
  categoryId: string;
  categoryName: string;
  description: string;
  submitter: SubmitterType;
  privacy: DocumentPrivacy;
  canEmployeeUpload: boolean;
  requiresVerification: boolean;
  applicableClassifications: EmploymentClassification[];
  // Default requirement level per classification
  requirementsByClassification: Record<EmploymentClassification, RequirementLevel>;
  conditionalNotes?: Partial<Record<EmploymentClassification, string>>;
}

export interface DocumentCategoryDefinition {
  id: string;
  code: string;
  name: string;
  description: string;
  iconName: string;
  isRestrictedCategory?: boolean;
}

export const MASTER_CATEGORIES: DocumentCategoryDefinition[] = [
  {
    id: 'cat-01',
    code: 'PERSONAL',
    name: '1. Personal Information',
    description: 'Personal data sheets, civil registry certificates, and identity records',
    iconName: 'User'
  },
  {
    id: 'cat-02',
    code: 'EDUCATION',
    name: '2. Educational Background',
    description: 'Diplomas, transcripts of records, and academic certifications',
    iconName: 'GraduationCap'
  },
  {
    id: 'cat-03',
    code: 'ELIGIBILITY',
    name: '3. Eligibility and Professional Licenses',
    description: 'Civil Service eligibilities, PRC licenses, and board certificates',
    iconName: 'Award'
  },
  {
    id: 'cat-04',
    code: 'MEDICAL',
    name: '4. Pre-Employment and Medical Requirements',
    description: 'CS Form 211 medical certificates, clearances, and drug test results (Strictly Restricted)',
    iconName: 'HeartPulse',
    isRestrictedCategory: true
  },
  {
    id: 'cat-05',
    code: 'GOV_IDS',
    name: '5. Government IDs and Membership',
    description: 'TIN, GSIS, PhilHealth, Pag-IBIG registration and payroll bank details',
    iconName: 'CreditCard'
  },
  {
    id: 'cat-06',
    code: 'SALN',
    name: '6. SALN Documents',
    description: 'Sworn Statement of Assets, Liabilities and Net Worth records',
    iconName: 'ShieldAlert'
  },
  {
    id: 'cat-07',
    code: 'APPOINTMENT',
    name: '7. Appointment and Oath Documents',
    description: 'CSC Form 33 appointments, assumption of duty, oaths, and notices',
    iconName: 'FileCheck'
  },
  {
    id: 'cat-08',
    code: 'SERVICE_LEAVE',
    name: '8. Service Records and Leave Cards',
    description: 'Service records, leave credit cards, monetization, and Form 6 records',
    iconName: 'History'
  },
  {
    id: 'cat-09',
    code: 'PERFORMANCE',
    name: '9. Performance Evaluation',
    description: 'Individual Performance Commitment and Review (IPCR/DPCR/OPCR)',
    iconName: 'TrendingUp'
  },
  {
    id: 'cat-10',
    code: 'TRAINING',
    name: '10. Training and Development',
    description: 'Certificates of training, seminars, and learning interventions',
    iconName: 'BookOpen'
  },
  {
    id: 'cat-11',
    code: 'COMMENDATIONS_DISCIPLINARY',
    name: '11. Commendations and Disciplinary Records',
    description: 'PRAISE awards, commendations, and confidential disciplinary records',
    iconName: 'Scale',
    isRestrictedCategory: true
  },
  {
    id: 'cat-12',
    code: 'CLEARANCES',
    name: '12. Clearance Documents',
    description: 'CSC Form 7, office clearances, and property/money clearances',
    iconName: 'ShieldCheck'
  },
  {
    id: 'cat-13',
    code: 'SEPARATION',
    name: '13. Separation and Retirement Documents',
    description: 'Resignation, retirement claims, survivorship, and exit clearances',
    iconName: 'UserMinus'
  },
  {
    id: 'cat-14',
    code: 'CONTRACTS_TOR',
    name: '14. Contracts and Terms of Reference',
    description: 'Job Order contracts, COS agreements, TORs, and accomplishment reports',
    iconName: 'FileText'
  },
  {
    id: 'cat-15',
    code: 'OTHER_CSC_HR',
    name: '15. Other CSC and HR Documents',
    description: 'Special orders, memoranda, travel orders, and pass slips',
    iconName: 'FolderPlus'
  }
];

export const MASTER_DOCUMENTS: DocumentDefinition[] = [
  // 1. PERSONAL INFORMATION
  {
    code: 'PDS_CS_212',
    name: 'Personal Data Sheet (PDS / CS Form 212 Revised 2017)',
    categoryId: 'cat-01',
    categoryName: '1. Personal Information',
    description: 'CSC Form 212 with passport photograph and official notarization.',
    submitter: 'EMPLOYEE',
    privacy: 'employee_accessible',
    canEmployeeUpload: true,
    requiresVerification: true,
    applicableClassifications: ['Permanent', 'Temporary', 'Casual', 'Job Order', 'Contract of Service', 'Elective Officials'],
    requirementsByClassification: {
      'Permanent': 'REQUIRED',
      'Temporary': 'REQUIRED',
      'Casual': 'REQUIRED',
      'Job Order': 'REQUIRED',
      'Contract of Service': 'REQUIRED',
      'Elective Officials': 'REQUIRED'
    }
  },
  {
    code: 'WORK_EXP_SHEET',
    name: 'Work Experience Sheet (Attachment to CS Form 212)',
    categoryId: 'cat-01',
    categoryName: '1. Personal Information',
    description: 'Detailed work experience records accompanying CS Form 212.',
    submitter: 'EMPLOYEE',
    privacy: 'employee_accessible',
    canEmployeeUpload: true,
    requiresVerification: true,
    applicableClassifications: ['Permanent', 'Temporary', 'Casual', 'Contract of Service'],
    requirementsByClassification: {
      'Permanent': 'REQUIRED',
      'Temporary': 'REQUIRED',
      'Casual': 'REQUIRED',
      'Job Order': 'OPTIONAL',
      'Contract of Service': 'REQUIRED',
      'Elective Officials': 'OPTIONAL'
    }
  },
  {
    code: 'RECENT_ID_PHOTO',
    name: 'Recent ID Photograph (Passport Size / White Background)',
    categoryId: 'cat-01',
    categoryName: '1. Personal Information',
    description: 'Standard passport-size photo taken within last 6 months.',
    submitter: 'EMPLOYEE',
    privacy: 'employee_accessible',
    canEmployeeUpload: true,
    requiresVerification: true,
    applicableClassifications: ['Permanent', 'Temporary', 'Casual', 'Job Order', 'Contract of Service', 'Elective Officials'],
    requirementsByClassification: {
      'Permanent': 'REQUIRED',
      'Temporary': 'REQUIRED',
      'Casual': 'REQUIRED',
      'Job Order': 'REQUIRED',
      'Contract of Service': 'REQUIRED',
      'Elective Officials': 'REQUIRED'
    }
  },
  {
    code: 'PSA_BIRTH_CERT',
    name: 'PSA Authenticated Birth Certificate',
    categoryId: 'cat-01',
    categoryName: '1. Personal Information',
    description: 'Official birth certificate issued by Philippine Statistics Authority (PSA).',
    submitter: 'EMPLOYEE',
    privacy: 'employee_accessible',
    canEmployeeUpload: true,
    requiresVerification: true,
    applicableClassifications: ['Permanent', 'Temporary', 'Casual', 'Job Order', 'Contract of Service', 'Elective Officials'],
    requirementsByClassification: {
      'Permanent': 'REQUIRED',
      'Temporary': 'REQUIRED',
      'Casual': 'REQUIRED',
      'Job Order': 'REQUIRED',
      'Contract of Service': 'OPTIONAL',
      'Elective Officials': 'REQUIRED'
    }
  },
  {
    code: 'PSA_MARRIAGE_CERT',
    name: 'PSA Marriage Certificate (if married)',
    categoryId: 'cat-01',
    categoryName: '1. Personal Information',
    description: 'PSA certified copy required if marital status is married.',
    submitter: 'EMPLOYEE',
    privacy: 'employee_accessible',
    canEmployeeUpload: true,
    requiresVerification: true,
    applicableClassifications: ['Permanent', 'Temporary', 'Casual', 'Elective Officials'],
    requirementsByClassification: {
      'Permanent': 'CONDITIONAL',
      'Temporary': 'CONDITIONAL',
      'Casual': 'CONDITIONAL',
      'Job Order': 'CONDITIONAL',
      'Contract of Service': 'OPTIONAL',
      'Elective Officials': 'CONDITIONAL'
    },
    conditionalNotes: {
      'Permanent': 'Required for married personnel and for claiming spouse dependents.',
      'Temporary': 'Required for married personnel.',
      'Casual': 'Required for married personnel.'
    }
  },
  {
    code: 'PSA_CHILDREN_BIRTH',
    name: 'Birth Certificates of Children (if applicable)',
    categoryId: 'cat-01',
    categoryName: '1. Personal Information',
    description: 'PSA birth certificates for registered dependent children.',
    submitter: 'EMPLOYEE',
    privacy: 'employee_accessible',
    canEmployeeUpload: true,
    requiresVerification: true,
    applicableClassifications: ['Permanent', 'Temporary', 'Casual', 'Job Order', 'Contract of Service'],
    requirementsByClassification: {
      'Permanent': 'CONDITIONAL',
      'Temporary': 'CONDITIONAL',
      'Casual': 'CONDITIONAL',
      'Job Order': 'OPTIONAL',
      'Contract of Service': 'OPTIONAL',
      'Elective Officials': 'OPTIONAL'
    },
    conditionalNotes: {
      'Permanent': 'Required if declaring dependents for PhilHealth/tax purposes.'
    }
  },
  {
    code: 'GOV_ISSUED_ID',
    name: 'Valid Government-Issued ID with Signature',
    categoryId: 'cat-01',
    categoryName: '1. Personal Information',
    description: 'Passport, Driver\'s License, UMID, Postal ID, or PhilID.',
    submitter: 'EMPLOYEE',
    privacy: 'employee_accessible',
    canEmployeeUpload: true,
    requiresVerification: true,
    applicableClassifications: ['Permanent', 'Temporary', 'Casual', 'Job Order', 'Contract of Service', 'Elective Officials'],
    requirementsByClassification: {
      'Permanent': 'REQUIRED',
      'Temporary': 'REQUIRED',
      'Casual': 'REQUIRED',
      'Job Order': 'REQUIRED',
      'Contract of Service': 'REQUIRED',
      'Elective Officials': 'REQUIRED'
    }
  },
  {
    code: 'CONTACT_INFO_SHEET',
    name: 'Updated Contact Information & Residence Sheet',
    categoryId: 'cat-01',
    categoryName: '1. Personal Information',
    description: 'Contact phone, personal email, and verified residential address.',
    submitter: 'EMPLOYEE',
    privacy: 'employee_accessible',
    canEmployeeUpload: true,
    requiresVerification: true,
    applicableClassifications: ['Permanent', 'Temporary', 'Casual', 'Job Order', 'Contract of Service', 'Elective Officials'],
    requirementsByClassification: {
      'Permanent': 'REQUIRED',
      'Temporary': 'REQUIRED',
      'Casual': 'REQUIRED',
      'Job Order': 'REQUIRED',
      'Contract of Service': 'REQUIRED',
      'Elective Officials': 'REQUIRED'
    }
  },
  {
    code: 'EMERGENCY_CONTACT_INFO',
    name: 'Emergency Contact Information Record',
    categoryId: 'cat-01',
    categoryName: '1. Personal Information',
    description: 'Designated primary emergency contacts and relationship records.',
    submitter: 'EMPLOYEE',
    privacy: 'employee_accessible',
    canEmployeeUpload: true,
    requiresVerification: true,
    applicableClassifications: ['Permanent', 'Temporary', 'Casual', 'Job Order', 'Contract of Service', 'Elective Officials'],
    requirementsByClassification: {
      'Permanent': 'REQUIRED',
      'Temporary': 'REQUIRED',
      'Casual': 'REQUIRED',
      'Job Order': 'REQUIRED',
      'Contract of Service': 'REQUIRED',
      'Elective Officials': 'REQUIRED'
    }
  },

  // 2. EDUCATIONAL BACKGROUND
  {
    code: 'COLLEGE_DIPLOMA',
    name: 'College Diploma / Tertiary Degree Certificate',
    categoryId: 'cat-02',
    categoryName: '2. Educational Background',
    description: 'Official diploma from CHED-recognized higher education institution.',
    submitter: 'EMPLOYEE',
    privacy: 'employee_accessible',
    canEmployeeUpload: true,
    requiresVerification: true,
    applicableClassifications: ['Permanent', 'Temporary', 'Casual', 'Contract of Service'],
    requirementsByClassification: {
      'Permanent': 'REQUIRED',
      'Temporary': 'REQUIRED',
      'Casual': 'CONDITIONAL',
      'Job Order': 'OPTIONAL',
      'Contract of Service': 'CONDITIONAL',
      'Elective Officials': 'OPTIONAL'
    },
    conditionalNotes: {
      'Casual': 'Required if appointment requires college degree under QS.',
      'Contract of Service': 'Required for technical/professional consultancy positions.'
    }
  },
  {
    code: 'TRANSCRIPT_OF_RECORDS',
    name: 'Official Transcript of Records (TOR)',
    categoryId: 'cat-02',
    categoryName: '2. Educational Background',
    description: 'Authenticated TOR with dry seal and university registrar signature.',
    submitter: 'EMPLOYEE',
    privacy: 'employee_accessible',
    canEmployeeUpload: true,
    requiresVerification: true,
    applicableClassifications: ['Permanent', 'Temporary', 'Casual', 'Contract of Service'],
    requirementsByClassification: {
      'Permanent': 'REQUIRED',
      'Temporary': 'REQUIRED',
      'Casual': 'CONDITIONAL',
      'Job Order': 'OPTIONAL',
      'Contract of Service': 'CONDITIONAL',
      'Elective Officials': 'OPTIONAL'
    }
  },
  {
    code: 'HIGH_SCHOOL_DIPLOMA',
    name: 'High School / Senior High School Diploma',
    categoryId: 'cat-02',
    categoryName: '2. Educational Background',
    description: 'Applicable for non-collegiate or technical support positions.',
    submitter: 'EMPLOYEE',
    privacy: 'employee_accessible',
    canEmployeeUpload: true,
    requiresVerification: true,
    applicableClassifications: ['Permanent', 'Temporary', 'Casual', 'Job Order'],
    requirementsByClassification: {
      'Permanent': 'CONDITIONAL',
      'Temporary': 'CONDITIONAL',
      'Casual': 'REQUIRED',
      'Job Order': 'REQUIRED',
      'Contract of Service': 'OPTIONAL',
      'Elective Officials': 'OPTIONAL'
    }
  },
  {
    code: 'POST_GRAD_DIPLOMA',
    name: 'Master\'s / Doctoral Degree Diploma and TOR',
    categoryId: 'cat-02',
    categoryName: '2. Educational Background',
    description: 'Post-graduate degree credentials for executive or division head ranks.',
    submitter: 'EMPLOYEE',
    privacy: 'employee_accessible',
    canEmployeeUpload: true,
    requiresVerification: true,
    applicableClassifications: ['Permanent', 'Contract of Service'],
    requirementsByClassification: {
      'Permanent': 'CONDITIONAL',
      'Temporary': 'OPTIONAL',
      'Casual': 'OPTIONAL',
      'Job Order': 'NOT_APPLICABLE',
      'Contract of Service': 'CONDITIONAL',
      'Elective Officials': 'OPTIONAL'
    },
    conditionalNotes: {
      'Permanent': 'Required for SG 24 and above or Department Head positions per CSC QS.'
    }
  },
  {
    code: 'VOCATIONAL_CERT',
    name: 'Vocational or Technical Certificate (TESDA / NC II/III)',
    categoryId: 'cat-02',
    categoryName: '2. Educational Background',
    description: 'National Certificate from TESDA for specialized skilled roles.',
    submitter: 'EMPLOYEE',
    privacy: 'employee_accessible',
    canEmployeeUpload: true,
    requiresVerification: true,
    applicableClassifications: ['Permanent', 'Temporary', 'Casual', 'Job Order'],
    requirementsByClassification: {
      'Permanent': 'CONDITIONAL',
      'Temporary': 'CONDITIONAL',
      'Casual': 'CONDITIONAL',
      'Job Order': 'CONDITIONAL',
      'Contract of Service': 'OPTIONAL',
      'Elective Officials': 'OPTIONAL'
    }
  },

  // 3. ELIGIBILITY AND PROFESSIONAL LICENSES
  {
    code: 'CSC_ELIGIBILITY_CERT',
    name: 'Civil Service Eligibility Certificate (Professional / Sub-Professional)',
    categoryId: 'cat-03',
    categoryName: '3. Eligibility and Professional Licenses',
    description: 'Authenticated CSC Certificate of Eligibility or Board Rating.',
    submitter: 'EMPLOYEE',
    privacy: 'employee_accessible',
    canEmployeeUpload: true,
    requiresVerification: true,
    applicableClassifications: ['Permanent', 'Temporary'],
    requirementsByClassification: {
      'Permanent': 'REQUIRED',
      'Temporary': 'CONDITIONAL',
      'Casual': 'OPTIONAL',
      'Job Order': 'NOT_APPLICABLE',
      'Contract of Service': 'OPTIONAL',
      'Elective Officials': 'NOT_APPLICABLE'
    },
    conditionalNotes: {
      'Permanent': 'Mandatory qualification standard for all career permanent positions.',
      'Temporary': 'Required within temporary appointment grace period if applicable.'
    }
  },
  {
    code: 'PRC_LICENSE',
    name: 'PRC Professional License & Board Certificate',
    categoryId: 'cat-03',
    categoryName: '3. Eligibility and Professional Licenses',
    description: 'Valid PRC ID card and Board Rating for RA 1080 professions.',
    submitter: 'EMPLOYEE',
    privacy: 'employee_accessible',
    canEmployeeUpload: true,
    requiresVerification: true,
    applicableClassifications: ['Permanent', 'Temporary', 'Casual', 'Contract of Service'],
    requirementsByClassification: {
      'Permanent': 'CONDITIONAL',
      'Temporary': 'CONDITIONAL',
      'Casual': 'CONDITIONAL',
      'Job Order': 'OPTIONAL',
      'Contract of Service': 'CONDITIONAL',
      'Elective Officials': 'OPTIONAL'
    },
    conditionalNotes: {
      'Permanent': 'Mandatory for engineers, doctors, nurses, accountants, lawyers, etc.',
      'Contract of Service': 'Required if contracted as licensed technical consultant.'
    }
  },
  {
    code: 'DRIVERS_LICENSE',
    name: 'LTO Driver\'s License (Professional / Non-Professional)',
    categoryId: 'cat-03',
    categoryName: '3. Eligibility and Professional Licenses',
    description: 'Required for motor pool drivers, heavy equipment operators, and field inspectors.',
    submitter: 'EMPLOYEE',
    privacy: 'employee_accessible',
    canEmployeeUpload: true,
    requiresVerification: true,
    applicableClassifications: ['Permanent', 'Casual', 'Job Order'],
    requirementsByClassification: {
      'Permanent': 'CONDITIONAL',
      'Temporary': 'CONDITIONAL',
      'Casual': 'CONDITIONAL',
      'Job Order': 'CONDITIONAL',
      'Contract of Service': 'OPTIONAL',
      'Elective Officials': 'OPTIONAL'
    }
  },

  // 4. PRE-EMPLOYMENT AND MEDICAL REQUIREMENTS
  {
    code: 'MED_CERT_CS_211',
    name: 'Medical Certificate (CS Form 211 / Medical Fitness)',
    categoryId: 'cat-04',
    categoryName: '4. Pre-Employment and Medical Requirements',
    description: 'Examined and certified by the San Jose Municipal Health Officer.',
    submitter: 'EMPLOYEE',
    privacy: 'hr_restricted',
    canEmployeeUpload: true,
    requiresVerification: true,
    applicableClassifications: ['Permanent', 'Temporary', 'Casual', 'Job Order', 'Contract of Service'],
    requirementsByClassification: {
      'Permanent': 'REQUIRED',
      'Temporary': 'REQUIRED',
      'Casual': 'REQUIRED',
      'Job Order': 'REQUIRED',
      'Contract of Service': 'CONDITIONAL',
      'Elective Officials': 'OPTIONAL'
    }
  },
  {
    code: 'DRUG_TEST_RESULT',
    name: 'Official Drug Test Result (DOH-Accredited Testing Facility)',
    categoryId: 'cat-04',
    categoryName: '4. Pre-Employment and Medical Requirements',
    description: 'Mandatory drug test result pursuant to CSC drug-free workplace policies.',
    submitter: 'EMPLOYEE',
    privacy: 'hr_restricted',
    canEmployeeUpload: true,
    requiresVerification: true,
    applicableClassifications: ['Permanent', 'Temporary', 'Casual', 'Job Order', 'Contract of Service'],
    requirementsByClassification: {
      'Permanent': 'REQUIRED',
      'Temporary': 'REQUIRED',
      'Casual': 'REQUIRED',
      'Job Order': 'REQUIRED',
      'Contract of Service': 'REQUIRED',
      'Elective Officials': 'OPTIONAL'
    }
  },
  {
    code: 'NEURO_PSYCH_EXAM',
    name: 'Neuro-Psychiatric Examination Result',
    categoryId: 'cat-04',
    categoryName: '4. Pre-Employment and Medical Requirements',
    description: 'Highly sensitive psychological/neuro-psychiatric evaluation report.',
    submitter: 'EXTERNAL',
    privacy: 'highly_confidential',
    canEmployeeUpload: false,
    requiresVerification: true,
    applicableClassifications: ['Permanent'],
    requirementsByClassification: {
      'Permanent': 'REQUIRED',
      'Temporary': 'CONDITIONAL',
      'Casual': 'OPTIONAL',
      'Job Order': 'NOT_APPLICABLE',
      'Contract of Service': 'NOT_APPLICABLE',
      'Elective Officials': 'NOT_APPLICABLE'
    }
  },
  {
    code: 'NBI_CLEARANCE',
    name: 'NBI Clearance (Valid within 1 Year)',
    categoryId: 'cat-04',
    categoryName: '4. Pre-Employment and Medical Requirements',
    description: 'National Bureau of Investigation clearance for government employment.',
    submitter: 'EMPLOYEE',
    privacy: 'employee_accessible',
    canEmployeeUpload: true,
    requiresVerification: true,
    applicableClassifications: ['Permanent', 'Temporary', 'Casual', 'Job Order', 'Contract of Service'],
    requirementsByClassification: {
      'Permanent': 'REQUIRED',
      'Temporary': 'REQUIRED',
      'Casual': 'REQUIRED',
      'Job Order': 'REQUIRED',
      'Contract of Service': 'REQUIRED',
      'Elective Officials': 'OPTIONAL'
    }
  },
  {
    code: 'POLICE_CLEARANCE',
    name: 'Police Clearance (San Jose MPS / National Police)',
    categoryId: 'cat-04',
    categoryName: '4. Pre-Employment and Medical Requirements',
    description: 'Local municipal police clearance certifying no pending warrant.',
    submitter: 'EMPLOYEE',
    privacy: 'employee_accessible',
    canEmployeeUpload: true,
    requiresVerification: true,
    applicableClassifications: ['Permanent', 'Temporary', 'Casual', 'Job Order'],
    requirementsByClassification: {
      'Permanent': 'REQUIRED',
      'Temporary': 'REQUIRED',
      'Casual': 'REQUIRED',
      'Job Order': 'REQUIRED',
      'Contract of Service': 'OPTIONAL',
      'Elective Officials': 'OPTIONAL'
    }
  },

  // 5. GOVERNMENT IDENTIFICATION AND MEMBERSHIP INFORMATION
  {
    code: 'TIN_VERIFICATION',
    name: 'TIN Information & BIR Form 1902 / 2316',
    categoryId: 'cat-05',
    categoryName: '5. Government IDs and Membership',
    description: 'Bureau of Internal Revenue Taxpayer Identification Number verification.',
    submitter: 'EMPLOYEE',
    privacy: 'employee_accessible',
    canEmployeeUpload: true,
    requiresVerification: true,
    applicableClassifications: ['Permanent', 'Temporary', 'Casual', 'Job Order', 'Contract of Service', 'Elective Officials'],
    requirementsByClassification: {
      'Permanent': 'REQUIRED',
      'Temporary': 'REQUIRED',
      'Casual': 'REQUIRED',
      'Job Order': 'REQUIRED',
      'Contract of Service': 'REQUIRED',
      'Elective Officials': 'REQUIRED'
    }
  },
  {
    code: 'GSIS_MEMBERSHIP',
    name: 'GSIS Business Partner Number (BP#) & Membership Form',
    categoryId: 'cat-05',
    categoryName: '5. Government IDs and Membership',
    description: 'Official GSIS BP Number and eCard / UMID enrollment.',
    submitter: 'EMPLOYEE',
    privacy: 'employee_accessible',
    canEmployeeUpload: true,
    requiresVerification: true,
    applicableClassifications: ['Permanent', 'Temporary', 'Casual', 'Elective Officials'],
    requirementsByClassification: {
      'Permanent': 'REQUIRED',
      'Temporary': 'REQUIRED',
      'Casual': 'REQUIRED',
      'Job Order': 'NOT_APPLICABLE',
      'Contract of Service': 'NOT_APPLICABLE',
      'Elective Officials': 'REQUIRED'
    }
  },
  {
    code: 'PHILHEALTH_MDR',
    name: 'PhilHealth Member Data Record (MDR)',
    categoryId: 'cat-05',
    categoryName: '5. Government IDs and Membership',
    description: 'PhilHealth PIN and updated MDR with dependent list.',
    submitter: 'EMPLOYEE',
    privacy: 'employee_accessible',
    canEmployeeUpload: true,
    requiresVerification: true,
    applicableClassifications: ['Permanent', 'Temporary', 'Casual', 'Job Order', 'Contract of Service', 'Elective Officials'],
    requirementsByClassification: {
      'Permanent': 'REQUIRED',
      'Temporary': 'REQUIRED',
      'Casual': 'REQUIRED',
      'Job Order': 'REQUIRED',
      'Contract of Service': 'REQUIRED',
      'Elective Officials': 'REQUIRED'
    }
  },
  {
    code: 'PAGIBIG_MID',
    name: 'Pag-IBIG Member\'s Identification (MID) / MDF',
    categoryId: 'cat-05',
    categoryName: '5. Government IDs and Membership',
    description: 'Pag-IBIG Fund MID number registration slip.',
    submitter: 'EMPLOYEE',
    privacy: 'employee_accessible',
    canEmployeeUpload: true,
    requiresVerification: true,
    applicableClassifications: ['Permanent', 'Temporary', 'Casual', 'Job Order', 'Contract of Service', 'Elective Officials'],
    requirementsByClassification: {
      'Permanent': 'REQUIRED',
      'Temporary': 'REQUIRED',
      'Casual': 'REQUIRED',
      'Job Order': 'REQUIRED',
      'Contract of Service': 'REQUIRED',
      'Elective Officials': 'REQUIRED'
    }
  },
  {
    code: 'PAYROLL_BANK_INFO',
    name: 'Land Bank of the Philippines Payroll ATM Account Details',
    categoryId: 'cat-05',
    categoryName: '5. Government IDs and Membership',
    description: 'LBP San Jose Branch payroll deposit account number for direct crediting.',
    submitter: 'EMPLOYEE',
    privacy: 'employee_accessible',
    canEmployeeUpload: true,
    requiresVerification: true,
    applicableClassifications: ['Permanent', 'Temporary', 'Casual', 'Job Order', 'Contract of Service', 'Elective Officials'],
    requirementsByClassification: {
      'Permanent': 'REQUIRED',
      'Temporary': 'REQUIRED',
      'Casual': 'REQUIRED',
      'Job Order': 'REQUIRED',
      'Contract of Service': 'REQUIRED',
      'Elective Officials': 'REQUIRED'
    }
  },

  // 6. SALN DOCUMENTS
  {
    code: 'SALN_ANNUAL',
    name: 'Sworn Statement of Assets, Liabilities and Net Worth (Annual SALN)',
    categoryId: 'cat-06',
    categoryName: '6. SALN Documents',
    description: 'Annual SALN submission as of December 31 required by RA 6713.',
    submitter: 'EMPLOYEE',
    privacy: 'hr_restricted',
    canEmployeeUpload: true,
    requiresVerification: true,
    applicableClassifications: ['Permanent', 'Temporary', 'Casual', 'Elective Officials'],
    requirementsByClassification: {
      'Permanent': 'REQUIRED',
      'Temporary': 'REQUIRED',
      'Casual': 'REQUIRED',
      'Job Order': 'NOT_APPLICABLE',
      'Contract of Service': 'NOT_APPLICABLE',
      'Elective Officials': 'REQUIRED'
    }
  },
  {
    code: 'SALN_ENTRY',
    name: 'Entry SALN (Filed within 30 Days of Assumption)',
    categoryId: 'cat-06',
    categoryName: '6. SALN Documents',
    description: 'Sworn declaration filed upon first entry into public service.',
    submitter: 'EMPLOYEE',
    privacy: 'hr_restricted',
    canEmployeeUpload: true,
    requiresVerification: true,
    applicableClassifications: ['Permanent', 'Temporary', 'Casual', 'Elective Officials'],
    requirementsByClassification: {
      'Permanent': 'REQUIRED',
      'Temporary': 'REQUIRED',
      'Casual': 'REQUIRED',
      'Job Order': 'NOT_APPLICABLE',
      'Contract of Service': 'NOT_APPLICABLE',
      'Elective Officials': 'REQUIRED'
    }
  },

  // 7. APPOINTMENT AND OATH DOCUMENTS
  {
    code: 'CSC_FORM_33_APPOINTMENT',
    name: 'Appointment Paper (CSC Form 33 Revised 2018)',
    categoryId: 'cat-07',
    categoryName: '7. Appointment and Oath Documents',
    description: 'Official appointment signed by Mayor and attested by Civil Service Commission.',
    submitter: 'HR',
    privacy: 'employee_accessible',
    canEmployeeUpload: false,
    requiresVerification: true,
    applicableClassifications: ['Permanent', 'Temporary', 'Casual'],
    requirementsByClassification: {
      'Permanent': 'REQUIRED',
      'Temporary': 'REQUIRED',
      'Casual': 'REQUIRED',
      'Job Order': 'NOT_APPLICABLE',
      'Contract of Service': 'NOT_APPLICABLE',
      'Elective Officials': 'NOT_APPLICABLE'
    }
  },
  {
    code: 'OATH_OF_OFFICE',
    name: 'Panunumpa sa Katungkulan (Oath of Office)',
    categoryId: 'cat-07',
    categoryName: '7. Appointment and Oath Documents',
    description: 'Subscribed and sworn before the Municipal Mayor.',
    submitter: 'HR',
    privacy: 'employee_accessible',
    canEmployeeUpload: false,
    requiresVerification: true,
    applicableClassifications: ['Permanent', 'Temporary', 'Casual', 'Elective Officials'],
    requirementsByClassification: {
      'Permanent': 'REQUIRED',
      'Temporary': 'REQUIRED',
      'Casual': 'REQUIRED',
      'Job Order': 'NOT_APPLICABLE',
      'Contract of Service': 'NOT_APPLICABLE',
      'Elective Officials': 'REQUIRED'
    }
  },
  {
    code: 'ASSUMPTION_TO_DUTY',
    name: 'Certificate of Assumption to Duty',
    categoryId: 'cat-07',
    categoryName: '7. Appointment and Oath Documents',
    description: 'Official certification signed by Department Head indicating start of service.',
    submitter: 'HR',
    privacy: 'employee_accessible',
    canEmployeeUpload: false,
    requiresVerification: true,
    applicableClassifications: ['Permanent', 'Temporary', 'Casual'],
    requirementsByClassification: {
      'Permanent': 'REQUIRED',
      'Temporary': 'REQUIRED',
      'Casual': 'REQUIRED',
      'Job Order': 'OPTIONAL',
      'Contract of Service': 'OPTIONAL',
      'Elective Officials': 'REQUIRED'
    }
  },
  {
    code: 'POSITION_DESC_FORM',
    name: 'Position Description Form (DBM-CSC Form No. 1)',
    categoryId: 'cat-07',
    categoryName: '7. Appointment and Oath Documents',
    description: 'Detailed duties and responsibilities attached to the plantillia position.',
    submitter: 'HR',
    privacy: 'employee_accessible',
    canEmployeeUpload: false,
    requiresVerification: true,
    applicableClassifications: ['Permanent', 'Temporary', 'Casual'],
    requirementsByClassification: {
      'Permanent': 'REQUIRED',
      'Temporary': 'REQUIRED',
      'Casual': 'REQUIRED',
      'Job Order': 'NOT_APPLICABLE',
      'Contract of Service': 'NOT_APPLICABLE',
      'Elective Officials': 'NOT_APPLICABLE'
    }
  },
  {
    code: 'NOTICE_SALARY_ADJ',
    name: 'Notice of Salary Adjustment (NOSA) / Step Increment (NOSI)',
    categoryId: 'cat-07',
    categoryName: '7. Appointment and Oath Documents',
    description: 'Official issuance reflecting salary grade increments or SSL adjustments.',
    submitter: 'HR',
    privacy: 'employee_accessible',
    canEmployeeUpload: false,
    requiresVerification: true,
    applicableClassifications: ['Permanent', 'Temporary', 'Casual', 'Elective Officials'],
    requirementsByClassification: {
      'Permanent': 'OPTIONAL',
      'Temporary': 'OPTIONAL',
      'Casual': 'OPTIONAL',
      'Job Order': 'NOT_APPLICABLE',
      'Contract of Service': 'NOT_APPLICABLE',
      'Elective Officials': 'OPTIONAL'
    }
  },

  // 8. SERVICE RECORDS AND LEAVE CARDS
  {
    code: 'SERVICE_RECORD',
    name: 'Certified Official Service Record',
    categoryId: 'cat-08',
    categoryName: '8. Service Records and Leave Cards',
    description: 'Comprehensive chronologic record of government service prepared by MHRMO.',
    submitter: 'HR',
    privacy: 'employee_accessible',
    canEmployeeUpload: false,
    requiresVerification: true,
    applicableClassifications: ['Permanent', 'Temporary', 'Casual', 'Elective Officials'],
    requirementsByClassification: {
      'Permanent': 'REQUIRED',
      'Temporary': 'REQUIRED',
      'Casual': 'REQUIRED',
      'Job Order': 'OPTIONAL',
      'Contract of Service': 'OPTIONAL',
      'Elective Officials': 'REQUIRED'
    }
  },
  {
    code: 'LEAVE_CARD_RECORD',
    name: 'Employee Leave Card / Credit Accounting Record',
    categoryId: 'cat-08',
    categoryName: '8. Service Records and Leave Cards',
    description: 'Authoritative ledger of vacation and sick leave credits earned and deducted.',
    submitter: 'HR',
    privacy: 'employee_accessible',
    canEmployeeUpload: false,
    requiresVerification: true,
    applicableClassifications: ['Permanent', 'Temporary', 'Casual', 'Elective Officials'],
    requirementsByClassification: {
      'Permanent': 'REQUIRED',
      'Temporary': 'REQUIRED',
      'Casual': 'REQUIRED',
      'Job Order': 'NOT_APPLICABLE',
      'Contract of Service': 'NOT_APPLICABLE',
      'Elective Officials': 'OPTIONAL'
    }
  },

  // 9. PERFORMANCE EVALUATION
  {
    code: 'IPCR_RECORD',
    name: 'Individual Performance Commitment and Review (IPCR - Semi-Annual)',
    categoryId: 'cat-09',
    categoryName: '9. Performance Evaluation',
    description: 'Approved IPCR rating form covering 1st and 2nd semesters.',
    submitter: 'EMPLOYEE',
    privacy: 'employee_accessible',
    canEmployeeUpload: true,
    requiresVerification: true,
    applicableClassifications: ['Permanent', 'Temporary', 'Casual'],
    requirementsByClassification: {
      'Permanent': 'REQUIRED',
      'Temporary': 'REQUIRED',
      'Casual': 'REQUIRED',
      'Job Order': 'CONDITIONAL',
      'Contract of Service': 'CONDITIONAL',
      'Elective Officials': 'NOT_APPLICABLE'
    },
    conditionalNotes: {
      'Job Order': 'Performance evaluation form required for contract renewal recommendation.',
      'Contract of Service': 'Evaluation required prior to milestone/term billing approval.'
    }
  },

  // 10. TRAINING AND DEVELOPMENT
  {
    code: 'TRAINING_CERTIFICATES',
    name: 'Certificates of Training, Seminars and L&D Interventions',
    categoryId: 'cat-10',
    categoryName: '10. Training and Development',
    description: 'Accredited training certificates relevant to job qualification standards.',
    submitter: 'EMPLOYEE',
    privacy: 'employee_accessible',
    canEmployeeUpload: true,
    requiresVerification: true,
    applicableClassifications: ['Permanent', 'Temporary', 'Casual'],
    requirementsByClassification: {
      'Permanent': 'REQUIRED',
      'Temporary': 'CONDITIONAL',
      'Casual': 'OPTIONAL',
      'Job Order': 'OPTIONAL',
      'Contract of Service': 'OPTIONAL',
      'Elective Officials': 'OPTIONAL'
    },
    conditionalNotes: {
      'Permanent': 'At least 16-40 hours of relevant CSC-accredited training for promotional ranks.'
    }
  },

  // 11. COMMENDATIONS AND DISCIPLINARY RECORDS
  {
    code: 'PRAISE_COMMENDATION',
    name: 'PRAISE Award / Letter of Commendation',
    categoryId: 'cat-11',
    categoryName: '11. Commendations and Disciplinary Records',
    description: 'Official certificates of recognition, municipal PRAISE awards, and citations.',
    submitter: 'HR',
    privacy: 'employee_accessible',
    canEmployeeUpload: true,
    requiresVerification: true,
    applicableClassifications: ['Permanent', 'Temporary', 'Casual', 'Job Order', 'Contract of Service', 'Elective Officials'],
    requirementsByClassification: {
      'Permanent': 'OPTIONAL',
      'Temporary': 'OPTIONAL',
      'Casual': 'OPTIONAL',
      'Job Order': 'OPTIONAL',
      'Contract of Service': 'OPTIONAL',
      'Elective Officials': 'OPTIONAL'
    }
  },
  {
    code: 'DISCIPLINARY_CASE_RECORDS',
    name: 'Administrative / Disciplinary Proceedings Record',
    categoryId: 'cat-11',
    categoryName: '11. Commendations and Disciplinary Records',
    description: 'Show cause notices, formal charges, and final resolutions. Highly confidential.',
    submitter: 'HR',
    privacy: 'highly_confidential',
    canEmployeeUpload: false,
    requiresVerification: true,
    applicableClassifications: ['Permanent', 'Temporary', 'Casual', 'Job Order', 'Contract of Service', 'Elective Officials'],
    requirementsByClassification: {
      'Permanent': 'OPTIONAL',
      'Temporary': 'OPTIONAL',
      'Casual': 'OPTIONAL',
      'Job Order': 'OPTIONAL',
      'Contract of Service': 'OPTIONAL',
      'Elective Officials': 'OPTIONAL'
    }
  },

  // 12. CLEARANCE DOCUMENTS
  {
    code: 'CSC_FORM_7_CLEARANCE',
    name: 'Clearance from Money and Property Accountabilities (CSC Form 7)',
    categoryId: 'cat-12',
    categoryName: '12. Clearance Documents',
    description: 'Prescribed clearance for leave commutation, promotion, transfer, or separation.',
    submitter: 'HR',
    privacy: 'employee_accessible',
    canEmployeeUpload: true,
    requiresVerification: true,
    applicableClassifications: ['Permanent', 'Temporary', 'Casual', 'Elective Officials'],
    requirementsByClassification: {
      'Permanent': 'CONDITIONAL',
      'Temporary': 'CONDITIONAL',
      'Casual': 'CONDITIONAL',
      'Job Order': 'OPTIONAL',
      'Contract of Service': 'OPTIONAL',
      'Elective Officials': 'CONDITIONAL'
    },
    conditionalNotes: {
      'Permanent': 'Required when applying for transfer, terminal leave, or resignation.'
    }
  },

  // 13. SEPARATION AND RETIREMENT DOCUMENTS
  {
    code: 'RESIGNATION_RETIREMENT_DOC',
    name: 'Resignation / Retirement Application and Acceptance',
    categoryId: 'cat-13',
    categoryName: '13. Separation and Retirement Documents',
    description: 'Official notice, GSIS retirement papers, and Mayor acceptance order.',
    submitter: 'HR',
    privacy: 'hr_restricted',
    canEmployeeUpload: true,
    requiresVerification: true,
    applicableClassifications: ['Permanent', 'Temporary', 'Casual', 'Elective Officials'],
    requirementsByClassification: {
      'Permanent': 'OPTIONAL',
      'Temporary': 'OPTIONAL',
      'Casual': 'OPTIONAL',
      'Job Order': 'OPTIONAL',
      'Contract of Service': 'OPTIONAL',
      'Elective Officials': 'OPTIONAL'
    }
  },

  // 14. CONTRACTS AND TERMS OF REFERENCE (Critical for JO and COS)
  {
    code: 'JO_COS_CONTRACT',
    name: 'Job Order / Contract of Service Signed Agreement',
    categoryId: 'cat-14',
    categoryName: '14. Contracts and Terms of Reference',
    description: 'Duly approved contract indicating scope, duration, rate, and terms.',
    submitter: 'HR',
    privacy: 'employee_accessible',
    canEmployeeUpload: false,
    requiresVerification: true,
    applicableClassifications: ['Job Order', 'Contract of Service'],
    requirementsByClassification: {
      'Permanent': 'NOT_APPLICABLE',
      'Temporary': 'NOT_APPLICABLE',
      'Casual': 'NOT_APPLICABLE',
      'Job Order': 'REQUIRED',
      'Contract of Service': 'REQUIRED',
      'Elective Officials': 'NOT_APPLICABLE'
    }
  },
  {
    code: 'TERMS_OF_REFERENCE',
    name: 'Terms of Reference (TOR) / Scope of Work',
    categoryId: 'cat-14',
    categoryName: '14. Contracts and Terms of Reference',
    description: 'Detailed specific deliverables and expected performance outputs.',
    submitter: 'HR',
    privacy: 'employee_accessible',
    canEmployeeUpload: false,
    requiresVerification: true,
    applicableClassifications: ['Job Order', 'Contract of Service'],
    requirementsByClassification: {
      'Permanent': 'NOT_APPLICABLE',
      'Temporary': 'NOT_APPLICABLE',
      'Casual': 'NOT_APPLICABLE',
      'Job Order': 'REQUIRED',
      'Contract of Service': 'REQUIRED',
      'Elective Officials': 'NOT_APPLICABLE'
    }
  },
  {
    code: 'ACCOMPLISHMENT_REPORTS',
    name: 'Monthly Accomplishment Report / Billing Claim',
    categoryId: 'cat-14',
    categoryName: '14. Contracts and Terms of Reference',
    description: 'Summary of tasks accomplished certified by the designated supervisor.',
    submitter: 'EMPLOYEE',
    privacy: 'employee_accessible',
    canEmployeeUpload: true,
    requiresVerification: true,
    applicableClassifications: ['Job Order', 'Contract of Service'],
    requirementsByClassification: {
      'Permanent': 'OPTIONAL',
      'Temporary': 'OPTIONAL',
      'Casual': 'OPTIONAL',
      'Job Order': 'REQUIRED',
      'Contract of Service': 'REQUIRED',
      'Elective Officials': 'OPTIONAL'
    }
  },

  // 15. OTHER CSC AND HR DOCUMENTS
  {
    code: 'TRAVEL_ORDERS_PASS_SLIPS',
    name: 'Official Travel Orders & Pass Slips Archive',
    categoryId: 'cat-15',
    categoryName: '15. Other CSC and HR Documents',
    description: 'Approved official travel authorizations and locator slips.',
    submitter: 'HR',
    privacy: 'employee_accessible',
    canEmployeeUpload: false,
    requiresVerification: true,
    applicableClassifications: ['Permanent', 'Temporary', 'Casual', 'Job Order', 'Contract of Service', 'Elective Officials'],
    requirementsByClassification: {
      'Permanent': 'OPTIONAL',
      'Temporary': 'OPTIONAL',
      'Casual': 'OPTIONAL',
      'Job Order': 'OPTIONAL',
      'Contract of Service': 'OPTIONAL',
      'Elective Officials': 'OPTIONAL'
    }
  },
  {
    code: 'SPECIAL_ORDERS_MEMOS',
    name: 'Special Orders, Designations & Memoranda',
    categoryId: 'cat-15',
    categoryName: '15. Other CSC and HR Documents',
    description: 'Office memorandums, committee designations, and administrative directives.',
    submitter: 'HR',
    privacy: 'employee_accessible',
    canEmployeeUpload: false,
    requiresVerification: true,
    applicableClassifications: ['Permanent', 'Temporary', 'Casual', 'Job Order', 'Contract of Service', 'Elective Officials'],
    requirementsByClassification: {
      'Permanent': 'OPTIONAL',
      'Temporary': 'OPTIONAL',
      'Casual': 'OPTIONAL',
      'Job Order': 'OPTIONAL',
      'Contract of Service': 'OPTIONAL',
      'Elective Officials': 'OPTIONAL'
    }
  }
];

// Helper to determine the compliance statistics for an employee based on their classification
export interface ComplianceSummary {
  classification: EmploymentClassification;
  totalRequired: number;
  totalOptional: number;
  totalConditional: number;
  verifiedRequired: number;
  missingRequired: number; // RED
  missingOptional: number; // YELLOW
  forReview: number; // BLUE
  returned: number; // ORANGE
  verified: number; // GREEN
  isCompliant: boolean; // True if missingRequired === 0
  complianceScore: number; // percentage 0-100
}

export function computeEmployeeCompliance(
  classification: EmploymentClassification,
  employeeDocs: { documentTypeCode: string; status: string }[]
): ComplianceSummary {
  let totalRequired = 0;
  let totalOptional = 0;
  let totalConditional = 0;
  let verifiedRequired = 0;
  let missingRequired = 0;
  let missingOptional = 0;
  let forReview = 0;
  let returned = 0;
  let verified = 0;

  MASTER_DOCUMENTS.forEach(doc => {
    const level = doc.requirementsByClassification[classification];
    if (level === 'NOT_APPLICABLE') return;

    if (level === 'REQUIRED') totalRequired++;
    else if (level === 'OPTIONAL') totalOptional++;
    else if (level === 'CONDITIONAL') totalConditional++;

    const docRecord = employeeDocs.find(d => d.documentTypeCode === doc.code);

    if (!docRecord) {
      if (level === 'REQUIRED') {
        missingRequired++;
      } else {
        missingOptional++;
      }
    } else {
      if (docRecord.status === 'verified') {
        verified++;
        if (level === 'REQUIRED') verifiedRequired++;
      } else if (docRecord.status === 'for_review') {
        forReview++;
      } else if (docRecord.status === 'returned') {
        returned++;
        if (level === 'REQUIRED') missingRequired++;
      } else if (docRecord.status === 'missing_required') {
        missingRequired++;
      } else if (docRecord.status === 'missing_optional') {
        missingOptional++;
      }
    }
  });

  const isCompliant = missingRequired === 0;
  const complianceScore = totalRequired > 0 
    ? Math.round((verifiedRequired / totalRequired) * 100) 
    : 100;

  return {
    classification,
    totalRequired,
    totalOptional,
    totalConditional,
    verifiedRequired,
    missingRequired,
    missingOptional,
    forReview,
    returned,
    verified,
    isCompliant,
    complianceScore
  };
}
