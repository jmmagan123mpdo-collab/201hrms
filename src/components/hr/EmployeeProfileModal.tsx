import React, { useState } from 'react';
import { Employee, EmploymentClassification, EmploymentStatus } from '../../types/index.ts';
import { useData } from '../../context/DataContext.tsx';
import { useAuth } from '../../context/AuthContext.tsx';
import { 
  User, 
  Briefcase, 
  Users, 
  GraduationCap, 
  Award, 
  CreditCard, 
  FolderLock, 
  History, 
  X, 
  Save, 
  Edit3, 
  Building2, 
  Mail, 
  Phone,
  CheckCircle2,
  Calendar
} from 'lucide-react';

import { computeEmployeeCompliance } from '../../data/documentRequirements.ts';

interface EmployeeProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
  onOpen201Files: (emp: Employee) => void;
}

export const EmployeeProfileModal: React.FC<EmployeeProfileModalProps> = ({
  isOpen,
  onClose,
  employee,
  onOpen201Files
}) => {
  const { updateEmployee, offices, documents } = useData();
  const { hasPermission } = useAuth();

  const [activeTab, setActiveTab] = useState<number>(1);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Employee>>({});

  if (!isOpen || !employee) return null;

  const startEdit = () => {
    setFormData({ ...employee });
    setIsEditing(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateEmployee(employee.id, formData);
    setIsEditing(false);
  };

  const tabs = [
    { id: 1, label: '1. Personal Info', icon: User },
    { id: 2, label: '2. Employment Info', icon: Briefcase },
    { id: 3, label: '3. Family Info', icon: Users },
    { id: 4, label: '4. Education', icon: GraduationCap },
    { id: 5, label: '5. Eligibility & Licenses', icon: Award },
    { id: 6, label: '6. Government Info', icon: CreditCard },
    { id: 7, label: '7. 201 Files', icon: FolderLock },
    { id: 8, label: '8. Employment History', icon: History }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl max-w-4xl w-full border border-slate-200 overflow-hidden flex flex-col h-[94vh] sm:h-auto sm:max-h-[92vh]">
        
        {/* Mobile Drag Handle */}
        <div className="sm:hidden pt-2 pb-1 bg-[#173B67] flex justify-center shrink-0">
          <div className="w-10 h-1 bg-white/40 rounded-full"></div>
        </div>

        {/* Header */}
        <div className="bg-[#173B67] px-4 sm:px-6 py-3.5 sm:py-4 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0 pr-2">
            <div className="w-10 h-10 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center font-bold text-base shrink-0">
              {employee.firstName.charAt(0)}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5">
                <h3 className="text-sm sm:text-base font-bold truncate">
                  {employee.lastName}, {employee.firstName} {employee.middleName ? `${employee.middleName.charAt(0)}.` : ''} {employee.suffix || ''}
                </h3>
                <span className="text-[10px] bg-blue-100 text-[#173B67] px-2 py-0.5 rounded-full font-bold shrink-0">
                  {employee.classification}
                </span>
              </div>
              <p className="text-[11px] text-blue-200 truncate">
                ID: <span className="font-mono font-bold text-white">{employee.id}</span> • Emp#: <span className="font-mono font-bold text-white">{employee.employeeNumber}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5 shrink-0">
            {!isEditing && hasPermission('edit_employees') && (
              <button
                type="button"
                onClick={startEdit}
                className="min-h-[40px] px-3 py-1.5 bg-[#F28C28] hover:bg-[#d9771a] text-white rounded-xl text-xs font-bold transition-colors flex items-center space-x-1 cursor-pointer shadow-xs"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Edit Profile</span>
                <span className="sm:hidden">Edit</span>
              </button>
            )}
            <button 
              onClick={onClose} 
              className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-300 hover:text-white rounded-xl transition-colors cursor-pointer"
              aria-label="Close Profile"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 8 Sections Tab Strip */}
        <div className="flex items-center space-x-1 px-3 sm:px-4 py-2 bg-slate-100 border-b border-slate-200 overflow-x-auto shrink-0 text-xs font-semibold scrollbar-none">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  if (tab.id === 7) {
                    onClose();
                    onOpen201Files(employee);
                  } else {
                    setActiveTab(tab.id);
                  }
                }}
                className={`min-h-[38px] px-3 py-1.5 rounded-xl flex items-center space-x-1.5 transition-colors whitespace-nowrap cursor-pointer shrink-0 ${
                  isActive ? 'bg-[#173B67] text-white font-bold shadow-xs' : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Profile Content Body */}
        <div className="flex-1 overflow-y-auto p-6 text-xs text-slate-800">
          {isEditing ? (
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">First Name</label>
                  <input
                    type="text"
                    required
                    value={formData.firstName || ''}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full p-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Middle Name</label>
                  <input
                    type="text"
                    value={formData.middleName || ''}
                    onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
                    className="w-full p-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Last Name</label>
                  <input
                    type="text"
                    required
                    value={formData.lastName || ''}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full p-2 border rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Employee Number</label>
                  <input
                    type="text"
                    required
                    value={formData.employeeNumber || ''}
                    onChange={(e) => setFormData({ ...formData, employeeNumber: e.target.value })}
                    className="w-full p-2 border rounded-xl font-mono"
                  />
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    * Previous numbers will be saved in history
                  </span>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Official Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full p-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-2 border rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Office / Department</label>
                  <select
                    value={formData.officeId || ''}
                    onChange={(e) => {
                      const off = offices.find(o => o.id === e.target.value);
                      setFormData({ 
                        ...formData, 
                        officeId: e.target.value,
                        officeName: off ? off.name : formData.officeName
                      });
                    }}
                    className="w-full p-2 border rounded-xl bg-white"
                  >
                    {offices.map(o => (
                      <option key={o.id} value={o.id}>{o.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Position Title</label>
                  <input
                    type="text"
                    value={formData.position || ''}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    className="w-full p-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Classification</label>
                  <select
                    value={formData.classification || 'Permanent'}
                    onChange={(e) => setFormData({ ...formData, classification: e.target.value as EmploymentClassification })}
                    className="w-full p-2 border rounded-xl bg-white"
                  >
                    <option value="Permanent">Permanent</option>
                    <option value="Temporary">Temporary</option>
                    <option value="Casual">Casual</option>
                    <option value="Job Order">Job Order</option>
                    <option value="Contract of Service">Contract of Service</option>
                    <option value="Elective Officials">Elective Officials</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 border rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#173B67] hover:bg-[#122e50] text-white font-bold rounded-xl flex items-center space-x-1"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              
              {/* SECTION 1: PERSONAL INFORMATION */}
              {activeTab === 1 && (
                <div className="space-y-4">
                  <h4 className="font-bold text-sm text-[#173B67] border-b pb-1">Personal Details</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div>
                      <span className="text-slate-500 block">Full Legal Name</span>
                      <span className="font-bold text-slate-900">{employee.firstName} {employee.middleName} {employee.lastName} {employee.suffix || ''}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Civil Status</span>
                      <span className="font-bold text-slate-900">{employee.civilStatus || 'Single'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Citizenship</span>
                      <span className="font-bold text-slate-900">{employee.citizenship || 'Filipino'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Date of Birth</span>
                      <span className="font-bold text-slate-900">{employee.dateOfBirth || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Residential Address</span>
                      <span className="font-bold text-slate-900">{employee.residentialAddress || 'San Jose, Occidental Mindoro'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Emergency Contact</span>
                      <span className="font-bold text-slate-900">{employee.emergencyContactName || 'N/A'} ({employee.emergencyContactPhone || 'N/A'})</span>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 2: EMPLOYMENT INFORMATION */}
              {activeTab === 2 && (
                <div className="space-y-4">
                  <h4 className="font-bold text-sm text-[#173B67] border-b pb-1">LGU Appointment & Service Details</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div>
                      <span className="text-slate-500 block">Permanent Record ID</span>
                      <span className="font-mono font-bold text-blue-900">{employee.id}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Personnel Emp Number</span>
                      <span className="font-mono font-bold text-slate-900">{employee.employeeNumber}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Office / Department</span>
                      <span className="font-bold text-slate-900">{employee.officeName}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Position</span>
                      <span className="font-bold text-slate-900">{employee.position}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Classification</span>
                      <span className="font-bold text-slate-900">{employee.classification}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Employment Status</span>
                      <span className="font-bold text-emerald-700">{employee.employmentStatus}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Initial Hire Date</span>
                      <span className="font-bold text-slate-900">{employee.hireDate}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Salary Grade / Step</span>
                      <span className="font-bold text-slate-900">{employee.salaryGrade || 'N/A'} {employee.stepIncrement || ''}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Monthly Rate</span>
                      <span className="font-bold text-slate-900">₱{employee.monthlySalary?.toLocaleString() || 'N/A'}</span>
                    </div>
                  </div>

                  {employee.previousEmployeeNumbers && employee.previousEmployeeNumbers.length > 0 && (
                    <div className="p-3 bg-slate-50 border rounded-xl">
                      <span className="text-[11px] font-bold text-slate-600 block">Previous Personnel Numbers (Historical):</span>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {employee.previousEmployeeNumbers.map(num => (
                          <span key={num} className="font-mono text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded">
                            {num}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* SECTION 3: FAMILY INFORMATION */}
              {activeTab === 3 && (
                <div className="space-y-4">
                  <h4 className="font-bold text-sm text-[#173B67] border-b pb-1">Family Background (CS Form 212 Sec. III)</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-slate-500 block">Spouse's Name</span>
                      <span className="font-bold text-slate-900">{employee.emergencyContactRelation === 'Spouse' ? employee.emergencyContactName : 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Contact Information</span>
                      <span className="font-bold text-slate-900">{employee.emergencyContactPhone || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 4: EDUCATIONAL BACKGROUND */}
              {activeTab === 4 && (
                <div className="space-y-4">
                  <h4 className="font-bold text-sm text-[#173B67] border-b pb-1">Educational Background</h4>
                  <div className="p-3 bg-slate-50 rounded-xl border">
                    <div className="font-bold text-slate-900">College / Tertiary Degree</div>
                    <p className="text-slate-600 mt-0.5">Transcript of Records and College Diploma filed in Category 3 of 201 Files.</p>
                  </div>
                </div>
              )}

              {/* SECTION 5: ELIGIBILITY AND LICENSES */}
              {activeTab === 5 && (
                <div className="space-y-4">
                  <h4 className="font-bold text-sm text-[#173B67] border-b pb-1">Civil Service Eligibility & Professional Licenses</h4>
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
                    <span className="font-bold text-blue-900 block">Career Service Professional / Sub-Professional</span>
                    <span className="text-slate-600 mt-1 block">Recorded per CSC Form 212 and verification certificates.</span>
                  </div>
                </div>
              )}

              {/* SECTION 6: GOVERNMENT INFORMATION */}
              {activeTab === 6 && (
                <div className="space-y-4">
                  <h4 className="font-bold text-sm text-[#173B67] border-b pb-1">Statutory Identifiers & Accounts</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-slate-500 block">Taxpayer Identification Number (TIN)</span>
                      <span className="font-mono font-bold text-slate-900">{employee.tin || 'Not provided'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">GSIS BP Number</span>
                      <span className="font-mono font-bold text-slate-900">{employee.gsis || 'Not provided'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">PhilHealth Identification Number</span>
                      <span className="font-mono font-bold text-slate-900">{employee.philhealth || 'Not provided'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Pag-IBIG / HDMF MID</span>
                      <span className="font-mono font-bold text-slate-900">{employee.pagibig || 'Not provided'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 7: 201 FILES REQUIREMENTS & COMPLIANCE */}
              {activeTab === 7 && (() => {
                const empDocs = documents.filter(d => d.employeeId === employee.id);
                const compliance = computeEmployeeCompliance(employee.classification, empDocs);
                return (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b pb-2">
                      <div>
                        <h4 className="font-bold text-sm text-[#173B67]">
                          201 Document Requirements ({employee.classification})
                        </h4>
                        <p className="text-xs text-slate-500">
                          Classification profile compliance score: <strong className="text-slate-800">{compliance.complianceScore}%</strong>
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onOpen201Files(employee);
                        }}
                        className="px-3 py-1.5 bg-[#173B67] hover:bg-[#122e50] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center space-x-1"
                      >
                        <FolderLock className="w-3.5 h-3.5" />
                        <span>Open 201 Files Manager</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl">
                        <span className="text-[10px] uppercase font-bold text-emerald-800 block">Verified (Green)</span>
                        <div className="text-lg font-bold text-emerald-900 mt-1">{compliance.verified}</div>
                        <span className="text-[10px] text-emerald-700">{compliance.verifiedRequired} of {compliance.totalRequired} required</span>
                      </div>

                      <div className="bg-rose-50 border border-rose-200 p-3 rounded-xl">
                        <span className="text-[10px] uppercase font-bold text-rose-800 block">Missing Required (Red)</span>
                        <div className="text-lg font-bold text-rose-900 mt-1">{compliance.missingRequired}</div>
                        <span className="text-[10px] text-rose-700">Immediate compliance action</span>
                      </div>

                      <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl">
                        <span className="text-[10px] uppercase font-bold text-amber-800 block">Missing Optional (Yellow)</span>
                        <div className="text-lg font-bold text-amber-900 mt-1">{compliance.missingOptional}</div>
                        <span className="text-[10px] text-amber-700">Informational only</span>
                      </div>

                      <div className="bg-blue-50 border border-blue-200 p-3 rounded-xl">
                        <span className="text-[10px] uppercase font-bold text-blue-800 block">For Review (Blue)</span>
                        <div className="text-lg font-bold text-blue-900 mt-1">{compliance.forReview}</div>
                        <span className="text-[10px] text-blue-700">Awaiting HR audit</span>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                      <span className="font-bold text-slate-800 text-xs block">Active Uploaded Records ({empDocs.length})</span>
                      {empDocs.length === 0 ? (
                        <p className="text-xs text-slate-500">No documents uploaded yet for this personnel.</p>
                      ) : (
                        <div className="divide-y divide-slate-200/60 max-h-48 overflow-y-auto">
                          {empDocs.map(d => (
                            <div key={d.id} className="py-2 flex items-center justify-between text-xs">
                              <span className="font-medium text-slate-800 truncate pr-2">{d.documentName}</span>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                d.status === 'verified' ? 'bg-emerald-100 text-emerald-800' :
                                d.status === 'for_review' ? 'bg-blue-100 text-blue-800' :
                                d.status === 'returned' ? 'bg-orange-100 text-orange-800' :
                                'bg-slate-100 text-slate-700'
                              }`}>
                                {d.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* SECTION 8: EMPLOYMENT HISTORY & CLASSIFICATION AUDIT */}
              {activeTab === 8 && (
                <div className="space-y-4">
                  <h4 className="font-bold text-sm text-[#173B67] border-b pb-1">Employment Service & Classification History</h4>
                  
                  {/* Current Position */}
                  <div className="border-l-2 border-[#173B67] pl-3 space-y-2">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-900 block text-xs">{employee.position}</span>
                        <span className="px-2 py-0.2 bg-blue-100 text-[#173B67] rounded-full text-[10px] font-bold">
                          Current • {employee.classification}
                        </span>
                      </div>
                      <span className="text-slate-500 text-[11px]">{employee.officeName} • {employee.hireDate} to Present</span>
                    </div>
                  </div>

                  {/* Classification Changes Audit Log */}
                  {employee.classificationHistory && employee.classificationHistory.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <span className="text-xs font-bold text-slate-700 block">Classification History Log:</span>
                      <div className="space-y-2">
                        {employee.classificationHistory.map((h, i) => (
                          <div key={i} className="p-2.5 bg-slate-50 border rounded-xl text-xs space-y-0.5">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-800">{h.classification}</span>
                              <span className="text-[10px] text-slate-500">Effective: {h.effectiveDate}</span>
                            </div>
                            {h.remarks && <p className="text-[11px] text-slate-600">{h.remarks}</p>}
                            <span className="text-[9px] text-slate-400 block">Recorded by: {h.recordedBy || 'HR Admin'}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {employee.previousEmployeeNumbers && employee.previousEmployeeNumbers.length > 0 && (
                    <div className="p-3 bg-slate-50 border rounded-xl">
                      <span className="text-[11px] font-bold text-slate-600 block">Previous Personnel Numbers (Historical):</span>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {employee.previousEmployeeNumbers.map(num => (
                          <span key={num} className="font-mono text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded">
                            {num}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

            </div>
          )}
        </div>

      </div>
    </div>
  );
};
