import type { Block, LayoutData } from "@/lib/editor";

import Label from "./Label";

export default function LayoutInspector({
  block,
  onChange,
}: {
  block: Block;
  onChange: (data: Partial<LayoutData>) => void;
}) {
  const data = block.data as LayoutData;

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
        <input
          type="color"
          value={data.backgroundColor}
          onChange={(event) => onChange({ backgroundColor: event.target.value })}
          className="h-10 w-full cursor-pointer rounded-lg border border-slate-300 bg-white"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label>Padding</Label>
        <input
          type="text"
          value={data.padding}
          onChange={(event) => onChange({ padding: event.target.value })}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
          placeholder="16px"
        />
      </div>
    </div>
  );
}
