import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  fetchBloodInventory,
  fetchBloodRequests,
  fetchDonorResponses
} from "../services/supabaseQueries";
import { 
  EmergencyRequest, 
  Donor, 
  BloodInventoryItem, 
  ActivityEvent, 
  DonationRecord, 
  HospitalProfile, 
  BloodGroup, 
  DonorStatus,
  CrossDeviceSyncMessage
} from '../types';
import { requestService } from "../services/requestService";
import { 
  INITIAL_HOSPITAL, 
  INITIAL_REQUESTS, 
  INITIAL_DONORS, 
  INITIAL_INVENTORY, 
  INITIAL_ACTIVITIES, 
  INITIAL_HISTORY 
} from '../data/mockData';
import { authService, AuthSession } from '../services/authService';
import { 
  useBloodRequests, 
  useDonorResponses, 
  useBloodInventory, 
  useCreateSosMutation, 
  useMutateInventoryMutation,
  useDonorLocations
} from '../hooks/useSupabaseData';
import { supabaseClient } from '../services/supabaseClient';
// Realtime channel name
const BROADCAST_CHANNEL_NAME = "blood_requests_realtime";
interface CommandCenterContextType {
  hospital: HospitalProfile;
  requests: EmergencyRequest[];
  donors: Donor[];
  inventory: BloodInventoryItem[];
  activities: ActivityEvent[];
  history: DonationRecord[];
  activePage: string;
  setActivePage: (page: string) => void;
  isAuthenticated: boolean;
  isVerifiedHospital: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  
  // Real-time actions
  broadcastSOS: (
  sosData: Partial<EmergencyRequest>,
  hospitalId?: string
) => Promise<string>;
fulfillSOS: (requestId: string) => Promise<boolean>;
  updateDonorStatus: (donorId: string, status: DonorStatus, newEta?: number) => void;
  confirmDonorArrival: (donorId: string) => void;
  closeRequest: (requestId: string) => void;
  cancelRequest: (requestId: string) => void;
  updateInventory: (bloodGroup: BloodGroup, delta: number) => void;
  triggerEmergencySound: () => void;
  playChime: () => void;
  updateHospitalProfile: (updates: Partial<HospitalProfile>) => void;
  
  // Multi-device and simulated companion
  deviceId: string;
  pairingCode: string;
  connectedDevicesCount: number;
  isCompanionModalOpen: boolean;
  setIsCompanionModalOpen: (open: boolean) => void;
  isSyncModalOpen: boolean;
  setIsSyncModalOpen: (open: boolean) => void;
  previewNotificationModalData: EmergencyRequest | null;
  setPreviewNotificationModalData: (req: EmergencyRequest | null) => void;
  viewingCertificate: DonationRecord | null;
  setViewingCertificate: (rec: DonationRecord | null) => void;
  
  // Quick filters / selected request
  selectedRequestId: string | null;
  setSelectedRequestId: (id: string | null) => void;

  // Loading & Error states
  isSosCreating: boolean;
  isRequestsLoading: boolean;
  isDonorsLoading: boolean;
  isInventoryLoading: boolean;
  dbError: string | null;
  clearError: () => void;
dashboardStats: {
  activeSOS: number;
  donorsEnRoute: number;
  inventoryUnits: number;
  transfusionsToday: number;
  criticalUnits: number;
};
}
fetchDashboardStats: () => Promise<void>;
const CommandCenterContext = createContext<CommandCenterContextType | null>(null);

export const CommandCenterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hospital, setHospital] = useState<HospitalProfile>(INITIAL_HOSPITAL);
  const updateHospitalProfile = (updates: Partial<HospitalProfile>) => {
    setHospital(prev => ({ ...prev, ...updates }));
  };

  // Auth State
  const [authSession, setAuthSession] = useState<AuthSession | null>(() => authService.getSession());
  const isAuthenticated = Boolean(authSession);
  const isVerifiedHospital = Boolean(authSession?.verifiedHospital !== false);

  const [activePage, setActivePage] = useState<string>('dashboard');
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>('REQ-2026-0891');
  const [dbError, setDbError] = useState<string | null>(null);
