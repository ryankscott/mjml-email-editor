import { useEffect, useMemo, useState } from "react";

import type { Brand, TextStyle } from "@/lib/brand";
import { DEFAULT_TEXT_STYLES } from "@/lib/brand";
import { useBrand } from "@/components/editor/BrandProvider";

import BrandColorsEditor from "./BrandColorsEditor";
import BrandListPane from "./BrandListPane";
import BrandTextStylesEditor from "./BrandTextStylesEditor";
import { STYLE_ORDER, ensureTextStyles } from "./textStyles";

export default function BrandSettingsPanelContainer() {
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
    [brands, selectedId],
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
    void handleUpdate({
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

  const textStyles = selectedBrand ? ensureTextStyles(selectedBrand.textStyles) : [];
  const baseStyleIds = new Set(STYLE_ORDER);

  const handleAddTextStyle = (brand: Brand, styles: TextStyle[]) => {
    const newStyle: TextStyle = {
      id: crypto.randomUUID(),
      label: "New style",
      fontSize: "16px",
      fontFamily: "Helvetica, Arial, sans-serif",
      fontWeight: "400",
      lineHeight: "1.5",
    };
    void handleUpdate({
      ...brand,
      textStyles: [...styles, newStyle],
    });
    setExpandedStyleId(newStyle.id);
  };

  const handleUpdateTextStyle = (
    brand: Brand,
    id: string,
    next: Partial<TextStyle>,
  ) => {
    void handleUpdate({
      ...brand,
      textStyles: textStyles.map((style) =>
        style.id === id ? { ...style, ...next } : style,
      ),
    });
  };

  const handleResetTextStyle = (brand: Brand, id: string) => {
    const fallback = DEFAULT_TEXT_STYLES.find((style) => style.id === id);
    if (!fallback) {
      return;
    }
    void handleUpdate({
      ...brand,
      textStyles: textStyles.map((style) =>
        style.id === id ? { ...fallback } : style,
      ),
    });
  };

  const handleRemoveTextStyle = (brand: Brand, id: string) => {
    void handleUpdate({
      ...brand,
      textStyles: textStyles.filter((style) => style.id !== id),
    });
    if (expandedStyleId === id) {
      setExpandedStyleId(null);
    }
  };

  const rightPane = selectedBrand ? (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-slate-600">Brand name</label>
        <input
          value={selectedBrand.name}
          onChange={(event) =>
            void handleUpdate({ ...selectedBrand, name: event.target.value })
          }
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
        />
      </div>

      <BrandColorsEditor
        brand={selectedBrand}
        onUpdate={(next) => void handleUpdate(next)}
        onAddColor={() => handleAddColor(selectedBrand)}
      />

      <BrandTextStylesEditor
        textStyles={textStyles}
        expandedStyleId={expandedStyleId}
        baseStyleIds={baseStyleIds}
        onExpandedStyleIdChange={setExpandedStyleId}
        onAddTextStyle={() => handleAddTextStyle(selectedBrand, textStyles)}
        onUpdateTextStyle={(id, next) => handleUpdateTextStyle(selectedBrand, id, next)}
        onResetTextStyle={(id) => handleResetTextStyle(selectedBrand, id)}
        onRemoveTextStyle={(id) => handleRemoveTextStyle(selectedBrand, id)}
      />
    </div>
  ) : (
    <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
      Select a brand to edit its settings.
    </div>
  );

  return (
    <div className="grid gap-6 md:grid-cols-[260px_1fr]">
      <BrandListPane
        brands={brands}
        selectedId={selectedId}
        activeBrandId={activeBrandId}
        onSelect={setSelectedId}
        onCreate={handleCreate}
        onSetActive={() => {
          if (selectedBrand) {
            void setActiveBrandId(selectedBrand.id);
          }
        }}
        onDelete={() => {
          if (selectedBrand) {
            void handleDelete(selectedBrand.id);
          }
        }}
        canManageSelection={Boolean(selectedBrand)}
      />

      {rightPane}
    </div>
  );
}
