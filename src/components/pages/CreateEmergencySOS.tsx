import React, { useState } from 'react';
import { 
  Radio, 
  Send, 
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  AlertCircle
} from 'lucide-react';
import { useCommandCenter } from '../../context/CommandCenterContext';
import { BloodGroup, PriorityLevel, EmergencyRequest } from '../../types';
import { BloodGroupBadge } from '../common/BloodGroupBadge';
import { authService } from "../../services/authService";
const BLOOD_GROUPS: BloodGroup[] = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];

export const CreateEmergencySOS: React.FC = () => {
  const { hospital, broadcastSOS, setActivePage, setSelectedRequestId, isSosCreating } = useCommandCenter();

  // 4 Step iOS Health Setup
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Form State
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>('O-');
  const [unitsRequired, setUnitsRequired] = useState<number>(4);
  const [priority, setPriority] = useState<PriorityLevel>('CODE_RED');
  const [broadcastRadiusKm, setBroadcastRadiusKm] = useState<5 | 10 | 20>(10);

  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastDone, setBroadcastDone] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleBroadcast = async () => {
    setIsBroadcasting(true);
    setErrorMsg(null);
const session = authService.getSession();

if (!session) {
  setErrorMsg("Hospital session expired. Please login again.");
  return;
}
    const newReq: Partial<EmergencyRequest> = {
      hospitalName: hospital.name,
      hospitalAddress: hospital.address,
      department: 'Emergency Trauma Center',
      doctorName: "Command Director",
      doctorContact: hospital.emergencyHotline,
      bloodGroup,
      unitsRequired,
      unitsFulfilled: 0,
      emergencyType: priority === 'CODE_RED' ? 'Acute Severe Hemorrhage' : 'Emergency Transfusion',
      emergencyCategory: 'Mass Casualty / Trauma',
      priority,
      patientAge: 32,
      patientGender: 'Male',
      patientCondition: 'Emergency clinical trauma transfusion required',
      clinicalNotes: 'Immediate packed red cells dispatched via BloodLink 8 network.',
      locationWard: 'Trauma Resuscitation OT',
      broadcastRadiusKm,
      expectedResponseMinutes: priority === 'CODE_RED' ? 15 : priority === 'IMMEDIATE' ? 30 : 60,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      status: 'BROADCASTING',
      acceptedDonorsCount: 0,
      notifiedDonorsCount: 0,
      latitude: hospital.latitude,
      longitude: hospital.longitude
    };

    try {
      const createdId = await broadcastSOS(newReq, session.userId);
      setIsBroadcasting(false);
      setBroadcastDone(true);

      setTimeout(() => {
        setSelectedRequestId(createdId);
        setActivePage('live-map');
      }, 2000);
    } catch (err: any) {
      setIsBroadcasting(false);
      setErrorMsg(err?.message || 'Failed to broadcast SOS. Please retry.');
    }
  };

  const steps = [
    { num: 1, label: 'Blood Group' },
    { num: 2, label: 'Units' },
    { num: 3, label: 'Priority' },
    { num: 4, label: 'Confirm' }
  ];

  return (
    <div id="create-sos-wizard" className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-200">
      
      {/* 4-Step iOS Health Style Progress Indicator */}
      <div className="bg-white border border-[#E5E7EB] rounded-[28px] p-4 sm:p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
        <div className="grid grid-cols-4 gap-2">
          {steps.map((step) => {
            const isCurrent = currentStep === step.num;
            const isCompleted = currentStep > step.num;

            return (
              <button
                key={step.num}
                type="button"
                onClick={() => setCurrentStep(step.num as any)}
                className={`py-2.5 px-3 rounded-2xl text-center transition-all ${
                  isCurrent
                    ? 'bg-[#101828] text-white shadow-xs'
                    : isCompleted
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                }`}
              >
                <div className="text-[11px] font-semibold opacity-75">Step {step.num}</div>
                <div className="text-xs font-bold truncate">{step.label}</div>
              </button>
            );
          })}
        </div>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs text-[#D92D20] font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-[#D92D20] shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Step Body */}
      <div className="bg-white border border-[#E5E7EB] rounded-[28px] p-6 sm:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-6">
        
        {/* Step 1: Blood Group Selection */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-[#101828]">
                Select Required Blood Group
              </h3>
              <p className="text-xs text-[#667085] mt-1">
                Choose the recipient's required blood group. Algorithm cross-references universal compatibility matrix.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {BLOOD_GROUPS.map((bg) => {
                const isSelected = bloodGroup === bg;
                return (
                  <button
                    key={bg}
                    type="button"
                    onClick={() => setBloodGroup(bg)}
                    className={`p-4 rounded-2xl border text-center transition-all ${
                      isSelected
                        ? 'border-[#D92D20] bg-red-50/60 ring-2 ring-[#D92D20]/20 shadow-xs'
                        : 'border-[#E5E7EB] bg-[#F8FAFC] hover:border-slate-300'
                    }`}
                  >
                    <div className="text-2xl font-black text-[#101828] mb-1 font-mono">
                      {bg}
                    </div>
                    <div className="text-[11px] font-medium text-[#667085]">
                      {bg === 'O-' ? 'Universal Donor' : bg === 'AB+' ? 'Universal Recipient' : 'Specific Match'}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 2: Units Required */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-[#101828]">
                Units Required
              </h3>
              <p className="text-xs text-[#667085] mt-1">
                Select the quantity of packed red blood cell units required immediately.
              </p>
            </div>

            <div className="flex items-center justify-center gap-4 py-8">
              <button
                type="button"
                onClick={() => setUnitsRequired(prev => Math.max(1, prev - 1))}
                className="w-14 h-14 rounded-2xl bg-slate-100 hover:bg-slate-200 text-2xl font-bold text-slate-800 transition-all flex items-center justify-center"
              >
                -
              </button>
              <div className="text-center min-w-30">
                <div className="text-5xl font-black text-[#101828] font-mono tabular-nums">
                  {unitsRequired}
                </div>
                <div className="text-xs font-semibold text-[#667085] uppercase tracking-wider mt-1">
                  Units (Pints)
                </div>
              </div>
              <button
                type="button"
                onClick={() => setUnitsRequired(prev => Math.min(10, prev + 1))}
                className="w-14 h-14 rounded-2xl bg-slate-100 hover:bg-slate-200 text-2xl font-bold text-slate-800 transition-all flex items-center justify-center"
              >
                +
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 text-xs text-[#667085] flex items-center justify-between">
              <span>Selected Group:</span>
              <BloodGroupBadge group={bloodGroup} size="sm" />
            </div>
          </div>
        )}

        {/* Step 3: Priority & Geofence Radius */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-[#101828]">
                Emergency Priority & Geofence Radius
              </h3>
              <p className="text-xs text-[#667085] mt-1">
                Set triage urgency level and broadcast boundary for instant push notification dispatch.
              </p>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-bold text-[#101828] uppercase tracking-wider">
                Priority Level
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: 'CODE_RED' as PriorityLevel, label: 'Code Red', desc: '< 15 mins (Trauma / Hemorrhage)', color: 'border-red-500 bg-red-50' },
                  { id: 'IMMEDIATE' as PriorityLevel, label: 'Immediate', desc: '< 30 mins (Active OT)', color: 'border-amber-500 bg-amber-50' },
                  { id: 'URGENT' as PriorityLevel, label: 'Urgent', desc: '< 60 mins (Scheduled OT)', color: 'border-blue-500 bg-blue-50' }
                ].map((item) => {
                  const isSelected = priority === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setPriority(item.id)}
                      className={`p-4 rounded-2xl border text-left transition-all ${
                        isSelected
                          ? `${item.color} ring-2 ring-slate-900/10 shadow-xs`
                          : 'border-[#E5E7EB] bg-[#F8FAFC] hover:border-slate-300'
                      }`}
                    >
                      <div className="text-sm font-bold text-[#101828] mb-1">{item.label}</div>
                      <div className="text-[11px] text-[#667085]">{item.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <label className="block text-xs font-bold text-[#101828] uppercase tracking-wider">
                Broadcast Geofence Radius
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[5, 10, 20].map((radius) => {
                  const isSelected = broadcastRadiusKm === radius;
                  return (
                    <button
                      key={radius}
                      type="button"
                      onClick={() => setBroadcastRadiusKm(radius as any)}
                      className={`py-3 px-4 rounded-2xl border text-center transition-all ${
                        isSelected
                          ? 'border-[#101828] bg-[#101828] text-white shadow-xs'
                          : 'border-[#E5E7EB] bg-[#F8FAFC] text-[#101828] hover:border-slate-300'
                      }`}
                    >
                      <div className="text-base font-bold font-mono">{radius} km</div>
                      <div className="text-[10px] opacity-75">
                        {radius === 5 ? '~140 Donors' : radius === 10 ? '~380 Donors' : '~720 Donors'}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Final Confirmation */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-[#101828]">
                Review Emergency Broadcast
              </h3>
              <p className="text-xs text-[#667085] mt-1">
                Connected to Supabase <code className="text-red-600 font-mono">blood_requests</code> table. Push notifications will be dispatched to nearby voluntary donors.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-xs font-medium text-[#667085]">Hospital Facility</span>
                <span className="text-xs font-bold text-[#101828]">{hospital.name}</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-xs font-medium text-[#667085]">Blood Group Required</span>
                <BloodGroupBadge group={bloodGroup} size="sm" />
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-xs font-medium text-[#667085]">Units Required</span>
                <span className="text-xs font-black font-mono text-[#101828]">{unitsRequired} Units</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-xs font-medium text-[#667085]">Priority Level</span>
                <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-red-100 text-red-700">
                  {priority.replace('_', ' ')}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[#667085]">Geofence Radius</span>
                <span className="text-xs font-bold text-[#101828]">{broadcastRadiusKm} km radius</span>
              </div>
            </div>

            {/* Broadcast Action Button */}
            <button
              id="btn-broadcast-emergency-sos-final"
              disabled={isBroadcasting || broadcastDone || isSosCreating}
              onClick={handleBroadcast}
              className="w-full h-14 rounded-2xl bg-[#D92D20] hover:bg-red-700 active:scale-[0.99] disabled:opacity-50 text-white font-bold text-sm shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isBroadcasting || isSosCreating ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Transmitting to Supabase blood_requests...</span>
                </>
              ) : broadcastDone ? (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Broadcast Active — Opening Live Map...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Broadcast Emergency SOS Now</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Wizard Footer Navigation */}
        <div className="flex items-center justify-between pt-4 border-t border-[#E5E7EB]">
          <button
            type="button"
            disabled={currentStep === 1}
            onClick={() => setCurrentStep((currentStep - 1) as any)}
            className="h-11 px-5 rounded-2xl border border-[#E5E7EB] bg-white hover:bg-slate-50 disabled:opacity-30 text-xs font-bold text-slate-700 transition-all cursor-pointer"
          >
            Back
          </button>

          <span className="text-xs font-semibold text-slate-400">
            Step {currentStep} of 4
          </span>

          {currentStep < 4 ? (
            <button
              type="button"
              onClick={() => setCurrentStep((currentStep + 1) as any)}
              className="h-11 px-6 rounded-2xl bg-[#101828] hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
            >
              Continue
            </button>
          ) : (
            <div />
          )}
        </div>

      </div>

    </div>
  );
};
