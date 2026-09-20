import React from 'react';
import { X, Smartphone, Bell, Send } from 'lucide-react';
import { EmergencyRequest } from '../../types';
import { BloodGroupBadge } from './BloodGroupBadge';

interface NotificationPreviewModalProps {
  request: EmergencyRequest | null;
  onClose: () => void;
  onConfirmBroadcast?: () => void;
}

export const NotificationPreviewModal: React.FC<NotificationPreviewModalProps> = ({
  request,
  onClose,
  onConfirmBroadcast
}) => {
  if (!request) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        id="fcm-notification-preview-modal"
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-[#E5E7EB] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E5E7EB] flex items-center justify-between bg-[#F8FAFC]">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-[#101828]" />
            <h3 className="text-base font-bold text-[#101828]">
              Firebase Cloud Messaging (FCM) Preview
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          <p className="text-xs text-[#667085]">
            This exact high-priority notification payload will be delivered to eligible, verified donors in a {request.broadcastRadiusKm}km radius:
          </p>

          {/* Simulated Lockscreen Push Notification */}
          <div className="p-4 rounded-2xl bg-slate-900 text-white shadow-xl border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-md bg-[#D92D20] text-white flex items-center justify-center text-[9px] font-bold">
                  BL8
                </div>
                <span className="font-semibold text-slate-200">BloodLink 8 Emergency Network</span>
              </div>
              <span>NOW</span>
            </div>

            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-bold text-white flex items-center gap-1.5">
                  <Bell className="w-3.5 h-3.5 text-red-500 animate-bounce" />
                  <span>EMERGENCY: {request.bloodGroup} Blood Needed</span>
                </div>
                <div className="text-xs text-slate-300 mt-1 leading-relaxed">
                  {request.hospitalName} ({request.department}) requires {request.unitsRequired} units. Priority: {request.priority.replace('_', ' ')}.
                </div>
              </div>
              <BloodGroupBadge group={request.bloodGroup} size="sm" />
            </div>

            {/* Simulated Action buttons */}
            <div className="pt-2 border-t border-slate-800 flex gap-2">
              <span className="flex-1 py-1.5 text-center text-xs font-bold text-white bg-[#D92D20] rounded-xl">
                Respond / I'm Coming
              </span>
              <span className="flex-1 py-1.5 text-center text-xs font-medium text-slate-300 bg-slate-800 rounded-xl">
                Dismiss
              </span>
            </div>
          </div>

          {/* FCM Edge Function Details */}
          <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-blue-950 space-y-1">
            <div className="font-bold flex items-center justify-between">
              <span>Target Delivery Scope:</span>
              <span className="text-blue-700 font-mono font-bold">~{request.notifiedDonorsCount || 384} Donors</span>
            </div>
            <div className="text-[11px] text-blue-800">
              Filtered by active GPS radius (&lt;{request.broadcastRadiusKm}km) and medical eligibility interval (&gt;90 days since last donation).
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#F8FAFC] border-t border-[#E5E7EB] flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-all"
          >
            Close
          </button>
          {onConfirmBroadcast && (
            <button
              onClick={() => {
                onConfirmBroadcast();
                onClose();
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#D92D20] hover:bg-red-700 text-white text-xs font-bold transition-all shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Confirm & Broadcast</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
