import { Input } from "@/components/ui/input";
import { Select, SelectItem } from "@/components/ui/select";
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
        <Input
          type="text"
          value={data.borderWidth}
          onChange={(event) => onChange({ borderWidth: event.target.value })}
          placeholder="1px"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label>Border style</Label>
        <Select
          value={data.borderStyle}
          onValueChange={(value) => onChange({ borderStyle: value })}
        >
          <SelectItem value="solid">Solid</SelectItem>
          <SelectItem value="dashed">Dashed</SelectItem>
          <SelectItem value="dotted">Dotted</SelectItem>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <Label>Padding</Label>
        <Input
          type="text"
          value={data.padding}
          onChange={(event) => onChange({ padding: event.target.value })}
          placeholder="10px 0"
        />
      </div>
    </div>
  );
}
