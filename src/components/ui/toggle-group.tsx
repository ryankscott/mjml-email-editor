import * as React from "react";

import { cn } from "@/lib/utils";

type ToggleGroupContextValue = {
  value?: string;
  onValueChange?: (value: string) => void;
};

const ToggleGroupContext = React.createContext<ToggleGroupContextValue>({});

type ToggleGroupProps = {
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  children: React.ReactNode;
};

function ToggleGroup({ value, onValueChange, className, children }: ToggleGroupProps) {
  return (
    <ToggleGroupContext.Provider value={{ value, onValueChange }}>
      <div className={cn("inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 p-1", className)}>
        {children}
      </div>
    </ToggleGroupContext.Provider>
  );
}

type ToggleGroupItemProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  value: string;
};

function ToggleGroupItem({ value, className, children, ...props }: ToggleGroupItemProps) {
  const context = React.useContext(ToggleGroupContext);
  const selected = context.value === value;
  const { onClick, ...restProps } = props;

  return (
    <button
      type="button"
      className={cn(
        "rounded-full px-3 py-1 text-xs font-semibold transition",
        selected
          ? "bg-slate-900 text-white"
          : "text-slate-500 hover:bg-white hover:text-slate-900",
        className,
      )}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) {
          context.onValueChange?.(value);
        }
      }}
      data-state={selected ? "on" : "off"}
      {...restProps}
    >
      {children}
    </button>
  );
}

export { ToggleGroup, ToggleGroupItem };
