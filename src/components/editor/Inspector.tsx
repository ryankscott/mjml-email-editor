import type {
  Block,
  BlockDSL,
  ImageData,
  LayoutData,
  SectionData,
  TextData,
} from "../../lib/editor";
import { useEditor } from "./EditorProvider";

function Label({ children }: { children: string }) {
  return (
    <span className="text-xs font-semibold text-slate-400">{children}</span>
  );
}

export default function Inspector() {
  const { state, updateBlock, removeBlock } = useEditor();
  const activeBlock = state.selectedId
    ? findBlockById(state.blocks, state.selectedId)
    : null;

  if (!activeBlock) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-center text-slate-400">
        <p className="text-sm font-semibold text-slate-200">Inspector</p>
        <p className="text-xs">Select a block to edit its settings.</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-5 overflow-y-auto">
      <div>
        <h2 className="text-lg font-semibold text-slate-100 capitalize">
          {activeBlock.type}
        </h2>
        <p className="text-xs text-slate-400">Block settings</p>
      </div>

      {activeBlock.type === "section" ? (
        <SectionInspector
          block={activeBlock}
          onChange={(data) => updateBlock(activeBlock.id, data)}
        />
      ) : null}

      {activeBlock.type === "layout-2" || activeBlock.type === "layout-3" ? (
        <LayoutInspector
          block={activeBlock}
          onChange={(data) => updateBlock(activeBlock.id, data)}
        />
      ) : null}

      {activeBlock.type === "text" ? (
        <TextInspector
          block={activeBlock}
          onChange={(data) => updateBlock(activeBlock.id, data)}
        />
      ) : null}

      {activeBlock.type === "image" ? (
        <ImageInspector
          block={activeBlock}
          onChange={(data) => updateBlock(activeBlock.id, data)}
        />
      ) : null}

      {activeBlock.dsl ? <DslInspector dsl={activeBlock.dsl} /> : null}

      <button
        type="button"
        onClick={() => removeBlock(activeBlock.id)}
        className="mt-auto rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-2 text-sm font-semibold text-rose-200 transition hover:border-rose-400 hover:bg-rose-500/20"
      >
        Delete block
      </button>
    </div>
  );
}

function findBlockById(blocks: Block[], blockId: string): Block | null {
  for (const block of blocks) {
    if (block.id === blockId) {
      return block;
    }
    if (block.type === "layout-2" || block.type === "layout-3") {
      const data = block.data as LayoutData;
      for (const column of data.columnBlocks) {
        const match = findBlockById(column, blockId);
        if (match) {
          return match;
        }
      }
    }
  }
  return null;
}

function DslInspector({ dsl }: { dsl: BlockDSL }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
      <p className="text-xs font-semibold text-slate-200">DSL (read-only)</p>
      <pre className="mt-2 whitespace-pre-wrap text-xs text-slate-400">
        {JSON.stringify(dsl, null, 2)}
      </pre>
    </div>
  );
}

function LayoutInspector({
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
        <div className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100">
          {data.columns}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label>Background</Label>
        <input
          type="color"
          value={data.backgroundColor}
          onChange={(event) =>
            onChange({ backgroundColor: event.target.value })
          }
          className="h-10 w-full cursor-pointer rounded-lg border border-slate-700 bg-slate-900"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label>Padding</Label>
        <input
          type="text"
          value={data.padding}
          onChange={(event) => onChange({ padding: event.target.value })}
          className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
          placeholder="16px"
        />
      </div>
    </div>
  );
}

function SectionInspector({
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
          onChange={(event) =>
            onChange({ backgroundColor: event.target.value })
          }
          className="h-10 w-full cursor-pointer rounded-lg border border-slate-700 bg-slate-900"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label>Padding</Label>
        <input
          type="text"
          value={data.padding}
          onChange={(event) => onChange({ padding: event.target.value })}
          className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
          placeholder="20px"
        />
      </div>
    </div>
  );
}

function TextInspector({
  block,
  onChange,
}: {
  block: Block;
  onChange: (data: Partial<TextData>) => void;
}) {
  const data = block.data as TextData;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label>Content</Label>
        <textarea
          value={data.content}
          onChange={(event) => onChange({ content: event.target.value })}
          className="min-h-30 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-2">
          <Label>Text color</Label>
          <input
            type="color"
            value={data.color}
            onChange={(event) => onChange({ color: event.target.value })}
            className="h-10 w-full cursor-pointer rounded-lg border border-slate-700 bg-slate-900"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label>Font size</Label>
          <input
            type="text"
            value={data.fontSize}
            onChange={(event) => onChange({ fontSize: event.target.value })}
            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
            placeholder="16px"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label>Alignment</Label>
        <select
          value={data.align}
          onChange={(event) =>
            onChange({ align: event.target.value as TextData["align"] })
          }
          className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </select>
      </div>
    </div>
  );
}

function ImageInspector({
  block,
  onChange,
}: {
  block: Block;
  onChange: (data: Partial<ImageData>) => void;
}) {
  const data = block.data as ImageData;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label>Image URL</Label>
        <input
          type="text"
          value={data.src}
          onChange={(event) => onChange({ src: event.target.value })}
          className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
          placeholder="https://..."
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label>Alt text</Label>
        <input
          type="text"
          value={data.alt}
          onChange={(event) => onChange({ alt: event.target.value })}
          className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label>Width</Label>
        <input
          type="text"
          value={data.width}
          onChange={(event) => onChange({ width: event.target.value })}
          className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
          placeholder="600px"
        />
      </div>
    </div>
  );
}
