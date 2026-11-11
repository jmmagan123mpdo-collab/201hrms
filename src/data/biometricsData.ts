import { BiometricRecord, BiometricTerminal, Employee, AttendanceStatus } from '../types/index.ts';

export const INITIAL_TERMINALS: BiometricTerminal[] = [
  {
    id: 'TERM-01',
    name: 'Terminal 01 – Main Hall Lobby',
    location: 'Ground Floor, Municipal Hall Lobby',
    ipAddress: '192.168.1.101',
    model: 'ZKTeco BioStation 3 (Face / Fingerprint)',
    status: 'online',
    lastPing: 'Just now',
    totalLogsStored: 1482
  },
  {
    id: 'TERM-02',
    name: 'Terminal 02 – Finance & Treasury',
    location: 'Treasury Hall Ground Floor',
    ipAddress: '192.168.1.102',
    model: 'Anviz FaceDeep 5 (Facial Recognition / RFID)',
    status: 'online',
    lastPing: '1 min ago',
    totalLogsStored: 1120
  },
  {
    id: 'TERM-03',
    name: 'Terminal 03 – MHRMO & Executive',
    location: '2nd Floor Administration Wing Hallway',
    ipAddress: '192.168.1.103',
    model: 'ZKTeco iClock 880 (High-Capacity Optical)',
    status: 'online',
    lastPing: 'Just now',
    totalLogsStored: 964
  },
  {
    id: 'TERM-04',
    name: 'Terminal 04 – GSO & Motorpool',
    location: 'GSO Compound Operations Desk',
    ipAddress: '192.168.1.104',
    model: 'Granding Biometric Optical Terminal',
    status: 'online',
    lastPing: '3 mins ago',
    totalLogsStored: 680
  }
];

