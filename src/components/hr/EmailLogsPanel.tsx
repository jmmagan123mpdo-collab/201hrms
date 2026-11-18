import React, { useMemo, useState } from 'react';
import { useData } from '../../context/DataContext.tsx';
import { useAuth } from '../../context/AuthContext.tsx';
import { EmailDispatchStatus, EmailLog } from '../../types/index.ts';
import {
  Mail,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Search,
  Database,
  Clock,
  Send,
  ShieldAlert,
  CloudOff,
  RotateCw
} from 'lucide-react';

interface EmailLogsPanelProps {
  compact?: boolean;
}

export const EmailLogsPanel: React.FC<EmailLogsPanelProps> = ({ compact = false }) => {
  const {
    emailLogs,
    emailServiceHealth,
    firebaseUser,
    firestoreSyncError,
    refreshEmailServiceHealth,
    retryEmailLog,
    clearFirestoreSyncError
  } = useData();
  const { loginWithGoogle } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | EmailDispatchStatus>('all');
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const [isRefreshingHealth, setIsRefreshingHealth] = useState(false);
  const [isConnectingGoogle, setIsConnectingGoogle] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<{ type: 'success' | 'warning' | 'error'; message: string } | null>(null);

  const filteredLogs = useMemo(() => {
    return emailLogs.filter((log) => {
      if (statusFilter !== 'all' && log.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const hay = [
          log.id,
          log.leaveApplicationId,
          log.recipientEmail,
          log.recipientRole,
          log.applicantName || '',
          log.subject,
          log.workflowStage,
          log.provider
        ]
          .join(' ')
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [emailLogs, statusFilter, searchQuery]);

  const counts = useMemo(() => {
    return {
      total: emailLogs.length,
      sent: emailLogs.filter((l) => l.status === 'sent').length,
      failed: emailLogs.filter((l) => l.status === 'failed').length,
      unconfigured: emailLogs.filter((l) => l.status === 'unconfigured' || l.status === 'skipped').length
    };
  }, [emailLogs]);

  const handleRefreshHealth = async () => {
    setIsRefreshingHealth(true);
    try {
      await refreshEmailServiceHealth();
    } finally {
      setIsRefreshingHealth(false);
    }
  };

  const handleConnectGoogle = async () => {
    setIsConnectingGoogle(true);
    setActionFeedback(null);
    try {
      const res = await loginWithGoogle('hr');
      if (!res.success) {
        setActionFeedback({ type: 'error', message: res.error || 'Google Sign-In failed.' });
      } else {
        setActionFeedback({ type: 'success', message: 'Connected to Cloud Firestore Email Log stream.' });
      }
    } finally {
      setIsConnectingGoogle(false);
    }
  };

  const handleRetry = async (log: EmailLog) => {
    setRetryingId(log.id);
    setActionFeedback(null);
    try {
      const result = await retryEmailLog(log.id);
      if (!result) return;
      if (result.status === 'sent') {
        setActionFeedback({
          type: 'success',
          message: `Re-sent email (${result.id}) to ${result.recipientEmail} via ${result.provider}.`
        });
      } else if (result.status === 'unconfigured') {
        setActionFeedback({
          type: 'warning',
          message: `Retry logged (${result.id}), but server email provider credentials are still unconfigured.`
        });
      } else {
        setActionFeedback({
          type: 'error',
          message: `Retry attempt (${result.id}) status: ${result.status}${result.errorMessage ? ` — ${result.errorMessage}` : ''}`
        });
      }
    } finally {
      setRetryingId(null);
    }
  };

  const formatStage = (stage: EmailLog['workflowStage']) => {
    switch (stage) {
      case 'stage_1_submitted':
        return 'Stage 1 -> Supervisor';
      case 'stage_2_supervisor_approved':
        return 'Stage 2 -> Mayor';
      case 'stage_2_supervisor_disapproved':
        return 'Stage 2 Disapproved';
      case 'stage_3_mayor_approved':
        return 'Stage 3 -> HR Final';
      case 'stage_3_mayor_disapproved':
        return 'Stage 3 Disapproved';
      case 'stage_5_hr_finalized':
        return 'Stage 5 Finalized';
      case 'stage_5_hr_returned':
        return 'Stage 4/5 Returned';
      case 'test_dispatch':
        return 'Routing Test';
      default:
        return stage;
    }
  };

  const renderStatusBadge = (status: EmailDispatchStatus) => {
    switch (status) {
      case 'sent':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-bold uppercase">
            <CheckCircle2 className="w-3 h-3" />
            <span>Sent</span>
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200 text-[10px] font-bold uppercase">
            <XCircle className="w-3 h-3" />
            <span>Failed</span>
          </span>
        );
      case 'unconfigured':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200 text-[10px] font-bold uppercase">
            <AlertTriangle className="w-3 h-3" />
            <span>Unconfigured</span>
          </span>
        );
      case 'skipped':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-bold uppercase">
            <Clock className="w-3 h-3" />
            <span>Skipped</span>
          </span>
        );
    }
  };

  const providerLabel =
    emailServiceHealth?.configuredProvider === 'sendgrid'
      ? 'SendGrid v3 API Active'
      : emailServiceHealth?.configuredProvider === 'mailgun'
      ? `Mailgun v3 API (${emailServiceHealth.mailgunDomain || 'Configured'})`
      : 'No Transactional Provider Configured';

  return (
    <div className="space-y-3 text-xs">
      {/* Provider & Firestore Sync Status Header */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div
          className={`p-3.5 rounded-xl border flex items-start justify-between gap-3 ${
            emailServiceHealth?.configuredProvider && emailServiceHealth.configuredProvider !== 'none'
              ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
              : 'bg-amber-50/80 border-amber-200 text-amber-950'
          }`}
        >
          <div className="flex items-start space-x-2.5">
            <Send
              className={`w-4 h-4 shrink-0 mt-0.5 ${
                emailServiceHealth?.configuredProvider && emailServiceHealth.configuredProvider !== 'none'
                  ? 'text-emerald-700'
                  : 'text-amber-700'
              }`}
            />
            <div className="space-y-0.5">
              <div className="font-bold text-xs flex items-center flex-wrap gap-1.5">
                <span>Transactional Email Helper:</span>
                <span className="underline">{providerLabel}</span>
              </div>
              <p className="text-[11px] opacity-90">
                {emailServiceHealth?.configuredProvider && emailServiceHealth.configuredProvider !== 'none'
                  ? `Dispatching automated leave & wellness workflow alerts from ${emailServiceHealth.fromEmail}.`
                  : 'Server helper is online and logging dispatches. Set SENDGRID_API_KEY or MAILGUN_API_KEY + MAILGUN_DOMAIN on the server to deliver live external emails.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRefreshHealth}
            disabled={isRefreshingHealth}
            className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-[11px] flex items-center space-x-1 shrink-0 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingHealth ? 'animate-spin' : ''}`} />
            <span>Check</span>
          </button>
        </div>

        <div
          className={`p-3.5 rounded-xl border flex items-start justify-between gap-3 ${
            firebaseUser
              ? 'bg-blue-50/70 border-blue-200 text-[#173B67]'
              : 'bg-slate-50 border-slate-200 text-slate-800'
          }`}
        >
          <div className="flex items-start space-x-2.5">
            {firebaseUser ? (
              <Database className="w-4 h-4 shrink-0 mt-0.5 text-[#173B67]" />
            ) : (
              <CloudOff className="w-4 h-4 shrink-0 mt-0.5 text-slate-500" />
            )}
            <div className="space-y-0.5">
              <div className="font-bold text-xs">
                {firebaseUser
                  ? `Firestore Email Log Synced (${firebaseUser.email || firebaseUser.uid})`
                  : 'Cloud Firestore Sync Paused (Local Session Only)'}
              </div>
              <p className="text-[11px] opacity-85">
                {firebaseUser
                  ? 'Immutable emailLogs collection is streaming in real time.'
                  : 'Sign in with Google (Firebase Auth) to persist and query immutable emailLogs in Cloud Firestore.'}
              </p>
            </div>
          </div>

          {!firebaseUser && (
            <button
              type="button"
              onClick={handleConnectGoogle}
              disabled={isConnectingGoogle}
              className="px-3 py-1.5 rounded-lg bg-[#173B67] hover:bg-[#122e50] text-white font-bold text-[11px] shrink-0 cursor-pointer disabled:opacity-60"
            >
              {isConnectingGoogle ? 'Connecting...' : 'Sync Google'}
            </button>
          )}
        </div>
      </div>

      {/* Firestore Error Alert */}
      {firestoreSyncError && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 flex items-start justify-between gap-2">
          <div className="flex items-start space-x-2">
            <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Cloud Firestore Sync Error</span>
              <span className="text-[11px] font-mono break-all">{firestoreSyncError}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={clearFirestoreSyncError}
            className="text-[11px] font-bold text-rose-700 hover:underline shrink-0 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Action Feedback Alert */}
      {actionFeedback && (
        <div
          className={`p-3 rounded-xl border text-xs font-medium flex items-center justify-between ${
            actionFeedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : actionFeedback.type === 'warning'
              ? 'bg-amber-50 border-amber-200 text-amber-900'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <span>{actionFeedback.message}</span>
          <button
            type="button"
            onClick={() => setActionFeedback(null)}
            className="font-bold hover:underline ml-3 cursor-pointer"
          >
            Close
          </button>
        </div>
      )}

      {/* KPI Summary Cards */}
      {!compact && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Total Email Events
            </span>
            <div className="text-xl font-extrabold text-[#173B67] mt-1 font-mono">{counts.total}</div>
          </div>
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Delivered (Sent)
            </span>
            <div className="text-xl font-extrabold text-emerald-600 mt-1 font-mono">{counts.sent}</div>
          </div>
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Unconfigured / Skipped
            </span>
            <div className="text-xl font-extrabold text-amber-600 mt-1 font-mono">{counts.unconfigured}</div>
          </div>
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Failed Dispatches
            </span>
            <div className="text-xl font-extrabold text-rose-600 mt-1 font-mono">{counts.failed}</div>
          </div>
        </div>
      )}

      {/* Search & Status Filter Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by application ID, recipient email, applicant, or subject..."
            className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#173B67] focus:border-transparent outline-none"
          />
        </div>

        <div className="flex items-center space-x-1 overflow-x-auto">
          {(['all', 'sent', 'failed', 'unconfigured', 'skipped'] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] capitalize cursor-pointer transition-colors ${
                statusFilter === st
                  ? 'bg-[#173B67] text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Email Log Table / List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Mail className="w-4 h-4 text-[#173B67]" />
            <span className="font-bold text-slate-900">
              Workflow Email Delivery Log ({filteredLogs.length})
            </span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">Collection: emailLogs</span>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="p-8 text-center text-slate-400 space-y-1">
            <Mail className="w-8 h-8 mx-auto text-slate-300" />
            <p className="font-semibold text-slate-600">No workflow email logs recorded yet.</p>
            <p className="text-[11px]">
              Submit or approve a CSC Form 6 Leave / Wellness application, or send a Verification Test Email in Developer Control Center.
            </p>
          </div>
        ) : (
          <>
            {/* Mobile Card List */}
            <div className="block md:hidden divide-y divide-slate-100">
              {filteredLogs.map((log) => (
                <div key={log.id} className="p-3.5 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-mono font-bold text-[#173B67] text-[11px]">{log.leaveApplicationId}</span>
                      <span className="block font-bold text-slate-900 mt-0.5">{log.recipientEmail}</span>
                      <span className="text-[10px] text-slate-500 uppercase font-semibold">
                        Role: {log.recipientRole.replace('_', ' ')} • {formatStage(log.workflowStage)}
                      </span>
                    </div>
                    {renderStatusBadge(log.status)}
                  </div>

                  <p className="text-[11px] text-slate-700 font-medium">{log.subject}</p>

                  {log.errorMessage && (
                    <p className="text-[10px] text-rose-700 bg-rose-50 p-2 rounded-lg border border-rose-100">
                      {log.errorMessage}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                    <span className="font-mono">{new Date(log.createdAt).toLocaleString()}</span>
                    {log.status !== 'sent' && (
                      <button
                        type="button"
                        onClick={() => handleRetry(log)}
                        disabled={retryingId === log.id}
                        className="px-2.5 py-1 bg-[#173B67] text-white font-bold rounded-lg inline-flex items-center space-x-1 cursor-pointer"
                      >
                        <RotateCw className={`w-3 h-3 ${retryingId === log.id ? 'animate-spin' : ''}`} />
                        <span>Retry</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[#DCEBFA]/70 text-[#173B67] uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3 font-bold">Timestamp & Log ID</th>
                    <th className="py-2.5 px-3 font-bold">Workflow Stage</th>
                    <th className="py-2.5 px-3 font-bold">Recipient</th>
                    <th className="py-2.5 px-3 font-bold">Subject & Diagnostics</th>
                    <th className="py-2.5 px-3 font-bold">Provider / Sync</th>
                    <th className="py-2.5 px-3 font-bold">Status</th>
                    <th className="py-2.5 px-3 font-bold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/70 transition-colors align-top">
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="font-mono font-bold text-slate-800 text-[11px]">{log.id}</div>
                        <div className="text-[10px] text-slate-500">{new Date(log.createdAt).toLocaleString()}</div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-mono font-bold text-[#173B67] block">{log.leaveApplicationId}</span>
                        <span className="inline-block mt-0.5 px-2 py-0.5 rounded bg-blue-50 text-[#173B67] font-semibold text-[10px]">
                          {formatStage(log.workflowStage)}
                        </span>
                        {log.applicantName && (
                          <span className="block text-[10px] text-slate-500 mt-0.5">{log.applicantName}</span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-mono font-semibold text-slate-900">{log.recipientEmail}</div>
                        <span className="text-[10px] uppercase font-bold text-slate-500">
                          {log.recipientRole.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-3 max-w-xs">
                        <div className="font-semibold text-slate-800 line-clamp-2">{log.subject}</div>
                        {log.errorMessage && (
                          <div className="mt-1 text-[10px] text-rose-700 bg-rose-50 border border-rose-100 rounded px-2 py-1">
                            {log.errorMessage}
                          </div>
                        )}
                        {log.providerMessageId && (
                          <div className="mt-0.5 text-[10px] font-mono text-emerald-700 truncate">
                            Msg ID: {log.providerMessageId}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="font-mono font-bold uppercase text-[10px] text-slate-700 block">
                          {log.provider}
                        </span>
                        <span
                          className={`text-[10px] font-semibold ${
                            log.persistedToFirestore ? 'text-blue-700' : 'text-slate-400'
                          }`}
                        >
                          {log.persistedToFirestore ? 'Firestore Synced' : 'Local Cache'}
                        </span>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">{renderStatusBadge(log.status)}</td>
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        {log.status !== 'sent' ? (
                          <button
                            type="button"
                            onClick={() => handleRetry(log)}
                            disabled={retryingId === log.id}
                            className="px-2.5 py-1 bg-[#173B67] hover:bg-[#122e50] text-white font-bold rounded-lg inline-flex items-center space-x-1 cursor-pointer disabled:opacity-60"
                          >
                            <RotateCw className={`w-3 h-3 ${retryingId === log.id ? 'animate-spin' : ''}`} />
                            <span>{retryingId === log.id ? 'Sending...' : 'Retry'}</span>
                          </button>
                        ) : (
                          <span className="text-[10px] text-emerald-700 font-semibold">Dispatched</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
