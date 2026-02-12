import type { Block, BlockDSL, BlockType } from "@/lib/editor";
import { normalizeMjmlNode } from "@/lib/mjmlJson";

export type DropTarget = {
  parentId?: string | null;
  columnIndex?: number | null;
  index: number;
};

export function makeTargetKey(target: DropTarget) {
  return `${target.parentId ?? "root"}:${target.columnIndex ?? "root"}:${target.index}`;
}

export function isBlockTypeAllowedInColumn(blockType: BlockType) {
  return blockType === "text" || blockType === "image";
}

export function isBlockAllowedInColumn(block: Block) {
  return isBlockTypeAllowedInColumn(block.type);
}

export function parseDslPayload(payload: string): BlockDSL | null {
  try {
    const parsed = JSON.parse(payload);
    return normalizeMjmlNode(parsed);
  } catch {
    return null;
  }
}
