import type { ReactNode } from "react";

export function LoadingHint({ children }: { children: ReactNode }) {
  return <span className="text-xs text-slate-500">{children}</span>;
}

export function ErrorNotice({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
      {message}
    </div>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
      {children}
    </div>
  );
}
