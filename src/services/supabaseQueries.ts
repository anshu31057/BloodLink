// ============================================================================
// BLOODLINK 8 — SUPABASE DATA QUERIES (PRODUCTION VERSION)
// 8 Blood Groups. One Lifeline.
// ============================================================================

import { supabase, isLiveSupabaseConfigured } from "./supabaseClient";
import { authService } from "./authService";
import {
  EmergencyRequest,
  Donor,
  BloodInventoryItem,
  BloodGroup,
  HospitalProfile,
} from "../types";

// ============================================================================
// DONOR LOCATION TYPE
// ============================================================================

export interface DonorLocationHeartbeat {
  donor_id: string;
  latitude: number;
  longitude: number;
  last_updated: string;
  speed_kmh?: number;
  heading_deg?: number;
}

// ============================================================================
// HOSPITAL PROFILE
// ============================================================================

export async function fetchHospitalProfile(
  hospitalId?: string
): Promise<HospitalProfile | null> {
  if (!isLiveSupabaseConfigured) return null;

  try {
    const id = hospitalId || authService.getSession()?.userId;

    if (!id) return null;

    const { data, error } = await supabase
      .from("hospitals")
      .select("*")
      .eq("hospital_id", id)
      .single();

    if (error) throw error;

    return {
      id: data.hospital_id,
      name: data.name,
      code: `BL8-${data.city}`,
      type: "BloodLink Emergency Network Node",
      nabhLicense: data.license_number,
      licenseNumber: data.license_number,
      address: data.address,
      city: `${data.city}, ${data.state}`,
      latitude: data.latitude,
      longitude: data.longitude,
      emergencyHotline: data.emergency_hotline,
      emergencyPhone: data.phone,
      contactLandline: data.phone,
      bloodBankDesk: data.phone,
      bloodBankIncharge: data.blood_bank_incharge,
      directorName: "Medical Superintendent",
      activeStatus: data.verified
        ? "LEVEL_1_TRAUMA_READY"
        : "CAPACITY_WARNING",
      departments: [],
      accreditations: ["BloodLink Verified Hospital"],
      onCallDoctors: [],
      fcmRegisteredDevicesCount: 0,
    };
  } catch (err) {
    console.error("Hospital Profile Error:", err);
    return null;
  }
}

// ============================================================================
// BLOOD REQUESTS
// ============================================================================

export async function fetchBloodRequests(
  hospitalId?: string
): Promise<EmergencyRequest[]> {
  if (!isLiveSupabaseConfigured) return [];

  try {
    let query = supabase
      .from("blood_requests")
      .select(
        `
        *,
        hospitals(
          name,
          address,
          latitude,
          longitude,
          emergency_hotline
        )
      `
      )
      .order("created_at", { ascending: false });

    if (hospitalId) {
      query = query.eq("hospital_id", hospitalId);
    }

    const { data, error } = await query;

    if (error) throw error;

    return (data ?? []).map((row: any) => ({
      id: row.request_id,
      hospitalId: row.hospital_id,

      hospitalName: row.hospitals?.name ?? "Unknown Hospital",
      hospitalAddress: row.hospitals?.address ?? "",

      department: "Emergency Department",

      doctorName: row.doctor_name ?? "On Duty Doctor",
      doctorContact: row.doctor_contact ?? "",

      bloodGroup: row.blood_group,
      unitsRequired: row.units_required,
      unitsFulfilled: row.units_fulfilled ?? 0,

      emergencyType: "Emergency Blood Request",
      emergencyCategory: row.emergency_category ?? "Emergency",

      priority: row.priority,

      patientAge: row.patient_age ?? 0,
      patientGender: row.patient_gender ?? "Unknown",

      patientCondition: row.patient_condition ?? "",
      clinicalNotes: row.clinical_notes ?? "",

      locationWard: row.ward ?? "",

      broadcastRadiusKm: row.radius_km ?? 10,
      expectedResponseMinutes: row.expected_response_minutes ?? 20,

      createdAt: row.created_at,
      expiresAt: row.expires_at,

      status: row.status,

      acceptedDonorsCount: row.accepted_donors_count ?? 0,
      notifiedDonorsCount: row.notified_donors_count ?? 0,

      latitude: row.hospitals?.latitude ?? 29.3909,
      longitude: row.hospitals?.longitude ?? 76.9635,
    }));
  } catch (err) {
    console.error("fetchBloodRequests Error:", err);
    return [];
  }
}

