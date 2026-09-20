import React from 'react';
import { 
  Bell, 
  PlusCircle
} from 'lucide-react';
import { useCommandCenter } from '../../context/CommandCenterContext';
import { BloodLinkLogo } from './BloodLinkLogo';

interface HeaderProps {
  onToggleNotificationDrawer: () => void;
  onOpenDocs?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleNotificationDrawer }) => {
  const { 
    setActivePage, 
    activities
  } = useCommandCenter();

  const unreadAlerts = activities.slice(0, 4).length;

  return (
    <header 
      id="command-center-header"
      className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#E5E7EB] transition-all"
    >
      <div className="max-w-[1600px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
        
        {/* 1. Left: Premium BloodLink 8 Logo & Tagline */}
        <div className="flex items-center gap-3 min-w-0">
          <button 
            onClick={() => setActivePage('dashboard')}
            className="flex items-center text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#101828] rounded-xl"
            aria-label="BloodLink 8 Home"
          >
            <BloodLinkLogo size="md" showTagline={true} />
          </button>
        </div>

        {/* 2. Center-Left: Network Status (Verified Emergency Network Node) */}
        <div className="hidden md:flex items-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F8FAFC] border border-[#E5E7EB] text-xs font-semibold text-[#101828]">
            <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" />
            <span>Verified Emergency Network Node</span>
            <span className="text-[#667085] font-normal">• North India Command Node</span>
          </div>
        </div>

        {/* 3. Right: Notification Bell, Profile Avatar, Broadcast SOS Button */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          
          {/* Notification Bell */}
          <button
            id="header-notification-btn"
            onClick={onToggleNotificationDrawer}
            className="relative w-10 h-10 rounded-full bg-white hover:bg-slate-50 border border-[#E5E7EB] text-slate-700 flex items-center justify-center transition-all focus-visible:ring-2 focus-visible:ring-[#101828]"
            aria-label={`Notifications: ${unreadAlerts} unread`}
          >
            <Bell className="w-4 h-4" />
            {unreadAlerts > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#D92D20] text-white text-[10px] font-bold flex items-center justify-center tabular-nums shadow-xs">
                {unreadAlerts}
              </span>
            )}
          </button>

          {/* Profile Avatar */}
          <button
            id="header-profile-btn"
            onClick={() => setActivePage('hospital-profile')}
            className="flex items-center gap-2 h-10 p-1 hover:bg-slate-50 rounded-full transition-all focus-visible:ring-2 focus-visible:ring-[#101828]"
            title="Node Terminal Profile"
            aria-label="Node Director Profile"
          >
            <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center">
              DR
            </div>
            <div className="hidden 2xl:block text-left pr-1.5">
              <div className="text-xs font-bold text-[#101828] leading-tight">Command Director</div>
              <div className="text-[10px] text-[#667085]">Panipat Hub</div>
            </div>
          </button>

          {/* Primary Action Button: Broadcast SOS (Emergency Red) */}
          <button
            id="header-create-sos-btn"
            onClick={() => setActivePage('create-sos')}
            className="flex items-center gap-2 h-11 px-4 sm:px-5 rounded-2xl bg-[#D92D20] hover:bg-red-700 text-white text-xs sm:text-sm font-bold shadow-[0_2px_8px_rgba(217,45,32,0.25)] active:scale-[0.98] transition-all whitespace-nowrap focus-visible:ring-2 focus-visible:ring-[#D92D20]"
            aria-label="Broadcast Emergency SOS"
          >
            <PlusCircle className="w-4 h-4 shrink-0" />
            <span>Broadcast SOS</span>
          </button>

        </div>

      </div>
    </header>
  );
};
