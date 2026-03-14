import { useState, useEffect, useRef } from 'react';
import { SyncService } from '@services/syncService';

interface SyncStatusBarProps {
  syncRef: React.RefObject<SyncService | null>;
}

export default function SyncStatusBar({ syncRef }: SyncStatusBarProps) {
  const [status, setStatus] = useState<string>('connected');
  const unsubRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const sync = syncRef.current;
    if (!sync) return;

    setStatus(sync.status);
    unsubRef.current = sync.onStatusChange(setStatus);

    return () => {
      unsubRef.current?.();
    };
  }, [syncRef.current]);

  if (status === 'connected') return null;

  const isError = status === 'offline';

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-30 px-4 py-1.5 text-center text-xs font-display font-bold transition-colors ${
        isError
          ? 'bg-red-500 text-white'
          : 'bg-amber-400 text-amber-900'
      }`}
    >
      {isError ? 'Offline — changes not synced' : 'Syncing...'}
    </div>
  );
}
