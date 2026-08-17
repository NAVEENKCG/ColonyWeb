import React, { useState } from 'react';
import { Megaphone, Plus, Bell, Calendar, Sparkles, Check, X, ShieldCheck } from 'lucide-react';
import { Notice, User } from '../types';

interface NoticesScreenProps {
  notices: Notice[];
  currentUser: User | null;
  onAddNotice: (newNotice: Omit<Notice, 'id'>) => void;
}

export const NoticesScreen: React.FC<NoticesScreenProps> = ({
  notices,
  currentUser,
  onAddNotice,
}) => {
  const [showNewNoticeModal, setShowNewNoticeModal] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Notice['category']>('MAINTENANCE');
  const [bodyEn, setBodyEn] = useState('');
  const [bodyTa, setBodyTa] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('ALL');

  const getCategoryHeaderStyle = (category: Notice['category']) => {
    switch (category) {
      case 'MAINTENANCE':
        return 'text-[#085F63]';
      case 'MEETING':
        return 'text-[#92400E]';
      case 'SECURITY':
        return 'text-[#334155]';
      case 'GENERAL':
        return 'text-[#047857]';
      default:
        return 'text-[#085F63]';
    }
  };

  const filteredNotices = notices.filter((n) => {
    if (selectedFilter === 'ALL') return true;
    return n.category === selectedFilter;
  });

  const handleCreateNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !bodyEn.trim()) return;

    onAddNotice({
      title: title.trim(),
      category,
      categoryColor: getCategoryHeaderStyle(category),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      bodyEn: bodyEn.trim(),
      bodyTa: bodyTa.trim() || 'அறிவிப்பு வெளியிடப்பட்டுள்ளது.',
      author: currentUser?.role === 'committee' ? 'RWA Committee' : 'Estate Office',
    });

    setTitle('');
    setBodyEn('');
    setBodyTa('');
    setShowNewNoticeModal(false);
  };

  return (
    <div id="notices-view" className="space-y-4 pb-28 px-5 pt-2">
      {/* Title */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-extrabold text-[#063B45] tracking-tight">Notices</h2>
          <p className="text-sm text-slate-500 font-medium mt-0.5">அறிவிப்புகள்</p>
        </div>

        {currentUser?.role === 'committee' && (
          <button
            id="post-notice-button"
            onClick={() => setShowNewNoticeModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#08424D] hover:bg-[#06333c] text-white rounded-xl text-xs font-bold shadow-sm transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Post Notice</span>
          </button>
        )}
      </div>

      {/* Category Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-1 no-scrollbar">
        {['ALL', 'MAINTENANCE', 'MEETING', 'SECURITY'].map((tab) => (
          <button
            key={tab}
            onClick={() => setSelectedFilter(tab)}
            className={`px-3 py-1 rounded-full text-xs font-bold transition flex-shrink-0 ${
              selectedFilter === tab
                ? 'bg-[#08424D] text-white'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {tab === 'ALL' ? 'All Notices' : tab}
          </button>
        ))}
      </div>

      {/* Notices List Matching Image 1.png */}
      <div className="space-y-4 pt-1">
        {filteredNotices.map((notice) => (
          <div
            key={notice.id}
            id={`notice-card-${notice.id}`}
            className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 hover:shadow-md transition"
          >
            {/* Top row */}
            <div className="flex items-center justify-between">
              <span
                className={`text-xs font-extrabold uppercase tracking-wider ${getCategoryHeaderStyle(
                  notice.category
                )}`}
              >
                {notice.category}
              </span>
              <span className="text-xs font-semibold text-slate-500">{notice.date}</span>
            </div>

            {/* Notice Heading */}
            <h3 className="text-lg font-bold text-slate-900 mt-2 leading-snug">
              {notice.title}
            </h3>

            {/* English Body */}
            <p className="text-sm font-normal text-slate-700 mt-2 leading-relaxed">
              {notice.bodyEn}
            </p>

            {/* Tamil Body */}
            {notice.bodyTa && (
              <p className="text-xs font-medium text-slate-500 mt-3 leading-relaxed border-t border-slate-100 pt-2.5">
                {notice.bodyTa}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Modal to Post Notice */}
      {showNewNoticeModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-[#08424D]" />
                <h3 className="text-base font-bold text-slate-900">Post New Notice</h3>
              </div>
              <button
                onClick={() => setShowNewNoticeModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNotice} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as Notice['category'])}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                >
                  <option value="MAINTENANCE">MAINTENANCE (பராமரிப்பு)</option>
                  <option value="MEETING">MEETING (கூட்டம்)</option>
                  <option value="SECURITY">SECURITY (பாதுகாப்பு)</option>
                  <option value="GENERAL">GENERAL (பொது)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Notice Title (English)
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Lift Servicing Schedule"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Notice Body (English)
                </label>
                <textarea
                  rows={3}
                  value={bodyEn}
                  onChange={(e) => setBodyEn(e.target.value)}
                  placeholder="Enter notice details..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Notice Body (Tamil / தமிழ்)
                </label>
                <textarea
                  rows={2}
                  value={bodyTa}
                  onChange={(e) => setBodyTa(e.target.value)}
                  placeholder="தமிழ் விளக்கம் உள்ளிடவும்..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewNoticeModal(false)}
                  className="flex-1 py-2.5 px-4 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 bg-[#08424D] text-white rounded-xl text-xs font-bold hover:bg-[#06333c] shadow"
                >
                  Broadcast Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
