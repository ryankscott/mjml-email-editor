import type { DragEvent } from "react";
import { Trash2 } from "lucide-react";

import type { Block } from "../../lib/editor";
import { useEditor } from "./EditorProvider";

function BlockCard({ block, index }: { block: Block; index: number }) {
  const { state, selectBlock, moveBlock, removeBlock } = useEditor();

  const isSelected = state.selectedId === block.id;

  const handleDragStart = (event: DragEvent) => {
    event.dataTransfer.setData("application/x-block-id", block.id);
    event.dataTransfer.effectAllowed = "move";
  };

  const handleDrop = (event: DragEvent) => {
    event.preventDefault();
    const blockId = event.dataTransfer.getData("application/x-block-id");
    if (blockId) {
      moveBlock(blockId, { index });
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      draggable
      onDragStart={handleDragStart}
      onDragOver={(event) => event.preventDefault()}
      onDrop={handleDrop}
      onClick={() => selectBlock(block.id)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          selectBlock(block.id);
        }
      }}
      className={`flex items-center justify-between rounded-xl border px-4 py-3 transition ${
        isSelected
          ? "border-cyan-400 bg-cyan-500/10"
          : "border-slate-700 bg-slate-900/60 hover:border-slate-500"
      }`}
    >
      <div className="flex flex-col">
        <span className="text-sm font-semibold text-slate-100 capitalize">
          {block.type}
        </span>
        <span className="text-xs text-slate-400">Block ID: {block.id}</span>
      </div>
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          removeBlock(block.id);
        }}
        className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-slate-200"
        aria-label="Delete block"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}

export default function Canvas() {
  const { state, addBlock, moveBlock } = useEditor();

  const handleDrop = (event: DragEvent) => {
    event.preventDefault();
    const blockType = event.dataTransfer.getData("application/x-block-type");
    if (blockType) {
      addBlock(blockType as Block["type"]);
      return;
    }

    const blockId = event.dataTransfer.getData("application/x-block-id");
    if (blockId) {
      moveBlock(blockId, { index: state.blocks.length });
    }
  };

  return (
    <div
      onDragOver={(event) => event.preventDefault()}
      onDrop={handleDrop}
      className="flex h-full flex-col gap-4 overflow-y-auto rounded-2xl border border-dashed border-slate-700 bg-slate-950/40 p-6"
    >
      {state.blocks.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center text-slate-400">
          <p className="text-sm font-semibold text-slate-200">Empty canvas</p>
          <p className="text-xs">Drag blocks here to start building.</p>
        </div>
      ) : (
        state.blocks.map((block, index) => (
          <BlockCard key={block.id} block={block} index={index} />
        ))
      )}
    </div>
  );
}
