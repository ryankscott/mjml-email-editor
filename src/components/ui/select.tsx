import * as React from "react";

import { cn } from "@/lib/utils";

type SelectProps = {
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
  children: React.ReactNode;
};

function Select({ value, onValueChange, className, children }: SelectProps) {
  return (
    <select
      value={value}
      onChange={(event) => onValueChange(event.target.value)}
      className={cn(
        "flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400",
        className,
      )}
    >
      {children}
    </select>
  );
}

type SelectItemProps = {
  value: string;
  children: React.ReactNode;
};

function SelectItem({ value, children }: SelectItemProps) {
  return <option value={value}>{children}</option>;
}

export { Select, SelectItem };
