import { createContext, useContext, useMemo, type ReactNode } from "react";

import { toast } from "@/components/ui/sonner";

type ToastTone = "info" | "success" | "error";

type ToastInput = {
  message: string;
  tone?: ToastTone;
  durationMs?: number;
};

type ToastContextValue = {
  notify: (input: ToastInput) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const value = useMemo<ToastContextValue>(
    () => ({
      notify: (input) => {
        const duration = input.durationMs;
        if (input.tone === "success") {
          toast.success(input.message, { duration });
          return;
        }
        if (input.tone === "error") {
          toast.error(input.message, { duration });
          return;
        }
        toast.message(input.message, { duration });
      },
    }),
    [],
  );

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider.");
  }

  return {
    notify: context.notify,
    info: (message: string) => context.notify({ message, tone: "info" }),
    success: (message: string) => context.notify({ message, tone: "success" }),
    error: (message: string) => context.notify({ message, tone: "error" }),
  };
}
