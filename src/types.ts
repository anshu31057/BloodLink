export type BloodGroup = 'O-' | 'O+' | 'A-' | 'A+' | 'B-' | 'B+' | 'AB-' | 'AB+';

export type PriorityLevel = 'CODE_RED' | 'IMMEDIATE' | 'URGENT' | 'HIGH';

export type EmergencyCategory = 
  | 'Mass Casualty / Trauma'
  | 'Emergency Surgery / OT'
  | 'Maternal Hemorrhage / OBGYN'
  | 'Pediatric Emergency / NICU'
  | 'Severe Anemia / Thalassemia'
  | 'Organ Transplant Emergency';

export type RequestStatus = 
  | 'BROADCASTING'
  | 'ACCEPTED'
  | 'DONORS_DISPATCHED'
  | 'PARTIALLY_FULFILLED'
  | 'FULFILLED'
  | 'CLOSED'
  | 'CANCELLED';

export type DonorStatus = 
  | 'RESPONDED'
  | 'EN_ROUTE'
  | 'ARRIVED_TRIAGE'
  | 'DONATION_IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED';

export interface Donor {
  id: string;
  name: string;
  avatar: string;
  bloodGroup: BloodGroup;
  phone: string;
  emergencyContact: string;
  distanceKm: number;
  etaMinutes: number;
  status: DonorStatus;
  statusUpdatedMinutesAgo: number;
  vehicleType: 'Car' | 'Bike' | 'Metro/Walk';
  latitude: number;
  longitude: number;
  totalDonations: number;
  verifiedDonor: boolean;
  requestId: string;
}

export interface EmergencyRequest {
  id: string;
  hospitalId: string; 
  hospitalName: string;
  
  hospitalAddress: string;
  department: string;
  doctorName: string;
  doctorContact: string;
  bloodGroup: BloodGroup;
  unitsRequired: number;
  unitsFulfilled: number;
  emergencyType: string;
  emergencyCategory: EmergencyCategory;
  priority: PriorityLevel;
  patientAge: number;
  patientGender: 'Male' | 'Female' | 'Other';
  patientCondition: string;
  clinicalNotes: string;
  locationWard: string;
  broadcastRadiusKm: 5 | 10 | 20 | 30;
  expectedResponseMinutes: number;
  createdAt: string; // ISO string
  expiresAt: string;
  status: RequestStatus;
  acceptedDonorsCount: number;
  notifiedDonorsCount: number;
  latitude: number;
  longitude: number;
}

export interface BloodInventoryItem {
  bloodGroup: BloodGroup;
  availableUnits: number;
  criticalThreshold: number;
  reserveUnits: number;
  lowStockAlert: boolean;
  expiringIn48hUnits: number;
  lastUpdated: string;
}

export interface ActivityEvent {
  id: string;
  timestamp: string;
  type: 'DONOR_ACCEPTED' | 'SOS_CREATED' | 'DONATION_COMPLETED' | 'DONOR_ARRIVED' | 'INVENTORY_LOW' | 'REQUEST_CLOSED';
  title: string;
  description: string;
  bloodGroup?: BloodGroup;
  requestId?: string;
  priority?: PriorityLevel;
}

export interface DonationRecord {
  id: string;
  certificateNumber: string;
  donorName: string;
  donorId: string;
  bloodGroup: BloodGroup;
  unitsDonated: number;
  hospitalName: string;
  department: string;
  doctorName: string;
  recipientPatientId: string;
  date: string;
  verificationHash: string;
}

export interface HospitalProfile {
  id?: string;
  name: string;
  code: string;
  type: string;
  nabhLicense: string;
  licenseNumber?: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  emergencyHotline: string;
  emergencyPhone?: string;
  contactLandline?: string;
  bloodBankDesk: string;
  bloodBankIncharge?: string;
  directorName: string;
  activeStatus: 'LEVEL_1_TRAUMA_READY' | 'CAPACITY_WARNING' | 'DIVERT_STATUS';
  departments: string[];
  accreditations: string[];
  onCallDoctors: { name: string; department: string; phone: string; available: boolean }[];
  fcmRegisteredDevicesCount: number;
}

export interface CrossDeviceSyncMessage {
  type: 'SOS_BROADCAST' | 'DONOR_STATUS_UPDATE' | 'INVENTORY_UPDATE' | 'REQUEST_CLOSED' | 'SYNC_PING';
  payload: any;
  originDeviceId: string;
  timestamp: number;
}
