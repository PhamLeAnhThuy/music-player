import { useEffect, useMemo, useState } from 'react';
import { ToastPayload, subscribeToast } from '../lib/toast';

type ActiveToast = Required<Pick<ToastPayload, 'id' | 'message' | 'kind' | 'durationMs'>>;

export default function ToastHost() {
  const [toasts, setToasts] = useState<ActiveToast[]>([]);

  useEffect(() => {
    return subscribeToast((payload) => {
      const nextToast: ActiveToast = {
        id: payload.id || `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        message: payload.message,
        kind: payload.kind || 'info',
        durationMs: payload.durationMs || 2400,
      };

      setToasts((current) => [...current, nextToast].slice(-3));

      window.setTimeout(() => {
        setToasts((current) => current.filter((toast) => toast.id !== nextToast.id));
      }, nextToast.durationMs);
    });
  }, []);

  const toneClass = useMemo(
    () => ({
      success: 'border-emerald-300/70 bg-emerald-50 text-emerald-800 dark:border-emerald-400/30 dark:bg-emerald-900/30 dark:text-emerald-200',
      error: 'border-rose-300/70 bg-rose-50 text-rose-800 dark:border-rose-400/30 dark:bg-rose-900/30 dark:text-rose-200',
      info: 'border-slate-300/70 bg-slate-50 text-slate-800 dark:border-primary/30 dark:bg-background-dark/90 dark:text-slate-100',
    }),
    [],
  );

  return (
    <div className="pointer-events-none fixed top-4 left-0 right-0 z-[80] px-4">
      <div className="mx-auto max-w-md space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto rounded-xl border px-4 py-3 shadow-xl backdrop-blur-sm animate-[fadein_160ms_ease-out] ${toneClass[toast.kind]}`}
          >
            <p className="text-sm font-semibold">{toast.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
