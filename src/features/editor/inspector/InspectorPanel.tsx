import { useNavigate } from "@tanstack/react-router";

import { useEditorActions, useEditorState } from "@/components/editor/EditorProvider";
import { findBlock } from "@/lib/editor";

import DividerInspector from "./DividerInspector";
import DslInspector from "./DslInspector";
import HtmlInspector from "./HtmlInspector";
import ImageInspector from "./ImageInspector";
import LayoutInspector from "./LayoutInspector";
import SectionInspector from "./SectionInspector";
import TextInspector from "./TextInspector";

export default function InspectorPanel() {
  const state = useEditorState();
  const { updateBlock, removeBlock } = useEditorActions();
  const navigate = useNavigate();
  const activeBlock = state.selectedId ? findBlock(state.blocks, state.selectedId) : null;

  if (!activeBlock) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-center text-slate-500">
        <p className="text-sm font-semibold text-slate-900">Inspector</p>
        <p className="text-xs">Select a block to edit its settings.</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-5 overflow-y-auto">
      <div>
        <h2 className="text-lg font-semibold capitalize text-slate-900">{activeBlock.type}</h2>
        <p className="text-xs text-slate-500">Block settings</p>
      </div>

      {activeBlock.type === "section" ? (
        <SectionInspector
          block={activeBlock}
          onChange={(data) => updateBlock(activeBlock.id, data)}
        />
      ) : null}

      {activeBlock.type === "layout-2" || activeBlock.type === "layout-3" ? (
        <LayoutInspector
          block={activeBlock}
          onChange={(data) => updateBlock(activeBlock.id, data)}
        />
      ) : null}

      {activeBlock.type === "text" ? (
        <TextInspector
          block={activeBlock}
          onChange={(data) => updateBlock(activeBlock.id, data)}
        />
      ) : null}

      {activeBlock.type === "image" ? (
        <ImageInspector
          block={activeBlock}
          onChange={(data) => updateBlock(activeBlock.id, data)}
          onOpenImageLibrary={() => navigate({ to: "/images" })}
        />
      ) : null}

      {activeBlock.type === "divider" ? (
        <DividerInspector
          block={activeBlock}
          onChange={(data) => updateBlock(activeBlock.id, data)}
        />
      ) : null}

      {activeBlock.type === "html" ? (
        <HtmlInspector
          block={activeBlock}
          onChange={(data) => updateBlock(activeBlock.id, data)}
        />
      ) : null}

      {activeBlock.dsl ? <DslInspector dsl={activeBlock.dsl} /> : null}

      <button
        type="button"
        onClick={() => removeBlock(activeBlock.id)}
        className="mt-auto rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:border-rose-300 hover:bg-rose-100"
      >
        Delete block
      </button>
    </div>
  );
}
