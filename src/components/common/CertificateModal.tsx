import React from 'react';
import { X, Award, ShieldCheck, Download, Printer } from 'lucide-react';
import { DonationRecord } from '../../types';
import { BloodGroupBadge } from './BloodGroupBadge';

interface CertificateModalProps {
  record: DonationRecord | null;
  onClose: () => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({ record, onClose }) => {
  if (!record) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        id="donation-certificate-modal"
        className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-[#E5E7EB] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E5E7EB] flex items-center justify-between bg-[#F8FAFC]">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            <h3 className="text-base font-bold text-[#111827]">
              National Blood Donor Recognition Certificate
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Certificate Canvas */}
        <div className="p-8 bg-[#FDFEFE] space-y-6 print:p-0">
          
          {/* Official Frame */}
          <div className="border-4 border-double border-slate-300 rounded-3xl p-6 sm:p-8 bg-white relative space-y-6 shadow-sm">
            
            {/* Top Seal */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-red-600 text-white flex items-center justify-center font-black text-xl">
                  BL
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-500 tracking-wider uppercase">
                    Ministry of Health & Family Welfare
                  </div>
                  <div className="text-base font-black text-slate-900">
                    BLOODLINK 8 NATIONAL APEX NETWORK
                  </div>
                </div>
              </div>
              <BloodGroupBadge group={record.bloodGroup} size="lg" />
            </div>

            {/* Certificate Body */}
            <div className="text-center space-y-3">
              <div className="text-xs uppercase tracking-widest text-slate-500 font-bold">
                Certificate of Emergency Transfusion Honor
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif font-black text-slate-900 tracking-tight">
                {record.donorName}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                has willingly donated <span className="font-bold text-slate-900">{record.unitsDonated} unit(s)</span> of life-saving blood (<span className="font-bold text-red-600">{record.bloodGroup}</span>) in response to an emergency hospital broadcast at:
              </p>
              <div className="font-bold text-slate-800 text-sm">
                {record.hospitalName} • {record.department}
              </div>
            </div>

            {/* Meta Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Certificate No</span>
                <span className="font-mono font-bold text-slate-800">{record.certificateNumber}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Date & Time</span>
                <span className="font-medium text-slate-800">{record.date}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Attending Doctor</span>
                <span className="font-medium text-slate-800">{record.doctorName}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Recipient Reg</span>
                <span className="font-mono font-bold text-slate-800">{record.recipientPatientId}</span>
              </div>
            </div>

            {/* Verification Hash & Signature */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200 text-xs">
              <div className="flex items-center gap-2 text-emerald-700 font-semibold">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <div>
                  <div className="text-[11px] font-bold">NABH & WHO Validated</div>
                  <div className="text-[9px] font-mono text-slate-400 truncate max-w-[200px]">
                    Hash: {record.verificationHash}
                  </div>
                </div>
              </div>

              <div className="text-center sm:text-right">
                <div className="font-serif italic text-slate-700 text-sm font-bold">
                  Dr. Rajeshwar Sharma
                </div>
                <div className="text-[10px] text-slate-500">
                  Apex Medical Superintendent
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 bg-[#F8FAFC] border-t border-[#E5E7EB] flex items-center justify-end gap-3 print:hidden">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-[#E5E7EB] hover:bg-slate-100 text-xs font-semibold text-[#111827] transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Print Certificate</span>
          </button>
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>Download PDF</span>
          </button>
        </div>

      </div>
    </div>
  );
};
