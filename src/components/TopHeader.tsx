import React, { useState } from 'react';
import { User, ShieldCheck, UserCheck, LogOut, Building, Check } from 'lucide-react';
import { User as UserType, UserRole } from '../types';

interface TopHeaderProps {
  title: string;
  currentUser: UserType | null;
  onSwitchRole: (role: UserRole) => void;
  onLogout: () => void;
  onUpdateUser: (user: UserType) => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  title,
  currentUser,
  onSwitchRole,
  onLogout,
  onUpdateUser,
}) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [editingFlat, setEditingFlat] = useState(false);
  const [flatInput, setFlatInput] = useState(currentUser?.flatNumber || 'B-402');
  const [blockInput, setBlockInput] = useState(currentUser?.block || 'Block B');

  const handleSaveFlat = () => {
    if (currentUser) {
      onUpdateUser({
        ...currentUser,
        flatNumber: flatInput,
        block: blockInput,
      });
    }
    setEditingFlat(false);
  };

  return (
    <header
      id="app-top-header"
      className="sticky top-0 z-30 bg-[#F4F7F6]/95 backdrop-blur-md px-5 py-4 flex items-center justify-between border-b border-slate-200/50"
    >
      <h1 className="text-2xl font-bold text-[#06424D] tracking-tight">{title}</h1>

      <div className="relative">
        <button
          id="profile-avatar-button"
          onClick={() => setShowProfileMenu(!showProfileMenu)}
          aria-label="User Profile & Settings"
          className="w-10 h-10 rounded-full bg-[#08424D] text-white flex items-center justify-center shadow hover:bg-[#06333c] transition-transform active:scale-95"
        >
          {currentUser?.role === 'committee' ? (
            <ShieldCheck className="w-5 h-5 text-emerald-300" />
          ) : (
            <User className="w-5 h-5" />
          )}
        </button>

        {showProfileMenu && (
          <div
            id="profile-dropdown-popover"
            className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-100 p-4 z-50 animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-11 h-11 rounded-full bg-[#08424D] text-white flex items-center justify-center font-bold text-lg">
                {currentUser?.name.charAt(0) || 'R'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-900 truncate">{currentUser?.name || 'Resident'}</p>
                <p className="text-xs text-slate-500">{currentUser?.phone ? `+91 ${currentUser.phone}` : 'No phone'}</p>
                <p className="text-xs font-semibold text-[#0B4D58]">
                  {currentUser?.flatNumber}, {currentUser?.block}
                </p>
              </div>
            </div>

            {/* Role Switcher */}
            <div className="my-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Active View / Role
              </span>
              <div className="grid grid-cols-2 gap-1.5 mt-1.5 p-1 bg-slate-100 rounded-xl">
                <button
                  id="switch-to-resident-role"
                  onClick={() => {
                    onSwitchRole('resident');
                    setShowProfileMenu(false);
                  }}
                  className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold transition ${
                    currentUser?.role === 'resident'
                      ? 'bg-white text-[#0B4D58] shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  Resident
                </button>
                <button
                  id="switch-to-committee-role"
                  onClick={() => {
                    onSwitchRole('committee');
                    setShowProfileMenu(false);
                  }}
                  className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold transition ${
                    currentUser?.role === 'committee'
                      ? 'bg-white text-[#0B4D58] shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Committee
                </button>
              </div>
            </div>

            {/* Flat Link Info */}
            <div className="my-2 p-2.5 bg-teal-50/70 border border-teal-100 rounded-xl">
              {editingFlat ? (
                <div className="space-y-2">
                  <div className="text-[11px] font-bold text-teal-900">Update Flat & Block</div>
                  <div className="grid grid-cols-2 gap-1.5">
                    <input
                      type="text"
                      value={flatInput}
                      onChange={(e) => setFlatInput(e.target.value)}
                      placeholder="e.g. B-402"
                      className="px-2 py-1 bg-white border border-teal-200 rounded text-xs text-slate-800"
                    />
                    <input
                      type="text"
                      value={blockInput}
                      onChange={(e) => setBlockInput(e.target.value)}
                      placeholder="e.g. Block B"
                      className="px-2 py-1 bg-white border border-teal-200 rounded text-xs text-slate-800"
                    />
                  </div>
                  <button
                    onClick={handleSaveFlat}
                    className="w-full py-1 bg-[#08424D] text-white rounded text-xs font-semibold flex items-center justify-center gap-1"
                  >
                    <Check className="w-3 h-3" /> Save Flat Details
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-teal-900">
                    <Building className="w-4 h-4 text-[#08424D]" />
                    <span>Flat: <strong className="font-semibold">{currentUser?.flatNumber || 'B-402'}</strong></span>
                  </div>
                  <button
                    onClick={() => setEditingFlat(true)}
                    className="text-[11px] font-semibold text-[#0B4D58] underline hover:text-teal-900"
                  >
                    Edit
                  </button>
                </div>
              )}
            </div>

            {/* Logout button */}
            <button
              id="user-logout-button"
              onClick={() => {
                setShowProfileMenu(false);
                onLogout();
              }}
              className="w-full mt-2 flex items-center justify-center gap-2 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              Logout / வெளியேறு
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
