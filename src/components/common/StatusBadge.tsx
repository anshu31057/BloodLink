import React from 'react';
import { PriorityLevel, RequestStatus, DonorStatus } from '../../types';

interface StatusBadgeProps {
  type: 'priority' | 'request-status' | 'donor-status';
  value: PriorityLevel | RequestStatus | DonorStatus | string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  type,
  value,
  size = 'md'
}) => {
  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-xs px-2.5 py-1 font-semibold';

  // PRIORITY BADGES
  if (type === 'priority') {
    switch (value) {
      case 'CODE_RED':
        return (
          <span className={`inline-flex items-center gap-1.5 rounded-full bg-red-100 text-[#DC2626] font-bold border border-red-200 tracking-wide uppercase ${sizeClasses}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626] animate-ping" />
            <span>CODE RED</span>
          </span>
        );
      case 'IMMEDIATE':
        return (
          <span className={`inline-flex items-center gap-1 rounded-full bg-amber-100 text-[#F59E0B] font-bold border border-amber-200 ${sizeClasses}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
            <span>IMMEDIATE</span>
          </span>
        );
      case 'URGENT':
      case 'HIGH':
        return (
          <span className={`inline-flex items-center gap-1 rounded-full bg-blue-100 text-[#2563EB] font-bold border border-blue-200 ${sizeClasses}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB]" />
            <span>URGENT</span>
          </span>
        );
      default:
        return (
          <span className={`inline-flex items-center rounded-full bg-slate-100 text-slate-700 font-medium ${sizeClasses}`}>
            {value}
          </span>
        );
    }
  }

  // REQUEST STATUS BADGES
  if (type === 'request-status') {
    switch (value) {
      case 'BROADCASTING':
        return (
          <span className={`inline-flex items-center gap-1.5 rounded-full bg-red-50 text-[#DC2626] border border-red-200 font-semibold ${sizeClasses}`}>
            <span className="w-2 h-2 rounded-full bg-[#DC2626] animate-pulse" />
            <span>BROADCASTING</span>
          </span>
        );
      case 'DONORS_DISPATCHED':
        return (
          <span className={`inline-flex items-center gap-1.5 rounded-full bg-blue-50 text-[#2563EB] border border-blue-200 font-semibold ${sizeClasses}`}>
            <span className="w-2 h-2 rounded-full bg-[#2563EB]" />
            <span>DISPATCHED</span>
          </span>
        );
      case 'PARTIALLY_FULFILLED':
        return (
          <span className={`inline-flex items-center gap-1.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-semibold ${sizeClasses}`}>
            <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
            <span>PARTIAL</span>
          </span>
        );
      case 'FULFILLED':
        return (
          <span className={`inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-[#16A34A] border border-emerald-200 font-semibold ${sizeClasses}`}>
            <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
            <span>FULFILLED</span>
          </span>
        );
      case 'CANCELLED':
        return (
          <span className={`inline-flex items-center rounded-full bg-slate-100 text-slate-600 border border-slate-200 font-semibold ${sizeClasses}`}>
            CANCELLED
          </span>
        );
      default:
        return (
          <span className={`inline-flex items-center rounded-full bg-slate-100 text-slate-700 ${sizeClasses}`}>
            {value}
          </span>
        );
    }
  }

  // DONOR STATUS BADGES
  switch (value) {
    case 'RESPONDED':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-blue-50 text-[#2563EB] border border-blue-200 font-semibold ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB]" />
          <span>ACCEPTED</span>
        </span>
      );
    case 'EN_ROUTE':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-semibold ${sizeClasses}`}>
          <span className="w-2 h-2 rounded-full bg-[#F59E0B] animate-pulse" />
          <span>EN ROUTE</span>
        </span>
      );
    case 'ARRIVED_TRIAGE':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-[#16A34A] border border-emerald-300 font-bold ${sizeClasses}`}>
          <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
          <span>AT TRIAGE</span>
        </span>
      );
    case 'DONATION_IN_PROGRESS':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 font-semibold ${sizeClasses}`}>
          <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse" />
          <span>DONATING</span>
        </span>
      );
    case 'COMPLETED':
      return (
        <span className={`inline-flex items-center gap-1 rounded-full bg-emerald-100 text-[#16A34A] border border-emerald-300 font-bold ${sizeClasses}`}>
          <span>✓ COMPLETED</span>
        </span>
      );
    default:
      return (
        <span className={`inline-flex items-center rounded-full bg-slate-100 text-slate-600 ${sizeClasses}`}>
          {value}
        </span>
      );
  }
};
