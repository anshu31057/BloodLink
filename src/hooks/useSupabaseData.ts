// ============================================================================
// BLOODLINK 8 — REACT QUERY + SUPABASE REALTIME HOOKS
// "8 Blood Groups. One Lifeline."
// ============================================================================

import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabaseClient } from '../services/supabaseClient';
import { 
  fetchBloodRequests, 
  insertBloodRequest, 
  fetchDonorResponses, 
  fetchBloodInventory, 
  mutateInventoryStock,
  fetchDonorLocations,
  DonorLocationHeartbeat
} from '../services/supabaseQueries';
import { EmergencyRequest, Donor, BloodInventoryItem, BloodGroup } from '../types';

/**
 * 1. React Query Hook for blood_requests with Supabase Realtime subscription
 */
export function useBloodRequests(hospitalId?: string, initialData?: EmergencyRequest[]) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['blood_requests', hospitalId || 'all'],
    queryFn: async () => {
      const dbData = await fetchBloodRequests(hospitalId);
      if (dbData && dbData.length > 0) return dbData;
      return initialData || [];
    },
    initialData: initialData,
    staleTime: 1000 * 30, // 30s
    refetchOnWindowFocus: false
  });

  // Realtime subscription to `blood_requests` table
  useEffect(() => {
    const unsubscribe = supabaseClient.subscribeToTable<EmergencyRequest>(
      'blood_requests',
      null,
      {
        onInsert: (newReq) => {
          queryClient.setQueryData<EmergencyRequest[]>(
            ['blood_requests', hospitalId || 'all'],
            (old) => {
              if (!old) return [newReq];
              if (old.some(r => r.id === newReq.id)) return old;
              return [newReq, ...old];
            }
          );
        },
        onUpdate: (updatedReq) => {
          queryClient.setQueryData<EmergencyRequest[]>(
            ['blood_requests', hospitalId || 'all'],
            (old) => {
              if (!old) return [updatedReq];
              return old.map(r => r.id === updatedReq.id ? { ...r, ...updatedReq } : r);
            }
          );
        },
        onDelete: (oldReq) => {
          queryClient.setQueryData<EmergencyRequest[]>(
            ['blood_requests', hospitalId || 'all'],
            (old) => (old ? old.filter(r => r.id !== oldReq.id) : [])
          );
        }
      }
    );

    return () => unsubscribe();
  }, [queryClient, hospitalId]);

  return query;
}

/**
 * 2. Mutation Hook to Create SOS with Optimistic Update
 */
export function useCreateSosMutation(hospitalId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sosData: Partial<EmergencyRequest>) => {
      return await insertBloodRequest(sosData, hospitalId);
    },
    onMutate: async (newSos) => {
      await queryClient.cancelQueries({ queryKey: ['blood_requests', hospitalId] });
      const previous = queryClient.getQueryData<EmergencyRequest[]>(['blood_requests', hospitalId]);

      // Optimistic record
      const optimisticReq: EmergencyRequest = {
        id: `REQ-${Math.floor(1000 + Math.random() * 9000)}`,
        hospitalName: newSos.hospitalName || 'Verified Emergency Network Node',
        hospitalAddress: newSos.hospitalAddress || 'Panipat Regional Command',
        department: newSos.department || 'Trauma Resuscitation Unit',
        doctorName: newSos.doctorName || 'Attending Surgeon',
        doctorContact: newSos.doctorContact || '+91 180 265 8888',
        bloodGroup: newSos.bloodGroup || 'O-',
        unitsRequired: newSos.unitsRequired || 2,
        unitsFulfilled: 0,
        emergencyType: newSos.emergencyType || 'Acute Emergency Transfusion',
        emergencyCategory: newSos.emergencyCategory || 'Mass Casualty / Trauma',
        priority: newSos.priority || 'CODE_RED',
        patientAge: newSos.patientAge || 32,
        patientGender: newSos.patientGender || 'Male',
        patientCondition: newSos.patientCondition || 'Clinical trauma',
        clinicalNotes: newSos.clinicalNotes || '',
        locationWard: newSos.locationWard || 'Trauma Resuscitation OT',
        broadcastRadiusKm: newSos.broadcastRadiusKm || 10,
        expectedResponseMinutes: newSos.expectedResponseMinutes || 20,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        status: 'BROADCASTING',
        acceptedDonorsCount: 0,
        notifiedDonorsCount: 386,
        latitude: newSos.latitude || 29.3909,
        longitude: newSos.longitude || 76.9635
      };

      queryClient.setQueryData<EmergencyRequest[]>(
        ['blood_requests', hospitalId],
        (old) => [optimisticReq, ...(old || [])]
      );

      return { previous };
    },
    onError: (_err, _newSos, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['blood_requests', hospitalId], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['blood_requests'] });
    }
  });
}

/**
 * 3. React Query Hook for donor_response with Supabase Realtime subscriptions
 * Shows live donor cards instantly without refresh!
 */
