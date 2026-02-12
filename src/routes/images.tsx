import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";

import ImageLibraryPage from "@/components/editor/ImageLibraryPage";
import AppPageShell from "@/shared/layout/AppPageShell";

export const Route = createFileRoute("/images")({
  component: ImagesPage,
});

export function ImagesPage() {
  const [triggerUpload, setTriggerUpload] = useState<(() => void) | null>(null);
  const handleUploadClick = useMemo(() => () => triggerUpload?.(), [triggerUpload]);

  return (
    <AppPageShell
      actions={
        <button
          type="button"
          onClick={handleUploadClick}
          className="rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
        >
          Upload images
        </button>
      }
    >
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <ImageLibraryPage
          showInlineUpload={false}
          onUploadButtonReady={(trigger) => setTriggerUpload(() => trigger)}
        />
      </div>
    </AppPageShell>
  );
}
