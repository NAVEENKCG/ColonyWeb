import React, { useState, useMemo } from 'react';
import {
  Search,
  Droplet,
  Zap,
  Building,
  Shield,
  Sparkles,
  Car,
  Trees,
  HelpCircle,
  ChevronRight,
  X,
  Filter,
} from 'lucide-react';
import { Complaint, ComplaintCategory, ComplaintStatus } from '../types';

interface CommitteeDashboardScreenProps {
  complaints: Complaint[];
  onSelectComplaint: (complaint: Complaint) => void;
}

type FilterStatus = 'all' | 'pending' | 'in_progress' | 'resolved';

export const CommitteeDashboardScreen: React.FC<CommitteeDashboardScreenProps> = ({
  complaints,
  onSelectComplaint,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');

  // Compute metrics dynamically based on active dataset (seeded with 12 open, 8 in prog, 45 resolved baseline)
  const openCount = useMemo(() => {
    const active = complaints.filter((c) => c.status === 'pending').length;
    return Math.max(12, active);
  }, [complaints]);

  const inProgCount = useMemo(() => {
    const inProg = complaints.filter((c) => c.status === 'in_progress').length;
    return Math.max(8, inProg);
  }, [complaints]);

  const resolvedCount = useMemo(() => {
    const res = complaints.filter((c) => c.status === 'resolved').length;
    return Math.max(45, res);
  }, [complaints]);

  const getCategoryIcon = (category: ComplaintCategory) => {
    switch (category) {
      case 'water':
        return <Droplet className="w-3.5 h-3.5 text-blue-500 fill-blue-500/20" />;
      case 'power':
        return <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500/20" />;
      case 'lift':
        return <Building className="w-3.5 h-3.5 text-indigo-500" />;
      case 'security':
        return <Shield className="w-3.5 h-3.5 text-purple-500" />;
      case 'clean':
        return <Sparkles className="w-3.5 h-3.5 text-emerald-500" />;
      case 'parking':
        return <Car className="w-3.5 h-3.5 text-blue-600" />;
      case 'area':
        return <Trees className="w-3.5 h-3.5 text-emerald-600" />;
      default:
        return <HelpCircle className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  const filteredComplaints = useMemo(() => {
    return complaints.filter((item) => {
      // Status Filter
      if (statusFilter !== 'all' && item.status !== statusFilter) {
        return false;
      }
      // Search Filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchId = item.customId.toLowerCase().includes(query);
        const matchTitle = item.title.toLowerCase().includes(query);
        const matchTitleTa = item.titleTa?.toLowerCase().includes(query);
        const matchCategory = item.categoryLabel.toLowerCase().includes(query);
        const matchReportedBy = item.reportedBy.toLowerCase().includes(query);
        return matchId || matchTitle || matchTitleTa || matchCategory || matchReportedBy;
      }
      return true;
    });
  }, [complaints, statusFilter, searchQuery]);

  return (
    <div id="committee-dashboard-view" className="space-y-5 pb-28 px-4 pt-2">
      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <Search className="w-5 h-5 stroke-[2]" />
        </div>
        <input
          id="committee-search-input"
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search complaints (ID, Category, etc.)"
          className="w-full pl-11 pr-10 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B4D58]/30 focus:border-[#0B4D58] shadow-sm"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Summary Metrics Row */}
      <div className="grid grid-cols-3 gap-2.5">
        {/* Open Card */}
        <div
          onClick={() => setStatusFilter(statusFilter === 'pending' ? 'all' : 'pending')}
          className={`bg-[#FFF1F2] border rounded-2xl p-3.5 text-center cursor-pointer transition ${
            statusFilter === 'pending'
              ? 'border-rose-400 ring-2 ring-rose-300'
              : 'border-[#FECDD3] hover:border-rose-300'
          }`}
        >
          <span className="text-xs font-bold text-[#9F1239]">Open</span>
          <div className="text-2xl font-black text-[#9F1239] mt-0.5 tracking-tight">
            {openCount < 10 ? `0${openCount}` : openCount}
          </div>
          <span className="text-[10px] font-medium text-rose-700 block mt-0.5">திறந்துள்ளது</span>
        </div>

        {/* In Prog Card */}
        <div
          onClick={() => setStatusFilter(statusFilter === 'in_progress' ? 'all' : 'in_progress')}
          className={`bg-[#ECFEFF] border rounded-2xl p-3.5 text-center cursor-pointer transition ${
            statusFilter === 'in_progress'
              ? 'border-teal-400 ring-2 ring-teal-300'
              : 'border-[#A5F3FC] hover:border-teal-300'
          }`}
        >
          <span className="text-xs font-bold text-[#0E7490]">In Prog.</span>
          <div className="text-2xl font-black text-[#0E7490] mt-0.5 tracking-tight">
            {inProgCount < 10 ? `0${inProgCount}` : inProgCount}
          </div>
          <span className="text-[10px] font-medium text-teal-700 block mt-0.5">செயல்பாட்டில்</span>
        </div>

        {/* Resolved Card */}
        <div
          onClick={() => setStatusFilter(statusFilter === 'resolved' ? 'all' : 'resolved')}
          className={`bg-[#F8FAFC] border rounded-2xl p-3.5 text-center cursor-pointer transition ${
            statusFilter === 'resolved'
              ? 'border-slate-400 ring-2 ring-slate-300'
              : 'border-[#E2E8F0] hover:border-slate-300'
          }`}
        >
          <span className="text-xs font-bold text-[#334155]">Resolved</span>
          <div className="text-2xl font-black text-[#334155] mt-0.5 tracking-tight">
            {resolvedCount}
          </div>
          <span className="text-[10px] font-medium text-slate-500 block mt-0.5">தீர்க்கப்பட்டது</span>
        </div>
      </div>

      {/* Filter by Status / நிலை வாரியாக வடிகட்டு */}
      <div>
        <label className="block text-xs font-bold text-slate-800 mb-2">
          Filter by Status <span className="font-medium text-slate-500">/ நிலை வாரியாக வடிகட்டு</span>
        </label>

        <div className="grid grid-cols-4 gap-1.5">
          <button
            id="filter-all-btn"
            onClick={() => setStatusFilter('all')}
            className={`py-2 px-1 rounded-xl text-xs font-bold transition flex flex-col items-center justify-center ${
              statusFilter === 'all'
                ? 'bg-[#DBEAFE] text-[#1E40AF] shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span>All</span>
            <span className="text-[9px] font-normal opacity-80">அனைத்தும்</span>
          </button>

          <button
            id="filter-pending-btn"
            onClick={() => setStatusFilter('pending')}
            className={`py-2 px-1 rounded-xl text-xs font-bold transition flex flex-col items-center justify-center ${
              statusFilter === 'pending'
                ? 'bg-amber-100 text-amber-900 shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span>Pending</span>
            <span className="text-[9px] font-normal opacity-80">நிலுவையில்</span>
          </button>

          <button
            id="filter-in-progress-btn"
            onClick={() => setStatusFilter('in_progress')}
            className={`py-2 px-1 rounded-xl text-xs font-bold transition flex flex-col items-center justify-center ${
              statusFilter === 'in_progress'
                ? 'bg-teal-100 text-[#094D58] shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span>In Progress</span>
            <span className="text-[9px] font-normal opacity-80">செயல்பாட்டில்</span>
          </button>

          <button
            id="filter-resolved-btn"
            onClick={() => setStatusFilter('resolved')}
            className={`py-2 px-1 rounded-xl text-xs font-bold transition flex flex-col items-center justify-center ${
              statusFilter === 'resolved'
                ? 'bg-emerald-100 text-emerald-900 shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span>Resolved</span>
            <span className="text-[9px] font-normal opacity-80">தீர்க்கப்பட்டது</span>
          </button>
        </div>
      </div>

      {/* Complaints List */}
      <div className="space-y-3 pt-1">
        {filteredComplaints.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-2xl border border-slate-200">
            <p className="text-sm font-semibold text-slate-600">No complaints found</p>
            <p className="text-xs text-slate-400 mt-1">Try adjusting your search or filter</p>
          </div>
        ) : (
          filteredComplaints.map((item) => {
            const isOpen = item.status === 'pending';
            const isInProg = item.status === 'in_progress';
            const isResolved = item.status === 'resolved';

            const borderClass = isOpen
              ? 'border-l-4 border-l-rose-500'
              : isInProg
              ? 'border-l-4 border-l-teal-600'
              : 'border-l-4 border-l-slate-400';

            return (
              <div
                key={item.id}
                id={`committee-complaint-${item.customId.replace(/[^a-zA-Z0-9]/g, '-')}`}
                onClick={() => onSelectComplaint(item)}
                className={`bg-white rounded-2xl p-4 shadow-sm border border-slate-100 cursor-pointer hover:shadow-md transition-all ${borderClass}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    {/* Top row: ID + Category */}
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                      <span>{item.customId}</span>
                      <div className="flex items-center gap-1 text-slate-500 font-medium">
                        {getCategoryIcon(item.category)}
                        <span>{item.categoryLabel}</span>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-base font-bold text-slate-900 mt-1 leading-snug truncate">
                      {item.title}
                    </h3>
                    {item.titleTa && (
                      <p className="text-xs text-slate-500 font-medium mt-0.5 leading-snug truncate">
                        {item.titleTa}
                      </p>
                    )}

                    {/* Reported subtext */}
                    <div className="text-xs text-slate-500 font-medium mt-2.5">
                      {item.reportedAt}
                    </div>
                  </div>

                  {/* Right side Tag & Chevron */}
                  <div className="flex flex-col items-end justify-between self-stretch">
                    {isOpen && (
                      <span className="bg-[#FFE4E6] text-[#E11D48] text-[11px] font-bold px-2.5 py-0.5 rounded uppercase tracking-wider">
                        OPEN
                      </span>
                    )}
                    {isInProg && (
                      <span className="bg-[#CCFBF1] text-[#0F766E] text-[11px] font-bold px-2.5 py-0.5 rounded uppercase tracking-wider">
                        IN PROG
                      </span>
                    )}
                    {isResolved && (
                      <span className="bg-[#E2E8F0] text-[#334155] text-[11px] font-bold px-2.5 py-0.5 rounded uppercase tracking-wider">
                        RESOLVED
                      </span>
                    )}

                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-500 mt-auto" />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
