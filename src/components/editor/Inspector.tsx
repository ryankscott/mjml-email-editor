import { useRef, useState } from "react";
import type {
  Block,
  BlockDSL,
  DividerData,
  HtmlData,
  ImageData,
  LayoutData,
  SectionData,
  TextData,
} from "../../lib/editor";
import { SUPPORTED_VARIABLES, formatVariableToken } from "../../lib/variables";
import { useNavigate } from "@tanstack/react-router";
import { AlignLeft, AlignCenter, AlignRight } from "lucide-react";

import { useBrand } from "./BrandProvider";
import { useEditor } from "./EditorProvider";

function Label({ children }: { children: string }) {
  return (
    <span className="text-xs font-semibold text-slate-600">{children}</span>
  );
}

export default function Inspector() {
  const { state, updateBlock, removeBlock } = useEditor();
  const navigate = useNavigate();
  const activeBlock = state.selectedId
    ? findBlockById(state.blocks, state.selectedId)
    : null;

  if (!activeBlock) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-center text-slate-500">
        <p className="text-sm font-semibold text-slate-900">Inspector</p>
        <p className="text-xs">Select a block to edit its settings.</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-5 overflow-y-auto">
      <div>
        <h2 className="text-lg font-semibold text-slate-900 capitalize">
          {activeBlock.type}
        </h2>
        <p className="text-xs text-slate-500">Block settings</p>
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
          onOpenImageLibrary={() => navigate({ to: "/images" })}
        />
      ) : null}

      {activeBlock.type === "divider" ? (
        <DividerInspector
          block={activeBlock}
          onChange={(data) => updateBlock(activeBlock.id, data)}
        />
      ) : null}

      {activeBlock.type === "html" ? (
        <HtmlInspector
          block={activeBlock}
          onChange={(data) => updateBlock(activeBlock.id, data)}
        />
      ) : null}

      {activeBlock.dsl ? <DslInspector dsl={activeBlock.dsl} /> : null}

      <button
        type="button"
        onClick={() => removeBlock(activeBlock.id)}
        className="mt-auto rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:border-rose-300 hover:bg-rose-100"
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
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-semibold text-slate-700">DSL (read-only)</p>
      <pre className="mt-2 whitespace-pre-wrap text-xs text-slate-600">
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
        <div className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900">
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
  const { activeBrand } = useBrand();
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [showVariables, setShowVariables] = useState(false);
  const textStyles = activeBrand?.textStyles ?? [];
  const colorTokens = activeBrand?.colors ?? [];
  const selectedStyle = data.textStyle ?? "custom";
  const selectedColor = data.colorToken ?? "custom";
  const hasColorToken =
    selectedColor !== "custom" &&
    colorTokens.some((color) => color.id === selectedColor);
  const hasTextStyle =
    selectedStyle !== "custom" &&
    textStyles.some((style) => style.id === selectedStyle);

  const handleInsertVariable = (key: string) => {
    const token = formatVariableToken(key);
    const textarea = textareaRef.current;
    const value = data.content ?? "";

    if (!textarea) {
      onChange({ content: `${value}${token}` });
      return;
    }

    const start = textarea.selectionStart ?? value.length;
    const end = textarea.selectionEnd ?? value.length;
    const nextValue = `${value.slice(0, start)}${token}${value.slice(end)}`;
    const nextCursor = start + token.length;

    onChange({ content: nextValue });
    requestAnimationFrame(() => {
      if (!textareaRef.current) {
        return;
      }
      textareaRef.current.focus();
      textareaRef.current.selectionStart = nextCursor;
      textareaRef.current.selectionEnd = nextCursor;
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <Label>Content</Label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowVariables((prev) => !prev)}
              className="rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-slate-400 hover:text-slate-800"
            >
              Insert variable
            </button>
            {showVariables ? (
              <div className="absolute right-0 z-10 mt-2 w-64 rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
                <p className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Supported variables
                </p>
                <div className="flex flex-col gap-1">
                  {SUPPORTED_VARIABLES.map((variable) => (
                    <button
                      key={variable.key}
                      type="button"
                      onClick={() => {
                        handleInsertVariable(variable.key);
                        setShowVariables(false);
                      }}
                      className="flex items-center justify-between rounded-lg px-2 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-50"
                    >
                      <span className="font-medium text-slate-900">
                        {variable.label}
                      </span>
                      <span className="text-xs text-slate-400">
                        {variable.token}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
        <textarea
          ref={textareaRef}
          value={data.content}
          onChange={(event) => onChange({ content: event.target.value })}
          className="min-h-30 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
        />
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-2">
          <Label>Text color</Label>
          <div className="flex flex-wrap gap-2">
            {!hasColorToken && selectedColor !== "custom" ? (
              <button
                type="button"
                onClick={() => onChange({ colorToken: undefined })}
                className="relative h-9 w-9 rounded-full border border-dashed border-slate-300 shadow-sm ring-2 ring-slate-400 ring-offset-2 ring-offset-white"
                aria-label="Unknown brand color"
                title="Unknown brand color"
                style={{ backgroundColor: data.color }}
              >
                <span className="sr-only">Unknown brand color</span>
              </button>
            ) : null}
            {colorTokens.map((color) => {
              const isSelected = selectedColor === color.id;
              return (
                <button
                  key={color.id}
                  type="button"
                  onClick={() => onChange({ colorToken: color.id })}
                  aria-label={color.name}
                  className={`relative h-9 w-9 rounded-full border border-slate-200 shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 ${
                    isSelected
                      ? "ring-2 ring-slate-400 ring-offset-2 ring-offset-white"
                      : "hover:scale-[1.02]"
                  }`}
                  style={{ backgroundColor: color.value }}
                >
                  <span className="sr-only">{color.name}</span>
                </button>
              );
            })}
            <div className="relative">
              <button
                type="button"
                onClick={() => onChange({ colorToken: undefined })}
                className={`flex h-9 w-9 items-center justify-center rounded-full border border-dashed text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 ${
                  selectedColor === "custom"
                    ? "border-slate-400 text-slate-700 ring-2 ring-slate-400 ring-offset-2 ring-offset-white"
                    : "border-slate-300 text-slate-500 hover:border-slate-400 hover:text-slate-700"
                }`}
                aria-label="Custom color"
                style={
                  selectedColor === "custom"
                    ? { backgroundColor: data.color }
                    : undefined
                }
              >
                {selectedColor === "custom" ? null : "+"}
              </button>
              <input
                type="color"
                value={data.color}
                onClick={() => onChange({ colorToken: undefined })}
                onChange={(event) =>
                  onChange({
                    colorToken: undefined,
                    color: event.target.value,
                  })
                }
                aria-label="Pick custom color"
                className="absolute inset-0 h-9 w-9 cursor-pointer opacity-0"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label>Text style</Label>
          <div className="flex flex-col gap-2">
            {!hasTextStyle && selectedStyle !== "custom" ? (
              <button
                type="button"
                onClick={() => onChange({ textStyle: undefined })}
                className="rounded-xl border border-dashed border-slate-300 bg-white px-3 py-2 text-left shadow-sm ring-2 ring-slate-400 ring-offset-2 ring-offset-white"
              >
                <div
                  className="truncate text-slate-900"
                  style={{
                    fontFamily: data.fontFamily,
                    fontSize: data.fontSize,
                    fontWeight: data.fontWeight,
                    lineHeight: data.lineHeight,
                  }}
                >
                  Unknown style
                </div>
              </button>
            ) : null}
            {textStyles.map((style) => {
              const isSelected = selectedStyle === style.id;
              return (
                <button
                  key={style.id}
                  type="button"
                  onClick={() =>
                    onChange({ textStyle: style.id as TextData["textStyle"] })
                  }
                  className={`rounded-xl border px-3 py-2 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 ${
                    isSelected
                      ? "border-slate-300 bg-white shadow-sm"
                      : "border-slate-200 bg-slate-50 hover:border-slate-300"
                  }`}
                >
                  <div
                    className="truncate text-slate-900"
                    style={{
                      fontFamily: style.fontFamily,
                      fontSize: style.fontSize,
                      fontWeight: style.fontWeight,
                      lineHeight: style.lineHeight,
                    }}
                  >
                    {style.label}
                  </div>
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => onChange({ textStyle: undefined })}
              className={`rounded-xl border px-3 py-2 text-left text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 ${
                selectedStyle === "custom"
                  ? "border-slate-300 bg-white shadow-sm"
                  : "border-slate-200 bg-slate-50 hover:border-slate-300"
              }`}
            >
              <div
                className="truncate text-slate-900"
                style={{
                  fontFamily: data.fontFamily,
                  fontSize: data.fontSize,
                  fontWeight: data.fontWeight,
                  lineHeight: data.lineHeight,
                }}
              >
                Custom
              </div>
            </button>
          </div>
        </div>
      </div>

      {selectedStyle === "custom" ? (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <Label>Font size</Label>
              <input
                type="text"
                value={data.fontSize}
                onChange={(event) => onChange({ fontSize: event.target.value })}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                placeholder="16px"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Font family</Label>
              <input
                type="text"
                value={data.fontFamily ?? ""}
                onChange={(event) =>
                  onChange({ fontFamily: event.target.value || undefined })
                }
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                placeholder="Helvetica, Arial, sans-serif"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <Label>Font weight</Label>
              <input
                type="text"
                value={data.fontWeight ?? ""}
                onChange={(event) =>
                  onChange({ fontWeight: event.target.value || undefined })
                }
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                placeholder="400"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Line height</Label>
              <input
                type="text"
                value={data.lineHeight ?? ""}
                onChange={(event) =>
                  onChange({ lineHeight: event.target.value || undefined })
                }
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                placeholder="1.5"
              />
            </div>
          </div>
        </>
      ) : null}

      <div className="flex flex-col gap-2">
        <Label>Alignment</Label>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => onChange({ align: "left" })}
            className={`flex-1 flex items-center justify-center rounded-lg border px-3 py-2 text-sm font-medium transition ${
              data.align === "left"
                ? "border-slate-300 bg-slate-100 text-slate-900"
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            <AlignLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onChange({ align: "center" })}
            className={`flex-1 flex items-center justify-center rounded-lg border px-3 py-2 text-sm font-medium transition ${
              data.align === "center"
                ? "border-slate-300 bg-slate-100 text-slate-900"
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            <AlignCenter className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onChange({ align: "right" })}
            className={`flex-1 flex items-center justify-center rounded-lg border px-3 py-2 text-sm font-medium transition ${
              data.align === "right"
                ? "border-slate-300 bg-slate-100 text-slate-900"
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            <AlignRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function ImageInspector({
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

function DividerInspector({
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

function HtmlInspector({
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
          className="min-h-36 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 font-mono"
          placeholder="<div>Custom HTML</div>"
        />
      </div>
    </div>
  );
}
