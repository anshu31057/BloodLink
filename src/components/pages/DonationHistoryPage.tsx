import React, { useState } from 'react';
import { 
  History, 
  Search, 
  Download, 
  Award, 
  Calendar, 
  Filter, 
  Building2, 
  CheckCircle2, 
  FileText,
  Clock
} from 'lucide-react';
import { useCommandCenter } from '../../context/CommandCenterContext';
import { BloodGroupBadge } from '../common/BloodGroupBadge';
import { CertificateModal } from '../common/CertificateModal';
import { DonationRecord, BloodGroup } from '../../types';

export const DonationHistoryPage: React.FC = () => {
  const { history, setViewingCertificate, viewingCertificate } = useCommandCenter();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string>('ALL');

  const filteredHistory = history.filter((item) => {
    if (selectedGroup !== 'ALL' && item.bloodGroup !== selectedGroup) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        item.donorName.toLowerCase().includes(q) ||
        item.certificateNumber.toLowerCase().includes(q) ||
        item.department.toLowerCase().includes(q) ||
        item.doctorName.toLowerCase().includes(q) ||
        item.recipientPatientId.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleExportCSV = () => {
    const headers = ['Certificate No,Donor Name,Blood Group,Units,Department,Doctor,Date,Verification Hash\n'];
    const rows = filteredHistory.map(h => 
      `"${h.certificateNumber}","${h.donorName}","${h.bloodGroup}",${h.unitsDonated},"${h.department}","${h.doctorName}","${h.date}","${h.verificationHash}"\n`
    );
    const blob = new Blob([headers.concat(rows).join('')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bloodlink-donation-history-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  const bloodGroups = ['ALL', 'O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];

  return (
    <div id="donation-history-page" className="space-y-6 lg:space-y-8 animate-in fade-in duration-200">
      
      {/* Top Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-[#101828] tracking-tight">
              Emergency Donation History
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 font-bold text-xs font-mono tabular-nums">
              {history.length} Records
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#667085] mt-0.5">
            Cryptographically signed national donor transfusion ledger and accreditation registry.
          </p>
        </div>

        {/* Search & Export Controls */}
        <div className="flex items-center flex-wrap gap-2.5 w-full md:w-auto">
          {/* Search Bar - Expands full width on small screens */}
          <div className="relative flex-1 sm:w-64 sm:flex-initial">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search donor, cert #, ward..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-9 pr-3.5 rounded-xl bg-white border border-[#E5E7EB] text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#101828] shadow-2xs"
            />
          </div>

          {/* Export CSV Button (44px height) */}
          <button
            onClick={handleExportCSV}
            className="h-11 flex items-center gap-1.5 px-4 rounded-xl bg-white border border-[#E5E7EB] hover:bg-slate-50 text-xs font-semibold text-[#101828] transition-all shadow-xs shrink-0 whitespace-nowrap focus-visible:ring-2 focus-visible:ring-slate-900"
          >
            <Download className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
        {bloodGroups.map(bg => (
          <button
            key={bg}
            onClick={() => setSelectedGroup(bg)}
            className={`h-9 px-3.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap focus-visible:ring-2 focus-visible:ring-slate-900 ${
              selectedGroup === bg
                ? 'bg-[#101828] text-white shadow-xs'
                : 'bg-white border border-[#E5E7EB] text-slate-600 hover:text-[#101828] hover:bg-slate-50'
            }`}
          >
            {bg === 'ALL' ? 'All Blood Groups' : bg}
          </button>
        ))}
      </div>

      {/* Empty State */}
      {filteredHistory.length === 0 ? (
        <div className="bg-white border border-[#E5E7EB] rounded-[28px] p-12 text-center max-w-md mx-auto space-y-3 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto text-xl font-mono">
            📇
          </div>
          <h3 className="font-bold text-[#101828] text-sm">No Donation Records Found</h3>
          <p className="text-xs text-[#667085]">
            No verified transfusions match your active search and blood group filter.
          </p>
        </div>
      ) : (
        <>
          {/* MOBILE VIEW: Responsive Cards below 768px */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:hidden">
            {filteredHistory.map((rec) => (
              <div 
                key={rec.id}
                className="bg-white rounded-[24px] border border-[#E5E7EB] p-4 shadow-[0_2px_10px_rgba(0,0,0,0.02)] space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-sm text-[#101828]">{rec.donorName}</h4>
                      <span className="text-[11px] font-mono text-[#667085] tabular-nums">{rec.certificateNumber}</span>
                    </div>
                    <BloodGroupBadge group={rec.bloodGroup} size="sm" />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] p-2.5 rounded-xl bg-[#F8FAFC]">
                    <div>
                      <span className="text-slate-400 block font-semibold text-[10px] uppercase">Department</span>
                      <span className="font-medium text-slate-800">{rec.department}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-semibold text-[10px] uppercase">Units Donated</span>
                      <span className="font-mono font-bold text-[#101828] tabular-nums">{rec.unitsDonated} Unit{rec.unitsDonated > 1 ? 's' : ''}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-semibold text-[10px] uppercase">Doctor</span>
                      <span className="text-slate-700">{rec.doctorName}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-semibold text-[10px] uppercase">Date</span>
                      <span className="font-mono text-[#667085] tabular-nums">{rec.date}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setViewingCertificate(rec)}
                  className="w-full h-10 flex items-center justify-center gap-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs border border-blue-200 transition-all mt-auto"
                >
                  <Award className="w-3.5 h-3.5 text-blue-600" />
                  <span>View Official Certificate</span>
                </button>
              </div>
            ))}
          </div>

          {/* DESKTOP VIEW: Clean Table with Sticky Header */}
          <div className="hidden md:block rounded-[28px] bg-white border border-[#E5E7EB] shadow-[0_2px_12px_rgba(0,0,0,0.02)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="sticky top-0 z-10 border-b border-[#E5E7EB] bg-[#F8FAFC] text-[11px] font-bold text-[#667085] uppercase tracking-wider">
                    <th className="py-3.5 px-6">Certificate & Donor</th>
                    <th className="py-3.5 px-4">Blood Group</th>
                    <th className="py-3.5 px-4">Units</th>
                    <th className="py-3.5 px-4">Hospital Department</th>
                    <th className="py-3.5 px-4">Attending Doctor</th>
                    <th className="py-3.5 px-4">Date & Time</th>
                    <th className="py-3.5 px-6 text-right">Recognition</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]">
                  {filteredHistory.map((rec) => (
                    <tr 
                      key={rec.id}
                      className="hover:bg-[#F8FAFC] transition-colors group"
                    >
                      <td className="py-3.5 px-6">
                        <div className="font-bold text-[#101828] text-sm truncate max-w-[200px]">
                          {rec.donorName}
                        </div>
                        <div className="text-[11px] text-[#667085] font-mono tabular-nums">
                          {rec.certificateNumber}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <BloodGroupBadge group={rec.bloodGroup} size="sm" />
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-[#101828] tabular-nums">
                        {rec.unitsDonated} Unit{rec.unitsDonated > 1 ? 's' : ''}
                      </td>

                      <td className="py-3.5 px-4 text-[#101828] font-medium">
                        <div className="truncate max-w-[180px]">{rec.department}</div>
                        <div className="text-[10px] text-slate-400 font-mono tabular-nums">{rec.recipientPatientId}</div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-700 truncate max-w-[150px]">
                        {rec.doctorName}
                      </td>

                      <td className="py-3.5 px-4 text-[#667085] font-mono whitespace-nowrap tabular-nums">
                        {rec.date}
                      </td>

                      <td className="py-3.5 px-6 text-right">
                        <button
                          onClick={() => setViewingCertificate(rec)}
                          className="h-9 inline-flex items-center gap-1.5 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs transition-all border border-blue-200 shadow-xs focus-visible:ring-2 focus-visible:ring-blue-500 whitespace-nowrap"
                        >
                          <Award className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span>Certificate</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Certificate Viewer Modal */}
      {viewingCertificate && (
        <CertificateModal
          record={viewingCertificate}
          onClose={() => setViewingCertificate(null)}
        />
      )}

    </div>
  );
};
