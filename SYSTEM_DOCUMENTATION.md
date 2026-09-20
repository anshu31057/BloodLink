# 🩸 BloodLink Command Center — Official System Documentation
**Emergency Blood Response Network • Level 1 Trauma Hospital Operations**

Designed following **Apple Health Dashboard**, **Google Material Design 3**, **Stripe Dashboard**, and **AIIMS Emergency Operations Center** design systems.

---

## 1. System Architecture Overview

BloodLink Command Center connects hospital emergency wards, regional apex blood banks, and verified volunteer mobile donors into a sub-second, real-time emergency dispatch network.

```
┌─────────────────────────────────────────────────────────┐
│           Hospital Emergency Operations Center          │
│           (Next.js 15 / React + Tailwind CSS)           │
└───────────────┬─────────────────────────┬───────────────┘
                │                         │
     Supabase PostgreSQL Realtime         │ Firebase Cloud Messaging (FCM)
   (WebSockets & RLS Row-Security)       │ (High-Priority Multicast Push)
                │                         │
                ▼                         ▼
┌───────────────────────────────┐ ┌───────────────────────────────┐
│   PostgreSQL + PostGIS Cloud  │ │  BloodLink Mobile App (Donors)│
│  - hospitals                  │ │  - Immediate Sound/Vibrate    │
│  - emergency_requests         │ │  - One-Tap Accept/Decline     │
│  - donors & responses         │ │  - Live Route Navigation ETA  │
│  - blood_inventory            │ │  - Digital Donor Certificate  │
└───────────────────────────────┘ └───────────────────────────────┘
```

---

## 2. Supabase Integration Plan & Schema

### Database Tables

```sql
-- 1. HOSPITALS
CREATE TABLE hospitals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  license_number TEXT UNIQUE NOT NULL,
  emergency_phone TEXT NOT NULL,
  contact_landline TEXT NOT NULL,
  blood_bank_incharge TEXT NOT NULL,
  departments TEXT[] DEFAULT ARRAY['Level 1 Trauma Triage', 'Surgical OT', 'Pediatric ICU'],
  accreditations TEXT[] DEFAULT ARRAY['NABH Level 1 Trauma Center', 'NABL Certified Blood Bank', 'WHO Emergency Partner'],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. EMERGENCY REQUESTS (SOS Broadcasts)
CREATE TABLE emergency_requests (
  id TEXT PRIMARY KEY,
  hospital_id UUID REFERENCES hospitals(id) ON DELETE CASCADE,
  department TEXT NOT NULL,
  doctor_name TEXT NOT NULL,
  doctor_contact TEXT NOT NULL,
  blood_group TEXT NOT NULL CHECK (blood_group IN ('O-','O+','A-','A+','B-','B+','AB-','AB+')),
  units_required INT NOT NULL CHECK (units_required > 0),
  units_fulfilled INT DEFAULT 0,
  emergency_type TEXT NOT NULL,
  emergency_category TEXT NOT NULL,
  priority TEXT NOT NULL CHECK (priority IN ('CODE_RED', 'IMMEDIATE', 'URGENT', 'HIGH')),
  patient_age INT,
  patient_gender TEXT,
  patient_condition TEXT NOT NULL,
  clinical_notes TEXT,
  location_ward TEXT NOT NULL,
  broadcast_radius_km INT DEFAULT 10,
  expected_response_minutes INT DEFAULT 15,
  status TEXT DEFAULT 'BROADCASTING' CHECK (status IN ('BROADCASTING', 'DONORS_DISPATCHED', 'FULFILLED', 'CANCELLED', 'EXPIRED')),
  notified_donors_count INT DEFAULT 0,
  accepted_donors_count INT DEFAULT 0,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL
);

-- 3. DONORS (Verified Pool)
CREATE TABLE donors (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  emergency_contact TEXT NOT NULL,
  blood_group TEXT NOT NULL,
  verified_donor BOOLEAN DEFAULT TRUE,
  avatar_url TEXT,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  fcm_device_token TEXT NOT NULL,
  total_donations INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. DONOR RESPONSES (Telemetry & ETA)
CREATE TABLE donar_response (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id TEXT REFERENCES emergency_requests(id) ON DELETE CASCADE,
  donor_id TEXT REFERENCES donors(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'RESPONDED' CHECK (status IN ('RESPONDED', 'EN_ROUTE', 'ARRIVED_TRIAGE', 'COMPLETED', 'DECLINED')),
  distance_km DOUBLE PRECISION NOT NULL,
  eta_minutes INT NOT NULL,
  vehicle_type TEXT DEFAULT 'Car' CHECK (vehicle_type IN ('Car', 'Bike', 'Transit', 'Walking')),
  responded_at TIMESTAMPTZ DEFAULT NOW(),
  arrived_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

-- 5. BLOOD INVENTORY
CREATE TABLE blood_inventory (
  hospital_id UUID REFERENCES hospitals(id) ON DELETE CASCADE,
  blood_group TEXT NOT NULL,
  available_units INT NOT NULL DEFAULT 0,
  critical_threshold INT NOT NULL DEFAULT 10,
  reserve_units INT NOT NULL DEFAULT 5,
  expiring_in_48h_units INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (hospital_id, blood_group)
);

-- 6. DONATION HISTORY & CERTIFICATES
CREATE TABLE donation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  certificate_number TEXT UNIQUE NOT NULL,
  hospital_id UUID REFERENCES hospitals(id),
  donor_id TEXT REFERENCES donors(id),
  donor_name TEXT NOT NULL,
  blood_group TEXT NOT NULL,
  units_donated INT DEFAULT 1,
  department TEXT NOT NULL,
  doctor_name TEXT NOT NULL,
  recipient_patient_id TEXT NOT NULL,
  date TEXT NOT NULL,
  verification_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Row Level Security (RLS) & Realtime

```sql
-- Enable RLS
ALTER TABLE emergency_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE donar_response ENABLE ROW LEVEL SECURITY;
ALTER TABLE blood_inventory ENABLE ROW LEVEL SECURITY;

