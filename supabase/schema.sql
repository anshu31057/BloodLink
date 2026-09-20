-- ============================================================================
-- BLOODLINK 8 — PRODUCTION POSTGRESQL DATABASE SCHEMA (SUPABASE)
-- "8 Blood Groups. One Lifeline."
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "cube";
CREATE EXTENSION IF NOT EXISTS "earthdistance";

-- Enum Definitions
CREATE TYPE blood_group_enum AS ENUM (
  'O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'
);

CREATE TYPE priority_enum AS ENUM (
  'CODE_RED', 'IMMEDIATE', 'URGENT', 'HIGH'
);

CREATE TYPE request_status_enum AS ENUM (
  'BROADCASTING', 'DONORS_DISPATCHED', 'PARTIALLY_FULFILLED', 'FULFILLED', 'CLOSED', 'CANCELLED'
);

CREATE TYPE response_status_enum AS ENUM (
  'NOTIFIED', 'ACCEPTED', 'DECLINED', 'EN_ROUTE', 'ARRIVED', 'COMPLETED', 'CANCELLED'
);

CREATE TYPE donor_gender_enum AS ENUM (
  'Male', 'Female', 'Other'
);

-- ============================================================================
-- 1. HOSPITALS (Verified Network Nodes)
-- ============================================================================
CREATE TABLE IF NOT EXISTS hospitals (
  hospital_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  license_number VARCHAR(100) UNIQUE NOT NULL,
  address TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  city VARCHAR(100) NOT NULL DEFAULT 'Panipat',
  state VARCHAR(100) NOT NULL DEFAULT 'Haryana',
  pincode VARCHAR(20) NOT NULL DEFAULT '132103',
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  phone VARCHAR(30) NOT NULL,
  emergency_hotline VARCHAR(30) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  blood_bank_incharge VARCHAR(150),
  total_bed_capacity INTEGER DEFAULT 350,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Spatial and look-up indexes
CREATE INDEX idx_hospitals_coords ON hospitals (latitude, longitude);
CREATE INDEX idx_hospitals_verified ON hospitals (verified);
CREATE INDEX idx_hospitals_city ON hospitals (city);

-- ============================================================================
-- 2. DONORS (Voluntary Life Savers)
-- ============================================================================
CREATE TABLE IF NOT EXISTS donors (
  donor_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(25) UNIQUE NOT NULL,
  encrypted_emergency_contact TEXT, -- AES encrypted emergency contact
  blood_group blood_group_enum NOT NULL,
  gender donor_gender_enum NOT NULL,
  dob DATE NOT NULL,
  city VARCHAR(100) NOT NULL DEFAULT 'Panipat',
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  availability BOOLEAN NOT NULL DEFAULT TRUE,
  last_location TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_donation_date DATE,
  hemoglobin NUMERIC(4,1) CHECK (hemoglobin >= 8.0 AND hemoglobin <= 20.0),
  weight NUMERIC(5,1) CHECK (weight >= 40.0),
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  fcm_token TEXT,
  total_donations_count INTEGER NOT NULL DEFAULT 0,
  vehicle_type VARCHAR(30) DEFAULT 'Bike',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Optimization indexes for rapid geofence & blood group lookup
CREATE INDEX idx_donors_blood_group ON donors (blood_group);
CREATE INDEX idx_donors_availability ON donors (availability) WHERE availability = TRUE;
CREATE INDEX idx_donors_coords ON donors (latitude, longitude);
CREATE INDEX idx_donors_last_donation ON donors (last_donation_date);
CREATE INDEX idx_donors_composite_match ON donors (blood_group, availability, verified, latitude, longitude);

-- ============================================================================
-- 3. BLOOD REQUESTS (Emergency SOS Broadcasts)
-- ============================================================================
CREATE TABLE IF NOT EXISTS blood_requests (
  request_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id UUID NOT NULL REFERENCES hospitals(hospital_id) ON DELETE CASCADE,
  blood_group blood_group_enum NOT NULL,
  units_required INTEGER NOT NULL CHECK (units_required > 0),
  units_fulfilled INTEGER NOT NULL DEFAULT 0 CHECK (units_fulfilled >= 0),
  priority priority_enum NOT NULL DEFAULT 'CODE_RED',
  radius_km INTEGER NOT NULL DEFAULT 10 CHECK (radius_km IN (5, 10, 20, 30)),
  status request_status_enum NOT NULL DEFAULT 'BROADCASTING',
  emergency_category VARCHAR(100) NOT NULL DEFAULT 'Mass Casualty / Trauma',
  clinical_notes TEXT,
  doctor_name VARCHAR(150) NOT NULL,
  doctor_contact VARCHAR(30) NOT NULL,
  ward VARCHAR(100) NOT NULL,
  patient_condition TEXT,
  expected_response_minutes INTEGER NOT NULL DEFAULT 20,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_blood_requests_status ON blood_requests (status);
CREATE INDEX idx_blood_requests_hospital ON blood_requests (hospital_id);
CREATE INDEX idx_blood_requests_blood_group ON blood_requests (blood_group);
CREATE INDEX idx_blood_requests_priority ON blood_requests (priority);
CREATE INDEX idx_blood_requests_created ON blood_requests (created_at DESC);

-- ============================================================================
-- 4. DONOR RESPONSE (Live Dispatch & Heartbeat Tracking)
-- ============================================================================
CREATE TABLE IF NOT EXISTS donor_response (
  response_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES blood_requests(request_id) ON DELETE CASCADE,
  donor_id UUID NOT NULL REFERENCES donors(donor_id) ON DELETE CASCADE,
  status response_status_enum NOT NULL DEFAULT 'NOTIFIED',
  eta INTEGER, -- estimated arrival in minutes
  current_latitude DOUBLE PRECISION,
  current_longitude DOUBLE PRECISION,
  last_heartbeat TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,
  arrived_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  qr_token TEXT UNIQUE,
  qr_scanned BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(request_id, donor_id)
);

CREATE INDEX idx_donor_response_request ON donor_response (request_id);
CREATE INDEX idx_donor_response_donor ON donor_response (donor_id);
CREATE INDEX idx_donor_response_status ON donor_response (status);
CREATE INDEX idx_donor_response_qr ON donor_response (qr_token);

-- ============================================================================
-- 5. BLOOD INVENTORY (Hospital Cold-Vault Reserves)
-- ============================================================================
CREATE TABLE IF NOT EXISTS blood_inventory (
  inventory_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id UUID NOT NULL REFERENCES hospitals(hospital_id) ON DELETE CASCADE,
  blood_group blood_group_enum NOT NULL,
  available_units INTEGER NOT NULL DEFAULT 0 CHECK (available_units >= 0),
  critical_threshold INTEGER NOT NULL DEFAULT 4 CHECK (critical_threshold >= 0),
  reserve_units INTEGER NOT NULL DEFAULT 2,
  expiring_in_48h_units INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(hospital_id, blood_group)
);

CREATE INDEX idx_blood_inventory_lookup ON blood_inventory (hospital_id, blood_group);

-- ============================================================================
-- 6. NOTIFICATIONS (FCM Push Audit Log)
-- ============================================================================
CREATE TABLE IF NOT EXISTS notifications (
  notification_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_id UUID NOT NULL REFERENCES donors(donor_id) ON DELETE CASCADE,
  request_id UUID REFERENCES blood_requests(request_id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'SENT', -- SENT, DELIVERED, OPENED, FAILED
  fcm_message_id TEXT,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  opened_at TIMESTAMPTZ
);

CREATE INDEX idx_notifications_donor ON notifications (donor_id);
CREATE INDEX idx_notifications_request ON notifications (request_id);
CREATE INDEX idx_notifications_sent ON notifications (sent_at DESC);

-- ============================================================================
-- 7. DONATION HISTORY (Verifiable Ledger & Digital Certificate)
-- ============================================================================
CREATE TABLE IF NOT EXISTS donation_history (
  history_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  certificate_number VARCHAR(100) UNIQUE NOT NULL,
  donor_id UUID NOT NULL REFERENCES donors(donor_id) ON DELETE RESTRICT,
  hospital_id UUID NOT NULL REFERENCES hospitals(hospital_id) ON DELETE RESTRICT,
  request_id UUID REFERENCES blood_requests(request_id) ON DELETE SET NULL,
  blood_group blood_group_enum NOT NULL,
  units INTEGER NOT NULL DEFAULT 1 CHECK (units > 0),
  department VARCHAR(150) NOT NULL,
  attending_doctor VARCHAR(150) NOT NULL,
  recipient_patient_id VARCHAR(100),
  certificate_url TEXT,
  verification_hash TEXT NOT NULL,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_donation_history_donor ON donation_history (donor_id);
CREATE INDEX idx_donation_history_hospital ON donation_history (hospital_id);
CREATE INDEX idx_donation_history_cert ON donation_history (certificate_number);

-- ============================================================================
-- 8. AUDIT LOGS (Security, Rate Limiting & Hospital SOS Compliance)
-- ============================================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID,
  actor_role VARCHAR(50) NOT NULL, -- 'HOSPITAL', 'DONOR', 'SYSTEM', 'ADMIN'
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(100) NOT NULL,
  resource_id VARCHAR(100),
  ip_address VARCHAR(50),
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_actor ON audit_logs (actor_id, actor_role);
CREATE INDEX idx_audit_logs_action ON audit_logs (action);
CREATE INDEX idx_audit_logs_created ON audit_logs (created_at DESC);
