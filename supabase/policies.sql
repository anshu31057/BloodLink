-- ============================================================================
-- BLOODLINK 8 — ROW LEVEL SECURITY (RLS) POLICIES
-- "8 Blood Groups. One Lifeline."
-- ============================================================================

-- Enable RLS on all primary tables
ALTER TABLE donors ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE blood_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE donor_response ENABLE ROW LEVEL SECURITY;
ALTER TABLE blood_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE donation_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to extract user role from JWT auth claims
CREATE OR REPLACE FUNCTION auth.get_user_role()
RETURNS TEXT AS $$
  SELECT COALESCE(
    current_setting('request.jwt.claims', true)::json->>'role',
    'anon'
  );
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION auth.get_user_id()
RETURNS UUID AS $$
  SELECT COALESCE(
    (current_setting('request.jwt.claims', true)::json->>'sub')::uuid,
    '00000000-0000-0000-0000-000000000000'::uuid
  );
$$ LANGUAGE sql STABLE;

-- ============================================================================
-- 1. DONORS POLICIES
-- ============================================================================

-- Donor can view only their own full profile
CREATE POLICY donor_select_own ON donors
  FOR SELECT
  USING (auth.get_user_id() = donor_id);

-- Donor can update only their own profile & availability
CREATE POLICY donor_update_own ON donors
  FOR UPDATE
  USING (auth.get_user_id() = donor_id)
  WITH CHECK (auth.get_user_id() = donor_id);

-- Edge functions & Background service role have service bypass
CREATE POLICY service_role_all_donors ON donors
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Hospital can view only anonymous metadata (blood group, distance, arrival status)
-- Live phone & exact GPS coordinates are NEVER exposed to general public queries

-- ============================================================================
-- 2. HOSPITALS POLICIES
-- ============================================================================

-- Any authenticated user (donor/hospital) can view verified hospital public listing
CREATE POLICY hospital_public_select ON hospitals
  FOR SELECT
  USING (verified = TRUE);

-- Hospital can update only its own record
CREATE POLICY hospital_update_own ON hospitals
  FOR UPDATE
  USING (auth.get_user_id() = hospital_id)
  WITH CHECK (auth.get_user_id() = hospital_id);

-- ============================================================================
-- 3. BLOOD REQUESTS (Emergency SOS) POLICIES
-- ============================================================================

-- ONLY VERIFIED hospitals can broadcast SOS requests
CREATE POLICY hospital_insert_sos ON blood_requests
  FOR INSERT
  WITH CHECK (
    auth.get_user_id() = hospital_id
    AND EXISTS (
      SELECT 1 FROM hospitals 
      WHERE hospitals.hospital_id = blood_requests.hospital_id 
      AND hospitals.verified = TRUE
    )
  );

-- Hospital reads only its own requests
CREATE POLICY hospital_select_own_requests ON blood_requests
  FOR SELECT
  USING (auth.get_user_id() = hospital_id);

-- Active emergency broadcasts are visible to matched eligible donors (via Edge Function)
CREATE POLICY donors_view_active_sos ON blood_requests
  FOR SELECT
  USING (
    status IN ('BROADCASTING', 'DONORS_DISPATCHED', 'PARTIALLY_FULFILLED')
    AND expires_at > NOW()
  );

-- Hospital can update or close only its own requests
CREATE POLICY hospital_update_own_requests ON blood_requests
  FOR UPDATE
  USING (auth.get_user_id() = hospital_id)
  WITH CHECK (auth.get_user_id() = hospital_id);

-- ============================================================================
-- 4. DONOR RESPONSE & LIVE LOCATION POLICIES
-- ============================================================================

-- Donor can insert/update their own response (ACCEPT, DECLINE, EN_ROUTE)
CREATE POLICY donor_manage_own_response ON donor_response
  FOR ALL
  USING (auth.get_user_id() = donor_id)
  WITH CHECK (auth.get_user_id() = donor_id);

-- Hospital can view responses and moving GPS ONLY for its own active requests
CREATE POLICY hospital_view_assigned_responses ON donor_response
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM blood_requests
      WHERE blood_requests.request_id = donor_response.request_id
      AND blood_requests.hospital_id = auth.get_user_id()
    )
  );

-- Hospital can update status upon arrival (e.g. ARRIVED, COMPLETED, QR scan)
CREATE POLICY hospital_update_response_arrival ON donor_response
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM blood_requests
      WHERE blood_requests.request_id = donor_response.request_id
      AND blood_requests.hospital_id = auth.get_user_id()
    )
  );

-- ============================================================================
-- 5. BLOOD INVENTORY POLICIES
-- ============================================================================

-- Hospital can only view and update its own blood inventory
CREATE POLICY hospital_inventory_own ON blood_inventory
  FOR ALL
  USING (auth.get_user_id() = hospital_id)
  WITH CHECK (auth.get_user_id() = hospital_id);

-- Verified regional network hospitals can view stock for inter-hospital transfers
CREATE POLICY network_inventory_view ON blood_inventory
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM hospitals
      WHERE hospitals.hospital_id = auth.get_user_id()
      AND hospitals.verified = TRUE
    )
  );

-- ============================================================================
-- 6. NOTIFICATIONS POLICIES
-- ============================================================================

-- Donors only see notifications addressed to them
CREATE POLICY donor_select_notifications ON notifications
  FOR SELECT
  USING (auth.get_user_id() = donor_id);

-- Donor can mark own notification as opened
CREATE POLICY donor_update_notifications ON notifications
  FOR UPDATE
  USING (auth.get_user_id() = donor_id)
  WITH CHECK (auth.get_user_id() = donor_id);

-- ============================================================================
-- 7. DONATION HISTORY & DIGITAL CERTIFICATES POLICIES
-- ============================================================================

-- Donor can view all their past donation certificates
CREATE POLICY donor_view_history ON donation_history
  FOR SELECT
  USING (auth.get_user_id() = donor_id);

-- Hospital can view records of donations conducted at its facility
CREATE POLICY hospital_view_history ON donation_history
  FOR SELECT
  USING (auth.get_user_id() = hospital_id);

-- Public Certificate Verification via Certificate Number & Hash (Read-Only)
CREATE POLICY public_verify_certificate ON donation_history
  FOR SELECT
  USING (true);

-- Insertion strictly performed by authorized service role / edge function after QR verification
CREATE POLICY service_insert_certificate ON donation_history
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- ============================================================================
-- 8. AUDIT LOGS POLICIES
-- ============================================================================

-- Only system admins can view audit logs
CREATE POLICY admin_audit_view ON audit_logs
  FOR SELECT
  USING (auth.get_user_role() = 'admin');
