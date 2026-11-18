import { useState, useEffect } from 'react';
import { onSnapshotsInSync } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../lib/firebase';

export interface SyncState {
  isOnline: boolean;
  isFirebaseActive: boolean;
  pendingWritesCount: number;
  statusBadge: {
    label: string;
    variant: 'synced' | 'offline' | 'demo' | 'pending';
  };
}

export function useNetworkSync(pendingWritesCount: number = 0): SyncState {
  const [isOnline, setIsOnline] = useState<boolean>(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    let unsubscribeSnapshot: (() => void) | undefined;
    if (isFirebaseConfigured && db) {
      try {
        unsubscribeSnapshot = onSnapshotsInSync(db, () => {
          // Snapshots are in sync
        });
      } catch {
        // Ignore
      }
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (unsubscribeSnapshot) unsubscribeSnapshot();
    };
  }, []);

  let statusBadge: SyncState['statusBadge'];

  if (!isFirebaseConfigured) {
    statusBadge = {
      label: 'LOCAL [INDEXEDDB]',
      variant: 'demo',
    };
  } else if (!isOnline) {
    statusBadge = {
      label: pendingWritesCount > 0 ? `OFFLINE [${pendingWritesCount} QUEUED]` : 'OFFLINE',
      variant: 'offline',
    };
  } else if (pendingWritesCount > 0) {
    statusBadge = {
      label: `SYNCING [${pendingWritesCount}]`,
      variant: 'pending',
    };
  } else {
    statusBadge = {
      label: 'SYNCED',
      variant: 'synced',
    };
  }

  return {
    isOnline,
    isFirebaseActive: isFirebaseConfigured,
    pendingWritesCount,
    statusBadge,
  };
}
