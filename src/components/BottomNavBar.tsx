import React from 'react';
import { ClipboardList, PlusCircle, Megaphone } from 'lucide-react';
import { ActiveTab } from '../types';

interface BottomNavBarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({ activeTab, onSelectTab }) => {
  return (
    <nav
      id="bottom-navigation-bar"
      className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-6 py-2 z-40 shadow-lg"
    >
      <div className="flex items-center justify-around">
        {/* Complaints Tab */}
        <button
          id="nav-tab-complaints"
          onClick={() => onSelectTab('complaints')}
          className={`flex flex-col items-center justify-center py-1 px-3 transition-colors ${
            activeTab === 'complaints' ? 'text-[#0B4D58]' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <ClipboardList className={`w-6 h-6 ${activeTab === 'complaints' ? 'stroke-[2.2]' : 'stroke-[1.75]'}`} />
          <span className={`text-xs font-bold mt-1 ${activeTab === 'complaints' ? 'text-[#0B4D58]' : 'text-slate-600'}`}>
            Complaints
          </span>
          <span className="text-[10px] leading-tight text-slate-500">புகார்கள்</span>
        </button>

        {/* Raise Tab */}
        <button
          id="nav-tab-raise"
          onClick={() => onSelectTab('raise')}
          className={`flex flex-col items-center justify-center py-1 px-3 transition-colors ${
            activeTab === 'raise' ? 'text-[#0B4D58]' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <PlusCircle className={`w-6 h-6 ${activeTab === 'raise' ? 'stroke-[2.2]' : 'stroke-[1.75]'}`} />
          <span className={`text-xs font-bold mt-1 ${activeTab === 'raise' ? 'text-[#0B4D58]' : 'text-slate-600'}`}>
            Raise
          </span>
          <span className="text-[10px] leading-tight text-slate-500">புகார் செய்க</span>
        </button>

        {/* Notices Tab */}
        <button
          id="nav-tab-notices"
          onClick={() => onSelectTab('notices')}
          className={`flex flex-col items-center justify-center py-1 px-3 transition-colors ${
            activeTab === 'notices' ? 'text-[#0B4D58]' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Megaphone className={`w-6 h-6 ${activeTab === 'notices' ? 'stroke-[2.2]' : 'stroke-[1.75]'}`} />
          <span className={`text-xs font-bold mt-1 ${activeTab === 'notices' ? 'text-[#0B4D58]' : 'text-slate-600'}`}>
            Notices
          </span>
          <span className="text-[10px] leading-tight text-slate-500">அறிவிப்புகள்</span>
        </button>
      </div>
    </nav>
  );
};
