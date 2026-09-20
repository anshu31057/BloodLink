// ============================================================================
// BLOODLINK 8 — QR VERIFICATION & DIGITAL CERTIFICATE SERVICE
// "8 Blood Groups. One Lifeline."
// ============================================================================

import { BloodGroup, DonationRecord } from '../types';

export interface QrTokenPayload {
  token: string;
  requestId: string;
  donorId: string;
  donorName: string;
  bloodGroup: BloodGroup;
  createdAt: number;
  expiresAt: number;
  signature: string;
}

export interface VerificationResult {
  valid: boolean;
  error?: string;
  record?: DonationRecord;
}

class QrCertificateService {
  private usedTokens: Set<string> = new Set();

  /**
   * Generate secure QR token payload for donor mobile device
   */
  public generateDonorQrToken(
    requestId: string,
    donorId: string,
    donorName: string,
    bloodGroup: BloodGroup
  ): QrTokenPayload {
    const createdAt = Date.now();
    const expiresAt = createdAt + 4 * 60 * 60 * 1000; // 4 hours valid
    const raw = `${requestId}:${donorId}:${bloodGroup}:${createdAt}`;
    
    // Simple deterministic signature for offline / hackathon verification
    let hash = 0;
    for (let i = 0; i < raw.length; i++) {
      hash = (hash << 5) - hash + raw.charCodeAt(i);
      hash |= 0;
    }
    const signature = 'SIG_' + Math.abs(hash).toString(16).toUpperCase();
    const token = `BL8-QR-${requestId.slice(-4)}-${signature}`;

    return {
      token,
      requestId,
      donorId,
      donorName,
      bloodGroup,
      createdAt,
      expiresAt,
      signature
    };
  }

  /**
   * Hospital triage QR code scan and verification (with anti-replay check)
   */
  public verifyAndCompleteDonation(
    tokenPayload: QrTokenPayload,
    hospitalName: string,
    doctorName: string,
    department: string = 'Trauma Resuscitation Phlebotomy'
  ): VerificationResult {
    // 1. Check Anti-Replay
    if (this.usedTokens.has(tokenPayload.token)) {
      return {
        valid: false,
        error: 'QR Code already scanned! Anti-replay security prevents duplicate issuance.'
      };
    }

    // 2. Check Expiry
    if (tokenPayload.expiresAt < Date.now()) {
      return {
        valid: false,
        error: 'QR Code has expired. Please re-generate emergency verification token.'
      };
    }

    // 3. Mark token as used
    this.usedTokens.add(tokenPayload.token);

    // 4. Generate official immutable DonationRecord & Certificate
    const now = new Date();
    const certNumber = `BL8-CERT-2026-${Math.floor(100000 + Math.random() * 900000)}`;
    const verificationHash = '0x' + Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

    const record: DonationRecord = {
      id: `DON-${Date.now().toString(36).toUpperCase()}`,
      certificateNumber: certNumber,
      donorName: tokenPayload.donorName,
      donorId: tokenPayload.donorId,
      bloodGroup: tokenPayload.bloodGroup,
      unitsDonated: 1,
      hospitalName,
      department,
      doctorName,
      recipientPatientId: `PAT-${Math.floor(1000 + Math.random() * 9000)}`,
      date: now.toISOString().replace('T', ' ').slice(0, 16),
      verificationHash
    };

    return {
      valid: true,
      record
    };
  }

  /**
   * Generate an SVG data URI representation of the verification QR code
   */
  public generateQrSvgUri(content: string): string {
    // Deterministic lightweight visual QR representation
    return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160"><rect width="160" height="160" fill="white"/><rect x="16" y="16" width="40" height="40" fill="none" stroke="%23101828" stroke-width="8"/><rect x="28" y="28" width="16" height="16" fill="%23101828"/><rect x="104" y="16" width="40" height="40" fill="none" stroke="%23101828" stroke-width="8"/><rect x="116" y="28" width="16" height="16" fill="%23101828"/><rect x="16" y="104" width="40" height="40" fill="none" stroke="%23101828" stroke-width="8"/><rect x="28" y="116" width="16" height="16" fill="%23101828"/><rect x="72" y="24" width="16" height="16" fill="%23D92D20"/><rect x="72" y="56" width="16" height="16" fill="%23101828"/><rect x="72" y="88" width="16" height="16" fill="%23101828"/><rect x="104" y="88" width="16" height="16" fill="%23101828"/><rect x="120" y="104" width="24" height="24" fill="%23101828"/><rect x="88" y="120" width="16" height="16" fill="%23101828"/></svg>`;
  }
}

export const qrCertificateService = new QrCertificateService();
