import React, { useState } from 'react';
import { 
  X, 
  Smartphone, 
  Copy, 
  Check, 
  QrCode, 
  Radio, 
  ExternalLink,
  Laptop, 
  RefreshCw,
  Tablet
} from 'lucide-react';
import { useCommandCenter } from '../../context/CommandCenterContext';

export const CrossDeviceSyncModal: React.FC = () => {
  const { 
    isSyncModalOpen, 
    setIsSyncModalOpen, 
    deviceId, 
    pairingCode, 
    connectedDevicesCount,
    setIsCompanionModalOpen
  } = useCommandCenter();

  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'qr' | 'code' | 'devices'>('qr');

  if (!isSyncModalOpen) return null;

  const appUrl = window.location.origin + window.location.pathname;
  const companionUrl = `${appUrl}?mode=donor-mobile&pair=${pairingCode}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(companionUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        id="cross-device-modal"
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-[#E5E7EB] overflow-hidden flex flex-col"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#E5E7EB] flex items-center justify-between bg-[#F8FAFC]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#D92D20] text-white flex items-center justify-center font-bold text-sm">
              <Radio className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#101828]">
                Cross-Device Emergency Sync
              </h3>
              <p className="text-xs text-[#667085]">
                Connect Hospital Terminals, Tablets & BloodLink 8 Mobile
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsSyncModalOpen(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-[#E5E7EB] px-6 bg-white text-xs font-semibold">
          <button
            onClick={() => setActiveTab('qr')}
            className={`py-3 px-4 border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'qr'
                ? 'border-[#101828] text-[#101828]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>Scan QR Code</span>
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`py-3 px-4 border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'code'
                ? 'border-[#101828] text-[#101828]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Pairing Code</span>
          </button>
          <button
            onClick={() => setActiveTab('devices')}
            className={`py-3 px-4 border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'devices'
                ? 'border-[#101828] text-[#101828]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Radio className="w-4 h-4" />
            <span>Active Peers ({connectedDevicesCount})</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {activeTab === 'qr' && (
            <div className="text-center space-y-4">
              <p className="text-xs text-[#667085] max-w-sm mx-auto">
                Scan with any smartphone or secondary tablet camera to open the live BloodLink 8 Mobile Companion.
              </p>

              {/* Clean SVG QR Code Visual */}
              <div className="relative inline-flex p-4 rounded-[28px] bg-white border border-[#E5E7EB] shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
                <svg className="w-48 h-48" viewBox="0 0 100 100" fill="currentColor">
                  {/* Corner Targets */}
                  <rect x="5" y="5" width="26" height="26" rx="4" fill="#111827" />
                  <rect x="8" y="8" width="20" height="20" rx="2" fill="#FFFFFF" />
                  <rect x="12" y="12" width="12" height="12" rx="2" fill="#D92D20" />

                  <rect x="69" y="5" width="26" height="26" rx="4" fill="#111827" />
                  <rect x="72" y="8" width="20" height="20" rx="2" fill="#FFFFFF" />
                  <rect x="76" y="12" width="12" height="12" rx="2" fill="#D92D20" />

                  <rect x="5" y="69" width="26" height="26" rx="4" fill="#111827" />
                  <rect x="8" y="72" width="20" height="20" rx="2" fill="#FFFFFF" />
                  <rect x="12" y="76" width="12" height="12" rx="2" fill="#D92D20" />

                  {/* QR Data Matrix simulation */}
                  <rect x="36" y="10" width="6" height="6" fill="#111827" />
                  <rect x="46" y="10" width="6" height="6" fill="#111827" />
                  <rect x="56" y="10" width="6" height="6" fill="#111827" />
                  
                  <rect x="36" y="20" width="6" height="6" fill="#D92D20" />
                  <rect x="46" y="20" width="6" height="6" fill="#111827" />
                  <rect x="56" y="20" width="6" height="6" fill="#111827" />

                  <rect x="10" y="36" width="6" height="6" fill="#111827" />
                  <rect x="20" y="36" width="6" height="6" fill="#111827" />
                  <rect x="36" y="36" width="14" height="14" rx="3" fill="#D92D20" />
                  <rect x="54" y="36" width="6" height="6" fill="#111827" />
                  <rect x="64" y="36" width="6" height="6" fill="#111827" />
                  <rect x="74" y="36" width="6" height="6" fill="#111827" />
                  <rect x="84" y="36" width="6" height="6" fill="#111827" />

                  <rect x="10" y="46" width="6" height="6" fill="#111827" />
                  <rect x="20" y="46" width="6" height="6" fill="#D92D20" />
                  <rect x="54" y="46" width="6" height="6" fill="#111827" />
                  <rect x="74" y="46" width="6" height="6" fill="#111827" />

                  <rect x="10" y="56" width="6" height="6" fill="#111827" />
                  <rect x="36" y="54" width="6" height="6" fill="#111827" />
                  <rect x="46" y="54" width="6" height="6" fill="#111827" />
                  <rect x="64" y="54" width="6" height="6" fill="#111827" />
                  <rect x="84" y="54" width="6" height="6" fill="#111827" />

                  <rect x="36" y="69" width="6" height="6" fill="#111827" />
                  <rect x="46" y="69" width="6" height="6" fill="#111827" />
                  <rect x="56" y="69" width="6" height="6" fill="#111827" />
                  <rect x="74" y="69" width="6" height="6" fill="#111827" />
                  <rect x="84" y="69" width="6" height="6" fill="#111827" />

                  <rect x="36" y="79" width="6" height="6" fill="#111827" />
                  <rect x="46" y="79" width="6" height="6" fill="#D92D20" />
                  <rect x="64" y="79" width="6" height="6" fill="#111827" />
                  <rect x="74" y="79" width="6" height="6" fill="#111827" />
                </svg>

                {/* Center Badge */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="px-2 py-1 rounded-md bg-[#D92D20] text-white font-extrabold text-[10px] tracking-wider shadow-md">
                    BLOODLINK 8
                  </div>
                </div>
              </div>

              {/* Link copy */}
              <div className="flex items-center gap-2 p-2 rounded-2xl bg-[#F8FAFC] border border-[#E5E7EB]">
                <input
                  type="text"
                  readOnly
                  value={companionUrl}
                  className="flex-1 bg-transparent text-xs font-mono text-slate-700 px-2 outline-none truncate"
                />
                <button
                  onClick={handleCopyLink}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-all shrink-0"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'code' && (
            <div className="space-y-4">
              <p className="text-xs text-[#64748B]">
                Enter this six-digit emergency pairing token inside the installed BloodLink mobile app or hospital bedside terminal:
              </p>

              <div className="text-center py-5 px-4 rounded-2xl bg-[#F8FAFC] border border-[#E5E7EB]">
                <div className="text-xs text-[#64748B] uppercase tracking-widest font-bold mb-1">
                  Active Pairing Key
                </div>
                <div className="text-3xl font-mono font-black text-blue-600 tracking-wider">
                  {pairingCode}
                </div>
                <div className="text-[11px] text-emerald-600 font-semibold mt-2 flex items-center justify-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Ready for immediate handshake</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-blue-900 space-y-1">
                <div className="font-bold">Peer Node ID: {deviceId}</div>
                <p className="text-[11px] text-blue-700">
                  Operates over zero-latency BroadcastChannel and WebSockets mesh across devices on same hospital network or public relay.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'devices' && (
            <div className="space-y-3">
              <div className="text-xs text-[#64748B] flex items-center justify-between">
                <span>Synchronized Terminals</span>
                <span className="text-emerald-600 font-semibold flex items-center gap-1">
                  <RefreshCw className="w-3 h-3 animate-spin" /> Live Channel
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 rounded-2xl bg-[#F8FAFC] border border-[#E5E7EB]">
                  <div className="flex items-center gap-3">
                    <Laptop className="w-4 h-4 text-blue-600" />
                    <div>
                      <div className="text-xs font-bold text-[#111827]">Command Center Desktop (This Device)</div>
                      <div className="text-[10px] text-slate-500 font-mono">{deviceId} • Primary Dispatcher</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    MASTER
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-2xl bg-[#F8FAFC] border border-[#E5E7EB]">
                  <div className="flex items-center gap-3">
                    <Tablet className="w-4 h-4 text-amber-600" />
                    <div>
                      <div className="text-xs font-bold text-[#111827]">Trauma Bay 2 Resuscitation Tablet</div>
                      <div className="text-[10px] text-slate-500 font-mono">TERM-BAY2-TAB • Syncing Realtime</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                    CONNECTED
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-2xl bg-[#F8FAFC] border border-[#E5E7EB]">
                  <div className="flex items-center gap-3">
                    <Smartphone className="w-4 h-4 text-emerald-600" />
                    <div>
                      <div className="text-xs font-bold text-[#111827]">BloodLink Mobile Donor App Cluster</div>
                      <div className="text-[10px] text-slate-500 font-mono">FCM Relay • 1,420 Verified Donors in Radius</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    ONLINE
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer with Mobile App Simulator Launcher */}
        <div className="px-6 py-4 bg-[#F8FAFC] border-t border-[#E5E7EB] flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={() => {
              setIsSyncModalOpen(false);
              setIsCompanionModalOpen(true);
            }}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-sm"
          >
            <Smartphone className="w-4 h-4 text-emerald-400" />
            <span>Launch Donor Mobile Simulator</span>
          </button>

          <a
            href={companionUrl}
            target="_blank"
            rel="noreferrer"
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 rounded-2xl bg-white border border-[#E5E7EB] hover:bg-slate-100 text-xs font-semibold text-[#111827] transition-all"
          >
            <span>Open Companion in New Tab</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </a>
        </div>

      </div>
    </div>
  );
};
