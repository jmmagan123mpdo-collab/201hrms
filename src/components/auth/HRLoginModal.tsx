import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { Lock, User, Eye, EyeOff, ShieldAlert, CheckCircle, ArrowRight, X } from 'lucide-react';

interface HRLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HRLoginModal: React.FC<HRLoginModalProps> = ({ isOpen, onClose }) => {
  const { loginHR } = useAuth();
  const [username, setUsername] = useState('hr_admin');
  const [password, setPassword] = useState('admin2026!');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      const res = await loginHR(username, password, rememberMe);
      if (!res.success) {
        setErrorMessage(res.error || 'Authentication failed. Please verify credentials.');
      } else {
        onClose();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred during authentication.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFill = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setErrorMessage('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden max-h-[94vh] flex flex-col">
        
        {/* Mobile Drag Handle */}
        <div className="sm:hidden pt-2 pb-1 bg-[#173B67] flex justify-center shrink-0">
          <div className="w-10 h-1 bg-white/40 rounded-full"></div>
        </div>

        {/* Header with Soft Blue Government Styling */}
        <div className="bg-[#173B67] px-5 sm:px-6 py-4 sm:py-5 text-white relative shrink-0">
          <button 
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center absolute top-2 right-2 sm:top-4 sm:right-4 text-slate-300 hover:text-white rounded-xl transition-colors cursor-pointer"
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
              <span className="text-[11px] font-semibold text-blue-200 uppercase tracking-widest block">
                Official Access Portal
              </span>
              <h2 className="text-lg font-bold tracking-tight">HR Management Login</h2>
            </div>
          </div>
          <p className="text-xs text-blue-100/90 mt-2">
            Secure administrative access for Developer, HR Administrator, HR Staff, and Payroll Personnel.
          </p>
        </div>

        {/* Form Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1">
          {showForgotPassword ? (
            <div className="space-y-4">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 leading-relaxed">
                <span className="font-bold block mb-1">Administrative Password Recovery:</span>
                For security compliance, HR administrative accounts cannot be reset publicly. Please coordinate directly with the Human Resource Management Office (MHRMO) or the System Developer.
              </div>
              <button
                type="button"
                onClick={() => setShowForgotPassword(false)}
                className="w-full min-h-[44px] py-2 text-xs font-semibold text-[#173B67] hover:underline cursor-pointer flex items-center justify-center"
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

              {/* Username Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Username or Official Email
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. hr_admin or dev_sanjose"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#173B67] focus:border-transparent outline-none transition-all"
                  />
                </div>
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
                    className="text-xs text-[#173B67] hover:underline font-medium min-h-[36px] flex items-center"
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
                    placeholder="Enter account password"
                    className="w-full pl-9 pr-10 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#173B67] focus:border-transparent outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="min-h-[44px] min-w-[44px] flex items-center justify-center absolute right-0 top-0 text-slate-400 hover:text-slate-600 cursor-pointer"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center space-x-2 text-xs text-slate-600 cursor-pointer min-h-[36px]">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-300 text-[#173B67] focus:ring-[#173B67] w-4 h-4"
                  />
                  <span>Remember Me</span>
                </label>
                <span className="text-[11px] text-slate-400">Automatic role assignment</span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full min-h-[44px] py-2.5 px-4 bg-[#173B67] hover:bg-[#122e50] text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-70 cursor-pointer"
              >
                <span>{isLoading ? 'Authenticating...' : 'Sign In to HR Management'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Quick Preset Buttons for Testing */}
              <div className="pt-3 border-t border-slate-100">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Test Administrative Logins:
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleQuickFill('hr_admin', 'admin2026!')}
                    className="p-1.5 text-left border rounded-lg text-[11px] hover:bg-slate-50 border-slate-200 transition-colors"
                  >
                    <span className="font-semibold text-blue-900 block">HR Administrator</span>
                    <span className="text-slate-400 text-[10px]">hr_admin</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickFill('dev_sanjose', 'developer2026!')}
                    className="p-1.5 text-left border rounded-lg text-[11px] hover:bg-slate-50 border-slate-200 transition-colors"
                  >
                    <span className="font-semibold text-purple-900 block">System Developer</span>
                    <span className="text-slate-400 text-[10px]">dev_sanjose</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickFill('hr_staff', 'staff2026!')}
                    className="p-1.5 text-left border rounded-lg text-[11px] hover:bg-slate-50 border-slate-200 transition-colors"
                  >
                    <span className="font-semibold text-sky-900 block">HR Staff (Encoder)</span>
                    <span className="text-slate-400 text-[10px]">hr_staff</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickFill('payroll_officer', 'payroll2026!')}
                    className="p-1.5 text-left border rounded-lg text-[11px] hover:bg-slate-50 border-slate-200 transition-colors"
                  >
                    <span className="font-semibold text-emerald-900 block">Payroll Officer</span>
                    <span className="text-slate-400 text-[10px]">payroll_officer</span>
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
