import React, { useState } from 'react';
import { useData } from '../../context/DataContext.tsx';
import { useAuth } from '../../context/AuthContext.tsx';
import { Employee, EmploymentClassification, EmploymentStatus, RecordStatus } from '../../types/index.ts';
import { 
  Users, 
  Search, 
  Filter, 
  Download, 
  Plus, 
  Eye, 
  Edit, 
  FolderLock, 
  Archive, 
  CheckCircle2, 
  AlertCircle,
  Building2,
  FileSpreadsheet,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import * as XLSX from 'xlsx';

interface EmployeeMasterlistProps {
  onOpenProfile: (emp: Employee) => void;
  onOpen201Files: (emp: Employee) => void;
  onOpenAddModal: () => void;
  initialSearchTerm?: string;
}

export const EmployeeMasterlist: React.FC<EmployeeMasterlistProps> = ({
  onOpenProfile,
  onOpen201Files,
  onOpenAddModal,
  initialSearchTerm = ''
}) => {
  const { employees, offices, archiveEmployee } = useData();
  const { hasPermission } = useAuth();

  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [selectedOffice, setSelectedOffice] = useState<string>('all');
  const [selectedClassification, setSelectedClassification] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  React.useEffect(() => {
    if (initialSearchTerm) {
      setSearchTerm(initialSearchTerm);
    }
  }, [initialSearchTerm]);

  // Filter logic
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = 
      emp.employeeNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesOffice = selectedOffice === 'all' || emp.officeId === selectedOffice;
    const matchesClassification = selectedClassification === 'all' || emp.classification === selectedClassification;
    const matchesStatus = selectedStatus === 'all' || emp.employmentStatus === selectedStatus;

    return matchesSearch && matchesOffice && matchesClassification && matchesStatus;
  });

  // Export to Excel / CSV via XLSX library
  const handleExport = () => {
    const exportData = filteredEmployees.map(e => ({
      'Permanent Internal ID': e.id,
      'Employee Number': e.employeeNumber,
      'First Name': e.firstName,
      'Last Name': e.lastName,
      'Official Email': e.email,
      'Phone': e.phone,
      'Office': e.officeName,
      'Position': e.position,
      'Classification': e.classification,
      'Employment Status': e.employmentStatus,
      'Record Status': e.recordStatus,
      'Salary Grade': e.salaryGrade || 'N/A',
      'Monthly Salary': e.monthlySalary || 'N/A',
      'Hire Date': e.hireDate
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Employees');
    XLSX.writeFile(workbook, `LGU_SanJose_EmployeeMasterlist_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const getClassificationBadge = (cls: EmploymentClassification) => {
    switch (cls) {
      case 'Permanent':
        return 'bg-blue-100 text-blue-900 border-blue-200';
      case 'Casual':
        return 'bg-purple-100 text-purple-900 border-purple-200';
      case 'Job Order':
        return 'bg-amber-100 text-amber-900 border-amber-200';
      case 'Contract of Service':
        return 'bg-emerald-100 text-emerald-900 border-emerald-200';
      case 'Elective Officials':
        return 'bg-rose-100 text-rose-900 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="space-y-4">
      
      {/* Top Header & Actions (Mobile responsive stacking) */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">Municipal Employee Masterlist</h2>
            <span className="text-xs bg-blue-100 text-[#173B67] font-bold px-2 py-0.5 rounded-full">
              {filteredEmployees.length}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            LGU San Jose personnel across all official classifications
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={handleExport}
            className="flex-1 sm:flex-none px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-300 transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden sm:inline">Export Excel</span>
            <span className="sm:hidden">Export</span>
          </button>

          {hasPermission('add_employees') && (
            <button
              type="button"
              onClick={onOpenAddModal}
              className="flex-1 sm:flex-none px-3.5 py-2 bg-[#173B67] hover:bg-[#122e50] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Employee</span>
            </button>
          )}
        </div>
      </div>

      {/* Search & Filter Bar (Mobile Toggleable) */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-2 text-xs">
        <div className="flex items-center space-x-2">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search name, emp#, or ID..."
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#173B67] outline-none text-xs"
            />
          </div>

          {/* Mobile Filter Toggle Button */}
          <button
            type="button"
            onClick={() => setShowFiltersMobile(!showFiltersMobile)}
            className="p-2 border border-slate-300 rounded-xl bg-slate-50 text-slate-700 sm:hidden flex items-center space-x-1"
          >
            <Filter className="w-4 h-4" />
            {showFiltersMobile ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>

        {/* Filter Dropdowns (Always shown on desktop, toggle on mobile) */}
        <div className={`grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 ${showFiltersMobile ? 'block' : 'hidden sm:grid'}`}>
          {/* Office Filter */}
          <div>
            <select
              value={selectedOffice}
              onChange={(e) => setSelectedOffice(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-[#173B67] outline-none text-xs"
            >
              <option value="all">All Offices ({offices.length})</option>
              {offices.map(off => (
                <option key={off.id} value={off.id}>{off.name}</option>
              ))}
            </select>
          </div>

          {/* Classification Filter */}
          <div>
            <select
              value={selectedClassification}
              onChange={(e) => setSelectedClassification(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-[#173B67] outline-none text-xs"
            >
              <option value="all">All Classifications</option>
              <option value="Permanent">Permanent</option>
              <option value="Temporary">Temporary</option>
              <option value="Casual">Casual</option>
              <option value="Job Order">Job Order</option>
              <option value="Contract of Service">Contract of Service</option>
              <option value="Elective Officials">Elective Officials</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-[#173B67] outline-none text-xs"
            >
              <option value="all">All Statuses</option>
              <option value="Active">Active</option>
              <option value="On Leave">On Leave</option>
              <option value="Suspended">Suspended</option>
              <option value="Separated">Separated</option>
              <option value="Retired">Retired</option>
            </select>
          </div>
        </div>
      </div>

      {/* 1. MOBILE CARD VIEW (Visible only on mobile screens < 768px) */}
      <div className="block md:hidden space-y-3">
        {filteredEmployees.length === 0 ? (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center text-slate-400 text-xs">
            No employee records match the given criteria.
          </div>
        ) : (
          filteredEmployees.map(emp => (
            <div 
              key={emp.id} 
              className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs space-y-3"
            >
              {/* Card Header: Avatar & Main Identifiers */}
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-[#173B67] text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs overflow-hidden">
                    {emp.profilePictureUrl ? <img src={emp.profilePictureUrl} alt={`${emp.firstName} ${emp.lastName}`} className="w-full h-full object-cover" /> : `${emp.firstName.charAt(0)}${emp.lastName.charAt(0)}`}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 leading-tight">
                      {emp.lastName}, {emp.firstName} {emp.middleName ? `${emp.middleName.charAt(0)}.` : ''} {emp.suffix || ''}
                    </h3>
                    <span className="text-[11px] text-slate-500 font-medium block">
                      {emp.position}
                    </span>
                  </div>
                </div>

                <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${getClassificationBadge(emp.classification)}`}>
                  {emp.classification}
                </span>
              </div>

              {/* Meta details */}
              <div className="p-2.5 bg-slate-50 rounded-xl text-[11px] text-slate-600 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Office:</span>
                  <span className="font-semibold text-slate-800 text-right truncate max-w-[200px]">{emp.officeName}</span>
                </div>
                <div className="flex items-center justify-between font-mono">
                  <span className="text-slate-400">Emp Number:</span>
                  <span className="font-bold text-[#173B67]">{emp.employeeNumber}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Status:</span>
                  <span className={`inline-flex items-center space-x-1 font-semibold ${
                    emp.employmentStatus === 'Active' ? 'text-emerald-700' : 'text-slate-500'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${emp.employmentStatus === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                    <span>{emp.employmentStatus}</span>
                  </span>
                </div>
              </div>

              {/* Mobile Touch-Friendly Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => onOpenProfile(emp)}
                  className="py-2 px-3 bg-blue-50 hover:bg-blue-100 text-[#173B67] text-xs font-bold rounded-xl border border-blue-200 transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Profile</span>
                </button>

                <button
                  type="button"
                  onClick={() => onOpen201Files(emp)}
                  className="py-2 px-3 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold rounded-xl border border-amber-200 transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <FolderLock className="w-3.5 h-3.5 text-amber-700" />
                  <span>201 Files</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 2. DESKTOP/TABLET TABLE VIEW (Hidden on mobile < 768px) */}
      <div className="hidden md:block bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#173B67] text-white uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4 font-bold">Emp Number</th>
                <th className="py-3 px-4 font-bold">Employee Name</th>
                <th className="py-3 px-4 font-bold">Office</th>
                <th className="py-3 px-4 font-bold">Position</th>
                <th className="py-3 px-4 font-bold">Classification</th>
                <th className="py-3 px-4 font-bold">Status</th>
                <th className="py-3 px-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400">
                    No employee records match the given criteria.
                  </td>
                </tr>
              ) : (
                filteredEmployees.map(emp => (
                  <tr key={emp.id} className="hover:bg-blue-50/40 transition-colors">
                    
                    {/* Employee Number */}
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                      <div>{emp.employeeNumber}</div>
                      <span className="text-[10px] text-slate-400 font-normal">
                        ID: {emp.id}
                      </span>
                    </td>

                    {/* Employee Name */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center text-[10px] font-bold text-slate-600 shrink-0">
                          {emp.profilePictureUrl ? <img src={emp.profilePictureUrl} alt="" className="w-full h-full object-cover" /> : `${emp.firstName.charAt(0)}${emp.lastName.charAt(0)}`}
                        </div>
                        <div className="font-bold text-slate-900">
                          {emp.lastName}, {emp.firstName} {emp.middleName ? `${emp.middleName.charAt(0)}.` : ''} {emp.suffix || ''}
                        </div>
                      </div>
                      <span className="text-[11px] text-slate-500 font-mono block">
                        {emp.email}
                      </span>
                    </td>

                    {/* Office */}
                    <td className="py-3.5 px-4 text-slate-700 font-medium">
                      {emp.officeName}
                    </td>

                    {/* Position */}
                    <td className="py-3.5 px-4 text-slate-800">
                      <div>{emp.position}</div>
                      {emp.salaryGrade && (
                        <span className="text-[10px] text-slate-400 font-medium">{emp.salaryGrade}</span>
                      )}
                    </td>

                    {/* Classification */}
                    <td className="py-3.5 px-4">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${getClassificationBadge(emp.classification)}`}>
                        {emp.classification}
                      </span>
                    </td>

                    {/* Employment Status */}
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center space-x-1 text-[11px] font-semibold ${
                        emp.employmentStatus === 'Active' ? 'text-emerald-700' : 'text-slate-500'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${emp.employmentStatus === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                        <span>{emp.employmentStatus}</span>
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center space-x-1">
                        <button
                          type="button"
                          onClick={() => onOpenProfile(emp)}
                          className="p-1.5 text-blue-700 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
                          title="View Profile"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => onOpen201Files(emp)}
                          className="p-1.5 text-amber-700 hover:bg-amber-100 rounded-lg transition-colors cursor-pointer"
                          title="Open 201 Files"
                        >
                          <FolderLock className="w-4 h-4" />
                        </button>

                        {hasPermission('edit_employees') && (
                          <button
                            type="button"
                            onClick={() => onOpenProfile(emp)}
                            className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Edit Record"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
          <span>Showing {filteredEmployees.length} of {employees.length} personnel records</span>
          <span className="font-mono text-[11px]">Database: Cloud Firestore (Online)</span>
        </div>
      </div>

    </div>
  );
};
