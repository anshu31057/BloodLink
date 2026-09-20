// ============================================================================
// SUPABASE EDGE FUNCTION: match-donors
// Description: Matches nearby eligible voluntary donors within radius using
// Haversine spatial calculation and blood compatibility rules.
// ============================================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

// Medical blood compatibility table: Which donors can donate to the recipient?
const BLOOD_COMPATIBILITY_RECIPIENT_MAP: Record<string, string[]> = {
  'O-': ['O-'],
  'O+': ['O-', 'O+'],
  'A-': ['O-', 'A-'],
  'A+': ['O-', 'O+', 'A-', 'A+'],
  'B-': ['O-', 'B-'],
  'B+': ['O-', 'O+', 'B-', 'B+'],
  'AB-': ['O-', 'A-', 'B-', 'AB-'],
  'AB+': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'] // Universal Recipient
};

// Haversine formula: returns distance in kilometers
function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's mean radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(2));
}

// Estimate ETA in minutes based on urban traffic density (avg 25 km/h urban emergency response)
function estimateUrbanEtaMinutes(distanceKm: number, vehicleType: string = 'Bike'): number {
  const speedKmh = vehicleType === 'Bike' ? 30 : vehicleType === 'Car' ? 22 : 15;
  const bufferMinutes = 3; // response + dispatch prep time
  const travelMinutes = (distanceKm / speedKmh) * 60;
  return Math.max(3, Math.round(travelMinutes + bufferMinutes));
}

serve(async (req: Request) => {
  // CORS Headers
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

    const body = await req.json();
    const {
      requestId,
      hospitalLatitude,
      hospitalLongitude,
      bloodGroup,
      radiusKm = 10,
      priority = 'CODE_RED',
      unitsRequired = 2
    } = body;

    if (!hospitalLatitude || !hospitalLongitude || !bloodGroup) {
      return new Response(
        JSON.stringify({ error: 'Missing hospital coordinates or target bloodGroup' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 1. Determine compatible blood donor groups
    const eligibleDonorGroups = BLOOD_COMPATIBILITY_RECIPIENT_MAP[bloodGroup] || [bloodGroup];

    // 2. Fetch available, verified donors from Supabase
    // Donors must have last_donation_date > 90 days ago (or null)
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const { data: candidates, error: dbError } = await supabase
      .from('donors')
      .select('donor_id, name, phone, blood_group, latitude, longitude, vehicle_type, fcm_token, hemoglobin, weight, last_donation_date')
      .in('blood_group', eligibleDonorGroups)
      .eq('availability', true)
      .eq('verified', true)
      .or(`last_donation_date.is.null,last_donation_date.lt.${ninetyDaysAgo.toISOString().split('T')[0]}`);

    if (dbError) throw dbError;

    // 3. Apply Geofence filter & calculate ETAs
    const matchedDonors = (candidates || [])
      .map(donor => {
        const distance = calculateHaversineDistance(
          hospitalLatitude,
          hospitalLongitude,
          donor.latitude,
          donor.longitude
        );
        const eta = estimateUrbanEtaMinutes(distance, donor.vehicle_type);
        return {
          ...donor,
          distanceKm: distance,
          etaMinutes: eta
        };
      })
      .filter(donor => donor.distanceKm <= radiusKm)
      .sort((a, b) => a.distanceKm - b.distanceKm); // Nearest first

    // 4. Batch record notifications in database for audit
    const notificationInserts = matchedDonors.slice(0, 30).map(d => ({
      donor_id: d.donor_id,
      request_id: requestId,
      title: `🚨 EMERGENCY: ${bloodGroup} Blood Needed Urgently`,
      message: `${d.distanceKm} km away. Estimated ETA: ${d.etaMinutes} mins. Tap to respond immediately.`,
      status: 'SENT'
    }));

    if (notificationInserts.length > 0) {
      await supabase.from('notifications').insert(notificationInserts);
    }

    return new Response(
      JSON.stringify({
        success: true,
        matchedCount: matchedDonors.length,
        eligibleGroups: eligibleDonorGroups,
        radiusKm,
        topDonors: matchedDonors.slice(0, 15)
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
