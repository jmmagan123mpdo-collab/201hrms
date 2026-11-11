import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext.tsx';
import { useAuth } from '../../context/AuthContext.tsx';
import { BiometricRecord, AttendanceStatus } from '../../types/index.ts';
import { calculateTardinessAndUndertime } from '../../data/biometricsData.ts';
import {
  Fingerprint,
  RefreshCw,
  PlusCircle,
  Download,
  Printer,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Clock,
  Calendar,
  Building2,
  User,
  ShieldCheck,
  Server,
  Wifi,
  Sparkles,
  Check,
  X,
  FileText,
  ChevronDown,
  Eye,
  SlidersHorizontal
} from 'lucide-react';

export const BiometricsManager: React.FC = () => {
  const { 
    employees, 
    offices, 
    biometricRecords, 
    terminals, 
    syncBiometrics, 
    addOrUpdateBiometricRecord, 
    verifyBiometricRecord 
  } = useData();
  const { currentUser } = useAuth();

  // Filters
  const [selectedDate, setSelectedDate] = useState<string>('2026-02-10');
  const [selectedOffice, setSelectedOffice] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Sync state
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  // Manual Adjustment Modal
  const [showAdjustModal, setShowAdjustModal] = useState<boolean>(false);
  const [selectedRecordToEdit, setSelectedRecordToEdit] = useState<BiometricRecord | null>(null);

  // Form State for Manual Adjust
  const [adjustEmpId, setAdjustEmpId] = useState<string>('');
  const [adjustDate, setAdjustDate] = useState<string>('2026-02-10');
  const [adjustAmIn, setAdjustAmIn] = useState<string>('08:00 AM');
  const [adjustAmOut, setAdjustAmOut] = useState<string>('12:00 PM');
  const [adjustPmIn, setAdjustPmIn] = useState<string>('01:00 PM');
  const [adjustPmOut, setAdjustPmOut] = useState<string>('05:00 PM');
  const [adjustRemarks, setAdjustRemarks] = useState<string>('Official municipal duties');
  const [adjustStatus, setAdjustStatus] = useState<AttendanceStatus>('On Time');

  // CSC Form 48 DTR Preview Modal
  const [selectedDtrRecord, setSelectedDtrRecord] = useState<BiometricRecord | null>(null);

  // Filter records by date, office, status, search
  const filteredRecords = useMemo(() => {
    return biometricRecords.filter(record => {
      // Date match
      if (record.date !== selectedDate) return false;

      // Office match
      if (selectedOffice !== 'all' && record.officeName !== selectedOffice) {
        return false;
      }

      // Status match
      if (selectedStatus !== 'all' && record.status !== selectedStatus) {
        return false;
      }

      // Search match
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchName = record.employeeName.toLowerCase().includes(query);
        const matchNumber = record.employeeNumber.toLowerCase().includes(query);
        const matchPosition = record.position.toLowerCase().includes(query);
        if (!matchName && !matchNumber && !matchPosition) return false;
      }

      return true;
    });
  }, [biometricRecords, selectedDate, selectedOffice, selectedStatus, searchQuery]);

  // Daily Statistics
  const stats = useMemo(() => {
    const dayRecords = biometricRecords.filter(r => r.date === selectedDate);
    const totalExpected = employees.filter(e => e.employmentStatus === 'Active').length || dayRecords.length;
    const presentCount = dayRecords.filter(r => r.status === 'On Time' || r.status === 'Late / Tardy' || r.status === 'Undertime').length;
    const onTimeCount = dayRecords.filter(r => r.status === 'On Time').length;
    const tardyCount = dayRecords.filter(r => r.status === 'Late / Tardy').length;
    const undertimeCount = dayRecords.filter(r => r.status === 'Undertime').length;
    const onLeaveCount = dayRecords.filter(r => r.status === 'On Leave' || r.status === 'Official Business (OB)').length;
    const absentCount = totalExpected - (presentCount + onLeaveCount);

    const totalTardyMinutes = dayRecords.reduce((acc, r) => acc + (r.tardyMinutes || 0), 0);

    return {
      totalExpected,
      presentCount,
      onTimeCount,
      tardyCount,
      undertimeCount,
      onLeaveCount,
      absentCount: absentCount > 0 ? absentCount : 0,
      totalTardyMinutes
    };
  }, [biometricRecords, selectedDate, employees]);

  // Handle Device Sync
  const handleSyncAllDevices = async (termId?: string) => {
    setIsSyncing(true);
    setSyncFeedback(null);
    try {
      const result = await syncBiometrics(termId);
      setSyncFeedback(`Sync complete! ${result.syncedCount} records verified across municipal terminals.`);
      setTimeout(() => setSyncFeedback(null), 5000);
    } catch {
      setSyncFeedback('Sync encountered a transient network timeout. Please retry.');
    } finally {
      setIsSyncing(false);
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (record: BiometricRecord) => {
    setSelectedRecordToEdit(record);
    setAdjustEmpId(record.employeeId);
    setAdjustDate(record.date);
    setAdjustAmIn(record.amIn || '');
    setAdjustAmOut(record.amOut || '');
    setAdjustPmIn(record.pmIn || '');
    setAdjustPmOut(record.pmOut || '');
    setAdjustRemarks(record.remarks || '');
    setAdjustStatus(record.status);
    setShowAdjustModal(true);
  };

  // Open New Entry Modal
  const handleOpenNewEntry = () => {
    setSelectedRecordToEdit(null);
    setAdjustEmpId(employees[0]?.id || 'EMP-2022-001');
    setAdjustDate(selectedDate);
    setAdjustAmIn('07:55 AM');
    setAdjustAmOut('12:00 PM');
    setAdjustPmIn('12:55 PM');
    setAdjustPmOut('05:00 PM');
    setAdjustRemarks('Official time recording / Terminal manual override');
    setAdjustStatus('On Time');
    setShowAdjustModal(true);
  };

  // Save Adjustment
  const handleSaveAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find(e => e.id === adjustEmpId);
    if (!emp) return;

    const calc = calculateTardinessAndUndertime(adjustAmIn, adjustAmOut, adjustPmIn, adjustPmOut);

    const newOrUpdatedRecord: BiometricRecord = {
      id: selectedRecordToEdit ? selectedRecordToEdit.id : `BIO-${adjustDate}-${emp.id}`,
      employeeId: emp.id,
      employeeName: `${emp.firstName} ${emp.lastName}`,
      employeeNumber: emp.employeeNumber,
      officeName: emp.officeName,
      position: emp.position,
      classification: emp.classification,
      date: adjustDate,
      amIn: adjustAmIn || null,
      amOut: adjustAmOut || null,
      pmIn: adjustPmIn || null,
      pmOut: adjustPmOut || null,
      tardyMinutes: calc.tardyMinutes,
      undertimeMinutes: calc.undertimeMinutes,
      totalHours: calc.totalHours,
      status: adjustStatus !== 'On Time' ? adjustStatus : calc.status,
      terminalId: 'TERM-03',
      terminalName: 'MHRMO Administrative Override',
      verificationMethod: 'Manual Log',
      syncStatus: 'manual',
      syncedAt: new Date().toISOString(),
      verifiedBy: currentUser?.displayName || 'HR Administrator',
      verifiedAt: new Date().toISOString(),
      remarks: adjustRemarks
    };

    await addOrUpdateBiometricRecord(newOrUpdatedRecord);
    setShowAdjustModal(false);
  };

  // Quick Verify Log
  const handleVerify = async (recordId: string) => {
    await verifyBiometricRecord(recordId, currentUser?.displayName || 'Atty. Maria Elena Castillo');
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Date', 'Employee ID', 'Name', 'Office', 'Position', 'AM In', 'AM Out', 'PM In', 'PM Out', 'Tardy (mins)', 'Undertime (mins)', 'Total Hours', 'Status', 'Terminal', 'Verified By'];
    const rows = filteredRecords.map(r => [
      r.date,
      r.employeeNumber,
      `"${r.employeeName}"`,
      `"${r.officeName}"`,
      `"${r.position}"`,
      r.amIn || '--',
      r.amOut || '--',
      r.pmIn || '--',
      r.pmOut || '--',
      r.tardyMinutes,
      r.undertimeMinutes,
      r.totalHours,
      r.status,
      `"${r.terminalName}"`,
      r.verifiedBy || 'Unverified'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `DTR_Attendance_${selectedDate}_SanJose.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status: AttendanceStatus) => {
    switch (status) {
      case 'On Time':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Late / Tardy':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'Undertime':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Half Day':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'On Leave':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Official Business (OB)':
        return 'bg-teal-50 text-teal-700 border-teal-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 font-sans">
      
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-[#173B67] to-[#1e4c85] rounded-2xl p-4 sm:p-6 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-white/20 rounded-lg">
              <Fingerprint className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs uppercase font-bold text-blue-200 tracking-wider">
              CSC Form 48 • Daily Time Record (DTR)
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight mt-1.5">
            Biometrics & Attendance Center
          </h2>
          <p className="text-xs text-blue-100 mt-1 max-w-xl">
            Real-time biometric sync with Municipal Hall optical and facial recognition terminals. Automated Civil Service Commission tardiness & undertime ledger.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="w-full md:w-auto flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            disabled={isSyncing}
            onClick={() => handleSyncAllDevices()}
            className="flex-1 sm:flex-initial px-3.5 py-2.5 bg-[#F28C28] hover:bg-[#d9771a] active:scale-95 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-60 min-h-[44px]"
            title="Sync all 4 municipal biometric machines"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing Terminals...' : 'Sync Biometrics'}</span>
          </button>

          <button
            type="button"
            onClick={handleOpenNewEntry}
            className="flex-1 sm:flex-initial px-3.5 py-2.5 bg-white/20 hover:bg-white/30 active:scale-95 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center space-x-1.5 cursor-pointer min-h-[44px]"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Manual Entry</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3.5 py-2.5 bg-white text-[#173B67] hover:bg-blue-50 active:scale-95 text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center space-x-1.5 cursor-pointer min-h-[44px]"
            title="Export CSV attendance ledger"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export DTR</span>
          </button>
        </div>
      </div>

      {/* Sync Feedback Toast */}
      {syncFeedback && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl p-3 text-xs font-bold flex items-center justify-between animate-in fade-in">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{syncFeedback}</span>
          </div>
          <button 
            type="button" 
            onClick={() => setSyncFeedback(null)} 
            className="text-emerald-700 hover:text-emerald-900 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 2. Biometric Device Status Strip (Side-by-side 2-col on Mobile, 4-col on Desktop) */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Server className="w-4 h-4 text-[#173B67]" />
            <span className="text-xs font-bold text-slate-800">
              Municipal Biometric Terminal Fleet
            </span>
          </div>
          <span className="text-[11px] text-emerald-600 font-bold flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>4 / 4 Terminals Online</span>
          </span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
          {terminals.map(terminal => (
            <div 
              key={terminal.id}
              className="p-2.5 sm:p-3 bg-slate-50 hover:bg-blue-50/50 rounded-xl border border-slate-200 flex flex-col justify-between transition-colors"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-black text-[#173B67] bg-blue-100/70 px-1.5 py-0.5 rounded">
                    {terminal.id}
                  </span>
                  <span className="text-[10px] text-emerald-700 font-bold flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span>Online</span>
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 mt-1.5 leading-snug line-clamp-1">
                  {terminal.name}
                </h4>
                <p className="text-[10px] text-slate-500 truncate mt-0.5">
                  {terminal.location}
                </p>
              </div>

              <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-500">
                <span className="font-mono">{terminal.ipAddress}</span>
                <button
                  type="button"
                  onClick={() => handleSyncAllDevices(terminal.id)}
                  disabled={isSyncing}
                  className="font-bold text-[#F28C28] hover:text-[#d9771a] cursor-pointer"
                >
                  Sync
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Daily Attendance Summary Tiles (Side-by-side 2x2 on Mobile, 4-col on Desktop) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
        
        {/* Tile 1: Total Present */}
        <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider block truncate">
              Present & Recorded
            </span>
            <div className="text-xl sm:text-3xl font-black text-slate-900 mt-1 sm:mt-1.5 truncate">
              {stats.presentCount} <span className="text-xs font-normal text-slate-400">/ {stats.totalExpected}</span>
            </div>
            <div className="text-[10px] sm:text-xs text-emerald-600 font-semibold mt-0.5 truncate">
              {stats.onTimeCount} on time • {Math.round((stats.presentCount / (stats.totalExpected || 1)) * 100)}% attendance
            </div>
          </div>
        </div>

        {/* Tile 2: Late / Tardy */}
        <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-amber-100 shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-[10px] sm:text-xs font-bold text-amber-700 uppercase tracking-wider block truncate">
              Tardy / Late Arrivals
            </span>
            <div className="text-xl sm:text-3xl font-black text-amber-600 mt-1 sm:mt-1.5 truncate">
              {stats.tardyCount} <span className="text-xs font-normal text-slate-400">staff</span>
            </div>
            <div className="text-[10px] sm:text-xs text-amber-700 font-semibold mt-0.5 truncate">
              {stats.totalTardyMinutes} cumulative minutes past 8:00 AM
            </div>
          </div>
        </div>

        {/* Tile 3: Undertime */}
        <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-rose-100 shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-[10px] sm:text-xs font-bold text-rose-700 uppercase tracking-wider block truncate">
              Undertime Logged
            </span>
            <div className="text-xl sm:text-3xl font-black text-rose-600 mt-1 sm:mt-1.5 truncate">
              {stats.undertimeCount} <span className="text-xs font-normal text-slate-400">staff</span>
            </div>
            <div className="text-[10px] sm:text-xs text-rose-600 font-semibold mt-0.5 truncate">
              Early logouts (Pass slip or personal)
            </div>
          </div>
        </div>

        {/* Tile 4: On Leave / Official Business */}
        <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-blue-100 shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-[10px] sm:text-xs font-bold text-blue-700 uppercase tracking-wider block truncate">
              Leave & Official Business
            </span>
            <div className="text-xl sm:text-3xl font-black text-[#173B67] mt-1 sm:mt-1.5 truncate">
              {stats.onLeaveCount} <span className="text-xs font-normal text-slate-400">staff</span>
            </div>
            <div className="text-[10px] sm:text-xs text-blue-600 font-semibold mt-0.5 truncate">
              CSC Form 6 & Travel Orders
            </div>
          </div>
        </div>

      </div>

      {/* 4. Filter Toolbar & Search */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          
          {/* Date Selector */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
              Attendance Date
            </label>
            <div className="flex items-center space-x-1.5">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 cursor-pointer"
              />
              <button
                type="button"
                onClick={() => setSelectedDate('2026-02-10')}
                className={`px-2 py-2 text-[10px] font-bold rounded-xl transition-colors cursor-pointer shrink-0 ${
                  selectedDate === '2026-02-10' ? 'bg-[#173B67] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Today
              </button>
            </div>
          </div>

          {/* Office Filter */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
              Municipal Office / Department
            </label>
            <select
              value={selectedOffice}
              onChange={(e) => setSelectedOffice(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800"
            >
              <option value="all">All Municipal Offices</option>
              {offices.map(o => (
                <option key={o.id} value={o.name}>{o.name}</option>
              ))}
            </select>
          </div>

          {/* Attendance Status Filter */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
              Attendance Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800"
            >
              <option value="all">All Statuses ({biometricRecords.filter(r => r.date === selectedDate).length})</option>
              <option value="On Time">On Time</option>
              <option value="Late / Tardy">Late / Tardy</option>
              <option value="Undertime">Undertime</option>
              <option value="On Leave">On Leave</option>
              <option value="Official Business (OB)">Official Business (OB)</option>
            </select>
          </div>

          {/* Search Bar */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
              Search Employee
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search by name, position, ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800"
              />
            </div>
          </div>

        </div>
      </div>

      {/* 5. Attendance Ledger: Desktop Table & Mobile Cards */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        
        {/* Table Header Controls */}
        <div className="p-3.5 sm:p-4 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-800">
              Daily Time Record Ledger: {selectedDate}
            </span>
            <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-bold">
              {filteredRecords.length} records
            </span>
          </div>

          <div className="text-[11px] text-slate-500">
            Standard: <span className="font-mono font-semibold">08:00 AM – 12:00 PM | 01:00 PM – 05:00 PM</span>
          </div>
        </div>

        {/* Empty State */}
        {filteredRecords.length === 0 ? (
          <div className="py-12 px-4 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-[#173B67] flex items-center justify-center mx-auto">
              <Fingerprint className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-sm text-slate-900">No Biometric Logs Found</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No time records matching your filters for {selectedDate}. Tap &quot;Sync Biometrics&quot; to fetch logs or add a manual attendance record.
            </p>
            <button
              type="button"
              onClick={() => handleSyncAllDevices()}
              className="px-4 py-2 bg-[#F28C28] text-white text-xs font-bold rounded-xl cursor-pointer"
            >
              Sync Terminals Now
            </button>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Employee</th>
                    <th className="py-3 px-3">Office</th>
                    <th className="py-3 px-3">AM In</th>
                    <th className="py-3 px-3">AM Out</th>
                    <th className="py-3 px-3">PM In</th>
                    <th className="py-3 px-3">PM Out</th>
                    <th className="py-3 px-3 text-center">Tardy</th>
                    <th className="py-3 px-3 text-center">Undertime</th>
                    <th className="py-3 px-3 text-center">Hours</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Terminal / Method</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRecords.map(record => (
                    <tr key={record.id} className="hover:bg-slate-50/80 transition-colors">
                      
                      {/* Employee Info */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{record.employeeName}</div>
                        <div className="text-[11px] text-slate-500 flex items-center space-x-1.5 mt-0.5">
                          <span className="font-mono text-[10px] bg-slate-100 px-1 py-0.2 rounded">
                            {record.employeeNumber}
                          </span>
                          <span>•</span>
                          <span className="truncate max-w-[140px]">{record.position}</span>
                        </div>
                      </td>

                      {/* Office */}
                      <td className="py-3.5 px-3 text-slate-600 truncate max-w-[150px]">
                        {record.officeName}
                      </td>

                      {/* AM In */}
                      <td className="py-3.5 px-3 font-mono font-semibold text-slate-800">
                        {record.amIn ? (
                          <span className={record.tardyMinutes > 0 && record.amIn > '08:00 AM' ? 'text-amber-700 font-bold' : 'text-slate-800'}>
                            {record.amIn}
                          </span>
                        ) : (
                          <span className="text-slate-300">--:--</span>
                        )}
                      </td>

                      {/* AM Out */}
                      <td className="py-3.5 px-3 font-mono text-slate-800">
                        {record.amOut || <span className="text-slate-300">--:--</span>}
                      </td>

                      {/* PM In */}
                      <td className="py-3.5 px-3 font-mono text-slate-800">
                        {record.pmIn || <span className="text-slate-300">--:--</span>}
                      </td>

                      {/* PM Out */}
                      <td className="py-3.5 px-3 font-mono text-slate-800">
                        {record.pmOut ? (
                          <span className={record.undertimeMinutes > 0 && record.pmOut < '05:00 PM' ? 'text-rose-700 font-bold' : 'text-slate-800'}>
                            {record.pmOut}
                          </span>
                        ) : (
                          <span className="text-slate-300">--:--</span>
                        )}
                      </td>

                      {/* Tardy */}
                      <td className="py-3.5 px-3 text-center">
                        {record.tardyMinutes > 0 ? (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 font-mono">
                            {record.tardyMinutes}m
                          </span>
                        ) : (
                          <span className="text-slate-400 font-mono">0</span>
                        )}
                      </td>

                      {/* Undertime */}
                      <td className="py-3.5 px-3 text-center">
                        {record.undertimeMinutes > 0 ? (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 font-mono">
                            {record.undertimeMinutes}m
                          </span>
                        ) : (
                          <span className="text-slate-400 font-mono">0</span>
                        )}
                      </td>

                      {/* Total Hours */}
                      <td className="py-3.5 px-3 text-center font-mono font-bold text-slate-800">
                        {record.totalHours.toFixed(1)}h
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(record.status)}`}>
                          {record.status}
                        </span>
                        {record.remarks && (
                          <span className="text-[10px] text-slate-400 block mt-0.5 truncate max-w-[130px]" title={record.remarks}>
                            {record.remarks}
                          </span>
                        )}
                      </td>

                      {/* Terminal / Method */}
                      <td className="py-3.5 px-3">
                        <span className="text-slate-700 font-semibold block text-[11px] truncate max-w-[130px]">
                          {record.terminalName}
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          {record.verificationMethod}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          {!record.verifiedBy ? (
                            <button
                              type="button"
                              onClick={() => handleVerify(record.id)}
                              className="px-2 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
                              title="Verify daily attendance"
                            >
                              Verify
                            </button>
                          ) : (
                            <span className="text-[10px] text-emerald-600 font-semibold flex items-center mr-1" title={`Verified by ${record.verifiedBy}`}>
                              <CheckCircle2 className="w-3.5 h-3.5 mr-0.5" />
                              <span>OK</span>
                            </span>
                          )}

                          <button
                            type="button"
                            onClick={() => setSelectedDtrRecord(record)}
                            className="p-1 text-slate-400 hover:text-[#173B67] hover:bg-slate-100 rounded-lg cursor-pointer"
                            title="View CSC Form 48 DTR"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenEdit(record)}
                            className="p-1 text-slate-400 hover:text-[#F28C28] hover:bg-slate-100 rounded-lg cursor-pointer"
                            title="Adjust / Edit Time Record"
                          >
                            <SlidersHorizontal className="w-4 h-4" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile View: Touch-Friendly Side-by-Side Cards */}
            <div className="lg:hidden divide-y divide-slate-100">
              {filteredRecords.map(record => (
                <div key={record.id} className="p-3.5 space-y-2.5">
                  
                  {/* Top: Employee & Status Badge */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 leading-snug">
                        {record.employeeName}
                      </h4>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        <span className="font-mono text-[10px] bg-slate-100 px-1.5 py-0.2 rounded font-semibold text-slate-700">
                          {record.employeeNumber}
                        </span>
                        <span className="mx-1">•</span>
                        <span>{record.position}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        {record.officeName}
                      </span>
                    </div>

                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${getStatusBadge(record.status)}`}>
                      {record.status}
                    </span>
                  </div>

                  {/* Side-by-Side Time In & Out Blocks */}
                  <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                    
                    {/* Morning Session */}
                    <div className="space-y-1">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">
                        Morning (AM)
                      </span>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">In:</span>
                        <span className="font-mono font-bold text-slate-800">
                          {record.amIn || '--:--'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">Out:</span>
                        <span className="font-mono text-slate-800">
                          {record.amOut || '--:--'}
                        </span>
                      </div>
                    </div>

                    {/* Afternoon Session */}
                    <div className="space-y-1 border-l border-slate-200/80 pl-2">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">
                        Afternoon (PM)
                      </span>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">In:</span>
                        <span className="font-mono font-bold text-slate-800">
                          {record.pmIn || '--:--'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">Out:</span>
                        <span className="font-mono text-slate-800">
                          {record.pmOut || '--:--'}
                        </span>
                      </div>
                    </div>

                  </div>

                  {/* Metric Chips + Actions */}
                  <div className="flex items-center justify-between pt-1 text-[11px]">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-bold text-slate-600 font-mono">
                        {record.totalHours.toFixed(1)} hrs
                      </span>
                      {record.tardyMinutes > 0 && (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded font-mono">
                          {record.tardyMinutes}m late
                        </span>
                      )}
                      {record.undertimeMinutes > 0 && (
                        <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.2 rounded font-mono">
                          {record.undertimeMinutes}m undertime
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-1.5">
                      {!record.verifiedBy && (
                        <button
                          type="button"
                          onClick={() => handleVerify(record.id)}
                          className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-lg cursor-pointer"
                        >
                          Verify
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setSelectedDtrRecord(record)}
                        className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-[#173B67] text-[10px] font-bold rounded-lg cursor-pointer"
                      >
                        CSC-48
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(record)}
                        className="px-2.5 py-1 bg-orange-50 hover:bg-orange-100 text-[#F28C28] text-[10px] font-bold rounded-lg cursor-pointer"
                      >
                        Adjust
                      </button>
                    </div>
                  </div>

                  {/* Remarks notice if any */}
                  {record.remarks && (
                    <div className="text-[10px] text-slate-500 bg-slate-50 p-1.5 rounded-lg border border-slate-200/60">
                      <span className="font-semibold text-slate-600">Note: </span>
                      {record.remarks}
                    </div>
                  )}

                </div>
              ))}
            </div>
          </>
        )}

      </div>

      {/* 6. Modal: Manual Time Entry / Adjustment */}
      {showAdjustModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 font-sans">
            
            {/* Header */}
            <div className="bg-[#173B67] text-white p-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-blue-200" />
                <h3 className="font-extrabold text-sm sm:text-base">
                  {selectedRecordToEdit ? 'Adjust Biometric Time Record' : 'Manual Time Entry (CSC Form 48)'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAdjustModal(false)}
                className="text-blue-200 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveAdjustment} className="p-4 sm:p-6 space-y-4">
              
              {/* Employee Selection */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Employee
                </label>
                <select
                  disabled={!!selectedRecordToEdit}
                  value={adjustEmpId}
                  onChange={(e) => setAdjustEmpId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 disabled:opacity-75"
                >
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName} ({emp.employeeNumber} • {emp.position})
                    </option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Attendance Date
                </label>
                <input
                  type="date"
                  value={adjustDate}
                  onChange={(e) => setAdjustDate(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800"
                  required
                />
              </div>

              {/* AM Session */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
                  Morning Session (AM)
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-0.5">AM Arrival (In)</label>
                    <input
                      type="text"
                      placeholder="e.g. 07:54 AM"
                      value={adjustAmIn}
                      onChange={(e) => setAdjustAmIn(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-0.5">AM Departure (Out)</label>
                    <input
                      type="text"
                      placeholder="e.g. 12:02 PM"
                      value={adjustAmOut}
                      onChange={(e) => setAdjustAmOut(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* PM Session */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
                  Afternoon Session (PM)
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-0.5">PM Arrival (In)</label>
                    <input
                      type="text"
                      placeholder="e.g. 12:55 PM"
                      value={adjustPmIn}
                      onChange={(e) => setAdjustPmIn(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-0.5">PM Departure (Out)</label>
                    <input
                      type="text"
                      placeholder="e.g. 05:05 PM"
                      value={adjustPmOut}
                      onChange={(e) => setAdjustPmOut(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Status & Remarks */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Status Override</label>
                  <select
                    value={adjustStatus}
                    onChange={(e) => setAdjustStatus(e.target.value as any)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800"
                  >
                    <option value="On Time">On Time</option>
                    <option value="Late / Tardy">Late / Tardy</option>
                    <option value="Undertime">Undertime</option>
                    <option value="Half Day">Half Day</option>
                    <option value="On Leave">On Leave</option>
                    <option value="Official Business (OB)">Official Business (OB)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Justification / Reason</label>
                  <input
                    type="text"
                    placeholder="e.g. Travel Order #TO-41, Pass slip"
                    value={adjustRemarks}
                    onChange={(e) => setAdjustRemarks(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800"
                  />
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAdjustModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#173B67] hover:bg-[#122e50] text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  Save Record
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* 7. Modal: CSC Form 48 DTR Preview & Print */}
      {selectedDtrRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden font-sans max-h-[92vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="bg-[#173B67] text-white p-3.5 sm:p-4 flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-2">
                <Printer className="w-4 h-4 text-blue-200" />
                <h3 className="font-extrabold text-sm sm:text-base">
                  Civil Service Form No. 48 – Daily Time Record
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDtrRecord(null)}
                className="text-blue-200 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Printable Content */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-4 bg-white text-slate-900 text-xs font-serif" id="printable-dtr">
              
              {/* Letterhead */}
              <div className="text-center space-y-1 border-b pb-3 font-sans">
                <div className="flex items-center justify-center space-x-3 mb-1">
                  <img 
                    src="/public/assets/aistudio/logo-300x293_45c24a73.png" 
                    alt="San Jose Seal" 
                    className="w-10 h-10 object-contain"
                  />
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block">
                      Republic of the Philippines
                    </span>
                    <h3 className="text-xs font-black text-[#173B67]">
                      MUNICIPALITY OF SAN JOSE
                    </h3>
                    <span className="text-[9px] text-slate-400">Province of Occidental Mindoro</span>
                  </div>
                  <img 
                    src="/public/assets/aistudio/HR1_5214d096.png" 
                    alt="MHRMO" 
                    className="h-8 w-auto object-contain"
                  />
                </div>
                <div className="font-black text-xs text-slate-800 tracking-wider">
                  CIVIL SERVICE FORM NO. 48 (DAILY TIME RECORD)
                </div>
              </div>

              {/* Employee Particulars */}
              <div className="space-y-1 font-sans text-xs">
                <div className="flex justify-between border-b py-1">
                  <span className="text-slate-500 font-semibold">Name:</span>
                  <span className="font-extrabold text-[#173B67]">{selectedDtrRecord.employeeName}</span>
                </div>
                <div className="flex justify-between border-b py-1">
                  <span className="text-slate-500 font-semibold">Employee ID / Number:</span>
                  <span className="font-mono font-bold text-slate-800">{selectedDtrRecord.employeeNumber}</span>
                </div>
                <div className="flex justify-between border-b py-1">
                  <span className="text-slate-500 font-semibold">Position:</span>
                  <span className="font-semibold text-slate-800">{selectedDtrRecord.position}</span>
                </div>
                <div className="flex justify-between border-b py-1">
                  <span className="text-slate-500 font-semibold">Office / Station:</span>
                  <span className="font-semibold text-slate-800">{selectedDtrRecord.officeName}</span>
                </div>
                <div className="flex justify-between border-b py-1">
                  <span className="text-slate-500 font-semibold">Covered Period:</span>
                  <span className="font-bold text-slate-900">{selectedDtrRecord.date}</span>
                </div>
              </div>

              {/* DTR Extracted Table */}
              <div className="border border-slate-300 rounded-lg overflow-hidden font-sans">
                <table className="w-full text-center text-xs">
                  <thead className="bg-slate-100 text-[10px] font-bold border-b border-slate-300">
                    <tr>
                      <th className="py-2 px-1 border-r" colSpan={2}>Morning (AM)</th>
                      <th className="py-2 px-1 border-r" colSpan={2}>Afternoon (PM)</th>
                      <th className="py-2 px-1 border-r" colSpan={2}>Undertime</th>
                    </tr>
                    <tr className="bg-slate-50 text-[9px] border-t border-slate-200">
                      <th className="py-1 px-1 border-r">Arrival</th>
                      <th className="py-1 px-1 border-r">Departure</th>
                      <th className="py-1 px-1 border-r">Arrival</th>
                      <th className="py-1 px-1 border-r">Departure</th>
                      <th className="py-1 px-1 border-r">Hours</th>
                      <th className="py-1 px-1">Minutes</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="font-mono text-xs">
                      <td className="py-2 px-1 border-r font-bold text-slate-900">{selectedDtrRecord.amIn || '--'}</td>
                      <td className="py-2 px-1 border-r text-slate-800">{selectedDtrRecord.amOut || '--'}</td>
                      <td className="py-2 px-1 border-r text-slate-800">{selectedDtrRecord.pmIn || '--'}</td>
                      <td className="py-2 px-1 border-r font-bold text-slate-900">{selectedDtrRecord.pmOut || '--'}</td>
                      <td className="py-2 px-1 border-r text-slate-800">{Math.floor(selectedDtrRecord.undertimeMinutes / 60)}</td>
                      <td className="py-2 px-1 text-slate-800">{selectedDtrRecord.undertimeMinutes % 60}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* CSC Certification text */}
              <div className="text-[10px] text-slate-600 italic leading-relaxed pt-2">
                I certify on my honor that the above is a true and correct report of the hours of work performed, record of which was made daily at the time of arrival and departure from office.
              </div>

              {/* Signature Blocks */}
              <div className="grid grid-cols-2 gap-6 pt-6 font-sans">
                <div className="text-center">
                  <div className="border-b border-slate-800 pb-1 font-bold text-xs">
                    {selectedDtrRecord.employeeName}
                  </div>
                  <span className="text-[9px] text-slate-500 uppercase tracking-wider block mt-1">
                    Employee Signature
                  </span>
                </div>

                <div className="text-center">
                  <div className="border-b border-slate-800 pb-1 font-bold text-xs">
                    Atty. Maria Elena Castillo
                  </div>
                  <span className="text-[9px] text-slate-500 uppercase tracking-wider block mt-1">
                    Municipal HRMO Department Head I
                  </span>
                </div>
              </div>

            </div>

            {/* Modal Footer Actions */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0 font-sans">
              <span className="text-[10px] text-slate-400">
                Extracted from {selectedDtrRecord.terminalName}
              </span>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setSelectedDtrRecord(null)}
                  className="px-3.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-1.5 bg-[#173B67] hover:bg-[#122e50] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center space-x-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print CSC Form 48</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
