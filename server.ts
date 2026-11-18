import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  getEmailServiceStatus,
  sendLeaveWorkflowEmail,
  type LeaveWorkflowEmailRequest,
} from './server/emailService.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  // Server health & transactional email provider capability check (never exposes API keys)
  app.get('/api/health', (_req, res) => {
    res.json({
      ok: true,
      service: 'SJHR201-HRMIS',
      emailService: getEmailServiceStatus(),
      timestamp: new Date().toISOString(),
    });
  });

  // Automated Leave & Wellness Workflow Email Dispatch Endpoint
  app.post('/api/emails/leave-workflow', async (req, res) => {
    try {
      const body = (req.body || {}) as Partial<LeaveWorkflowEmailRequest>;

      if (!body.leaveApplicationId || !body.workflowStage || !body.recipientEmail || !body.recipientRole) {
        res.status(400).json({
          success: false,
          error:
            'Missing required fields: leaveApplicationId, workflowStage, recipientEmail, recipientRole.',
        });
        return;
      }

      const emailLog = await sendLeaveWorkflowEmail({
        leaveApplicationId: String(body.leaveApplicationId),
        workflowType: body.workflowType || 'CSC_FORM_6',
        workflowStage: body.workflowStage,
        applicantName: body.applicantName || 'LGU San Jose Personnel',
        officeName: body.officeName,
        position: body.position,
        leaveType: body.leaveType,
        inclusiveDates: body.inclusiveDates,
        workingDays: body.workingDays,
        detailsOfLeave: body.detailsOfLeave,
        recipientEmail: String(body.recipientEmail).trim(),
        recipientRole: body.recipientRole,
        recipientName: body.recipientName,
        actorName: body.actorName,
        remarks: body.remarks,
        triggeredByUid: body.triggeredByUid || 'system',
        triggeredByName: body.triggeredByName,
        appUrl: body.appUrl || `${req.protocol}://${req.get('host')}`,
      });

      res.json({
        success: emailLog.status === 'sent',
        emailLog,
      });
    } catch (error: unknown) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal email dispatch error',
      });
    }
  });

  // Verification Test Email Dispatch Endpoint (for Developer Control Center)
  app.post('/api/emails/test', async (req, res) => {
    try {
      const body = (req.body || {}) as {
        recipientEmail?: string;
        recipientRole?: 'supervisor' | 'mayor' | 'hr_final_reviewer' | 'test';
        recipientName?: string;
        triggeredByUid?: string;
        triggeredByName?: string;
      };

      if (!body.recipientEmail) {
        res.status(400).json({ success: false, error: 'recipientEmail is required.' });
        return;
      }

      const emailLog = await sendLeaveWorkflowEmail({
        leaveApplicationId: `TEST-${new Date().getFullYear()}`,
        workflowType: 'SYSTEM_TEST',
        workflowStage: 'test_dispatch',
        applicantName: 'SJHR201 Routing Verification',
        officeName: 'Municipal Human Resource Management Office',
        leaveType: 'Routing Verification',
        inclusiveDates: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }),
        workingDays: 1,
        detailsOfLeave: 'Automated transactional email delivery verification for Leave Approval Routing.',
        recipientEmail: String(body.recipientEmail).trim(),
        recipientRole: body.recipientRole || 'test',
        recipientName: body.recipientName,
        actorName: body.triggeredByName || 'System Administrator',
        remarks: 'Test dispatch triggered from Developer Control Center.',
        triggeredByUid: body.triggeredByUid || 'system',
        triggeredByName: body.triggeredByName || 'System Administrator',
        appUrl: `${req.protocol}://${req.get('host')}`,
      });

      res.json({
        success: emailLog.status === 'sent',
        emailLog,
      });
    } catch (error: unknown) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal test email dispatch error',
      });
    }
  });

  if (!IS_PRODUCTION) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    const emailStatus = getEmailServiceStatus();
    console.log(
      `[SJHR201] Server listening on http://0.0.0.0:${PORT} (${IS_PRODUCTION ? 'production' : 'development'}) | Email Provider: ${emailStatus.configuredProvider}`
    );
  });
}

startServer();
