import type { DragEvent } from "react";

export default function DropZone({
  isActive,
  size = "sm",
  onDragOver,
  onDragLeave,
  onDrop,
}: {
  isActive: boolean;
  size?: "sm" | "lg";
  onDragOver: () => void;
  onDragLeave: () => void;
  onDrop: (event: DragEvent) => void;
}) {
  const heightClass = size === "lg" ? "h-8" : "h-3";
  return (
    <div
      onDragOver={(event) => {
        event.preventDefault();
        onDragOver();
      }}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={`my-3 ${heightClass} rounded-sm transition ${
        isActive ? "bg-cyan-400 opacity-40" : "bg-transparent"
      }`}
    />
  );
}