export const INITIAL_BIOMETRIC_RECORDS: BiometricRecord[] = [
  // TODAY: 2026-02-10
  {
    id: 'BIO-2026-02-10-EMP001',
    employeeId: 'EMP-2022-001',
    employeeName: 'Maria Santos Reyes',
    employeeNumber: 'SJ-PERM-0142',
    officeName: 'Human Resource Office',
    position: 'Human Resource Management Officer II',
    classification: 'Permanent',
    date: '2026-02-10',
    amIn: '07:54 AM',
    amOut: '12:02 PM',
    pmIn: '12:51 PM',
    pmOut: '05:05 PM',
    tardyMinutes: 0,
    undertimeMinutes: 0,
    totalHours: 8.0,
    status: 'On Time',
    terminalId: 'TERM-03',
    terminalName: 'Terminal 03 – MHRMO & Executive',
    verificationMethod: 'Facial Recognition',
    syncStatus: 'synced',
    syncedAt: '2026-02-10T17:06:00.000Z',
    verifiedBy: 'Elena Castillo (MHRMO Head)'
  },
  {
    id: 'BIO-2026-02-10-EMP045',
    employeeId: 'EMP-2023-045',
    employeeName: 'Juan Bautista Dela Cruz',
    employeeNumber: 'SJ-PERM-0188',
    officeName: 'Municipal Planning and Development Office',
    position: 'Planning Officer III',
    classification: 'Permanent',
    date: '2026-02-10',
    amIn: '08:14 AM',
    amOut: '12:05 PM',
    pmIn: '12:58 PM',
    pmOut: '05:02 PM',
    tardyMinutes: 14,
    undertimeMinutes: 0,
    totalHours: 7.76,
    status: 'Late / Tardy',
    terminalId: 'TERM-01',
    terminalName: 'Terminal 01 – Main Hall Lobby',
    verificationMethod: 'Fingerprint',
    syncStatus: 'synced',
    syncedAt: '2026-02-10T17:05:00.000Z',
    remarks: 'Flagged for 14 mins morning tardiness'
  },
  {
    id: 'BIO-2026-02-10-EMP046',
    employeeId: 'EMP-2021-089',
    employeeName: 'Ricardo Gomez Manalo',
    employeeNumber: 'SJ-PERM-0112',
    officeName: 'Human Resource Office',
    position: 'Administrative Aide IV (HR Staff)',
    classification: 'Permanent',
    date: '2026-02-10',
    amIn: '07:48 AM',
    amOut: '12:00 PM',
    pmIn: '12:49 PM',
    pmOut: '05:00 PM',
    tardyMinutes: 0,
    undertimeMinutes: 0,
    totalHours: 8.0,
    status: 'On Time',
    terminalId: 'TERM-03',
    terminalName: 'Terminal 03 – MHRMO & Executive',
    verificationMethod: 'Fingerprint',
    syncStatus: 'synced',
    syncedAt: '2026-02-10T17:02:00.000Z'
  },
  {
    id: 'BIO-2026-02-10-EMP047',
    employeeId: 'EMP-2020-004',
    employeeName: 'Grace Balmes',
    employeeNumber: 'SJ-PERM-0098',
    officeName: 'Municipal Accounting Office',
    position: 'Municipal Payroll Officer',
    classification: 'Permanent',
    date: '2026-02-10',
    amIn: '07:58 AM',
    amOut: '12:01 PM',
    pmIn: '12:54 PM',
    pmOut: '05:10 PM',
    tardyMinutes: 0,
    undertimeMinutes: 0,
    totalHours: 8.0,
    status: 'On Time',
    terminalId: 'TERM-02',
    terminalName: 'Terminal 02 – Finance & Treasury',
    verificationMethod: 'Fingerprint',
    syncStatus: 'synced',
    syncedAt: '2026-02-10T17:11:00.000Z'
  },
  {
    id: 'BIO-2026-02-10-EMP048',
    employeeId: 'EMP-2019-002',
    employeeName: 'EnP. Jerome Magan',
    employeeNumber: 'SJ-PERM-0045',
    officeName: 'Municipal Planning and Development Office',
    position: 'Municipal Planning & Development Coordinator',
    classification: 'Permanent',
    date: '2026-02-10',
    amIn: '07:50 AM',
    amOut: '12:04 PM',
    pmIn: '12:55 PM',
    pmOut: '05:15 PM',
    tardyMinutes: 0,
    undertimeMinutes: 0,
    totalHours: 8.0,
    status: 'On Time',
    terminalId: 'TERM-01',
    terminalName: 'Terminal 01 – Main Hall Lobby',
    verificationMethod: 'Facial Recognition',
    syncStatus: 'synced',
    syncedAt: '2026-02-10T17:16:00.000Z'
  },
  {
    id: 'BIO-2026-02-10-EMP049',
    employeeId: 'EMP-2018-001',
    employeeName: 'Atty. Maria Elena Castillo',
    employeeNumber: 'SJ-PERM-0012',
    officeName: 'Human Resource Office',
    position: 'Municipal Government Department Head I (MHRMO)',
    classification: 'Permanent',
    date: '2026-02-10',
    amIn: '07:45 AM',
    amOut: '12:15 PM',
    pmIn: '01:00 PM',
    pmOut: '05:30 PM',
    tardyMinutes: 0,
    undertimeMinutes: 0,
    totalHours: 8.0,
    status: 'On Time',
    terminalId: 'TERM-03',
    terminalName: 'Terminal 03 – MHRMO & Executive',
    verificationMethod: 'Facial Recognition',
    syncStatus: 'synced',
    syncedAt: '2026-02-10T17:31:00.000Z'
  },
  {
    id: 'BIO-2026-02-10-EMP050',
    employeeId: 'EMP-2022-019',
    employeeName: 'Clarisse Ramos',
    employeeNumber: 'SJ-PERM-0155',
    officeName: 'Municipal Tourism, Culture and Development Office',
    position: 'Tourism Operations Officer I',
    classification: 'Permanent',
    date: '2026-02-10',
    amIn: '07:55 AM',
    amOut: '11:35 AM',
    pmIn: '12:50 PM',
    pmOut: '05:00 PM',
    tardyMinutes: 0,
    undertimeMinutes: 25,
    totalHours: 7.58,
    status: 'Undertime',
    terminalId: 'TERM-01',
    terminalName: 'Terminal 01 – Main Hall Lobby',
    verificationMethod: 'Fingerprint',
    syncStatus: 'synced',
    syncedAt: '2026-02-10T17:01:00.000Z',
    remarks: 'Approved Municipal Pass Slip #PS-2026-08 (Official Travel)'
  },
  {
    id: 'BIO-2026-02-10-EMP051',
    employeeId: 'EMP-2021-030',
    employeeName: 'Arthur Villanueva',
    employeeNumber: 'SJ-PERM-0131',
    officeName: 'Municipal Information Office',
    position: 'Information Officer II',
    classification: 'Permanent',
    date: '2026-02-10',
    amIn: '08:24 AM',
    amOut: '12:02 PM',
    pmIn: '12:56 PM',
    pmOut: '05:01 PM',
    tardyMinutes: 24,
    undertimeMinutes: 0,
    totalHours: 7.6,
    status: 'Late / Tardy',
    terminalId: 'TERM-01',
    terminalName: 'Terminal 01 – Main Hall Lobby',
    verificationMethod: 'RFID Card',
    syncStatus: 'synced',
    syncedAt: '2026-02-10T17:03:00.000Z',
    remarks: 'Tardy 24 mins. Broadcast equipment check.'
  },
  {
    id: 'BIO-2026-02-10-EMP052',
    employeeId: 'EMP-2020-015',
    employeeName: 'Rosalinda Gutierrez, RSW',
    employeeNumber: 'SJ-PERM-0084',
    officeName: 'Municipal Social Welfare and Development Office',
    position: 'Social Welfare Officer II',
    classification: 'Permanent',
    date: '2026-02-10',
    amIn: null,
    amOut: null,
    pmIn: null,
    pmOut: null,
    tardyMinutes: 0,
    undertimeMinutes: 0,
    totalHours: 0,
    status: 'On Leave',
    terminalId: 'TERM-01',
    terminalName: 'Terminal 01 – Main Hall Lobby',
    verificationMethod: 'Manual Log',
    syncStatus: 'synced',
    syncedAt: '2026-02-10T08:00:00.000Z',
    remarks: 'On Authorized Mandatory Leave (CSC Form 6 Approved)'
  },
  {
    id: 'BIO-2026-02-10-EMP053',
    employeeId: 'EMP-2019-011',
    employeeName: 'Engr. Manuel Cordero',
    employeeNumber: 'SJ-PERM-0072',
    officeName: 'Municipal Engineering Office',
    position: 'Municipal Engineer',
    classification: 'Permanent',
    date: '2026-02-10',
    amIn: '07:38 AM',
    amOut: '12:00 PM',
    pmIn: '01:05 PM',
    pmOut: '05:12 PM',
    tardyMinutes: 5,
    undertimeMinutes: 0,
    totalHours: 8.0,
    status: 'Late / Tardy',
    terminalId: 'TERM-01',
    terminalName: 'Terminal 01 – Main Hall Lobby',
    verificationMethod: 'Fingerprint',
    syncStatus: 'synced',
    syncedAt: '2026-02-10T17:15:00.000Z'
  },
  {
    id: 'BIO-2026-02-10-EMP054',
    employeeId: 'EMP-2023-010',
    employeeName: 'Capt. Danilo Santos',
    employeeNumber: 'SJ-PERM-0177',
    officeName: 'Municipal Disaster Risk Reduction and Management Office',
    position: 'Local Disaster Risk Reduction and Management Officer III',
    classification: 'Permanent',
    date: '2026-02-10',
    amIn: '07:30 AM',
    amOut: '12:00 PM',
    pmIn: '12:45 PM',
    pmOut: '05:30 PM',
    tardyMinutes: 0,
    undertimeMinutes: 0,
    totalHours: 8.5,
    status: 'On Time',
    terminalId: 'TERM-04',
    terminalName: 'Terminal 04 – GSO & Motorpool',
    verificationMethod: 'Fingerprint',
    syncStatus: 'synced',
    syncedAt: '2026-02-10T17:35:00.000Z',
    remarks: 'EOC Weather monitoring duty'
  },
  {
    id: 'BIO-2026-02-10-EMP055',
    employeeId: 'EMP-2020-008',
    employeeName: 'Dr. Jaime Soriano, MD',
    employeeNumber: 'SJ-PERM-0091',
    officeName: 'Municipal Health Office',
    position: 'Municipal Health Officer',
    classification: 'Permanent',
    date: '2026-02-10',
    amIn: '07:42 AM',
    amOut: '12:01 PM',
    pmIn: '12:50 PM',
    pmOut: '05:08 PM',
    tardyMinutes: 0,
    undertimeMinutes: 0,
    totalHours: 8.0,
    status: 'On Time',
    terminalId: 'TERM-01',
    terminalName: 'Terminal 01 – Main Hall Lobby',
    verificationMethod: 'Facial Recognition',
    syncStatus: 'synced',
    syncedAt: '2026-02-10T17:10:00.000Z'
  },
  {
    id: 'BIO-2026-02-10-EMP056',
    employeeId: 'EMP-2022-040',
    employeeName: 'Hon. Rey Ladaga',
    employeeNumber: 'SJ-ELEC-0001',
    officeName: "Mayor's Office",
    position: 'Municipal Mayor',
    classification: 'Elective Officials',
    date: '2026-02-10',
    amIn: '08:00 AM',
    amOut: '12:30 PM',
    pmIn: '01:15 PM',
    pmOut: '06:00 PM',
    tardyMinutes: 0,
    undertimeMinutes: 0,
    totalHours: 8.0,
    status: 'Official Business (OB)',
    terminalId: 'TERM-03',
    terminalName: 'Terminal 03 – MHRMO & Executive',
    verificationMethod: 'Manual Log',
    syncStatus: 'synced',
    syncedAt: '2026-02-10T18:00:00.000Z',
    remarks: 'Executive Governance & Sangguniang Bayan Session'
  },

  // PREVIOUS DAY: 2026-02-09
  {
    id: 'BIO-2026-02-09-EMP001',
    employeeId: 'EMP-2022-001',
    employeeName: 'Maria Santos Reyes',
    employeeNumber: 'SJ-PERM-0142',
    officeName: 'Human Resource Office',
    position: 'Human Resource Management Officer II',
    classification: 'Permanent',
    date: '2026-02-09',
    amIn: '07:51 AM',
    amOut: '12:01 PM',
    pmIn: '12:50 PM',
    pmOut: '05:02 PM',
    tardyMinutes: 0,
    undertimeMinutes: 0,
    totalHours: 8.0,
    status: 'On Time',
    terminalId: 'TERM-03',
    terminalName: 'Terminal 03 – MHRMO & Executive',
    verificationMethod: 'Facial Recognition',
    syncStatus: 'synced',
    syncedAt: '2026-02-09T17:05:00.000Z',
    verifiedBy: 'Elena Castillo'
  },
  {
    id: 'BIO-2026-02-09-EMP045',
    employeeId: 'EMP-2023-045',
    employeeName: 'Juan Bautista Dela Cruz',
    employeeNumber: 'SJ-PERM-0188',
    officeName: 'Municipal Planning and Development Office',
    position: 'Planning Officer III',
    classification: 'Permanent',
    date: '2026-02-09',
    amIn: '07:58 AM',
    amOut: '12:00 PM',
    pmIn: '12:55 PM',
    pmOut: '05:05 PM',
    tardyMinutes: 0,
    undertimeMinutes: 0,
    totalHours: 8.0,
    status: 'On Time',
    terminalId: 'TERM-01',
    terminalName: 'Terminal 01 – Main Hall Lobby',
    verificationMethod: 'Fingerprint',
    syncStatus: 'synced',
    syncedAt: '2026-02-09T17:06:00.000Z'
  }
];

