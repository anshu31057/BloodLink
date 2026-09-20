import React, { useState } from 'react';
import { 
  Building2, 
  ShieldCheck, 
  Phone, 
  MapPin, 
  Award, 
  Save, 
  Check, 
  QrCode,
  Layers,
  FileBadge
} from 'lucide-react';
import { useCommandCenter } from '../../context/CommandCenterContext';

export const HospitalProfilePage: React.FC = () => {
  const { hospital, updateHospitalProfile, setIsSyncModalOpen } = useCommandCenter();

  // Editable Form fields
  const [inchargeName, setInchargeName] = useState(hospital.bloodBankIncharge || 'Dr. Rajeshwar Sharma');
  const [emergencyPhone, setEmergencyPhone] = useState(hospital.emergencyPhone || '+91 180 265 8888');
  const [landline, setLandline] = useState(hospital.contactLandline || '+91 180 265 4432');
  const [hotline, setHotline] = useState(hospital.emergencyHotline || '+91 180 265 8888');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateHospitalProfile({
      bloodBankIncharge: inchargeName,
      emergencyPhone,
      contactLandline: landline,
      emergencyHotline: hotline
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div id="hospital-profile-page" className="max-w-4xl mx-auto space-y-8 pb-32 animate-in fade-in duration-200">
      
      {/* Top Header Card (1 Title, 2 Values, 1 CTA) */}
      <div className="bg-white p-8 rounded-[28px] border border-[#E5E7EB] shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-200 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Verified Emergency Network Node</span>
              </span>
              <span className="px-3.5 py-1.5 rounded-full bg-[#F8FAFC] text-[#667085] font-semibold text-xs border border-[#E5E7EB]">
                Panipat Regional Network
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-[#101828] tracking-tight">
              Emergency Network Node Terminal
            </h1>
            
            <p className="text-xs sm:text-sm text-[#667085] max-w-xl">
              North India Command Node / Panipat Regional Network • BloodLink Emergency Network
            </p>
          </div>

          <button
            onClick={() => setIsSyncModalOpen(true)}
            className="h-12 flex items-center gap-2 px-5 rounded-2xl bg-[#101828] hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs shrink-0 self-start sm:self-auto"
          >
            <QrCode className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Terminal Sync QR</span>
          </button>
        </div>

        {/* 2 Values summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#F2F4F7]">
          <div>
            <div className="text-xs text-[#667085]">Network Node ID</div>
            <div className="text-sm font-bold text-[#101828] font-mono mt-0.5">BL8-NODE-01 (Apex Node)</div>
          </div>
          <div>
            <div className="text-xs text-[#667085]">Regional Coordinates</div>
            <div className="text-sm font-bold text-[#101828] font-mono mt-0.5">29.3909° N, 76.9635° E (Panipat Command)</div>
          </div>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Node routing parameters synchronized with BloodLink Emergency Network.</span>
        </div>
      )}

      {/* Cards: Apple Health Visual Hierarchy */}
      <div className="space-y-6">
        
        {/* Card 1: Node Identity & Geographical Region */}
        <div className="bg-white rounded-[28px] border border-[#E5E7EB] p-8 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-6">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-slate-50 text-slate-700 flex items-center justify-center shrink-0 border border-[#E5E7EB]">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#101828]">1. Node Identity & Regional Bounds</h3>
              <p className="text-xs text-[#667085]">Network certification and geographical telemetry hub</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 text-xs">
            <div className="space-y-1.5">
              <span className="text-slate-400 font-bold uppercase text-[10px]">Institutional Node Name</span>
              <div className="font-bold text-sm text-[#101828]">Verified Emergency Network Node</div>
            </div>
            <div className="space-y-1.5">
              <span className="text-slate-400 font-bold uppercase text-[10px]">Network Organization</span>
              <div className="font-bold text-sm text-[#101828]">BloodLink Emergency Network</div>
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <span className="text-slate-400 font-bold uppercase text-[10px]">Command Corridor</span>
              <div className="font-semibold text-slate-800 flex items-center gap-1.5 mt-0.5">
                <MapPin className="w-4 h-4 text-slate-500 shrink-0" />
                <span>North India Command Node / Panipat Regional Network</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Standards & Network Protocols */}
        <div className="bg-white rounded-[28px] border border-[#E5E7EB] p-8 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-6">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#101828]">2. Network Standards & Verification</h3>
              <p className="text-xs text-[#667085]">Compliance standards for autonomous donor dispatch</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs">
            <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E5E7EB]">
              <div className="font-bold text-[#101828]">BloodLink Verified Node</div>
              <p className="text-[11px] text-[#667085] mt-1">Level-1 Trauma Rapid Dispatch Protocol</p>
            </div>
            <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E5E7EB]">
              <div className="font-bold text-[#101828]">ISO-15189 Cold Vault</div>
              <p className="text-[11px] text-[#667085] mt-1">Realtime Temperature Logged Storage</p>
            </div>
            <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E5E7EB]">
              <div className="font-bold text-[#101828]">National Emergency Mesh</div>
              <p className="text-[11px] text-[#667085] mt-1">FCM High-Priority Cellular Broadcast</p>
            </div>
          </div>
        </div>

        {/* Card 3: Emergency Dispatch Contacts & Routing */}
        <div className="bg-white rounded-[28px] border border-[#E5E7EB] p-8 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-6">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-slate-50 text-slate-700 flex items-center justify-center shrink-0 border border-[#E5E7EB]">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#101828]">3. Emergency Dispatch Contacts</h3>
              <p className="text-xs text-[#667085]">Hotline numbers broadcasted to verified donors</p>
            </div>
          </div>

          <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 text-xs">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">Medical Director / Transfusion Officer</label>
              <input
                type="text"
                value={inchargeName}
                onChange={(e) => setInchargeName(e.target.value)}
                className="w-full h-12 px-4 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB] font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#101828]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">Direct Emergency Mobile (SMS Dispatch)</label>
              <input
                type="text"
                value={emergencyPhone}
                onChange={(e) => setEmergencyPhone(e.target.value)}
                className="w-full h-12 px-4 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB] font-mono font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#101828] tabular-nums"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">Command Center Switchboard</label>
              <input
                type="text"
                value={landline}
                onChange={(e) => setLandline(e.target.value)}
                className="w-full h-12 px-4 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB] font-mono font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#101828] tabular-nums"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">24/7 Red Line Dispatch Hotline</label>
              <input
                type="text"
                value={hotline}
                onChange={(e) => setHotline(e.target.value)}
                className="w-full h-12 px-4 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB] font-mono font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#101828] tabular-nums"
              />
            </div>
          </form>
        </div>

        {/* Card 4: Blood Bank License & Storage Capacity */}
        <div className="bg-white rounded-[28px] border border-[#E5E7EB] p-8 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-6">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-slate-50 text-slate-700 flex items-center justify-center shrink-0 border border-[#E5E7EB]">
              <FileBadge className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#101828]">4. Node Capacity & Registration</h3>
              <p className="text-xs text-[#667085]">License credentials and cryogenic reserve capacity</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs">
            <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E5E7EB]">
              <div className="text-[10px] font-bold text-slate-400 uppercase">License Registration</div>
              <div className="font-mono font-bold text-[#101828] mt-1 tabular-nums">{hospital.licenseNumber || 'BL8-REG-2026-9821'}</div>
            </div>
            <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E5E7EB]">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Cold Vault Reserve</div>
              <div className="font-bold text-[#101828] mt-1 tabular-nums">850 Whole Blood Pints</div>
            </div>
            <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E5E7EB]">
              <div className="text-[10px] font-bold text-slate-400 uppercase">FCM Device Mesh</div>
              <div className="font-mono font-bold text-emerald-700 mt-1 tabular-nums">{hospital.fcmRegisteredDevicesCount} active nodes</div>
            </div>
          </div>
        </div>

      </div>

      {/* Floating Save Footer */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-[#E5E7EB] px-6 py-4 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="text-xs text-[#667085] hidden sm:block font-medium">
            Synchronizes immediate caller IDs and emergency coordinates across BloodLink 8.
          </div>

          <button
            onClick={handleSave}
            className="h-12 flex items-center gap-2 px-7 rounded-2xl bg-[#101828] hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-all w-full sm:w-auto justify-center"
          >
            <Save className="w-4 h-4 text-emerald-400" />
            <span>Save Node Configuration</span>
          </button>
        </div>
      </div>

    </div>
  );
};
