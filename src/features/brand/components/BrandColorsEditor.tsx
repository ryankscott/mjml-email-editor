import type { Brand } from "@/lib/brand";

type BrandColorsEditorProps = {
  brand: Brand;
  onUpdate: (next: Brand) => void;
  onAddColor: () => void;
};

export default function BrandColorsEditor({
  brand,
  onUpdate,
  onAddColor,
}: BrandColorsEditorProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-baseline gap-2">
          <h3 className="text-sm font-semibold text-slate-900">Colors</h3>
          <span className="text-xs text-slate-500">({brand.colors.length})</span>
        </div>
        <button
          type="button"
          onClick={onAddColor}
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
          <span className="text-[11px] font-semibold text-slate-500">Edit palette</span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {brand.colors.map((color) => (
            <div key={color.id} className="group flex flex-col items-center gap-2">
              <div className="relative">
                <div
                  className="h-16 w-16 rounded-xl border border-slate-200 shadow-sm"
                  style={{ backgroundColor: color.value }}
                />
                <input
                  type="color"
                  value={color.value}
                  onChange={(event) =>
                    onUpdate({
                      ...brand,
                      colors: brand.colors.map((entry) =>
                        entry.id === color.id
                          ? { ...entry, value: event.target.value }
                          : entry,
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
                  onUpdate({
                    ...brand,
                    colors: brand.colors.map((entry) =>
                      entry.id === color.id
                        ? { ...entry, name: event.target.value }
                        : entry,
                    ),
                  })
                }
                className="w-full max-w-[120px] rounded-md border border-transparent bg-transparent px-2 py-1 text-center text-xs font-semibold text-slate-700 transition focus:border-slate-300 focus:bg-white"
              />
              <button
                type="button"
                onClick={() =>
                  onUpdate({
                    ...brand,
                    colors: brand.colors.filter((entry) => entry.id !== color.id),
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
            onClick={onAddColor}
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
  );
}
