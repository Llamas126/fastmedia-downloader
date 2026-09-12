// Event bus ligero para notificaciones toast (sin dependencias externas).

export type ToastKind = "success" | "error" | "info";

export interface ToastMessage {
  id: number;
  kind: ToastKind;
  title: string;
  description?: string;
}

type ToastListener = (toasts: ToastMessage[]) => void;

const listeners = new Set<ToastListener>();
let toasts: ToastMessage[] = [];
let nextId = 1;

function emit() {
  listeners.forEach((listener) => listener([...toasts]));
}

export function toast(kind: ToastKind, title: string, description?: string, timeoutMs = 6000) {
  const id = nextId++;
  toasts = [...toasts, { id, kind, title, description }];
  emit();
  window.setTimeout(() => dismissToast(id), timeoutMs);
}

export function dismissToast(id: number) {
  toasts = toasts.filter((item) => item.id !== id);
  emit();
}

export function subscribeToast(listener: ToastListener): () => void {
  listeners.add(listener);
  listener([...toasts]);
  return () => {
    listeners.delete(listener);
  };
}