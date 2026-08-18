import React, { useState } from 'react';
import {
  ChevronLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Send,
  Star,
  User,
  Wrench,
  ShieldCheck,
  Check,
  X,
  Sparkles,
  MessageSquarePlus,
} from 'lucide-react';
import { Complaint, User as UserType, ComplaintFeedback, TimelineEvent } from '../types';

interface ComplaintDetailScreenProps {
  complaint: Complaint;
  currentUser: UserType | null;
  onBack: () => void;
  onUpdateComplaint: (updated: Complaint) => void;
}

export const ComplaintDetailScreen: React.FC<ComplaintDetailScreenProps> = ({
  complaint,
  currentUser,
  onBack,
  onUpdateComplaint,
}) => {
  const [feedbackResolved, setFeedbackResolved] = useState<boolean>(
    complaint.feedback?.isResolved ?? true
  );
  const [rating, setRating] = useState<number>(complaint.feedback?.rating ?? 5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [feedbackComment, setFeedbackComment] = useState(
    complaint.feedback?.comments ?? ''
  );
  const [feedbackSubmitted, setFeedbackSubmitted] = useState<boolean>(
    !!complaint.feedback
  );

  // New message input
  const [newMessage, setNewMessage] = useState('');
  const [newMessageTa, setNewMessageTa] = useState('');
  const [showAdminControls, setShowAdminControls] = useState(
    currentUser?.role === 'committee'
  );

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newFeedback: ComplaintFeedback = {
      isResolved: feedbackResolved,
      rating,
      comments: feedbackComment.trim(),
      submittedAt: 'Just now',
    };

    const updated: Complaint = {
      ...complaint,
      status: feedbackResolved ? 'resolved' : 'in_progress',
      feedback: newFeedback,
    };

    onUpdateComplaint(updated);
    setFeedbackSubmitted(true);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const isMaintenance = currentUser?.role === 'committee';
    const now = new Date();
    const timeString = `Today • ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

    const newTimelineEvent: TimelineEvent = {
      id: 'tl-' + Date.now(),
      senderType: isMaintenance ? 'maintenance' : 'user',
      senderName: isMaintenance ? 'Maintenance Team' : (currentUser?.name || 'You'),
      senderNameTa: isMaintenance ? 'பராமரிப்பு குழு' : 'நீங்கள்',
      timestamp: timeString,
      text: newMessage.trim(),
      textTa: newMessageTa.trim() || undefined,
    };

    const updated: Complaint = {
      ...complaint,
      timeline: [...complaint.timeline, newTimelineEvent],
    };

    onUpdateComplaint(updated);
    setNewMessage('');
    setNewMessageTa('');
  };

  const handleStatusChange = (newStatus: Complaint['status']) => {
    const statusTextEn =
      newStatus === 'resolved'
        ? 'Bulb/Issue replaced. Issue marked as resolved.'
        : newStatus === 'in_progress'
        ? 'Technician assigned and working on the repair.'
        : 'Status changed to Pending investigation.';

    const statusTextTa =
      newStatus === 'resolved'
        ? 'பிரச்சனை தீர்க்கப்பட்டது.'
        : newStatus === 'in_progress'
        ? 'தொழில்நுட்ப வல்லுநர் சரிசெய்கிறார்.'
        : 'புகார் நிலுவையில் உள்ளது.';

    const autoEvent: TimelineEvent = {
      id: 'tl-' + Date.now(),
      senderType: 'maintenance',
      senderName: 'Maintenance Team',
      senderNameTa: 'பராமரிப்பு குழு',
      timestamp: `Today • ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      text: statusTextEn,
      textTa: statusTextTa,
    };

    const updated: Complaint = {
      ...complaint,
      status: newStatus,
      timeline: [...complaint.timeline, autoEvent],
    };

    onUpdateComplaint(updated);
  };

  return (
    <div id="complaint-detail-view" className="min-h-screen bg-[#F4F7F6] pb-28">
      {/* Top Header */}
      <div className="sticky top-0 z-20 bg-[#F4F7F6]/95 backdrop-blur-md px-4 py-3 flex items-center justify-between border-b border-slate-200/50">
        <button
          id="detail-back-button"
          onClick={onBack}
          className="p-1 -ml-1 text-[#06424D] hover:bg-slate-200/60 rounded-full transition flex items-center"
        >
          <ChevronLeft className="w-7 h-7 stroke-[2.5]" />
          <span className="text-xl font-bold text-[#06424D] -ml-0.5">Complaint Detail</span>
        </button>

        {currentUser?.role === 'committee' && (
          <button
            onClick={() => setShowAdminControls(!showAdminControls)}
            className="text-xs font-bold px-2.5 py-1 bg-teal-100 text-[#0B4D58] rounded-xl flex items-center gap-1"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            {showAdminControls ? 'Hide Actions' : 'Admin Actions'}
          </button>
        )}
      </div>

      <div className="px-5 pt-3 space-y-5">
        {/* Top Info Card */}
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              COMPLAINT ID <span className="font-normal">/ புகார் எண்</span>
            </span>

            {/* Status Pill */}
            {complaint.status === 'resolved' ? (
              <div className="bg-[#E0F2FE]/80 text-[#094D58] border border-teal-200/60 px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Resolved / தீர்க்கப்பட்டது</span>
              </div>
            ) : complaint.status === 'in_progress' ? (
              <div className="bg-sky-100 text-sky-800 px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-sky-600" />
                <span>In Progress / செயல்பாட்டில்</span>
              </div>
            ) : (
              <div className="bg-amber-100 text-amber-800 px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>Pending / நிலுவையில்</span>
              </div>
            )}
          </div>

          <div className="text-sm font-extrabold text-slate-800 tracking-tight">
            {complaint.customId}
          </div>

          {/* Heading */}
          <h2 className="text-xl font-bold text-slate-900 leading-snug">
            {complaint.title}
            {complaint.titleTa && (
              <span className="font-medium text-slate-700"> / {complaint.titleTa}</span>
            )}
          </h2>

          {/* Meta line */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 font-medium pt-1">
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{complaint.reportedAt}</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1">
              <Wrench className="w-3.5 h-3.5 text-slate-400" />
              <span>
                {complaint.categoryLabel} / {complaint.categoryLabelTa}
              </span>
            </div>
          </div>
        </div>

        {/* Committee Admin Quick Status Controls */}
        {showAdminControls && (
          <div className="bg-white border border-teal-200 rounded-2xl p-4 shadow-sm space-y-2.5 animate-in fade-in">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-teal-900 uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600" /> Committee Management
              </span>
              <span className="text-[11px] font-semibold text-slate-500">
                Flat: {complaint.reportedBy}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleStatusChange('pending')}
                className={`py-2 px-2 rounded-xl text-xs font-bold transition ${
                  complaint.status === 'pending'
                    ? 'bg-amber-500 text-white shadow'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => handleStatusChange('in_progress')}
                className={`py-2 px-2 rounded-xl text-xs font-bold transition ${
                  complaint.status === 'in_progress'
                    ? 'bg-[#0B4D58] text-white shadow'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                In Progress
              </button>
              <button
                onClick={() => handleStatusChange('resolved')}
                className={`py-2 px-2 rounded-xl text-xs font-bold transition ${
                  complaint.status === 'resolved'
                    ? 'bg-emerald-600 text-white shadow'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Resolved
              </button>
            </div>
          </div>
        )}

        {/* Timeline / Conversation Thread */}
        <div className="space-y-4 pt-2">
          {complaint.timeline.map((event) => {
            const isUser = event.senderType === 'user';
            return (
              <div key={event.id} className="flex items-start gap-3">
                {/* Avatar Icon */}
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    isUser
                      ? 'bg-sky-100 text-sky-700'
                      : 'bg-[#08424D] text-white'
                  }`}
                >
                  {isUser ? (
                    <User className="w-5 h-5" />
                  ) : (
                    <Wrench className="w-4 h-4 text-teal-200" />
                  )}
                </div>

                {/* Bubble */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2 mb-1">
                    <span className="text-xs font-bold text-slate-800">
                      {event.senderName} / <span className="font-normal text-slate-500">{event.senderNameTa}</span>
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {event.timestamp}
                    </span>
                  </div>

                  <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 space-y-2">
                    <p className="text-sm font-semibold text-slate-800 leading-relaxed">
                      {event.text}
                      {event.textTa && (
                        <span className="block font-normal text-slate-600 text-xs mt-1.5 leading-relaxed">
                          {event.textTa}
                        </span>
                      )}
                    </p>

                    {/* Attached Photo */}
                    {event.photoUrl && (
                      <div className="mt-3 rounded-xl overflow-hidden border border-slate-200 max-h-52 bg-slate-950">
                        <img
                          src={event.photoUrl}
                          alt="Complaint attachment"
                          className="w-full h-44 object-cover hover:scale-105 transition-transform duration-300"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Add quick reply */}
        <div className="bg-white rounded-2xl p-3.5 shadow-sm border border-slate-200">
          <form onSubmit={handleSendMessage} className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={
                  currentUser?.role === 'committee'
                    ? 'Send technician / maintenance update...'
                    : 'Post additional details / message...'
                }
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-[#08424D]"
              />
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className="p-2 bg-[#08424D] hover:bg-[#06333c] disabled:opacity-40 text-white rounded-xl transition"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            {newMessage && (
              <input
                type="text"
                value={newMessageTa}
                onChange={(e) => setNewMessageTa(e.target.value)}
                placeholder="Optional Tamil translation / தமிழ் விளக்கம்..."
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600 focus:outline-none"
              />
            )}
          </form>
        </div>

        {/* Resolution & Feedback Section (Only for residents when resolved) */}
        {currentUser?.role === 'resident' && complaint.status === 'resolved' && (
          <div
            id="feedback-resolution-card"
            className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-4 mt-6"
          >
            {/* Header */}
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Is this resolved? / <span className="font-semibold text-slate-700">இது சரிசெய்யப்பட்டதா?</span>
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Please confirm if the issue is fixed to your satisfaction.
              </p>
            </div>

            {/* Yes / No Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                id="resolution-no-btn"
                type="button"
                onClick={() => setFeedbackResolved(false)}
                className={`py-3 px-4 rounded-2xl border font-bold text-xs flex items-center justify-center gap-1.5 transition ${
                  !feedbackResolved
                    ? 'bg-rose-50 border-rose-400 text-rose-700 shadow-sm'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <X className="w-4 h-4 text-rose-600 stroke-[2.5]" />
                <span>No / இல்லை</span>
              </button>

              <button
                id="resolution-yes-btn"
                type="button"
                onClick={() => setFeedbackResolved(true)}
                className={`py-3 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 shadow transition ${
                  feedbackResolved
                    ? 'bg-[#08424D] text-white shadow-teal-900/10'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
                <span>Yes / ஆம்</span>
              </button>
            </div>

            {/* Rating Section */}
            <div className="pt-2">
              <label className="block text-xs font-bold text-slate-800 mb-2">
                Rate the service / <span className="font-medium text-slate-600">சேவையை மதிப்பிடவும்</span>
              </label>

              {/* 5 Stars */}
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    id={`star-rating-btn-${star}`}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(null)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-7 h-7 ${
                        (hoverRating ?? rating) >= star
                          ? 'fill-amber-400 text-amber-400'
                          : 'fill-transparent text-slate-300'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-xs font-bold text-slate-600 ml-2">
                  {rating} / 5 Stars
                </span>
              </div>
            </div>

            {/* Feedback Form */}
            <form onSubmit={handleFeedbackSubmit} className="space-y-3 pt-1">
              <textarea
                id="feedback-comments-input"
                rows={3}
                value={feedbackComment}
                onChange={(e) => setFeedbackComment(e.target.value)}
                placeholder="Add comments (optional) / கருத்துகளைச் சேர்க்கவும்..."
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B4D58]/30 focus:border-[#0B4D58]"
              ></textarea>

              <button
                id="submit-feedback-btn"
                type="submit"
                className="w-full bg-[#08424D] hover:bg-[#06333c] active:scale-[0.99] text-white py-3.5 px-4 rounded-2xl shadow font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Submit Feedback / கருத்தை சமர்ப்பிக்கவும்</span>
              </button>
            </form>

            {feedbackSubmitted && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Feedback recorded! Thank you for helping us improve our community.</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
