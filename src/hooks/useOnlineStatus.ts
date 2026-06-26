import { useEffect, useState } from 'react';

/**
 * Detects whether the device has a usable internet connection.
 * Listens to native online/offline events. We intentionally avoid network
 * pings to save battery — the offline sync hook will treat a failed request
 * as the authoritative offline signal and trigger a retry.
 */
export function useOnlineStatus(): boolean {
  const [online, setOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return online;
}
