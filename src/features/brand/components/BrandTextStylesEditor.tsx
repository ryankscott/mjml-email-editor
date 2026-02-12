import { Pencil, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
        <Button variant="pillNeutral" size="sm" onClick={onAddTextStyle}>
          <Plus className="h-3.5 w-3.5" />
          Add new
        </Button>
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
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onExpandedStyleIdChange(isExpanded ? null : style.id)}
                    className="h-8 w-8 rounded-full border-slate-200 bg-white hover:border-slate-300 hover:text-slate-700"
                    aria-label={`Edit ${style.label}`}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      isBaseStyle ? onResetTextStyle(style.id) : onRemoveTextStyle(style.id)
                    }
                    className="h-8 w-8 rounded-full border-slate-200 bg-white hover:border-slate-300 hover:text-rose-600"
                    title={isBaseStyle ? "Reset to default" : "Delete style"}
                    aria-label={isBaseStyle ? "Reset to default" : "Delete style"}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {isExpanded ? (
                <div className="mt-4 grid gap-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-2">
                      <Label>Label</Label>
                      <Input
                        value={style.label}
                        onChange={(event) =>
                          onUpdateTextStyle(style.id, { label: event.target.value })
                        }
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label>Font size</Label>
                      <Input
                        value={style.fontSize}
                        onChange={(event) =>
                          onUpdateTextStyle(style.id, { fontSize: event.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-2">
                      <Label>Font family</Label>
                      <Input
                        value={style.fontFamily}
                        onChange={(event) =>
                          onUpdateTextStyle(style.id, { fontFamily: event.target.value })
                        }
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label>Font weight</Label>
                      <Input
                        value={style.fontWeight ?? ""}
                        onChange={(event) =>
                          onUpdateTextStyle(style.id, {
                            fontWeight: event.target.value || undefined,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label>Line height</Label>
                    <Input
                      value={style.lineHeight ?? ""}
                      onChange={(event) =>
                        onUpdateTextStyle(style.id, {
                          lineHeight: event.target.value || undefined,
                        })
                      }
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