export const calculateTardinessAndUndertime = (
  amInStr: string | null,
  amOutStr: string | null,
  pmInStr: string | null,
  pmOutStr: string | null
): { tardyMinutes: number; undertimeMinutes: number; totalHours: number; status: AttendanceStatus } => {
  if (!amInStr && !pmInStr) {
    return { tardyMinutes: 0, undertimeMinutes: 0, totalHours: 0, status: 'Absent' };
  }

  let tardy = 0;
  let undertime = 0;

  // Standard Municipal Office Hours: AM: 8:00 AM - 12:00 PM, PM: 1:00 PM - 5:00 PM
  const parseTimeToMinutes = (tStr: string | null): number | null => {
    if (!tStr) return null;
    const match = tStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!match) return null;
    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const meridian = match[3].toUpperCase();
    if (meridian === 'PM' && hours < 12) hours += 12;
    if (meridian === 'AM' && hours === 12) hours = 0;
    return hours * 60 + minutes;
  };

  const amInMin = parseTimeToMinutes(amInStr);
  const amOutMin = parseTimeToMinutes(amOutStr);
  const pmInMin = parseTimeToMinutes(pmInStr);
  const pmOutMin = parseTimeToMinutes(pmOutStr);

  // AM In tardiness (past 8:00 AM = 480 mins)
  if (amInMin !== null && amInMin > 480) {
    tardy += (amInMin - 480);
  }

  // AM Out undertime (before 12:00 PM = 720 mins)
  if (amOutMin !== null && amOutMin < 720) {
    undertime += (720 - amOutMin);
  }

  // PM In tardiness (past 1:00 PM = 780 mins)
  if (pmInMin !== null && pmInMin > 780) {
    tardy += (pmInMin - 780);
  }

  // PM Out undertime (before 5:00 PM = 1020 mins)
  if (pmOutMin !== null && pmOutMin < 1020) {
    undertime += (1020 - pmOutMin);
  }

  let totalHours = 8.0 - ((tardy + undertime) / 60);
  if (totalHours < 0) totalHours = 0;
  totalHours = Math.round(totalHours * 100) / 100;

  let status: AttendanceStatus = 'On Time';
  if (tardy > 0 && undertime > 0) {
    status = 'Late / Tardy';
  } else if (tardy > 0) {
    status = 'Late / Tardy';
  } else if (undertime > 0) {
    status = 'Undertime';
  } else if (!amInStr || !pmInStr) {
    status = 'Half Day';
  }

  return {
    tardyMinutes: tardy,
    undertimeMinutes: undertime,
    totalHours,
    status
  };
};
