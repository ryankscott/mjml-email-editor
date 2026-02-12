import * as React from "react";

import { cn } from "@/lib/utils";

type PopoverContextValue = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const PopoverContext = React.createContext<PopoverContextValue | null>(null);

type PopoverProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
};

function Popover({ open, onOpenChange, children }: PopoverProps) {
  return (
    <PopoverContext.Provider value={{ open, onOpenChange }}>
      {children}
    </PopoverContext.Provider>
  );
}

function usePopoverContext() {
  const context = React.useContext(PopoverContext);
  if (!context) {
    throw new Error("Popover components must be used within <Popover>.");
  }
  return context;
}

function PopoverTrigger({
  children,
}: {
  children: React.ReactElement<{
    onClick?: (event: React.MouseEvent<HTMLElement>) => void;
  }>;
}) {
  const { open, onOpenChange } = usePopoverContext();

  return React.cloneElement(children, {
    onClick: (event: React.MouseEvent<HTMLElement>) => {
      const original = children.props.onClick;
      original?.(event);
      if (!event.defaultPrevented) {
        onOpenChange(!open);
      }
    },
  });
}

function PopoverContent({ className, children }: React.ComponentProps<"div">) {
  const { open, onOpenChange } = usePopoverContext();
  const contentRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (!open) {
      return;
    }

    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (contentRef.current?.contains(target)) {
        return;
      }
      onOpenChange(false);
    };

    window.addEventListener("mousedown", onPointerDown);
    return () => window.removeEventListener("mousedown", onPointerDown);
  }, [onOpenChange, open]);

  if (!open) {
    return null;
  }

  return (
    <div
      ref={contentRef}
      className={cn(
        "absolute right-0 z-20 mt-2 w-64 rounded-xl border border-slate-200 bg-white p-2 shadow-xl",
        className,
      )}
    >
      {children}
    </div>
  );
}

export { Popover, PopoverContent, PopoverTrigger };
