import React, { useState } from 'react';
import { 
  Droplet, 
  AlertTriangle, 
  ShieldCheck, 
  ArrowUpRight, 
  Plus, 
  Minus, 
  Send, 
  Check, 
  Building2, 
  RefreshCw,
  Sparkles,
  Layers
} from 'lucide-react';
import { useCommandCenter } from '../../context/CommandCenterContext';
import { BloodGroupBadge } from '../common/BloodGroupBadge';
import { BloodGroup, BloodInventoryItem } from '../../types';

export const BloodInventoryPage: React.FC = () => {
  const { inventory, updateInventory, hospital } = useCommandCenter();

  const [transferModalItem, setTransferModalItem] = useState<BloodInventoryItem | null>(null);
  const [transferHospital, setTransferHospital] = useState('Safdarjung Regional Blood Bank');
  const [transferUnits, setTransferUnits] = useState(2);
  const [transferSent, setTransferSent] = useState(false);

  const handleRequestTransfer = () => {
    setTransferSent(true);
    setTimeout(() => {
      setTransferSent(false);
      setTransferModalItem(null);
    }, 1500);
  };

  const totalUnits = inventory.reduce((acc, curr) => acc + curr.availableUnits, 0);
  const lowCount = inventory.filter(i => i.lowStockAlert).length;

  return (
    <div id="blood-inventory-page" className="space-y-6 lg:space-y-8 animate-in fade-in duration-200">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 lg:p-6 rounded-[28px] border border-[#E5E7EB] shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-[#101828] tracking-tight">
              Hospital Blood Bank Vault
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold text-xs border border-blue-200">
              License: {hospital.licenseNumber || 'DL-BL-2023-9981'}
            </span>
          </div>
          <p className="text-xs text-[#667085] mt-0.5">
            Cryogenic storage status, real-time depletion monitoring, and repository transfer.
          </p>
        </div>

        {/* Global Inventory Summary */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="px-3.5 py-2 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB] text-xs">
            <span className="text-slate-500 font-medium">Total Stored:</span>{' '}
            <strong className="font-mono text-[#101828] font-bold tabular-nums">{totalUnits} Units</strong>
          </div>
          {lowCount > 0 && (
            <div className="px-3 py-2 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-[#D92D20] flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-[#D92D20] shrink-0" />
              <span>{lowCount} Groups Low</span>
            </div>
          )}
        </div>
      </div>

      {/* MOBILE INVENTORY GRID (md:hidden) */}
      <div className="grid md:hidden grid-cols-2 gap-3">
        {inventory.map((item) => {
          const isCritical = item.lowStockAlert;
          const ratio = Math.min(100, Math.round((item.availableUnits / item.criticalThreshold) * 100));

          return (
            <div
              key={`mobile-${item.bloodGroup}`}
              className={`rounded-[24px] border p-3.5 transition-all shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col justify-between min-h-[210px] aspect-square overflow-hidden ${
                isCritical 
                  ? 'bg-rose-50/50 border-red-200' 
                  : 'bg-emerald-50/40 border-emerald-200/90'
              }`}
            >
              {/* Header: Blood Group Badge + Status Indicator */}
              <div className="flex items-center justify-between">
                <BloodGroupBadge group={item.bloodGroup} size="sm" />
                {isCritical ? (
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-red-100 text-[#D92D20] text-[9px] font-bold border border-red-200">
                    <AlertTriangle className="w-2.5 h-2.5 text-[#D92D20]" />
                    LOW
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[9px] font-bold border border-emerald-200">
                    <ShieldCheck className="w-2.5 h-2.5 text-emerald-600" />
                    OK
                  </span>
                )}
              </div>

              {/* Stock number centered */}
              <div className="text-center my-auto py-1">
                <div className="text-3xl font-mono font-bold text-[#101828] tracking-tight tabular-nums">
                  {item.availableUnits}
                </div>
                <div className="text-[10px] uppercase font-bold text-[#667085] tracking-wider">
                  Units in Vault
                </div>
              </div>

              {/* Progress Bar Below */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[9px] font-bold text-slate-500">
                  <span>Capacity</span>
                  <span className={`font-mono tabular-nums ${isCritical ? 'text-[#D92D20]' : 'text-emerald-700'}`}>
                    {ratio}%
                  </span>
                </div>
                <div className="w-full bg-slate-200/80 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-300 ${
                      isCritical ? 'bg-[#D92D20]' : 'bg-emerald-600'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(10, ratio))}%` }}
                  />
                </div>
              </div>

              {/* Transfer Button Full Width */}
              <button
                onClick={() => setTransferModalItem(item)}
                className="w-full h-10 rounded-xl bg-white hover:bg-slate-50 border border-[#E5E7EB] text-slate-700 text-[11px] font-bold flex items-center justify-center gap-1.5 shadow-2xs active:scale-[0.98] transition-all shrink-0 mt-2"
                title="Request Inter-Hospital Transfer"
              >
                <ArrowUpRight className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>Transfer</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* DESKTOP INVENTORY GRID (hidden md:grid) */}
      <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
        {inventory.map((item) => {
          const isCritical = item.lowStockAlert;
          const ratio = Math.min(100, Math.round((item.availableUnits / item.criticalThreshold) * 100));

          return (
            <div
              key={item.bloodGroup}
              className={`rounded-[28px] border p-5 transition-all shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between h-[215px] overflow-hidden ${
                isCritical 
                  ? 'bg-rose-50/40 border-red-200 hover:border-red-300' 
                  : 'bg-emerald-50/30 border-emerald-200/80 hover:border-emerald-300'
              }`}
            >
              {/* Top Section */}
              <div className="h-12 flex items-start justify-between shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  <BloodGroupBadge group={item.bloodGroup} size="md" />
                  <div className="min-w-0">
                    <div className="text-xl sm:text-2xl font-mono font-bold text-[#101828] leading-tight tabular-nums">
                      {item.availableUnits} <span className="text-xs font-semibold text-slate-500">Units</span>
                    </div>
                    <div className="text-[11px] text-[#667085] truncate">
                      Threshold: {item.criticalThreshold} req
                    </div>
                  </div>
                </div>

                {/* Status Indicator Chip */}
                {isCritical ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 text-[#D92D20] text-[10px] font-bold border border-red-200 shrink-0">
                    <AlertTriangle className="w-3 h-3 text-[#D92D20]" />
                    LOW
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-200 shrink-0">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    STABLE
                  </span>
                )}
              </div>

              {/* Middle Section: Progress Bar */}
              <div className="space-y-1.5 shrink-0">
                <div className="flex items-center justify-between text-[10px] font-bold">
                  <span className="text-slate-500">Storage Capacity</span>
                  <span className={`font-mono tabular-nums ${isCritical ? 'text-[#D92D20]' : 'text-emerald-700'}`}>
                    {ratio}%
                  </span>
                </div>
                <div className="w-full bg-slate-200/80 h-2 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-300 ${
                      isCritical ? 'bg-[#D92D20]' : 'bg-emerald-600'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(10, ratio))}%` }}
                  />
                </div>
              </div>

              {/* Bottom Action Row */}
              <div className="pt-2 border-t border-slate-200/70 flex items-center justify-between gap-2 mt-auto shrink-0">
                
                {/* Stock Increment / Decrement Controls */}
                <div className="flex items-center gap-1 bg-white border border-[#E5E7EB] rounded-xl p-0.5 h-10">
                  <button
                    onClick={() => updateInventory(item.bloodGroup, -1)}
                    className="w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs transition-colors focus-visible:ring-2 focus-visible:ring-slate-900"
                    title="Dispense 1 Unit"
                    aria-label={`Dispense 1 unit of ${item.bloodGroup}`}
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-2 text-xs font-mono font-bold text-slate-800 tabular-nums">
                    {item.availableUnits}
                  </span>
                  <button
                    onClick={() => updateInventory(item.bloodGroup, 1)}
                    className="w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs transition-colors focus-visible:ring-2 focus-visible:ring-slate-900"
                    title="Add 1 Unit"
                    aria-label={`Add 1 unit of ${item.bloodGroup}`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Request Transfer Button */}
                <button
                  onClick={() => setTransferModalItem(item)}
                  className="h-10 flex items-center gap-1.5 px-3 rounded-xl bg-white hover:bg-slate-50 border border-[#E5E7EB] text-slate-700 text-xs font-semibold transition-colors shadow-2xs"
                  title="Request Inter-Hospital Repository Transfer"
                >
                  <ArrowUpRight className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>Transfer</span>
                </button>

              </div>
            </div>
          );
        })}
      </div>

      {/* Clean Request Transfer Modal */}
      {transferModalItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[28px] p-6 max-w-md w-full border border-[#E5E7EB] shadow-2xl space-y-4 animate-in zoom-in-95 duration-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-base text-[#101828]">
                  Request {transferModalItem.bloodGroup} Transfer
                </h3>
              </div>
              <button 
                onClick={() => setTransferModalItem(null)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[#667085] leading-relaxed">
              Dispatch an emergency requisition order via National Blood Courier Grid.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Source Repository</label>
                <select
                  value={transferHospital}
                  onChange={(e) => setTransferHospital(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#E5E7EB] bg-white font-medium text-slate-800 text-xs focus:ring-2 focus:ring-[#101828] outline-none"
                >
                  <option>Safdarjung Regional Blood Bank (4.2 km)</option>
                  <option>Red Cross Central Blood Depot (8.1 km)</option>
                  <option>Max Healthcare Blood Vault (11.0 km)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Required Units</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 4, 6].map(u => (
                    <button
                      key={u}
                      type="button"
                      onClick={() => setTransferUnits(u)}
                      className={`flex-1 py-2 rounded-xl text-xs font-mono font-bold transition-all tabular-nums ${
                        transferUnits === u 
                          ? 'bg-[#101828] text-white' 
                          : 'bg-[#F8FAFC] border border-[#E5E7EB] text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {u} Units
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                onClick={() => setTransferModalItem(null)}
                className="h-11 px-4 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>

              <button
                onClick={handleRequestTransfer}
                disabled={transferSent}
                className="h-11 px-4 rounded-xl bg-[#101828] hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-2 shadow-xs disabled:opacity-50"
              >
                {transferSent ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Order Transmitted</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Transmit Requisition</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
