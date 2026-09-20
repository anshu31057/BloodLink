import React from 'react';
import { 
  LayoutDashboard, 
  PlusCircle, 
  Radio, 
  Users, 
  MapPin, 
  Droplet, 
  History, 
  BarChart3, 
  Building2, 
  Code2, 
  Smartphone,
  PhoneCall
} from 'lucide-react';
import { useCommandCenter } from '../../context/CommandCenterContext';

interface SidebarProps {
  onOpenDocs?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onOpenDocs }) => {
  const { 
    activePage, 
    setActivePage, 
    requests, 
    donors, 
    inventory,
    setIsCompanionModalOpen,
    hospital
  } = useCommandCenter();

  const activeSosCount = requests.filter(r => r.status === 'BROADCASTING' || r.status === 'DONORS_DISPATCHED').length;
  const enRouteDonorsCount = donors.filter(d => d.status === 'EN_ROUTE' || d.status === 'RESPONDED').length;
  const lowInventoryCount = inventory.filter(i => i.lowStockAlert).length;

  const navItems = [
    {
      id: 'dashboard',
      label: 'Command Center',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'create-sos',
      label: 'Create Emergency SOS',
      icon: PlusCircle,
      badge: 'SOS',
      badgeColor: 'bg-red-600 text-white'
    },
    {
      id: 'live-requests',
      label: 'Live Emergency SOS',
      icon: Radio,
      badge: activeSosCount > 0 ? activeSosCount : null,
      badgeColor: 'bg-red-100 text-red-700'
    },
    {
      id: 'donor-center',
      label: 'Donor Response',
      icon: Users,
      badge: enRouteDonorsCount > 0 ? enRouteDonorsCount : null,
      badgeColor: 'bg-amber-100 text-amber-800'
    },
    {
      id: 'live-map',
      label: 'Live Map Radar',
      icon: MapPin,
      badge: 'LIVE',
      badgeColor: 'bg-emerald-100 text-emerald-800'
    },
    {
      id: 'inventory',
      label: 'Blood Bank Inventory',
      icon: Droplet,
      badge: lowInventoryCount > 0 ? `${lowInventoryCount} Low` : null,
      badgeColor: 'bg-rose-100 text-rose-700'
    },
    {
      id: 'donation-history',
      label: 'Donation History',
      icon: History,
      badge: null
    },
    {
      id: 'analytics',
      label: 'Analytics & Trends',
      icon: BarChart3,
      badge: null
    },
    {
      id: 'hospital-profile',
      label: 'Network Node Terminal',
      icon: Building2,
      badge: null
    },
  ] as const;

  return (
    <aside 
      id="command-center-sidebar"
      className="hidden md:flex flex-col justify-between shrink-0 border-r border-[#E5E7EB] bg-white transition-all duration-200 md:w-[88px] lg:w-[260px] py-4 px-3"
      aria-label="Sidebar Navigation"
    >
      {/* Top Nav Items */}
      <div className="space-y-1">
        <div className="px-3 pb-2 hidden lg:block text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Emergency Grid
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;

          return (
            <div key={item.id} className="relative group">
              <button
                id={`nav-${item.id}`}
                onClick={() => setActivePage(item.id as any)}
                aria-label={item.label}
                className={`w-full h-11 flex items-center justify-between px-3 rounded-2xl text-xs font-semibold transition-all focus-visible:ring-2 focus-visible:ring-slate-900 ${
                  isActive 
                    ? 'bg-slate-900 text-white shadow-xs' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <div className="flex items-center gap-3 mx-auto lg:mx-0">
                  <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-900'}`} />
                  <span className="hidden lg:inline font-semibold truncate">{item.label}</span>
                </div>

                {item.badge && (
                  <span className={`hidden lg:inline-block text-[10px] font-bold px-2 py-0.5 rounded-full tabular-nums shrink-0 ${item.badgeColor || 'bg-slate-200 text-slate-800'}`}>
                    {item.badge}
                  </span>
                )}
              </button>

              {/* Tablet Tooltip on hover (md:max-lg) */}
              <div className="hidden md:block lg:hidden absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2.5 py-1 bg-slate-900 text-white text-xs font-semibold rounded-xl shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                {item.label}
                {item.badge && (
                  <span className="ml-1.5 px-1.5 py-0.5 text-[9px] bg-slate-700 rounded-full font-bold">
                    {item.badge}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Emergency Hotline & Quick Actions */}
      <div className="pt-4 border-t border-slate-200 space-y-2">
        
        {/* Quick Hotline Pill (44px height) */}
        <a 
          href={`tel:${hospital.emergencyHotline}`}
          className="flex items-center justify-center lg:justify-between h-11 px-3 rounded-2xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 transition-all text-xs font-semibold focus-visible:ring-2 focus-visible:ring-red-500"
          title={`Call Emergency Hotline: ${hospital.emergencyHotline}`}
          aria-label={`Call Emergency Hotline: ${hospital.emergencyHotline}`}
        >
          <div className="flex items-center gap-2">
            <PhoneCall className="w-4 h-4 text-red-600 shrink-0" />
            <span className="hidden lg:inline font-bold">24/7 Red Line</span>
          </div>
          <span className="hidden lg:inline text-[11px] font-mono font-bold tabular-nums">8888</span>
        </a>

        {/* Multi-Device Hub & Simulator */}
        <button
          onClick={() => setIsCompanionModalOpen(true)}
          className="w-full h-10 flex items-center justify-center lg:justify-between px-3 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all text-xs font-semibold focus-visible:ring-2 focus-visible:ring-slate-900"
          title="Simulate Donor Mobile Phone Companion"
          aria-label="Open Donor Companion Simulator"
        >
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-slate-500 shrink-0" />
            <span className="hidden lg:inline truncate">Donor Companion</span>
          </div>
          <span className="hidden lg:inline text-[10px] bg-slate-100 px-1.5 py-0.5 rounded font-bold text-slate-700">Sim</span>
        </button>

        {onOpenDocs && (
          <button
            onClick={onOpenDocs}
            className="w-full h-10 flex items-center justify-center lg:justify-between px-3 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all text-xs font-semibold focus-visible:ring-2 focus-visible:ring-slate-900"
            title="System Specifications & Supabase Schema"
            aria-label="Open System Specifications"
          >
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-slate-500 shrink-0" />
              <span className="hidden lg:inline truncate">System Specs</span>
            </div>
            <span className="hidden lg:inline text-[10px] bg-slate-100 px-1.5 py-0.5 rounded font-mono text-slate-700">SQL</span>
          </button>
        )}

        <div className="text-[10px] text-slate-400 text-center font-medium hidden lg:block pt-1">
          BloodLink 8 • 8 Blood Groups
        </div>
      </div>
    </aside>
  );
};
