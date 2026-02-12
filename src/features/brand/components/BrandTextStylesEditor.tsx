import { Pencil, Plus, Trash2 } from "lucide-react";

import type { TextStyle, TextStyleId } from "@/lib/brand";

type BrandTextStylesEditorProps = {
  textStyles: TextStyle[];
  expandedStyleId: string | null;
  baseStyleIds: Set<TextStyleId>;
  onExpandedStyleIdChange: (id: string | null) => void;
  onAddTextStyle: () => void;
  onUpdateTextStyle: (id: string, next: Partial<TextStyle>) => void;
  onResetTextStyle: (id: string) => void;
  onRemoveTextStyle: (id: string) => void;
};

export default function BrandTextStylesEditor({
  textStyles,
  expandedStyleId,
  baseStyleIds,
  onExpandedStyleIdChange,
  onAddTextStyle,
  onUpdateTextStyle,
  onResetTextStyle,
  onRemoveTextStyle,
}: BrandTextStylesEditorProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-baseline gap-2">
          <h3 className="text-sm font-semibold text-slate-900">Fonts</h3>
          <span className="text-xs text-slate-500">({textStyles.length})</span>
        </div>
        <button
          type="button"
          onClick={onAddTextStyle}
          className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-slate-400 hover:text-slate-800"
        >
          <Plus className="h-3.5 w-3.5" />
          Add new
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {textStyles.map((style) => {
          const isExpanded = expandedStyleId === style.id;
          const isBaseStyle = baseStyleIds.has(style.id as TextStyleId);

          return (
            <div
              key={style.id}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div
                    className="truncate text-base font-semibold text-slate-900"
                    style={{
                      fontFamily: style.fontFamily,
                      fontSize: style.fontSize,
                      fontWeight: style.fontWeight,
                      lineHeight: style.lineHeight,
                    }}
                  >
                    {style.label}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-slate-500">
                  <button
                    type="button"
                    onClick={() => onExpandedStyleIdChange(isExpanded ? null : style.id)}
                    className="rounded-full border border-slate-200 bg-white p-2 transition hover:border-slate-300 hover:text-slate-700"
                    aria-label={`Edit ${style.label}`}
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      isBaseStyle ? onResetTextStyle(style.id) : onRemoveTextStyle(style.id)
                    }
                    className="rounded-full border border-slate-200 bg-white p-2 transition hover:border-slate-300 hover:text-rose-600"
                    title={isBaseStyle ? "Reset to default" : "Delete style"}
                    aria-label={isBaseStyle ? "Reset to default" : "Delete style"}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {isExpanded ? (
                <div className="mt-4 grid gap-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-semibold text-slate-600">Label</label>
                      <input
                        value={style.label}
                        onChange={(event) =>
                          onUpdateTextStyle(style.id, { label: event.target.value })
                        }
                        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-semibold text-slate-600">Font size</label>
                      <input
                        value={style.fontSize}
                        onChange={(event) =>
                          onUpdateTextStyle(style.id, { fontSize: event.target.value })
                        }
                        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-semibold text-slate-600">Font family</label>
                      <input
                        value={style.fontFamily}
                        onChange={(event) =>
                          onUpdateTextStyle(style.id, { fontFamily: event.target.value })
                        }
                        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-semibold text-slate-600">Font weight</label>
                      <input
                        value={style.fontWeight ?? ""}
                        onChange={(event) =>
                          onUpdateTextStyle(style.id, {
                            fontWeight: event.target.value || undefined,
                          })
                        }
                        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold text-slate-600">Line height</label>
                    <input
                      value={style.lineHeight ?? ""}
                      onChange={(event) =>
                        onUpdateTextStyle(style.id, {
                          lineHeight: event.target.value || undefined,
                        })
                      }
                      className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                    />
                  </div>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
