import type { DragEvent } from "react";
import {
  Code2,
  Image as ImageIcon,
  LayoutGrid,
  LayoutPanelTop,
  Minus,
  Type,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import type { BlockDSL, BlockType } from "@/lib/editor";
import { FOOTER_DSL } from "@/lib/editor";
import { useEditorActions } from "./EditorProvider";

type BlockPaletteItem =
  | {
      kind: "block";
      type: BlockType;
      label: string;
      description: string;
      icon: typeof ImageIcon;
    }
  | {
      kind: "dsl";
      dsl: BlockDSL;
      label: string;
      description: string;
      icon: typeof ImageIcon;
    };

const blocks: BlockPaletteItem[] = [
  {
    kind: "block",
    type: "layout-2",
    label: "2 Columns",
    description: "Two-column layout",
    icon: LayoutGrid,
  },
  {
    kind: "block",
    type: "layout-3",
    label: "3 Columns",
    description: "Three-column layout",
    icon: LayoutGrid,
  },
  {
    kind: "block",
    type: "text",
    label: "Text",
    description: "Heading or paragraph",
    icon: Type,
  },
  {
    kind: "block",
    type: "image",
    label: "Image",
    description: "Image with alt text",
    icon: ImageIcon,
  },
  {
    kind: "block",
    type: "divider",
    label: "Divider",
    description: "Horizontal rule",
    icon: Minus,
  },
  {
    kind: "block",
    type: "html",
    label: "HTML",
    description: "Raw HTML section",
    icon: Code2,
  },
  {
    kind: "dsl",
    dsl: FOOTER_DSL,
    label: "Footer",
    description: "Compound footer block",
    icon: LayoutPanelTop,
  },
];

export default function BlocksPanel() {
  const { addBlock, addDslBlocks } = useEditorActions();

  const handleDragStart = (event: DragEvent, item: BlockPaletteItem) => {
    if (item.kind === "dsl") {
      event.dataTransfer.setData(
        "application/x-block-dsl",
        JSON.stringify(item.dsl),
      );
    } else {
      event.dataTransfer.setData("application/x-block-type", item.type);
    }
    event.dataTransfer.effectAllowed = "copy";
  };

  return (
    <div className="flex h-full flex-col gap-4">
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
          Blocks
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Drag blocks into the preview
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {blocks.map((block) => {
          const Icon = block.icon;
          return (
            <Button
              key={block.kind === "dsl" ? block.label : block.type}
              type="button"
              draggable
              onDragStart={(event) => handleDragStart(event, block)}
              onClick={() =>
                block.kind === "dsl"
                  ? addDslBlocks(block.dsl)
                  : addBlock(block.type)
              }
              variant="outline"
              className="group h-auto justify-start rounded-xl border-slate-200 bg-white p-3 text-left shadow-sm hover:border-cyan-400 hover:bg-slate-50"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-cyan-700">
                <Icon size={20} />
              </span>
              <span className="flex flex-col">
                <span className="text-sm font-medium text-slate-900">
                  {block.label}
                </span>
                <span className="text-xs text-slate-500">
                  {block.description}
                </span>
              </span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
