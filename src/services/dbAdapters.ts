// ============================================================================
// BLOODLINK 8 — DATABASE MAPPERS & SUPABASE TABLE ADAPTERS
// "8 Blood Groups. One Lifeline."
// ============================================================================

import { EmergencyRequest, Donor, BloodInventoryItem, HospitalProfile } from '../types';

/**
 * Maps PostgreSQL snake_case row from `blood_requests` to TypeScript `EmergencyRequest`
 */
export function mapBloodRequestFromDb(row: any, hospitalFallback?: HospitalProfile): EmergencyRequest {
  return {
    id: row.request_id || row.id,
    hospitalName: row.hospital_name || (row.hospitals?.name) || (hospitalFallback?.name) || 'Verified Emergency Network Node',
    hospitalAddress: row.hospital_address || (row.hospitals?.address) || (hospitalFallback?.address) || 'Panipat Regional Command, Haryana',
    department: row.ward || row.department || 'Trauma Resuscitation Unit',
    doctorName: row.doctor_name || 'Attending Surgeon',
    doctorContact: row.doctor_contact || '+91 180 265 8888',
    bloodGroup: row.blood_group,
    unitsRequired: Number(row.units_required) || 1,
    unitsFulfilled: Number(row.units_fulfilled) || 0,
    emergencyType: row.emergency_type || (row.priority === 'CODE_RED' ? 'Acute Severe Hemorrhage' : 'Emergency Transfusion'),
    emergencyCategory: row.emergency_category || 'Mass Casualty / Trauma',
    priority: row.priority || 'CODE_RED',
    patientAge: Number(row.patient_age) || 32,
    patientGender: row.patient_gender || 'Male',
    patientCondition: row.patient_condition || 'Critical hemorrhagic trauma',
    clinicalNotes: row.clinical_notes || '',
    locationWard: row.ward || row.location_ward || 'Trauma Resuscitation OT',
    broadcastRadiusKm: (Number(row.radius_km) as any) || 10,
    expectedResponseMinutes: Number(row.expected_response_minutes) || 20,
    createdAt: row.created_at || new Date().toISOString(),
    expiresAt: row.expires_at || new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    status: row.status || 'BROADCASTING',
    acceptedDonorsCount: Number(row.accepted_donors_count) || 0,
    notifiedDonorsCount: Number(row.notified_donors_count) || 240,
    latitude: Number(row.latitude) || (hospitalFallback?.latitude) || 29.3909,
    longitude: Number(row.longitude) || (hospitalFallback?.longitude) || 76.9635
  };
}

/**
 * Maps frontend `EmergencyRequest` to PostgreSQL snake_case columns for `blood_requests` table
 */
export function mapBloodRequestToDb(req: Partial<EmergencyRequest>, hospitalId: string) {
  return {
    hospital_id: hospitalId,
    blood_group: req.bloodGroup,
    units_required: req.unitsRequired || 1,
    units_fulfilled: req.unitsFulfilled || 0,
    priority: req.priority || 'CODE_RED',
    radius_km: req.broadcastRadiusKm || 10,
    status: req.status || 'BROADCASTING',
    emergency_category: req.emergencyCategory || 'Mass Casualty / Trauma',
    clinical_notes: req.clinicalNotes || '',
    doctor_name: req.doctorName || 'Attending Surgeon',
    doctor_contact: req.doctorContact || '+91 180 265 8888',
    ward: req.locationWard || req.department || 'Trauma Resuscitation Unit',
    patient_condition: req.patientCondition || 'Clinical trauma',
    expected_response_minutes: req.expectedResponseMinutes || 20,
    expires_at: req.expiresAt || new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    created_at: req.createdAt || new Date().toISOString()
  };
}

/**
 * Maps donor_response and donor joined row to `Donor` card
 */
export function mapDonorFromDb(row: any): Donor {
  const d = row.donors || row;
  const statusMapping: Record<string, any> = {
    NOTIFIED: 'RESPONDED',
    ACCEPTED: 'RESPONDED',
    EN_ROUTE: 'EN_ROUTE',
    ARRIVED: 'ARRIVED_TRIAGE',
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED'
  };

  const currentStatus = statusMapping[row.status] || row.status || 'RESPONDED';

  return {
    id: d.donor_id || d.id || `DNR-${Math.floor(1000 + Math.random() * 9000)}`,
    name: d.name || 'Verified Volunteer Donor',
    avatar: d.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    bloodGroup: d.blood_group || row.blood_group || 'O-',
    phone: d.phone || '+91 98110 55432',
    emergencyContact: d.emergency_contact || '+91 98110 00000',
    distanceKm: row.distance_km ? Number(row.distance_km) : +(1.5 + Math.random() * 3).toFixed(1),
    etaMinutes: row.eta !== undefined && row.eta !== null ? Number(row.eta) : 12,
    status: currentStatus,
    statusUpdatedMinutesAgo: 0,
    vehicleType: d.vehicle_type || 'Bike',
    latitude: Number(row.current_latitude || d.latitude || 29.395),
    longitude: Number(row.current_longitude || d.longitude || 76.965),
    totalDonations: Number(d.total_donations_count || d.totalDonations || 5),
    verifiedDonor: Boolean(d.verified !== false),
    requestId: row.request_id || row.requestId || 'REQ-2026-0891'
  };
}

/**
 * Maps blood_inventory row to `BloodInventoryItem`
 */
export function mapInventoryFromDb(row: any): BloodInventoryItem {
  const available = Number(row.available_units);
  const threshold = Number(row.critical_threshold) || 4;

  return {
    bloodGroup: row.blood_group,
    availableUnits: available,
    criticalThreshold: threshold,
    reserveUnits: Number(row.reserve_units) || 2,
    lowStockAlert: available <= threshold,
    expiringIn48hUnits: Number(row.expiring_in_48h_units) || 0,
    lastUpdated: row.updated_at ? new Date(row.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Live Sync'
  };
}
