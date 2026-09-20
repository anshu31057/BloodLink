import React from 'react';
import { 
  PlusCircle, 
  MapPin, 
  ChevronRight, 
  Droplet, 
  Radio,
  Users,
  ShieldCheck,
  ArrowUpRight
} from 'lucide-react';
import { useCommandCenter } from '../../context/CommandCenterContext';
import { BloodGroupBadge } from '../common/BloodGroupBadge';

export const DashboardHome: React.FC = () => {
  const { 
    hospital, 
    requests, 
    donors, 
    inventory, 
    activities, 
    setActivePage, 
    setSelectedRequestId 
  } = useCommandCenter();

  const activeRequests = requests.filter(r => r.status === 'BROADCASTING' || r.status === 'DONORS_DISPATCHED');
  const enRouteDonors = donors.filter(d => d.status === 'EN_ROUTE' || d.status === 'RESPONDED');
  const oNegativeItem = inventory.find(i => i.bloodGroup === 'O-') || { availableUnits: 4 };
  const totalUnits = inventory.reduce((acc, curr) => acc + curr.availableUnits, 0);
  const codeRedCount = activeRequests.filter(r => r.priority === 'CODE_RED').length;

  return (
    <div id="dashboard-home-container" className="space-y-8 lg:space-y-10 animate-in fade-in duration-200">
      
      {/* 1. COMMAND NODE HERO SECTION: Generous Whitespace, Apple Health Hierarchy */}
      <section 
        id="hero-banner-section" 
        className="bg-white border border-[#E5E7EB] rounded-[28px] p-8 sm:p-10 shadow-[0_4px_20px_rgba(0,0,0,0.03)]"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          
          <div className="space-y-4 max-w-3xl">
            {/* Status indicators */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-[#16A34A] text-xs font-semibold border border-emerald-200/80">
                <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" />
                <span>Verified Emergency Network Node</span>
              </span>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F8FAFC] text-[#667085] text-xs font-medium border border-[#E5E7EB]">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
                <span>North India Command Node / Panipat Regional Network</span>
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#101828] tracking-tight">
              BloodLink 8
            </h1>

            <p className="text-base sm:text-lg text-[#667085] font-medium tracking-tight">
              8 Blood Groups. One Lifeline. Autonomous emergency donor triage & high-priority dispatch.
            </p>
          </div>

          {/* Action Triggers: Maximum one primary urgent CTA + one secondary map CTA */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-4 shrink-0">
            <button
              id="hero-btn-broadcast-sos"
              onClick={() => setActivePage('create-sos')}
              className="h-13 flex items-center justify-center gap-2.5 px-7 rounded-2xl bg-[#D92D20] hover:bg-red-700 text-white text-sm font-bold shadow-[0_2px_8px_rgba(217,45,32,0.25)] active:scale-[0.98] transition-all whitespace-nowrap"
            >
              <PlusCircle className="w-5 h-5 shrink-0" />
              <span>Broadcast SOS</span>
            </button>

            <button
              id="hero-btn-open-live-map"
              onClick={() => setActivePage('live-map')}
              className="h-13 flex items-center justify-center gap-2.5 px-6 rounded-2xl bg-[#F8FAFC] hover:bg-slate-100 border border-[#E5E7EB] text-[#101828] text-sm font-semibold transition-all whitespace-nowrap"
            >
              <MapPin className="w-4 h-4 text-slate-700 shrink-0" />
              <span>Open Radar Map</span>
            </button>
          </div>

        </div>
      </section>

      {/* 2. KPI METRICS: Maximum 1 Title, 2 Values, 1 CTA per Card */}
      <section id="kpi-metrics-section" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* KPI 1: Active Emergency SOS */}
        <div 
          className="bg-white border border-[#E5E7EB] rounded-[28px] p-7 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between space-y-6"
        >
          <div className="space-y-3">
            <span className="text-xs font-semibold text-[#667085] uppercase tracking-wider">
              Active Emergency SOS
            </span>
            <div className="space-y-1">
              <div className="text-4xl font-bold text-[#101828] tabular-nums tracking-tight">
                {activeRequests.length} Active
              </div>
              <div className="text-xs font-semibold text-[#D92D20] flex items-center gap-1">
                <span>{codeRedCount} Code Red Priority</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setActivePage('live-requests')}
            className="w-full pt-3 border-t border-[#F2F4F7] flex items-center justify-between text-xs font-bold text-[#101828] hover:text-[#D92D20] transition-colors"
          >
            <span>Review Active Alerts</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* KPI 2: Donors En Route */}
        <div 
          className="bg-white border border-[#E5E7EB] rounded-[28px] p-7 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between space-y-6"
        >
          <div className="space-y-3">
            <span className="text-xs font-semibold text-[#667085] uppercase tracking-wider">
              Donors En Route
            </span>
            <div className="space-y-1">
              <div className="text-4xl font-bold text-[#101828] tabular-nums tracking-tight">
                {enRouteDonors.length} Dispatched
              </div>
              <div className="text-xs font-semibold text-slate-600">
                12m Average ETA Corridor
              </div>
            </div>
          </div>

          <button
            onClick={() => setActivePage('donor-center')}
            className="w-full pt-3 border-t border-[#F2F4F7] flex items-center justify-between text-xs font-bold text-[#101828] hover:text-slate-700 transition-colors"
          >
            <span>Track Live Radar</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* KPI 3: Units in Vault */}
        <div 
          className="bg-white border border-[#E5E7EB] rounded-[28px] p-7 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between space-y-6"
        >
          <div className="space-y-3">
            <span className="text-xs font-semibold text-[#667085] uppercase tracking-wider">
              Units in Vault
            </span>
            <div className="space-y-1">
              <div className="text-4xl font-bold text-[#101828] tabular-nums tracking-tight">
                {totalUnits} Units
              </div>
              <div className="text-xs font-semibold text-[#D92D20]">
                O- Critical: {oNegativeItem.availableUnits} left
              </div>
            </div>
          </div>

          <button
            onClick={() => setActivePage('inventory')}
            className="w-full pt-3 border-t border-[#F2F4F7] flex items-center justify-between text-xs font-bold text-[#101828] hover:text-slate-700 transition-colors"
          >
            <span>Check Reserves</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* KPI 4: Transfusions Today */}
        <div 
          className="bg-white border border-[#E5E7EB] rounded-[28px] p-7 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between space-y-6"
        >
          <div className="space-y-3">
            <span className="text-xs font-semibold text-[#667085] uppercase tracking-wider">
              Transfusions Today
            </span>
            <div className="space-y-1">
              <div className="text-4xl font-bold text-[#101828] tabular-nums tracking-tight">
                28 Transfusions
              </div>
              <div className="text-xs font-semibold text-[#16A34A]">
                100% SLA Fulfilled
              </div>
            </div>
          </div>

          <button
            onClick={() => setActivePage('donation-history')}
            className="w-full pt-3 border-t border-[#F2F4F7] flex items-center justify-between text-xs font-bold text-[#101828] hover:text-slate-700 transition-colors"
          >
            <span>View Ledger</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </section>

      {/* 3. MAIN SECTION: ACTIVE EMERGENCY GRID + TELEMETRY STREAM */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* 8 Columns: Active Emergency Broadcast Cards */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between px-1">
            <div>
              <h2 className="text-xl font-bold text-[#101828] tracking-tight">
                Active Emergency Broadcasts
              </h2>
              <p className="text-xs text-[#667085] mt-0.5">
                Targeted alerts active within 20km regional mesh
              </p>
            </div>

            <button
              onClick={() => setActivePage('live-requests')}
              className="text-xs font-bold text-[#101828] hover:text-[#D92D20] flex items-center gap-1 transition-colors"
            >
              <span>View All ({requests.length})</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-4">
            {activeRequests
  .filter((req) => req.id)
  .map((req) => {
              const pending = Math.max(0, req.unitsRequired - req.unitsFulfilled);

              return (
                /* Card: 1 Title, 2 Values, 1 CTA */
                <div 
                  key={req.id}
                  className={`bg-white border rounded-[28px] p-7 shadow-[0_2px_12px_rgba(0,0,0,0.02)] transition-all ${
                    req.priority === 'CODE_RED' ? 'border-red-200' : 'border-[#E5E7EB]'
                  } space-y-5`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    
                    {/* Title */}
                    <div className="flex items-center gap-4">
                      <BloodGroupBadge group={req.bloodGroup} size="lg" />
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-base text-[#101828] tracking-tight">
                            {req.department}
                          </h3>
                          {req.priority === 'CODE_RED' && (
                            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-red-100 text-[#D92D20]">
                              CODE RED
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#667085] mt-0.5">
                          {req.locationWard} • Emergency Request #{req.id?.slice(-4) ?? "----"}
                        </p>
                      </div>
                    </div>

                    {/* Value 1 & Value 2 */}
                    <div className="flex items-center gap-6 text-left sm:text-right">
                      <div>
                        <div className="text-xs text-[#667085] font-medium">Units Required</div>
                        <div className="text-sm font-bold text-[#101828] tabular-nums">
                          {req.unitsFulfilled}/{req.unitsRequired} Units ({pending} needed)
                        </div>
                      </div>

                      <div>
                        <div className="text-xs text-[#667085] font-medium">Corridor SLA</div>
                        <div className="text-sm font-bold text-[#101828] tabular-nums">
                          {req.expectedResponseMinutes}m ETA ({req.broadcastRadiusKm}km)
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* 1 CTA */}
                  <div className="pt-4 border-t border-[#F2F4F7] flex items-center justify-between">
                    <div className="text-xs text-[#667085] flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-slate-500" />
                      <span>{req.acceptedDonorsCount} verified donors responding via FCM</span>
                    </div>

                    <button
                      onClick={() => {
                        if (req.id) {
  setSelectedRequestId(req.id);
}
                        setActivePage('live-requests');
                      }}
                      className="h-10 flex items-center gap-1.5 px-4 rounded-xl bg-[#101828] hover:bg-slate-800 text-white font-semibold text-xs transition-all shadow-xs"
                    >
                      <span>Dispatch Donors</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        </div>

        {/* 4 Columns: Live Telemetry Stream Card (1 Title, 2 Values, 1 CTA) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="px-1">
            <h2 className="text-xl font-bold text-[#101828] tracking-tight">
              Network Telemetry
            </h2>
            <p className="text-xs text-[#667085] mt-0.5">
              Live donor dispatch and response signals
            </p>
          </div>

          <div className="bg-white border border-[#E5E7EB] rounded-[28px] p-7 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-6">
            
            {/* Top 2 summary values */}
            <div className="grid grid-cols-2 gap-4 pb-5 border-b border-[#F2F4F7]">
              <div>
                <div className="text-xs text-[#667085]">Network Events</div>
                <div className="text-2xl font-bold text-[#101828] tabular-nums mt-0.5">
                  {activities.length} Today
                </div>
              </div>
              <div>
                <div className="text-xs text-[#667085]">FCM Push Mesh</div>
                <div className="text-2xl font-bold text-[#16A34A] tabular-nums mt-0.5">
                  100% Live
                </div>
              </div>
            </div>

            {/* Event list */}
            <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
              {activities.slice(0, 6).map((event) => (
                <div key={event.id} className="flex items-start gap-3 py-1">
                  <div className="w-7 h-7 rounded-lg bg-[#F8FAFC] border border-[#E5E7EB] flex items-center justify-center shrink-0 mt-0.5 text-xs">
                    {event.type === 'SOS_CREATED' ? '🩸' : event.type === 'DONOR_ACCEPTED' ? '👤' : '⚡'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-1">
                      <p className="text-xs font-bold text-[#101828] truncate">
                        {event.title}
                      </p>
                      <span className="text-[10px] text-[#667085] font-mono shrink-0">
                        {event.timestamp}
                      </span>
                    </div>
                    <p className="text-xs text-[#667085] line-clamp-1 mt-0.5">
                      {event.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* 1 CTA */}
            <button
              onClick={() => setActivePage('donor-center')}
              className="w-full pt-4 border-t border-[#F2F4F7] flex items-center justify-between text-xs font-bold text-[#101828] hover:text-slate-700 transition-colors"
            >
              <span>Open Donor Center</span>
              <ChevronRight className="w-4 h-4" />
            </button>

          </div>
        </div>

      </div>

    </div>
  );
};
