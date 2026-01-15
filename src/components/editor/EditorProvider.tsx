import {
  createContext,
  useContext,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";

import type {
  Block,
  BlockData,
  BlockDSL,
  BlockType,
  LayoutData,
} from "../../lib/editor";
import { createBlock, expandDsl } from "../../lib/editor";

export type EditorState = {
  blocks: Block[];
  selectedId: string | null;
};

type BlockTarget = {
  parentId?: string | null;
  columnIndex?: number | null;
  index?: number;
};

type EditorAction =
  | { type: "add-block"; blockType: BlockType; target?: BlockTarget }
  | { type: "add-dsl"; dsl: BlockDSL; target?: BlockTarget }
  | { type: "select-block"; blockId: string | null }
  | { type: "update-block"; blockId: string; data: Partial<BlockData> }
  | { type: "remove-block"; blockId: string }
  | { type: "move-block"; blockId: string; target: BlockTarget }
  | { type: "clone-block"; blockId: string };

const initialState: EditorState = {
  blocks: [],
  selectedId: null,
};

function isLayoutBlock(block: Block): block is Block & { data: LayoutData } {
  return block.type === "layout-2" || block.type === "layout-3";
}

type BlockLocation = {
  parentId: string | null;
  columnIndex: number | null;
  index: number;
};

function findBlockLocation(
  blocks: Block[],
  blockId: string,
  parentId: string | null = null,
  columnIndex: number | null = null
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
          col
        );
        if (result) {
          return result;
        }
      }
    }
  }
  return null;
}

function updateBlocks(
  blocks: Block[],
  blockId: string,
  updater: (block: Block) => Block
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
            updateBlocks(column, blockId, updater)
          ),
        },
      };
    }
    return block;
  });
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

function removeBlockAt(
  blocks: Block[],
  location: BlockLocation
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

function insertBlockAt(
  blocks: Block[],
  block: Block,
  target: BlockTarget
): Block[] {
  if (!target.parentId) {
    const next = [...blocks];
    const index = typeof target.index === "number" ? target.index : next.length;
    next.splice(index, 0, block);
    return next;
  }

  return blocks.map((entry) => {
    if (entry.id !== target.parentId || !isLayoutBlock(entry)) {
      return entry;
    }
    const columnIndex =
      typeof target.columnIndex === "number" ? target.columnIndex : 0;
    const columnBlocks = entry.data.columnBlocks.map((column, colIndex) => {
      if (colIndex !== columnIndex) {
        return column;
      }
      const nextColumn = [...column];
      const index =
        typeof target.index === "number" ? target.index : nextColumn.length;
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

function insertBlocksAt(
  blocks: Block[],
  blockList: Block[],
  target: BlockTarget
): Block[] {
  let next = blocks;
  let insertIndex = typeof target.index === "number" ? target.index : undefined;
  blockList.forEach((block) => {
    next = insertBlockAt(next, block, {
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

function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case "add-block": {
      const block = createBlock(action.blockType);
      const nextBlocks = action.target
        ? insertBlockAt(state.blocks, block, action.target)
        : [...state.blocks, block];
      return {
        ...state,
        blocks: nextBlocks,
        selectedId: block.id,
      };
    }
    case "add-dsl": {
      const expanded = expandDsl(action.dsl);
      if (expanded.length === 0) {
        return state;
      }
      const nextBlocks = action.target
        ? insertBlocksAt(state.blocks, expanded, action.target)
        : [...state.blocks, ...expanded];
      return {
        ...state,
        blocks: nextBlocks,
        selectedId: expanded[0]?.id ?? state.selectedId,
      };
    }
    case "select-block":
      return {
        ...state,
        selectedId: action.blockId,
      };
    case "update-block": {
      return {
        ...state,
        blocks: updateBlocks(state.blocks, action.blockId, (block) => ({
          ...block,
          data: {
            ...block.data,
            ...action.data,
          },
        })),
      };
    }
    case "remove-block": {
      const location = findBlockLocation(state.blocks, action.blockId);
      if (!location) {
        return state;
      }
      const { blocks: nextBlocks } = removeBlockAt(state.blocks, location);
      return {
        ...state,
        blocks: nextBlocks,
        selectedId:
          state.selectedId === action.blockId ? null : state.selectedId,
      };
    }
    case "clone-block": {
      const location = findBlockLocation(state.blocks, action.blockId);
      if (!location) {
        return state;
      }
      const source = findBlockById(state.blocks, action.blockId);
      if (!source) {
        return state;
      }
      const cloned: Block = {
        ...source,
        id: crypto.randomUUID(),
        data: structuredClone(source.data),
        dsl: source.dsl ? structuredClone(source.dsl) : undefined,
      };
      const nextBlocks = insertBlockAt(state.blocks, cloned, {
        parentId: location.parentId,
        columnIndex: location.columnIndex,
        index: location.index + 1,
      });
      return {
        ...state,
        blocks: nextBlocks,
        selectedId: cloned.id,
      };
    }
    case "move-block": {
      const location = findBlockLocation(state.blocks, action.blockId);
      if (!location) {
        return state;
      }
      const { blocks: without, removed } = removeBlockAt(
        state.blocks,
        location
      );
      if (!removed) {
        return state;
      }
      const sameContainer =
        location.parentId === (action.target.parentId ?? null) &&
        location.columnIndex === (action.target.columnIndex ?? null);
      const targetIndex =
        typeof action.target.index === "number"
          ? action.target.index
          : sameContainer
            ? location.index
            : undefined;
      const adjustedTarget: BlockTarget = {
        parentId: action.target.parentId ?? null,
        columnIndex: action.target.columnIndex ?? null,
        index:
          sameContainer &&
          typeof targetIndex === "number" &&
          location.index < targetIndex
            ? targetIndex - 1
            : targetIndex,
      };
      return {
        ...state,
        blocks: insertBlockAt(without, removed, adjustedTarget),
      };
    }
    default:
      return state;
  }
}

type EditorContextValue = {
  state: EditorState;
  addBlock: (blockType: BlockType, target?: BlockTarget) => void;
  addDslBlocks: (dsl: BlockDSL, target?: BlockTarget) => void;
  selectBlock: (blockId: string | null) => void;
  updateBlock: (blockId: string, data: Partial<BlockData>) => void;
  removeBlock: (blockId: string) => void;
  moveBlock: (blockId: string, target: BlockTarget) => void;
  cloneBlock: (blockId: string) => void;
};

const EditorContext = createContext<EditorContextValue | null>(null);

export function EditorProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(editorReducer, initialState);

  const value = useMemo<EditorContextValue>(
    () => ({
      state,
      addBlock: (blockType, target) =>
        dispatch({ type: "add-block", blockType, target }),
      addDslBlocks: (dsl, target) => dispatch({ type: "add-dsl", dsl, target }),
      selectBlock: (blockId) => dispatch({ type: "select-block", blockId }),
      updateBlock: (blockId, data) =>
        dispatch({ type: "update-block", blockId, data }),
      removeBlock: (blockId) => dispatch({ type: "remove-block", blockId }),
      moveBlock: (blockId, target) =>
        dispatch({ type: "move-block", blockId, target }),
      cloneBlock: (blockId) => dispatch({ type: "clone-block", blockId }),
    }),
    [state]
  );

  return (
    <EditorContext.Provider value={value}>{children}</EditorContext.Provider>
  );
}

export function useEditor() {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error("useEditor must be used within EditorProvider");
  }
  return context;
}
