import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { Lock, Mail, Eye, EyeOff, ShieldAlert, ArrowRight, UserPlus, X, HelpCircle } from 'lucide-react';

interface ESSLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenRegister: () => void;
}

export const ESSLoginModal: React.FC<ESSLoginModalProps> = ({ isOpen, onClose, onOpenRegister }) => {
  const { loginESS, loginWithGoogle } = useAuth();
  const [identifier, setIdentifier] = useState('maria.santos@sanjose.gov.ph');
  const [password, setPassword] = useState('employee2026!');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      const res = await loginESS(identifier, password, rememberMe);
      if (!res.success) {
        setErrorMessage(res.error || 'Login failed. Please verify your email or username.');
      } else {
        onClose();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred during ESS sign-in.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMessage('');
    setIsGoogleLoading(true);
    try {
      const res = await loginWithGoogle('ess');
      if (!res.success) {
        setErrorMessage(res.error || 'Google Sign-In failed.');
      } else {
        onClose();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Google Sign-In failed.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleQuickFill = (id: string, pass: string) => {
    setIdentifier(id);
    setPassword(pass);
    setErrorMessage('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl max-w-md w-full border border-orange-100 overflow-hidden max-h-[94vh] flex flex-col">
        
        {/* Mobile Drag Handle */}
        <div className="sm:hidden pt-2 pb-1 bg-[#F28C28] flex justify-center shrink-0">
          <div className="w-10 h-1 bg-white/40 rounded-full"></div>
        </div>

        {/* Header with Approved Orange ESS Theme (#F28C28) */}
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
                Employee Self-Service (ESS)
              </span>
              <h2 className="text-lg font-bold tracking-tight">Personnel Portal Login</h2>
            </div>
          </div>
          <p className="text-xs text-orange-50/90 mt-2">
            Access your 201 records, document requests, leave filings, and wellness applications.
          </p>
        </div>

        {/* Modal Content */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1">
          {showForgotPassword ? (
            <div className="space-y-4">
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-xl text-xs text-orange-950 leading-relaxed">
                <span className="font-bold block mb-1">Password Recovery:</span>
                Password reset instructions will be coordinated with your HR-verified email address on file. Please visit the HR Office or contact your department HR liaison if you have changed your email.
              </div>
              <button
                type="button"
                onClick={() => setShowForgotPassword(false)}
                className="w-full py-2 text-xs font-semibold text-[#F28C28] hover:underline"
              >
                Back to Login
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start space-x-2">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Identifier Input (Email or Username) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Registered Email Address or Username
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="e.g. maria.santos@sanjose.gov.ph or msantos"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#F28C28] focus:border-transparent outline-none transition-all"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  * Note: Employee Number is not a login credential.
                </p>
              </div>

              {/* Password Input */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-xs text-[#F28C28] hover:underline font-medium"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter ESS password"
                    className="w-full pl-9 pr-10 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#F28C28] focus:border-transparent outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center space-x-2 text-xs text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-300 text-[#F28C28] focus:ring-[#F28C28]"
                  />
                  <span>Remember Me</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || isGoogleLoading}
                className="w-full min-h-[44px] py-2.5 px-4 bg-[#F28C28] hover:bg-[#d9771a] text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-70 cursor-pointer"
              >
                <span>{isLoading ? 'Signing In...' : 'Sign In to ESS'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Google Sign-In for Cloud Firestore Sync */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading || isGoogleLoading}
                className="w-full min-h-[44px] py-2.5 px-4 bg-white hover:bg-orange-50/50 text-slate-800 font-bold text-xs rounded-xl border border-slate-300 shadow-xs transition-all flex items-center justify-center space-x-2 disabled:opacity-70 cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z" />
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24Z" />
                  <path fill="#FBBC05" d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14Z" />
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96Z" />
                </svg>
                <span>{isGoogleLoading ? 'Connecting Google Account...' : 'Continue with Google (Firestore Sync)'}</span>
              </button>

              {/* Register Callout */}
              <div className="pt-3 border-t border-slate-100 text-center">
                <p className="text-xs text-slate-600 mb-2">
                  First time accessing Employee Self-Service?
                </p>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenRegister();
                  }}
                  className="inline-flex items-center justify-center space-x-1.5 px-4 py-2.5 min-h-[44px] text-xs font-bold text-[#F28C28] bg-orange-50 hover:bg-orange-100 rounded-xl border border-orange-200 w-full transition-colors cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Register an ESS Account</span>
                </button>
              </div>

              {/* Demo Quick Fills */}
              <div className="pt-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Test ESS Accounts:
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleQuickFill('maria.santos@sanjose.gov.ph', 'employee2026!')}
                    className="p-1.5 text-left border rounded-lg text-[10px] hover:bg-slate-50 border-slate-200"
                  >
                    <span className="font-semibold text-slate-800 block">Maria Santos Reyes</span>
                    <span className="text-slate-500">maria.santos@...</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickFill('juan.delacruz@sanjose.gov.ph', 'employee2026!')}
                    className="p-1.5 text-left border rounded-lg text-[10px] hover:bg-slate-50 border-slate-200"
                  >
                    <span className="font-semibold text-slate-800 block">Juan Dela Cruz</span>
                    <span className="text-slate-500">juan.delacruz@...</span>
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};
