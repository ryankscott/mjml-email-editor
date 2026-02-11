import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

import type { Template } from "../lib/templates";
import {
  buildTemplatePreview,
  cloneBlocksWithNewIds,
  createTemplateFromBlocks,
  parseTemplateJson,
} from "../lib/templates";
import { templateStore } from "../lib/templateStore";
import { useEditor } from "../components/editor/EditorProvider";
import Header from "../components/editor/Header";

export const Route = createFileRoute("/templates")({
  component: TemplatesPage,
});

function TemplatesPage() {
  const { state, replaceBlocks } = useEditor();
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const loadTemplates = async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await templateStore.list();
      setTemplates(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load templates.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadTemplates();
  }, []);


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
      blocks: structuredClone(state.blocks),
      preview: buildTemplatePreview(state.blocks) ?? undefined,
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
      await templateStore.delete(template.id);
      setStatus(`Deleted "${template.name}".`);
      await loadTemplates();
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
      const saved = await templateStore.create({
        ...input,
        blocks: structuredClone(input.blocks),
      });
      replaceBlocks(cloneBlocksWithNewIds(saved.blocks));
      setStatus(
        warnings.length
          ? `Imported with ${warnings.length} warning(s).`
          : `Imported "${saved.name}".`
      );
      await loadTemplates();
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
    if (loading) {
      return "Loading templates...";
    }
    return `${templates.length} templates`;
  }, [status, loading, templates.length]);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <Header
        showCopyActions={false}
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
      />
      <main className="flex-1 overflow-y-auto p-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Template Library
              </h2>
              <p className="mt-1 text-xs text-slate-500">{statusLine}</p>
            </div>
            <button
              type="button"
              onClick={loadTemplates}
              className="rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-slate-400 hover:text-slate-800"
            >
              Refresh
            </button>
          </div>

          {error ? (
            <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          ) : null}

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {templates.length === 0 && !loading ? (
              <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
                No templates yet. Save a template to build your library.
              </div>
            ) : null}

            {templates.map((template) => (
              <div
                key={template.id}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">
                      {template.name}
                    </h3>
                    {template.description ? (
                      <p className="mt-1 text-xs text-slate-500">
                        {template.description}
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="mt-3 h-32 overflow-hidden rounded-lg border border-slate-200 bg-white text-black">
                  {template.preview?.html ? (
                    <div
                      className="pointer-events-none scale-[0.75] origin-top-left"
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
                    onClick={() => handleDeleteTemplate(template)}
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
          onChange={handleImportFile}
        />
      </main>
    </div>
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
