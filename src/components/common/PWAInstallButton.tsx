import React, { useState } from 'react';
import { usePWAInstall } from '../../hooks/usePWAInstall.ts';
import { Download, Smartphone, Laptop, CheckCircle2, X, Share, ExternalLink } from 'lucide-react';

interface PWAInstallButtonProps {
  variant?: 'header' | 'hero' | 'pill';
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ 
  variant = 'header',
  className = ''
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuideModal, setShowGuideModal] = useState(false);

  // If already installed and running as standalone app, show an installed status badge or hide
  if (isInstalled) {
    return (
      <div className="inline-flex items-center space-x-1 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
        <span>App Installed</span>
      </div>
    );
  }

  const handleClick = async () => {
    if (isInstallable) {
      const installed = await install();
      if (!installed) {
        setShowGuideModal(true);
      }
    } else {
      setShowGuideModal(true);
    }
  };

  return (
    <>
      {variant === 'hero' ? (
        <button
          type="button"
          onClick={handleClick}
          className={`py-2.5 px-4 bg-white hover:bg-slate-50 text-[#173B67] font-bold text-xs sm:text-sm rounded-xl border border-slate-300 shadow-xs hover:shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer ${className}`}
        >
          <Download className="w-4 h-4 text-[#F28C28]" />
          <span>Install App (PWA)</span>
        </button>
      ) : variant === 'pill' ? (
        <button
          type="button"
          onClick={handleClick}
          className={`px-3 py-1.5 bg-[#173B67] hover:bg-[#122e50] text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center space-x-1.5 cursor-pointer ${className}`}
        >
          <Download className="w-3.5 h-3.5 text-amber-300" />
          <span>Install App</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={handleClick}
          className={`min-h-[40px] px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-[#173B67] hover:text-[#122e50] border border-slate-300 rounded-xl font-bold text-xs transition-colors flex items-center space-x-2 cursor-pointer shadow-2xs ${className}`}
          title="Install SJHR201 on your device (Desktop, Android, or iOS)"
        >
          <Download className="w-4 h-4 text-[#F28C28]" />
          <span className="hidden sm:inline">Install App</span>
          <span className="sm:hidden">Install</span>
        </button>
      )}

      {/* Guided Installation Modal */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden space-y-4 p-5 animate-in zoom-in-95">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center space-x-2 text-[#173B67]">
                <Smartphone className="w-5 h-5 text-[#F28C28]" />
                <h3 className="font-bold text-base text-slate-900">Install SJHR201 App</h3>
              </div>
              <button 
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Instruction Body based on platform */}
            {isIOS ? (
              <div className="space-y-3 text-xs text-slate-600">
                <p className="font-semibold text-slate-800">
                  To install SJHR201 on your iPhone or iPad:
                </p>
                <ol className="space-y-2.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-slate-700">
                  <li className="flex items-start space-x-2">
                    <span className="w-5 h-5 rounded-full bg-[#173B67] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">1</span>
                    <span>Tap the <strong className="text-slate-900 flex items-center inline-flex mx-1"><Share className="w-3.5 h-3.5 mr-0.5" /> Share</strong> button in Safari's bottom toolbar.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="w-5 h-5 rounded-full bg-[#173B67] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">2</span>
                    <span>Scroll down and tap <strong className="text-slate-900">&ldquo;Add to Home Screen&rdquo;</strong>.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="w-5 h-5 rounded-full bg-[#173B67] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">3</span>
                    <span>Tap <strong className="text-slate-900">&ldquo;Add&rdquo;</strong> in the top right corner. The SJHR201 app will appear on your home screen!</span>
                  </li>
                </ol>
              </div>
            ) : (
              <div className="space-y-3 text-xs text-slate-600">
                <p className="font-semibold text-slate-800">
                  Install for fast 1-tap access on your computer or phone:
                </p>
                <div className="space-y-2.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <div className="flex items-start space-x-2.5">
                    <Laptop className="w-4 h-4 text-[#173B67] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-900 block">Desktop (Chrome / Edge / Brave):</strong>
                      <span className="text-slate-600">Look for the <strong className="text-slate-800">Install icon</strong> in your browser&apos;s address bar (right side) or click browser menu (⋮) &rarr; <strong className="text-slate-800">Install SJHR201</strong>.</span>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2.5 pt-2 border-t border-slate-200">
                    <Smartphone className="w-4 h-4 text-[#F28C28] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-900 block">Android Device:</strong>
                      <span className="text-slate-600">Tap browser menu (⋮) in Chrome and tap <strong className="text-slate-800">&ldquo;Install App&rdquo;</strong> or <strong className="text-slate-800">&ldquo;Add to Home Screen&rdquo;</strong>.</span>
                    </div>
                  </div>
                </div>

                {isInstallable && (
                  <button
                    type="button"
                    onClick={async () => {
                      const success = await install();
                      if (success) setShowGuideModal(false);
                    }}
                    className="w-full py-2.5 bg-[#173B67] hover:bg-[#122e50] text-white rounded-xl font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center justify-center space-x-1.5"
                  >
                    <Download className="w-4 h-4" />
                    <span>Trigger Browser Install Prompt</span>
                  </button>
                )}
              </div>
            )}

            <div className="pt-2 border-t flex justify-end">
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs cursor-pointer"
              >
                Got It
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
