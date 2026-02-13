import type { CSSProperties, DragEvent } from "react";

import type {
  Block,
  DividerData,
  HtmlData,
  ImageData,
  LayoutData,
  TextData,
} from "@/lib/editor";
import { useBrand } from "@/components/editor/BrandProvider";
import {
  useEditorActions,
  useEditorState,
} from "@/components/editor/EditorProvider";
import { resolveBrandColor, resolveTextStyle } from "@/lib/brand";

import DropZone from "./DropZone";
import HoverActions from "./HoverActions";
import {
  type DropTarget,
  makeTargetKey,
} from "./dnd";
import { renderTextWithVariables } from "./renderTextWithVariables";

export default function BlockRow({
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
  const state = useEditorState();
  const { removeBlock, cloneBlock, moveBlock, selectBlock } = useEditorActions();
  const { activeBrand } = useBrand();

  const handleDragStart = (event: DragEvent) => {
    event.dataTransfer.setData("application/x-block-id", block.id);
    event.dataTransfer.effectAllowed = "move";
  };

  const handleDelete = () => removeBlock(block.id);
  const handleClone = () => cloneBlock(block.id);
  const handleMoveUp = () => moveBlock(block.id, { index: Math.max(0, index - 1) });
  const handleMoveDown = () =>
    moveBlock(block.id, { index: Math.min(total - 1, index + 1) });

  const isHovered = hoveredId === block.id;

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
          backgroundColor: resolveBrandColor(
            data.backgroundColor,
            data.backgroundColorToken,
            activeBrand,
          ),
          padding: data.padding,
        }}
        className={`group relative rounded-lg border text-sm transition ${
          isSelected
            ? "border-cyan-400 ring-2 ring-cyan-200"
            : "border-slate-200 hover:border-slate-300"
        }`}
      >
        <div className={`grid gap-4 ${data.columns === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
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
                      }),
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
                      }),
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
                    <div key={child.id} className="my-2 space-y-3">
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
                              }),
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
        <HoverActions onDelete={handleDelete} onClone={handleClone} isVisible={isHovered} />
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
            borderTopStyle: data.borderStyle as CSSProperties["borderTopStyle"],
            padding: data.padding,
          }}
        />
        <HoverActions onDelete={handleDelete} onClone={handleClone} isVisible={isHovered} />
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
        <pre className="mt-2 whitespace-pre-wrap text-xs text-slate-700">{data.content}</pre>
        <HoverActions onDelete={handleDelete} onClone={handleClone} isVisible={isHovered} />
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
      <HoverActions onDelete={handleDelete} onClone={handleClone} isVisible={isHovered} />
    </div>
  );
}
