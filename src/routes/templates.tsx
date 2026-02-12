import { useMemo, useRef, useState, type ChangeEvent } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useEditorActions, useEditorState } from "@/components/editor/EditorProvider";
import { useTemplateMutations, useTemplatesQuery } from "@/features/templates/api/templates";
import type { Template } from "@/lib/templates";
import {
  buildTemplatePreview,
  cloneBlocksWithNewIds,
  createTemplateFromBlocks,
  parseTemplateJson,
} from "@/lib/templates";
import AppPageShell from "@/shared/layout/AppPageShell";
import { EmptyState, ErrorNotice } from "@/shared/ui/AsyncState";

export const Route = createFileRoute("/templates")({
  component: TemplatesPage,
});

export function TemplatesPage() {
  const { blocks } = useEditorState();
  const { replaceBlocks } = useEditorActions();
  const navigate = useNavigate();
  const { data: templates = [], isLoading, error, refetch } = useTemplatesQuery();
  const { createTemplate, deleteTemplate } = useTemplateMutations();
  const [status, setStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleApplyTemplate = (template: Template) => {
    const nextBlocks = cloneBlocksWithNewIds(template.blocks);
    replaceBlocks(nextBlocks);
    setStatus(`Applied "${template.name}".`);
    navigate({ to: "/editor" });
  };

  const downloadJson = (template: Template, filename: string) => {
    const blob = new Blob([JSON.stringify(template, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const handleExportCurrent = () => {
    const exportName = `Canvas export ${new Date().toISOString().slice(0, 10)}`;
    const template = createTemplateFromBlocks({
      name: exportName,
      blocks: structuredClone(blocks),
      preview: buildTemplatePreview(blocks) ?? undefined,
    });
    downloadJson(template, `${slugify(exportName)}.json`);
    setStatus("Current canvas exported.");
  };

  const handleExportTemplate = (template: Template) => {
    downloadJson(template, `${slugify(template.name)}.json`);
    setStatus(`Exported "${template.name}".`);
  };

  const handleDeleteTemplate = async (template: Template) => {
    try {
      await deleteTemplate(template.id);
      setStatus(`Deleted "${template.name}".`);
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Failed to delete template.");
    }
  };

  const handleImportClick = () => fileInputRef.current?.click();

  const handleImportFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const { input, warnings } = parseTemplateJson(parsed);
      const saved = await createTemplate({
        ...input,
        blocks: structuredClone(input.blocks),
      });
      replaceBlocks(cloneBlocksWithNewIds(saved.blocks));
      setStatus(
        warnings.length
          ? `Imported with ${warnings.length} warning(s).`
          : `Imported "${saved.name}".`,
      );
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Failed to import template.");
    } finally {
      event.target.value = "";
    }
  };

  const statusLine = useMemo(() => {
    if (status) {
      return status;
    }
    if (isLoading) {
      return "Loading templates...";
    }
    return `${templates.length} templates`;
  }, [status, isLoading, templates.length]);

  const errorMessage =
    error instanceof Error ? error.message : error ? "Failed to load templates." : null;

  return (
    <AppPageShell
      actions={
        <>
          <Button variant="pillNeutral" size="pill" onClick={handleImportClick}>
            Import JSON
          </Button>
          <Button variant="pillNeutral" size="pill" onClick={handleExportCurrent}>
            Export current
          </Button>
        </>
      }
    >
      <Card className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Template Library</h2>
            <p className="mt-1 text-xs text-slate-500">{statusLine}</p>
          </div>
          <Button variant="pillNeutral" size="sm" onClick={() => void refetch()}>
            Refresh
          </Button>
        </div>

        {errorMessage ? <ErrorNotice message={errorMessage} /> : null}

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {templates.length === 0 && !isLoading ? (
            <EmptyState>No templates yet. Save a template to build your library.</EmptyState>
          ) : null}

          {templates.map((template) => (
            <Card key={template.id} className="p-0">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">{template.name}</h3>
                    {template.description ? (
                      <p className="mt-1 text-xs text-slate-500">{template.description}</p>
                    ) : null}
                  </div>
                </div>

                <div className="mt-3 h-32 overflow-hidden rounded-lg border border-slate-200 bg-white text-black">
                  {template.preview?.html ? (
                    <div
                      className="pointer-events-none origin-top-left scale-[0.75]"
                      dangerouslySetInnerHTML={{
                        __html: template.preview.html,
                      }}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-slate-400">
                      No preview available
                    </div>
                  )}
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    variant="pillAccent"
                    size="sm"
                    onClick={() => handleApplyTemplate(template)}
                  >
                    Apply in editor
                  </Button>
                  <Button
                    variant="pillNeutral"
                    size="sm"
                    onClick={() => handleExportTemplate(template)}
                  >
                    Export
                  </Button>
                  <Button
                    variant="pillDanger"
                    size="sm"
                    onClick={() => void handleDeleteTemplate(template)}
                  >
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </Card>

      <input
        ref={fileInputRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={(event) => void handleImportFile(event)}
      />
    </AppPageShell>
  );
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .trim()
    .slice(0, 60);
}
