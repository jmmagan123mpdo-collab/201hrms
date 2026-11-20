import React, { useState } from 'react';
import { Building2, UserRound, ShieldCheck, ArrowRight, LockKeyhole, X, AlertCircle } from 'lucide-react';
import { HRLoginModal } from '../auth/HRLoginModal.tsx';
import { ESSLoginModal } from '../auth/ESSLoginModal.tsx';
import { PWAInstallButton } from '../common/PWAInstallButton.tsx';

export const LandingPage: React.FC = () => {
  const [showPersonnelGate, setShowPersonnelGate] = useState(false);
  const [showHRLogin, setShowHRLogin] = useState(false);
  const [showESSLogin, setShowESSLogin] = useState(false);
  const [accessKey, setAccessKey] = useState('');
  const [gateError, setGateError] = useState('');
  const [checkingKey, setCheckingKey] = useState(false);

  const verifyPersonnelAccess = async (event: React.FormEvent) => {
    event.preventDefault();
    setGateError('');
    setCheckingKey(true);
    try {
      const response = await fetch('/api/personnel-access/verify', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessKey })
      });
      const result = await response.json();
      if (!response.ok || !result?.authorized) {
        setGateError(result?.error || 'Access key is invalid or personnel access is not configured.');
        return;
      }
      setShowPersonnelGate(false);
      setAccessKey('');
      setShowHRLogin(true);
    } catch {
      setGateError('Personnel access verification is unavailable. Please contact the system administrator.');
    } finally {
      setCheckingKey(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      <header className="bg-[#173B67] text-white border-b border-[#102d4f]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <img src="/assets/aistudio/logo-300x293_45c24a73.png" alt="Municipality of San Jose seal" className="w-12 h-12 object-contain bg-white rounded-full p-0.5" />
            <div className="min-w-0">
              <div className="text-[10px] sm:text-xs uppercase tracking-wide text-blue-100">Municipality of San Jose • Occidental Mindoro</div>
              <div className="font-bold text-base sm:text-lg leading-tight">SJHR201 <span className="text-orange-400">HRMIS</span></div>
            </div>
          </div>
          <PWAInstallButton variant="header" />
        </div>
      </header>

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14 flex flex-col justify-center">
        <section className="text-center max-w-3xl mx-auto mb-9 sm:mb-11">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[10px] sm:text-xs font-semibold uppercase tracking-wide text-[#173B67] mb-4">
            <ShieldCheck className="w-3.5 h-3.5" /> Official LGU Personnel Information System
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#173B67]">Human Resource Management System</h1>
          <p className="mt-3 text-sm sm:text-base text-slate-600">LGU San Jose • Centralized personnel records and employee services</p>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-7 max-w-5xl mx-auto w-full">
          <article className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="bg-[#173B67] text-white p-5 sm:p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center"><Building2 className="w-7 h-7" /></div>
              <div><h2 className="font-bold text-lg sm:text-xl">Authorized Personnel</h2><p className="text-xs sm:text-sm text-blue-100">HR and LGU officials</p></div>
            </div>
            <div className="p-5 sm:p-6 flex-1 flex flex-col">
              <p className="text-sm text-slate-600">Restricted access for authorized system personnel.</p>
              <ul className="mt-4 space-y-2 text-sm text-slate-700">
                {['HR Administrator and HR Staff','Payroll Officer and System Developer','Mayor, Department Heads and Division Heads'].map(x => <li key={x} className="flex gap-2"><span className="text-[#173B67] font-bold">✓</span>{x}</li>)}
              </ul>
              <button onClick={() => { setGateError(''); setShowPersonnelGate(true); }} className="mt-6 w-full rounded-lg bg-[#173B67] hover:bg-[#102d4f] text-white font-semibold text-sm py-3 px-4 flex items-center justify-center gap-2">
                <LockKeyhole className="w-4 h-4" /> Authorized Personnel Access <ArrowRight className="w-4 h-4" />
              </button>
              <p className="text-[11px] text-center text-slate-400 mt-2">Personnel access key and individual account login required</p>
            </div>
          </article>

          <article className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="bg-[#F28C28] text-white p-5 sm:p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-white/15 flex items-center justify-center"><UserRound className="w-7 h-7" /></div>
              <div><h2 className="font-bold text-lg sm:text-xl">Employee Self-Service</h2><p className="text-xs sm:text-sm text-orange-50">For LGU San Jose employees</p></div>
            </div>
            <div className="p-5 sm:p-6 flex-1 flex flex-col">
              <p className="text-sm text-slate-600">Securely access your own HR information and employee services.</p>
              <ul className="mt-4 space-y-2 text-sm text-slate-700">
                {['View personal information and 201 files','Submit leave and document requests','Access payslips and performance records'].map(x => <li key={x} className="flex gap-2"><span className="text-[#F28C28] font-bold">✓</span>{x}</li>)}
              </ul>
              <button onClick={() => setShowESSLogin(true)} className="mt-6 w-full rounded-lg bg-[#F28C28] hover:bg-[#dc7617] text-white font-semibold text-sm py-3 px-4 flex items-center justify-center gap-2">
                Employee Sign In <ArrowRight className="w-4 h-4" />
              </button>
              <p className="text-[11px] text-center text-slate-400 mt-2">Accounts are provisioned or verified by HR. Public registration is disabled.</p>
            </div>
          </article>
        </section>

        <section className="mt-7 max-w-5xl mx-auto w-full bg-white border border-slate-200 rounded-xl p-4 sm:px-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div><h3 className="font-semibold text-sm">Install SJHR201 on your device</h3><p className="text-xs text-slate-500 mt-0.5">Use the app on supported desktop and mobile devices.</p></div>
          <PWAInstallButton variant="hero" />
        </section>
      </main>

      <footer className="bg-[#173B67] text-white px-4 py-4 text-center text-xs">
        Municipality of San Jose • Occidental Mindoro, Philippines <span className="text-blue-200">| SJHR201 HRMIS</span>
      </footer>

      {showPersonnelGate && <div className="fixed inset-0 z-[100] bg-slate-950/60 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="personnel-gate-title">
        <form onSubmit={verifyPersonnelAccess} className="w-full max-w-md bg-white rounded-xl shadow-2xl p-6 relative">
          <button type="button" onClick={() => setShowPersonnelGate(false)} className="absolute right-4 top-4 text-slate-400 hover:text-slate-700" aria-label="Close"><X className="w-5 h-5" /></button>
          <div className="w-11 h-11 rounded-lg bg-blue-50 text-[#173B67] flex items-center justify-center mb-4"><LockKeyhole className="w-6 h-6" /></div>
          <h2 id="personnel-gate-title" className="text-xl font-bold text-[#173B67]">Authorized Personnel Access</h2>
          <p className="text-sm text-slate-500 mt-1">Enter the personnel access key to continue to individual account sign-in.</p>
          <label className="block text-xs font-semibold text-slate-700 mt-5 mb-1.5" htmlFor="personnel-key">Personnel Access Key</label>
          <input id="personnel-key" type="password" autoComplete="current-password" value={accessKey} onChange={e => setAccessKey(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-200 focus:border-[#173B67]" placeholder="Enter access key" required />
          {gateError && <div className="mt-3 flex gap-2 text-xs text-red-700 bg-red-50 rounded-lg p-3"><AlertCircle className="w-4 h-4 shrink-0" />{gateError}</div>}
          <button disabled={checkingKey || !accessKey.trim()} className="mt-5 w-full bg-[#173B67] disabled:opacity-50 text-white rounded-lg py-3 font-semibold text-sm">{checkingKey ? 'Verifying…' : 'Continue to Personnel Login'}</button>
        </form>
      </div>}

      <HRLoginModal isOpen={showHRLogin} onClose={() => setShowHRLogin(false)} />
      <ESSLoginModal isOpen={showESSLogin} onClose={() => setShowESSLogin(false)} onOpenRegister={() => {}} />
    </div>
  );
};
