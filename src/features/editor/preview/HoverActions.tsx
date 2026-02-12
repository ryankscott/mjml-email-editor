import { ChevronDown, ChevronUp, Copy, GripVertical, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function HoverActions({
  onDelete,
  onClone,
  onMoveUp,
  onMoveDown,
  canMoveUp = true,
  canMoveDown = true,
  showMoveActions = false,
  isVisible = false,
}: {
  onDelete: () => void;
  onClone: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  showMoveActions?: boolean;
  isVisible?: boolean;
}) {
  return (
    <div
      className={`pointer-events-none absolute -right-12 top-1/2 flex -translate-y-1/2 transition ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="pointer-events-auto flex flex-col items-center gap-2 rounded-lg border border-slate-200 bg-white/90 p-2 text-xs shadow-sm">
        {showMoveActions ? (
          <Button
            onClick={onMoveUp}
            disabled={!canMoveUp}
            variant="outline"
            size="icon"
            className="h-6 w-6 rounded-sm border-slate-200 text-slate-500 hover:text-slate-700"
            aria-label="Move block up"
          >
            <ChevronUp size={14} />
          </Button>
        ) : null}
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-sm border border-slate-200 text-slate-500">
          <GripVertical size={16} />
        </span>
        <Button
          onClick={onClone}
          variant="outline"
          size="icon"
          className="h-6 w-6 rounded-sm border-slate-200 text-slate-500 hover:text-slate-700"
          aria-label="Clone block"
        >
          <Copy size={14} />
        </Button>
        <Button
          onClick={onDelete}
          variant="outline"
          size="icon"
          className="h-6 w-6 rounded-sm border-rose-200 text-rose-500 hover:text-rose-600"
          aria-label="Delete block"
        >
          <Trash2 size={14} />
        </Button>
        {showMoveActions ? (
          <Button
            onClick={onMoveDown}
            disabled={!canMoveDown}
            variant="outline"
            size="icon"
            className="h-6 w-6 rounded-sm border-slate-200 text-slate-500 hover:text-slate-700"
            aria-label="Move block down"
          >
            <ChevronDown size={14} />
          </Button>
        ) : null}
      </div>
    </div>
  );
}
