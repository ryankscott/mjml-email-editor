import type { Block, ImageData } from "@/lib/editor";

import Label from "./Label";

export default function ImageInspector({
  block,
  onChange,
  onOpenImageLibrary,
}: {
  block: Block;
  onChange: (data: Partial<ImageData>) => void;
  onOpenImageLibrary: () => void;
}) {
  const data = block.data as ImageData;

  return (
    <div className="flex flex-col gap-4">
      <button
        type="button"
        onClick={onOpenImageLibrary}
        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
      >
        Choose from library
      </button>

      <div className="flex flex-col gap-2">
        <Label>Image URL</Label>
        <input
          type="text"
          value={data.src}
          onChange={(event) =>
            onChange({ src: event.target.value, assetId: undefined })
          }
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
          placeholder="https://..."
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label>Alt text</Label>
        <input
          type="text"
          value={data.alt}
          onChange={(event) => onChange({ alt: event.target.value })}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label>Width</Label>
        <input
          type="text"
          value={data.width}
          onChange={(event) => onChange({ width: event.target.value })}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
          placeholder="600px"
        />
      </div>
    </div>
  );
}
