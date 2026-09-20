import React, { useState } from 'react';
import { CommandCenterProvider, useCommandCenter } from './context/CommandCenterContext';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { NotificationDrawer } from './components/common/NotificationDrawer';
import { CrossDeviceSyncModal } from './components/common/CrossDeviceSyncModal';
import { DonorMobileCompanionModal } from './components/common/DonorMobileCompanionModal';
import { ArchitectureDocsModal } from './components/common/ArchitectureDocsModal';
import { CertificateModal } from './components/common/CertificateModal';
import { MobileBottomNav } from './components/common/MobileBottomNav';
import { HackathonDemoBar } from './components/common/HackathonDemoBar';

// 10 Dashboard Pages
import { LoginPage } from './components/pages/LoginPage';
import { DashboardHome } from './components/pages/DashboardHome';
import { CreateEmergencySOS } from './components/pages/CreateEmergencySOS';
import { LiveRequestsPage } from './components/pages/LiveRequestsPage';
import { DonorResponseCenter } from './components/pages/DonorResponseCenter';
import { LiveMapPage } from './components/pages/LiveMapPage';
import { BloodInventoryPage } from './components/pages/BloodInventoryPage';
import { DonationHistoryPage } from './components/pages/DonationHistoryPage';
import { AnalyticsPage } from './components/pages/AnalyticsPage';
import { HospitalProfilePage } from './components/pages/HospitalProfilePage';

const CommandCenterLayout: React.FC = () => {
  const { 
    isAuthenticated, 
    isVerifiedHospital,
    activePage, 
    isSyncModalOpen, 
    setIsSyncModalOpen,
    isCompanionModalOpen,
    setIsCompanionModalOpen,
    viewingCertificate,
    setViewingCertificate,
    dbError,
    clearError
  } = useCommandCenter();

  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState(false);
  const [isDocsModalOpen, setIsDocsModalOpen] = useState(false);

  // If not signed in to the emergency hospital terminal, show official login screen
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // Protected middleware: only verified hospitals can access command center
  if (!isVerifiedHospital) {
    return (
      <div className="min-h-screen bg-[#FFFFFF] flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-white rounded-[28px] p-8 border border-red-200 shadow-xl space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-red-100 text-[#D92D20] mx-auto flex items-center justify-center font-bold text-2xl">
            🔒
          </div>
          <h2 className="text-xl font-bold text-[#101828]">Hospital Verification Pending</h2>
          <p className="text-xs text-[#667085] leading-relaxed">
            Access to BloodLink 8 Hospital Command Terminal is restricted to accredited emergency care centers with verified NABH or State Blood Transfusion Council license numbers.
          </p>
          <div className="pt-2">
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 rounded-xl bg-[#101828] text-white text-xs font-bold"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render current active page
  const renderCurrentPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <DashboardHome />;
      case 'create-sos':
        return <CreateEmergencySOS />;
      case 'live-requests':
        return <LiveRequestsPage />;
      case 'donor-center':
        return <DonorResponseCenter />;
      case 'live-map':
        return <LiveMapPage />;
      case 'inventory':
        return <BloodInventoryPage />;
      case 'donation-history':
        return <DonationHistoryPage />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'hospital-profile':
        return <HospitalProfilePage />;
      default:
        return <DashboardHome />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#111827] flex flex-col font-sans selection:bg-red-500 selection:text-white">
      
      {/* Sticky Header with Hospital Identity, Live Clock, Status & Actions */}
      <Header 
        onToggleNotificationDrawer={() => setIsNotificationDrawerOpen(prev => !prev)}
        onOpenDocs={() => setIsDocsModalOpen(true)}
      />

      {/* Main Command Center Shell: Sidebar + Active Page Canvas */}
      <div className="flex-1 flex max-w-[1600px] w-full mx-auto">
        {/* Navigation Sidebar */}
        <Sidebar onOpenDocs={() => setIsDocsModalOpen(true)} />

        {/* Dynamic Page Content Canvas with standard responsive padding and mobile bottom clearance */}
        <main className="flex-1 p-3.5 sm:p-5 md:p-6 lg:p-8 overflow-y-auto pb-36 md:pb-8 max-w-full overflow-x-hidden">
          {dbError && (
            <div className="mb-4 p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs font-semibold text-amber-800 flex items-center justify-between">
              <span>{dbError}</span>
              <button onClick={clearError} className="px-2 py-0.5 rounded-lg bg-amber-200 text-amber-900 text-[10px]">
                Dismiss
              </button>
            </div>
          )}
          {renderCurrentPage()}
        </main>
      </div>

      {/* Global Real-time Operational Drawers & Modals */}
      <NotificationDrawer 
        isOpen={isNotificationDrawerOpen} 
        onClose={() => setIsNotificationDrawerOpen(false)} 
      />

      <CrossDeviceSyncModal />

      <DonorMobileCompanionModal />

      {isDocsModalOpen && (
        <ArchitectureDocsModal
          onClose={() => setIsDocsModalOpen(false)}
        />
      )}

      {viewingCertificate && (
        <CertificateModal
          record={viewingCertificate}
          onClose={() => setViewingCertificate(null)}
        />
      )}

      {/* Mobile Touch-Friendly Bottom Navigation */}
      <MobileBottomNav />

      {/* Interactive 90s Hackathon Emergency Simulator */}
      <HackathonDemoBar />

    </div>
  );
};

export default function App() {
  return (
    <CommandCenterProvider>
      <CommandCenterLayout />
    </CommandCenterProvider>
  );
}
