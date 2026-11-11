import { useEffect, useState } from 'react';

type InstallPromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }> };

export default function PWAInstallPrompt() {
  const [installEvent, setInstallEvent] = useState<InstallPromptEvent | null>(null);
  const [iosHelp, setIosHelp] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js', { updateViaCache: 'none' })
          .then(registration => registration.update())
          .catch(error => console.error('SJHR201 service worker registration failed:', error));
      });
    }
    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as InstallPromptEvent);
      setVisible(true);
    };
    const onInstalled = () => { setVisible(false); setInstallEvent(null); };
    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onInstalled);
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as Navigator & {standalone?: boolean}).standalone === true;
    if (isIOS && !isStandalone) setIosHelp(true);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const install = async () => {
    if (!installEvent) return;
    await installEvent.prompt();
    await installEvent.userChoice;
    setInstallEvent(null);
    setVisible(false);
  };

  if (!visible && !iosHelp) return null;
  return (
    <div className="fixed bottom-4 right-4 z-[100] max-w-sm rounded-xl border border-blue-200 bg-white p-4 shadow-xl" role="region" aria-label="Install SJHR201">
      <div className="flex items-start gap-3">
        <img src="/pwa-192.png" alt="" className="h-11 w-11 rounded-lg" />
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-slate-900">Install SJHR201</p>
          <p className="mt-1 text-sm text-slate-600">Add the HRMIS to your device for an app-like experience.</p>
          {installEvent && <button onClick={install} className="mt-3 rounded-lg bg-[#173B67] px-4 py-2 text-sm font-semibold text-white">Install App</button>}
          {iosHelp && !installEvent && <p className="mt-2 text-xs text-slate-600">On iPhone or iPad: tap Share, then choose “Add to Home Screen”.</p>}
        </div>
        <button aria-label="Dismiss install message" onClick={() => {setVisible(false); setIosHelp(false);}} className="text-slate-400 hover:text-slate-700">×</button>
      </div>
    </div>
  );
}
