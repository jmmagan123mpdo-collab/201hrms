import React, { useState, useMemo } from 'react';
import { UserAccount, UserRole, Employee } from '../../types/index.ts';
import { INITIAL_ACCOUNTS } from '../../data/operationalData.ts';
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  ShieldCheck, 
  UserCheck, 
  Lock, 
  Key, 
  CheckCircle2, 
  XCircle, 
  Edit, 
  X,
  Building2,
  Mail
} from 'lucide-react';

interface UsersManagerProps {
  employees: Employee[];
}

export const UsersManager: React.FC<UsersManagerProps> = ({ employees }) => {
  const [accounts, setAccounts] = useState<UserAccount[]>(INITIAL_ACCOUNTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);

  // Form State
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState<UserRole>('hr_staff');
  const [selectedEmpId, setSelectedEmpId] = useState(employees[0]?.id || '');

  const filteredAccounts = useMemo(() => {
    return accounts.filter(acc => {
      if (roleFilter !== 'all' && acc.role !== roleFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = acc.displayName.toLowerCase().includes(q);
        const matchUser = acc.username.toLowerCase().includes(q);
        const matchEmail = acc.email.toLowerCase().includes(q);
        if (!matchName && !matchUser && !matchEmail) return false;
      }
      return true;
    });
  }, [accounts, roleFilter, searchQuery]);

  // Stats
  const totalAccounts = accounts.length;
  const adminCount = accounts.filter(a => a.role === 'hr_admin' || a.role === 'developer').length;
  const staffCount = accounts.filter(a => a.role === 'hr_staff' || a.role === 'payroll').length;
  const essCount = accounts.filter(a => a.role === 'employee').length;

  const handleToggleStatus = (uid: string) => {
    setAccounts(prev => prev.map(a => a.uid === uid ? { ...a, isActive: !a.isActive } : a));
  };

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !email.trim() || !displayName.trim()) {
      alert('Please fill in username, email, and display name.');
      return;
    }

    const newAcc: UserAccount = {
      uid: `user-${Date.now().toString().slice(-4)}`,
      username: username.trim(),
      email: email.trim(),
      displayName: displayName.trim(),
      role,
      employeeId: selectedEmpId,
      permissions: role === 'hr_admin' ? [
        'view_employees', 'add_employees', 'edit_employees',
        'upload_documents', 'scan_documents', 'verify_documents',
        'request_documents', 'process_leave', 'process_wellness',
        'generate_reports', 'manage_offices'
      ] : ['view_employees', 'upload_documents', 'scan_documents', 'verify_documents'],
      isActive: true,
      lastLogin: 'Never',
      createdAt: new Date().toISOString().split('T')[0]
    };

    setAccounts(prev => [newAcc, ...prev]);
    setShowCreateModal(false);
    setUsername('');
    setEmail('');
    setDisplayName('');
  };

  const handleSaveRole = (newRole: UserRole) => {
    if (!editingUser) return;
    setAccounts(prev => prev.map(a => a.uid === editingUser.uid ? { ...a, role: newRole } : a));
    setEditingUser(null);
  };

  return (
    <div className="space-y-4 font-sans text-xs">
      
      {/* Top Banner Header */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-blue-100 text-[#173B67] text-[10px] font-bold uppercase tracking-wider mb-1">
            <Users className="w-3 h-3 text-[#173B67]" />
            <span>Role-Based Access Control (RBAC)</span>
          </div>
          <h2 className="text-base sm:text-xl font-extrabold text-slate-900 tracking-tight">
            User Accounts & Roles Management
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Administer system logins, security privileges, HR staff authorizations, and Employee Self-Service accounts.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 bg-[#173B67] hover:bg-[#122e50] text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center space-x-1.5 cursor-pointer text-xs shrink-0"
        >
          <Plus className="w-4 h-4 text-amber-300" />
          <span>Create / Invite User Account</span>
        </button>
      </div>

      {/* 4 Stat KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
        <div className="bg-white p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider block truncate">
            Total System Accounts
          </span>
          <div className="text-lg sm:text-2xl font-extrabold text-[#173B67] mt-1 font-mono">
            {totalAccounts}
          </div>
          <span className="text-[10px] text-slate-400 block mt-0.5">Registered in Firestore</span>
        </div>

        <div className="bg-white p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider block truncate">
            HR Administrators
          </span>
          <div className="text-lg sm:text-2xl font-extrabold text-blue-700 mt-1 font-mono">
            {adminCount}
          </div>
          <span className="text-[10px] text-blue-700 font-semibold block mt-0.5">Full System Privilege</span>
        </div>

        <div className="bg-white p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider block truncate">
            HR Staff & Payroll
          </span>
          <div className="text-lg sm:text-2xl font-extrabold text-indigo-700 mt-1 font-mono">
            {staffCount}
          </div>
          <span className="text-[10px] text-slate-400 block mt-0.5">Processing Personnel</span>
        </div>

        <div className="bg-white p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider block truncate">
            Active ESS Accounts
          </span>
          <div className="text-lg sm:text-2xl font-extrabold text-[#F28C28] mt-1 font-mono">
            {essCount}
          </div>
          <span className="text-[10px] text-[#F28C28] font-semibold block mt-0.5">Employee Self-Service</span>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
          <div className="sm:col-span-3 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by Name, Username, or Email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl bg-white text-xs focus:ring-2 focus:ring-[#173B67] focus:outline-none"
            />
          </div>

          <div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-xl bg-white text-xs font-semibold text-slate-800"
            >
              <option value="all">All Roles & Permissions</option>
              <option value="hr_admin">HR Administrator</option>
              <option value="hr_staff">HR Staff Specialist</option>
              <option value="payroll">Payroll Officer</option>
              <option value="developer">Developer</option>
              <option value="employee">Employee (ESS)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
            Active System Accounts ({filteredAccounts.length})
          </h3>
          <span className="text-[11px] text-slate-500">
            Encrypted Authentication & Session Persistence
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-200">
                <th className="py-3 px-4">User & Username</th>
                <th className="py-3 px-4">Official Email</th>
                <th className="py-3 px-4 text-center">Assigned Role</th>
                <th className="py-3 px-4 text-center">Permissions</th>
                <th className="py-3 px-4 text-center">Last Login</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredAccounts.map(acc => (
                <tr key={acc.uid} className="hover:bg-blue-50/40 transition-colors">
                  
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{acc.displayName}</div>
                    <div className="font-mono text-[10px] text-slate-500">@{acc.username}</div>
                  </td>

                  <td className="py-3 px-4 font-mono text-slate-700">
                    {acc.email}
                  </td>

                  <td className="py-3 px-4 text-center">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      acc.role === 'hr_admin' ? 'bg-blue-100 text-[#173B67] border border-blue-200' :
                      acc.role === 'hr_staff' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' :
                      acc.role === 'payroll' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      acc.role === 'developer' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                      'bg-orange-50 text-[#F28C28] border border-orange-200'
                    }`}>
                      {acc.role.toUpperCase().replace('_', ' ')}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-center">
                    <span className="font-semibold text-slate-700">
                      {acc.role === 'hr_admin' ? 'All Privileges (11)' : `${acc.permissions?.length || 0} allowed`}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-center font-mono text-[11px] text-slate-500">
                    {acc.lastLogin || 'Never'}
                  </td>

                  <td className="py-3 px-4 text-center">
                    <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      acc.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                    }`}>
                      {acc.isActive ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      <span>{acc.isActive ? 'Active' : 'Suspended'}</span>
                    </span>
                  </td>

                  <td className="py-3 px-4 text-right space-x-1.5">
                    <button
                      type="button"
                      onClick={() => setEditingUser(acc)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg cursor-pointer text-xs"
                    >
                      Change Role
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(acc.uid)}
                      className={`px-2.5 py-1 font-bold rounded-lg cursor-pointer text-xs ${
                        acc.isActive ? 'bg-rose-50 hover:bg-rose-100 text-rose-700' : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {acc.isActive ? 'Suspend' : 'Activate'}
                    </button>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden flex flex-col my-auto">
            
            <div className="p-4 bg-[#173B67] text-white flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-2.5">
                <Users className="w-5 h-5 text-amber-300" />
                <h3 className="font-bold text-base">Create / Invite User Account</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAccount} className="p-5 space-y-4 text-xs">
              
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Full Display Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Maria Santos, HR Officer"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-xl bg-white text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Username</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. msantos"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-xl bg-white font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. msantos@sanjose.gov.ph"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-xl bg-white text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Assign User Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl bg-white text-xs font-semibold"
                >
                  <option value="hr_staff">HR Staff – Upload, scan, verify, and process documents</option>
                  <option value="hr_admin">HR Administrator – Full administrative permissions</option>
                  <option value="payroll">Payroll Officer – Manage payslips and compensation</option>
                  <option value="developer">Developer – System testing and maintenance</option>
                  <option value="employee">Employee – Employee Self-Service (ESS) access</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Link to Employee Profile (Optional)</label>
                <select
                  value={selectedEmpId}
                  onChange={(e) => setSelectedEmpId(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-xl bg-white text-xs font-bold"
                >
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName} ({emp.employeeNumber}) – {emp.officeName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl bg-white text-slate-700 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#173B67] hover:bg-[#122e50] text-white font-bold rounded-xl shadow-md cursor-pointer flex items-center space-x-1.5"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Create Account</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Change Role Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full border border-slate-200 overflow-hidden flex flex-col my-auto p-5 space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-bold text-slate-900">Modify Role: {editingUser.displayName}</h3>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              {(['hr_admin', 'hr_staff', 'payroll', 'employee'] as UserRole[]).map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => handleSaveRole(r)}
                  className={`w-full p-2.5 rounded-xl text-left font-bold text-xs border transition-all cursor-pointer flex items-center justify-between ${
                    editingUser.role === r ? 'bg-blue-50 border-[#173B67] text-[#173B67]' : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span>{r.toUpperCase().replace('_', ' ')}</span>
                  {editingUser.role === r && <CheckCircle2 className="w-4 h-4 text-[#173B67]" />}
                </button>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="px-4 py-2 border border-slate-300 rounded-xl font-bold cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
