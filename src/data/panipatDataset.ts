// ============================================================================
// BLOODLINK 8 — PANIPAT REGIONAL NETWORK DEMO DATASET
// 10 Hospitals | 100 Donors | 50 Emergency Requests
// "8 Blood Groups. One Lifeline."
// ============================================================================

import { BloodGroup, Donor, EmergencyRequest, HospitalProfile } from '../types';

export const PANIPAT_HOSPITALS: HospitalProfile[] = [
  {
    id: '5cf2139e-903d-430d-a770-14435cf316b8',
    name: 'Verified Emergency Network Node (Apex)',
    code: 'BL8-ND-01',
    type: 'Apex Level-1 Trauma Command Node',
    nabhLicense: 'BL8-REG-2026-9821',
    licenseNumber: 'BL8-REG-2026-9821',
    address: 'Model Town Core Hub, Panipat, Haryana 132103',
    city: 'Panipat Regional Command, Haryana',
    latitude: 29.3909,
    longitude: 76.9635,
    emergencyHotline: '+91 180 265 8888',
    emergencyPhone: '+91 180 265 8888',
    contactLandline: '+91 180 265 4432',
    bloodBankDesk: '+91 180 265 4432',
    bloodBankIncharge: 'Dr. Meenakshi Sundaram, MD (Transfusion)',
    directorName: 'Dr. Rajeshwar Sharma, MD (Trauma & Critical Care)',
    activeStatus: 'LEVEL_1_TRAUMA_READY',
    departments: ['Emergency & Resuscitation', 'Trauma Triage Critical Unit', 'Cardiothoracic Surgery', 'Pediatric ICU'],
    accreditations: ['BloodLink Verified Node', 'Rapid Transfusion Protocol', 'ISO Cold-Vault Certified'],
    onCallDoctors: [
      { name: 'Dr. Rajeshwar Sharma', department: 'Trauma Surgery', phone: '+91 98110 44211', available: true },
      { name: 'Dr. Ananya Sen', department: 'Critical Care / ICU', phone: '+91 98102 55432', available: true }
    ],
    fcmRegisteredDevicesCount: 1420
  },
  {
    id: 'BL8-NODE-02',
    name: 'Civil Hospital Panipat Trauma Center',
    code: 'BL8-ND-02',
    type: 'Government District Apex Hospital',
    nabhLicense: 'HAR-PNP-CIVIL-2024-001',
    address: 'GT Road, Near Red Light, Panipat, Haryana 132103',
    city: 'Panipat, Haryana',
    latitude: 29.3952,
    longitude: 76.9689,
    emergencyHotline: '+91 180 263 0102',
    bloodBankDesk: '+91 180 263 0105',
    directorName: 'Dr. S. K. Gupta',
    activeStatus: 'LEVEL_1_TRAUMA_READY',
    departments: ['Emergency Bay', 'General Surgery', 'Obstetrics OT'],
    accreditations: ['NABH Accredited Blood Centre'],
    onCallDoctors: [{ name: 'Dr. S. K. Gupta', department: 'General Surgery', phone: '+91 98120 11223', available: true }],
    fcmRegisteredDevicesCount: 890
  },
  {
    id: 'BL8-NODE-03',
    name: 'Prem Hospital & Heart Institute',
    code: 'BL8-ND-03',
    type: 'Tertiary Cardiac & Emergency Hospital',
    nabhLicense: 'HAR-PNP-PREM-2025-089',
    address: 'Sector 12, HUDA, Panipat, Haryana 132103',
    city: 'Panipat, Haryana',
    latitude: 29.4021,
    longitude: 76.9745,
    emergencyHotline: '+91 180 409 9000',
    bloodBankDesk: '+91 180 409 9022',
    directorName: 'Dr. Prem Kumar',
    activeStatus: 'LEVEL_1_TRAUMA_READY',
    departments: ['Interventional Cardiology', 'Cardiothoracic OT', 'Intensive Care Unit'],
    accreditations: ['NABH Emergency Room Certified'],
    onCallDoctors: [{ name: 'Dr. Prem Kumar', department: 'Cardiology', phone: '+91 98960 99887', available: true }],
    fcmRegisteredDevicesCount: 650
  },
  {
    id: 'BL8-NODE-04',
    name: 'Ravindra Hospital & Trauma Centre',
    code: 'BL8-ND-04',
    type: 'Orthopedic & Polytrauma Centre',
    nabhLicense: 'HAR-PNP-RAV-2024-112',
    address: 'Model Town, Near Geeta Mandir, Panipat',
    city: 'Panipat, Haryana',
    latitude: 29.3880,
    longitude: 76.9610,
    emergencyHotline: '+91 180 264 5555',
    bloodBankDesk: '+91 180 264 5558',
    directorName: 'Dr. Ravindra Nath',
    activeStatus: 'LEVEL_1_TRAUMA_READY',
    departments: ['Orthopedic Trauma', 'Spine & Joint Reconstruction'],
    accreditations: ['BloodLink Trauma Network'],
    onCallDoctors: [{ name: 'Dr. Ravindra Nath', department: 'Orthopedics', phone: '+91 98112 33445', available: true }],
    fcmRegisteredDevicesCount: 520
  },
  {
    id: 'BL8-NODE-05',
    name: 'Park Hospital Panipat Hub',
    code: 'BL8-ND-05',
    type: 'Multispecialty Super Specialty Centre',
    nabhLicense: 'HAR-PNP-PARK-2026-301',
    address: 'NH-44 GT Karnal Road, Panipat',
    city: 'Panipat, Haryana',
    latitude: 29.4110,
    longitude: 76.9820,
    emergencyHotline: '+91 180 719 9999',
    bloodBankDesk: '+91 180 719 9901',
    directorName: 'Dr. Neeraj Bansal',
    activeStatus: 'LEVEL_1_TRAUMA_READY',
    departments: ['Level 1 Triage', 'Neurotrauma OT', 'Critical Care'],
    accreditations: ['NABH Super Specialty'],
    onCallDoctors: [{ name: 'Dr. Neeraj Bansal', department: 'Neurotrauma', phone: '+91 98710 44556', available: true }],
    fcmRegisteredDevicesCount: 780
  },
  {
    id: 'BL8-NODE-06',
    name: 'Mool Chand Hospital Panipat',
    code: 'BL8-ND-06',
    type: 'Emergency & Mother-Child Hospital',
    nabhLicense: 'HAR-PNP-MC-2025-045',
    address: 'Barsat Road, Sector 18, Panipat',
    city: 'Panipat, Haryana',
    latitude: 29.3812,
    longitude: 76.9540,
    emergencyHotline: '+91 180 266 1122',
    bloodBankDesk: '+91 180 266 1125',
    directorName: 'Dr. Sunita Jain',
    activeStatus: 'LEVEL_1_TRAUMA_READY',
    departments: ['Obstetrics & Gynecology', 'NICU / Pediatric Trauma'],
    accreditations: ['Maternal Emergency Response Unit'],
    onCallDoctors: [{ name: 'Dr. Sunita Jain', department: 'OBGYN', phone: '+91 98101 66778', available: true }],
    fcmRegisteredDevicesCount: 430
  },
  {
    id: 'BL8-NODE-07',
    name: 'Kalpana Chawla Govt Medical College & Hospital',
    code: 'BL8-ND-07',
    type: 'Apex State Medical College Hospital',
    nabhLicense: 'HAR-KNL-KCGMC-2023-001',
    address: 'Model Town, Karnal, Haryana 132001',
    city: 'Karnal, Haryana',
    latitude: 29.6857,
    longitude: 76.9905,
    emergencyHotline: '+91 184 226 6377',
    bloodBankDesk: '+91 184 226 6379',
    directorName: 'Dr. J. C. Dureja',
    activeStatus: 'LEVEL_1_TRAUMA_READY',
    departments: ['Apex Trauma Center', 'Emergency Medicine', 'Transfusion Medicine'],
    accreditations: ['National Apex Medical College'],
    onCallDoctors: [{ name: 'Dr. J. C. Dureja', department: 'Trauma & Critical Care', phone: '+91 98124 55667', available: true }],
    fcmRegisteredDevicesCount: 1650
  },
  {
    id: 'BL8-NODE-08',
    name: 'Amritdhara Hospital & Blood Centre',
    code: 'BL8-ND-08',
    type: 'Super Specialty Trauma Network Node',
    nabhLicense: 'HAR-KNL-AMR-2025-108',
    address: 'NH-44 Chaura Bazaar Flyover, Karnal',
    city: 'Karnal, Haryana',
    latitude: 29.6920,
    longitude: 77.0012,
    emergencyHotline: '+91 184 409 0000',
    bloodBankDesk: '+91 184 409 0015',
    directorName: 'Dr. Rajiv Gupta',
    activeStatus: 'LEVEL_1_TRAUMA_READY',
    departments: ['Cardiothoracic Surgery', 'PolyTrauma Resuscitation'],
    accreditations: ['NABH Super Specialty'],
    onCallDoctors: [{ name: 'Dr. Rajiv Gupta', department: 'Critical Care', phone: '+91 98961 22334', available: true }],
    fcmRegisteredDevicesCount: 710
  },
  {
    id: 'BL8-NODE-09',
    name: 'Bhagwan Mahaveer Hospital & Trauma Centre',
    code: 'BL8-ND-09',
    type: 'Regional Kundli Industrial Corridor Node',
    nabhLicense: 'HAR-SNP-BMH-2024-032',
    address: 'GT Karnal Road, Kundli / Sonipat Border',
    city: 'Sonipat / NCR, Haryana',
    latitude: 28.8780,
    longitude: 77.1230,
    emergencyHotline: '+91 130 237 0000',
    bloodBankDesk: '+91 130 237 0018',
    directorName: 'Dr. A. K. Jain',
    activeStatus: 'LEVEL_1_TRAUMA_READY',
    departments: ['Industrial Trauma Care', 'Emergency OT'],
    accreditations: ['Highway Emergency Response Unit'],
    onCallDoctors: [{ name: 'Dr. A. K. Jain', department: 'Trauma Surgery', phone: '+91 98103 88990', available: true }],
    fcmRegisteredDevicesCount: 920
  },
  {
    id: 'BL8-NODE-10',
    name: 'FIMS Hospital Sonipat Junction',
    code: 'BL8-ND-10',
    type: 'Tertiary Emergency Care Node',
    nabhLicense: 'HAR-SNP-FIMS-2025-077',
    address: 'Bahalgarh Chowk, Sonipat, Haryana',
    city: 'Sonipat, Haryana',
    latitude: 28.9850,
    longitude: 77.0750,
    emergencyHotline: '+91 130 409 8888',
    bloodBankDesk: '+91 130 409 8890',
    directorName: 'Dr. Sanjay Verma',
    activeStatus: 'LEVEL_1_TRAUMA_READY',
    departments: ['Emergency Resuscitation', 'Neurotrauma', 'Cardiovascular OT'],
    accreditations: ['NABH Accredited Center'],
    onCallDoctors: [{ name: 'Dr. Sanjay Verma', department: 'Emergency Medicine', phone: '+91 98114 66778', available: true }],
    fcmRegisteredDevicesCount: 840
  }
];

