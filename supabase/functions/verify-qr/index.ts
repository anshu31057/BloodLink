// ============================================================================
// SUPABASE EDGE FUNCTION: verify-qr
// Description: Securely verifies the donor's digital QR code at hospital triage,
// prevents QR code reuse (anti-replay), marks donation complete, updates inventory,
// and issues an immutable cryptographic certificate of life-saving donation.
// ============================================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { qrToken, hospitalId, doctorName, department, recipientPatientId } = await req.json();

    if (!qrToken || !hospitalId) {
      return new Response(
        JSON.stringify({ error: 'Missing qrToken or hospitalId' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 1. Look up the donor response by QR Token
    const { data: responseRecord, error: lookupError } = await supabase
      .from('donor_response')
      .select('*, blood_requests(*), donors(*)')
      .eq('qr_token', qrToken)
      .single();

    if (lookupError || !responseRecord) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired QR code' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 2. Anti-Replay Check: QR cannot be reused!
    if (responseRecord.qr_scanned || responseRecord.status === 'COMPLETED') {
      return new Response(
        JSON.stringify({ 
          error: 'QR Code already scanned and processed. Anti-replay policy prevented duplicate redemption.',
          reused: true,
          completedAt: responseRecord.completed_at
        }),
        { status: 409, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const now = new Date().toISOString();
    const certNumber = `BL8-CERT-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
    
    // Create cryptographic verification hash
    const hashData = `${responseRecord.donor_id}:${hospitalId}:${certNumber}:${now}`;
    const encoder = new TextEncoder();
    const data = encoder.encode(hashData);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const verificationHash = '0x' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 32);

    // 3. Mark donor_response as COMPLETED and QR as scanned
    await supabase
      .from('donor_response')
      .update({
        status: 'COMPLETED',
        qr_scanned: true,
        completed_at: now
      })
      .eq('response_id', responseRecord.response_id);

    // 4. Update donor's last donation date and total donation count
    await supabase
      .from('donors')
      .update({
        last_donation_date: now.split('T')[0],
        total_donations_count: (responseRecord.donors?.total_donations_count || 0) + 1
      })
      .eq('donor_id', responseRecord.donor_id);

    // 5. Update request units fulfilled
    const currentFulfilled = (responseRecord.blood_requests?.units_fulfilled || 0) + 1;
    const isNowFulfilled = currentFulfilled >= (responseRecord.blood_requests?.units_required || 1);

    await supabase
      .from('blood_requests')
      .update({
        units_fulfilled: currentFulfilled,
        status: isNowFulfilled ? 'FULFILLED' : 'PARTIALLY_FULFILLED'
      })
      .eq('request_id', responseRecord.request_id);

    // 6. Update hospital blood inventory (add unit)
    const bloodGroup = responseRecord.donors?.blood_group || responseRecord.blood_requests?.blood_group;
    if (bloodGroup) {
      const { data: inv } = await supabase
        .from('blood_inventory')
        .select('available_units')
        .eq('hospital_id', hospitalId)
        .eq('blood_group', bloodGroup)
        .single();

      if (inv) {
        await supabase
          .from('blood_inventory')
          .update({
            available_units: inv.available_units + 1,
            updated_at: now
          })
          .eq('hospital_id', hospitalId)
          .eq('blood_group', bloodGroup);
      }
    }

    // 7. Insert immutable donation_history record
    const { data: certRecord, error: certError } = await supabase
      .from('donation_history')
      .insert({
        certificate_number: certNumber,
        donor_id: responseRecord.donor_id,
        hospital_id: hospitalId,
        request_id: responseRecord.request_id,
        blood_group: bloodGroup,
        units: 1,
        department: department || responseRecord.blood_requests?.ward || 'Trauma Triage',
        attending_doctor: doctorName || responseRecord.blood_requests?.doctor_name || 'Dr. On Duty',
        recipient_patient_id: recipientPatientId || `PAT-${Math.floor(1000 + Math.random() * 9000)}`,
        verification_hash: verificationHash,
        completed_at: now
      })
      .select()
      .single();

    if (certError) throw certError;

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Donation successfully verified and recorded into BloodLink 8 Network.',
        certificate: certRecord,
        unitsFulfilled: currentFulfilled,
        requestFulfilled: isNowFulfilled
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
});
