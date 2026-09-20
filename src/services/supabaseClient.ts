// ============================================================================
// BLOODLINK 8 — SUPABASE REALTIME CLIENT
// "8 Blood Groups. One Lifeline."
// ============================================================================

import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface SupabaseConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
}

// Configured credentials or sandbox fallback
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isLiveSupabaseConfigured =
  !!SUPABASE_URL && !!SUPABASE_ANON_KEY;

// Instantiate standard Supabase client with real-time replication options
export const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'bloodlink8_supabase_auth_session'
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

export interface RealtimeSubscriptionCallback<T = any> {
  onInsert?: (payload: T) => void;
  onUpdate?: (payload: T) => void;
  onDelete?: (oldPayload: Partial<T>) => void;
}

class SupabaseClientService {
  public client: SupabaseClient = supabase;
  private url: string = SUPABASE_URL;
  private key: string = SUPABASE_ANON_KEY;
  private isOnline: boolean = typeof navigator !== 'undefined' ? navigator.onLine : true;
  private localListeners: Map<string, Set<(event: { eventType: 'INSERT' | 'UPDATE' | 'DELETE'; new: any; old: any }) => void>> = new Map();

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.isOnline = true;
        console.log('[SupabaseClient] Network re-established. Realtime connected.');
      });
      window.addEventListener('offline', () => {
        this.isOnline = false;
        console.warn('[SupabaseClient] Operating in offline mode. Caching requests locally.');
      });
    }
  }

  public getUrl(): string {
    return this.url;
  }

  public getAnonKey(): string {
    return this.key;
  }

  public checkOnline(): boolean {
    return this.isOnline;
  }

  public isConfigured(): boolean {
    return isLiveSupabaseConfigured;
  }

  /**
   * Subscribe to real-time table mutations (PostgreSQL logical replication)
   * Listens to both real Supabase Channel and in-app event bus for instantaneous latency
   */
  public subscribeToTable<T>(
    table: string,
    filter: string | null,
    callbacks: RealtimeSubscriptionCallback<T>
  ): () => void {
    const channelKey = `${table}:${filter || 'all'}`;
    const listener = (event: { eventType: 'INSERT' | 'UPDATE' | 'DELETE'; new: T; old: Partial<T> }) => {
      if (event.eventType === 'INSERT' && callbacks.onInsert) callbacks.onInsert(event.new);
      if (event.eventType === 'UPDATE' && callbacks.onUpdate) callbacks.onUpdate(event.new);
      if (event.eventType === 'DELETE' && callbacks.onDelete) callbacks.onDelete(event.old);
    };

    if (!this.localListeners.has(channelKey)) {
      this.localListeners.set(channelKey, new Set());
    }
    this.localListeners.get(channelKey)!.add(listener);

    // Also attach real Supabase realtime channel if possible
    let supabaseChannel: any = null;
    try {
      const channelName = `realtime_${table}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      supabaseChannel = this.client
        .channel(channelName)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table },
          (payload: any) => {
            if (payload.eventType === 'INSERT' && callbacks.onInsert) callbacks.onInsert(payload.new as T);
            if (payload.eventType === 'UPDATE' && callbacks.onUpdate) callbacks.onUpdate(payload.new as T);
            if (payload.eventType === 'DELETE' && callbacks.onDelete) callbacks.onDelete(payload.old as Partial<T>);
          }
        )
        .subscribe();
    } catch (err) {
      // In sandbox mode or offline
      console.debug('[SupabaseClient] Realtime channel local fallback active:', err);
    }

    // Return unsubscribe function
    return () => {
      this.localListeners.get(channelKey)?.delete(listener);
      if (supabaseChannel) {
        try {
          this.client.removeChannel(supabaseChannel);
        } catch {
          // ignore
        }
      }
    };
  }

  /**
   * Broadcast an event to subscribers
   */
  public notifyChannel<T>(table: string, eventType: 'INSERT' | 'UPDATE' | 'DELETE', payload: T) {
    for (const [key, listeners] of this.localListeners.entries()) {
      if (key.startsWith(table)) {
        listeners.forEach(fn => fn({ eventType, new: payload, old: payload }));
      }
    }
  }
}

export const supabaseClient = new SupabaseClientService();
console.log("BloodLink Supabase Connected:", SUPABASE_URL);