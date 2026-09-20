// ============================================================================
// BLOODLINK 8 — HACKATHON DEMO MODE SIMULATION SERVICE
// "Simulate Highway Accident" — 90s Automated Life-Saving Emergency Scenario
// ============================================================================

import { EmergencyRequest, Donor } from '../types';

export interface DemoStep {
  id: number;
  timeSeconds: number;
  phaseTitle: string;
  description: string;
  badge: string;
  status: 'PENDING' | 'ACTIVE' | 'COMPLETED';
}

export type DemoStateListener = (state: {
  isRunning: boolean;
  isPaused: boolean;
  currentStepIndex: number;
  elapsedSeconds: number;
  speed: number;
  activeRequestId: string | null;
  logs: string[];
}) => void;

class HackathonDemoService {
  private isRunning: boolean = false;
  private isPaused: boolean = false;
  private currentStepIndex: number = 0;
  private elapsedSeconds: number = 0;
  private speedMultiplier: number = 1; // 1x, 3x, 10x
  private intervalTimer: any = null;
  private listeners: Set<DemoStateListener> = new Set();
  private logs: string[] = [];
  private activeRequestId: string | null = null;

  public readonly steps: DemoStep[] = [
    {
      id: 1,
      timeSeconds: 0,
      phaseTitle: '🚨 Code Red SOS Broadcast',
      description: 'Hospital broadcasts emergency for O- Universal Donor blood due to NH-44 Toll collision.',
      badge: 'SOS Broadcast',
      status: 'PENDING'
    },
    {
      id: 2,
      timeSeconds: 5,
      phaseTitle: '📲 3 Donors Alerted via FCM',
      description: 'High-priority push notifications dispatched to 3 compatible voluntary donors within 10 km.',
      badge: 'FCM Alerts',
      status: 'PENDING'
    },
    {
      id: 3,
      timeSeconds: 12,
      phaseTitle: '⚡ 2 Donors Accept & Dispatch',
      description: 'Dr. Siddharth Rao (Car) & Megha Singhal (Bike) respond and commence live navigation.',
      badge: 'En Route',
      status: 'PENDING'
    },
    {
      id: 4,
      timeSeconds: 28,
      phaseTitle: '🛰️ Live GPS Radar & ETA Stream',
      description: '15-second heartbeat telemetry updating live coordinates & decreasing ETAs on hospital map.',
      badge: 'GPS Telemetry',
      status: 'PENDING'
    },
    {
      id: 5,
      timeSeconds: 55,
      phaseTitle: '🏥 Triage Arrival at Emergency Bay',
      description: 'First responder arrives at trauma triage. Attending phlebotomist prepares crossmatch.',
      badge: 'Arrived Triage',
      status: 'PENDING'
    },
    {
      id: 6,
      timeSeconds: 72,
      phaseTitle: '🔒 Digital QR Scan & Anti-Replay',
      description: 'Hospital terminal scans single-use cryptographic QR code to authenticate donor.',
      badge: 'QR Verified',
      status: 'PENDING'
    },
    {
      id: 7,
      timeSeconds: 88,
      phaseTitle: '📜 Certificate Issued & SOS Fulfilled',
      description: 'Blood collection complete. Immutable digital certificate generated. SOS stood down.',
      badge: 'SOS Fulfilled',
      status: 'PENDING'
    }
  ];

  public subscribe(listener: DemoStateListener): () => void {
    this.listeners.add(listener);
    this.emit();
    return () => this.listeners.delete(listener);
  }

  private emit(): void {
    const payload = {
      isRunning: this.isRunning,
      isPaused: this.isPaused,
      currentStepIndex: this.currentStepIndex,
      elapsedSeconds: this.elapsedSeconds,
      speed: this.speedMultiplier,
      activeRequestId: this.activeRequestId,
      logs: this.logs
    };
    this.listeners.forEach(fn => fn(payload));
  }

  public setSpeed(speed: number): void {
    this.speedMultiplier = speed;
    this.emit();
  }

  public pause(): void {
    this.isPaused = true;
    this.emit();
  }

  public resume(): void {
    this.isPaused = false;
    this.emit();
  }

