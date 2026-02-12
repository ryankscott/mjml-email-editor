import { Textarea } from "@/components/ui/textarea";
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
        <Textarea
          value={data.content}
          onChange={(event) => onChange({ content: event.target.value })}
          className="min-h-36 font-mono"
          placeholder="<div>Custom HTML</div>"
        />
      </div>
    </div>
  );
}
