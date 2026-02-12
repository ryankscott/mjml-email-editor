import type { Block, DividerData } from "@/lib/editor";

import Label from "./Label";

export default function DividerInspector({
  block,
  onChange,
}: {
  block: Block;
  onChange: (data: Partial<DividerData>) => void;
}) {
  const data = block.data as DividerData;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label>Border color</Label>
        <input
          type="color"
          value={data.borderColor}
          onChange={(event) => onChange({ borderColor: event.target.value })}
          className="h-10 w-full cursor-pointer rounded-lg border border-slate-300 bg-white"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label>Border width</Label>
        <input
          type="text"
          value={data.borderWidth}
          onChange={(event) => onChange({ borderWidth: event.target.value })}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
          placeholder="1px"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label>Border style</Label>
        <select
          value={data.borderStyle}
          onChange={(event) => onChange({ borderStyle: event.target.value })}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
        >
          <option value="solid">Solid</option>
          <option value="dashed">Dashed</option>
          <option value="dotted">Dotted</option>
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <Label>Padding</Label>
        <input
          type="text"
          value={data.padding}
          onChange={(event) => onChange({ padding: event.target.value })}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
          placeholder="10px 0"
        />
      </div>
    </div>
  );
}
