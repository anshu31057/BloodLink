import React from 'react';
import { X, Bell, Clock, Radio, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { useCommandCenter } from '../../context/CommandCenterContext';
import { BloodGroupBadge } from './BloodGroupBadge';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
  const { activities, setActivePage, setSelectedRequestId } = useCommandCenter();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        id="live-notification-drawer"
        className="w-full max-w-md bg-white h-full shadow-2xl border-l border-[#E5E7EB] flex flex-col animate-in slide-in-from-right duration-200"
      >
        {/* Drawer Header */}
        <div className="px-6 py-4 border-b border-[#E5E7EB] flex items-center justify-between bg-[#F8FAFC]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-red-50 text-[#D92D20] flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#101828]">
                Live Emergency Feed
              </h3>
              <p className="text-[11px] text-[#667085]">
                Real-time FCM dispatches & donor triage logs
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Activity List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {activities.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              No emergency activity recorded yet.
            </div>
          ) : (
            activities.map((event) => {
              const getIcon = () => {
                switch (event.type) {
                  case 'SOS_CREATED':
                    return <Radio className="w-4 h-4 text-red-600 animate-pulse" />;
                  case 'DONOR_ACCEPTED':
                    return <CheckCircle2 className="w-4 h-4 text-blue-600" />;
                  case 'DONOR_ARRIVED':
                    return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
                  case 'DONATION_COMPLETED':
                    return <CheckCircle2 className="w-4 h-4 text-purple-600" />;
                  case 'INVENTORY_LOW':
                    return <AlertTriangle className="w-4 h-4 text-amber-500" />;
                  default:
                    return <Clock className="w-4 h-4 text-slate-500" />;
                }
              };

              return (
                <div
                  key={event.id}
                  id={`activity-tile-${event.id}`}
                  onClick={() => {
                    if (event.requestId) {
                      setSelectedRequestId(event.requestId);
                      setActivePage('live-requests');
                      onClose();
                    }
                  }}
                  className="p-3.5 rounded-2xl bg-[#F8FAFC] hover:bg-slate-100 border border-[#E5E7EB] transition-all cursor-pointer space-y-1.5 text-left group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-white border border-[#E5E7EB] shadow-xs">
                        {getIcon()}
                      </div>
                      <span className="text-xs font-bold text-[#101828]">
                        {event.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {event.bloodGroup && (
                        <BloodGroupBadge group={event.bloodGroup} size="sm" />
                      )}
                      <span className="text-[10px] text-[#667085] font-mono">
                        {event.timestamp}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-[#667085] leading-relaxed">
                    {event.description}
                  </p>

                  {event.requestId && (
                    <div className="flex items-center gap-1 text-[11px] font-semibold text-[#D92D20] group-hover:translate-x-0.5 transition-transform pt-1">
                      <span>View Request #{event.requestId.slice(-4)}</span>
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-4 bg-[#F8FAFC] border-t border-[#E5E7EB] text-center">
          <button
            onClick={() => {
              setActivePage('donor-center');
              onClose();
            }}
            className="w-full py-3 rounded-xl bg-[#101828] text-white text-xs font-bold hover:bg-slate-800 transition-all shadow-xs"
          >
            Open Donor Response Center
          </button>
        </div>

      </div>
    </div>
  );
};
