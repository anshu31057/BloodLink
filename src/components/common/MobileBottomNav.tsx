import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, 
  Radio, 
  MapPin, 
  Users, 
  Droplet,
  MoreHorizontal,
  PlusCircle,
  User,
  BarChart3,
  History,
  QrCode,
  FileCode2,
  X,
  ChevronRight
} from 'lucide-react';
import { useCommandCenter } from '../../context/CommandCenterContext';

export const MobileBottomNav: React.FC = () => {
  const { 
    activePage, 
    setActivePage, 
    requests, 
    donors,
    hospital,
    setIsSyncModalOpen
  } = useCommandCenter();

  const [showCta, setShowCta] = useState(true);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const lastScrollY = useRef(0);

  // Hide CTA while scrolling down, show while scrolling up
  useEffect(() => {
    const handleScroll = () => {
      const mainEl = document.querySelector('main');
      const currentScrollY = mainEl ? mainEl.scrollTop : (window.scrollY || document.documentElement.scrollTop);
      
      if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
        // Scrolling down -> hide CTA
        setShowCta(false);
      } else {
        // Scrolling up -> show CTA
        setShowCta(true);
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    const mainEl = document.querySelector('main');
    if (mainEl) {
      mainEl.addEventListener('scroll', handleScroll, { passive: true });
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (mainEl) mainEl.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const activeSosCount = requests.filter(r => r.status === 'BROADCASTING' || r.status === 'DONORS_DISPATCHED').length;
  const enRouteDonorsCount = donors.filter(d => d.status === 'EN_ROUTE' || d.status === 'RESPONDED').length;

  // Prompt: Mobile Sticky bottom CTA appears ONLY on overview page
  const shouldShowFloatingCTA = activePage === 'dashboard';

  const navItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'live-requests', label: 'SOS', icon: Radio, badge: activeSosCount },
    { id: 'live-map', label: 'Map', icon: MapPin },
    { id: 'donor-center', label: 'Donors', icon: Users, badge: enRouteDonorsCount },
    { id: 'inventory', label: 'Inventory', icon: Droplet },
  ];

  return (
    <>
      {/* MOBILE STICKY BOTTOM CTA (ABOVE NAVIGATION)
          Appears ONLY on overview page.
          Hidden while scrolling down. Returns when scrolling up.
      */}
      {shouldShowFloatingCTA && (
        <div 
          className={`md:hidden fixed bottom-[82px] left-0 right-0 z-40 flex justify-center px-4 pointer-events-none transition-all duration-300 ${
            showCta ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0'
          }`}
        >
          <button
            id="mobile-sticky-broadcast-sos-btn"
            onClick={() => setActivePage('create-sos')}
            className="pointer-events-auto w-[92%] max-w-md h-13 rounded-full bg-[#D92D20] hover:bg-red-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(217,45,32,0.3)] active:scale-[0.98] transition-transform"
            aria-label="Broadcast Emergency SOS"
          >
            <PlusCircle className="w-5 h-5 shrink-0" />
            <span className="tracking-wide">Broadcast Emergency SOS</span>
          </button>
        </div>
      )}

      {/* MORE MENU BOTTOM SHEET FOR MOBILE */}
      {isMoreMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex flex-col justify-end animate-in fade-in duration-200"
          onClick={() => setIsMoreMenuOpen(false)}
        >
          <div 
            className="bg-white rounded-t-3xl border-t border-slate-200 p-5 space-y-4 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] shadow-2xl animate-in slide-in-from-bottom duration-250"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-base text-slate-900">Terminal Options</h3>
                <p className="text-xs text-slate-500">{hospital.name}</p>
              </div>
              <button 
                onClick={() => setIsMoreMenuOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-2 text-xs">
              <button
                onClick={() => {
                  setActivePage('hospital-profile');
                  setIsMoreMenuOpen(false);
                }}
                className="w-full h-13 flex items-center justify-between px-4 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-800 font-bold"
              >
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-blue-600" />
                  <span>Hospital Terminal Profile & License</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => {
                  setActivePage('analytics');
                  setIsMoreMenuOpen(false);
                }}
                className="w-full h-13 flex items-center justify-between px-4 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-800 font-bold"
              >
                <div className="flex items-center gap-3">
                  <BarChart3 className="w-4 h-4 text-emerald-600" />
                  <span>Transfusion & SLA Analytics</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => {
                  setActivePage('donation-history');
                  setIsMoreMenuOpen(false);
                }}
                className="w-full h-13 flex items-center justify-between px-4 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-800 font-bold"
              >
                <div className="flex items-center gap-3">
                  <History className="w-4 h-4 text-purple-600" />
                  <span>Donation Ledgers & Certificates</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => {
                  setIsSyncModalOpen(true);
                  setIsMoreMenuOpen(false);
                }}
                className="w-full h-13 flex items-center justify-between px-4 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-800 font-bold"
              >
                <div className="flex items-center gap-3">
                  <QrCode className="w-4 h-4 text-amber-600" />
                  <span>Cloud Mesh QR Device Sync</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MOBILE BOTTOM NAVIGATION BAR
          Navigation height 72px.
          Icons: Overview, SOS, Map, Donors, Inventory, More.
          Safe area padding support.
      */}
      <nav 
        id="mobile-bottom-nav"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E5E7EB] px-1 sm:px-3 h-[72px] flex items-center justify-around shadow-[0_-4px_20px_rgba(0,0,0,0.06)] pb-[env(safe-area-inset-bottom,0px)]"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id as any)}
              className={`flex-1 flex flex-col items-center justify-center py-1 rounded-2xl transition-all relative ${
                isActive ? 'text-red-600 font-extrabold' : 'text-slate-500 font-semibold hover:text-slate-900'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'scale-110 text-red-600' : 'text-slate-500'}`} />
                {Boolean(item.badge && item.badge > 0) && (
                  <span className="absolute -top-1 -right-2.5 min-w-[16px] h-4 px-1 rounded-full bg-red-600 text-white text-[9px] font-mono font-bold flex items-center justify-center tabular-nums ring-2 ring-white">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1 tracking-tight truncate max-w-[58px]">
                {item.label}
              </span>
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-red-600 mt-0.5" />
              )}
            </button>
          );
        })}

        {/* More Menu Item for Profile, Analytics, History */}
        <button
          onClick={() => setIsMoreMenuOpen(true)}
          className={`flex-1 flex flex-col items-center justify-center py-1 rounded-2xl transition-all ${
            activePage === 'hospital-profile' || activePage === 'analytics' || activePage === 'donation-history'
              ? 'text-red-600 font-extrabold'
              : 'text-slate-500 font-semibold hover:text-slate-900'
          }`}
        >
          <MoreHorizontal className="w-5 h-5" />
          <span className="text-[10px] mt-1 tracking-tight">More</span>
        </button>
      </nav>
    </>
  );
};
