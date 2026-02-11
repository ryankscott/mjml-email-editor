import { useEffect, useState } from "react";

import type { Template } from "../../lib/templates";
import Modal from "./Modal";

type TemplateLibraryModalProps = {
  open: boolean;
  templates: Template[];
  loading: boolean;
  error: string | null;
  onClose: () => void;
  onRefresh: () => void;
  onApply: (template: Template) => void;
  onExport: (template: Template) => void;
  onDelete: (template: Template) => void;
};

export default function TemplateLibraryModal({
  open,
  templates,
  loading,
  error,
  onClose,
  onRefresh,
  onApply,
  onExport,
  onDelete,
}: TemplateLibraryModalProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setActiveId(null);
    }
  }, [open]);

  if (!open) {
    return null;
  }

  return (
    <Modal
      title="Template Library"
      onClose={onClose}
      maxWidth="lg"
      footer={
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>
            {loading ? "Loading templates..." : `${templates.length} templates`}
          </span>
          <button
            type="button"
            onClick={onRefresh}
            className="rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:border-slate-400 hover:text-slate-800"
          >
            Refresh
          </button>
        </div>
      }
    >
      {error ? (
        <div className="rounded-lg border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {templates.length === 0 && !loading ? (
          <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
            No templates yet. Save a template to build your library.
          </div>
        ) : null}

        {templates.map((template) => {
          const isActive = template.id === activeId;
          return (
            <div
              key={template.id}
              className={`rounded-2xl border p-4 transition ${
                isActive
                  ? "border-cyan-300 bg-cyan-50"
                  : "border-slate-200 bg-white"
              }`}
            >
              <button
                type="button"
                onClick={() => setActiveId(template.id)}
                className="w-full text-left"
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
              </button>

              <div className="mt-3 h-32 overflow-hidden rounded-lg border border-slate-200 bg-white text-black">
                {template.preview?.html ? (
                  <div
                    className="pointer-events-none scale-[0.75] origin-top-left"
                    dangerouslySetInnerHTML={{ __html: template.preview.html }}
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-slate-500">
                    No preview available
                  </div>
                )}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => onApply(template)}
                  className="rounded-full border border-cyan-300 bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700 transition hover:border-cyan-400 hover:bg-cyan-100"
                >
                  Apply
                </button>
                <button
                  type="button"
                  onClick={() => onExport(template)}
                  className="rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-slate-400 hover:text-slate-800"
                >
                  Export
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(template)}
                  className="rounded-full border border-rose-300 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700 transition hover:border-rose-400"
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </Modal>
  );
}