// Helper to generate 100 realistic voluntary donors across Panipat corridor
const BLOOD_GROUPS: BloodGroup[] = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];
const FIRST_NAMES = ['Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh', 'Ayaan', 'Krishna', 'Ishaan', 'Diya', 'Saanvi', 'Ananya', 'Aadhya', 'Pari', 'Anvi', 'Navya', 'Myra', 'Ira', 'Rhea', 'Vikram', 'Rohan', 'Kunal', 'Simran', 'Tanvi', 'Pooja', 'Deepak', 'Manish', 'Nitin', 'Megha'];
const LAST_NAMES = ['Sharma', 'Verma', 'Beniwal', 'Singh', 'Choudhary', 'Malik', 'Dahiya', 'Kadian', 'Hooda', 'Gupta', 'Aggarwal', 'Jain', 'Mehta', 'Khatri', 'Dalal', 'Deswal', 'Antil', 'Bhardwaj', 'Lather', 'Grewal'];
const VEHICLE_TYPES = ['Bike', 'Car', 'Metro/Walk'] as const;

export const PANIPAT_DONORS_100: Donor[] = Array.from({ length: 100 }, (_, index) => {
  const firstName = FIRST_NAMES[index % FIRST_NAMES.length];
  const lastName = LAST_NAMES[(index * 3) % LAST_NAMES.length];
  const bloodGroup = BLOOD_GROUPS[index % BLOOD_GROUPS.length];
  const vehicle = VEHICLE_TYPES[index % VEHICLE_TYPES.length];
  
  // Clustered around Panipat (29.3909, 76.9635) with realistic dispersion
  const latOffset = (Math.sin(index * 1.7) * 0.08);
  const lonOffset = (Math.cos(index * 2.3) * 0.08);
  const lat = 29.3909 + latOffset;
  const lon = 76.9635 + lonOffset;
  const distance = Math.max(0.8, parseFloat((Math.hypot(latOffset, lonOffset) * 111).toFixed(1)));
  const eta = Math.max(4, Math.round(distance * (vehicle === 'Bike' ? 2.2 : 2.8) + 3));

  return {
    id: `DNR-PNP-${1000 + index}`,
    name: `${firstName} ${lastName}`,
    avatar: `https://images.unsplash.com/photo-${1534528741775 + (index % 50)}?w=150&auto=format&fit=crop&q=80`,
    bloodGroup,
    phone: `+91 981${Math.floor(10 + (index % 80))} ${Math.floor(10000 + (index * 791) % 90000)}`,
    emergencyContact: `+91 98100 ${Math.floor(10000 + index * 37)} (Family)`,
    distanceKm: distance,
    etaMinutes: eta,
    status: index === 0 ? 'EN_ROUTE' : index === 1 ? 'RESPONDED' : 'RESPONDED',
    statusUpdatedMinutesAgo: (index * 2) % 15,
    vehicleType: vehicle,
    latitude: lat,
    longitude: lon,
    totalDonations: 1 + (index % 14),
    verifiedDonor: true,
    requestId: 'REQ-2026-0891'
  };
});

