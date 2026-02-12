import type { DragEvent } from "react";
import { useRef, useState } from "react";

import {
  findBlock,
  type Block,
  type BlockType,
} from "@/lib/editor";
import {
  useEditorActions,
  useEditorState,
} from "@/components/editor/EditorProvider";

import BlockRow from "./BlockRow";
import DropZone from "./DropZone";
import {
  type DropTarget,
  isBlockAllowedInColumn,
  isBlockTypeAllowedInColumn,
  makeTargetKey,
  parseDslPayload,
} from "./dnd";

export default function CanvasFrame() {
  const state = useEditorState();
  const { addBlock, addDslBlocks, moveBlock, selectBlock } = useEditorActions();
  const [dragOverKey, setDragOverKey] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const hoverClearTimer = useRef<number | null>(null);

  const handleDropAt = (event: DragEvent, target: DropTarget) => {
    event.preventDefault();
    setDragOverKey(null);
    setIsDragging(false);
    const dslPayload = event.dataTransfer.getData("application/x-block-dsl");
    if (dslPayload) {
      const parsed = parseDslPayload(dslPayload);
      if (parsed) {
        addDslBlocks(parsed, target);
      }
      return;
    }
    const blockType = event.dataTransfer.getData("application/x-block-type");
    if (blockType) {
      if (target.parentId && !isBlockTypeAllowedInColumn(blockType as BlockType)) {
        return;
      }
      addBlock(blockType as Block["type"], target);
      return;
    }

    const blockId = event.dataTransfer.getData("application/x-block-id");
    if (blockId) {
      const dragged = findBlock(state.blocks, blockId);
      if (target.parentId && dragged && !isBlockAllowedInColumn(dragged)) {
        return;
      }
      moveBlock(blockId, target);
    }
  };

  return (
    <div className="flex-1 overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="flex h-full w-full justify-center overflow-y-auto bg-slate-100/60 p-6">
        <div
          className="w-full max-w-160 rounded-xl bg-white p-6 shadow-sm"
          onDragEnter={() => setIsDragging(true)}
          onDragEnd={() => setIsDragging(false)}
          onMouseMove={(event) => {
            const target = event.target as HTMLElement | null;
            const hit = target?.closest<HTMLElement>("[data-block-id]");
            const nextId = hit?.dataset.blockId ?? null;
            if (hoverClearTimer.current !== null) {
              window.clearTimeout(hoverClearTimer.current);
              hoverClearTimer.current = null;
            }
            setHoveredId((current) => (current === nextId ? current : nextId));
          }}
          onMouseLeave={() => {
            if (hoverClearTimer.current !== null) {
              window.clearTimeout(hoverClearTimer.current);
            }
            hoverClearTimer.current = window.setTimeout(() => {
              setHoveredId(null);
              hoverClearTimer.current = null;
            }, 400);
          }}
        >
          {state.blocks.length === 0 ? (
            <div
              onDragOver={(event) => {
                event.preventDefault();
                setIsDragging(true);
                setDragOverKey(makeTargetKey({ index: 0 }));
              }}
              onDragLeave={() => setDragOverKey(null)}
              onDrop={(event) => handleDropAt(event, { index: 0 })}
              className={`rounded-lg border border-dashed px-6 py-12 text-center text-sm transition ${
                dragOverKey === makeTargetKey({ index: 0 })
                  ? "border-cyan-400 bg-cyan-50 text-cyan-700"
                  : "border-slate-200 text-slate-400"
              }`}
            >
              Drop blocks here to start building
            </div>
          ) : (
            <>
              {isDragging ? (
                <DropZone
                  isActive={dragOverKey === makeTargetKey({ index: 0 })}
                  size="lg"
                  onDragOver={() => setDragOverKey(makeTargetKey({ index: 0 }))}
                  onDragLeave={() => setDragOverKey(null)}
                  onDrop={(event) => handleDropAt(event, { index: 0 })}
                />
              ) : null}
              {state.blocks.map((block, index) => (
                <div key={block.id} className="my-2 space-y-3">
                  <BlockRow
                    block={block}
                    index={index}
                    total={state.blocks.length}
                    isSelected={state.selectedId === block.id}
                    hoveredId={hoveredId}
                    onSelect={() => selectBlock(block.id)}
                    isDragging={isDragging}
                    dragOverKey={dragOverKey}
                    setDragOverKey={setDragOverKey}
                    setIsDragging={setIsDragging}
                    onDropAt={handleDropAt}
                  />
                  {isDragging ? (
                    <DropZone
                      isActive={dragOverKey === makeTargetKey({ index: index + 1 })}
                      size="lg"
                      onDragOver={() =>
                        setDragOverKey(makeTargetKey({ index: index + 1 }))
                      }
                      onDragLeave={() => setDragOverKey(null)}
                      onDrop={(event) =>
                        handleDropAt(event, { index: index + 1 })
                      }
                    />
                  ) : null}
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
