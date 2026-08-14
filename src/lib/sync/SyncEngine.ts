import { initializeAppStateFromSupabase } from '../dbState';

export interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncedAt: string | null;
  pendingMutationsCount: number;
}

class SyncEngineManager {
  private status: SyncStatus = {
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    isSyncing: false,
    lastSyncedAt: null,
    pendingMutationsCount: 0,
  };

  private listeners: Array<(status: SyncStatus) => void> = [];

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.handleOnlineStatusChange(true));
      window.addEventListener('offline', () => this.handleOnlineStatusChange(false));
    }
  }

  public getStatus(): SyncStatus {
    return { ...this.status };
  }

  public subscribe(listener: (status: SyncStatus) => void): () => void {
    this.listeners.push(listener);
    listener(this.getStatus());
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private handleOnlineStatusChange(isOnline: boolean) {
    this.status.isOnline = isOnline;
    this.notify();
    if (isOnline) {
      this.syncWithCloud();
    }
  }

  public async syncWithCloud(): Promise<boolean> {
    if (!this.status.isOnline || this.status.isSyncing) return false;

    this.status.isSyncing = true;
    this.notify();

    try {
      await initializeAppStateFromSupabase();
      this.status.lastSyncedAt = new Date().toISOString();
      console.log('[SyncEngine] Successfully synced state with Supabase cloud!');
      return true;
    } catch (err) {
      console.error('[SyncEngine] Cloud sync failed:', err);
      return false;
    } finally {
      this.status.isSyncing = false;
      this.notify();
    }
  }

  private notify() {
    this.listeners.forEach(l => l(this.getStatus()));
  }
}

export const syncEngine = new SyncEngineManager();