const [dashboardStats, setDashboardStats] = useState({
  activeSOS: 0,
  donorsEnRoute: 0,
  inventoryUnits: 0,
  transfusionsToday: 0,
  criticalUnits: 0,
});
  // Initial local states as seed
  const [localRequests] = useState<EmergencyRequest[]>(() => {
    const saved = localStorage.getItem('bl_requests');
    return saved ? JSON.parse(saved) : INITIAL_REQUESTS;
  });

  const [localDonors] = useState<Donor[]>(() => {
    const saved = localStorage.getItem('bl_donors');
    return saved ? JSON.parse(saved) : INITIAL_DONORS;
  });

  const [localInventory] = useState<BloodInventoryItem[]>(() => {
    const saved = localStorage.getItem('bl_inventory');
    return saved ? JSON.parse(saved) : INITIAL_INVENTORY;
  });

  // React Query + Supabase Subscriptions
const hospitalId = authService.getSession()?.userId ?? "";

const requestsQuery = useBloodRequests(hospitalId, localRequests);
const inventoryQuery = useBloodInventory(hospitalId, localInventory);

const donorsQuery = useDonorResponses(
  selectedRequestId || undefined,
  localDonors
);



const createSosMutation = useCreateSosMutation(hospitalId);

const mutateInventoryMutation = useMutateInventoryMutation(hospitalId);

  // Merged live data
  const requests = requestsQuery.data || localRequests;
  const donors = donorsQuery.data || localDonors;
  const inventory = inventoryQuery.data || localInventory;

  const [activities, setActivities] = useState<ActivityEvent[]>(() => {
    const saved = localStorage.getItem('bl_activities');
    return saved ? JSON.parse(saved) : INITIAL_ACTIVITIES;
  });

  const [history, setHistory] = useState<DonationRecord[]>(() => {
    const saved = localStorage.getItem('bl_history');
    return saved ? JSON.parse(saved) : INITIAL_HISTORY;
  });

  // Modals
  const [isCompanionModalOpen, setIsCompanionModalOpen] = useState<boolean>(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState<boolean>(false);
  const [previewNotificationModalData, setPreviewNotificationModalData] = useState<EmergencyRequest | null>(null);
  const [viewingCertificate, setViewingCertificate] = useState<DonationRecord | null>(null);

  // Cross-device pairing
  const [deviceId] = useState<string>(() => {
    const saved = sessionStorage.getItem('bl_device_id');
    if (saved) return saved;
    const newId = 'TERM-' + Math.random().toString(36).substring(2, 7).toUpperCase();
    sessionStorage.setItem('bl_device_id', newId);
    return newId;
  });
  const [pairingCode] = useState<string>('BL8-NODE-8801');
  const [connectedDevicesCount, setConnectedDevicesCount] = useState<number>(3);

  // Audio Chime
  const triggerEmergencySound = useCallback(() => {
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      
      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(880, now); // A5
      osc1.frequency.setValueAtTime(1174.66, now + 0.12); // D6
      
      gain1.gain.setValueAtTime(0, now);
      gain1.gain.linearRampToValueAtTime(0.18, now + 0.02);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc1.connect(gain1);
      gain1.connect(ctx.destination);

      osc1.start(now);
      osc1.stop(now + 0.36);
    } catch {
      // Audio context might be restricted
    }
  }, []);