-- Realtime publication for dashboard
ALTER PUBLICATION supabase_realtime ADD TABLE emergency_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE donar_response;
ALTER PUBLICATION supabase_realtime ADD TABLE blood_inventory;

-- Client-side subscription in React/Next.js:
const channel = supabase
  .channel('emergency-feed')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'emergency_requests' }, (payload) => {
    handleEmergencyUpdate(payload.new);
  })
  .on('postgres_changes', { event: '*', schema: 'public', table: 'donar_response' }, (payload) => {
    handleDonorTelemetry(payload.new);
  })
  .subscribe();
```

---

## 3. Firebase Cloud Messaging (FCM) Integration Plan

### High-Priority Urgent Push Notification Payload
When the hospital taps **Broadcast SOS**, the server dispatches a high-priority FCM message payload with customized sound, vibration pattern, and foreground action triggers:

```json
{
  "message": {
    "topic": "emergency_blood_o_negative_delhi_10km",
    "notification": {
      "title": "🚨 CODE RED: O- Blood Needed Immediately",
      "body": "AIIMS Trauma Resuscitation OT-2 requires 3 units for multiple trauma victim. Can you dispatch?"
    },
    "data": {
      "requestId": "REQ-8902",
      "hospitalName": "AIIMS Apex Trauma Center",
      "bloodGroup": "O-",
      "unitsNeeded": "3",
      "priority": "CODE_RED",
      "hospitalLat": "28.5672",
      "hospitalLng": "77.2100",
      "expectedResponseMinutes": "15"
    },
    "android": {
      "priority": "high",
      "notification": {
        "channel_id": "emergency_trauma_alerts",
        "sound": "emergency_chime",
        "default_vibrate_timings": false,
        "vibrate_timings": ["0s", "0.5s", "0.2s", "0.5s"],
        "actions": [
          {
            "action": "ACCEPT_DISPATCH",
            "title": "🩸 ACCEPT & DISPATCH"
          },
          {
            "action": "DECLINE",
            "title": "Unavailable"
          }
        ]
      }
    },
    "apns": {
      "headers": {
        "apns-priority": "10",
        "apns-push-type": "alert"
      },
      "payload": {
        "aps": {
          "sound": "emergency_chime.caf",
          "category": "EMERGENCY_REQUEST_CATEGORY"
        }
      }
    }
  }
}
```

---

## 4. MapLibre + OpenStreetMap Architecture

- **Map Engine:** MapLibre GL JS / Vector SVG Radar Canvas
- **Base Tile Provider:** OpenStreetMap (OSM Standard / Carto Positron)
- **Geofence Geometries:** Dynamic 5km, 10km, 20km radius circles centered on the hospital trauma apex.
- **Layers:**
  1. `osm-tiles`: OpenStreetMap raster / vector street grid.
  2. `emergency-radius-5km`: Immediate walking / rapid bike donor perimeter.
  3. `emergency-radius-10km`: Standard capital trauma response zone.
  4. `emergency-radius-20km`: Maximum dispatch perimeter.
  5. `route-vectors`: Dynamic dashed vector lines from donor GPS coordinates to the triage intake gate.
  6. `hospital-marker`: High-contrast pulsing red beacon.
  7. `donor-markers`: Interactive blood-group labeled pins with live ETA pills.

---

## 5. Design System Compliance Checklist

| Spec | BloodLink Command Center Standard | Status |
|---|---|---|
| **Theme** | Light theme only. Crisp white (#FFFFFF), subtle canvas (#F8FAFC), borders (#E5E7EB) | ✅ Implemented |
| **Emergency Red** | `#DC2626` (WCAG AAA compliant on white) | ✅ Implemented |
| **Success Green** | `#16A34A` (Triage arrival, fulfilled) | ✅ Implemented |
| **Warning Amber** | `#F59E0B` (Immediate cases, 48h expiry) | ✅ Implemented |
| **Critical Blue** | `#2563EB` (Telemetry, live maps, certificates) | ✅ Implemented |
| **Corner Radius** | `rounded-3xl` (24px) for cards, `rounded-2xl` for buttons | ✅ Implemented |
| **Typography** | Plus Jakarta Sans (body, display) + JetBrains Mono (metrics, codes) | ✅ Implemented |
| **Shadows** | Soft elevation: `box-shadow: 0 1px 3px rgba(0,0,0,0.05)` | ✅ Implemented |
| **Audio** | Level 1 Web Audio API Chime generator with zero external asset latency | ✅ Implemented |

