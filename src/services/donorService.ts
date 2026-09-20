// ============================================================================
// BLOODLINK 8 — DONOR SERVICE
// "8 Blood Groups. One Lifeline."
// ============================================================================

import { BloodGroup, Donor, DonorStatus } from '../types';
import { supabaseClient } from './supabaseClient';

export interface DonorEligibilityCheck {
  isEligible: boolean;
  reasons: string[];
  daysSinceLastDonation: number;
  hemoglobinOk: boolean;
  weightOk: boolean;
  ageOk: boolean;
}

export interface DonorProfileUpdate {
  name?: string;
  phone?: string;
  bloodGroup?: BloodGroup;
  emergencyContact?: string;
  availability?: boolean;
  latitude?: number;
  longitude?: number;
  vehicleType?: 'Car' | 'Bike' | 'Metro/Walk';
}

class DonorService {
  /**
   * Check donor medical eligibility under National Blood Transfusion Council (NBTC) guidelines
   */
  public evaluateEligibility(donor: {
    age?: number;
    weightKg?: number;
    hemoglobin?: number;
    lastDonationDate?: string | null;
  }): DonorEligibilityCheck {
    const reasons: string[] = [];
    const age = donor.age || 28;
    const weight = donor.weightKg || 65;
    const hb = donor.hemoglobin || 14.2;

    let daysSinceLastDonation = 180;
    if (donor.lastDonationDate) {
      const last = new Date(donor.lastDonationDate).getTime();
      const diffTime = Math.abs(Date.now() - last);
      daysSinceLastDonation = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    const ageOk = age >= 18 && age <= 65;
    if (!ageOk) reasons.push('Donor must be between 18 and 65 years of age.');

    const weightOk = weight >= 45.0;
    if (!weightOk) reasons.push('Weight must be at least 45.0 kg.');

    const hemoglobinOk = hb >= 12.5;
    if (!hemoglobinOk) reasons.push('Hemoglobin must be at least 12.5 g/dL.');

    const intervalOk = daysSinceLastDonation >= 90;
    if (!intervalOk) {
      reasons.push(`Mandatory 90-day cooldown period active. ${90 - daysSinceLastDonation} days remaining.`);
    }

    return {
      isEligible: ageOk && weightOk && hemoglobinOk && intervalOk,
      reasons,
      daysSinceLastDonation,
      hemoglobinOk,
      weightOk,
      ageOk
    };
  }

  /**
   * Respond to an active Emergency SOS
   */
  public async respondToEmergency(
    requestId: string,
    donorId: string,
    action: 'ACCEPT' | 'DECLINE',
    etaMinutes: number = 15
  ): Promise<{ success: boolean; status: DonorStatus }> {
    const newStatus: DonorStatus = action === 'ACCEPT' ? 'EN_ROUTE' : 'CANCELLED';

    // Broadcast to Supabase Realtime channel
    supabaseClient.notifyChannel('donor_response', 'UPDATE', {
      requestId,
      donorId,
      status: newStatus,
      etaMinutes
    });

    return {
      success: true,
      status: newStatus
    };
  }

  /**
   * Update live donor telemetry location
   */
  public async updateLocationHeartbeat(
    donorId: string,
    latitude: number,
    longitude: number
  ): Promise<void> {
    supabaseClient.notifyChannel('donors', 'UPDATE', {
      donorId,
      latitude,
      longitude,
      lastHeartbeat: new Date().toISOString()
    });
  }
}

export const donorService = new DonorService();
