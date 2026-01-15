import type { DragEvent } from "react";
import { useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Copy,
  GripVertical,
  Trash2,
} from "lucide-react";

import type {
  Block,
  BlockDSL,
  BlockType,
  ImageData,
  LayoutData,
  SectionData,
  TextData,
} from "../../lib/editor";
import { buildMjml } from "../../lib/editor";
import { compileMjml } from "../../lib/mjml";
import { useEditor } from "./EditorProvider";

export default function PreviewFrame() {
  const { state, addBlock, addDslBlocks, moveBlock, selectBlock } = useEditor();
  const [dragOverKey, setDragOverKey] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const mjml = useMemo(() => buildMjml(state.blocks), [state.blocks]);
  const { errors } = useMemo(() => compileMjml(mjml), [mjml]);

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
      if (
        target.parentId &&
        !isBlockTypeAllowedInColumn(blockType as BlockType)
      ) {
        return;
      }
      addBlock(blockType as Block["type"], target);
      return;
    }

    const blockId = event.dataTransfer.getData("application/x-block-id");
    if (blockId) {
      const dragged = findBlockById(state.blocks, blockId);
      if (target.parentId && dragged && !isBlockAllowedInColumn(dragged)) {
        return;
      }
      moveBlock(blockId, target);
    }
  };

  return (
    <div className="flex h-full flex-col gap-4">
      {errors.length > 0 ? (
        <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-xs text-amber-200">
          <p className="font-semibold">MJML warnings</p>
          <ul className="mt-2 list-disc space-y-1 pl-4">
            {errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </div>
      ) : null}
      <div className="flex-1 overflow-hidden rounded-2xl border border-slate-800 bg-white">
        <div className="flex h-full w-full justify-center overflow-y-auto bg-slate-100/60 p-6">
          <div
            className="w-full max-w-160 rounded-xl bg-white p-6 shadow-sm"
            onDragEnter={() => setIsDragging(true)}
            onDragEnd={() => setIsDragging(false)}
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
                    onDragOver={() =>
                      setDragOverKey(makeTargetKey({ index: 0 }))
                    }
                    onDragLeave={() => setDragOverKey(null)}
                    onDrop={(event) => handleDropAt(event, { index: 0 })}
                  />
                ) : null}
                {state.blocks.map((block, index) => (
                  <div key={block.id} className="space-y-3 my-2">
                    <BlockRow
                      block={block}
                      index={index}
                      total={state.blocks.length}
                      isSelected={state.selectedId === block.id}
                      onSelect={() => selectBlock(block.id)}
                      isDragging={isDragging}
                      dragOverKey={dragOverKey}
                      setDragOverKey={setDragOverKey}
                      setIsDragging={setIsDragging}
                      onDropAt={handleDropAt}
                    />
                    {isDragging ? (
                      <DropZone
                        isActive={
                          dragOverKey === makeTargetKey({ index: index + 1 })
                        }
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
    </div>
  );
}

function DropZone({
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

type DropTarget = {
  parentId?: string | null;
  columnIndex?: number | null;
  index: number;
};

function makeTargetKey(target: DropTarget) {
  return `${target.parentId ?? "root"}:${target.columnIndex ?? "root"}:${target.index}`;
}

function isLayoutBlock(block: Block): block is Block & { data: LayoutData } {
  return block.type === "layout-2" || block.type === "layout-3";
}

function findBlockById(blocks: Block[], blockId: string): Block | null {
  for (const block of blocks) {
    if (block.id === blockId) {
      return block;
    }
    if (isLayoutBlock(block)) {
      for (const column of block.data.columnBlocks) {
        const match = findBlockById(column, blockId);
        if (match) {
          return match;
        }
      }
    }
  }
  return null;
}

function isBlockTypeAllowedInColumn(blockType: BlockType) {
  return blockType === "text" || blockType === "image";
}

function isBlockAllowedInColumn(block: Block) {
  return isBlockTypeAllowedInColumn(block.type);
}

function parseDslPayload(payload: string): BlockDSL | null {
  try {
    const parsed = JSON.parse(payload) as BlockDSL;
    if (!parsed || typeof parsed !== "object" || !("type" in parsed)) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function BlockRow({
  block,
  index,
  total,
  isSelected,
  onSelect,
  isDragging,
  dragOverKey,
  setDragOverKey,
  setIsDragging,
  onDropAt,
  allowMoveActions = true,
}: {
  block: Block;
  index: number;
  total: number;
  isSelected: boolean;
  onSelect: () => void;
  isDragging: boolean;
  dragOverKey: string | null;
  setDragOverKey: (key: string | null) => void;
  setIsDragging: (value: boolean) => void;
  onDropAt: (event: DragEvent, target: DropTarget) => void;
  allowMoveActions?: boolean;
}) {
  const { state, removeBlock, cloneBlock, moveBlock, selectBlock } =
    useEditor();
  const handleDragStart = (event: DragEvent) => {
    event.dataTransfer.setData("application/x-block-id", block.id);
    event.dataTransfer.effectAllowed = "move";
  };

  const handleDelete = () => removeBlock(block.id);
  const handleClone = () => cloneBlock(block.id);
  const handleMoveUp = () =>
    moveBlock(block.id, { index: Math.max(0, index - 1) });
  const handleMoveDown = () =>
    moveBlock(block.id, { index: Math.min(total - 1, index + 1) });

  if (block.type === "section") {
    const data = block.data as SectionData;
    return (
      <div
        role="button"
        tabIndex={0}
        draggable
        onDragStart={handleDragStart}
        onClick={onSelect}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            onSelect();
          }
        }}
        style={{
          backgroundColor: data.backgroundColor,
          padding: data.padding,
        }}
        className={`group relative rounded-lg border text-sm transition ${
          isSelected
            ? "border-cyan-400 ring-2 ring-cyan-200"
            : "border-slate-200 hover:border-slate-300"
        }`}
      >
        <div className="rounded-md border border-dashed border-slate-200 px-4 py-6 text-center text-xs text-slate-400">
          Section container
        </div>
        <HoverActions
          onDelete={handleDelete}
          onClone={handleClone}
          onMoveUp={handleMoveUp}
          onMoveDown={handleMoveDown}
          canMoveUp={index > 0}
          canMoveDown={index < total - 1}
          showMoveActions={allowMoveActions}
        />
      </div>
    );
  }

  if (block.type === "layout-2" || block.type === "layout-3") {
    const data = block.data as LayoutData;
    return (
      <div
        role="button"
        tabIndex={0}
        draggable
        onDragStart={handleDragStart}
        onClick={onSelect}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            onSelect();
          }
        }}
        style={{
          backgroundColor: data.backgroundColor,
          padding: data.padding,
        }}
        className={`group relative rounded-lg border text-sm transition ${
          isSelected
            ? "border-cyan-400 ring-2 ring-cyan-200"
            : "border-slate-200 hover:border-slate-300"
        }`}
      >
        <div
          className={`grid gap-4 ${
            data.columns === 2 ? "grid-cols-2" : "grid-cols-3"
          }`}
        >
          {data.columnBlocks.map((columnBlocks, columnIndex) => (
            <div
              key={`${block.id}-col-${columnIndex}`}
              className="rounded-md border border-dashed border-slate-200 bg-white/80 p-3"
              onDragEnter={() => setIsDragging(true)}
            >
              {isDragging ? (
                <DropZone
                  isActive={
                    dragOverKey ===
                    makeTargetKey({
                      parentId: block.id,
                      columnIndex,
                      index: 0,
                    })
                  }
                  size="lg"
                  onDragOver={() =>
                    setDragOverKey(
                      makeTargetKey({
                        parentId: block.id,
                        columnIndex,
                        index: 0,
                      })
                    )
                  }
                  onDragLeave={() => setDragOverKey(null)}
                  onDrop={(event) =>
                    onDropAt(event, {
                      parentId: block.id,
                      columnIndex,
                      index: 0,
                    })
                  }
                />
              ) : null}

              {columnBlocks.length === 0 ? (
                <div
                  onDragOver={(event) => {
                    event.preventDefault();
                    setDragOverKey(
                      makeTargetKey({
                        parentId: block.id,
                        columnIndex,
                        index: 0,
                      })
                    );
                  }}
                  onDragLeave={() => setDragOverKey(null)}
                  onDrop={(event) =>
                    onDropAt(event, {
                      parentId: block.id,
                      columnIndex,
                      index: 0,
                    })
                  }
                  className={`rounded-md border border-dashed px-2 py-6 text-center text-xs transition ${
                    dragOverKey ===
                    makeTargetKey({
                      parentId: block.id,
                      columnIndex,
                      index: 0,
                    })
                      ? "border-cyan-300 bg-cyan-50 text-cyan-700"
                      : "border-slate-200 text-slate-400"
                  }`}
                >
                  Drop blocks
                </div>
              ) : (
                columnBlocks.map((child, childIndex) => (
                  <div key={child.id} className="space-y-3 my-2">
                    <BlockRow
                      block={child}
                      index={childIndex}
                      total={columnBlocks.length}
                      isSelected={state.selectedId === child.id}
                      onSelect={() => selectBlock(child.id)}
                      isDragging={isDragging}
                      dragOverKey={dragOverKey}
                      setDragOverKey={setDragOverKey}
                      setIsDragging={setIsDragging}
                      onDropAt={onDropAt}
                      allowMoveActions={false}
                    />
                    {isDragging ? (
                      <DropZone
                        isActive={
                          dragOverKey ===
                          makeTargetKey({
                            parentId: block.id,
                            columnIndex,
                            index: childIndex + 1,
                          })
                        }
                        size="lg"
                        onDragOver={() =>
                          setDragOverKey(
                            makeTargetKey({
                              parentId: block.id,
                              columnIndex,
                              index: childIndex + 1,
                            })
                          )
                        }
                        onDragLeave={() => setDragOverKey(null)}
                        onDrop={(event) =>
                          onDropAt(event, {
                            parentId: block.id,
                            columnIndex,
                            index: childIndex + 1,
                          })
                        }
                      />
                    ) : null}
                  </div>
                ))
              )}
            </div>
          ))}
        </div>
        <HoverActions
          onDelete={handleDelete}
          onClone={handleClone}
          onMoveUp={handleMoveUp}
          onMoveDown={handleMoveDown}
          canMoveUp={index > 0}
          canMoveDown={index < total - 1}
          showMoveActions={allowMoveActions}
        />
      </div>
    );
  }

  if (block.type === "text") {
    const data = block.data as TextData;
    return (
      <div
        role="button"
        tabIndex={0}
        draggable
        onDragStart={handleDragStart}
        onClick={onSelect}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            onSelect();
          }
        }}
        className={`group relative rounded-lg border px-4 py-3 transition ${
          isSelected
            ? "border-cyan-400 ring-2 ring-cyan-200"
            : "border-slate-200 hover:border-slate-300"
        }`}
      >
        <p
          style={{
            color: data.color,
            fontSize: data.fontSize,
            textAlign: data.align,
          }}
        >
          {data.content}
        </p>
        <HoverActions onDelete={handleDelete} onClone={handleClone} />
      </div>
    );
  }

  const data = block.data as ImageData;
  return (
    <div
      role="button"
      tabIndex={0}
      draggable
      onDragStart={handleDragStart}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          onSelect();
        }
      }}
      className={`group relative rounded-lg border px-4 py-4 transition ${
        isSelected
          ? "border-cyan-400 ring-2 ring-cyan-200"
          : "border-slate-200 hover:border-slate-300"
      }`}
    >
      <img
        src={data.src}
        alt={data.alt}
        style={{ width: data.width, maxWidth: "100%" }}
        className="mx-auto rounded-md"
      />
      <HoverActions onDelete={handleDelete} onClone={handleClone} />
    </div>
  );
}

