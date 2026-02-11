import { useEffect, useMemo, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";

import type { Brand, TextStyle, TextStyleId } from "../../lib/brand";
import { DEFAULT_TEXT_STYLES } from "../../lib/brand";
import { useBrand } from "./BrandProvider";

const STYLE_ORDER: TextStyleId[] = [
  "heading1",
  "heading2",
  "heading3",
  "caption",
  "paragraph",
];

function ensureTextStyles(styles: TextStyle[]): TextStyle[] {
  const ordered = STYLE_ORDER.map(
    (id) =>
      styles.find((style) => style.id === id) ??
      DEFAULT_TEXT_STYLES.find((style) => style.id === id)!
  );
  const baseIds = new Set(STYLE_ORDER);
  const extras = styles.filter((style) => !baseIds.has(style.id as TextStyleId));
  return [...ordered, ...extras];
}

export default function BrandSettingsPanel() {
  const {
    brands,
    activeBrandId,
    setActiveBrandId,
    upsertBrand,
    deleteBrand,
    createDefaultBrand,
  } = useBrand();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [expandedStyleId, setExpandedStyleId] = useState<string | null>(null);

  useEffect(() => {
    if (activeBrandId) {
      setSelectedId(activeBrandId);
      return;
    }
    setSelectedId(brands[0]?.id ?? null);
  }, [activeBrandId, brands]);

  useEffect(() => {
    setExpandedStyleId(null);
  }, [selectedId]);

  const selectedBrand = useMemo(
    () => brands.find((brand) => brand.id === selectedId) ?? null,
    [brands, selectedId]
  );

  const handleUpdate = async (next: Brand) => {
    await upsertBrand({
      id: next.id,
      name: next.name,
      colors: next.colors,
      textStyles: next.textStyles,
    });
  };

  const handleCreate = async () => {
    const created = await createDefaultBrand();
    await setActiveBrandId(created.id);
    setSelectedId(created.id);
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm("Delete this brand?");
    if (!confirmed) {
      return;
    }
    await deleteBrand(id);
  };

  const handleAddColor = (brand: Brand) => {
    handleUpdate({
      ...brand,
      colors: [
        ...brand.colors,
        {
          id: crypto.randomUUID(),
          name: "New color",
          value: "#f7f2eb",
        },
      ],
    });
  };

  const handleAddTextStyle = (brand: Brand, styles: TextStyle[]) => {
    const newStyle: TextStyle = {
      id: crypto.randomUUID(),
      label: "New style",
      fontSize: "16px",
      fontFamily: "Helvetica, Arial, sans-serif",
      fontWeight: "400",
      lineHeight: "1.5",
    };
    handleUpdate({
      ...brand,
      textStyles: [...styles, newStyle],
    });
    setExpandedStyleId(newStyle.id);
  };

  const handleUpdateTextStyle = (
    brand: Brand,
    styles: TextStyle[],
    id: string,
    next: Partial<TextStyle>
  ) => {
    handleUpdate({
      ...brand,
      textStyles: styles.map((style) =>
        style.id === id ? { ...style, ...next } : style
      ),
    });
  };

  const handleResetTextStyle = (
    brand: Brand,
    styles: TextStyle[],
    id: string
  ) => {
    const fallback = DEFAULT_TEXT_STYLES.find((style) => style.id === id);
    if (!fallback) {
      return;
    }
    handleUpdate({
      ...brand,
      textStyles: styles.map((style) =>
        style.id === id ? { ...fallback } : style
      ),
    });
  };

  const handleRemoveTextStyle = (
    brand: Brand,
    styles: TextStyle[],
    id: string
  ) => {
    handleUpdate({
      ...brand,
      textStyles: styles.filter((style) => style.id !== id),
    });
    if (expandedStyleId === id) {
      setExpandedStyleId(null);
    }
  };

  const textStyles = selectedBrand
    ? ensureTextStyles(selectedBrand.textStyles)
    : [];
  const baseStyleIds = new Set(STYLE_ORDER);

  const rightPane = selectedBrand ? (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-slate-600">Brand name</label>
        <input
          value={selectedBrand.name}
          onChange={(event) =>
            handleUpdate({ ...selectedBrand, name: event.target.value })
          }
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
        />
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <h3 className="text-sm font-semibold text-slate-900">Colors</h3>
            <span className="text-xs text-slate-500">
              ({selectedBrand.colors.length})
            </span>
          </div>
          <button
            type="button"
            onClick={() => handleAddColor(selectedBrand)}
            className="rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-slate-400 hover:text-slate-800"
          >
            Add new
          </button>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center justify-between rounded-xl bg-slate-200/70 px-4 py-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">
              Primary Palette
            </span>
            <span className="text-[11px] font-semibold text-slate-500">
              Edit palette
            </span>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {selectedBrand.colors.map((color) => (
              <div
                key={color.id}
                className="group flex flex-col items-center gap-2"
              >
                <div className="relative">
                  <div
                    className="h-16 w-16 rounded-xl border border-slate-200 shadow-sm"
                    style={{ backgroundColor: color.value }}
                  />
                  <input
                    type="color"
                    value={color.value}
                    onChange={(event) =>
                      handleUpdate({
                        ...selectedBrand,
                        colors: selectedBrand.colors.map((entry) =>
                          entry.id === color.id
                            ? { ...entry, value: event.target.value }
                            : entry
                        ),
                      })
                    }
                    aria-label={`Pick ${color.name} color`}
                    className="absolute inset-0 h-16 w-16 cursor-pointer opacity-0"
                  />
                </div>
                <input
                  value={color.name}
                  onChange={(event) =>
                    handleUpdate({
                      ...selectedBrand,
                      colors: selectedBrand.colors.map((entry) =>
                        entry.id === color.id
                          ? { ...entry, name: event.target.value }
                          : entry
                      ),
                    })
                  }
                  className="w-full max-w-[120px] rounded-md border border-transparent bg-transparent px-2 py-1 text-center text-xs font-semibold text-slate-700 transition focus:border-slate-300 focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() =>
                    handleUpdate({
                      ...selectedBrand,
                      colors: selectedBrand.colors.filter(
                        (entry) => entry.id !== color.id
                      ),
                    })
                  }
                  className="text-[10px] font-semibold text-slate-400 opacity-0 transition hover:text-rose-500 group-hover:opacity-100"
                >
                  Remove
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={() => handleAddColor(selectedBrand)}
              className="flex h-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-white/60 px-3 py-6 text-xs font-semibold text-slate-500 transition hover:border-slate-400 hover:text-slate-700"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 text-lg text-slate-500">
                +
              </span>
              Add new
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <h3 className="text-sm font-semibold text-slate-900">Fonts</h3>
            <span className="text-xs text-slate-500">
              ({textStyles.length})
            </span>
          </div>
          <button
            type="button"
            onClick={() => handleAddTextStyle(selectedBrand, textStyles)}
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
                      onClick={() =>
                        setExpandedStyleId(isExpanded ? null : style.id)
                      }
                      className="rounded-full border border-slate-200 bg-white p-2 transition hover:border-slate-300 hover:text-slate-700"
                      aria-label={`Edit ${style.label}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        isBaseStyle
                          ? handleResetTextStyle(
                              selectedBrand,
                              textStyles,
                              style.id
                            )
                          : handleRemoveTextStyle(
                              selectedBrand,
                              textStyles,
                              style.id
                            )
                      }
                      className="rounded-full border border-slate-200 bg-white p-2 transition hover:border-slate-300 hover:text-rose-600"
                      title={
                        isBaseStyle ? "Reset to default" : "Delete style"
                      }
                      aria-label={
                        isBaseStyle ? "Reset to default" : "Delete style"
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {isExpanded ? (
                  <div className="mt-4 grid gap-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-semibold text-slate-600">
                          Label
                        </label>
                        <input
                          value={style.label}
                          onChange={(event) =>
                            handleUpdateTextStyle(
                              selectedBrand,
                              textStyles,
                              style.id,
                              { label: event.target.value }
                            )
                          }
                          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-semibold text-slate-600">
                          Font size
                        </label>
                        <input
                          value={style.fontSize}
                          onChange={(event) =>
                            handleUpdateTextStyle(
                              selectedBrand,
                              textStyles,
                              style.id,
                              { fontSize: event.target.value }
                            )
                          }
                          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-semibold text-slate-600">
                          Font family
                        </label>
                        <input
                          value={style.fontFamily}
                          onChange={(event) =>
                            handleUpdateTextStyle(
                              selectedBrand,
                              textStyles,
                              style.id,
                              { fontFamily: event.target.value }
                            )
                          }
                          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-semibold text-slate-600">
                          Font weight
                        </label>
                        <input
                          value={style.fontWeight ?? ""}
                          onChange={(event) =>
                            handleUpdateTextStyle(
                              selectedBrand,
                              textStyles,
                              style.id,
                              {
                                fontWeight:
                                  event.target.value || undefined,
                              }
                            )
                          }
                          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-semibold text-slate-600">
                        Line height
                      </label>
                      <input
                        value={style.lineHeight ?? ""}
                        onChange={(event) =>
                          handleUpdateTextStyle(
                            selectedBrand,
                            textStyles,
                            style.id,
                            {
                              lineHeight: event.target.value || undefined,
                            }
                          )
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
    </div>
  ) : (
    <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
      Select a brand to edit its settings.
    </div>
  );

  return (
    <div className="grid gap-6 md:grid-cols-[260px_1fr]">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900">Brands</h3>
          <button
            type="button"
            onClick={handleCreate}
            className="rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-slate-400 hover:text-slate-800"
          >
            New
          </button>
        </div>

        <div className="flex flex-col gap-2">
          {brands.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-200 p-4 text-center text-xs text-slate-400">
              No brands yet.
            </div>
          ) : null}
          {brands.map((brand) => (
            <button
              key={brand.id}
              type="button"
              onClick={() => setSelectedId(brand.id)}
              className={`rounded-lg border px-3 py-2 text-left text-sm transition ${
                brand.id === selectedId
                  ? "border-cyan-400 bg-cyan-50 text-cyan-900"
                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold">{brand.name}</span>
                {brand.id === activeBrandId ? (
                  <span className="rounded-full border border-cyan-300 px-2 py-0.5 text-[10px] font-semibold uppercase text-cyan-700">
                    Active
                  </span>
                ) : null}
              </div>
            </button>
          ))}
        </div>

        {selectedBrand ? (
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => setActiveBrandId(selectedBrand.id)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
            >
              Set active
            </button>
            <button
              type="button"
              onClick={() => handleDelete(selectedBrand.id)}
              className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 transition hover:border-rose-300 hover:bg-rose-100"
            >
              Delete brand
            </button>
          </div>
        ) : null}
      </div>

      {rightPane}
    </div>
  );
}
