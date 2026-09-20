// ============================================================================
// BLOODLINK 8 — OFFLINE CACHE & SYNCHRONIZATION SERVICE
// "8 Blood Groups. One Lifeline."
// ============================================================================

export interface QueuedOfflineAction {
  id: string;
  actionType: 'SOS_CREATE' | 'DONOR_STATUS' | 'INVENTORY_UPDATE';
  payload: any;
  queuedAt: number;
}

class OfflineSyncService {
  private queueKey = 'bl_offline_queue_v1';
  private syncInProgress = false;

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.processQueue();
      });
    }
  }

  public enqueueAction(actionType: QueuedOfflineAction['actionType'], payload: any): void {
    const queue = this.getQueue();
    const item: QueuedOfflineAction = {
      id: 'Q-' + Math.random().toString(36).substring(2, 9),
      actionType,
      payload,
      queuedAt: Date.now()
    };
    queue.push(item);
    this.saveQueue(queue);
  }

  public getQueue(): QueuedOfflineAction[] {
    if (typeof localStorage === 'undefined') return [];
    try {
      const data = localStorage.getItem(this.queueKey);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private saveQueue(queue: QueuedOfflineAction[]): void {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(this.queueKey, JSON.stringify(queue));
  }

  public async processQueue(): Promise<number> {
    if (this.syncInProgress) return 0;
    this.syncInProgress = true;
    const queue = this.getQueue();
    if (queue.length === 0) {
      this.syncInProgress = false;
      return 0;
    }

    console.log(`[OfflineSync] Processing ${queue.length} pending queued actions...`);
    // Simulate batch network transmission
    await new Promise(r => setTimeout(r, 600));

    this.saveQueue([]);
    this.syncInProgress = false;
    return queue.length;
  }
}

export const offlineSyncService = new OfflineSyncService();
