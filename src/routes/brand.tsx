import { createFileRoute } from "@tanstack/react-router";

import BrandSettingsPanel from "@/components/editor/BrandSettingsPanel";
import { useBrand } from "@/components/editor/BrandProvider";
import AppPageShell from "@/shared/layout/AppPageShell";

export const Route = createFileRoute("/brand")({
  component: BrandPage,
});

export function BrandPage() {
  const { createDefaultBrand } = useBrand();

  return (
    <AppPageShell
      actions={
        <button
          type="button"
          onClick={() => void createDefaultBrand()}
          className="rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
        >
          New brand
        </button>
      }
    >
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <BrandSettingsPanel />
      </div>
    </AppPageShell>
  );
}
