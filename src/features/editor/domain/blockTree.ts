import type { Block } from "./types";
import { isLayoutBlock } from "./types";

export type BlockTarget = {
  parentId?: string | null;
  columnIndex?: number | null;
  index?: number;
};

export type BlockLocation = {
  parentId: string | null;
  columnIndex: number | null;
  index: number;
};

export type BlockPath = BlockLocation[];

function normalizeTarget(target?: BlockTarget) {
  return {
    parentId: target?.parentId ?? null,
    columnIndex: target?.columnIndex ?? null,
    index: target?.index,
  };
}

export function findBlockLocation(
  blocks: Block[],
  blockId: string,
  parentId: string | null = null,
  columnIndex: number | null = null,
): BlockLocation | null {
  for (let index = 0; index < blocks.length; index += 1) {
    const block = blocks[index];
    if (block.id === blockId) {
      return { parentId, columnIndex, index };
    }
    if (isLayoutBlock(block)) {
      for (let col = 0; col < block.data.columnBlocks.length; col += 1) {
        const result = findBlockLocation(
          block.data.columnBlocks[col],
          blockId,
          block.id,
          col,
        );
        if (result) {
          return result;
        }
      }
    }
  }
  return null;
}

export function findBlock(blocks: Block[], blockId: string): Block | null {
  for (const block of blocks) {
    if (block.id === blockId) {
      return block;
    }
    if (isLayoutBlock(block)) {
      for (const column of block.data.columnBlocks) {
        const match = findBlock(column, blockId);
        if (match) {
          return match;
        }
      }
    }
  }
  return null;
}

export function updateBlock(
  blocks: Block[],
  blockId: string,
  updater: (block: Block) => Block,
): Block[] {
  return blocks.map((block) => {
    if (block.id === blockId) {
      return updater(block);
    }
    if (isLayoutBlock(block)) {
      return {
        ...block,
        data: {
          ...block.data,
          columnBlocks: block.data.columnBlocks.map((column) =>
            updateBlock(column, blockId, updater),
          ),
        },
      };
    }
    return block;
  });
}

function removeBlockAt(
  blocks: Block[],
  location: BlockLocation,
): { blocks: Block[]; removed: Block | null } {
  if (!location.parentId) {
    const next = [...blocks];
    const [removed] = next.splice(location.index, 1);
    return { blocks: next, removed: removed || null };
  }

  let removedBlock: Block | null = null;

  const next = blocks.map((block) => {
    if (block.id !== location.parentId || !isLayoutBlock(block)) {
      return block;
    }
    const columnBlocks = block.data.columnBlocks.map((column, colIndex) => {
      if (colIndex !== location.columnIndex) {
        return column;
      }
      const updated = [...column];
      const [removed] = updated.splice(location.index, 1);
      removedBlock = removed || null;
      return updated;
    });
    return {
      ...block,
      data: {
        ...block.data,
        columnBlocks,
      },
    };
  });

  return { blocks: next, removed: removedBlock };
}

export function insertBlock(
  blocks: Block[],
  block: Block,
  target: BlockTarget = {},
): Block[] {
  const normalized = normalizeTarget(target);
  if (!normalized.parentId) {
    const next = [...blocks];
    const index =
      typeof normalized.index === "number" ? normalized.index : next.length;
    next.splice(index, 0, block);
    return next;
  }

  return blocks.map((entry) => {
    if (entry.id !== normalized.parentId || !isLayoutBlock(entry)) {
      return entry;
    }
    const columnIndex =
      typeof normalized.columnIndex === "number" ? normalized.columnIndex : 0;
    const columnBlocks = entry.data.columnBlocks.map((column, colIndex) => {
      if (colIndex !== columnIndex) {
        return column;
      }
      const nextColumn = [...column];
      const index =
        typeof normalized.index === "number"
          ? normalized.index
          : nextColumn.length;
      nextColumn.splice(index, 0, block);
      return nextColumn;
    });
    return {
      ...entry,
      data: {
        ...entry.data,
        columnBlocks,
      },
    };
  });
}

export function insertBlocks(
  blocks: Block[],
  blockList: Block[],
  target: BlockTarget = {},
): Block[] {
  let next = blocks;
  let insertIndex = typeof target.index === "number" ? target.index : undefined;
  blockList.forEach((block) => {
    next = insertBlock(next, block, {
      parentId: target.parentId ?? null,
      columnIndex: target.columnIndex ?? null,
      index: insertIndex,
    });
    if (typeof insertIndex === "number") {
      insertIndex += 1;
    }
  });
  return next;
}

export function removeBlock(blocks: Block[], blockId: string) {
  const location = findBlockLocation(blocks, blockId);
  if (!location) {
    return {
      blocks,
      removed: null,
      location: null,
    };
  }

  const result = removeBlockAt(blocks, location);
  return {
    ...result,
    location,
  };
}

export function moveBlock(
  blocks: Block[],
  blockId: string,
  target: BlockTarget,
): Block[] {
  const location = findBlockLocation(blocks, blockId);
  if (!location) {
    return blocks;
  }

  const { blocks: without, removed } = removeBlockAt(blocks, location);
  if (!removed) {
    return blocks;
  }

  const normalizedTarget = normalizeTarget(target);
  const sameContainer =
    location.parentId === normalizedTarget.parentId &&
    location.columnIndex === normalizedTarget.columnIndex;
  const targetIndex =
    typeof normalizedTarget.index === "number"
      ? normalizedTarget.index
      : sameContainer
        ? location.index
        : undefined;

  return insertBlock(without, removed, {
    parentId: normalizedTarget.parentId,
    columnIndex: normalizedTarget.columnIndex,
    index:
      sameContainer &&
      typeof targetIndex === "number" &&
      location.index < targetIndex
        ? targetIndex - 1
        : targetIndex,
  });
}

function cloneBlockData(block: Block): Block {
  return {
    ...block,
    id: crypto.randomUUID(),
    data: structuredClone(block.data),
    dsl: block.dsl ? structuredClone(block.dsl) : undefined,
  };
}

export function cloneBlock(blocks: Block[], blockId: string) {
  const location = findBlockLocation(blocks, blockId);
  if (!location) {
    return { blocks, clonedId: null };
  }

  const source = findBlock(blocks, blockId);
  if (!source) {
    return { blocks, clonedId: null };
  }

  const cloned = cloneBlockData(source);
  return {
    blocks: insertBlock(blocks, cloned, {
      parentId: location.parentId,
      columnIndex: location.columnIndex,
      index: location.index + 1,
    }),
    clonedId: cloned.id,
  };
}
