// ============================================================================
// BLOODLINK 8 — EMERGENCY REQUEST SERVICE (PRODUCTION)
// "8 Blood Groups. One Lifeline."
// ============================================================================

import { EmergencyRequest } from "../types";
import { supabaseClient } from "./supabaseClient";
import { securityService } from "./securityService";

class RequestService {
  /**
   * Broadcast Emergency SOS
   * Inserts into Supabase + triggers realtime dashboard update.
   */
  public async createEmergencyRequest(
    requestData: Partial<EmergencyRequest>,
    hospitalId: string
  ): Promise<{
    success: boolean;
    request?: EmergencyRequest;
    error?: string;
  }> {
    try {
      // ---------------------------------------------------------------------
      // 1. Security Rate Limit
      // ---------------------------------------------------------------------
      const rateLimitCheck =
        securityService.checkHospitalSosRateLimit(hospitalId);

      if (!rateLimitCheck.allowed) {
        return {
          success: false,
          error: `SOS rate limit exceeded. Wait ${rateLimitCheck.waitMinutes} minutes before sending another emergency.`,
        };
      }

      // ---------------------------------------------------------------------
      // 2. Prepare Emergency Payload
      // ---------------------------------------------------------------------
      const now = new Date();
      const expiry = new Date(
        now.getTime() +
          (requestData.expectedResponseMinutes ?? 20) * 60 * 1000
      );

      const fullRequest: EmergencyRequest = {
        id: "",
        hospitalId,

        hospitalName:
          requestData.hospitalName ?? "Verified Emergency Network Node",

        hospitalAddress:
          requestData.hospitalAddress ??
          "North India Command Node / Panipat Regional Network",

        department: requestData.department ?? "Level 1 Trauma Triage",

        doctorName: requestData.doctorName ?? "Dr. On Duty",

        doctorContact: requestData.doctorContact ?? "+91 1800-11-2566",

        bloodGroup: requestData.bloodGroup ?? "O-",

        unitsRequired: requestData.unitsRequired ?? 2,
        unitsFulfilled: 0,

        emergencyType:
          requestData.emergencyType ?? "Emergency Clinical Transfusion",

        emergencyCategory:
          requestData.emergencyCategory ?? "Mass Casualty / Trauma",

        priority: requestData.priority ?? "CODE_RED",

        patientAge: requestData.patientAge ?? 35,
        patientGender: requestData.patientGender ?? "Male",

        patientCondition:
          requestData.patientCondition ??
          "Critical hemorrhagic trauma requiring immediate blood transfusion.",

        clinicalNotes:
          requestData.clinicalNotes ??
          "Immediate crossmatch and donor dispatch required.",

        locationWard: requestData.locationWard ?? "Emergency OT-1",

        broadcastRadiusKm: requestData.broadcastRadiusKm ?? 10,

        expectedResponseMinutes:
          requestData.expectedResponseMinutes ?? 20,

        createdAt: now.toISOString(),
        expiresAt: expiry.toISOString(),

        status: "BROADCASTING",

        acceptedDonorsCount: 0,
        notifiedDonorsCount: 0,

        latitude: requestData.latitude ?? 29.3909,
        longitude: requestData.longitude ?? 76.9635,
      };

      // ---------------------------------------------------------------------
      // 3. Audit Log
      // ---------------------------------------------------------------------
      securityService.recordAuditLog({
        actorId: hospitalId,
        actorRole: "HOSPITAL",
        action: "SOS_BROADCAST_CREATED",
        resourceType: "blood_requests",
        resourceId: "PENDING_DATABASE_UUID",
        metadata: {
          bloodGroup: fullRequest.bloodGroup,
          unitsRequired: fullRequest.unitsRequired,
          priority: fullRequest.priority,
        },
      });

      // ---------------------------------------------------------------------
      // 4. Insert SOS into Supabase
      // ---------------------------------------------------------------------
      const { data, error } = await supabaseClient.client
        .from("blood_requests")
        .insert({
          hospital_id: hospitalId,

          blood_group: fullRequest.bloodGroup,
          units_required: fullRequest.unitsRequired,
          units_fulfilled: 0,

          priority: fullRequest.priority,
          status: "BROADCASTING",

          emergency_category: fullRequest.emergencyCategory,

          clinical_notes: fullRequest.clinicalNotes,

          doctor_name: fullRequest.doctorName,
          doctor_contact: fullRequest.doctorContact,

          ward: fullRequest.locationWard,

          patient_condition: fullRequest.patientCondition,

          radius_km: fullRequest.broadcastRadiusKm,

          expected_response_minutes:
            fullRequest.expectedResponseMinutes,

          expires_at: fullRequest.expiresAt,
        })
        .select()
        .single();

      if (error) {
        console.error("❌ SOS Insert Error:", error);
        return {
          success: false,
          error: error.message,
        };
      }

      // ---------------------------------------------------------------------
      // 5. Trigger Realtime Dashboard Update
      // ---------------------------------------------------------------------
      supabaseClient.notifyChannel(
        "blood_requests",
        "INSERT",
        data
      );

      console.log("🩸 SOS Broadcast Saved:", data);

      // ---------------------------------------------------------------------
      // 6. Return Real Request Object
      // ---------------------------------------------------------------------
      const request: EmergencyRequest = {
        ...fullRequest,

        id: data.request_id,
        hospitalId: data.hospital_id,

        status: data.status,

        createdAt: data.created_at,
        expiresAt: data.expires_at,

        unitsFulfilled: data.units_fulfilled,
      };

      return {
        success: true,
        request,
      };
    } catch (err: any) {
      console.error("❌ Emergency Request Service Error:", err);

      return {
        success: false,
        error:
          err?.message ??
          "Unable to broadcast emergency SOS.",
      };
    }
  }

  /**
   * Close Emergency Request
   */
  public async closeRequest(
    requestId: string
  ): Promise<boolean> {
    const { error } = await supabaseClient.client
      .from("blood_requests")
      .update({
        status: "FULFILLED",
      })
      .eq("request_id", requestId);

    if (error) {
      console.error("❌ Close Request Error:", error);
      return false;
    }

    supabaseClient.notifyChannel(
      "blood_requests",
      "UPDATE",
      {
        request_id: requestId,
        status: "FULFILLED",
      }
    );

    return true;
  }

  /**
   * Cancel Emergency Request
   */
  public async cancelRequest(
    requestId: string
  ): Promise<boolean> {
    const { error } = await supabaseClient.client
      .from("blood_requests")
      .update({
        status: "CANCELLED",
      })
      .eq("request_id", requestId);

    if (error) {
      console.error("❌ Cancel Request Error:", error);
      return false;
    }

    supabaseClient.notifyChannel(
      "blood_requests",
      "UPDATE",
      {
        request_id: requestId,
        status: "CANCELLED",
      }
    );

    return true;
  }
}

export const requestService = new RequestService();