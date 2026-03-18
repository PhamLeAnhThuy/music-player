import { useEffect, useState } from 'react';

export default function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed top-4 left-0 right-0 z-[70] px-4">
      <div className="mx-auto max-w-md rounded-xl border border-amber-300/70 bg-amber-50 px-4 py-2 text-amber-800 shadow-lg dark:border-amber-400/30 dark:bg-amber-900/30 dark:text-amber-200">
        <p className="text-sm font-semibold">Offline mode: showing cached data.</p>
      </div>
    </div>
  );
}