function HoverActions({
  onDelete,
  onClone,
  onMoveUp,
  onMoveDown,
  canMoveUp = true,
  canMoveDown = true,
  showMoveActions = false,
}: {
  onDelete: () => void;
  onClone: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  showMoveActions?: boolean;
}) {
  return (
    <div className="pointer-events-none absolute -right-12 top-1/2 flex -translate-y-1/2 opacity-0 transition group-hover:opacity-100">
      <div className="pointer-events-auto flex flex-col items-center gap-2 rounded-lg border border-slate-200 bg-white/90 p-2 text-xs shadow-sm">
        {showMoveActions ? (
          <button
            type="button"
            onClick={onMoveUp}
            disabled={!canMoveUp}
            className={`inline-flex h-6 w-6 items-center justify-center rounded-sm border border-slate-200 text-slate-500 hover:text-slate-700 ${
              canMoveUp ? "" : "cursor-not-allowed opacity-40"
            }`}
            aria-label="Move block up"
          >
            <ChevronUp size={14} />
          </button>
        ) : null}
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-sm border border-slate-200 text-slate-500">
          <GripVertical size={16} />
        </span>
        <button
          type="button"
          onClick={onClone}
          className="inline-flex h-6 w-6 items-center justify-center rounded-sm border border-slate-200 text-slate-500 hover:text-slate-700"
          aria-label="Clone block"
        >
          <Copy size={14} />
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="inline-flex h-6 w-6 items-center justify-center rounded-sm border border-rose-200 text-rose-500 hover:text-rose-600"
          aria-label="Delete block"
        >
          <Trash2 size={14} />
        </button>
        {showMoveActions ? (
          <button
            type="button"
            onClick={onMoveDown}
            disabled={!canMoveDown}
            className={`inline-flex h-6 w-6 items-center justify-center rounded-sm border border-slate-200 text-slate-500 hover:text-slate-700 ${
              canMoveDown ? "" : "cursor-not-allowed opacity-40"
            }`}
            aria-label="Move block down"
          >
            <ChevronDown size={14} />
          </button>
        ) : null}
      </div>
    </div>
  );
}
