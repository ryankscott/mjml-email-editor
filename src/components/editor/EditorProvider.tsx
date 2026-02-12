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
  BlockTarget,
  BlockType,
} from "../../lib/editor";
import {
  cloneBlock as cloneBlockInTree,
  createBlock,
  expandDsl,
  insertBlock,
  insertBlocks,
  moveBlock,
  removeBlock,
  updateBlock,
} from "../../lib/editor";

export type EditorState = {
  blocks: Block[];
  selectedId: string | null;
};

type EditorAction =
  | { type: "add-block"; block: Block; target?: BlockTarget }
  | { type: "add-dsl"; dsl: BlockDSL; target?: BlockTarget }
  | { type: "replace-blocks"; blocks: Block[] }
  | { type: "select-block"; blockId: string | null }
  | { type: "update-block"; blockId: string; data: Partial<BlockData> }
  | { type: "remove-block"; blockId: string }
  | { type: "move-block"; blockId: string; target: BlockTarget }
  | { type: "clone-block"; blockId: string };

const initialState: EditorState = {
  blocks: [],
  selectedId: null,
};

function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case "add-block": {
      const block = action.block;
      return {
        ...state,
        blocks: action.target
          ? insertBlock(state.blocks, block, action.target)
          : [...state.blocks, block],
        selectedId: block.id,
      };
    }
    case "add-dsl": {
      const expanded = expandDsl(action.dsl);
      if (expanded.length === 0) {
        return state;
      }
      return {
        ...state,
        blocks: action.target
          ? insertBlocks(state.blocks, expanded, action.target)
          : [...state.blocks, ...expanded],
        selectedId: expanded[0]?.id ?? state.selectedId,
      };
    }
    case "replace-blocks":
      return {
        ...state,
        blocks: action.blocks,
        selectedId: action.blocks[0]?.id ?? null,
      };
    case "select-block":
      return {
        ...state,
        selectedId: action.blockId,
      };
    case "update-block":
      return {
        ...state,
        blocks: updateBlock(state.blocks, action.blockId, (block) => ({
          ...block,
          data: {
            ...block.data,
            ...action.data,
          },
        })),
      };
    case "remove-block": {
      const result = removeBlock(state.blocks, action.blockId);
      if (!result.removed) {
        return state;
      }
      return {
        ...state,
        blocks: result.blocks,
        selectedId:
          state.selectedId === action.blockId ? null : state.selectedId,
      };
    }
    case "clone-block": {
      const result = cloneBlockInTree(state.blocks, action.blockId);
      if (!result.clonedId) {
        return state;
      }
      return {
        ...state,
        blocks: result.blocks,
        selectedId: result.clonedId,
      };
    }
    case "move-block":
      return {
        ...state,
        blocks: moveBlock(state.blocks, action.blockId, action.target),
      };
    default:
      return state;
  }
}

type EditorActions = {
  addBlock: (blockType: BlockType, target?: BlockTarget) => string;
  addDslBlocks: (dsl: BlockDSL, target?: BlockTarget) => void;
  replaceBlocks: (blocks: Block[]) => void;
  selectBlock: (blockId: string | null) => void;
  updateBlock: (blockId: string, data: Partial<BlockData>) => void;
  removeBlock: (blockId: string) => void;
  moveBlock: (blockId: string, target: BlockTarget) => void;
  cloneBlock: (blockId: string) => void;
};

type EditorContextValue = EditorActions & {
  state: EditorState;
};

const EditorStateContext = createContext<EditorState | null>(null);
const EditorActionsContext = createContext<EditorActions | null>(null);

export function EditorProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(editorReducer, initialState);

  const actions = useMemo<EditorActions>(
    () => ({
      addBlock: (blockType, target) => {
        const block = createBlock(blockType);
        dispatch({ type: "add-block", block, target });
        return block.id;
      },
      addDslBlocks: (dsl, target) => dispatch({ type: "add-dsl", dsl, target }),
      replaceBlocks: (blocks) => dispatch({ type: "replace-blocks", blocks }),
      selectBlock: (blockId) => dispatch({ type: "select-block", blockId }),
      updateBlock: (blockId, data) =>
        dispatch({ type: "update-block", blockId, data }),
      removeBlock: (blockId) => dispatch({ type: "remove-block", blockId }),
      moveBlock: (blockId, target) =>
        dispatch({ type: "move-block", blockId, target }),
      cloneBlock: (blockId) => dispatch({ type: "clone-block", blockId }),
    }),
    [],
  );

  return (
    <EditorStateContext.Provider value={state}>
      <EditorActionsContext.Provider value={actions}>
        {children}
      </EditorActionsContext.Provider>
    </EditorStateContext.Provider>
  );
}

export function useEditorState() {
  const context = useContext(EditorStateContext);
  if (!context) {
    throw new Error("useEditorState must be used within EditorProvider");
  }
  return context;
}

export function useEditorActions() {
  const context = useContext(EditorActionsContext);
  if (!context) {
    throw new Error("useEditorActions must be used within EditorProvider");
  }
  return context;
}

export function useEditor(): EditorContextValue {
  const state = useEditorState();
  const actions = useEditorActions();
  return useMemo(
    () => ({
      state,
      ...actions,
    }),
    [state, actions],
  );
}
