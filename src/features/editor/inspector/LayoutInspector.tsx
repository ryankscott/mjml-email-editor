import { Input } from "@/components/ui/input";
import type { Block, LayoutData } from "@/lib/editor";
import { useBrand } from "@/components/editor/BrandProvider";

import ColorPicker from "./ColorPicker";
import Label from "./Label";

export default function LayoutInspector({
  block,
  onChange,
}: {
  block: Block;
  onChange: (data: Partial<LayoutData>) => void;
}) {
  const data = block.data as LayoutData;
  const { activeBrand } = useBrand();
  const colorTokens = activeBrand?.colors ?? [];
  const selectedColor = data.backgroundColorToken ?? "custom";

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label>Columns</Label>
        <div className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900">
          {data.columns}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label>Background</Label>
        <ColorPicker
          value={data.backgroundColor}
          tokens={colorTokens}
          selectedToken={selectedColor}
          onSelectToken={(tokenId) =>
            onChange({
              backgroundColorToken: tokenId === "custom" ? undefined : tokenId,
            })
          }
          onChange={(nextColor) =>
            onChange({
              backgroundColorToken: undefined,
              backgroundColor: nextColor,
            })
          }
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label>Padding</Label>
        <Input
          type="text"
          value={data.padding}
          onChange={(event) => onChange({ padding: event.target.value })}
          placeholder="16px"
        />
      </div>
    </div>
  );
}
