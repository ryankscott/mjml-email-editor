import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
        <Button variant="pillNeutral" size="pill" onClick={handleUploadClick}>
          Upload images
        </Button>
      }
    >
      <Card className="p-6">
        <ImageLibraryPage
          showInlineUpload={false}
          onUploadButtonReady={(trigger) => setTriggerUpload(() => trigger)}
        />
      </Card>
    </AppPageShell>
  );
}
