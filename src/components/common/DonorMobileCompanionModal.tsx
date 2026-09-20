import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Clock, 
  Navigation, 
  ShieldCheck, 
  CheckCircle2, 
  Bell, 
  Radio
} from 'lucide-react';
import { useCommandCenter } from '../../context/CommandCenterContext';
import { BloodGroupBadge } from './BloodGroupBadge';

export const DonorMobileCompanionModal: React.FC = () => {
  const { 
    isCompanionModalOpen, 
    setIsCompanionModalOpen, 
    requests, 
    updateDonorStatus, 
    confirmDonorArrival,
    donors
  } = useCommandCenter();

  // Find latest active request
  const latestRequest = requests.find(r => r.status === 'BROADCASTING' || r.status === 'DONORS_DISPATCHED') || requests[0];
  
  // Track mobile donor state
  const [mobileState, setMobileState] = useState<'IDLE' | 'NOTIFICATION_RECEIVED' | 'ACCEPTED_EN_ROUTE' | 'ARRIVED'>('NOTIFICATION_RECEIVED');
  const [donorEta, setDonorEta] = useState<number>(12);
  const [myDonorId] = useState<string>('DNR-MOBILE-TEST');

  if (!isCompanionModalOpen) return null;

  const handleAcceptRequest = () => {
    setMobileState('ACCEPTED_EN_ROUTE');
    // If a request exists, update context
    const reqId = latestRequest?.id || 'REQ-2026-0891';
    // Check if donor exists
    const existing = donors.find(d => d.id === myDonorId);
    if (existing) {
      updateDonorStatus(myDonorId, 'EN_ROUTE', donorEta);
    }
  };

  const handleArrivalConfirmed = () => {
    setMobileState('ARRIVED');
    confirmDonorArrival('DNR-8823'); // or mock
  };

  const handleReset = () => {
    setMobileState('NOTIFICATION_RECEIVED');
    setDonorEta(12);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        id="donor-mobile-simulator"
        className="w-full max-w-sm bg-black rounded-[44px] p-3 shadow-2xl ring-1 ring-slate-700 relative flex flex-col items-center"
      >
        {/* Dynamic Island / Notch */}
        <div className="w-28 h-5 bg-black rounded-full absolute top-5 z-20 flex items-center justify-between px-3">
          <div className="w-2 h-2 rounded-full bg-slate-900 border border-slate-700" />
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 animate-pulse" />
        </div>

        {/* Close Modal Button */}
        <button
          onClick={() => setIsCompanionModalOpen(false)}
          className="absolute -top-3 -right-3 z-30 p-2 rounded-full bg-white text-slate-800 hover:bg-slate-100 shadow-lg border border-slate-200 transition-all"
          title="Close Mobile Simulator"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Mobile Phone Screen Canvas */}
        <div className="w-full bg-[#F8FAFC] rounded-[36px] overflow-hidden flex flex-col h-[650px] border border-slate-200 relative select-none">
          
          {/* Mobile Status Bar */}
          <div className="pt-3 pb-1 px-6 flex items-center justify-between text-[11px] font-bold text-slate-900 bg-white">
            <span>09:41</span>
            <div className="flex items-center gap-1.5 text-slate-700 text-[10px]">
              <span>5G</span>
              <span className="font-mono">100%</span>
            </div>
          </div>

          {/* App Bar */}
          <div className="px-4 py-3 bg-white border-b border-[#E5E7EB] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-[#D92D20] text-white flex items-center justify-center font-black text-xs">
                BL8
              </div>
              <div>
                <div className="text-xs font-bold text-[#101828]">BloodLink 8</div>
                <div className="text-[9px] text-[#667085]">Donor Mobile Client</div>
              </div>
            </div>
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold">
              <Radio className="w-2.5 h-2.5 animate-pulse text-emerald-500" />
              <span>LIVE FCM</span>
            </div>
          </div>

          {/* Mobile Screen Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            
            {/* FCM Simulated Push Notification Banner */}
            {mobileState === 'NOTIFICATION_RECEIVED' && (
              <div className="p-3 rounded-2xl bg-white border border-red-200 shadow-sm space-y-2 animate-in slide-in-from-top-2 duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-red-600 font-bold text-xs">
                    <Bell className="w-3.5 h-3.5 animate-bounce" />
                    <span>EMERGENCY SOS BROADCAST</span>
                  </div>
                  <span className="text-[10px] text-slate-400">Just now</span>
                </div>
                <p className="text-xs font-semibold text-slate-900 leading-snug">
                  {latestRequest?.hospitalName || 'BloodLink Emergency Network'} requested urgent {latestRequest?.bloodGroup || 'O-'} blood!
                </p>
                <div className="text-[11px] text-slate-500">
                  {latestRequest?.emergencyType} • Ward: {latestRequest?.locationWard}
                </div>
              </div>
            )}

            {/* Main Donor Decision Card */}
            {latestRequest && (
              <div className="p-4 rounded-3xl bg-white border border-[#E5E7EB] shadow-sm space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold tracking-wider uppercase text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                      PRIORITY: {latestRequest.priority.replace('_', ' ')}
                    </span>
                    <h4 className="text-sm font-bold text-[#111827] mt-1.5 leading-tight">
                      {latestRequest.hospitalName}
                    </h4>
                    <p className="text-[11px] text-[#64748B]">
                      {latestRequest.department}
                    </p>
                  </div>
                  <BloodGroupBadge group={latestRequest.bloodGroup} size="lg" />
                </div>

                {/* Patient / Case summary */}
                <div className="p-2.5 rounded-2xl bg-[#F8FAFC] border border-[#E5E7EB] text-xs space-y-1">
                  <div className="flex items-center justify-between text-slate-700">
                    <span>Units Needed:</span>
                    <span className="font-bold text-slate-900">{latestRequest.unitsRequired} Units</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-700">
                    <span>Target Radius:</span>
                    <span className="font-bold text-slate-900">{latestRequest.broadcastRadiusKm} km</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-700">
                    <span>Expected Arrival:</span>
                    <span className="font-bold text-red-600">Within {latestRequest.expectedResponseMinutes}m</span>
                  </div>
                </div>

                {/* State: Prompt to Accept */}
                {mobileState === 'NOTIFICATION_RECEIVED' && (
                  <div className="space-y-2 pt-1">
                    <button
                      onClick={handleAcceptRequest}
                      className="w-full py-3 rounded-2xl bg-[#DC2626] hover:bg-red-700 text-white font-bold text-xs shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                      <Navigation className="w-4 h-4" />
                      <span>Accept & Navigate (Respond)</span>
                    </button>
                    <button
                      onClick={() => setMobileState('IDLE')}
                      className="w-full py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-all"
                    >
                      Unable to Donate Now
                    </button>
                  </div>
                )}

                {/* State: Accepted and En Route */}
                {mobileState === 'ACCEPTED_EN_ROUTE' && (
                  <div className="space-y-3 pt-1">
                    <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-1 text-center">
                      <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-700">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Dispatch Confirmed!</span>
                      </div>
                      <p className="text-[11px] text-emerald-700">
                        The Hospital Command Center is tracking your route.
                      </p>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-2xl bg-[#F8FAFC] border border-[#E5E7EB]">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-amber-500" />
                        <span className="text-xs font-bold text-slate-800">Your Current ETA</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setDonorEta(prev => Math.max(1, prev - 2))}
                          className="w-6 h-6 rounded-lg bg-white border text-xs font-bold"
                        >
                          -
                        </button>
                        <span className="font-mono font-black text-sm px-2 text-slate-900">{donorEta}m</span>
                        <button
                          onClick={() => setDonorEta(prev => prev + 2)}
                          className="w-6 h-6 rounded-lg bg-white border text-xs font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={handleArrivalConfirmed}
                      className="w-full py-3 rounded-2xl bg-[#16A34A] hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>I Have Arrived at Triage</span>
                    </button>
                  </div>
                )}

                {/* State: Arrived */}
                {mobileState === 'ARRIVED' && (
                  <div className="p-4 rounded-2xl bg-emerald-100 border border-emerald-300 text-center space-y-2">
                    <div className="w-10 h-10 rounded-full bg-emerald-600 text-white mx-auto flex items-center justify-center">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div className="text-xs font-black text-emerald-900">Arrived at Emergency Triage</div>
                    <p className="text-[11px] text-emerald-800">
                      Nursing staff in Trauma Bay 2 have been alerted. Thank you for saving a life today!
                    </p>
                    <button
                      onClick={handleReset}
                      className="mt-2 text-[11px] font-bold text-emerald-700 underline"
                    >
                      Simulate Another SOS
                    </button>
                  </div>
                )}

              </div>
            )}

            {/* Mobile Donor Profile card */}
            <div className="p-3 rounded-2xl bg-white border border-[#E5E7EB] flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-300 overflow-hidden shrink-0">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
                  alt="Donor"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <div className="text-xs font-bold text-slate-900 truncate">Arjun Mehta (You)</div>
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                </div>
                <div className="text-[10px] text-slate-500">Blood Group O- • 14 Lifesaving Donations</div>
              </div>
            </div>

          </div>

          {/* Mobile Bottom Tab Bar */}
          <div className="py-2.5 px-6 bg-white border-t border-[#E5E7EB] flex items-center justify-around text-slate-400 text-[10px] font-medium">
            <div className="text-red-600 font-bold flex flex-col items-center">
              <Radio className="w-4 h-4" />
              <span>SOS Alert</span>
            </div>
            <div className="flex flex-col items-center">
              <MapPin className="w-4 h-4" />
              <span>Route</span>
            </div>
            <div className="flex flex-col items-center">
              <ShieldCheck className="w-4 h-4" />
              <span>Pass</span>
            </div>
          </div>

        </div>

        {/* Home Indicator bar */}
        <div className="w-32 h-1 bg-slate-600 rounded-full mt-2" />

      </div>
    </div>
  );
};
