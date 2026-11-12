import React, { useState, useMemo } from 'react';
import { Employee, TrainingRecord } from '../../types/index.ts';
import { INITIAL_TRAININGS } from '../../data/operationalData.ts';
import { 
  GraduationCap, 
  Search, 
  Filter, 
  Plus, 
  Calendar, 
  Award, 
  Users, 
  Building2, 
  Clock, 
  CheckCircle2, 
  BookOpen, 
  X,
  Printer
} from 'lucide-react';

interface TrainingManagerProps {
  employees: Employee[];
}

export const TrainingManager: React.FC<TrainingManagerProps> = ({ employees }) => {
  const [trainings, setTrainings] = useState<TrainingRecord[]>(INITIAL_TRAININGS);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTrainingForView, setSelectedTrainingForView] = useState<TrainingRecord | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<TrainingRecord['category']>('Leadership & Management');
  const [provider, setProvider] = useState('Civil Service Commission (CSC) Regional Office IV-B');
  const [venue, setVenue] = useState('Municipal Session Hall, San Jose Municipal Capitol');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [numberOfHours, setNumberOfHours] = useState<number>(16);
  const [budgetAllocated, setBudgetAllocated] = useState<number>(25000);
  const [enrolledCount, setEnrolledCount] = useState<number>(15);

  const filteredTrainings = useMemo(() => {
    return trainings.filter(t => {
      if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = t.title.toLowerCase().includes(q);
        const matchProv = t.provider.toLowerCase().includes(q);
        const matchVenue = t.venue.toLowerCase().includes(q);
        if (!matchTitle && !matchProv && !matchVenue) return false;
      }
      return true;
    });
  }, [trainings, categoryFilter, searchQuery]);

  // Statistics
  const totalTrainings = trainings.length;
  const totalHours = trainings.reduce((acc, t) => acc + t.numberOfHours, 0);
  const totalTrainedPersonnel = trainings.reduce((acc, t) => acc + t.enrolledEmployeesCount, 0);
  const totalBudget = trainings.reduce((acc, t) => acc + (t.budgetAllocated || 0), 0);

  const handleCreateTraining = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !startDate || !endDate) {
      alert('Please fill in title and dates.');
      return;
    }

    const newRecord: TrainingRecord = {
      id: `TR-2026-${Date.now().toString().slice(-4)}`,
      title: title.trim(),
      category,
      provider: provider.trim(),
      venue: venue.trim(),
      startDate,
      endDate,
      numberOfHours,
      targetParticipants: ['Permanent', 'Temporary', 'Casual'],
      enrolledEmployeeIds: employees.slice(0, 3).map(e => e.id),
      enrolledEmployeesCount: enrolledCount,
      budgetAllocated,
      status: 'Scheduled',
      createdAt: new Date().toISOString()
    };

    setTrainings(prev => [newRecord, ...prev]);
    setShowCreateModal(false);
    setTitle('');
  };

  return (
    <div className="space-y-4 font-sans text-xs">
      
      {/* Top Banner Header */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-blue-100 text-[#173B67] text-[10px] font-bold uppercase tracking-wider mb-1">
            <GraduationCap className="w-3 h-3 text-[#173B67]" />
            <span>Learning and Development (L&D) Registry</span>
          </div>
          <h2 className="text-base sm:text-xl font-extrabold text-slate-900 tracking-tight">
            Training and Learning & Development Management
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            CSC Qualification Standards tracking, competency development, leadership seminars, and ethics training records.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 bg-[#173B67] hover:bg-[#122e50] text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center space-x-1.5 cursor-pointer text-xs shrink-0"
        >
          <Plus className="w-4 h-4 text-amber-300" />
          <span>Record / Schedule Training</span>
        </button>
      </div>

      {/* 4 Stat KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
        <div className="bg-white p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider block truncate">
            Training Programs
          </span>
          <div className="text-lg sm:text-2xl font-extrabold text-[#173B67] mt-1 font-mono">
            {totalTrainings}
          </div>
          <span className="text-[10px] text-slate-400 block mt-0.5">FY 2026 Calendar</span>
        </div>

        <div className="bg-white p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider block truncate">
            Total L&D Hours Tracked
          </span>
          <div className="text-lg sm:text-2xl font-extrabold text-indigo-600 mt-1 font-mono">
            {totalHours} hrs
          </div>
          <span className="text-[10px] text-indigo-600 font-semibold block mt-0.5">CSC QS Credited</span>
        </div>

        <div className="bg-white p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider block truncate">
            Total Personnel Trained
          </span>
          <div className="text-lg sm:text-2xl font-extrabold text-emerald-600 mt-1 font-mono">
            {totalTrainedPersonnel}
          </div>
          <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">Across All Offices</span>
        </div>

        <div className="bg-white p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider block truncate">
            L&D Budget Allocated
          </span>
          <div className="text-lg sm:text-2xl font-extrabold text-slate-900 mt-1 font-mono truncate">
            ₱{totalBudget.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-slate-400 block mt-0.5">5% HRD Mandate</span>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
          <div className="sm:col-span-3 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by Training Title, Provider, or Venue..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl bg-white text-xs focus:ring-2 focus:ring-[#173B67] focus:outline-none"
            />
          </div>

          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-xl bg-white text-xs font-semibold text-slate-800"
            >
              <option value="all">All L&D Categories</option>
              <option value="Leadership & Management">Leadership & Management</option>
              <option value="Technical & Functional">Technical & Functional</option>
              <option value="Supervisory">Supervisory</option>
              <option value="Values & CSC Ethics">Values & CSC Ethics</option>
              <option value="Disaster Preparedness & Safety">Disaster Preparedness & Safety</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
            Municipal Training & Seminar Programs ({filteredTrainings.length})
          </h3>
          <span className="text-[11px] text-slate-500">
            Civil Service Commission PRIME-HRM L&D Pillar
          </span>
        </div>

        {filteredTrainings.length === 0 ? (
          <div className="p-8 text-center text-slate-500 space-y-2">
            <GraduationCap className="w-8 h-8 mx-auto text-slate-300" />
            <p className="font-bold text-slate-700">No training records found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-200">
                  <th className="py-3 px-4">Program Title & Ref</th>
                  <th className="py-3 px-4">Category & Provider</th>
                  <th className="py-3 px-4">Dates & Venue</th>
                  <th className="py-3 px-4 text-center">Hours</th>
                  <th className="py-3 px-4 text-center">Enrolled</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredTrainings.map(t => (
                  <tr key={t.id} className="hover:bg-blue-50/40 transition-colors">
                    
                    <td className="py-3 px-4 max-w-[260px]">
                      <div className="font-bold text-slate-900 leading-snug">{t.title}</div>
                      <div className="font-mono text-[10px] text-slate-400 mt-0.5">{t.id}</div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 mb-0.5">
                        {t.category}
                      </span>
                      <div className="text-[11px] text-slate-500">{t.provider}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">{t.startDate} to {t.endDate}</div>
                      <div className="text-[11px] text-slate-500 truncate max-w-[180px]">{t.venue}</div>
                    </td>

                    <td className="py-3 px-4 text-center font-mono font-bold text-blue-700">
                      {t.numberOfHours} hrs
                    </td>

                    <td className="py-3 px-4 text-center font-bold text-slate-700">
                      {t.enrolledEmployeesCount} pax
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        t.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        t.status === 'In Progress' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                        'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {t.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedTrainingForView(t)}
                        className="px-2.5 py-1 bg-[#173B67] hover:bg-[#122e50] text-white font-bold rounded-lg cursor-pointer text-xs"
                      >
                        View Details
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden flex flex-col my-auto">
            
            <div className="p-4 bg-[#173B67] text-white flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-2.5">
                <GraduationCap className="w-5 h-5 text-amber-300" />
                <h3 className="font-bold text-base">Schedule Training & Development Course</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTraining} className="p-5 space-y-4 text-xs">
              
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Training / Course Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Supervisory Development Track / Local Governance Seminar"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl bg-white text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">L&D Competency Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full p-2 border border-slate-300 rounded-xl bg-white text-xs"
                  >
                    <option value="Leadership & Management">Leadership & Management</option>
                    <option value="Technical & Functional">Technical & Functional</option>
                    <option value="Supervisory">Supervisory</option>
                    <option value="Values & CSC Ethics">Values & CSC Ethics</option>
                    <option value="Disaster Preparedness & Safety">Disaster Preparedness & Safety</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Training Hours</label>
                  <input
                    type="number"
                    value={numberOfHours}
                    onChange={(e) => setNumberOfHours(Number(e.target.value))}
                    className="w-full p-2 border border-slate-300 rounded-xl bg-white font-mono text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Training Provider</label>
                <input
                  type="text"
                  required
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-xl bg-white text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Venue / Platform</label>
                <input
                  type="text"
                  required
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-xl bg-white text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-xl bg-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-xl bg-white text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Target Attendees Count</label>
                  <input
                    type="number"
                    value={enrolledCount}
                    onChange={(e) => setEnrolledCount(Number(e.target.value))}
                    className="w-full p-2 border border-slate-300 rounded-xl bg-white font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Budget Allocation (₱)</label>
                  <input
                    type="number"
                    value={budgetAllocated}
                    onChange={(e) => setBudgetAllocated(Number(e.target.value))}
                    className="w-full p-2 border border-slate-300 rounded-xl bg-white font-mono text-xs"
                  />
                </div>
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
                  <span>Save Course</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Details View Modal */}
      {selectedTrainingForView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden flex flex-col my-auto p-5 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-[#173B67]" />
                <h3 className="font-bold text-base text-slate-900">Training Program Profile</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTrainingForView(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <h4 className="font-bold text-sm text-[#173B67]">{selectedTrainingForView.title}</h4>
              <p className="text-slate-600">Category: <strong>{selectedTrainingForView.category}</strong></p>
              <p className="text-slate-600">Provider: <strong>{selectedTrainingForView.provider}</strong></p>
              <p className="text-slate-600">Venue: <strong>{selectedTrainingForView.venue}</strong></p>
              <p className="text-slate-600">Duration: <strong>{selectedTrainingForView.numberOfHours} training hours</strong> ({selectedTrainingForView.startDate} to {selectedTrainingForView.endDate})</p>
              <p className="text-slate-600">Enrolled Personnel: <strong>{selectedTrainingForView.enrolledEmployeesCount} employees</strong></p>
              <p className="text-slate-600">Budget: <strong>₱{selectedTrainingForView.budgetAllocated?.toLocaleString()}</strong></p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedTrainingForView(null)}
                className="px-4 py-2 bg-[#173B67] text-white font-bold rounded-xl cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
