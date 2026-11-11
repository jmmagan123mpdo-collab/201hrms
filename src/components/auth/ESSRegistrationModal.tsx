import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useData } from '../../context/DataContext.tsx';
import { Mail, User, Lock, CheckCircle2, ShieldAlert, ArrowRight, X, Info } from 'lucide-react';

interface ESSRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenLogin: () => void;
}

export const ESSRegistrationModal: React.FC<ESSRegistrationModalProps> = ({ isOpen, onClose, onOpenLogin }) => {
  const { registerESS } = useAuth();
  const { employees } = useData();

  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [matchedEmployeeName, setMatchedEmployeeName] = useState('');
  const [permanentId, setPermanentId] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  // Step 1: Verify email with HR personnel records
  const handleVerifyEmail = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanEmail = email.trim().toLowerCase();
    const matched = employees.find(emp => emp.email.toLowerCase() === cleanEmail);

    if (!matched) {
      setErrorMessage(
        'This email address is not recorded in the official HR personnel registry. Please submit your active email to the Human Resource Office (MHRMO) for profile encoding before registering.'
      );
      return;
    }

    if (matched.essRegistered) {
      setErrorMessage(
        `An ESS account is already registered for this personnel record (${matched.firstName} ${matched.lastName}). Please use the ESS Login portal or password recovery.`
      );
      return;
    }

    setMatchedEmployeeName(`${matched.firstName} ${matched.lastName} (${matched.position} - ${matched.officeName})`);
    setPermanentId(matched.id);
    
    // Auto-suggest a clean username
    const suggestedUsername = (matched.firstName.charAt(0) + matched.lastName.replace(/[^a-zA-Z]/g, '')).toLowerCase();
    setUsername(suggestedUsername);
    setStep(2);
  };

  // Step 2: Finalize credentials & link to permanent ID
  const handleFinalize = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await registerESS(email, username, password);
      if (!res.success) {
        setErrorMessage(res.error || 'Failed to register ESS account.');
      } else {
        setIsSuccess(true);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred during account creation.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestEmailFill = (testEmail: string) => {
    setEmail(testEmail);
    setErrorMessage('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl max-w-lg w-full border border-orange-100 overflow-hidden max-h-[94vh] flex flex-col">
        
        {/* Mobile Drag Handle */}
        <div className="sm:hidden pt-2 pb-1 bg-[#F28C28] flex justify-center shrink-0">
          <div className="w-10 h-1 bg-white/40 rounded-full"></div>
        </div>

        {/* Header */}
        <div className="bg-[#F28C28] px-5 sm:px-6 py-4 sm:py-5 text-white relative shrink-0">
          <button 
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center absolute top-2 right-2 sm:top-4 sm:right-4 text-orange-100 hover:text-white rounded-xl transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-3">
            <img 
              src="/public/assets/aistudio/logo-300x293_45c24a73.png" 
              alt="San Jose Seal" 
              className="w-11 h-11 sm:w-12 sm:h-12 object-contain bg-white rounded-full p-1"
            />
            <div>
              <span className="text-[11px] font-semibold text-orange-100 uppercase tracking-widest block">
                Official Registration
              </span>
              <h2 className="text-lg font-bold tracking-tight">Create ESS Account</h2>
            </div>
          </div>
          <p className="text-xs text-orange-50/90 mt-2">
            Links your permanent internal personnel ID to Employee Self-Service.
          </p>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1">
          {isSuccess ? (
            <div className="text-center py-4 space-y-3">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-800">ESS Account Created Successfully!</h3>
              <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                Your ESS account has been verified and permanently linked to personnel record <span className="font-mono font-bold text-slate-800">{permanentId}</span>. You can now access your 201 files and HR services.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-4 px-6 py-2.5 bg-[#F28C28] hover:bg-[#d9771a] text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
              >
                Enter Employee Dashboard
              </button>
            </div>
          ) : (
            <div>
              {/* Step indicator */}
              <div className="flex items-center justify-center space-x-3 mb-5">
                <div className={`flex items-center space-x-1.5 text-xs font-bold ${step === 1 ? 'text-[#F28C28]' : 'text-emerald-600'}`}>
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 1 ? 'bg-orange-100 text-[#F28C28]' : 'bg-emerald-100 text-emerald-700'}`}>1</span>
                  <span>Verify HR Email</span>
                </div>
                <span className="text-slate-300">───</span>
                <div className={`flex items-center space-x-1.5 text-xs font-bold ${step === 2 ? 'text-[#F28C28]' : 'text-slate-400'}`}>
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 2 ? 'bg-orange-100 text-[#F28C28]' : 'bg-slate-100 text-slate-400'}`}>2</span>
                  <span>Set Username & Password</span>
                </div>
              </div>

              {errorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start space-x-2 mb-4">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                  <span className="leading-relaxed">{errorMessage}</span>
                </div>
              )}

              {step === 1 ? (
                <form onSubmit={handleVerifyEmail} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Official HR-Registered Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. clarisse.villanueva@sanjose.gov.ph"
                        className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#F28C28] focus:border-transparent outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-start space-x-2">
                    <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <div className="text-[11px] leading-relaxed">
                      <strong>Security Note:</strong> Per LGU HR guidelines, your email must already be recorded and verified in your 201 personnel profile by HR before ESS self-registration can proceed.
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 bg-[#F28C28] hover:bg-[#d9771a] text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <span>Verify with Personnel Registry</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  {/* Test suggestions */}
                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Personnel Awaiting ESS Registration:
                    </span>
                    <div className="space-y-1">
                      <button
                        type="button"
                        onClick={() => handleTestEmailFill('clarisse.villanueva@sanjose.gov.ph')}
                        className="w-full text-left p-1.5 rounded-lg border border-slate-200 text-[11px] hover:bg-slate-50 flex items-center justify-between"
                      >
                        <span className="font-medium text-slate-800">Clarisse Villanueva (Casual - MCR)</span>
                        <span className="text-orange-600 font-mono text-[10px]">clarisse.villanueva@...</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleTestEmailFill('mark.tolentino@sanjose.gov.ph')}
                        className="w-full text-left p-1.5 rounded-lg border border-slate-200 text-[11px] hover:bg-slate-50 flex items-center justify-between"
                      >
                        <span className="font-medium text-slate-800">Mark Anthony Tolentino (JO - MDRRMO)</span>
                        <span className="text-orange-600 font-mono text-[10px]">mark.tolentino@...</span>
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleFinalize} className="space-y-4">
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900">
                    <div className="font-bold flex items-center space-x-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Personnel Record Verified!</span>
                    </div>
                    <div className="mt-1 text-slate-700">
                      <strong>Name:</strong> {matchedEmployeeName}
                    </div>
                    <div className="text-slate-600 font-mono text-[11px]">
                      <strong>Permanent ID:</strong> {permanentId}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Choose ESS Username
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Choose a unique username"
                        className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#F28C28] focus:border-transparent outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Create Password
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="password"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Min. 6 chars"
                          className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#F28C28] focus:border-transparent outline-none transition-all"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="password"
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Re-enter password"
                          className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#F28C28] focus:border-transparent outline-none transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="w-1/3 py-2 px-3 border border-slate-300 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50 transition-colors"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-2/3 py-2.5 px-4 bg-[#F28C28] hover:bg-[#d9771a] text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-70 cursor-pointer"
                    >
                      <span>{isLoading ? 'Creating Account...' : 'Complete Registration'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
