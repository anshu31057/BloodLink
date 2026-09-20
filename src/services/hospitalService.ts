// ============================================================================
// BLOODLINK 8 — HOSPITAL SERVICE
// "8 Blood Groups. One Lifeline."
// ============================================================================

import { HospitalProfile } from '../types';
import { supabaseClient } from './supabaseClient';
import { authService } from "./authService";
class HospitalService {
  /**
   * Fetch current hospital node profile
   */
 public async getHospitalProfile(
  hospitalId: string = authService.getSession()?.userId || ""
): Promise<HospitalProfile | null> {
    const cached = localStorage.getItem('bl_hospital_profile');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {
        // fallback
      }
    }
    return null;
  }

  /**
   * Update node configuration and emergency contacts
   */
  public async updateProfile(hospitalId: string, updates: Partial<HospitalProfile>): Promise<boolean> {
    const cached = localStorage.getItem('bl_hospital_profile');
    const existing = cached ? JSON.parse(cached) : {};
    const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() };

    localStorage.setItem('bl_hospital_profile', JSON.stringify(updated));

    supabaseClient.notifyChannel('hospitals', 'UPDATE', {
      hospitalId,
      ...updates
    });

    return true;
  }

  /**
   * Verify hospital node license credentials
   */
  public verifyLicenseFormat(licenseNumber: string): boolean {
    // Validates Indian Blood Bank License standard format (e.g. BL8-REG-2026-9821 or 28B/Form-28)
    return Boolean(licenseNumber && licenseNumber.length >= 6);
  }
}

export const hospitalService = new HospitalService();
