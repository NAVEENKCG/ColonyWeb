import React from 'react';
import {
  PlusCircle,
  Wrench,
  Zap,
  Sparkles,
  Shield,
  Clock,
  Calendar,
  CheckCircle2,
  HelpCircle,
  Building,
  Car,
  Trees,
} from 'lucide-react';
import { Complaint, User, ComplaintCategory } from '../types';

interface ResidentHomeScreenProps {
  complaints: Complaint[];
  currentUser: User | null;
  onRaiseClick: () => void;
  onSelectComplaint: (complaint: Complaint) => void;
}

export const ResidentHomeScreen: React.FC<ResidentHomeScreenProps> = ({
  complaints,
  currentUser,
  onRaiseClick,
  onSelectComplaint,
}) => {
  // Filter for resident's complaints or show sample complaints
  const residentComplaints = complaints.filter(
    (c) => c.reportedBy === currentUser?.flatNumber || c.reportedBy === 'B-402'
  );

  const activeCount = residentComplaints.filter((c) => c.status !== 'resolved').length;

  const getCategoryIcon = (category: ComplaintCategory) => {
    switch (category) {
      case 'water':
        return <Wrench className="w-5 h-5 text-amber-600" />;
      case 'power':
        return <Zap className="w-5 h-5 text-sky-600" />;
      case 'clean':
        return <Sparkles className="w-5 h-5 text-emerald-600" />;
      case 'lift':
        return <Building className="w-5 h-5 text-indigo-600" />;
      case 'security':
        return <Shield className="w-5 h-5 text-purple-600" />;
      case 'parking':
        return <Car className="w-5 h-5 text-blue-600" />;
      case 'area':
        return <Trees className="w-5 h-5 text-emerald-700" />;
      default:
        return <HelpCircle className="w-5 h-5 text-slate-600" />;
    }
  };

  const getStatusBadge = (status: Complaint['status']) => {
    switch (status) {
      case 'pending':
        return (
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 bg-amber-100/90 px-2 py-0.5 rounded">
            PENDING
          </span>
        );
      case 'in_progress':
        return (
          <span className="text-[11px] font-bold uppercase tracking-wider text-sky-700 bg-sky-100 px-2 py-0.5 rounded">
            IN PROGRESS
          </span>
        );
      case 'resolved':
        return (
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
            RESOLVED
          </span>
        );
    }
  };

  const getCardBorderColor = (status: Complaint['status']) => {
    switch (status) {
      case 'pending':
        return 'border-l-4 border-l-amber-500';
      case 'in_progress':
        return 'border-l-4 border-l-[#0EA5E9]';
      case 'resolved':
        return 'border-l-4 border-l-emerald-500';
    }
  };

  const getIconBackground = (category: ComplaintCategory) => {
    switch (category) {
      case 'water':
        return 'bg-amber-100/80';
      case 'power':
        return 'bg-sky-100';
      case 'clean':
        return 'bg-emerald-100';
      default:
        return 'bg-slate-100';
    }
  };

  return (
    <div id="resident-home-view" className="space-y-6 pb-24 px-4 pt-2">
      {/* Big Action Banner: Raise a Complaint */}
      <button
        id="raise-complaint-cta-banner"
        onClick={onRaiseClick}
        className="w-full bg-[#08424D] hover:bg-[#06333c] active:scale-[0.99] text-white p-4 rounded-2xl shadow-md transition flex items-center justify-center gap-3 cursor-pointer"
      >
        <PlusCircle className="w-6 h-6 text-white stroke-[2.2]" />
        <div className="text-center">
          <div className="text-base font-bold leading-tight">Raise a Complaint</div>
          <div className="text-xs text-teal-100/90 font-medium">புகார் செய்க</div>
        </div>
      </button>

      {/* Section: My Complaints */}
      <div>
        <div className="flex items-center justify-between mb-4 px-1">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">My Complaints</h2>
            <p className="text-xs text-slate-500 font-medium">எனது புகார்கள்</p>
          </div>
          <span
            id="active-complaints-badge"
            className="bg-slate-200 text-slate-700 px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider"
          >
            {activeCount > 0 ? `${activeCount} ACTIVE` : 'ALL RESOLVED'}
          </span>
        </div>

        {/* Complaints List */}
        <div className="space-y-3.5">
          {residentComplaints.map((complaint) => (
            <div
              key={complaint.id}
              id={`complaint-card-${complaint.customId.replace(/[^a-zA-Z0-9]/g, '-')}`}
              onClick={() => onSelectComplaint(complaint)}
              className={`bg-white rounded-2xl p-4 shadow-sm border border-slate-100 cursor-pointer hover:shadow-md transition-all ${getCardBorderColor(
                complaint.status
              )}`}
            >
              <div className="flex items-start gap-3.5">
                {/* Category Icon Box */}
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${getIconBackground(
                    complaint.category
                  )}`}
                >
                  {getCategoryIcon(complaint.category)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-slate-500 tracking-tight">
                      {complaint.customId}
                    </span>
                    {getStatusBadge(complaint.status)}
                  </div>

                  <h3 className="text-base font-bold text-slate-900 mt-1 leading-snug truncate">
                    {complaint.title}
                  </h3>
                  {complaint.titleTa && (
                    <p className="text-xs text-slate-500 font-medium mt-0.5 leading-snug truncate">
                      {complaint.titleTa}
                    </p>
                  )}

                  {/* Bottom Meta */}
                  <div className="flex items-center justify-between mt-3 text-xs text-slate-500 font-medium">
                    <div className="flex items-center gap-1.5">
                      {complaint.status === 'resolved' ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{complaint.reportedAt.includes('Closed') ? complaint.reportedAt : `Closed on ${complaint.reportedAt}`}</span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{complaint.reportedAt}</span>
                        </>
                      )}
                    </div>

                    {complaint.assignedBadge && (
                      <span className="bg-slate-200 text-slate-600 text-[11px] font-bold px-2 py-0.5 rounded">
                        {complaint.assignedBadge}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Sample detail view shortcut for C-2023-114A */}
          <div
            id="featured-detail-card"
            onClick={() => {
              const sampleDetail = complaints.find((c) => c.customId === 'C-2023-114A');
              if (sampleDetail) onSelectComplaint(sampleDetail);
            }}
            className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 cursor-pointer hover:shadow-md transition-all border-l-4 border-l-emerald-500"
          >
            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-sky-100 flex items-center justify-center flex-shrink-0">
                <Zap className="w-5 h-5 text-sky-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-slate-500">C-2023-114A</span>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                    RESOLVED
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-1 leading-snug">
                  Streetlight not working
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  தெரு விளக்கு எரியவில்லை
                </p>
                <div className="flex items-center justify-between mt-3 text-xs text-slate-500 font-medium">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Closed on Oct 25</span>
                  </div>
                  <span className="text-xs text-[#08424D] font-bold">View History & Feedback →</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