---

## 6. Next.js 15 App Router Architecture & Directory Tree

```
bloodlink-command-center/
├── app/
│   ├── layout.tsx                # Root HTML, fonts, and CommandCenterProvider
│   ├── page.tsx                  # Conditional auth router (Login vs Dashboard)
│   ├── (dashboard)/
│   │   ├── layout.tsx            # Persistent Header + Sidebar + Notification Drawer
│   │   ├── dashboard/page.tsx    # Page 2: Dashboard Home
│   │   ├── create-sos/page.tsx   # Page 3: Create Emergency SOS
│   │   ├── live-requests/page.tsx# Page 4: Live Emergency Requests
│   │   ├── donor-center/page.tsx # Page 5: Donor Response Center
│   │   ├── live-map/page.tsx     # Page 6: Live Map Command Center
│   │   ├── inventory/page.tsx    # Page 7: Blood Inventory
│   │   ├── history/page.tsx      # Page 8: Donation History & Certificates
│   │   ├── analytics/page.tsx    # Page 9: Recharts Analytics
│   │   └── profile/page.tsx      # Page 10: Hospital Profile & Accreditations
│   └── api/
│       ├── sos/broadcast/route.ts
│       └── fcm/push/route.ts
├── components/
│   ├── common/
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   ├── BloodGroupBadge.tsx
│   │   ├── StatusBadge.tsx
│   │   ├── CertificateModal.tsx
│   │   ├── NotificationPreviewModal.tsx
│   │   ├── CrossDeviceSyncModal.tsx
│   │   ├── DonorMobileCompanionModal.tsx
│   │   ├── NotificationDrawer.tsx
│   │   └── ArchitectureDocsModal.tsx
│   └── pages/
│       ├── LoginPage.tsx
│       ├── DashboardHome.tsx
│       ├── CreateEmergencySOS.tsx
│       ├── LiveRequestsPage.tsx
│       ├── DonorResponseCenter.tsx
│       ├── LiveMapPage.tsx
│       ├── BloodInventoryPage.tsx
│       ├── DonationHistoryPage.tsx
│       ├── AnalyticsPage.tsx
│       └── HospitalProfilePage.tsx
├── context/
│   └── CommandCenterContext.tsx  # Central reactive state + BroadcastChannel cross-device sync
├── data/
│   └── mockData.ts               # Seed data for trauma hub, requests, donors, inventory
└── types.ts                      # Full TypeScript medical interfaces
```