// 50 realistic emergency requests
export const PANIPAT_REQUESTS_50: EmergencyRequest[] = Array.from({ length: 50 }, (_, i) => {
  const hosp = PANIPAT_HOSPITALS[i % PANIPAT_HOSPITALS.length];
  const bg = BLOOD_GROUPS[i % BLOOD_GROUPS.length];
  const priority = i % 4 === 0 ? 'CODE_RED' : i % 3 === 0 ? 'IMMEDIATE' : 'URGENT';
  const unitsRequired = 1 + (i % 4);
  const unitsFulfilled = i > 15 ? unitsRequired : Math.floor(Math.random() * unitsRequired);
  const status = unitsFulfilled >= unitsRequired ? 'FULFILLED' : i < 6 ? 'DONORS_DISPATCHED' : 'BROADCASTING';

  return {
    id: `REQ-2026-${1000 + i}`,
    hospitalName: hosp.name,
    hospitalAddress: hosp.address,
    department: hosp.departments[i % hosp.departments.length] || 'Emergency Trauma Bay',
    doctorName: hosp.onCallDoctors[0]?.name || 'Dr. Attending Transfusion Officer',
    doctorContact: hosp.emergencyHotline,
    bloodGroup: bg,
    unitsRequired,
    unitsFulfilled,
    emergencyType: i % 2 === 0 ? 'High-Velocity Highway Collision Trauma' : 'Emergency Obstetric Hemorrhage Transfusion',
    emergencyCategory: i % 2 === 0 ? 'Mass Casualty / Trauma' : 'Maternal Hemorrhage / OBGYN',
    priority,
    patientAge: 20 + (i * 3) % 55,
    patientGender: i % 2 === 0 ? 'Male' : 'Female',
    patientCondition: priority === 'CODE_RED' ? 'Severe arterial hemorrhage, Hypovolemic Shock' : 'Post-op acute anemia',
    clinicalNotes: 'Urgent packed RBC requirement. Cross-match specimen received in central lab.',
    locationWard: `Ward-${(i % 5) + 1} / Bay-${(i % 8) + 1}`,
    broadcastRadiusKm: (i % 2 === 0 ? 10 : 20) as 10 | 20,
    expectedResponseMinutes: 15 + (i % 15),
    createdAt: new Date(Date.now() - (i * 35) * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + (45 - (i % 30)) * 60 * 1000).toISOString(),
    status,
    acceptedDonorsCount: Math.min(unitsFulfilled + 1, 4),
    notifiedDonorsCount: 150 + (i * 12) % 300,
    latitude: hosp.latitude,
    longitude: hosp.longitude
  };
});