const fetchDashboardStats = async () => {
  const hospitalId = authService.getSession()?.userId;
const BROADCAST_CHANNEL_NAME = "bloodlink_emergency_channel";
  if (!hospitalId) return;

  const requests = await fetchBloodRequests(hospitalId);
  const inventory = await fetchBloodInventory(hospitalId);
  const responses = await fetchDonorResponses();

  const activeSOS = requests.filter((r) =>
  ["BROADCASTING", "ACCEPTED", "DONORS_DISPATCHED"].includes(r.status)
).length;

  const donorsEnRoute = responses.filter(
    (d) => d.status === "EN_ROUTE"
  ).length;

  const inventoryUnits = inventory.reduce(
    (sum, item) => sum + item.availableUnits,
    0
  );

 const criticalUnits = inventory.filter((i) => i.lowStockAlert).length;

  const today = new Date().toISOString().slice(0, 10);

  const transfusionsToday = requests.filter(
    (r) =>
      r.status === "FULFILLED" &&
      r.createdAt.startsWith(today)
  ).length;

  setDashboardStats({
    activeSOS,
    donorsEnRoute,
    inventoryUnits,
    transfusionsToday,
    criticalUnits,
  });
};
  // Sync to local storage
  useEffect(() => {
    if (requests.length) localStorage.setItem('bl_requests', JSON.stringify(requests));
  }, [requests]);

  useEffect(() => {
    if (donors.length) localStorage.setItem('bl_donors', JSON.stringify(donors));
  }, [donors]);

  useEffect(() => {
    if (inventory.length) localStorage.setItem('bl_inventory', JSON.stringify(inventory));
  }, [inventory]);
  useEffect(() => {
  fetchDashboardStats();
}, []);
  // ============================================================================
// BLOOD REQUESTS REALTIME SUBSCRIPTION
// ============================================================================

