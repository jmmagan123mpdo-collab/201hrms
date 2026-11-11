import React, { useEffect, useState } from 'react';
import { HRLoginModal } from '../auth/HRLoginModal.tsx';
import { ESSLoginModal } from '../auth/ESSLoginModal.tsx';
import { ESSRegistrationModal } from '../auth/ESSRegistrationModal.tsx';
import { 
  Building2, 
  Users, 
  FileText, 
  ShieldCheck, 
  Calendar, 
  Clock, 
  Award, 
  ArrowRight, 
  ChevronRight,
  Sparkles,
  Lock,
  Smartphone,
  Download
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const [showHRLogin, setShowHRLogin] = useState(false);
  const [showESSLogin, setShowESSLogin] = useState(false);
  const [showESSRegister, setShowESSRegister] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<(Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> }) | null>(null);
  const [showInstallHelp, setShowInstallHelp] = useState(false);

  useEffect(() => {
    const handleInstallAvailable = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> });
    };
    window.addEventListener('beforeinstallprompt', handleInstallAvailable);
    return () => window.removeEventListener('beforeinstallprompt', handleInstallAvailable);
  }, []);

  const handleInstallApp = async () => {
    if (installPrompt) {
      await installPrompt.prompt();
      await installPrompt.userChoice;
      setInstallPrompt(null);
    } else {
      setShowInstallHelp(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      
      {/* Top Municipal Banner Header */}
      <header className="bg-white border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center space-x-3.5">
            <img 
              src="/public/assets/aistudio/logo-300x293_45c24a73.png" 
              alt="Seal of the Municipality of San Jose, Occidental Mindoro" 
              className="w-13 h-13 object-contain drop-shadow-xs"
            />
            <div>
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                Republic of the Philippines • Province of Occidental Mindoro
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-[#173B67] tracking-tight">
                MUNICIPALITY OF SAN JOSE
              </h1>
              <div className="text-xs font-semibold text-slate-600 flex items-center space-x-1.5">
                <span>Municipal Human Resource Management Office (MHRMO)</span>
              </div>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <img 
              src="/public/assets/aistudio/HR1_5214d096.png" 
              alt="MHRMO Official Logo" 
              className="h-10 w-auto object-contain"
            />
          </div>
          <button
            type="button"
            onClick={handleInstallApp}
            className="inline-flex items-center gap-2 rounded-xl bg-[#173B67] px-3.5 py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-[#122e50] transition-colors shadow-sm"
            aria-label="Install SJHR201 app"
          >
            <Download className="w-4 h-4" />
            <span>Install App</span>
          </button>
        </div>
      </header>

      {/* Hero Section with Official Title and Portals */}
      <main className="flex-1 flex flex-col justify-center max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 w-full">
        
        {/* System Title Banner */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#173B67] text-xs font-bold tracking-wide uppercase mb-3">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-700" />
            <span>Official LGU Personnel Information System</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
            SJHR201 – Human Resource Management System
          </h2>
          
          <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
            Centralized 201 Personnel Records, Two-Way Digital Document Management, Leave & Wellness Applications, and Employee Self-Service for the Local Government Unit of San Jose.
          </p>
        </div>

        {/* The Two Approved Portals - Side-by-Side Tiles on Mobile and Desktop */}
        <div className="grid grid-cols-2 gap-2.5 sm:gap-8 max-w-4xl mx-auto w-full">
          
          {/* Portal 1: HR MANAGEMENT (Approved Soft Blue Theme) */}
          <div className="bg-white rounded-2xl border-2 border-slate-200/90 shadow-sm sm:shadow-lg hover:shadow-xl hover:border-[#173B67] transition-all p-3.5 sm:p-8 flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-20 sm:w-32 h-20 sm:h-32 bg-[#DCEBFA]/40 rounded-full blur-2xl -mr-6 sm:-mr-10 -mt-6 sm:-mt-10 pointer-events-none"></div>

            <div>
              <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-[#173B67] text-white flex items-center justify-center shadow-md mb-3 sm:mb-5 group-hover:scale-105 transition-transform">
                <Building2 className="w-5 h-5 sm:w-7 sm:h-7" />
              </div>

              <div className="inline-block px-2 py-0.5 rounded-full text-[9px] sm:text-[11px] font-bold uppercase tracking-wider bg-blue-100 text-[#173B67] mb-1.5 sm:mb-2">
                <span className="hidden sm:inline">Administrative Portal</span>
                <span className="sm:hidden">Admin Portal</span>
              </div>

              <h3 className="text-sm sm:text-2xl font-black sm:font-bold text-slate-900 tracking-tight leading-tight">
                HR MANAGEMENT
              </h3>

              <p className="mt-1 sm:mt-2 text-[10px] sm:text-sm text-slate-600 leading-snug sm:leading-relaxed">
                <span className="hidden sm:inline">Dedicated workspace for the HR Administrator, HR Staff (Officers/Encoders), Payroll Personnel, and System Developer.</span>
                <span className="sm:hidden">For HR Admins, Staff Officers, Payroll, and System Developer.</span>
              </p>

              {/* Feature Highlights */}
              <ul className="mt-2.5 sm:mt-5 space-y-1 sm:space-y-2 text-[10px] sm:text-xs text-slate-600 font-medium">
                <li className="flex items-center space-x-1.5 sm:space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#173B67] shrink-0"></span>
                  <span className="truncate">Employee Masterlist</span>
                </li>
                <li className="flex items-center space-x-1.5 sm:space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#173B67] shrink-0"></span>
                  <span className="truncate">15-Category 201 Files</span>
                </li>
                <li className="flex items-center space-x-1.5 sm:space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#173B67] shrink-0"></span>
                  <span className="truncate">Requests & Approvals</span>
                </li>
                <li className="flex items-center space-x-1.5 sm:space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#173B67] shrink-0"></span>
                  <span className="truncate">Leave & Wellness Forms</span>
                </li>
              </ul>
            </div>

            <div className="mt-3.5 sm:mt-8 pt-3 sm:pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowHRLogin(true)}
                className="w-full py-2.5 sm:py-3 px-2 sm:px-5 bg-[#173B67] hover:bg-[#122e50] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center space-x-1 sm:space-x-2 group-hover:translate-x-0.5 cursor-pointer text-center"
              >
                <span className="hidden sm:inline">Enter HR Management</span>
                <span className="sm:hidden">Enter HR</span>
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              </button>
              <p className="text-[9px] sm:text-[11px] text-center text-slate-400 mt-1.5 sm:mt-2">
                <span className="hidden sm:inline">Developer signs in through HR Management</span>
                <span className="sm:hidden">Developer & HR access</span>
              </p>
            </div>
          </div>

          {/* Portal 2: EMPLOYEE SELF-SERVICE (Approved Orange Theme) */}
          <div className="bg-white rounded-2xl border-2 border-slate-200/90 shadow-sm sm:shadow-lg hover:shadow-xl hover:border-[#F28C28] transition-all p-3.5 sm:p-8 flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-20 sm:w-32 h-20 sm:h-32 bg-orange-100/50 rounded-full blur-2xl -mr-6 sm:-mr-10 -mt-6 sm:-mt-10 pointer-events-none"></div>

            <div>
              <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-[#F28C28] text-white flex items-center justify-center shadow-md mb-3 sm:mb-5 group-hover:scale-105 transition-transform">
                <Users className="w-5 h-5 sm:w-7 sm:h-7" />
              </div>

              <div className="inline-block px-2 py-0.5 rounded-full text-[9px] sm:text-[11px] font-bold uppercase tracking-wider bg-orange-100 text-[#F28C28] mb-1.5 sm:mb-2">
                <span className="hidden sm:inline">Personnel Portal</span>
                <span className="sm:hidden">Staff Portal</span>
              </div>

              <h3 className="text-sm sm:text-2xl font-black sm:font-bold text-slate-900 tracking-tight leading-tight">
                EMPLOYEE SELF-SERVICE
              </h3>

              <p className="mt-1 sm:mt-2 text-[10px] sm:text-sm text-slate-600 leading-snug sm:leading-relaxed">
                <span className="hidden sm:inline">Direct self-service portal for municipal employees across all classifications (Permanent, Casual, JO, COS, Elective).</span>
                <span className="sm:hidden">For all municipal staff (Permanent, Casual, JO, COS, Elective).</span>
              </p>

              {/* Feature Highlights */}
              <ul className="mt-2.5 sm:mt-5 space-y-1 sm:space-y-2 text-[10px] sm:text-xs text-slate-600 font-medium">
                <li className="flex items-center space-x-1.5 sm:space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#F28C28] shrink-0"></span>
                  <span className="truncate">Personal 201 Files</span>
                </li>
                <li className="flex items-center space-x-1.5 sm:space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#F28C28] shrink-0"></span>
                  <span className="truncate">Camera Doc Scanner</span>
                </li>
                <li className="flex items-center space-x-1.5 sm:space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#F28C28] shrink-0"></span>
                  <span className="truncate">Respond to HR Requests</span>
                </li>
                <li className="flex items-center space-x-1.5 sm:space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#F28C28] shrink-0"></span>
                  <span className="truncate">File Leave & Wellness</span>
                </li>
              </ul>
            </div>

            <div className="mt-3.5 sm:mt-8 pt-3 sm:pt-4 border-t border-slate-100 space-y-1.5 sm:space-y-2">
              <button
                type="button"
                onClick={() => setShowESSLogin(true)}
                className="w-full py-2.5 sm:py-3 px-2 sm:px-5 bg-[#F28C28] hover:bg-[#d9771a] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center space-x-1 sm:space-x-2 group-hover:translate-x-0.5 cursor-pointer text-center"
              >
                <span className="hidden sm:inline">Enter Employee Self-Service</span>
                <span className="sm:hidden">Enter ESS</span>
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              </button>

              <button
                type="button"
                onClick={() => setShowESSRegister(true)}
                className="w-full py-1.5 sm:py-2 px-1 sm:px-4 bg-orange-50 hover:bg-orange-100 text-[#F28C28] font-bold text-[10px] sm:text-xs rounded-xl border border-orange-200 transition-colors flex items-center justify-center space-x-1 cursor-pointer text-center"
              >
                <span className="hidden sm:inline">First time? Register an ESS Account</span>
                <span className="sm:hidden">Register Account</span>
                <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
              </button>
            </div>
          </div>

        </div>

        {/* Government Footer Notice */}
        <div className="mt-14 pt-8 border-t border-slate-200 text-center text-xs text-slate-500">
          <p className="font-semibold text-slate-700">
            Municipality of San Jose • Occidental Mindoro, Philippines
          </p>
          <p className="mt-1 text-[11px] text-slate-400">
            Compliant with Civil Service Commission (CSC) Guidelines, DILG Directives, and Data Privacy Act of 2012 (RA 10173).
          </p>
        </div>

      </main>

      {showInstallHelp && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/50 p-4" role="dialog" aria-modal="true" aria-label="Install SJHR201">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl">
            <h2 className="text-base font-bold text-[#173B67]">Install SJHR201</h2>
            <p className="mt-2 text-sm text-slate-600">
              {(/iphone|ipad|ipod/i.test(navigator.userAgent))
                ? 'On your iPhone or iPad, tap Share in Safari, then choose “Add to Home Screen”.'
                : 'Use your browser menu and choose “Install app” or “Install this site as an app”. If the option is unavailable, check that you are using a supported browser and a secure HTTPS address.'}
            </p>
            <button type="button" onClick={() => setShowInstallHelp(false)} className="mt-4 w-full rounded-xl bg-[#173B67] px-4 py-2.5 text-sm font-semibold text-white">Close</button>
          </div>
        </div>
      )}

      {/* Modals */}
      <HRLoginModal isOpen={showHRLogin} onClose={() => setShowHRLogin(false)} />
      <ESSLoginModal 
        isOpen={showESSLogin} 
        onClose={() => setShowESSLogin(false)} 
        onOpenRegister={() => setShowESSRegister(true)} 
      />
      <ESSRegistrationModal 
        isOpen={showESSRegister} 
        onClose={() => setShowESSRegister(false)} 
        onOpenLogin={() => setShowESSLogin(true)} 
      />

    </div>
  );
};
