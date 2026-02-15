import { useRef, useState } from "react";
import { AlignCenter, AlignLeft, AlignRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useBrand } from "@/components/editor/BrandProvider";
import type { Block, TextData } from "@/lib/editor";
import { SUPPORTED_VARIABLES, formatVariableToken } from "@/lib/variables";

import ColorPicker from "./ColorPicker";
import Label from "./Label";

export default function TextInspector({
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
            <Popover open={showVariables} onOpenChange={setShowVariables}>
              <PopoverTrigger>
                <Button variant="pillNeutral" size="sm">
                  Insert variable
                </Button>
              </PopoverTrigger>
              <PopoverContent>
                <p className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Supported variables
                </p>
                <div className="flex flex-col gap-1">
                  {SUPPORTED_VARIABLES.map((variable) => (
                    <Button
                      key={variable.key}
                      variant="ghost"
                      className="h-auto justify-between rounded-lg px-2 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                      onClick={() => {
                        handleInsertVariable(variable.key);
                        setShowVariables(false);
                      }}
                    >
                      <span className="font-medium text-slate-900">{variable.label}</span>
                      <span className="text-xs text-slate-400">{variable.token}</span>
                    </Button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <Textarea
          ref={textareaRef}
          value={data.content}
          onChange={(event) => onChange({ content: event.target.value })}
          className="min-h-30"
        />
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-2">
          <Label>Text color</Label>
          <ColorPicker
            value={data.color}
            tokens={colorTokens}
            selectedToken={selectedColor}
            onSelectToken={(tokenId) =>
              onChange({
                colorToken: tokenId === "custom" ? undefined : tokenId,
              })
            }
            onChange={(nextColor) =>
              onChange({
                colorToken: undefined,
                color: nextColor,
              })
            }
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label>Text style</Label>
          <div className="-m-1 flex flex-col gap-2 p-1">
            {!hasTextStyle && selectedStyle !== "custom" ? (
              <Button
                onClick={() => onChange({ textStyle: undefined })}
                variant="outline"
                className="h-auto justify-start rounded-xl border-dashed border-slate-300 bg-white px-3 py-2 text-left shadow-sm ring-2 ring-slate-400 ring-offset-2 ring-offset-white"
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
              </Button>
            ) : null}
            {textStyles.map((style) => {
              const isSelected = selectedStyle === style.id;
              return (
                <Button
                  key={style.id}
                  onClick={() =>
                    onChange({ textStyle: style.id as TextData["textStyle"] })
                  }
                  variant="outline"
                  className={`h-auto justify-start rounded-xl px-3 py-2 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 ${
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
                </Button>
              );
            })}
            <Button
              onClick={() => onChange({ textStyle: undefined })}
              variant="outline"
              className={`h-auto justify-start rounded-xl px-3 py-2 text-left text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 ${
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
            </Button>
          </div>
        </div>
      </div>

      {selectedStyle === "custom" ? (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <Label>Font size</Label>
              <Input
                type="text"
                value={data.fontSize}
                onChange={(event) => onChange({ fontSize: event.target.value })}
                placeholder="16px"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Font family</Label>
              <Input
                type="text"
                value={data.fontFamily ?? ""}
                onChange={(event) =>
                  onChange({ fontFamily: event.target.value || undefined })
                }
                placeholder="Helvetica, Arial, sans-serif"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <Label>Font weight</Label>
              <Input
                type="text"
                value={data.fontWeight ?? ""}
                onChange={(event) =>
                  onChange({ fontWeight: event.target.value || undefined })
                }
                placeholder="400"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Line height</Label>
              <Input
                type="text"
                value={data.lineHeight ?? ""}
                onChange={(event) =>
                  onChange({ lineHeight: event.target.value || undefined })
                }
                placeholder="1.5"
              />
            </div>
          </div>
        </>
      ) : null}

      <div className="flex flex-col gap-2">
        <Label>Alignment</Label>
        <ToggleGroup
          className="w-full rounded-lg"
          value={data.align}
          onValueChange={(value) => {
            if (value === "left" || value === "center" || value === "right") {
              onChange({ align: value });
            }
          }}
        >
          <ToggleGroupItem value="left" className="flex flex-1 items-center justify-center rounded-lg py-2">
            <AlignLeft className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="center" className="flex flex-1 items-center justify-center rounded-lg py-2">
            <AlignCenter className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="right" className="flex flex-1 items-center justify-center rounded-lg py-2">
            <AlignRight className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
    </div>
  );
}
