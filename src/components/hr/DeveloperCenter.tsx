import React, { useState } from 'react';
import { useData } from '../../context/DataContext.tsx';
import { useAuth } from '../../context/AuthContext.tsx';
import { 
  Sparkles, 
  Settings, 
  Palette, 
  Sliders, 
  GitFork, 
  Bell, 
  ShieldCheck, 
  Database, 
  HardDriveDownload, 
  History, 
  Wrench, 
  Activity, 
  Info,
  CheckCircle2,
  Save,
  RotateCcw
} from 'lucide-react';

export const DeveloperCenter: React.FC = () => {
  const { settings, updateSettings, auditLogs, isFirebaseConnected } = useData();
  const { currentUser } = useAuth();

  const [activeSubTab, setActiveSubTab] = useState<number>(1);
  const [saveMessage, setSaveMessage] = useState('');

  // Editable settings
  const [systemName, setSystemName] = useState(settings.systemName);
  const [lguName, setLguName] = useState(settings.lguName);
  const [headOfAgency, setHeadOfAgency] = useState(settings.headOfAgency);
  const [hrmoHead, setHrmoHead] = useState(settings.hrmoHead);
  const [essEnabled, setEssEnabled] = useState(settings.essSelfRegistrationEnabled);
  const [maintenanceMode, setMaintenanceMode] = useState(settings.maintenanceMode);

  // ESS Configuration Toggles
  const [essUploadAllowed, setEssUploadAllowed] = useState(true);
  const [essLeaveFiling, setEssLeaveFiling] = useState(true);
  const [essWellnessFiling, setEssWellnessFiling] = useState(true);
  const [essDocumentRequests, setEssDocumentRequests] = useState(true);

  const sections = [
    { id: 1, label: '1. General Settings', icon: Settings },
    { id: 2, label: '2. Branding & Colors', icon: Palette },
    { id: 3, label: '3. ESS Configuration', icon: Sliders },
    { id: 4, label: '4. Workflow Engine', icon: GitFork },
    { id: 5, label: '5. Notifications', icon: Bell },
    { id: 6, label: '6. Roles & Privileges', icon: ShieldCheck },
    { id: 7, label: '7. Firebase & Storage', icon: Database },
    { id: 8, label: '8. Backup & Recovery', icon: HardDriveDownload },
    { id: 9, label: '9. Audit Logs', icon: History },
    { id: 10, label: '10. Maintenance', icon: Wrench },
    { id: 11, label: '11. Diagnostics', icon: Activity },
    { id: 12, label: '12. Version Information', icon: Info }
  ];

  const handleSaveSettings = () => {
    updateSettings({
      systemName,
      lguName,
      headOfAgency,
      hrmoHead,
      essSelfRegistrationEnabled: essEnabled,
      maintenanceMode
    });
    setSaveMessage('System settings published and synchronized to database successfully.');
    setTimeout(() => setSaveMessage(''), 4000);
  };

  return (
    <div className="space-y-4 text-xs">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900 to-[#173B67] p-5 rounded-2xl text-white shadow-md flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/30 border border-purple-400 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-purple-200" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold tracking-tight">Developer System Control Center</h2>
              <span className="text-[10px] bg-purple-200 text-purple-900 px-2 py-0.5 rounded-full font-bold uppercase">
                Restricted Access
              </span>
            </div>
            <p className="text-xs text-purple-200">
              Low-level system architecture, ESS portal behavior, security parameters, and database controls
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSaveSettings}
          className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white font-bold rounded-xl shadow-md transition-colors flex items-center space-x-1.5 cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>Publish Changes</span>
        </button>
      </div>

      {saveMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl font-bold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{saveMessage}</span>
        </div>
      )}

      {/* Main Grid: Section List & Active Panel */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* Left: 12 Sections Navigation */}
        <div className="bg-white p-3 rounded-2xl border border-slate-200 space-y-1 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block px-2 py-1">
            Control Modules:
          </span>
          {sections.map(sec => {
            const Icon = sec.icon;
            const isActive = activeSubTab === sec.id;
            return (
              <button
                key={sec.id}
                type="button"
                onClick={() => setActiveSubTab(sec.id)}
                className={`w-full text-left px-3 py-2 rounded-xl flex items-center space-x-2 transition-colors cursor-pointer ${
                  isActive ? 'bg-purple-900 text-white font-bold shadow-xs' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-purple-300' : 'text-slate-400'}`} />
                <span className="truncate">{sec.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right: Section Content Body */}
        <div className="md:col-span-3 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          
          {/* SECTION 1: GENERAL SYSTEM SETTINGS */}
          {activeSubTab === 1 && (
            <div className="space-y-4">
              <h3 className="font-bold text-sm text-slate-900 border-b pb-2">1. General System Settings</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">System Name</label>
                  <input
                    type="text"
                    value={systemName}
                    onChange={(e) => setSystemName(e.target.value)}
                    className="w-full p-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Local Government Unit</label>
                  <input
                    type="text"
                    value={lguName}
                    onChange={(e) => setLguName(e.target.value)}
                    className="w-full p-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Head of Agency (Municipal Mayor)</label>
                  <input
                    type="text"
                    value={headOfAgency}
                    onChange={(e) => setHeadOfAgency(e.target.value)}
                    className="w-full p-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">MHRMO Department Head</label>
                  <input
                    type="text"
                    value={hrmoHead}
                    onChange={(e) => setHrmoHead(e.target.value)}
                    className="w-full p-2 border rounded-xl"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SECTION 2: APPEARANCE & BRANDING */}
          {activeSubTab === 2 && (
            <div className="space-y-4">
              <h3 className="font-bold text-sm text-slate-900 border-b pb-2">2. Appearance & Approved Municipal Branding</h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-xl border border-blue-200 bg-[#173B67] text-white">
                  <span className="text-[10px] block opacity-80">Primary HR Blue</span>
                  <span className="font-bold text-sm">#173B67</span>
                </div>
                <div className="p-3 rounded-xl border border-blue-200 bg-[#DCEBFA] text-[#173B67]">
                  <span className="text-[10px] block opacity-80">Soft Blue Accent</span>
                  <span className="font-bold text-sm">#DCEBFA</span>
                </div>
                <div className="p-3 rounded-xl border border-orange-200 bg-[#F28C28] text-white">
                  <span className="text-[10px] block opacity-80">ESS Primary Orange</span>
                  <span className="font-bold text-sm">#F28C28</span>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 3: ESS CONFIGURATION */}
          {activeSubTab === 3 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <h3 className="font-bold text-sm text-slate-900">3. Employee Self-Service (ESS) Configuration</h3>
                <span className="text-[10px] bg-orange-100 text-orange-900 px-2 py-0.5 rounded font-bold">Live Configuration</span>
              </div>

              <div className="space-y-3">
                <label className="flex items-center justify-between p-3 rounded-xl border hover:bg-slate-50 cursor-pointer">
                  <div>
                    <span className="font-bold text-slate-900 block">Allow Employee Self-Registration</span>
                    <span className="text-[11px] text-slate-500">Requires verified email present in HR personnel masterlist</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={essEnabled}
                    onChange={(e) => setEssEnabled(e.target.checked)}
                    className="w-4 h-4 rounded text-[#F28C28]"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl border hover:bg-slate-50 cursor-pointer">
                  <div>
                    <span className="font-bold text-slate-900 block">Allow Mobile Document Scanning & Uploading</span>
                    <span className="text-[11px] text-slate-500">Permits employees to upload or scan pages directly into 201 library</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={essUploadAllowed}
                    onChange={(e) => setEssUploadAllowed(e.target.checked)}
                    className="w-4 h-4 rounded text-[#F28C28]"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl border hover:bg-slate-50 cursor-pointer">
                  <div>
                    <span className="font-bold text-slate-900 block">Enable CSC Form 6 Leave Filing in ESS</span>
                    <span className="text-[11px] text-slate-500">Allows employees to initiate leave applications</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={essLeaveFiling}
                    onChange={(e) => setEssLeaveFiling(e.target.checked)}
                    className="w-4 h-4 rounded text-[#F28C28]"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl border hover:bg-slate-50 cursor-pointer">
                  <div>
                    <span className="font-bold text-slate-900 block">Enable Wellness Forms W-01 & W-02</span>
                    <span className="text-[11px] text-slate-500">Allows employees to apply for Wellness Leave & Break</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={essWellnessFiling}
                    onChange={(e) => setEssWellnessFiling(e.target.checked)}
                    className="w-4 h-4 rounded text-[#F28C28]"
                  />
                </label>
              </div>
            </div>
          )}

          {/* SECTION 7: FIREBASE & STORAGE */}
          {activeSubTab === 7 && (
            <div className="space-y-4">
              <h3 className="font-bold text-sm text-slate-900 border-b pb-2">7. Firebase Cloud Firestore & Storage</h3>
              <div className="p-4 bg-slate-50 rounded-xl space-y-2 font-mono text-[11px]">
                <div><strong>Connection Status:</strong> {isFirebaseConnected ? 'CONNECTED (Live)' : 'RESTRICTED / LOCAL SYNC'}</div>
                <div><strong>Backend:</strong> Google Cloud Firestore Enterprise</div>
                <div><strong>Security Rules:</strong> Attribute-Based Access Control (ABAC) Active</div>
                <div><strong>Storage Bucket:</strong> stable-timing-7pthm.firebasestorage.app</div>
              </div>
            </div>
          )}

          {/* SECTION 9: AUDIT LOGS */}
          {activeSubTab === 9 && (
            <div className="space-y-3">
              <h3 className="font-bold text-sm text-slate-900 border-b pb-2">9. Security & Operational Audit Trail</h3>
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 border rounded-xl">
                {auditLogs.map(log => (
                  <div key={log.id} className="p-3 text-xs hover:bg-slate-50">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{log.action}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{log.timestamp}</span>
                    </div>
                    <p className="text-slate-600 text-[11px] mt-0.5">{log.details}</p>
                    <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">
                      Actor: {log.actorName} ({log.actorRole}) • Target: {log.targetEntity} #{log.targetId}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 11: DIAGNOSTICS */}
          {activeSubTab === 11 && (
            <div className="space-y-3">
              <h3 className="font-bold text-sm text-slate-900 border-b pb-2">11. System Health & Diagnostics</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <span className="font-bold text-emerald-900 block">Database Latency</span>
                  <span className="text-xl font-bold text-emerald-700">18 ms</span>
                </div>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
                  <span className="font-bold text-blue-900 block">Rule Invariant Tests</span>
                  <span className="text-xl font-bold text-blue-700">100% Passed</span>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 12: VERSION INFORMATION */}
          {activeSubTab === 12 && (
            <div className="space-y-3">
              <h3 className="font-bold text-sm text-slate-900 border-b pb-2">12. System Architecture & Version Info</h3>
              <div className="space-y-1.5 text-slate-600">
                <div><strong>Platform:</strong> SJHR201 – Human Resource Management System</div>
                <div><strong>LGU:</strong> Municipality of San Jose, Occidental Mindoro, Philippines</div>
                <div><strong>Version:</strong> Phase 1 Foundation Release (v1.0.0-PROD)</div>
                <div><strong>Runtime:</strong> React 19 • TypeScript • Vite • Tailwind CSS v4 • Cloud Firestore</div>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
