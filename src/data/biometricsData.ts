import { BiometricRecord, BiometricTerminal, Employee, AttendanceStatus } from '../types/index.ts';

export const INITIAL_TERMINALS: BiometricTerminal[] = [];

export const INITIAL_BIOMETRIC_RECORDS: BiometricRecord[] = [];

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
