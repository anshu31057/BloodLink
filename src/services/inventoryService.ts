// ============================================================================
// BLOODLINK 8 — BLOOD BANK INVENTORY & TRANSFER SERVICE
// "8 Blood Groups. One Lifeline."
// ============================================================================

import { BloodGroup, BloodInventoryItem } from '../types';
import { supabaseClient } from './supabaseClient';

export interface InterHospitalTransferRequest {
  transferId: string;
  sourceHospitalId: string;
  sourceHospitalName: string;
  targetHospitalId: string;
  targetHospitalName: string;
  bloodGroup: BloodGroup;
  unitsRequested: number;
  urgency: 'IMMEDIATE_TRAUMA' | 'OT_STANDBY' | 'ROUTINE';
  status: 'PENDING' | 'APPROVED' | 'IN_TRANSIT' | 'RECEIVED' | 'REJECTED';
  requestedAt: string;
}

class InventoryService {
  /**
   * Calculate overall reserve health status
   */
  public evaluateInventoryHealth(inventory: BloodInventoryItem[]): {
    totalUnits: number;
    criticalGroups: BloodGroup[];
    expiringUnitsCount: number;
    healthScore: 'OPTIMAL' | 'WARNING' | 'CRITICAL';
  } {
    let totalUnits = 0;
    const criticalGroups: BloodGroup[] = [];
    let expiringUnitsCount = 0;

    for (const item of inventory) {
      totalUnits += item.availableUnits;
      if (item.availableUnits <= item.criticalThreshold) {
        criticalGroups.push(item.bloodGroup);
      }
      expiringUnitsCount += item.expiringIn48hUnits || 0;
    }

    let healthScore: 'OPTIMAL' | 'WARNING' | 'CRITICAL' = 'OPTIMAL';
    if (criticalGroups.length >= 3 || criticalGroups.includes('O-')) {
      healthScore = 'CRITICAL';
    } else if (criticalGroups.length > 0) {
      healthScore = 'WARNING';
    }

    return {
      totalUnits,
      criticalGroups,
      expiringUnitsCount,
      healthScore
    };
  }

  /**
   * Request inter-hospital blood bag transfer between network nodes
   */
  public async requestTransfer(
    transfer: Omit<InterHospitalTransferRequest, 'transferId' | 'status' | 'requestedAt'>
  ): Promise<InterHospitalTransferRequest> {
    const fullTransfer: InterHospitalTransferRequest = {
      ...transfer,
      transferId: `XFR-${Date.now().toString(36).toUpperCase()}`,
      status: 'PENDING',
      requestedAt: new Date().toISOString()
    };

    supabaseClient.notifyChannel('blood_transfers', 'INSERT', fullTransfer);
    return fullTransfer;
  }
}

export const inventoryService = new InventoryService();
