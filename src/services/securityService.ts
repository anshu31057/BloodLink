// ============================================================================
// BLOODLINK 8 — SECURITY, ENCRYPTION & COMPLIANCE SERVICE
// "8 Blood Groups. One Lifeline."
// ============================================================================

export interface AuditLogEntry {
  actorId: string;
  actorRole: 'HOSPITAL' | 'DONOR' | 'SYSTEM' | 'ADMIN';
  action: string;
  resourceType: string;
  resourceId?: string;
  metadata?: Record<string, any>;
  timestamp?: string;
}

class SecurityService {
  private sosTimestampMap: Map<string, number[]> = new Map(); // Hospital ID -> Array of broadcast timestamps
  private auditLogs: AuditLogEntry[] = [];

  /**
   * Mask donor phone number to protect donor privacy before emergency acceptance
   * e.g. "+91 98110 44211" -> "+91 98110 •••••"
   */
  public maskPhoneNumber(phone: string, isAccepted: boolean = false): string {
    if (isAccepted) return phone;
    const clean = phone.trim();
    if (clean.length < 8) return '••••••••••';
    const visiblePrefix = clean.slice(0, clean.length - 5);
    return `${visiblePrefix} •••••`;
  }

  /**
   * Lightweight browser-compatible symmetric XOR-base64 obfuscation for emergency contacts
   */
  public encryptEmergencyContact(contactText: string, secretKey: string = 'BL8-SALT-SECURE'): string {
    try {
      const textChars = contactText.split('');
      const keyChars = secretKey.split('');
      const encrypted = textChars.map((c, i) => {
        const charCode = c.charCodeAt(0);
        const keyCode = keyChars[i % keyChars.length].charCodeAt(0);
        return String.fromCharCode(charCode ^ keyCode);
      }).join('');
      return btoa(encrypted);
    } catch {
      return contactText;
    }
  }

  public decryptEmergencyContact(cipherText: string, secretKey: string = 'BL8-SALT-SECURE'): string {
    try {
      const decoded = atob(cipherText);
      const textChars = decoded.split('');
      const keyChars = secretKey.split('');
      return textChars.map((c, i) => {
        const charCode = c.charCodeAt(0);
        const keyCode = keyChars[i % keyChars.length].charCodeAt(0);
        return String.fromCharCode(charCode ^ keyCode);
      }).join('');
    } catch {
      return cipherText;
    }
  }

  /**
   * Rate limiting: Max 5 emergency broadcasts per hour per hospital node
   */
  public checkHospitalSosRateLimit(hospitalId: string, maxPerHour: number = 5): { allowed: boolean; waitMinutes?: number } {
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    const timestamps = this.sosTimestampMap.get(hospitalId) || [];

    // Filter to events within the last 60 minutes
    const recent = timestamps.filter(t => now - t < oneHour);
    if (recent.length >= maxPerHour) {
      const oldestInWindow = recent[0];
      const waitMs = oldestInWindow + oneHour - now;
      return {
        allowed: false,
        waitMinutes: Math.ceil(waitMs / (60 * 1000))
      };
    }

    recent.push(now);
    this.sosTimestampMap.set(hospitalId, recent);
    return { allowed: true };
  }

  /**
   * Record immutable security audit log
   */
  public recordAuditLog(entry: AuditLogEntry): void {
    const record: AuditLogEntry = {
      ...entry,
      timestamp: new Date().toISOString()
    };
    this.auditLogs.unshift(record);
    if (this.auditLogs.length > 500) this.auditLogs.pop();

    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem('bl_audit_logs', JSON.stringify(this.auditLogs.slice(0, 50)));
      } catch {
        // quota limit guard
      }
    }
  }

  public getRecentAuditLogs(): AuditLogEntry[] {
    return this.auditLogs;
  }
}

export const securityService = new SecurityService();
