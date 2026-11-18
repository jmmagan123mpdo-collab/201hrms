import type {
  EmailDispatchStatus,
  EmailLog,
  EmailProvider,
  EmailRecipientRole,
  EmailWorkflowStage,
  EmailWorkflowType,
} from '../src/types/index.ts';

export interface EmailServiceStatus {
  configuredProvider: EmailProvider;
  hasSendGrid: boolean;
  hasMailgun: boolean;
  fromEmail: string;
  mailgunDomain: string | null;
  mailgunRegion: string;
}

export interface TransactionalEmailPayload {
  to: string;
  toName?: string;
  subject: string;
  text: string;
  html: string;
}

export interface TransactionalEmailResult {
  status: EmailDispatchStatus;
  provider: EmailProvider;
  providerMessageId?: string;
  httpStatusCode?: number;
  errorMessage?: string;
}

export interface LeaveWorkflowEmailRequest {
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
  triggeredByUid?: string;
  triggeredByName?: string;
  appUrl?: string;
}

function getConfiguredProvider(): {
  provider: EmailProvider;
  hasSendGrid: boolean;
  hasMailgun: boolean;
  fromEmail: string;
  sendGridKey: string;
  mailgunKey: string;
  mailgunDomain: string;
  mailgunRegion: string;
} {
  const sendGridKey = (process.env.SENDGRID_API_KEY || '').trim();
  const mailgunKey = (process.env.MAILGUN_API_KEY || '').trim();
  const mailgunDomain = (process.env.MAILGUN_DOMAIN || '').trim();
  const mailgunRegion = (process.env.MAILGUN_REGION || 'us').trim().toLowerCase();
  const requested = (process.env.EMAIL_PROVIDER || 'auto').trim().toLowerCase();
  const fromEmail = (
    process.env.EMAIL_FROM ||
    process.env.SENDGRID_FROM_EMAIL ||
    'SJHR201 LGU San Jose HRMIS <noreply@sanjose-occmdo.gov.ph>'
  ).trim();

  const hasSendGrid = Boolean(sendGridKey);
  const hasMailgun = Boolean(mailgunKey && mailgunDomain);

  let provider: EmailProvider = 'none';
  if (requested === 'sendgrid' && hasSendGrid) {
    provider = 'sendgrid';
  } else if (requested === 'mailgun' && hasMailgun) {
    provider = 'mailgun';
  } else if (requested === 'auto' || !requested) {
    if (hasSendGrid) {
      provider = 'sendgrid';
    } else if (hasMailgun) {
      provider = 'mailgun';
    }
  }

  return {
    provider,
    hasSendGrid,
    hasMailgun,
    fromEmail,
    sendGridKey,
    mailgunKey,
    mailgunDomain,
    mailgunRegion,
  };
}

export function getEmailServiceStatus(): EmailServiceStatus {
  const cfg = getConfiguredProvider();
  return {
    configuredProvider: cfg.provider,
    hasSendGrid: cfg.hasSendGrid,
    hasMailgun: cfg.hasMailgun,
    fromEmail: cfg.fromEmail,
    mailgunDomain: cfg.mailgunDomain ? cfg.mailgunDomain : null,
    mailgunRegion: cfg.mailgunRegion,
  };
}

