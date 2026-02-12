import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
        <Button variant="pillNeutral" size="sm" onClick={onCreate}>
          New
        </Button>
      </div>

      <div className="flex flex-col gap-2">
        {brands.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-200 p-4 text-center text-xs text-slate-400">
            No brands yet.
          </div>
        ) : null}
        {brands.map((brand) => (
          <Button
            key={brand.id}
            onClick={() => onSelect(brand.id)}
            variant="outline"
            className={`h-auto justify-start rounded-lg px-3 py-2 text-left text-sm ${
              brand.id === selectedId
                ? "border-cyan-400 bg-cyan-50 text-cyan-900 hover:bg-cyan-50"
                : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
            }`}
          >
            <div className="flex w-full items-center justify-between gap-2">
              <span className="font-semibold">{brand.name}</span>
              {brand.id === activeBrandId ? <Badge variant="accent">Active</Badge> : null}
            </div>
          </Button>
        ))}
      </div>

      {canManageSelection ? (
        <div className="flex flex-col gap-2">
          <Button variant="outline" className="justify-center rounded-lg text-xs" onClick={onSetActive}>
            Set active
          </Button>
          <Button variant="pillDanger" size="sm" className="rounded-lg" onClick={onDelete}>
            Delete brand
          </Button>
        </div>
      ) : null}
    </div>
  );
}
