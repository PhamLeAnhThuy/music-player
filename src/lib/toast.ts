export type ToastKind = 'success' | 'error' | 'info';

export type ToastPayload = {
  id?: string;
  message: string;
  kind?: ToastKind;
  durationMs?: number;
};

const TOAST_EVENT = 'music-player-toast';

export function showToast(payload: ToastPayload) {
  const detail: ToastPayload = {
    kind: 'info',
    durationMs: 2400,
    ...payload,
    id: payload.id || `${Date.now()}-${Math.random().toString(16).slice(2)}`,
  };

  window.dispatchEvent(new CustomEvent<ToastPayload>(TOAST_EVENT, { detail }));
}

export function subscribeToast(listener: (payload: ToastPayload) => void) {
  const handler = (event: Event) => {
    const customEvent = event as CustomEvent<ToastPayload>;
    if (!customEvent.detail?.message) {
      return;
    }

    listener(customEvent.detail);
  };

  window.addEventListener(TOAST_EVENT, handler as EventListener);
  return () => {
    window.removeEventListener(TOAST_EVENT, handler as EventListener);
  };
}
