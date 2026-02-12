import type { Brand } from "@/lib/brand";

type BrandListPaneProps = {
  brands: Brand[];
  selectedId: string | null;
  activeBrandId: string | null;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onSetActive: () => void;
  onDelete: () => void;
  canManageSelection: boolean;
};

export default function BrandListPane({
  brands,
  selectedId,
  activeBrandId,
  onSelect,
  onCreate,
  onSetActive,
  onDelete,
  canManageSelection,
}: BrandListPaneProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900">Brands</h3>
        <button
          type="button"
          onClick={onCreate}
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
            onClick={() => onSelect(brand.id)}
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

      {canManageSelection ? (
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={onSetActive}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
          >
            Set active
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 transition hover:border-rose-300 hover:bg-rose-100"
          >
            Delete brand
          </button>
        </div>
      ) : null}
    </div>
  );
}
