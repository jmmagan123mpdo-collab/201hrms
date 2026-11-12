import React, { useState, useMemo } from 'react';
import { Employee, PerformanceRating } from '../../types/index.ts';
import { INITIAL_PERFORMANCE_RATINGS } from '../../data/operationalData.ts';
import { 
  Award, 
  Search, 
  Filter, 
  Plus, 
  Printer, 
  CheckCircle2, 
  TrendingUp, 
  Star, 
  FileText, 
  Building2, 
  User, 
  X,
  Sparkles
} from 'lucide-react';

interface PerformanceManagerProps {
  employees: Employee[];
}

export const PerformanceManager: React.FC<PerformanceManagerProps> = ({ employees }) => {
  const [ratings, setRatings] = useState<PerformanceRating[]>(INITIAL_PERFORMANCE_RATINGS);
  const [searchQuery, setSearchQuery] = useState('');
  const [periodFilter, setPeriodFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedRatingForPrint, setSelectedRatingForPrint] = useState<PerformanceRating | null>(null);

  // Form State
  const [selectedEmpId, setSelectedEmpId] = useState(employees[0]?.id || '');
  const [ratingPeriod, setRatingPeriod] = useState('July - December 2025 (2nd Semester)');
  const [periodYear, setPeriodYear] = useState<number>(2025);
  const [periodSemester, setPeriodSemester] = useState<'1st Semester' | '2nd Semester' | 'Annual'>('2nd Semester');
  const [numericalRating, setNumericalRating] = useState<number>(4.75);
  const [coreFunctionsRating, setCoreFunctionsRating] = useState<number>(4.80);
  const [supportFunctionsRating, setSupportFunctionsRating] = useState<number>(4.70);
  const [evaluatedBy, setEvaluatedBy] = useState('Department Head');
  const [approvedBy, setApprovedBy] = useState('Hon. Rey Ladaga, Municipal Mayor');
  const [remarks, setRemarks] = useState('');

  // Auto-compute adjectival
  const adjectivalRating = useMemo(() => {
    if (numericalRating >= 4.5) return 'Outstanding';
    if (numericalRating >= 3.5) return 'Very Satisfactory';
    if (numericalRating >= 2.5) return 'Satisfactory';
    if (numericalRating >= 1.5) return 'Unsatisfactory';
    return 'Poor';
  }, [numericalRating]);

  const filteredRatings = useMemo(() => {
    return ratings.filter(r => {
      if (periodFilter !== 'all' && r.ratingPeriod !== periodFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = r.employeeName.toLowerCase().includes(q);
        const matchOffice = r.officeName.toLowerCase().includes(q);
        const matchAdj = r.adjectivalRating.toLowerCase().includes(q);
        if (!matchName && !matchOffice && !matchAdj) return false;
      }
      return true;
    });
  }, [ratings, periodFilter, searchQuery]);

  // Stats
  const totalRated = ratings.length;
  const avgRating = ratings.length > 0 ? (ratings.reduce((acc, r) => acc + r.numericalRating, 0) / ratings.length).toFixed(2) : '4.75';
  const outstandingCount = ratings.filter(r => r.adjectivalRating === 'Outstanding').length;
  const verySatCount = ratings.filter(r => r.adjectivalRating === 'Very Satisfactory').length;

  const handleCreateRating = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find(e => e.id === selectedEmpId) || employees[0];

    const newR: PerformanceRating = {
      id: `IPCR-${periodYear}-${emp.id}`,
      employeeId: emp.id,
      employeeNumber: emp.employeeNumber,
      employeeName: `${emp.firstName} ${emp.lastName}`,
      officeName: emp.officeName,
      position: emp.position,
      classification: emp.classification,
      ratingPeriod,
      periodYear,
      periodSemester,
      numericalRating,
      adjectivalRating,
      coreFunctionsRating,
      supportFunctionsRating,
      spmsStatus: 'Approved & Official',
      evaluatedBy,
      approvedBy,
      evaluatedAt: new Date().toISOString(),
      remarks: remarks.trim() || 'Satisfactorily met performance targets and CSC deliverable standards.'
    };

    setRatings(prev => [newR, ...prev]);
    setShowCreateModal(false);
  };

  return (
    <div className="space-y-4 font-sans text-xs">
      
      {/* Top Banner Header */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-blue-100 text-[#173B67] text-[10px] font-bold uppercase tracking-wider mb-1">
            <Award className="w-3 h-3 text-[#173B67]" />
            <span>CSC SPMS Evaluated Performance System</span>
          </div>
          <h2 className="text-base sm:text-xl font-extrabold text-slate-900 tracking-tight">
            Performance Management (IPCR / DPCR / OPCR)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Individual, Division, and Office Performance Commitment and Review ratings under CSC Strategic Performance Management System.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 bg-[#173B67] hover:bg-[#122e50] text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center space-x-1.5 cursor-pointer text-xs shrink-0"
        >
          <Plus className="w-4 h-4 text-amber-300" />
          <span>Encode IPCR Rating</span>
        </button>
      </div>

      {/* 4 Stat KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
        <div className="bg-white p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider block truncate">
            LGU Average Rating
          </span>
          <div className="text-lg sm:text-2xl font-extrabold text-[#173B67] mt-1 font-mono flex items-center space-x-1">
            <span>{avgRating}</span>
            <span className="text-xs font-sans text-slate-400">/ 5.00</span>
          </div>
          <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">Outstanding Overall</span>
        </div>

        <div className="bg-white p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider block truncate">
            Outstanding Performers
          </span>
          <div className="text-lg sm:text-2xl font-extrabold text-emerald-600 mt-1 font-mono">
            {outstandingCount}
          </div>
          <span className="text-[10px] text-slate-400 block mt-0.5">Numerical 4.50 – 5.00</span>
        </div>

        <div className="bg-white p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider block truncate">
            Very Satisfactory
          </span>
          <div className="text-lg sm:text-2xl font-extrabold text-blue-600 mt-1 font-mono">
            {verySatCount}
          </div>
          <span className="text-[10px] text-slate-400 block mt-0.5">Numerical 3.50 – 4.49</span>
        </div>

        <div className="bg-white p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider block truncate">
            Total Rated Personnel
          </span>
          <div className="text-lg sm:text-2xl font-extrabold text-slate-900 mt-1 font-mono">
            {totalRated}
          </div>
          <span className="text-[10px] text-slate-400 block mt-0.5">PMT Validated</span>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
          <div className="sm:col-span-3 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by Personnel Name, Office, or Rating..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl bg-white text-xs focus:ring-2 focus:ring-[#173B67] focus:outline-none"
            />
          </div>

          <div>
            <select
              value={periodFilter}
              onChange={(e) => setPeriodFilter(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-xl bg-white text-xs font-semibold text-slate-800"
            >
              <option value="all">All Rating Periods</option>
              <option value="July - December 2025 (2nd Semester)">July - Dec 2025 (2nd Sem)</option>
              <option value="January - June 2025 (1st Semester)">Jan - Jun 2025 (1st Sem)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
            CSC Strategic Performance Appraisal Registry ({filteredRatings.length})
          </h3>
          <span className="text-[11px] text-slate-500">
            Performance Management Team (PMT) Certified
          </span>
        </div>

        {filteredRatings.length === 0 ? (
          <div className="p-8 text-center text-slate-500 space-y-2">
            <Award className="w-8 h-8 mx-auto text-slate-300" />
            <p className="font-bold text-slate-700">No performance records match criteria</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-200">
                  <th className="py-3 px-4">Personnel & Office</th>
                  <th className="py-3 px-4">Rating Period</th>
                  <th className="py-3 px-4 text-center">Numerical Rating</th>
                  <th className="py-3 px-4 text-center">Adjectival Rating</th>
                  <th className="py-3 px-4 text-center">Core Functions</th>
                  <th className="py-3 px-4 text-center">Support</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredRatings.map(r => (
                  <tr key={r.id} className="hover:bg-blue-50/40 transition-colors">
                    
                    <td className="py-3 px-4">
                      <div className="font-bold text-[#173B67]">{r.employeeName}</div>
                      <div className="text-[11px] text-slate-500 truncate max-w-[180px]">
                        {r.position} • {r.officeName}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">{r.ratingPeriod}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{r.id}</div>
                    </td>

                    <td className="py-3 px-4 text-center font-mono font-bold text-sm text-slate-900">
                      {r.numericalRating.toFixed(2)}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        r.adjectivalRating === 'Outstanding' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        r.adjectivalRating === 'Very Satisfactory' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                        'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        <Star className="w-3 h-3 fill-current" />
                        <span>{r.adjectivalRating}</span>
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center font-mono font-semibold text-slate-700">
                      {r.coreFunctionsRating.toFixed(2)}
                    </td>

                    <td className="py-3 px-4 text-center font-mono font-semibold text-slate-700">
                      {r.supportFunctionsRating.toFixed(2)}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                        {r.spmsStatus}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedRatingForPrint(r)}
                        className="px-2.5 py-1 bg-[#173B67] hover:bg-[#122e50] text-white font-bold rounded-lg cursor-pointer text-xs inline-flex items-center space-x-1"
                      >
                        <Printer className="w-3 h-3 text-amber-300" />
                        <span>Print IPCR</span>
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
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden flex flex-col my-auto">
            
            <div className="p-4 bg-[#173B67] text-white flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-2.5">
                <Award className="w-5 h-5 text-amber-300" />
                <h3 className="font-bold text-base">Encode IPCR Performance Appraisal</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRating} className="p-5 space-y-4 text-xs">
              
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Select Personnel</label>
                <select
                  value={selectedEmpId}
                  onChange={(e) => setSelectedEmpId(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl bg-white font-bold text-xs"
                >
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName} ({emp.employeeNumber}) – {emp.position} ({emp.officeName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Rating Period</label>
                <input
                  type="text"
                  required
                  value={ratingPeriod}
                  onChange={(e) => setRatingPeriod(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-xl bg-white text-xs"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Overall Rating</label>
                  <input
                    type="number"
                    step="0.01"
                    min="1.00"
                    max="5.00"
                    value={numericalRating}
                    onChange={(e) => setNumericalRating(Number(e.target.value))}
                    className="w-full p-2 border border-slate-300 rounded-xl bg-white font-mono font-bold text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Core Functions</label>
                  <input
                    type="number"
                    step="0.01"
                    min="1.00"
                    max="5.00"
                    value={coreFunctionsRating}
                    onChange={(e) => setCoreFunctionsRating(Number(e.target.value))}
                    className="w-full p-2 border border-slate-300 rounded-xl bg-white font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Support Rating</label>
                  <input
                    type="number"
                    step="0.01"
                    min="1.00"
                    max="5.00"
                    value={supportFunctionsRating}
                    onChange={(e) => setSupportFunctionsRating(Number(e.target.value))}
                    className="w-full p-2 border border-slate-300 rounded-xl bg-white font-mono text-xs"
                  />
                </div>
              </div>

              <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 flex items-center justify-between">
                <span className="font-bold text-slate-700">Calculated Adjectival Rating:</span>
                <span className="font-bold text-blue-900 text-sm">{adjectivalRating}</span>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Evaluator / Supervisor</label>
                <input
                  type="text"
                  value={evaluatedBy}
                  onChange={(e) => setEvaluatedBy(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-xl bg-white text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Commendations & Remarks</label>
                <textarea
                  rows={2}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Specific accomplishments and performance highlights..."
                  className="w-full p-2 border border-slate-300 rounded-xl bg-white text-xs"
                />
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
                  <span>Save IPCR</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Print View Modal */}
      {selectedRatingForPrint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden flex flex-col my-auto">
            
            <div className="p-4 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
              <span className="font-bold text-slate-800 text-xs">Official CSC IPCR Appraisal Form</span>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-[#173B67] text-white font-bold rounded-lg cursor-pointer text-xs flex items-center space-x-1"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Form</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRatingForPrint(null)}
                  className="p-1 rounded-lg text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4 text-slate-900 font-sans text-xs bg-white">
              <div className="text-center border-b pb-3 space-y-0.5">
                <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  CIVIL SERVICE COMMISSION • SPMS FORM
                </p>
                <h4 className="font-extrabold text-sm text-[#173B67]">
                  INDIVIDUAL PERFORMANCE COMMITMENT AND REVIEW (IPCR)
                </h4>
                <p className="text-[10px] text-slate-600">{selectedRatingForPrint.ratingPeriod}</p>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between border-b pb-1">
                  <span className="text-slate-500">Employee Name:</span>
                  <span className="font-bold">{selectedRatingForPrint.employeeName}</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span className="text-slate-500">Position & Office:</span>
                  <span className="font-semibold">{selectedRatingForPrint.position} • {selectedRatingForPrint.officeName}</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span className="text-slate-500">Classification:</span>
                  <span className="font-bold">{selectedRatingForPrint.classification}</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span className="text-slate-500">Final Numerical Rating:</span>
                  <span className="font-mono font-extrabold text-base text-[#173B67]">{selectedRatingForPrint.numericalRating.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span className="text-slate-500">Final Adjectival Rating:</span>
                  <span className="font-extrabold text-emerald-700">{selectedRatingForPrint.adjectivalRating}</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span className="text-slate-500">Core Functions (70%):</span>
                  <span className="font-mono font-bold">{selectedRatingForPrint.coreFunctionsRating.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span className="text-slate-500">Support Functions (30%):</span>
                  <span className="font-mono font-bold">{selectedRatingForPrint.supportFunctionsRating.toFixed(2)}</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Evaluator Remarks:</span>
                  <p className="text-xs italic text-slate-800">"{selectedRatingForPrint.remarks}"</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t text-center">
                <div>
                  <div className="border-b border-slate-300 pb-1 font-bold text-xs">{selectedRatingForPrint.evaluatedBy}</div>
                  <div className="text-[10px] text-slate-500 uppercase mt-0.5">Immediate Supervisor</div>
                </div>
                <div>
                  <div className="border-b border-slate-300 pb-1 font-bold text-xs">{selectedRatingForPrint.approvedBy}</div>
                  <div className="text-[10px] text-slate-500 uppercase mt-0.5">Head of Agency / PMT Chair</div>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};
