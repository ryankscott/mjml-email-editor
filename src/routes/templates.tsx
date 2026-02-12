import { useMemo, useRef, useState, type ChangeEvent } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

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
          <button
            type="button"
            onClick={handleImportClick}
            className="rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
          >
            Import JSON
          </button>
          <button
            type="button"
            onClick={handleExportCurrent}
            className="rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
          >
            Export current
          </button>
        </>
      }
    >
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Template Library</h2>
            <p className="mt-1 text-xs text-slate-500">{statusLine}</p>
          </div>
          <button
            type="button"
            onClick={() => void refetch()}
            className="rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-slate-400 hover:text-slate-800"
          >
            Refresh
          </button>
        </div>

        {errorMessage ? <ErrorNotice message={errorMessage} /> : null}

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {templates.length === 0 && !isLoading ? (
            <EmptyState>No templates yet. Save a template to build your library.</EmptyState>
          ) : null}

          {templates.map((template) => (
            <div
              key={template.id}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
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
                <button
                  type="button"
                  onClick={() => handleApplyTemplate(template)}
                  className="rounded-full border border-cyan-300 bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700 transition hover:border-cyan-400 hover:bg-cyan-100"
                >
                  Apply in editor
                </button>
                <button
                  type="button"
                  onClick={() => handleExportTemplate(template)}
                  className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-800"
                >
                  Export
                </button>
                <button
                  type="button"
                  onClick={() => void handleDeleteTemplate(template)}
                  className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700 transition hover:border-rose-300 hover:bg-rose-100"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

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
