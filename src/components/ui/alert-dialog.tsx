import * as React from "react";

import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

function AlertDialog({
  open,
  onOpenChange,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children}
    </Dialog>
  );
}

function AlertDialogContent({ children }: { children: React.ReactNode }) {
  return <DialogContent className="max-w-lg">{children}</DialogContent>;
}

function AlertDialogHeader({ children }: { children: React.ReactNode }) {
  return <DialogHeader>{children}</DialogHeader>;
}

function AlertDialogTitle({ children }: { children: React.ReactNode }) {
  return <DialogTitle>{children}</DialogTitle>;
}

function AlertDialogDescription({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-slate-500">{children}</p>;
}

function AlertDialogBody({ children }: { children: React.ReactNode }) {
  return <DialogBody>{children}</DialogBody>;
}

function AlertDialogFooter({ children }: { children: React.ReactNode }) {
  return <DialogFooter>{children}</DialogFooter>;
}

function AlertDialogAction({
  children,
  onClick,
  className,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button type="button" onClick={onClick} className={className}>
      {children}
    </button>
  );
}

function AlertDialogCancel({
  children,
  onClick,
  className,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button type="button" onClick={onClick} className={className}>
      {children}
    </button>
  );
}

export {
  AlertDialog,
  AlertDialogAction,
  AlertDialogBody,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
};
