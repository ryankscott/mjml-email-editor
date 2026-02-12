import { useEffect, useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";

import { cn } from "@/lib/utils";

type ToastTone = "info" | "success" | "error";

type ToastRecord = {
  id: number;
  message: string;
  tone: ToastTone;
  duration: number;
};

type Listener = (toasts: ToastRecord[]) => void;

let idSeed = 1;
let records: ToastRecord[] = [];
const listeners = new Set<Listener>();

function emit(next: ToastRecord[]) {
  records = next;
  listeners.forEach((listener) => listener(records));
}

function dismiss(id: number) {
  emit(records.filter((record) => record.id !== id));
}

function enqueue(message: string, tone: ToastTone, duration = 2800) {
  const id = idSeed;
  idSeed += 1;
  emit([...records, { id, message, tone, duration }]);
  window.setTimeout(() => dismiss(id), duration);
}

export const toast = {
  message(message: string, options?: { duration?: number }) {
    enqueue(message, "info", options?.duration);
  },
  success(message: string, options?: { duration?: number }) {
    enqueue(message, "success", options?.duration);
  },
  error(message: string, options?: { duration?: number }) {
    enqueue(message, "error", options?.duration);
  },
  dismiss,
};

export function Toaster() {
  const [toasts, setToasts] = useState<ToastRecord[]>(records);

  useEffect(() => {
    const listener: Listener = (next) => setToasts(next);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-[min(92vw,24rem)] flex-col gap-2"
    >
      {toasts.map((item) => (
        <ToastItem key={item.id} toast={item} />
      ))}
    </div>
  );
}

function ToastItem({ toast: item }: { toast: ToastRecord }) {
  const toneClassName =
    item.tone === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : item.tone === "error"
        ? "border-rose-200 bg-rose-50 text-rose-800"
        : "border-slate-200 bg-white text-slate-800";

  const Icon = useMemo(
    () =>
      item.tone === "success"
        ? CheckCircle2
        : item.tone === "error"
          ? AlertCircle
          : Info,
    [item.tone],
  );

  return (
    <div
      role={item.tone === "error" ? "alert" : "status"}
      className={cn(
        "pointer-events-auto flex items-start gap-2 rounded-xl border px-3 py-2 text-sm shadow-lg",
        toneClassName,
      )}
    >
      <Icon size={16} className="mt-0.5 shrink-0" />
      <p className="min-w-0 flex-1">{item.message}</p>
      <button
        type="button"
        onClick={() => dismiss(item.id)}
        className="rounded p-1 opacity-70 transition hover:opacity-100"
        aria-label="Dismiss notification"
      >
        <X size={14} />
      </button>
    </div>
  );
}
