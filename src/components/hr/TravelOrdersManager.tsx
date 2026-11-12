import React, { useState, useMemo } from 'react';
import { Employee, TravelOrder, TravelOrderStatus } from '../../types/index.ts';
import { INITIAL_TRAVEL_ORDERS } from '../../data/operationalData.ts';
import { 
  Compass, 
  Search, 
  Filter, 
  Plus, 
  Printer, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Calendar, 
  Building2, 
  User, 
  MapPin, 
  Car, 
  Plane, 
  Ship, 
  FileText, 
  X,
  AlertCircle
} from 'lucide-react';

interface TravelOrdersManagerProps {
  employees: Employee[];
}

export const TravelOrdersManager: React.FC<TravelOrdersManagerProps> = ({ employees }) => {
  const [orders, setOrders] = useState<TravelOrder[]>(INITIAL_TRAVEL_ORDERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedOrderForPrint, setSelectedOrderForPrint] = useState<TravelOrder | null>(null);

  // New Order Form state
  const [selectedEmpId, setSelectedEmpId] = useState(employees[0]?.id || '');
  const [destination, setDestination] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [purpose, setPurpose] = useState('');
  const [transportationType, setTransportationType] = useState<TravelOrder['transportationType']>('Official Vehicle');
  const [perDiemEstimated, setPerDiemEstimated] = useState<number>(4500);
  const [appropriationCode, setAppropriationCode] = useState('1011-5-02-01-010');
  const [recommendingApprovalBy, setRecommendingApprovalBy] = useState('');
  const [approvedBy, setApprovedBy] = useState('Hon. Rey Ladaga, Municipal Mayor');

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter(to => {
      if (statusFilter !== 'all' && to.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = to.employeeName.toLowerCase().includes(q);
        const matchDest = to.destination.toLowerCase().includes(q);
        const matchTrack = to.toTrackingNumber.toLowerCase().includes(q);
        if (!matchName && !matchDest && !matchTrack) return false;
      }
      return true;
    });
  }, [orders, statusFilter, searchQuery]);

  // Statistics
  const totalOrders = orders.length;
  const approvedCount = orders.filter(o => o.status === 'Approved').length;
  const pendingCount = orders.filter(o => o.status === 'Pending Approval').length;
  const totalPerDiem = orders.reduce((acc, curr) => acc + (curr.perDiemEstimated || 0), 0);

  // Handle Create
  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find(em => em.id === selectedEmpId) || employees[0];
    if (!destination.trim() || !purpose.trim() || !departureDate || !returnDate) {
      alert('Please fill in all required fields (Destination, Departure Date, Return Date, and Purpose).');
      return;
    }

    const orderNumber = `TO-LGU-SJ-2026-${String(orders.length + 15).padStart(4, '0')}`;
    const newOrder: TravelOrder = {
      id: `TO-2026-${Date.now().toString().slice(-4)}`,
      toTrackingNumber: orderNumber,
      employeeId: emp.id,
      employeeNumber: emp.employeeNumber,
      employeeName: `${emp.firstName} ${emp.lastName}`,
      officeName: emp.officeName,
      position: emp.position,
      destination: destination.trim(),
      departureDate,
      returnDate,
      purpose: purpose.trim(),
      transportationType,
      perDiemEstimated,
      appropriationCode,
      status: 'Approved',
      recommendingApprovalBy: recommendingApprovalBy.trim() || `${emp.officeName} Head`,
      approvedBy,
      createdAt: new Date().toISOString(),
      approvedAt: new Date().toISOString()
    };

    setOrders(prev => [newOrder, ...prev]);
    setShowCreateModal(false);
    // Reset form
    setDestination('');
    setPurpose('');
    setDepartureDate('');
    setReturnDate('');
  };

  const handleApprove = (id: string) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'Approved', approvedAt: new Date().toISOString() } : o));
  };

  return (
    <div className="space-y-4 font-sans text-xs">
      
      {/* Top Banner Header */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-blue-100 text-[#173B67] text-[10px] font-bold uppercase tracking-wider mb-1">
            <Compass className="w-3 h-3 text-[#173B67]" />
            <span>Official Travel Authorization Registry</span>
          </div>
          <h2 className="text-base sm:text-xl font-extrabold text-slate-900 tracking-tight">
            Official Travel Orders (TO) Management
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Issue, verify, and approve official municipal travel authorities, per diem allocations, and CSC travel registries.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 bg-[#173B67] hover:bg-[#122e50] text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center space-x-1.5 cursor-pointer text-xs shrink-0"
        >
          <Plus className="w-4 h-4 text-amber-300" />
          <span>Create Travel Order (TO)</span>
        </button>
      </div>

      {/* 4 Stat KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
        <div className="bg-white p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider block truncate">
            Total Travel Orders
          </span>
          <div className="text-lg sm:text-2xl font-extrabold text-[#173B67] mt-1 font-mono">
            {totalOrders}
          </div>
          <span className="text-[10px] text-slate-400 block mt-0.5">FY 2026 Registry</span>
        </div>

        <div className="bg-white p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider block truncate">
            Approved Official Travels
          </span>
          <div className="text-lg sm:text-2xl font-extrabold text-emerald-600 mt-1 font-mono">
            {approvedCount}
          </div>
          <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">Duly Authorized</span>
        </div>

        <div className="bg-white p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider block truncate">
            Pending Mayor Review
          </span>
          <div className="text-lg sm:text-2xl font-extrabold text-amber-600 mt-1 font-mono">
            {pendingCount}
          </div>
          <span className="text-[10px] text-amber-600 font-semibold block mt-0.5">Awaiting Signature</span>
        </div>

        <div className="bg-white p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider block truncate">
            Per Diem Appropriated
          </span>
          <div className="text-lg sm:text-2xl font-extrabold text-slate-900 mt-1 font-mono truncate">
            ₱{totalPerDiem.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-slate-400 block mt-0.5">COA Regulated</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
          <div className="sm:col-span-3 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by Employee Name, Destination, or Tracking Number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl bg-white text-xs focus:ring-2 focus:ring-[#173B67] focus:outline-none"
            />
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-xl bg-white text-xs font-semibold text-slate-800"
            >
              <option value="all">All Approval Statuses</option>
              <option value="Approved">Approved</option>
              <option value="Pending Approval">Pending Approval</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
            Official Travel Orders Registry ({filteredOrders.length})
          </h3>
          <span className="text-[11px] text-slate-500">
            Compliant with COA Circular No. 2021-001 & CSC Travel Regulations
          </span>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="p-8 text-center text-slate-500 space-y-2">
            <Compass className="w-8 h-8 mx-auto text-slate-300" />
            <p className="font-bold text-slate-700">No travel orders found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-200">
                  <th className="py-3 px-4">Tracking No.</th>
                  <th className="py-3 px-4">Employee & Office</th>
                  <th className="py-3 px-4">Destination & Transport</th>
                  <th className="py-3 px-4">Travel Dates</th>
                  <th className="py-3 px-4 text-right">Est. Per Diem</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredOrders.map(to => (
                  <tr key={to.id} className="hover:bg-blue-50/40 transition-colors">
                    
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-[#173B67] block">
                        {to.toTrackingNumber}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {to.appropriationCode}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{to.employeeName}</div>
                      <div className="text-[11px] text-slate-500 truncate max-w-[180px]">
                        {to.position} • {to.officeName}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-800 flex items-center space-x-1">
                        <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        <span className="truncate max-w-[200px]">{to.destination}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 flex items-center space-x-1 mt-0.5">
                        {to.transportationType === 'Commercial Air' ? <Plane className="w-3 h-3 text-sky-600" /> :
                         to.transportationType === 'Ferry / RoRo' ? <Ship className="w-3 h-3 text-indigo-600" /> :
                         <Car className="w-3 h-3 text-emerald-600" />}
                        <span>{to.transportationType}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-700">
                        {to.departureDate} to {to.returnDate}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[160px]">
                        {to.purpose}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                      ₱{to.perDiemEstimated.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        to.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        to.status === 'Pending Approval' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {to.status === 'Approved' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        <span>{to.status}</span>
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right space-x-1.5">
                      {to.status === 'Pending Approval' && (
                        <button
                          type="button"
                          onClick={() => handleApprove(to.id)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg cursor-pointer text-xs"
                        >
                          Approve
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setSelectedOrderForPrint(to)}
                        className="px-2.5 py-1 bg-[#173B67] hover:bg-[#122e50] text-white font-bold rounded-lg cursor-pointer text-xs inline-flex items-center space-x-1"
                      >
                        <Printer className="w-3 h-3 text-amber-300" />
                        <span>Print</span>
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
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] my-auto">
            
            <div className="p-4 bg-[#173B67] text-white flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-2.5">
                <Compass className="w-5 h-5 text-amber-300" />
                <h3 className="font-bold text-base">Issue Official Travel Order (TO)</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="p-5 space-y-4 overflow-y-auto text-xs">
              
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Select Traveling Personnel
                </label>
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
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Destination (Specific Office / City / Province)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. DILG Regional Office IV-B, Calapan City, Oriental Mindoro"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl bg-white text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Departure Date</label>
                  <input
                    type="date"
                    required
                    value={departureDate}
                    onChange={(e) => setDepartureDate(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-xl bg-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Return Date</label>
                  <input
                    type="date"
                    required
                    value={returnDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-xl bg-white text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Transportation Mode</label>
                  <select
                    value={transportationType}
                    onChange={(e) => setTransportationType(e.target.value as any)}
                    className="w-full p-2 border border-slate-300 rounded-xl bg-white text-xs"
                  >
                    <option value="Official Vehicle">Official Municipal Vehicle</option>
                    <option value="Commercial Air">Commercial Air Flight</option>
                    <option value="Ferry / RoRo">Ferry / RoRo Vessel</option>
                    <option value="Public Bus / Van">Public Bus / Van</option>
                    <option value="Private Vehicle">Private Vehicle (Official Use)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Estimated Per Diem (₱)</label>
                  <input
                    type="number"
                    value={perDiemEstimated}
                    onChange={(e) => setPerDiemEstimated(Number(e.target.value))}
                    className="w-full p-2 border border-slate-300 rounded-xl bg-white font-mono text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Specific Official Purpose / Mission of Travel
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Detail the specific public interest, conference, workshop, or project monitoring purpose..."
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl bg-white text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Appropriation Code</label>
                  <input
                    type="text"
                    value={appropriationCode}
                    onChange={(e) => setAppropriationCode(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-xl bg-white font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Approving Official</label>
                  <input
                    type="text"
                    value={approvedBy}
                    onChange={(e) => setApprovedBy(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-xl bg-white text-xs font-semibold"
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
                  <span>Issue Travel Order</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Print View Modal */}
      {selectedOrderForPrint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden flex flex-col my-auto">
            
            <div className="p-4 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
              <span className="font-bold text-slate-800 text-xs">Official Travel Order Document</span>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-[#173B67] text-white font-bold rounded-lg cursor-pointer text-xs flex items-center space-x-1"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Document</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedOrderForPrint(null)}
                  className="p-1 rounded-lg text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-8 space-y-6 text-slate-900 font-serif text-xs bg-white">
              
              {/* Official Header */}
              <div className="text-center space-y-1 border-b pb-4">
                <p className="text-[10px] uppercase font-sans tracking-widest text-slate-500">
                  Republic of the Philippines • Province of Occidental Mindoro
                </p>
                <h3 className="text-base font-bold font-sans text-[#173B67]">
                  MUNICIPALITY OF SAN JOSE
                </h3>
                <p className="text-xs font-sans text-slate-700">Office of the Municipal Mayor</p>
                <div className="inline-block mt-2 px-3 py-1 bg-slate-100 rounded border border-slate-300 font-sans font-bold text-xs">
                  OFFICIAL TRAVEL ORDER: {selectedOrderForPrint.toTrackingNumber}
                </div>
              </div>

              {/* Order Content */}
              <div className="space-y-3 font-sans leading-relaxed">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div><strong>Name of Personnel:</strong> {selectedOrderForPrint.employeeName}</div>
                  <div><strong>Position:</strong> {selectedOrderForPrint.position}</div>
                  <div><strong>Official Station / Office:</strong> {selectedOrderForPrint.officeName}</div>
                  <div><strong>Transportation:</strong> {selectedOrderForPrint.transportationType}</div>
                  <div><strong>Departure Date:</strong> {selectedOrderForPrint.departureDate}</div>
                  <div><strong>Return Date:</strong> {selectedOrderForPrint.returnDate}</div>
                  <div className="col-span-2"><strong>Destination:</strong> {selectedOrderForPrint.destination}</div>
                  <div className="col-span-2"><strong>Appropriation Account:</strong> {selectedOrderForPrint.appropriationCode} (Per Diem: ₱{selectedOrderForPrint.perDiemEstimated.toLocaleString()})</div>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <strong className="block text-[11px] text-slate-600 mb-1 uppercase">Purpose of Travel:</strong>
                  <p className="text-xs text-slate-800 italic">"{selectedOrderForPrint.purpose}"</p>
                </div>
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-8 pt-8 border-t font-sans">
                <div className="text-center">
                  <div className="border-b border-slate-400 pb-1 font-bold">
                    {selectedOrderForPrint.recommendingApprovalBy || 'Department Head'}
                  </div>
                  <div className="text-[10px] text-slate-500 uppercase mt-0.5">Recommending Approval</div>
                </div>

                <div className="text-center">
                  <div className="border-b border-slate-400 pb-1 font-bold">
                    {selectedOrderForPrint.approvedBy}
                  </div>
                  <div className="text-[10px] text-slate-500 uppercase mt-0.5">Municipal Mayor / Approving Authority</div>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};