export function useDonorResponses(requestId?: string, initialData?: Donor[]) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['donar_response', requestId || 'all'],
    queryFn: async () => {
      const dbDonors = await fetchDonorResponses(requestId);
      if (dbDonors && dbDonors.length > 0) return dbDonors;
      return initialData || [];
    },
    initialData: initialData,
    staleTime: 1000 * 15,
    refetchOnWindowFocus: false
  });

  // Supabase Realtime listener on `donor_response` table
  useEffect(() => {
    const unsubscribe = supabaseClient.subscribeToTable<Donor>(
      'donor_response',
      null,
      {
        onInsert: (newDonor) => {
          queryClient.setQueryData<Donor[]>(
            ['donar_response', requestId || 'all'],
            (old) => {
              if (!old) return [newDonor];
              if (old.some(d => d.id === newDonor.id)) return old;
              return [newDonor, ...old];
            }
          );
        },
        onUpdate: (updatedDonor) => {
          queryClient.setQueryData<Donor[]>(
            ['donar_response', requestId || 'all'],
            (old) => {
              if (!old) return [updatedDonor];
              return old.map(d => d.id === updatedDonor.id ? { ...d, ...updatedDonor } : d);
            }
          );
        },
        onDelete: (oldDonor) => {
          queryClient.setQueryData<Donor[]>(
            ['donar_response', requestId || 'all'],
            (old) => (old ? old.filter(d => d.id !== oldDonor.id) : [])
          );
        }
      }
    );

    return () => unsubscribe();
  }, [queryClient, requestId]);

  return query;
}

/**
 * 4. React Query Hook for blood_inventory with Realtime updates
 */
export function useBloodInventory(hospitalId?: string, initialData?: BloodInventoryItem[]) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['blood_inventory', hospitalId || 'all'],
    queryFn: async () => {
      const dbItems = await fetchBloodInventory(hospitalId);
      if (dbItems && dbItems.length > 0) return dbItems;
      return initialData || [];
    },
    initialData: initialData,
    staleTime: 1000 * 60,
    refetchOnWindowFocus: false
  });

  // Realtime subscription on `blood_inventory`
  useEffect(() => {
    const unsubscribe = supabaseClient.subscribeToTable<BloodInventoryItem>(
      'blood_inventory',
      null,
      {
        onUpdate: (updatedItem) => {
          queryClient.setQueryData<BloodInventoryItem[]>(
            ['blood_inventory', hospitalId || 'all'],
            (old) => {
              if (!old) return [updatedItem];
              return old.map(i => i.bloodGroup === updatedItem.bloodGroup ? { ...i, ...updatedItem } : i);
            }
          );
        },
        onInsert: (newItem) => {
          queryClient.setQueryData<BloodInventoryItem[]>(
            ['blood_inventory', hospitalId || 'all'],
            (old) => old ? [...old, newItem] : [newItem]
          );
        }
      }
    );

    return () => unsubscribe();
  }, [queryClient, hospitalId]);

  return query;
}

/**
 * 5. Mutation for Blood Inventory Stock Delta with Optimistic UI
 */
export function useMutateInventoryMutation(hospitalId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ bloodGroup, delta, currentUnits }: { bloodGroup: BloodGroup; delta: number; currentUnits: number }) => {
      return await mutateInventoryStock(hospitalId, bloodGroup, delta, currentUnits);
    },
    onMutate: async ({ bloodGroup, delta }) => {
      await queryClient.cancelQueries({ queryKey: ['blood_inventory', hospitalId] });
      const previous = queryClient.getQueryData<BloodInventoryItem[]>(['blood_inventory', hospitalId]);

      queryClient.setQueryData<BloodInventoryItem[]>(
        ['blood_inventory', hospitalId],
        (old) => {
          if (!old) return [];
          return old.map(item => {
            if (item.bloodGroup === bloodGroup) {
              const newAvailable = Math.max(0, item.availableUnits + delta);
              return {
                ...item,
                availableUnits: newAvailable,
                lowStockAlert: newAvailable <= item.criticalThreshold,
                lastUpdated: 'Live sync'
              };
            }
            return item;
          });
        }
      );

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['blood_inventory', hospitalId], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['blood_inventory', hospitalId] });
    }
  });
}

/**
 * 6. React Query Hook for donor_locations table on Live Radar Map
 */
export function useDonorLocations(activeDonors?: Donor[]) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['donor_locations'],
    queryFn: async () => {
      const locations = await fetchDonorLocations();
      if (locations && locations.length > 0) return locations;
      // Default to active donors coordinates
      return (activeDonors || []).map(d => ({
        donor_id: d.id,
        latitude: d.latitude,
        longitude: d.longitude,
        last_updated: new Date().toISOString()
      }));
    },
    refetchInterval: 15000, // 15s GPS heartbeat
    refetchOnWindowFocus: false
  });

  // Realtime subscription on `donor_locations`
  useEffect(() => {
    const unsubscribe = supabaseClient.subscribeToTable<DonorLocationHeartbeat>(
      'donor_locations',
      null,
      {
        onUpdate: (location) => {
          queryClient.setQueryData<DonorLocationHeartbeat[]>(
            ['donor_locations'],
            (old) => {
              if (!old) return [location];
              const exists = old.some(l => l.donor_id === location.donor_id);
              if (exists) {
                return old.map(l => l.donor_id === location.donor_id ? { ...l, ...location } : l);
              }
              return [...old, location];
            }
          );
        },
        onInsert: (location) => {
          queryClient.setQueryData<DonorLocationHeartbeat[]>(
            ['donor_locations'],
            (old) => old ? [...old, location] : [location]
          );
        }
      }
    );

    return () => unsubscribe();
  }, [queryClient]);

  return query;
}
