// ============================================================================
// BLOODLINK 8 — FIREBASE CLOUD MESSAGING & PUSH NOTIFICATION SERVICE
// "8 Blood Groups. One Lifeline."
// ============================================================================

import { BloodGroup, EmergencyRequest } from '../types';

export interface FcmEmergencyMessagePayload {
  title: string;
  body: string;
  data: {
    requestId: string;
    bloodGroup: BloodGroup;
    hospitalName: string;
    department: string;
    distanceKm: string;
    etaMinutes: string;
    priority: string;
    deepLink: string;
  };
  actions: [
    { action: 'ACCEPT_DISPATCH'; title: '⚡ Respond & Accept' },
    { action: 'DISMISS'; title: '✕ Dismiss' }
  ];
}

class NotificationService {
  private permissionGranted: boolean = false;

  constructor() {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      this.permissionGranted = Notification.permission === 'granted';
    }
  }

  /**
   * Request browser / device notification permission
   */
  public async requestNotificationPermission(): Promise<boolean> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return false;
    }
    try {
      const permission = await Notification.requestPermission();
      this.permissionGranted = permission === 'granted';
      return this.permissionGranted;
    } catch {
      return false;
    }
  }

  /**
   * Format official High-Priority FCM payload for BloodLink 8
   */
  public buildEmergencyFcmPayload(
    request: EmergencyRequest,
    distanceKm: number = 3.2,
    etaMinutes: number = 12
  ): FcmEmergencyMessagePayload {
    return {
      title: `🚨 ${request.priority.replace('_', ' ')}: ${request.bloodGroup} Blood Needed Now!`,
      body: `${request.hospitalName} (${request.department}) requires immediate emergency donor dispatch. ${distanceKm} km away. Tap to accept.`,
      data: {
        requestId: request.id,
        bloodGroup: request.bloodGroup,
        hospitalName: request.hospitalName,
        department: request.department,
        distanceKm: distanceKm.toFixed(1),
        etaMinutes: String(etaMinutes),
        priority: request.priority,
        deepLink: `bloodlink://emergency/${request.id}`
      },
      actions: [
        { action: 'ACCEPT_DISPATCH', title: '⚡ Respond & Accept' },
        { action: 'DISMISS', title: '✕ Dismiss' }
      ]
    };
  }

  /**
   * Dispatch notification to device (Web Notification / ServiceWorker / In-App alert)
   */
  public async sendLocalNotification(
    title: string,
    body: string,
    options?: NotificationOptions
  ): Promise<void> {
    if (typeof window === 'undefined' || !('Notification' in window)) return;

    if (Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: 'emergency-sos',
          ...options
        });
      } catch {
        // notification suppressed
      }
    }
  }
}

export const notificationService = new NotificationService();
