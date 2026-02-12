import type { ReactNode } from "react";

import Header from "@/components/editor/Header";

type AppPageShellProps = {
  actions?: ReactNode;
  showCopyActions?: boolean;
  children: ReactNode;
  contentClassName?: string;
};

export default function AppPageShell({
  actions,
  showCopyActions = false,
  children,
  contentClassName = "p-6",
}: AppPageShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <Header showCopyActions={showCopyActions} actions={actions} />
      <main className={`flex-1 overflow-y-auto ${contentClassName}`}>{children}</main>
    </div>
  );
}
