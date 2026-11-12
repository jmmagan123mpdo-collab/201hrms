import React, { useState, useMemo } from 'react';
import { SystemBroadcast } from '../../types/index.ts';
import { INITIAL_BROADCASTS } from '../../data/operationalData.ts';
import { 
  Bell, 
  Search, 
  Filter, 
  Plus, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  ShieldAlert, 
  Calendar, 
  Users, 
  X,
  Eye,
  Trash2
} from 'lucide-react';

export const NotificationsManager: React.FC = () => {
  const [broadcasts, setBroadcasts] = useState<SystemBroadcast[]>(INITIAL_BROADCASTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [selectedBroadcast, setSelectedBroadcast] = useState<SystemBroadcast | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetAudience, setTargetAudience] = useState<SystemBroadcast['targetAudience']>('All Employees');
  const [priority, setPriority] = useState<SystemBroadcast['priority']>('Normal');
  const [issuedBy, setIssuedBy] = useState('Atty. Maria Elena Castillo, MHRMO Head');
  const [expiresAt, setExpiresAt] = useState('');

  const filteredBroadcasts = useMemo(() => {
    return broadcasts.filter(b => {
      if (priorityFilter !== 'all' && b.priority !== priorityFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = b.title.toLowerCase().includes(q);
        const matchMsg = b.message.toLowerCase().includes(q);
        if (!matchTitle && !matchMsg) return false;
      }
      return true;
    });
  }, [broadcasts, priorityFilter, searchQuery]);

  // Stats
  const totalBroadcasts = broadcasts.length;
  const totalReadCount = broadcasts.reduce((acc, b) => acc + b.readCount, 0);
  const cscMemoCount = broadcasts.filter(b => b.priority === 'CSC Memorandum' || b.priority === 'Urgent').length;

  const handleCompose = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      alert('Please fill in title and message.');
      return;
    }

    const newBroadcast: SystemBroadcast = {
      id: `BC-2026-${Date.now().toString().slice(-4)}`,
      title: title.trim(),
      message: message.trim(),
      targetAudience,
      priority,
      issuedBy: issuedBy.trim(),
      expiresAt: expiresAt || undefined,
      createdAt: new Date().toISOString(),
      readCount: 1
    };

    setBroadcasts(prev => [newBroadcast, ...prev]);
    setShowComposeModal(false);
    setTitle('');
    setMessage('');
  };

  const handleDelete = (id: string) => {
    setBroadcasts(prev => prev.filter(b => b.id !== id));
  };

  return (
    <div className="space-y-4 font-sans text-xs">
      
      {/* Top Banner Header */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-blue-100 text-[#173B67] text-[10px] font-bold uppercase tracking-wider mb-1">
            <Bell className="w-3 h-3 text-[#173B67]" />
            <span>Municipal Communications & Broadcast Dispatch</span>
          </div>
          <h2 className="text-base sm:text-xl font-extrabold text-slate-900 tracking-tight">
            System Broadcasts & Notifications Center
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Dispatch urgent CSC memoranda, mayor's executive orders, holiday announcements, and ESS push notifications.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowComposeModal(true)}
          className="px-4 py-2.5 bg-[#173B67] hover:bg-[#122e50] text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center space-x-1.5 cursor-pointer text-xs shrink-0"
        >
          <Send className="w-4 h-4 text-amber-300" />
          <span>Compose System Broadcast</span>
        </button>
      </div>

      {/* 3 Stat KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-4">
        <div className="bg-white p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider block truncate">
            Active Broadcasts Sent
          </span>
          <div className="text-lg sm:text-2xl font-extrabold text-[#173B67] mt-1 font-mono">
            {totalBroadcasts}
          </div>
          <span className="text-[10px] text-slate-400 block mt-0.5">All Portals Reached</span>
        </div>

        <div className="bg-white p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider block truncate">
            Total Employee Reads / Impressions
          </span>
          <div className="text-lg sm:text-2xl font-extrabold text-emerald-600 mt-1 font-mono">
            {totalReadCount}
          </div>
          <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">High Visibility</span>
        </div>

        <div className="bg-white p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider block truncate">
            CSC Memoranda & Priority Alerts
          </span>
          <div className="text-lg sm:text-2xl font-extrabold text-amber-600 mt-1 font-mono">
            {cscMemoCount}
          </div>
          <span className="text-[10px] text-amber-600 font-semibold block mt-0.5">Mandatory Compliance</span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
          <div className="sm:col-span-3 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search announcements by title or content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl bg-white text-xs focus:ring-2 focus:ring-[#173B67] focus:outline-none"
            />
          </div>

          <div>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-xl bg-white text-xs font-semibold text-slate-800"
            >
              <option value="all">All Priority Levels</option>
              <option value="Normal">Normal</option>
              <option value="Urgent">Urgent</option>
              <option value="CSC Memorandum">CSC Memorandum</option>
              <option value="Executive Order">Executive Order</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
            System Broadcasts Feed ({filteredBroadcasts.length})
          </h3>
          <span className="text-[11px] text-slate-500">Live on ESS Portal Bells</span>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredBroadcasts.map(b => (
            <div key={b.id} className="p-4 sm:p-5 hover:bg-blue-50/30 transition-colors flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center space-x-2 flex-wrap gap-1">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    b.priority === 'CSC Memorandum' ? 'bg-indigo-100 text-indigo-800 border border-indigo-200' :
                    b.priority === 'Urgent' ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                    b.priority === 'Executive Order' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {b.priority}
                  </span>

                  <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-semibold">
                    Audience: {b.targetAudience}
                  </span>

                  <span className="text-[11px] text-slate-400">
                    {new Date(b.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <h4 className="font-bold text-slate-900 text-sm">{b.title}</h4>
                <p className="text-slate-600 line-clamp-2 leading-relaxed text-xs">
                  {b.message}
                </p>

                <div className="text-[11px] text-slate-500 pt-1 flex items-center space-x-3">
                  <span>Issued By: <strong>{b.issuedBy}</strong></span>
                  <span>•</span>
                  <span><strong>{b.readCount}</strong> personnel read</span>
                  {b.expiresAt && (
                    <>
                      <span>•</span>
                      <span>Expires: {b.expiresAt}</span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setSelectedBroadcast(b)}
                  className="px-3 py-1.5 bg-[#173B67] hover:bg-[#122e50] text-white font-bold rounded-xl cursor-pointer text-xs flex items-center space-x-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(b.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

            </div>
          ))}
        </div>
      </div>

      {/* Compose Modal */}
      {showComposeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden flex flex-col my-auto">
            
            <div className="p-4 bg-[#173B67] text-white flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-2.5">
                <Send className="w-5 h-5 text-amber-300" />
                <h3 className="font-bold text-base">Compose System Broadcast Announcement</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowComposeModal(false)}
                className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCompose} className="p-5 space-y-4 text-xs">
              
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Broadcast Headline / Subject
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mandatory Submission of SALN / Flag Ceremony Schedule"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl bg-white text-xs font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Target Audience</label>
                  <select
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value as any)}
                    className="w-full p-2 border border-slate-300 rounded-xl bg-white text-xs font-semibold"
                  >
                    <option value="All Employees">All Employees (Entire LGU)</option>
                    <option value="Permanent Personnel Only">Permanent Personnel Only</option>
                    <option value="Casual & Job Order">Casual & Job Order Personnel</option>
                    <option value="Department Heads & Supervisors">Department Heads & Supervisors</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Priority Classification</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full p-2 border border-slate-300 rounded-xl bg-white text-xs font-semibold"
                  >
                    <option value="Normal">Normal General Advisory</option>
                    <option value="Urgent">Urgent High Priority Alert</option>
                    <option value="CSC Memorandum">CSC Memorandum Circular</option>
                    <option value="Executive Order">Mayor's Executive Order</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Official Message Body</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Type the full announcement message to be broadcasted to employee accounts..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl bg-white text-xs leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Issued By Authority</label>
                  <input
                    type="text"
                    value={issuedBy}
                    onChange={(e) => setIssuedBy(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-xl bg-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Expiration Date (Optional)</label>
                  <input
                    type="date"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-xl bg-white text-xs"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowComposeModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl bg-white text-slate-700 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#173B67] hover:bg-[#122e50] text-white font-bold rounded-xl shadow-md cursor-pointer flex items-center space-x-1.5"
                >
                  <Send className="w-4 h-4 text-emerald-400" />
                  <span>Dispatch Broadcast</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* View Broadcast Detail Modal */}
      {selectedBroadcast && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden flex flex-col my-auto p-5 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                selectedBroadcast.priority === 'CSC Memorandum' ? 'bg-indigo-100 text-indigo-800' :
                selectedBroadcast.priority === 'Urgent' ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-800'
              }`}>
                {selectedBroadcast.priority}
              </span>
              <button
                type="button"
                onClick={() => setSelectedBroadcast(null)}
                className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <h3 className="font-extrabold text-base text-slate-900">{selectedBroadcast.title}</h3>
              <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
                {selectedBroadcast.message}
              </p>
              <div className="text-[11px] text-slate-500 pt-2 space-y-0.5">
                <div>Issued By: <strong>{selectedBroadcast.issuedBy}</strong></div>
                <div>Target Audience: <strong>{selectedBroadcast.targetAudience}</strong></div>
                <div>Posted Date: <strong>{new Date(selectedBroadcast.createdAt).toLocaleString()}</strong></div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedBroadcast(null)}
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
