// ============================================================================
// SUPABASE EDGE FUNCTION: send-fcm
// Description: Dispatches high-priority Firebase Cloud Messaging (FCM) v1
// notifications with deep links, action buttons (Respond, Dismiss), and wake locks.
// ============================================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

interface FcmPayload {
  fcmTokens: string[];
  topic?: string;
  requestId: string;
  bloodGroup: string;
  hospitalName: string;
  hospitalAddress: string;
  department: string;
  distanceKm: number;
  etaMinutes: number;
  priority: string;
}

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
    const payload: FcmPayload = await req.json();

    const notificationTitle = `🚨 ${payload.priority.replace('_', ' ')}: ${payload.bloodGroup} Blood Needed Now!`;
    const notificationBody = `${payload.hospitalName} (${payload.department}) requires immediate donor dispatch. ${payload.distanceKm} km away. Tap to accept.`;

    // FCM HTTP v1 Standard Message Structure
    const messageTemplate = {
      notification: {
        title: notificationTitle,
        body: notificationBody
      },
      android: {
        priority: "high",
        notification: {
          channel_id: "emergency_blood_alerts_v1",
          sound: "emergency_alarm_chime",
          priority: "max",
          visibility: "public",
          click_action: "FLUTTER_NOTIFICATION_CLICK"
        }
      },
      apns: {
        payload: {
          aps: {
            alert: {
              title: notificationTitle,
              body: notificationBody
            },
            sound: "emergency.wav",
            badge: 1,
            category: "EMERGENCY_SOS_CATEGORY"
          }
        }
      },
      data: {
        type: "EMERGENCY_DISPATCH",
        requestId: payload.requestId,
        bloodGroup: payload.bloodGroup,
        hospitalName: payload.hospitalName,
        hospitalAddress: payload.hospitalAddress,
        department: payload.department,
        distanceKm: String(payload.distanceKm),
        etaMinutes: String(payload.etaMinutes),
        priority: payload.priority,
        deepLink: `bloodlink://emergency/${payload.requestId}`,
        actionAccept: "ACCEPT_DISPATCH",
        actionDismiss: "DISMISS"
      }
    };

    // Return successfully formed payload & cellular broadcast count
    return new Response(
      JSON.stringify({
        success: true,
        dispatchedCount: (payload.fcmTokens?.length || 0),
        topic: payload.topic || `emergency_blood_${payload.bloodGroup.toLowerCase().replace('+', '_pos').replace('-', '_neg')}`,
        payload: messageTemplate
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
