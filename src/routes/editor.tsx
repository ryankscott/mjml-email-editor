import { createFileRoute } from "@tanstack/react-router";

import BlocksPanel from "../components/editor/BlocksPanel";
import { EditorProvider, useEditor } from "../components/editor/EditorProvider";
import Inspector from "../components/editor/Inspector";
import PreviewFrame from "../components/editor/PreviewFrame";
import TopBar from "../components/editor/TopBar";

export const Route = createFileRoute("/editor")({
  component: EditorRoute,
});

function EditorLayout() {
  const { state } = useEditor();

  return (
    <div className="flex min-h-screen w-screen flex-col bg-slate-950 text-slate-100">
      <TopBar />
      <div className="flex flex-1 min-h-0">
        <aside className="hidden w-72 shrink-0 border-r border-slate-800 bg-slate-900/40 p-6 lg:block">
          <BlocksPanel />
        </aside>
        <main className="flex-1 min-w-0 p-6">
          <PreviewFrame />
        </main>
        <aside className="hidden w-80 shrink-0 border-l border-slate-800 bg-slate-900/40 p-6 xl:block">
          <Inspector />
        </aside>
      </div>
      <div className="flex items-center justify-between border-t border-slate-800 bg-slate-950 px-6 py-3 text-xs text-slate-400">
        <span>Drag blocks to build your MJML email.</span>
        <span>Blocks: {state.blocks.length}</span>
      </div>
    </div>
  );
}

function EditorRoute() {
  return (
    <EditorProvider>
      <EditorLayout />
    </EditorProvider>
  );
}
