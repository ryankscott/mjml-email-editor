import type { Block, HtmlData } from "@/lib/editor";

import Label from "./Label";

export default function HtmlInspector({
  block,
  onChange,
}: {
  block: Block;
  onChange: (data: Partial<HtmlData>) => void;
}) {
  const data = block.data as HtmlData;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label>HTML</Label>
        <textarea
          value={data.content}
          onChange={(event) => onChange({ content: event.target.value })}
          className="min-h-36 rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-sm text-slate-900"
          placeholder="<div>Custom HTML</div>"
        />
      </div>
    </div>
  );
}
