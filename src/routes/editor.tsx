import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import BlocksPanel from "@/components/editor/BlocksPanel";
import { useEditorState } from "@/components/editor/EditorProvider";
import Inspector from "@/components/editor/Inspector";
import PreviewFrame from "@/components/editor/PreviewFrame";
import Header from "@/components/editor/Header";
import PreviewVariablesPanel from "@/components/editor/PreviewVariablesPanel";
import TemplateSaveModal, {
  type TemplateSavePayload,
} from "@/components/editor/TemplateSaveModal";
import { useTemplateMutations } from "@/features/templates/api/templates";
import {
  extractVariableKeysFromBlocks,
  generateVariableValue,
} from "@/lib/variables";

export const Route = createFileRoute("/editor")({
  component: EditorRoute,
});

export function EditorLayout() {
  const state = useEditorState();
  const { createTemplate } = useTemplateMutations();
  const [saveOpen, setSaveOpen] = useState(false);
  const [templateStatus, setTemplateStatus] = useState<string | null>(null);
  const [mode, setMode] = useState<"canvas" | "preview">("canvas");
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});

  const detectedVariables = useMemo(
    () => extractVariableKeysFromBlocks(state.blocks),
    [state.blocks],
  );

  useEffect(() => {
    setVariableValues((previous) => {
      const next: Record<string, string> = {};
      detectedVariables.forEach((key) => {
        next[key] = previous[key] ?? generateVariableValue(key);
      });
      return next;
    });
  }, [detectedVariables]);

  const handleVariableChange = (key: string, value: string) => {
    setVariableValues((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  const handleOpenSave = () => {
    setTemplateStatus(null);
    setSaveOpen(true);
  };

  const handleSaveTemplate = async (payload: TemplateSavePayload) => {
    try {
      await createTemplate({
        name: payload.name,
        description: payload.description,
        blocks: structuredClone(state.blocks),
      });
      setTemplateStatus("Template saved.");
      setSaveOpen(false);
    } catch (error) {
      setTemplateStatus(
        error instanceof Error ? error.message : "Failed to save template.",
      );
    }
  };

  return (
    <div className="flex min-h-screen w-screen flex-col bg-slate-50 text-slate-900">
      <Header
        mode={mode}
        onModeChange={setMode}
        actions={
          <>
            <Button variant="pillAccent" size="pill" onClick={handleOpenSave}>
              Save to template
            </Button>
            {templateStatus ? (
              <span className="text-xs text-slate-500">{templateStatus}</span>
            ) : null}
          </>
        }
      />
      <div className="flex min-h-0 flex-1">
        {mode === "canvas" ? (
          <aside className="hidden w-72 shrink-0 border-r border-slate-200 bg-white p-6 lg:block">
            <BlocksPanel />
          </aside>
        ) : null}
        <main className="min-w-0 flex-1 p-6">
          {mode === "preview" ? (
            <div className="flex h-full flex-col gap-4">
              <div className="flex items-center justify-between gap-3">
                <ToggleGroup
                  value={device}
                  onValueChange={(value) => {
                    if (value === "desktop" || value === "mobile") {
                      setDevice(value);
                    }
                  }}
                >
                  <ToggleGroupItem value="desktop">Desktop</ToggleGroupItem>
                  <ToggleGroupItem value="mobile">Mobile</ToggleGroupItem>
                </ToggleGroup>
                <span className="text-xs text-slate-500">Preview is read-only.</span>
              </div>
              <div className="min-h-0 flex-1">
                <PreviewFrame
                  mode={mode}
                  device={device}
                  variableValues={variableValues}
                />
              </div>
            </div>
          ) : (
            <PreviewFrame
              mode={mode}
              device={device}
              variableValues={variableValues}
            />
          )}
        </main>
        {mode === "canvas" ? (
          <aside className="hidden w-80 shrink-0 border-l border-slate-200 bg-white p-6 xl:block">
            <Inspector />
          </aside>
        ) : (
          <aside className="hidden w-80 shrink-0 border-l border-slate-200 bg-white p-6 xl:block">
            <PreviewVariablesPanel
              variables={detectedVariables}
              values={variableValues}
              onChange={handleVariableChange}
              onRandomize={(key) =>
                handleVariableChange(key, generateVariableValue(key))
              }
            />
          </aside>
        )}
      </div>
      <div className="flex items-center justify-between border-t border-slate-200 bg-white px-6 py-3 text-xs text-slate-500">
        <span>
          {mode === "preview"
            ? "Preview mode — variables update live."
            : "Drag blocks to build your MJML email."}
        </span>
        <span>Blocks: {state.blocks.length}</span>
      </div>
      <TemplateSaveModal
        open={saveOpen}
        onClose={() => setSaveOpen(false)}
        onSave={(payload) => void handleSaveTemplate(payload)}
      />
    </div>
  );
}

export function EditorRoute() {
  return <EditorLayout />;
}
