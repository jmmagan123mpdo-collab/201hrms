import { LeaveApplication, InteractiveEmailMessage } from '../types/index.ts';

export const SUPERVISOR_DEFAULT_EMAIL = 'jmmagan123mpdo@gmail.com';
export const MAYOR_DEFAULT_EMAIL = 'juanmig488@gmail.com';
export const HR_DEFAULT_EMAIL = 'mhrmo.sanjose.mindoro@gmail.com';

export function createSupervisorLeaveEmail(
  leave: LeaveApplication,
  toEmail: string = SUPERVISOR_DEFAULT_EMAIL
): InteractiveEmailMessage {
  return {
    id: `email-supv-${leave.id}-${Date.now()}`,
    leaveId: leave.id,
    toEmail,
    recipientName: leave.supervisorName || 'Engr. Juan Miguel Magan (Immediate Supervisor / MPDO Head)',
    recipientRole: 'supervisor',
    subject: `[ACTION REQUIRED] CSC Form 6 Leave Application for Endorsement: ${leave.employeeName} (${leave.leaveType} Leave)`,
    sentAt: new Date().toISOString(),
    status: 'sent',
    employeeName: leave.employeeName,
    officeName: leave.officeName,
    position: leave.position,
    leaveType: leave.leaveType,
    workingDays: leave.workingDays,
    inclusiveDates: leave.inclusiveDates,
    detailsOfLeave: leave.detailsOfLeave
  };
}

export function createMayorLeaveEmail(
  leave: LeaveApplication,
  toEmail: string = MAYOR_DEFAULT_EMAIL
): InteractiveEmailMessage {
  return {
    id: `email-mayor-${leave.id}-${Date.now()}`,
    leaveId: leave.id,
    toEmail,
    recipientName: leave.mayorName || 'Hon. Rey P. Ladaga (Municipal Mayor)',
    recipientRole: 'mayor',
    subject: `[FOR EXECUTIVE APPROVAL] Endorsed Leave Application (CSC Form 6) – ${leave.employeeName} | Endorsed by Supv. ${leave.supervisorName || 'Engr. Juan Miguel Magan'}`,
    sentAt: new Date().toISOString(),
    status: 'sent',
    employeeName: leave.employeeName,
    officeName: leave.officeName,
    position: leave.position,
    leaveType: leave.leaveType,
    workingDays: leave.workingDays,
    inclusiveDates: leave.inclusiveDates,
    detailsOfLeave: leave.detailsOfLeave,
    supervisorEndorsement: {
      endorsedBy: leave.supervisorName || 'Engr. Juan Miguel Magan, MPDO Head',
      endorsedAt: leave.supervisorDate || new Date().toISOString(),
      remarks: leave.supervisorRemarks || 'Endorsed for approval; work duties reassigned.'
    }
  };
}

export function createEmployeeApprovedEmail(
  leave: LeaveApplication,
  toEmail: string = 'employee@sanjose.gov.ph'
): InteractiveEmailMessage {
  return {
    id: `email-emp-${leave.id}-${Date.now()}`,
    leaveId: leave.id,
    toEmail,
    recipientName: leave.employeeName,
    recipientRole: 'employee',
    subject: `[OFFICIALLY APPROVED] Your CSC Form 6 Leave has been Approved & Sealed – Ready to Print for Accomplishment Report`,
    sentAt: new Date().toISOString(),
    status: 'sent',
    employeeName: leave.employeeName,
    officeName: leave.officeName,
    position: leave.position,
    leaveType: leave.leaveType,
    workingDays: leave.workingDays,
    inclusiveDates: leave.inclusiveDates,
    detailsOfLeave: leave.detailsOfLeave,
    supervisorEndorsement: {
      endorsedBy: leave.supervisorName || 'Engr. Juan Miguel Magan',
      endorsedAt: leave.supervisorDate || new Date().toISOString(),
      remarks: leave.supervisorRemarks || 'Endorsed'
    },
    mayorApproval: {
      approvedBy: leave.mayorName || 'HON. REY P. LADAGA',
      approvedAt: leave.mayorDate || new Date().toISOString(),
      remarks: leave.mayorRemarks || 'Approved'
    },
    hrCertification: {
      certifiedBy: leave.hrFinalOfficer || 'Atty. Maria Elena Castillo, MHRMO Head',
      certifiedAt: leave.hrFinalDate || new Date().toISOString(),
      remarks: leave.hrFinalRemarks || 'Verified and deducted from leave credits ledger'
    }
  };
}
