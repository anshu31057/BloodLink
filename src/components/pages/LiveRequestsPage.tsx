import React, { useState } from 'react';
import { 
  Radio, 
  PlusCircle, 
  MapPin, 
  Users, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  Stethoscope,
  Share2,
  AlertCircle
} from 'lucide-react';
import { useCommandCenter } from '../../context/CommandCenterContext';
import { BloodGroupBadge } from '../common/BloodGroupBadge';
import { StatusBadge } from '../common/StatusBadge';
import { EmergencyRequest, PriorityLevel } from '../../types';

export const LiveRequestsPage: React.FC = () => {
  const { 
    requests, 
    donors, 
    closeRequest, 
    cancelRequest, 
    setActivePage, 
    selectedRequestId, 
    setSelectedRequestId 
  } = useCommandCenter();

  const [filterPriority, setFilterPriority] = useState<PriorityLevel | 'ALL'>('ALL');
  const [viewingRequest, setViewingRequest] = useState<EmergencyRequest | null>(null);

  const filteredRequests = requests.filter(r => {
    if (filterPriority === 'ALL') return true;
    return r.priority === filterPriority;
  });

  return (
    <div id="live-requests-container" className="space-y-6 lg:space-y-8 animate-in fade-in duration-200">
      
      {/* Page Header & Filter Pills */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-[#111827] tracking-tight">
              Live Emergency SOS
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-[#DC2626] text-xs font-mono font-bold tabular-nums">
              {filteredRequests.length} Active
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#64748B] mt-0.5 line-clamp-1">
            Real-time hospital broadcasts, verified donor responses and countdown progress.
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto overflow-x-auto no-scrollbar">
          {/* Priority Filter as Horizontal Pills with Snap Scrolling, no wrapping */}
          <div className="flex items-center bg-white border border-[#E5E7EB] rounded-2xl p-1 text-xs font-semibold overflow-x-auto no-scrollbar flex-nowrap snap-x snap-mandatory shrink-0">
            {(['ALL', 'CODE_RED', 'IMMEDIATE', 'URGENT'] as const).map((p) => {
              const isActive = filterPriority === p;
              return (
                <button
                  key={p}
                  onClick={() => setFilterPriority(p)}
                  className={`snap-start transition-all whitespace-nowrap focus-visible:ring-2 focus-visible:ring-slate-900 ${
                    isActive
                      ? 'h-10 px-4 rounded-xl bg-slate-900 text-white shadow-xs text-xs font-bold scale-[1.02]'
                      : 'h-9 px-3 rounded-lg text-slate-600 hover:text-slate-900 text-xs font-medium'
                  }`}
                >
                  {p === 'ALL' ? 'All Priorities' : p.replace('_', ' ')}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setActivePage('create-sos')}
            className="hidden sm:flex h-11 items-center gap-1.5 px-4 rounded-2xl bg-[#DC2626] hover:bg-red-700 text-white text-xs font-bold shadow-sm transition-all whitespace-nowrap focus-visible:ring-2 focus-visible:ring-red-500 shrink-0"
          >
            <PlusCircle className="w-4 h-4 shrink-0" />
            <span>New Emergency SOS</span>
          </button>
        </div>
      </div>

      {/* Empty State when no SOS match */}
      {filteredRequests.length === 0 ? (
        <div className="bg-white border border-[#E5E7EB] rounded-3xl p-12 text-center max-w-md mx-auto my-8 space-y-4 shadow-xs">
          <div className="w-16 h-16 rounded-3xl bg-emerald-50 border border-emerald-200 text-emerald-600 mx-auto flex items-center justify-center text-2xl">
            ✓
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">No Active SOS Incidents</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
              All emergency transfusion requests in this filter have been satisfied or closed.
            </p>
          </div>
          <button
            onClick={() => setFilterPriority('ALL')}
            className="h-11 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-all"
          >
            Reset Priority Filter
          </button>
        </div>
      ) : (
        /* Grid of Emergency Cards - Apple Health / Material 3 Minimalist Cards (<25 words) */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 lg:gap-6">
          {filteredRequests.map((req) => {
            const isSelected = selectedRequestId === req.id;

            return (
              <div
                key={req.id ?? `${req.bloodGroup}-${req.createdAt}`}
                id={`request-card-${req.id}`}
                className={`rounded-[28px] bg-white border transition-all p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between ${
                  isSelected
                    ? 'border-slate-900 ring-2 ring-slate-100'
                    : req.priority === 'CODE_RED'
                    ? 'border-red-200/80 hover:border-red-300'
                    : 'border-[#E5E7EB] hover:border-slate-300'
                }`}
              >
                {/* 1. Header: Blood badge top-left, Priority chip top-right */}
                <div className="flex items-center justify-between gap-2">
                 <BloodGroupBadge
  group={req.bloodGroup ?? "UNKNOWN"}
  size="md"
/>
                  <StatusBadge type="priority" value={req.priority} size="sm" />
                </div>

                {/* 2. Hospital / Department name */}
                <div className="pt-3">
                  <h3 className="text-base font-bold text-[#101828] truncate">
                    {req.department}
                  </h3>
                  {/* 3. Need X Units • Y Fulfilled */}
                  <p className="text-xs font-semibold text-slate-700 mt-1">
                    Need {req.unitsRequired} Units • {req.unitsFulfilled} Fulfilled
                  </p>
                  {/* 4. SLA Chip */}
                  <div className="mt-2.5">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-medium">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{req.expectedResponseMinutes}m Response SLA</span>
                    </span>
                  </div>
                </div>

                {/* 5. Two Buttons: View Details & Open Live Map */}
                <div className="pt-4 mt-3 border-t border-[#E5E7EB] flex items-center gap-2.5">
                  <button
                    onClick={() => setViewingRequest(req)}
                    className="flex-1 h-11 rounded-2xl bg-[#F8FAFC] hover:bg-slate-100 border border-[#E5E7EB] text-xs font-bold text-[#101828] flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Eye className="w-3.5 h-3.5 text-slate-500" />
                    <span>View Details</span>
                  </button>

                  <button
                    onClick={() => {
                      setSelectedRequestId(req.id);
                      setActivePage('live-map');
                    }}
                    className="flex-1 h-11 rounded-2xl bg-slate-900 hover:bg-slate-800 text-xs font-bold text-white flex items-center justify-center gap-1.5 transition-all shadow-xs"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Open Live Map</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Detailed View Modal (Sheet) */}
      {viewingRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-white rounded-[28px] shadow-2xl border border-[#E5E7EB] overflow-hidden flex flex-col">
            <div className="p-6 bg-[#F8FAFC] border-b border-[#E5E7EB] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <BloodGroupBadge
  group={viewingRequest.bloodGroup ?? "UNKNOWN"}
  size="lg"
/>
                <div>
                  <div className="text-xs font-mono font-bold text-slate-500 tabular-nums">#{viewingRequest.id}</div>
                  <h3 className="font-bold text-base text-[#101828]">{viewingRequest.department}</h3>
                </div>
              </div>
              <button 
                onClick={() => setViewingRequest(null)}
                className="w-9 h-9 rounded-full hover:bg-slate-200 flex items-center justify-center text-slate-500 font-bold transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-[#E5E7EB]">
                  <span className="text-slate-400 block font-semibold text-[10px] uppercase">Priority</span>
                  <span className="font-bold text-[#101828] text-xs mt-0.5 block">{viewingRequest.priority}</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-[#E5E7EB]">
                  <span className="text-slate-400 block font-semibold text-[10px] uppercase">Patient Condition</span>
                  <span className="font-bold text-[#101828] text-xs mt-0.5 block truncate">{viewingRequest.patientCondition}</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-[#E5E7EB]">
                  <span className="text-slate-400 block font-semibold text-[10px] uppercase">Attending Doctor</span>
                  <span className="font-bold text-[#101828] text-xs mt-0.5 block">{viewingRequest.doctorName}</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-[#E5E7EB]">
                  <span className="text-slate-400 block font-semibold text-[10px] uppercase">Doctor Contact</span>
                  <span className="font-mono font-bold text-[#101828] text-xs mt-0.5 block tabular-nums">{viewingRequest.doctorContact}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-500">Clinical Protocol Notes</span>
                <p className="text-slate-700 leading-relaxed">{viewingRequest.clinicalNotes || 'Standard emergency trauma protocol initiated.'}</p>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-slate-500">Broadcast Corridor</span>
                <span className="font-bold text-[#101828]">{viewingRequest.broadcastRadiusKm} km Radius</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Volunteers Dispatched</span>
                <span className="font-bold text-blue-600">{viewingRequest.acceptedDonorsCount} Donors</span>
              </div>
            </div>

            <div className="p-4 bg-[#F8FAFC] border-t border-[#E5E7EB] flex items-center justify-between gap-3">
              {viewingRequest.status !== 'FULFILLED' && viewingRequest.status !== 'CANCELLED' ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      closeRequest(viewingRequest.id);
                      setViewingRequest(null);
                    }}
                    className="h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Close SOS</span>
                  </button>
                  <button
                    onClick={() => {
                      cancelRequest(viewingRequest.id);
                      setViewingRequest(null);
                    }}
                    className="h-10 px-3 rounded-xl hover:bg-red-50 text-red-600 font-semibold text-xs transition-all"
                  >
                    Cancel
                  </button>
                </div>
              ) : <div />}

              <button
                onClick={() => setViewingRequest(null)}
                className="h-10 px-5 rounded-xl bg-slate-900 text-white font-semibold text-xs transition-all hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
