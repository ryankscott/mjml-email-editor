import { Button } from "@/components/ui/button";

type ColorToken = {
  id: string;
  name: string;
  value: string;
};

type ColorPickerProps = {
  value: string;
  onChange: (value: string) => void;
  tokens?: ColorToken[];
  selectedToken?: string;
  onSelectToken?: (tokenId: string | "custom") => void;
  mode?: "tokens" | "custom-only";
};

export default function ColorPicker({
  value,
  onChange,
  tokens = [],
  selectedToken = "custom",
  onSelectToken,
  mode = "tokens",
}: ColorPickerProps) {
  const hasToken = tokens.some((token) => token.id === selectedToken);
  const isCustomSelected = mode === "custom-only" || selectedToken === "custom";
  const showTokens = mode === "tokens";

  return (
    <div className="flex flex-wrap gap-2">
      {showTokens && selectedToken !== "custom" && !hasToken ? (
        <Button
          onClick={() => onSelectToken?.("custom")}
          className="relative h-9 w-9 rounded-full border border-dashed border-slate-300 shadow-sm ring-2 ring-slate-400 ring-offset-2 ring-offset-white"
          aria-label="Unknown brand color"
          title="Unknown brand color"
          style={{ backgroundColor: value }}
        >
          <span className="sr-only">Unknown brand color</span>
        </Button>
      ) : null}

      {showTokens
        ? tokens.map((token) => {
            const isSelected = selectedToken === token.id;
            return (
              <Button
                key={token.id}
                onClick={() => onSelectToken?.(token.id)}
                aria-label={token.name}
                className={`relative h-9 w-9 rounded-full border border-slate-200 p-0 shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 ${
                  isSelected
                    ? "ring-2 ring-slate-400 ring-offset-2 ring-offset-white"
                    : "hover:scale-[1.02]"
                }`}
                style={{ backgroundColor: token.value }}
              >
                <span className="sr-only">{token.name}</span>
              </Button>
            );
          })
        : null}

      <div className="relative">
        <Button
          onClick={() => onSelectToken?.("custom")}
          className={`flex h-9 w-9 items-center justify-center rounded-full border border-dashed p-0 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 ${
            isCustomSelected
              ? "border-slate-400 text-slate-700 ring-2 ring-slate-400 ring-offset-2 ring-offset-white"
              : "border-slate-300 text-slate-500 hover:border-slate-400 hover:text-slate-700"
          }`}
          aria-label="Custom color"
          style={isCustomSelected ? { backgroundColor: value } : undefined}
        >
          {isCustomSelected ? null : "+"}
        </Button>
        <input
          type="color"
          value={value}
          onClick={() => onSelectToken?.("custom")}
          onChange={(event) => {
            onSelectToken?.("custom");
            onChange(event.target.value);
          }}
          aria-label="Pick custom color"
          className="absolute inset-0 h-9 w-9 cursor-pointer opacity-0"
        />
      </div>
    </div>
  );
}
