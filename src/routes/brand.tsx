import { createFileRoute } from "@tanstack/react-router";

import BrandSettingsPanel from "../components/editor/BrandSettingsPanel";
import { useBrand } from "../components/editor/BrandProvider";
import Header from "../components/editor/Header";

export const Route = createFileRoute("/brand")({
  component: BrandPage,
});

function BrandPage() {
  const { createDefaultBrand } = useBrand();

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <Header
        showCopyActions={false}
        actions={
          <button
            type="button"
            onClick={() => createDefaultBrand()}
            className="rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
          >
            New brand
          </button>
        }
      />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <BrandSettingsPanel />
        </div>
      </main>
    </div>
  );
}
