import { Input } from "@/components/ui/input";
import type { Block, SectionData } from "@/lib/editor";

import Label from "./Label";

export default function SectionInspector({
  block,
  onChange,
}: {
  block: Block;
  onChange: (data: Partial<SectionData>) => void;
}) {
  const data = block.data as SectionData;

  return (
    <div className="flex flex-col gap-4">
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
        <Input
          type="text"
          value={data.padding}
          onChange={(event) => onChange({ padding: event.target.value })}
          placeholder="20px"
        />
      </div>
    </div>
  );
}