// ============================================================================
// INSERT BLOOD REQUEST (SOS)
// ============================================================================

export async function insertBloodRequest(
  req: Partial<EmergencyRequest>,
  hospitalId: string
): Promise<EmergencyRequest> {
  if (!isLiveSupabaseConfigured)
    throw new Error("Supabase not configured.");

  const payload = {
    hospital_id: hospitalId,

    blood_group: req.bloodGroup,
    units_required: req.unitsRequired,
    units_fulfilled: 0,

    priority: req.priority,

    status: "BROADCASTING",

    emergency_category: req.emergencyCategory,

    doctor_name: req.doctorName,
    doctor_contact: req.doctorContact,

    patient_age: req.patientAge,
    patient_gender: req.patientGender,

    patient_condition: req.patientCondition,

    clinical_notes: req.clinicalNotes,

    ward: req.locationWard,

    radius_km: req.broadcastRadiusKm,

    expected_response_minutes: req.expectedResponseMinutes,

    expires_at:
      req.expiresAt ||
      new Date(Date.now() + 20 * 60 * 1000).toISOString(),
  };

  const { data, error } = await supabase
    .from("blood_requests")
    .insert(payload)
    .select(
      `
      *,
      hospitals(
        name,
        address,
        latitude,
        longitude
      )
    `
    )
    .single();

  if (error) {
    console.error("SOS Insert Error:", error);
    throw error;
  }

  return {
    id: data.request_id,
    hospitalId: data.hospital_id,

    hospitalName: data.hospitals?.name ?? "Unknown Hospital",
    hospitalAddress: data.hospitals?.address ?? "",

    department: "Emergency Department",

    doctorName: data.doctor_name,
    doctorContact: data.doctor_contact,

    bloodGroup: data.blood_group,

    unitsRequired: data.units_required,
    unitsFulfilled: data.units_fulfilled ?? 0,

    emergencyType: "Emergency Blood Request",
    emergencyCategory: data.emergency_category,

    priority: data.priority,

    patientAge: data.patient_age ?? 0,
    patientGender: data.patient_gender ?? "Unknown",

    patientCondition: data.patient_condition ?? "",
    clinicalNotes: data.clinical_notes ?? "",

    locationWard: data.ward ?? "",

    broadcastRadiusKm: data.radius_km ?? 10,
    expectedResponseMinutes: data.expected_response_minutes ?? 20,

    createdAt: data.created_at,
    expiresAt: data.expires_at,

    status: data.status,

    acceptedDonorsCount: data.accepted_donors_count ?? 0,
    notifiedDonorsCount: data.notified_donors_count ?? 0,

    latitude: data.hospitals?.latitude ?? 29.3909,
    longitude: data.hospitals?.longitude ?? 76.9635,
  };
}

// ============================================================================
// DONOR RESPONSES
// ============================================================================

export async function fetchDonorResponses(
  requestId?: string
): Promise<Donor[]> {
  if (!isLiveSupabaseConfigured) return [];

  try {
    let query = supabase
      .from("donor_response")
      .select(
        `
        *,
        donors(*)
      `
      )
      .order("created_at", { ascending: false });

    if (requestId) {
      query = query.eq("request_id", requestId);
    }

    const { data, error } = await query;

    if (error) throw error;

    return (data ?? []).map((row: any): Donor => ({
  id: row.donor_id,

  name: row.donors?.full_name ?? "Unknown Donor",
  bloodGroup: row.donors?.blood_group ?? "O+",

  phone: row.donors?.phone ?? "",

  latitude: row.donors?.latitude ?? 29.3909,
  longitude: row.donors?.longitude ?? 76.9635,

  distanceKm: row.distance_km ?? 0,
  etaMinutes: row.eta_minutes ?? 0,

  status: row.status ?? "AVAILABLE",

  createdAt: row.created_at,
}));
  } catch (err) {
    console.error("fetchDonorResponses Error:", err);
    return [];
  }
}

// ============================================================================
// BLOOD INVENTORY
// ============================================================================

