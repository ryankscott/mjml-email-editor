import { useMemo } from "react";

import { useBrand } from "@/components/editor/BrandProvider";
import { useEditorState } from "@/components/editor/EditorProvider";
import { compileBlocks } from "@/lib/mjml";
import { replaceVariables } from "@/lib/variables";

import CanvasFrame from "./CanvasFrame";
import PreviewContent from "./PreviewContent";

export default function PreviewFrameContainer({
  mode,
  device,
  variableValues,
}: {
  mode: "canvas" | "preview";
  device: "desktop" | "mobile";
  variableValues: Record<string, string>;
}) {
  const state = useEditorState();
  const { activeBrand } = useBrand();
  const { errors, html } = useMemo(
    () => compileBlocks(state.blocks, activeBrand),
    [state.blocks, activeBrand],
  );
  const previewHtml = useMemo(
    () => replaceVariables(html, variableValues),
    [html, variableValues],
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
