import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
      <Button
        variant="outline"
        onClick={onOpenImageLibrary}
        className="justify-center rounded-lg border-slate-300 bg-white text-sm font-semibold text-slate-700 hover:border-slate-400 hover:bg-slate-50"
      >
        Choose from library
      </Button>

      <div className="flex flex-col gap-2">
        <Label>Image URL</Label>
        <Input
          type="text"
          value={data.src}
          onChange={(event) =>
            onChange({ src: event.target.value, assetId: undefined })
          }
          placeholder="https://..."
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label>Alt text</Label>
        <Input
          type="text"
          value={data.alt}
          onChange={(event) => onChange({ alt: event.target.value })}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label>Width</Label>
        <Input
          type="text"
          value={data.width}
          onChange={(event) => onChange({ width: event.target.value })}
          placeholder="600px"
        />
      </div>
    </div>
  );
}
