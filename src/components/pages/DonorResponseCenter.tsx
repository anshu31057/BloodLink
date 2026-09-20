import React, { useState } from 'react';
import { 
  Users, 
  PhoneCall, 
  MessageSquare, 
  Navigation, 
  Search, 
  Filter, 
  Clock, 
  MapPin, 
  Car, 
  Bike, 
  Footprints, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  ShieldCheck,
  Building2,
  Sparkles
} from 'lucide-react';
import { useCommandCenter } from '../../context/CommandCenterContext';
import { BloodGroupBadge } from '../common/BloodGroupBadge';
import { StatusBadge } from '../common/StatusBadge';
import { Donor } from '../../types';

type TabFilter = 'ALL' | 'ACCEPTED' | 'EN_ROUTE' | 'ARRIVED' | 'COMPLETED';

export const DonorResponseCenter: React.FC = () => {
  const { 
    donors, 
    confirmDonorArrival, 
    setActivePage, 
    setSelectedRequestId 
  } = useCommandCenter();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<TabFilter>('ALL');
  const [expandedDonorId, setExpandedDonorId] = useState<string | null>(null);

  // Quick Action Modals
  const [activeCallDonor, setActiveCallDonor] = useState<Donor | null>(null);
  const [activeMessageDonor, setActiveMessageDonor] = useState<Donor | null>(null);
  const [messageText, setMessageText] = useState('Emergency BloodLink HQ: Please proceed directly to Trauma OT-2 Reception. Dr. Sharma is waiting.');
  const [messageSent, setMessageSent] = useState(false);

  const toggleExpand = (id: string) => {
    setExpandedDonorId(prev => prev === id ? null : id);
  };

  const filteredDonors = donors.filter((d) => {
    if (activeTab === 'ACCEPTED' && d.status !== 'RESPONDED') return false;
    if (activeTab === 'EN_ROUTE' && d.status !== 'EN_ROUTE') return false;
    if (activeTab === 'ARRIVED' && d.status !== 'ARRIVED_TRIAGE') return false;
    if (activeTab === 'COMPLETED' && d.status !== 'COMPLETED') return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        d.name.toLowerCase().includes(q) ||
        d.bloodGroup.toLowerCase().includes(q) ||
        d.phone.includes(q) ||
        d.requestId.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getVehicleIcon = (type: Donor['vehicleType']) => {
    switch (type) {
      case 'Car': return <Car className="w-3.5 h-3.5 text-blue-600 shrink-0" />;
      case 'Bike': return <Bike className="w-3.5 h-3.5 text-amber-600 shrink-0" />;
      default: return <Footprints className="w-3.5 h-3.5 text-emerald-600 shrink-0" />;
    }
  };

  const tabs: { id: TabFilter; label: string; count?: number }[] = [
    { id: 'ALL', label: 'All Donors', count: donors.length },
    { id: 'ACCEPTED', label: 'Accepted', count: donors.filter(d => d.status === 'RESPONDED').length },
    { id: 'EN_ROUTE', label: 'En Route', count: donors.filter(d => d.status === 'EN_ROUTE').length },
    { id: 'ARRIVED', label: 'Arrived', count: donors.filter(d => d.status === 'ARRIVED_TRIAGE').length },
    { id: 'COMPLETED', label: 'Completed', count: donors.filter(d => d.status === 'COMPLETED').length }
  ];

  return (
    <div id="donor-response-page" className="space-y-6 lg:space-y-8 animate-in fade-in duration-200">
      
      {/* Top Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 lg:p-6 rounded-[28px] border border-[#E5E7EB] shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-[#101828] tracking-tight">
              Donor Response Center
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-200 font-mono tabular-nums">
              {donors.filter(d => d.status === 'EN_ROUTE' || d.status === 'RESPONDED').length} Active
            </span>
          </div>
          <p className="text-xs text-[#667085] mt-0.5">
            Real-time tracking of volunteer donors responding to emergency alerts.
          </p>
        </div>

        {/* Search Input on Top */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search donor name, group..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 pl-10 pr-4 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB] text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#101828] shadow-2xs"
          />
        </div>
      </div>

      {/* Tabs: Available, Accepted, En Route, Arrived, Completed (Scrollable pills on mobile) */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`h-10 px-4 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-slate-900 ${
                isActive 
                  ? 'bg-[#101828] text-white shadow-xs' 
                  : 'bg-white hover:bg-slate-50 text-slate-600 border border-[#E5E7EB]'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono tabular-nums ${
                  isActive ? 'bg-slate-700 text-slate-100' : 'bg-slate-100 text-slate-600'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* List of Donor Cards */}
      <div className="space-y-3">
        {filteredDonors.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-[28px] border border-[#E5E7EB] text-slate-500 text-xs">
            No donors found matching the current tab or search criteria.
          </div>
        ) : (
          filteredDonors.map((donor) => {
            const isExpanded = expandedDonorId === donor.id;

            return (
              <div 
                key={donor.id}
                className="bg-white rounded-[28px] border border-[#E5E7EB] shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:border-slate-300 transition-all overflow-hidden"
              >
                {/* =========================================================
                    MOBILE DONOR CARD (md:hidden) — STRICT V5 SPECIFICATION:
                    Reduce height.
                    Avatar. Name. Blood Group. ETA. Status.
                    Single CTA row. Expand arrow. Accordion opens details.
                    ========================================================= */}
                <div className="md:hidden p-4 space-y-3">
                  {/* Top Row: Avatar, Name, Blood Group, ETA, Status, Expand Arrow */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="relative shrink-0">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-300 flex items-center justify-center font-bold text-xs text-slate-700">
                          {donor.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        {donor.verifiedDonor && (
                          <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-600 text-white flex items-center justify-center ring-1 ring-white text-[8px]">
                            ✓
                          </div>
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-extrabold text-xs sm:text-sm text-[#111827] truncate">{donor.name}</h3>
                          <BloodGroupBadge group={donor.bloodGroup} size="sm" />
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                          <span className="flex items-center gap-1 font-bold text-emerald-600">
                            <Clock className="w-3 h-3" />
                            <span className="font-mono tabular-nums">{donor.etaMinutes}m ETA</span>
                          </span>
                          <span>•</span>
                          <span className="font-mono tabular-nums">{donor.distanceKm} km</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <StatusBadge type="donor-status" value={donor.status} />
                      <button
                        onClick={() => toggleExpand(donor.id)}
                        className="w-8 h-8 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-500 flex items-center justify-center"
                        aria-label="Toggle Details"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Single CTA Row (Equal flex buttons) */}
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => setActiveCallDonor(donor)}
                      className="flex-1 h-10 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center gap-1.5 border border-emerald-200 active:scale-98"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      <span>Call</span>
                    </button>

                    <button
                      onClick={() => setActiveMessageDonor(donor)}
                      className="flex-1 h-10 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center gap-1.5 border border-blue-200 active:scale-98"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>SMS</span>
                    </button>

                    <button
                      onClick={() => {
                        setSelectedRequestId(donor.requestId);
                        setActivePage('live-map');
                      }}
                      className="flex-1 h-10 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs flex items-center justify-center gap-1.5 border border-purple-200 active:scale-98"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>Radar</span>
                    </button>

                    {donor.status === 'EN_ROUTE' && (
                      <button
                        onClick={() => confirmDonorArrival(donor.id)}
                        className="h-10 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shrink-0 shadow-xs active:scale-98"
                      >
                        Arrived
                      </button>
                    )}
                  </div>
                </div>

                {/* =========================================================
                    DESKTOP DONOR CARD (hidden md:flex) — APPROVED & UNTOUCHED
                    ========================================================= */}
                <div className="hidden md:flex p-4 sm:p-5 flex-row items-center justify-between gap-4">
                  
                  {/* Left: Avatar, Name, Blood Group */}
                  <div className="flex items-center gap-3.5">
                    <div className="relative shrink-0">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-300 flex items-center justify-center font-bold text-xs text-slate-700 shadow-2xs">
                        {donor.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      {donor.verifiedDonor && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center ring-2 ring-white text-[9px]">
                          ✓
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-extrabold text-sm text-[#111827]">{donor.name}</h3>
                        <BloodGroupBadge group={donor.bloodGroup} size="sm" />
                      </div>

                      {/* Distance & ETA chips */}
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                        <span className="flex items-center gap-1 font-semibold text-slate-700">
                          {getVehicleIcon(donor.vehicleType)}
                          <span className="font-mono tabular-nums">{donor.distanceKm} km away</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 font-bold text-emerald-600">
                          <Clock className="w-3 h-3" />
                          <span className="font-mono tabular-nums">ETA: {donor.etaMinutes} mins</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Center/Right: Status Badge & 40px Icon Buttons */}
                  <div className="flex items-center justify-end gap-3 shrink-0 flex-wrap">
                    <StatusBadge type="donor-status" value={donor.status} />

                    <div className="flex items-center gap-1.5">
                      {/* Call Button (40px) */}
                      <button
                        onClick={() => setActiveCallDonor(donor)}
                        className="w-10 h-10 rounded-2xl bg-[#F8FAFC] hover:bg-emerald-50 border border-[#E5E7EB] text-slate-700 hover:text-emerald-700 transition-all flex items-center justify-center focus-visible:ring-2 focus-visible:ring-emerald-500"
                        title={`Call ${donor.name}`}
                        aria-label={`Call ${donor.name}`}
                      >
                        <PhoneCall className="w-4 h-4" />
                      </button>

                      {/* Message Button (40px) */}
                      <button
                        onClick={() => setActiveMessageDonor(donor)}
                        className="w-10 h-10 rounded-2xl bg-[#F8FAFC] hover:bg-blue-50 border border-[#E5E7EB] text-slate-700 hover:text-blue-700 transition-all flex items-center justify-center focus-visible:ring-2 focus-visible:ring-blue-500"
                        title={`Send SMS to ${donor.name}`}
                        aria-label={`Send SMS to ${donor.name}`}
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>

                      {/* Route / Live Map Button (40px) */}
                      <button
                        onClick={() => {
                          setSelectedRequestId(donor.requestId);
                          setActivePage('live-map');
                        }}
                        className="w-10 h-10 rounded-2xl bg-[#F8FAFC] hover:bg-purple-50 border border-[#E5E7EB] text-slate-700 hover:text-purple-700 transition-all flex items-center justify-center focus-visible:ring-2 focus-visible:ring-purple-500"
                        title="View Live Map Route"
                        aria-label="View Live Map Route"
                      >
                        <Navigation className="w-4 h-4" />
                      </button>

                      {/* Confirm Arrival (44px) */}
                      {donor.status === 'EN_ROUTE' && (
                        <button
                          onClick={() => confirmDonorArrival(donor.id)}
                          className="h-10 px-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all focus-visible:ring-2 focus-visible:ring-emerald-500"
                        >
                          Confirm Arrival
                        </button>
                      )}

                      {/* Expand / Collapse Details Toggle (40px) */}
                      <button
                        onClick={() => toggleExpand(donor.id)}
                        className="w-10 h-10 rounded-2xl hover:bg-slate-100 text-slate-400 hover:text-slate-900 transition-all flex items-center justify-center focus-visible:ring-2 focus-visible:ring-slate-900"
                        title="Toggle Medical Details"
                        aria-label="Toggle Medical Details"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>

                  </div>

                </div>

                {/* Expand Shows Medical Info & Verification Ledger */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-2 border-t border-slate-100 bg-[#F8FAFC]/70 text-xs animate-in fade-in duration-100">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                      <div className="p-3 rounded-2xl bg-white border border-[#E5E7EB]">
                        <div className="text-[10px] uppercase font-bold text-slate-400">Hemoglobin Level</div>
                        <div className="font-mono font-bold text-slate-900 mt-0.5 tabular-nums">14.2 g/dL</div>
                      </div>

                      <div className="p-3 rounded-2xl bg-white border border-[#E5E7EB]">
                        <div className="text-[10px] uppercase font-bold text-slate-400">Last Donation</div>
                        <div className="font-semibold text-slate-900 mt-0.5">94 days ago</div>
                      </div>

                      <div className="p-3 rounded-2xl bg-white border border-[#E5E7EB]">
                        <div className="text-[10px] uppercase font-bold text-slate-400">Total Donations</div>
                        <div className="font-mono font-bold text-slate-900 mt-0.5 tabular-nums">{donor.totalDonations || 6} times</div>
                      </div>

                      <div className="p-3 rounded-2xl bg-white border border-[#E5E7EB]">
                        <div className="text-[10px] uppercase font-bold text-slate-400">Allergies / Flags</div>
                        <div className="font-semibold text-emerald-700 mt-0.5">None • Cleared for OT</div>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            );
          })
        )}
      </div>

      {/* Call Dialog Modal */}
      {activeCallDonor && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[28px] p-6 max-w-sm w-full border border-[#E5E7EB] shadow-2xl text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto text-xl">
              <PhoneCall className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#101828]">{activeCallDonor.name}</h3>
              <p className="text-xs text-[#667085] font-mono mt-0.5 tabular-nums">{activeCallDonor.phone}</p>
            </div>
            <p className="text-xs text-[#667085]">
              Connecting hospital direct hotline to volunteer donor mobile device.
            </p>
            <div className="flex gap-2">
              <a 
                href={`tel:${activeCallDonor.phone}`}
                className="flex-1 h-11 flex items-center justify-center rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs"
              >
                Dial Now
              </a>
              <button
                onClick={() => setActiveCallDonor(null)}
                className="h-11 px-4 rounded-xl bg-[#F8FAFC] hover:bg-slate-100 text-slate-700 font-bold text-xs border border-[#E5E7EB]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Message Dialog Modal */}
      {activeMessageDonor && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[28px] p-6 max-w-md w-full border border-[#E5E7EB] shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-[#101828]">SMS to {activeMessageDonor.name}</h3>
              </div>
              <button 
                onClick={() => setActiveMessageDonor(null)}
                className="text-slate-400 hover:text-slate-900 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <textarea
              rows={3}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              className="w-full p-3 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB] text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#101828]"
            />

            {messageSent && (
              <div className="text-xs font-bold text-emerald-700 bg-emerald-50 p-2 rounded-xl border border-emerald-200">
                ✓ SMS successfully sent to {activeMessageDonor.phone}
              </div>
            )}

            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setMessageSent(true);
                  setTimeout(() => {
                    setMessageSent(false);
                    setActiveMessageDonor(null);
                  }, 1200);
                }}
                className="h-11 px-5 rounded-xl bg-[#101828] hover:bg-slate-800 text-white font-bold text-xs shadow-xs"
              >
                Send SMS
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