export async function fetchBloodInventory(
  hospitalId?: string
): Promise<BloodInventoryItem[]> {
  if (!isLiveSupabaseConfigured) return [];

  const id = hospitalId || authService.getSession()?.userId;

  if (!id) return [];

  try {
    const { data, error } = await supabase
      .from("blood_inventory")
      .select("*")
      .eq("hospital_id", id)
      .order("blood_group");

    if (error) throw error;

    return (data ?? []).map((row: any): BloodInventoryItem => ({
  bloodGroup: row.blood_group,

  availableUnits: row.available_units ?? 0,
  reservedUnits: row.reserved_units ?? 0,

  criticalThreshold: row.critical_threshold ?? 5,
  lowStockAlert: row.available_units <= (row.critical_threshold ?? 5),

  lastUpdated: row.updated_at ?? row.created_at,
}));
  } catch (err) {
    console.error("fetchBloodInventory Error:", err);
    return [];
  }
}

// ============================================================================
// UPDATE INVENTORY STOCK
// ============================================================================

export async function mutateInventoryStock(
  hospitalId: string,
  bloodGroup: BloodGroup,
  delta: number,
  currentUnits: number
): Promise<number> {
  const newUnits = Math.max(0, currentUnits + delta);

  const { error } = await supabase
    .from("blood_inventory")
    .update({
      available_units: newUnits,
      updated_at: new Date().toISOString(),
    })
    .eq("hospital_id", hospitalId)
    .eq("blood_group", bloodGroup);

  if (error) throw error;

  return newUnits;
}

// ============================================================================
// LIVE DONOR LOCATIONS
// ============================================================================

export async function fetchDonorLocations(): Promise<
  DonorLocationHeartbeat[]
> {
  if (!isLiveSupabaseConfigured) return [];

  try {
    const { data, error } = await supabase
      .from("donors")
      .select(`
        donor_id,
        latitude,
        longitude,
        last_location
      `)
      .eq("availability", true);

    if (error) throw error;

    return (data ?? []).map((donor: any) => ({
      donor_id: donor.donor_id,
      latitude: donor.latitude,
      longitude: donor.longitude,
      last_updated:
        donor.last_location ?? new Date().toISOString(),
    }));
  } catch (err) {
    console.error("fetchDonorLocations Error:", err);
    return [];
  }
}
// ============================================================================
// DASHBOARD STATS
// ============================================================================

export interface DashboardStats {
  activeSOS: number;
  donorsEnRoute: number;
  inventoryUnits: number;
  transfusionsToday: number;
  criticalInventory: number;
}

export async function fetchDashboardStats(
  hospitalId?: string
): Promise<DashboardStats> {
  const id = hospitalId || authService.getSession()?.userId;

  if (!id) {
    return {
      activeSOS: 0,
      donorsEnRoute: 0,
      inventoryUnits: 0,
      transfusionsToday: 0,
      criticalInventory: 0,
    };
  }

  // Active SOS
  const { count: activeSOS } = await supabase
    .from("blood_requests")
    .select("*", { count: "exact", head: true })
    .eq("hospital_id", id)
    .eq("status", "BROADCASTING");

  // Donors Accepted
  const { count: donorsEnRoute } = await supabase
    .from("donor_response")
    .select("*", { count: "exact", head: true })
    .eq("response_status", "ACCEPTED");

  // Inventory
  const { data: inventory } = await supabase
    .from("blood_inventory")
    .select("available_units, critical_threshold")
    .eq("hospital_id", id);

  const inventoryUnits =
    inventory?.reduce((sum, item) => sum + item.available_units, 0) ?? 0;

  const criticalInventory =
    inventory?.filter(
      (item) => item.available_units <= item.critical_threshold
    ).length ?? 0;

  // Today's transfusions (fulfilled requests)
  const today = new Date().toISOString().split("T")[0];

  const { count: transfusionsToday } = await supabase
    .from("blood_requests")
    .select("*", { count: "exact", head: true })
    .eq("hospital_id", id)
    .eq("status", "FULFILLED")
    .gte("created_at", today);

  return {
    activeSOS: activeSOS ?? 0,
    donorsEnRoute: donorsEnRoute ?? 0,
    inventoryUnits,
    transfusionsToday: transfusionsToday ?? 0,
    criticalInventory,
  };
}