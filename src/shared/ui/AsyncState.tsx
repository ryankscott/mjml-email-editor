import type { ReactNode } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";

export function LoadingHint({ children }: { children: ReactNode }) {
  return <span className="text-xs text-slate-500">{children}</span>;
}

export function ErrorNotice({ message }: { message: string }) {
  return (
    <Alert variant="error" className="mt-4">
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <Alert variant="muted" className="rounded-xl border-dashed p-6 text-center text-sm">
      <AlertDescription>{children}</AlertDescription>
    </Alert>
  );
}