useEffect(() => {
  // Initial fetch
  requestsQuery.refetch();

  // Realtime listener
  const unsubscribe = supabaseClient.subscribeToTable(
    "blood_requests",
    null,
    {
      onInsert: async () => {
  console.log("🩸 New SOS Received");
  await requestsQuery.refetch();
  fetchDashboardStats();
},

onUpdate: async () => {
  console.log("🟢 SOS Updated");
  await requestsQuery.refetch();
  fetchDashboardStats();
},

onDelete: async () => {
  console.log("❌ SOS Deleted");
  await requestsQuery.refetch();
  fetchDashboardStats();
},
    }
  );

  return () => unsubscribe();
}, [requestsQuery]);



  useEffect(() => {
    localStorage.setItem('bl_activities', JSON.stringify(activities));
  }, [activities]);

  useEffect(() => {
    localStorage.setItem('bl_history', JSON.stringify(history));
  }, [history]);

  // Setup BroadcastChannel for cross-device & cross-tab synchronization
  useEffect(() => {
    if (typeof BroadcastChannel === 'undefined') return;
    const channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);

    channel.onmessage = (event: MessageEvent<CrossDeviceSyncMessage>) => {
      const msg = event.data;
      if (!msg || msg.originDeviceId === deviceId) return;

      if (msg.type === 'SOS_BROADCAST') {
        const newReq = msg.payload as EmergencyRequest;
        supabaseClient.notifyChannel('blood_requests', 'INSERT', newReq);
        setActivities(prev => [
          {
            id: 'ACT-' + Date.now(),
            timestamp: 'Just now',
            type: 'SOS_CREATED',
            title: `Broadcast Remote SOS #${newReq.id.slice(-4)}`,
            description: `${newReq.department} requested ${newReq.unitsRequired} Units of ${newReq.bloodGroup}`,
            bloodGroup: newReq.bloodGroup,
            requestId: newReq.id,
            priority: newReq.priority
          },
          ...prev
        ]);
        triggerEmergencySound();
      } else if (msg.type === 'DONOR_STATUS_UPDATE') {
        const { donorId, status, eta } = msg.payload;
        supabaseClient.notifyChannel('donor_response', 'UPDATE', {
          id: donorId,
          status,
          etaMinutes: eta
        });
      } else if (msg.type === 'SYNC_PING') {
        setConnectedDevicesCount(prev => Math.min(prev + 1, 9));
      }
    };

    channel.postMessage({
      type: 'SYNC_PING',
      payload: { deviceId },
      originDeviceId: deviceId,
      timestamp: Date.now()
    });

    return () => {
      channel.close();
    };
  }, [deviceId, triggerEmergencySound]);

  // Broadcast helper
  const broadcastMeshMessage = (type: CrossDeviceSyncMessage['type'], payload: any) => {
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        const channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
        channel.postMessage({
          type,
          payload,
          originDeviceId: deviceId,
          timestamp: Date.now()
        });
        channel.close();
      } catch (err) {
        console.warn('BroadcastChannel error', err);
      }
    }
  };

  // Broadcast SOS connected to blood_requests table
  const broadcastSOS = async (
  sosData: Partial<EmergencyRequest>,
  hospitalId?: string
): Promise<string> => {
// ============================================================================
// CLOSE / FULFILL SOS (REALTIME)
// ============================================================================

  const session = authService.getSession();

  const currentHospitalId = hospitalId || session?.userId;

  if (!currentHospitalId) {
    throw new Error("Hospital session expired. Please login again.");
  }

  const result = await requestService.createEmergencyRequest(
    sosData,
    currentHospitalId
  );

  if (!result.success || !result.request) {
    throw new Error(result.error || "SOS Broadcast Failed");
  }
const request = result.request!;

// Refresh from Supabase
await requestsQuery.refetch();

setActivities((prev) => [
  {
    id: "ACT-" + Date.now(),
    timestamp: "Just now",
    type: "SOS_CREATED",
    title: `Broadcast ${request.priority.replace("_", " ")} SOS`,
    description: `${request.unitsRequired} units of ${request.bloodGroup} requested.`,
    bloodGroup: request.bloodGroup,
    requestId: request.id,
    priority: request.priority,
  },
  ...prev,
]);

triggerEmergencySound();

// Broadcast to other tabs/devices
broadcastMeshMessage("SOS_BROADCAST", request);

return request.id;};

  const updateDonorStatus = (donorId: string, status: DonorStatus, newEta?: number) => {
    supabaseClient.notifyChannel('donor_response', 'UPDATE', {
      id: donorId,
      status,
      etaMinutes: newEta !== undefined ? newEta : (status === 'ARRIVED_TRIAGE' ? 0 : undefined),
      statusUpdatedMinutesAgo: 0
    });

    broadcastMeshMessage('DONOR_STATUS_UPDATE', { donorId, status, eta: newEta });
  };



  const confirmDonorArrival = (donorId: string) => {
    const target = donors.find(d => d.id === donorId);
    if (!target) return;

    updateDonorStatus(donorId, 'ARRIVED_TRIAGE', 0);
    setActivities(prev => [
      {
        id: 'ACT-' + Date.now(),
        timestamp: 'Just now',
        type: 'DONOR_ARRIVED',
        title: `${target.name} Arrived at Emergency Bay`,
        description: `Triage verified for ${target.bloodGroup} donation for SOS #${target.requestId.slice(-4)}. Ready for transfusion phlebotomy.`,
        bloodGroup: target.bloodGroup,
        requestId: target.requestId
      },
      ...prev
    ]);
    triggerEmergencySound();
  };

  const closeRequest = (requestId: string) => {
    const req = requests.find(r => r.id === requestId);
    if (!req) return;

    supabaseClient.notifyChannel('blood_requests', 'UPDATE', {
      id: requestId,
      status: 'FULFILLED'
    });
    const newRecord: DonationRecord = {
      id: `DON-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      certificateNumber: `BL-CERT-2026-DEL-${Math.floor(1000 + Math.random() * 9000)}`,
      donorName: 'Verified Emergency Responders',
      donorId: 'DNR-EMERG-POOL',
      bloodGroup: req.bloodGroup,
      unitsDonated: req.unitsRequired,
      hospitalName: hospital.name,
      department: req.department,
      doctorName: req.doctorName,
      recipientPatientId: `PAT-EMERG-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString().replace('T', ' ').slice(0, 16),
      verificationHash: '0x' + Math.random().toString(16).substring(2, 18).toUpperCase()
    };
    setHistory(prev => [newRecord, ...prev]);

    setActivities(prev => [
      {
        id: 'ACT-' + Date.now(),
        timestamp: 'Just now',
        type: 'DONATION_COMPLETED',
        title: `SOS #${requestId.slice(-4)} Fulfilled & Closed`,
        description: `All ${req.unitsRequired} units of ${req.bloodGroup} successfully collected and administered.`,
        bloodGroup: req.bloodGroup,
        requestId
      },
      ...prev
    ]);
  };

  const fulfillSOS = async (requestId: string): Promise<boolean> => {
    const success = await requestService.closeRequest(requestId);

    if (!success) {
      console.error("❌ Failed to fulfill SOS");
      return false;
    }

    await requestsQuery.refetch();
    await fetchDashboardStats();

    console.log("✅ SOS Fulfilled:", requestId);
    return true;
  };

  const cancelRequest = (requestId: string) => {
    supabaseClient.notifyChannel('blood_requests', 'UPDATE', {
      id: requestId,
      status: 'CANCELLED'
    });

    setActivities(prev => [
      {
        id: 'ACT-' + Date.now(),
        timestamp: 'Just now',
        type: 'REQUEST_CLOSED',
        title: `Emergency SOS #${requestId.slice(-4)} Stood Down`,
        description: `Request cancelled by attending medical officer. Standby donors released.`,
        requestId
      },
      ...prev
    ]);
  };

  const updateInventory = (bloodGroup: BloodGroup, delta: number) => {
    const currentItem = inventory.find(i => i.bloodGroup === bloodGroup);
    const currentUnits = currentItem ? currentItem.availableUnits : 4;
    
    // Mutate via React Query / Supabase
    mutateInventoryMutation.mutate({
      bloodGroup,
      delta,
      currentUnits
    });
  };

  const login = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    const res = await authService.hospitalLogin(email, pass);
    if (res.success && res.session) {
      setAuthSession(res.session);
      setActivePage('dashboard');
      return { success: true };
    }
    return { success: false, error: res.error || 'Authentication failed.' };
  };

  const logout = () => {
    authService.logout();
    setAuthSession(null);
    setActivePage('login');
  };

  return (
    <CommandCenterContext.Provider
      value={{
        hospital,
        requests,
        donors,
        inventory,
        activities,
        history,
        activePage,
        setActivePage,
        isAuthenticated,
        isVerifiedHospital,
        login,
        logout,
        broadcastSOS,
        fulfillSOS,
        updateDonorStatus,
        confirmDonorArrival,
        closeRequest,
        cancelRequest,
        updateInventory,
        triggerEmergencySound,
        playChime: triggerEmergencySound,
        updateHospitalProfile,
        deviceId,
        pairingCode,
        connectedDevicesCount,
        isCompanionModalOpen,
        setIsCompanionModalOpen,
        isSyncModalOpen,
        setIsSyncModalOpen,
        previewNotificationModalData,
        setPreviewNotificationModalData,
        viewingCertificate,
        setViewingCertificate,
        selectedRequestId,
        setSelectedRequestId,
        isSosCreating: createSosMutation.isPending,
        isRequestsLoading: requestsQuery.isLoading,
        isDonorsLoading: donorsQuery.isLoading,
        isInventoryLoading: inventoryQuery.isLoading,
        dbError,
        clearError: () => setDbError(null),
        dashboardStats,
      }}
    >
      {children}
    </CommandCenterContext.Provider>
  );
};

export const useCommandCenter = () => {
  const context = useContext(CommandCenterContext);
  if (!context) {
    throw new Error('useCommandCenter must be used within a CommandCenterProvider');
  }
  return context;
};