  public reset(): void {
    if (this.intervalTimer) clearInterval(this.intervalTimer);
    this.isRunning = false;
    this.isPaused = false;
    this.currentStepIndex = 0;
    this.elapsedSeconds = 0;
    this.activeRequestId = null;
    this.logs = [];
    this.steps.forEach(s => (s.status = 'PENDING'));
    this.emit();
  }

  /**
   * Start the full 90-second automated simulation
   */
  public async startSimulation(
    broadcastSOS: (sosData: Partial<EmergencyRequest>) => string | Promise<string>,
    updateDonorStatus: (donorId: string, status: any, newEta?: number) => void,
    confirmDonorArrival: (donorId: string) => void,
    closeRequest: (requestId: string) => void
  ): Promise<void> {
    this.reset();
    this.isRunning = true;
    this.logs.push('[00:00] Simulation initialized: NH-44 GT Road Mass Casualty Scenario.');

    // Step 1: Create Emergency SOS
    const sosResult = broadcastSOS({
      emergencyType: 'Mass Casualty: NH-44 Multi-Vehicle Collision at Panipat Toll',
      emergencyCategory: 'Mass Casualty / Trauma',
      bloodGroup: 'O-',
      unitsRequired: 2,
      priority: 'CODE_RED',
      patientAge: 29,
      patientGender: 'Male',
      patientCondition: 'Grade-4 Splenic rupture, Hypovolemic Shock, BP 65/40',
      clinicalNotes: 'Multiple vehicle crash on NH-44 Toll. Universal donor blood immediately required in OT-1.',
      broadcastRadiusKm: 10,
      expectedResponseMinutes: 15
    });

    const newReqId = typeof sosResult === 'string' ? sosResult : await sosResult;

    this.activeRequestId = newReqId;
    this.steps[0].status = 'COMPLETED';
    this.currentStepIndex = 0;
    this.emit();

    // Start ticker
    this.intervalTimer = setInterval(() => {
      if (this.isPaused) return;

      this.elapsedSeconds += 1 * this.speedMultiplier;

      // Check step transitions
      if (this.elapsedSeconds >= 5 && this.currentStepIndex < 1) {
        this.currentStepIndex = 1;
        this.steps[1].status = 'COMPLETED';
        this.logs.unshift(`[00:05] FCM Alert pushed to 3 nearby O- voluntary lifesavers.`);
      }

      if (this.elapsedSeconds >= 12 && this.currentStepIndex < 2) {
        this.currentStepIndex = 2;
        this.steps[2].status = 'COMPLETED';
        this.logs.unshift(`[00:12] 2 Donors accepted dispatch! Live navigation activated.`);
      }

      if (this.elapsedSeconds >= 28 && this.currentStepIndex < 3) {
        this.currentStepIndex = 3;
        this.steps[3].status = 'COMPLETED';
        this.logs.unshift(`[00:28] Real-time GPS radar heartbeat active. Donor distance: 2.1 km (ETA: 6 mins).`);
      }

      if (this.elapsedSeconds >= 55 && this.currentStepIndex < 4) {
        this.currentStepIndex = 4;
        this.steps[4].status = 'COMPLETED';
        this.logs.unshift(`[00:55] First responder arrived at Emergency Bay! Ready for triage verification.`);
        confirmDonorArrival('DNR-8821');
      }

      if (this.elapsedSeconds >= 72 && this.currentStepIndex < 5) {
        this.currentStepIndex = 5;
        this.steps[5].status = 'COMPLETED';
        this.logs.unshift(`[01:12] Single-use QR token scanned. Cryptographic hash verified (Anti-replay OK).`);
      }

      if (this.elapsedSeconds >= 88 && this.currentStepIndex < 6) {
        this.currentStepIndex = 6;
        this.steps[6].status = 'COMPLETED';
        this.logs.unshift(`[01:28] Transfusion phlebotomy completed! Digital Certificate #BL8-CERT-2026-9821 issued.`);
        closeRequest(newReqId);
      }

      if (this.elapsedSeconds >= 90) {
        clearInterval(this.intervalTimer);
        this.isRunning = false;
        this.logs.unshift(`[01:30] Simulation completed successfully with all objectives met.`);
      }

      this.emit();
    }, 1000);
  }
}

export const hackathonDemoService = new HackathonDemoService();