function parseFromHeader(fromHeader: string): { email: string; name?: string } {
  const match = fromHeader.match(/^(.*)<([^>]+)>$/);
  if (match) {
    return {
      name: match[1].trim().replace(/^["']|["']$/g, '') || undefined,
      email: match[2].trim(),
    };
  }
  return { email: fromHeader.trim() };
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export async function sendTransactionalEmail(
  payload: TransactionalEmailPayload
): Promise<TransactionalEmailResult> {
  const cfg = getConfiguredProvider();

  if (!payload.to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.to.trim())) {
    return {
      status: 'failed',
      provider: cfg.provider,
      errorMessage: `Invalid recipient email address: "${payload.to || ''}"`,
    };
  }

  if (cfg.provider === 'none') {
    return {
      status: 'unconfigured',
      provider: 'none',
      errorMessage:
        'No transactional email provider configured on server. Set SENDGRID_API_KEY or MAILGUN_API_KEY + MAILGUN_DOMAIN in environment variables.',
    };
  }

  if (cfg.provider === 'sendgrid') {
    const parsedFrom = parseFromHeader(cfg.fromEmail);
    const body = {
      personalizations: [
        {
          to: [
            {
              email: payload.to.trim(),
              ...(payload.toName ? { name: payload.toName } : {}),
            },
          ],
        },
      ],
      from: {
        email: parsedFrom.email,
        ...(parsedFrom.name ? { name: parsedFrom.name } : {}),
      },
      subject: payload.subject,
      content: [
        { type: 'text/plain', value: payload.text },
        { type: 'text/html', value: payload.html },
      ],
    };

    try {
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${cfg.sendGridKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const messageId = response.headers.get('x-message-id') || undefined;
      if (response.ok) {
        return {
          status: 'sent',
          provider: 'sendgrid',
          providerMessageId: messageId,
          httpStatusCode: response.status,
        };
      }

      const errorText = await response.text().catch(() => '');
      return {
        status: 'failed',
        provider: 'sendgrid',
        providerMessageId: messageId,
        httpStatusCode: response.status,
        errorMessage: `SendGrid HTTP ${response.status}: ${errorText.slice(0, 350) || response.statusText}`,
      };
    } catch (error: unknown) {
      return {
        status: 'failed',
        provider: 'sendgrid',
        errorMessage: error instanceof Error ? error.message : 'Network error calling SendGrid API',
      };
    }
  }

  // Mailgun API v3
  const baseHost =
    cfg.mailgunRegion === 'eu' ? 'https://api.eu.mailgun.net' : 'https://api.mailgun.net';
  const endpoint = `${baseHost}/v3/${encodeURIComponent(cfg.mailgunDomain)}/messages`;

  const form = new URLSearchParams();
  form.set('from', cfg.fromEmail);
  form.set('to', payload.toName ? `${payload.toName} <${payload.to.trim()}>` : payload.to.trim());
  form.set('subject', payload.subject);
  form.set('text', payload.text);
  form.set('html', payload.html);

  try {
    const authToken = Buffer.from(`api:${cfg.mailgunKey}`).toString('base64');
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${authToken}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: form.toString(),
    });

    const rawText = await response.text().catch(() => '');
    let parsedJson: { id?: string; message?: string } | null = null;
    try {
      parsedJson = rawText ? JSON.parse(rawText) : null;
    } catch {
      parsedJson = null;
    }

    if (response.ok) {
      return {
        status: 'sent',
        provider: 'mailgun',
        providerMessageId: parsedJson?.id,
        httpStatusCode: response.status,
      };
    }

    return {
      status: 'failed',
      provider: 'mailgun',
      httpStatusCode: response.status,
      errorMessage: `Mailgun HTTP ${response.status}: ${(parsedJson?.message || rawText || response.statusText).slice(0, 350)}`,
    };
  } catch (error: unknown) {
    return {
      status: 'failed',
      provider: 'mailgun',
      errorMessage: error instanceof Error ? error.message : 'Network error calling Mailgun API',
    };
  }
}

export function buildLeaveWorkflowEmailContent(
  req: LeaveWorkflowEmailRequest
): { subject: string; text: string; html: string; preview: string } {
  const portalUrl = (req.appUrl || process.env.APP_URL || 'http://localhost:3000').replace(/\/$/, '');
  const formLabel =
    req.workflowType === 'WELLNESS_W01'
      ? 'Wellness Form W-01 (Leave)'
      : req.workflowType === 'WELLNESS_W02'
      ? 'Wellness Form W-02 (Break)'
      : req.workflowType === 'SYSTEM_TEST'
      ? 'Workflow Routing Test'
      : 'CSC Form No. 6 (Application for Leave)';

  let stageHeadline = 'Leave Workflow Notification';
  let stageBadge = 'ACTION REQUIRED';
  let actionInstruction = 'Please log in to the SJHR201 HRMIS portal to review this application.';

  switch (req.workflowStage) {
    case 'stage_1_submitted':
      stageHeadline = `New ${req.leaveType || 'Leave'} Application Awaiting Supervisor Recommendation`;
      stageBadge = 'STAGE 2: IMMEDIATE SUPERVISOR REVIEW';
      actionInstruction =
        'As Immediate Supervisor, please review operational coverage and record your recommendation (Approve or Disapprove) in SJHR201.';
      break;
    case 'stage_2_supervisor_approved':
      stageHeadline = `Supervisor-Endorsed Leave Awaiting Municipal Mayor Approval`;
      stageBadge = 'STAGE 3: HEAD OF AGENCY APPROVAL';
      actionInstruction =
        'This application has been endorsed by the Immediate Supervisor and now requires Executive Decision by the Office of the Municipal Mayor.';
      break;
    case 'stage_2_supervisor_disapproved':
      stageHeadline = `Leave Application Disapproved by Immediate Supervisor`;
      stageBadge = 'STAGE 2: DISAPPROVED';
      actionInstruction =
        'Your application was not endorsed by your Immediate Supervisor. Review remarks below or coordinate with MHRMO.';
      break;
    case 'stage_3_mayor_approved':
      stageHeadline = `Mayor-Approved Leave Ready for HR Final Recording & Credit Deduction`;
      stageBadge = 'STAGE 4 & 5: MHRMO FINAL RECORDING';
      actionInstruction =
        'Approved by the Municipal Mayor. Please verify documentary completeness and complete Stage 5 Final Recording to deduct leave credits.';
      break;
    case 'stage_3_mayor_disapproved':
      stageHeadline = `Leave Application Disapproved by Municipal Mayor`;
      stageBadge = 'STAGE 3: DISAPPROVED';
      actionInstruction =
        'Your leave application was disapproved during executive review. No leave credits were deducted.';
      break;
    case 'stage_5_hr_finalized':
      stageHeadline = `Leave Application Finalized & Recorded by MHRMO`;
      stageBadge = 'STAGE 5: APPROVED & CREDITS RECORDED';
      actionInstruction =
        'MHRMO has completed final recording and updated your official leave credit ledger in ESS.';
      break;
    case 'stage_5_hr_returned':
      stageHeadline = `Leave Application Returned / Declined by MHRMO`;
      stageBadge = 'STAGE 4: RETURNED BY HR';
      actionInstruction =
        'MHRMO returned or declined this leave filing during final compliance checking. Review the HR remarks below.';
      break;
    case 'test_dispatch':
      stageHeadline = `SJHR201 Leave Approval Routing Test Email`;
      stageBadge = 'SYSTEM VERIFICATION';
      actionInstruction =
        'This is an automated verification email confirming that LGU San Jose HRMIS transactional leave approval routing is properly configured.';
      break;
  }

  const subject = `[SJHR201 LGU San Jose] ${stageHeadline} (${req.leaveApplicationId})`;

  const textLines = [
    'REPUBLIC OF THE PHILIPPINES',
    'MUNICIPALITY OF SAN JOSE, OCCIDENTAL MINDORO',
    'Municipal Human Resource Management Office (MHRMO)',
    '------------------------------------------------------------',
    `${stageBadge}`,
    `${stageHeadline}`,
    '',
    `Tracking / App ID : ${req.leaveApplicationId}`,
    `Form Type         : ${formLabel}`,
    `Applicant         : ${req.applicantName}`,
    ...(req.officeName ? [`Office / Dept     : ${req.officeName}`] : []),
    ...(req.position ? [`Position          : ${req.position}`] : []),
    ...(req.leaveType ? [`Leave Type        : ${req.leaveType}`] : []),
    ...(req.inclusiveDates ? [`Inclusive Dates   : ${req.inclusiveDates}`] : []),
    ...(req.workingDays !== undefined ? [`Duration          : ${req.workingDays} working day(s)`] : []),
    ...(req.detailsOfLeave ? [`Purpose / Details : ${req.detailsOfLeave}`] : []),
    ...(req.actorName ? [`Processed By      : ${req.actorName}`] : []),
    ...(req.remarks ? [`Remarks           : ${req.remarks}`] : []),
    '',
    `Next Step: ${actionInstruction}`,
    `Portal Link: ${portalUrl}`,
    '',
    'Civil Service Commission Rule Reminder: Leave credits are deducted ONLY upon Stage 5 HR Final Recording.',
  ];

  const text = textLines.join('\n');
  const preview = `${stageBadge} — ${req.applicantName} (${req.leaveType || formLabel}, ${req.inclusiveDates || 'N/A'}) -> ${req.recipientEmail}`.slice(
    0,
    980
  );

  const html = `
<!DOCTYPE html>
<html lang="en">
  <body style="margin:0;padding:0;background-color:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;color:#0f172a;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;width:100%;background:#ffffff;border:1px solid #cbd5e1;border-radius:14px;overflow:hidden;">
            <tr>
              <td style="background:#173B67;padding:20px 24px;color:#ffffff;">
                <div style="font-size:11px;letter-spacing:1.2px;text-transform:uppercase;color:#bfdbfe;font-weight:700;">
                  Municipality of San Jose • Occidental Mindoro
                </div>
                <div style="font-size:18px;font-weight:800;margin-top:4px;">
                  SJHR201 – Leave Approval Workflow
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:22px 24px;">
                <div style="display:inline-block;background:#DCEBFA;color:#173B67;font-size:11px;font-weight:800;padding:4px 10px;border-radius:999px;letter-spacing:0.6px;">
                  ${escapeHtml(stageBadge)}
                </div>
                <h2 style="margin:12px 0 8px 0;font-size:16px;color:#0f172a;">
                  ${escapeHtml(stageHeadline)}
                </h2>
                <p style="margin:0 0 16px 0;font-size:13px;line-height:1.5;color:#475569;">
                  ${escapeHtml(actionInstruction)}
                </p>

                <table role="presentation" width="100%" cellspacing="0" cellpadding="8" style="border:1px solid #e2e8f0;border-radius:10px;background:#f8fafc;font-size:12px;">
                  <tr>
                    <td style="color:#64748b;font-weight:700;width:36%;border-bottom:1px solid #e2e8f0;">Application ID</td>
                    <td style="color:#173B67;font-weight:800;font-family:monospace;border-bottom:1px solid #e2e8f0;">${escapeHtml(req.leaveApplicationId)}</td>
                  </tr>
                  <tr>
                    <td style="color:#64748b;font-weight:700;border-bottom:1px solid #e2e8f0;">Form Type</td>
                    <td style="color:#0f172a;font-weight:600;border-bottom:1px solid #e2e8f0;">${escapeHtml(formLabel)}</td>
                  </tr>
                  <tr>
                    <td style="color:#64748b;font-weight:700;border-bottom:1px solid #e2e8f0;">Personnel</td>
                    <td style="color:#0f172a;font-weight:700;border-bottom:1px solid #e2e8f0;">${escapeHtml(req.applicantName)}</td>
                  </tr>
                  ${
                    req.officeName
                      ? `<tr>
                    <td style="color:#64748b;font-weight:700;border-bottom:1px solid #e2e8f0;">Office / Dept</td>
                    <td style="color:#0f172a;border-bottom:1px solid #e2e8f0;">${escapeHtml(req.officeName)}</td>
                  </tr>`
                      : ''
                  }
                  ${
                    req.leaveType
                      ? `<tr>
                    <td style="color:#64748b;font-weight:700;border-bottom:1px solid #e2e8f0;">Leave Type</td>
                    <td style="color:#0f172a;font-weight:700;border-bottom:1px solid #e2e8f0;">${escapeHtml(req.leaveType)}</td>
                  </tr>`
                      : ''
                  }
                  ${
                    req.inclusiveDates
                      ? `<tr>
                    <td style="color:#64748b;font-weight:700;border-bottom:1px solid #e2e8f0;">Inclusive Dates</td>
                    <td style="color:#0f172a;font-weight:600;border-bottom:1px solid #e2e8f0;">${escapeHtml(req.inclusiveDates)} (${escapeHtml(String(req.workingDays ?? ''))} day/s)</td>
                  </tr>`
                      : ''
                  }
                  ${
                    req.detailsOfLeave
                      ? `<tr>
                    <td style="color:#64748b;font-weight:700;border-bottom:1px solid #e2e8f0;">Purpose / Details</td>
                    <td style="color:#0f172a;border-bottom:1px solid #e2e8f0;">${escapeHtml(req.detailsOfLeave)}</td>
                  </tr>`
                      : ''
                  }
                  ${
                    req.actorName
                      ? `<tr>
                    <td style="color:#64748b;font-weight:700;border-bottom:1px solid #e2e8f0;">Actioned By</td>
                    <td style="color:#0f172a;border-bottom:1px solid #e2e8f0;">${escapeHtml(req.actorName)}</td>
                  </tr>`
                      : ''
                  }
                  ${
                    req.remarks
                      ? `<tr>
                    <td style="color:#64748b;font-weight:700;">Official Remarks</td>
                    <td style="color:#0f172a;font-style:italic;">"${escapeHtml(req.remarks)}"</td>
                  </tr>`
                      : ''
                  }
                </table>

                <div style="margin-top:20px;">
                  <a href="${escapeHtml(portalUrl)}" style="display:inline-block;background:#173B67;color:#ffffff;text-decoration:none;font-size:13px;font-weight:700;padding:10px 18px;border-radius:10px;">
                    Open SJHR201 Portal
                  </a>
                </div>
              </td>
            </tr>
            <tr>
              <td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:14px 24px;font-size:11px;color:#64748b;">
                Municipal Human Resource Management Office (MHRMO) • Municipality of San Jose, Occidental Mindoro
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`.trim();

  return { subject, text, html, preview };
}

export async function sendLeaveWorkflowEmail(req: LeaveWorkflowEmailRequest): Promise<EmailLog> {
  const { subject, text, html, preview } = buildLeaveWorkflowEmailContent(req);
  const dispatchResult = await sendTransactionalEmail({
    to: req.recipientEmail,
    toName: req.recipientName,
    subject,
    text,
    html,
  });

  const safeId = `EML-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

  return {
    id: safeId,
    leaveApplicationId: req.leaveApplicationId,
    workflowType: req.workflowType,
    workflowStage: req.workflowStage,
    applicantName: req.applicantName,
    recipientEmail: req.recipientEmail,
    recipientRole: req.recipientRole,
    recipientName: req.recipientName,
    subject: subject.slice(0, 240),
    bodyPreview: preview,
    provider: dispatchResult.provider,
    ...(dispatchResult.providerMessageId
      ? { providerMessageId: dispatchResult.providerMessageId }
      : {}),
    ...(dispatchResult.httpStatusCode !== undefined
      ? { httpStatusCode: dispatchResult.httpStatusCode }
      : {}),
    status: dispatchResult.status,
    ...(dispatchResult.errorMessage ? { errorMessage: dispatchResult.errorMessage.slice(0, 500) } : {}),
    triggeredByUid: req.triggeredByUid || 'system',
    triggeredByName: req.triggeredByName || req.actorName || 'SJHR201 Workflow Engine',
    createdAt: new Date().toISOString(),
  };
}
