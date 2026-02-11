import type { DragEvent } from "react";
import { useMemo, useRef, useState } from "react";
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
  DividerData,
  HtmlData,
  ImageData,
  LayoutData,
  SectionData,
  TextData,
} from "../../lib/editor";
import { normalizeMjmlNode } from "../../lib/mjmlJson";
import { compileBlocks } from "../../lib/mjml";
import { replaceVariables } from "../../lib/variables";
import { resolveTextStyle } from "../../lib/brand";
import { useBrand } from "./BrandProvider";
import { useEditor } from "./EditorProvider";

export default function PreviewFrame({
  mode,
  device,
  variableValues,
}: {
  mode: "canvas" | "preview";
  device: "desktop" | "mobile";
  variableValues: Record<string, string>;
}) {
  const { state } = useEditor();
  const { activeBrand } = useBrand();
  const { errors, html } = useMemo(
    () => compileBlocks(state.blocks, activeBrand),
    [state.blocks, activeBrand]
  );
  const previewHtml = useMemo(
    () => replaceVariables(html, variableValues),
    [html, variableValues]
  );

  return (
    <div className="flex h-full flex-col gap-4">
      {errors.length > 0 ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
          <p className="font-semibold">MJML warnings</p>
          <ul className="mt-2 list-disc space-y-1 pl-4">
            {errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </div>
      ) : null}
      {mode === "preview" ? (
        <PreviewContent device={device} html={previewHtml} />
      ) : (
        <CanvasFrame />
      )}
    </div>
  );
}

function PreviewContent({
  device,
  html,
}: {
  device: "desktop" | "mobile";
  html: string;
}) {
  return (
    <div className="flex-1 overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="flex h-full w-full justify-center overflow-y-auto bg-slate-100/60 p-6">
        {device === "desktop" ? (
          <DesktopFrame html={html} />
        ) : (
          <MobileFrame html={html} />
        )}
      </div>
    </div>
  );
}

function DesktopFrame({ html }: { html: string }) {
  return (
    <div className="w-[600px] max-w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
      <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-4 py-2">
        <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
        <span className="ml-2 text-xs text-slate-400">Preview</span>
      </div>
      <div className="h-[720px] bg-white">
        <iframe
          title="Email preview"
          srcDoc={html}
          sandbox=""
          className="h-full w-full"
          style={{ border: "none" }}
        />
      </div>
    </div>
  );
}

function MobileFrame({ html }: { html: string }) {
  return (
    <div className="w-[375px] max-w-full">
      <div className="rounded-[2.5rem] border-4 border-slate-900 bg-slate-900 p-3 shadow-xl">
        <div className="relative overflow-hidden rounded-[2rem] bg-white">
          <div className="pointer-events-none absolute left-1/2 top-2 h-6 w-24 -translate-x-1/2 rounded-full bg-slate-900" />
          <div className="pt-11">
            <iframe
              title="Email preview"
              srcDoc={html}
              sandbox=""
              className="h-[696px] w-full"
              style={{ border: "none" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function CanvasFrame() {
  const { state, addBlock, addDslBlocks, moveBlock, selectBlock } = useEditor();
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
    const parsed = JSON.parse(payload);
    return normalizeMjmlNode(parsed);
  } catch {
    return null;
  }
}

function BlockRow({
  block,
  index,
  total,
  isSelected,
  hoveredId,
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
  hoveredId: string | null;
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
  const { activeBrand } = useBrand();
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

  const isHovered = hoveredId === block.id;

  if (block.type === "section") {
    const data = block.data as SectionData;
    return (
      <div
        data-block-id={block.id}
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
          isVisible={isHovered}
        />
      </div>
    );
  }

  if (block.type === "layout-2" || block.type === "layout-3") {
    const data = block.data as LayoutData;
    return (
      <div
        data-block-id={block.id}
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
              {isDragging && columnBlocks.length > 0 ? (
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
                      hoveredId={hoveredId}
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
          isVisible={isHovered}
        />
      </div>
    );
  }

  if (block.type === "text") {
    const data = block.data as TextData;
    const resolved = resolveTextStyle(data, activeBrand);
    return (
      <div
        data-block-id={block.id}
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
            color: resolved.color,
            fontSize: resolved.fontSize,
            fontFamily: resolved.fontFamily,
            fontWeight: resolved.fontWeight,
            lineHeight: resolved.lineHeight,
            textAlign: data.align,
            whiteSpace: "pre-wrap",
          }}
        >
          {renderTextWithVariables(data.content)}
        </p>
        <HoverActions
          onDelete={handleDelete}
          onClone={handleClone}
          isVisible={isHovered}
        />
      </div>
    );
  }

  if (block.type === "divider") {
    const data = block.data as DividerData;
    return (
      <div
        data-block-id={block.id}
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
        <div
          style={{
            borderTopColor: data.borderColor,
            borderTopWidth: data.borderWidth,
            borderTopStyle: data.borderStyle,
            padding: data.padding,
          }}
        />
        <HoverActions
          onDelete={handleDelete}
          onClone={handleClone}
          isVisible={isHovered}
        />
      </div>
    );
  }

  if (block.type === "html") {
    const data = block.data as HtmlData;
    return (
      <div
        data-block-id={block.id}
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
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          HTML section
        </p>
        <pre className="mt-2 whitespace-pre-wrap text-xs text-slate-700">
          {data.content}
        </pre>
        <HoverActions
          onDelete={handleDelete}
          onClone={handleClone}
          isVisible={isHovered}
        />
      </div>
    );
  }

  const data = block.data as ImageData;
  return (
    <div
      data-block-id={block.id}
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
      <HoverActions
        onDelete={handleDelete}
        onClone={handleClone}
        isVisible={isHovered}
      />
    </div>
  );
}

function renderTextWithVariables(content: string) {
  const value = content ?? "";
  const regex = /{{\s*[\w.-]+\s*}}/g;
  const parts: Array<{ type: "text" | "var"; value: string }> = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(value))) {
    if (match.index > lastIndex) {
      parts.push({ type: "text", value: value.slice(lastIndex, match.index) });
    }
    parts.push({ type: "var", value: match[0] });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < value.length) {
    parts.push({ type: "text", value: value.slice(lastIndex) });
  }

  if (parts.length === 0) {
    return value;
  }

  return parts.map((part, index) =>
    part.type === "var" ? (
      <span
        key={`${part.value}-${index}`}
        className="mx-0.5 inline-flex items-center rounded-md bg-slate-100 px-1.5 py-0.5 font-mono text-[0.95em] text-slate-600"
      >
        {part.value}
      </span>
    ) : (
      <span key={`text-${index}`}>{part.value}</span>
    )
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
