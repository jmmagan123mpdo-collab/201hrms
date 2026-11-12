import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useData } from '../../context/DataContext.tsx';
import { 
  Bell, 
  LogOut, 
  User, 
  CheckCircle2, 
  Clock, 
  FileText, 
  ChevronDown, 
  Sparkles, 
  Menu, 
  X,
  Search,
  FolderLock,
  UserSquare2,
  Users,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { UserRole, Employee, EmployeeDocument } from '../../types/index.ts';

interface HeaderProps {
  onToggleMobileMenu?: () => void;
  isMobileMenuOpen?: boolean;
  onSelectEmployeeProfile?: (employee: Employee) => void;
  onSelectEmployee201?: (employee: Employee) => void;
  onNavigateToMasterlist?: (employee?: Employee) => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  onToggleMobileMenu, 
  isMobileMenuOpen,
  onSelectEmployeeProfile,
  onSelectEmployee201,
  onNavigateToMasterlist
}) => {
  const { currentUser, currentEmployee, logout, quickSwitchRole, activePortal, setActivePortal } = useAuth();
  const { employees, documents, notifications, markNotificationRead, markAllNotificationsRead, isFirebaseConnected } = useData();
  
  const [showNotifDrawer, setShowNotifDrawer] = useState(false);
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);

  // Global Search Bar State
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [activeFilterTab, setActiveFilterTab] = useState<'all' | 'employees' | 'documents'>('all');
  
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const mobileSearchInputRef = useRef<HTMLInputElement>(null);

  // Global keyboard shortcut (Ctrl+K or Cmd+K) to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (searchInputRef.current) {
          searchInputRef.current.focus();
          setIsSearchFocused(true);
        } else {
          setIsMobileSearchOpen(true);
        }
      }
      if (e.key === 'Escape') {
        setIsSearchFocused(false);
        setIsMobileSearchOpen(false);
        searchInputRef.current?.blur();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Click outside listener to dismiss search dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus mobile input when mobile search is toggled
  useEffect(() => {
    if (isMobileSearchOpen && mobileSearchInputRef.current) {
      mobileSearchInputRef.current.focus();
    }
  }, [isMobileSearchOpen]);

  // Context-aware notifications based on active portal & employee profile
  const relevantNotifs = notifications.filter(n => {
    if (activePortal === 'ess' || currentUser?.role === 'employee') {
      const empId = currentUser?.employeeId || currentEmployee?.id || 'EMP-2022-001';
      if (n.recipientEmployeeId && n.recipientEmployeeId === empId) return true;
      if (n.recipientRole === 'employee' || n.recipientRole === 'all') return true;
      return false;
    }
    return n.recipientRole !== 'employee';
  });

  const unreadNotifs = relevantNotifs.filter(n => !n.isRead);

  const getRoleBadge = (role?: UserRole) => {
    switch (role) {
      case 'developer':
        return { label: 'System Developer', bg: 'bg-purple-100 text-purple-800 border-purple-200' };
      case 'hr_admin':
        return { label: 'HR Administrator', bg: 'bg-blue-100 text-blue-900 border-blue-200' };
      case 'hr_staff':
        return { label: 'HR Staff', bg: 'bg-sky-100 text-sky-800 border-sky-200' };
      case 'payroll':
        return { label: 'Payroll Personnel', bg: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
      case 'employee':
        return { label: 'Personnel (ESS)', bg: 'bg-amber-100 text-amber-900 border-amber-200' };
      default:
        return { label: 'Guest', bg: 'bg-gray-100 text-gray-800 border-gray-200' };
    }
  };

  const badge = getRoleBadge(currentUser?.role);

  // Search Results Computation
  const query = searchQuery.trim().toLowerCase();
  
  const matchedEmployees = query
    ? employees.filter(emp => {
        const fullName = `${emp.firstName} ${emp.middleName || ''} ${emp.lastName} ${emp.suffix || ''}`.toLowerCase();
        const reverseName = `${emp.lastName}, ${emp.firstName} ${emp.middleName || ''}`.toLowerCase();
        const id = emp.id.toLowerCase();
        const empNum = emp.employeeNumber.toLowerCase();
        const prevNums = (emp.previousEmployeeNumbers || []).map(p => p.toLowerCase()).join(' ');
        const office = emp.officeName.toLowerCase();
        const pos = emp.position.toLowerCase();
        const classification = emp.classification.toLowerCase();

        return (
          fullName.includes(query) ||
          reverseName.includes(query) ||
          id.includes(query) ||
          empNum.includes(query) ||
          prevNums.includes(query) ||
          office.includes(query) ||
          pos.includes(query) ||
          classification.includes(query)
        );
      })
    : [];

  const matchedDocuments = query
    ? documents.filter(doc => {
        const docName = doc.documentName.toLowerCase();
        const docCode = doc.documentTypeCode.toLowerCase();
        const fileName = (doc.fileName || '').toLowerCase();
        const emp = employees.find(e => e.id === doc.employeeId);
        const empName = emp ? `${emp.firstName} ${emp.lastName}`.toLowerCase() : '';
        const empNum = emp ? emp.employeeNumber.toLowerCase() : '';

        return (
          docName.includes(query) ||
          docCode.includes(query) ||
          fileName.includes(query) ||
          (query.length >= 3 && (empName.includes(query) || empNum.includes(query)))
        );
      })
    : [];

  // Default suggested employees when search input is focused but empty
  const suggestedEmployees = !query ? employees.slice(0, 4) : [];

  const totalResultsCount = matchedEmployees.length + matchedDocuments.length;
  const isHRUser = currentUser?.role !== 'employee' || activePortal === 'hr';

  // Result Selection Handlers
  const handleSelectProfile = (emp: Employee) => {
    if (activePortal !== 'hr') setActivePortal('hr');
    if (onSelectEmployeeProfile) {
      onSelectEmployeeProfile(emp);
    }
    setIsSearchFocused(false);
    setIsMobileSearchOpen(false);
  };

  const handleSelect201 = (emp: Employee) => {
    if (activePortal !== 'hr') setActivePortal('hr');
    if (onSelectEmployee201) {
      onSelectEmployee201(emp);
    }
    setIsSearchFocused(false);
    setIsMobileSearchOpen(false);
  };

  const handleSelectMasterlist = (emp: Employee) => {
    if (activePortal !== 'hr') setActivePortal('hr');
    if (onNavigateToMasterlist) {
      onNavigateToMasterlist(emp);
    }
    setIsSearchFocused(false);
    setIsMobileSearchOpen(false);
  };

  const handleSelectDocument = (doc: EmployeeDocument) => {
    const owner = employees.find(e => e.id === doc.employeeId);
    if (owner) {
      handleSelect201(owner);
    }
  };

  // Render Search Dropdown Content
  const renderSearchResultsDropdown = () => (
    <div className="absolute top-full left-0 right-0 sm:left-auto sm:right-auto sm:w-[540px] md:w-[600px] mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-in fade-in zoom-in-95 max-h-[80vh] flex flex-col">
      
      {/* Header bar with filters */}
      <div className="p-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-1.5 font-bold text-slate-700">
          <Search className="w-3.5 h-3.5 text-[#173B67]" />
          <span>
            {query ? (
              <>Results for &ldquo;<span className="text-[#173B67]">{searchQuery}</span>&rdquo;</>
            ) : (
              'Quick Personnel Search'
            )}
          </span>
          {query && (
            <span className="text-[10px] bg-blue-100 text-[#173B67] px-2 py-0.2 rounded-full font-bold ml-1">
              {totalResultsCount} found
            </span>
          )}
        </div>

        {/* Filter Tabs */}
        {query && totalResultsCount > 0 && (
          <div className="flex items-center space-x-1 bg-white p-0.5 rounded-lg border border-slate-200 text-[10px] font-bold">
            <button
              type="button"
              onClick={() => setActiveFilterTab('all')}
              className={`px-2 py-0.5 rounded ${activeFilterTab === 'all' ? 'bg-[#173B67] text-white' : 'text-slate-600 hover:text-slate-900'} cursor-pointer`}
            >
              All ({totalResultsCount})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilterTab('employees')}
              className={`px-2 py-0.5 rounded ${activeFilterTab === 'employees' ? 'bg-[#173B67] text-white' : 'text-slate-600 hover:text-slate-900'} cursor-pointer`}
            >
              Personnel ({matchedEmployees.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilterTab('documents')}
              className={`px-2 py-0.5 rounded ${activeFilterTab === 'documents' ? 'bg-[#173B67] text-white' : 'text-slate-600 hover:text-slate-900'} cursor-pointer`}
            >
              201 Docs ({matchedDocuments.length})
            </button>
          </div>
        )}
      </div>

      {/* Results Scroll Area */}
      <div className="overflow-y-auto divide-y divide-slate-100 p-2 space-y-2 max-h-[65vh]">
        
        {/* If query has NO matches */}
        {query && totalResultsCount === 0 && (
          <div className="p-8 text-center space-y-2">
            <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-800 text-xs sm:text-sm">No matching personnel or 201 documents</h4>
            <p className="text-slate-500 text-xs max-w-sm mx-auto">
              Try searching by last name, employee number (e.g. <span className="font-mono font-bold text-slate-700">SJ-PERM-0142</span>), ID (<span className="font-mono font-bold text-slate-700">EMP-2022-001</span>), or office.
            </p>
          </div>
        )}

        {/* Suggested Personnel (when query is empty) */}
        {!query && (
          <div className="p-2 space-y-2">
            <div className="px-2 pt-1 pb-0.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Recently Active Personnel</span>
              <span className="text-[10px] text-slate-400 font-normal">Press Esc to close</span>
            </div>
            <div className="space-y-1.5">
              {suggestedEmployees.map(emp => (
                <div 
                  key={emp.id}
                  className="p-2.5 rounded-xl bg-slate-50 hover:bg-blue-50/50 border border-slate-100 hover:border-blue-200 transition-all flex items-center justify-between gap-3"
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-[#173B67] text-white flex items-center justify-center font-bold text-xs shrink-0">
                      {emp.firstName.charAt(0)}{emp.lastName.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-xs text-slate-900 truncate">
                          {emp.lastName}, {emp.firstName} {emp.middleName ? `${emp.middleName.charAt(0)}.` : ''}
                        </span>
                        <span className="text-[9px] bg-blue-100 text-[#173B67] px-1.5 py-0.2 rounded font-bold">
                          {emp.classification}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 truncate mt-0.5">
                        <span className="font-mono font-medium">{emp.id}</span> • {emp.position} • {emp.officeName}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleSelectProfile(emp)}
                      className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-[11px] font-bold text-slate-700 transition-colors cursor-pointer flex items-center space-x-1"
                      title="View Profile Modal"
                    >
                      <UserSquare2 className="w-3.5 h-3.5 text-blue-700" />
                      <span>Profile</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelect201(emp)}
                      className="px-2.5 py-1 bg-[#173B67] hover:bg-[#122e50] text-white rounded-lg text-[11px] font-bold transition-colors cursor-pointer flex items-center space-x-1"
                      title="Open 201 Files"
                    >
                      <FolderLock className="w-3.5 h-3.5" />
                      <span>201</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section 1: Matched Personnel */}
        {(activeFilterTab === 'all' || activeFilterTab === 'employees') && matchedEmployees.length > 0 && (
          <div className="p-2 space-y-1.5">
            <div className="px-2 pt-1 pb-0.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center space-x-1">
                <Users className="w-3 h-3 text-[#173B67]" />
                <span>Personnel Masterlist & Profiles ({matchedEmployees.length})</span>
              </span>
            </div>

            {matchedEmployees.map(emp => (
              <div 
                key={emp.id}
                className="p-3 rounded-xl bg-white hover:bg-blue-50/60 border border-slate-200 hover:border-blue-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow-2xs"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-[#173B67] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                    {emp.firstName.charAt(0)}{emp.lastName.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="font-bold text-xs sm:text-sm text-slate-900">
                        {emp.lastName}, {emp.firstName} {emp.middleName ? `${emp.middleName.charAt(0)}.` : ''} {emp.suffix || ''}
                      </span>
                      <span className="text-[10px] bg-[#F28C28] text-white px-2 py-0.2 rounded-full font-bold">
                        {emp.classification}
                      </span>
                      <span className="text-[10px] font-mono text-blue-900 bg-blue-50 border border-blue-200 px-1.5 py-0.2 rounded font-bold">
                        {emp.id}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5 flex flex-wrap items-center gap-x-2">
                      <span className="font-mono text-slate-700 font-semibold">{emp.employeeNumber}</span>
                      <span>•</span>
                      <span>{emp.position}</span>
                      <span>•</span>
                      <span className="font-medium text-slate-600">{emp.officeName}</span>
                    </div>
                  </div>
                </div>

                {/* Direct Action Buttons */}
                <div className="flex items-center space-x-1.5 shrink-0 self-end sm:self-center pt-1 sm:pt-0">
                  <button
                    type="button"
                    onClick={() => handleSelectProfile(emp)}
                    className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors flex items-center space-x-1 cursor-pointer"
                    title="Open Detailed Profile Modal"
                  >
                    <UserSquare2 className="w-3.5 h-3.5 text-blue-700" />
                    <span>Profile</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelect201(emp)}
                    className="px-2.5 py-1.5 bg-[#173B67] hover:bg-[#122e50] text-white rounded-lg text-xs font-bold transition-colors flex items-center space-x-1 cursor-pointer shadow-xs"
                    title="Open 201 Files Manager"
                  >
                    <FolderLock className="w-3.5 h-3.5 text-orange-400" />
                    <span>201 Files</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectMasterlist(emp)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                    title="View in Masterlist"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Section 2: Matched 201 Document Files */}
        {(activeFilterTab === 'all' || activeFilterTab === 'documents') && matchedDocuments.length > 0 && (
          <div className="p-2 space-y-1.5">
            <div className="px-2 pt-1 pb-0.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center space-x-1">
                <FileText className="w-3 h-3 text-[#F28C28]" />
                <span>201 Personnel Documents ({matchedDocuments.length})</span>
              </span>
            </div>

            {matchedDocuments.slice(0, 8).map(doc => {
              const owner = employees.find(e => e.id === doc.employeeId);
              return (
                <div 
                  key={doc.id}
                  className="p-2.5 rounded-xl bg-slate-50/70 hover:bg-orange-50/50 border border-slate-200/80 transition-all flex items-center justify-between gap-3"
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-orange-100 text-[#F28C28] flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-xs text-slate-900 truncate">
                          {doc.documentName}
                        </span>
                        <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                          doc.status === 'verified' ? 'bg-emerald-100 text-emerald-800' :
                          doc.status === 'for_review' ? 'bg-blue-100 text-blue-800' :
                          doc.status === 'returned' ? 'bg-orange-100 text-orange-800' :
                          'bg-rose-100 text-rose-800'
                        }`}>
                          {doc.status}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 truncate mt-0.5">
                        Owner: <strong className="text-slate-700">{owner ? `${owner.lastName}, ${owner.firstName}` : doc.employeeId}</strong> • {owner?.officeName || 'Municipal Office'}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSelectDocument(doc)}
                    className="px-2.5 py-1 bg-white hover:bg-orange-50 text-[#F28C28] border border-orange-200 rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0 flex items-center space-x-1"
                  >
                    <span>Open 201</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Footer shortcut helper */}
      <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
        <span className="flex items-center space-x-1">
          <span>Navigate with</span>
          <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-mono">↑</kbd>
          <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-mono">↓</kbd>
          <span>or click actions</span>
        </span>
        <button
          type="button"
          onClick={() => {
            setIsSearchFocused(false);
            setIsMobileSearchOpen(false);
          }}
          className="text-slate-400 hover:text-slate-600 font-bold"
        >
          Close [Esc]
        </button>
      </div>

    </div>
  );

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2 sm:gap-4">
          
          {/* Left: Branding & Logos & Hamburger (Mobile) */}
          <div className="flex items-center space-x-1 sm:space-x-3 shrink-0">
            {activePortal === 'hr' && onToggleMobileMenu && (
              <button
                type="button"
                onClick={onToggleMobileMenu}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center -ml-2 text-slate-700 hover:bg-slate-100 rounded-xl md:hidden transition-colors cursor-pointer"
                aria-label="Toggle Navigation Menu"
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5 text-[#173B67]" />
                ) : (
                  <Menu className="w-5 h-5 text-[#173B67]" />
                )}
              </button>
            )}

            <div 
              className="flex items-center space-x-2 cursor-pointer" 
              onClick={() => setActivePortal(currentUser?.role === 'employee' ? 'ess' : 'hr')}
            >
              <img 
                src="/public/assets/aistudio/logo-300x293_45c24a73.png" 
                alt="San Jose Municipal Seal" 
                className="w-8 h-8 sm:w-10 sm:h-10 object-contain drop-shadow-xs"
              />
              <img 
                src="/public/assets/aistudio/HR1_5214d096.png" 
                alt="MHRMO Logo" 
                className="h-7 sm:h-8 w-auto object-contain hidden lg:block"
              />
            </div>
            
            <div className="border-l border-slate-200 pl-2 sm:pl-3 hidden xs:block">
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                <span className="font-extrabold text-[#173B67] tracking-tight text-base sm:text-lg">SJHR201</span>
                <span className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full font-semibold border bg-slate-100 text-slate-700">
                  {activePortal === 'ess' ? 'ESS' : 'HR'}
                </span>
                {isFirebaseConnected && (
                  <span className="hidden xl:inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1 animate-pulse"></span>
                    Live
                  </span>
                )}
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-500 hidden xl:block">
                Municipality of San Jose, Occidental Mindoro
              </p>
            </div>
          </div>

          {/* Center: Global Search Bar for HR Users across Masterlist, 201 Files & Profiles */}
          {isHRUser && (
            <div className="flex-1 max-w-lg mx-2 hidden md:block relative" ref={searchContainerRef}>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  placeholder="Search personnel by name, ID (e.g. EMP-2022-001), 201 files..."
                  className="w-full bg-slate-100 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-[#173B67] rounded-xl pl-9 pr-16 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#173B67]/20 transition-all shadow-2xs"
                  aria-label="Global search across masterlist, 201 files, and profiles"
                />

                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center space-x-1">
                  {searchQuery ? (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        searchInputRef.current?.focus();
                      }}
                      className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                      title="Clear search"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <kbd className="hidden lg:inline-flex items-center px-1.5 py-0.5 text-[9px] font-mono text-slate-400 bg-white border border-slate-200 rounded shadow-2xs">
                      ⌘K
                    </kbd>
                  )}
                </div>
              </div>

              {/* Desktop Dropdown Popover */}
              {isSearchFocused && renderSearchResultsDropdown()}
            </div>
          )}

          {/* Right: Search Toggle (Mobile), Quick Role Switcher, Notifications & User Info */}
          <div className="flex items-center space-x-1 sm:space-x-2 shrink-0">
            
            {/* Mobile Search Trigger Button (Only visible on small screens for HR users) */}
            {isHRUser && (
              <button
                type="button"
                onClick={() => setIsMobileSearchOpen(true)}
                className="md:hidden min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-600 hover:text-[#173B67] hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                title="Search personnel or documents"
                aria-label="Search personnel or documents"
              >
                <Search className="w-5 h-5" />
              </button>
            )}

            {/* Demo Role Switcher Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
                className="min-h-[44px] px-2.5 py-1.5 flex items-center space-x-1 text-xs font-medium rounded-xl text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-colors cursor-pointer"
                title="Switch test account role"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span className="hidden sm:inline">Role Switcher</span>
                <ChevronDown className="w-3 h-3 text-slate-500" />
              </button>

              {showRoleSwitcher && (
                <div className="fixed sm:absolute inset-x-2 sm:inset-x-auto right-auto sm:right-0 top-14 sm:top-auto sm:mt-2 w-[calc(100vw-1rem)] sm:w-56 bg-white rounded-2xl sm:rounded-xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 flex items-center justify-between">
                    <span>Quick Role Test</span>
                    <button 
                      onClick={() => setShowRoleSwitcher(false)}
                      className="sm:hidden text-slate-400 hover:text-slate-600 p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <button
                    onClick={() => { quickSwitchRole('developer'); setShowRoleSwitcher(false); }}
                    className="w-full text-left px-3 py-2.5 text-xs flex items-center justify-between hover:bg-slate-50 text-purple-900 cursor-pointer min-h-[44px]"
                  >
                    <span>Developer</span>
                    <span className="text-[10px] bg-purple-100 px-1.5 py-0.5 rounded text-purple-700 font-semibold">dev_sanjose</span>
                  </button>
                  <button
                    onClick={() => { quickSwitchRole('hr_admin'); setShowRoleSwitcher(false); }}
                    className="w-full text-left px-3 py-2.5 text-xs flex items-center justify-between hover:bg-slate-50 text-blue-900 cursor-pointer min-h-[44px]"
                  >
                    <span>HR Administrator</span>
                    <span className="text-[10px] bg-blue-100 px-1.5 py-0.5 rounded text-blue-700 font-semibold">hr_admin</span>
                  </button>
                  <button
                    onClick={() => { quickSwitchRole('hr_staff'); setShowRoleSwitcher(false); }}
                    className="w-full text-left px-3 py-2.5 text-xs flex items-center justify-between hover:bg-slate-50 text-sky-900 cursor-pointer min-h-[44px]"
                  >
                    <span>HR Staff (Encoder)</span>
                    <span className="text-[10px] bg-sky-100 px-1.5 py-0.5 rounded text-sky-700 font-semibold">hr_staff</span>
                  </button>
                  <button
                    onClick={() => { quickSwitchRole('payroll'); setShowRoleSwitcher(false); }}
                    className="w-full text-left px-3 py-2.5 text-xs flex items-center justify-between hover:bg-slate-50 text-emerald-900 cursor-pointer min-h-[44px]"
                  >
                    <span>Payroll Personnel</span>
                    <span className="text-[10px] bg-emerald-100 px-1.5 py-0.5 rounded text-emerald-700 font-semibold">payroll_officer</span>
                  </button>
                  <button
                    onClick={() => { quickSwitchRole('employee'); setShowRoleSwitcher(false); }}
                    className="w-full text-left px-3 py-2.5 text-xs flex items-center justify-between hover:bg-slate-50 text-amber-900 border-t border-slate-100 cursor-pointer min-h-[44px]"
                  >
                    <span>Employee (ESS)</span>
                    <span className="text-[10px] bg-amber-100 px-1.5 py-0.5 rounded text-amber-700 font-semibold">msantos</span>
                  </button>
                </div>
              )}
            </div>

            {/* Notifications Button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowNotifDrawer(!showNotifDrawer)}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl relative transition-colors cursor-pointer"
                title="Notifications"
                aria-label="View notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadNotifs.length > 0 && (
                  <span className="absolute top-2 right-2 w-4 h-4 bg-rose-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
                    {unreadNotifs.length}
                  </span>
                )}
              </button>

              {/* Notification Drawer */}
              {showNotifDrawer && (
                <div className="fixed sm:absolute inset-x-2 sm:inset-x-auto right-auto sm:right-0 top-14 sm:top-auto sm:mt-2 w-[calc(100vw-1rem)] sm:w-96 bg-white rounded-2xl sm:rounded-xl shadow-2xl border border-slate-200 py-3 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-800 text-sm block">System Notifications</span>
                      <span className="text-[10px] text-slate-500">{unreadNotifs.length} unread • {relevantNotifs.length} total</span>
                    </div>
                    {unreadNotifs.length > 0 && (
                      <button
                        type="button"
                        onClick={() => markAllNotificationsRead()}
                        className="text-[11px] font-bold text-[#F28C28] hover:text-orange-700 cursor-pointer"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {relevantNotifs.length === 0 ? (
                      <div className="px-4 py-8 text-center text-slate-400 text-xs">
                        No notifications currently.
                      </div>
                    ) : (
                      relevantNotifs.map(notif => (
                        <div
                          key={notif.id}
                          onClick={() => {
                            markNotificationRead(notif.id);
                            if (notif.targetTab && activePortal === 'ess') {
                              setShowNotifDrawer(false);
                            }
                          }}
                          className={`p-3.5 hover:bg-orange-50/30 transition-colors cursor-pointer ${notif.isRead ? 'opacity-75' : 'bg-orange-50/40'}`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <h4 className={`text-xs leading-snug ${!notif.isRead ? 'font-black text-slate-900' : 'font-semibold text-slate-700'}`}>
                              {notif.title}
                            </h4>
                            {!notif.isRead && (
                              <span className="w-2 h-2 rounded-full bg-[#F28C28] shrink-0 mt-1"></span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">{notif.message}</p>
                          <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-100 text-[10px] text-slate-400">
                            <span>
                              {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(notif.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                            </span>
                            {notif.actionLabel && (
                              <span className="text-[#F28C28] font-bold">
                                {notif.actionLabel} &rarr;
                              </span>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Summary */}
            <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-[#173B67] text-white flex items-center justify-center text-xs font-bold shadow-xs">
                {currentUser?.displayName ? currentUser.displayName.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="hidden lg:block text-left">
                <div className="text-xs font-semibold text-slate-800 leading-tight">
                  {currentUser?.displayName || 'User'}
                </div>
                <div className="flex items-center space-x-1.5 mt-0.5">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${badge.bg}`}>
                    {badge.label}
                  </span>
                  {currentUser?.employeeId && (
                    <span className="text-[10px] text-slate-400 font-mono">
                      {currentUser.employeeId}
                    </span>
                  )}
                </div>
              </div>

              {/* Logout Button */}
              <button
                type="button"
                onClick={logout}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                title="Sign Out"
                aria-label="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>
      </div>

      {/* Mobile Search Overlay Modal (When mobile search is activated) */}
      {isMobileSearchOpen && isHRUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs md:hidden animate-in fade-in">
          <div className="bg-white min-h-[50vh] max-h-[90vh] rounded-b-3xl shadow-2xl p-4 flex flex-col space-y-3">
            <div className="flex items-center space-x-2 border-b border-slate-200 pb-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  ref={mobileSearchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search personnel by name or ID..."
                  className="w-full bg-slate-100 rounded-xl pl-9 pr-8 py-2.5 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#173B67]"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={() => setIsMobileSearchOpen(false)}
                className="px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {renderSearchResultsDropdown()}
            </div>
          </div>
        </div>
      )}

    </header>
  );
};
