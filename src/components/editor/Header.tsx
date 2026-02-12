import { useMemo, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Camera, Copy, LayoutDashboard, Palette, Shapes } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";
import { buildMjml } from "@/lib/editor";
import { compileBlocks } from "@/lib/mjml";
import { useToast } from "@/shared/ui/ToastProvider";
import { useBrand } from "./BrandProvider";
import { useEditorState } from "./EditorProvider";

const navLinks = [
  { to: "/editor", label: "Editor", icon: LayoutDashboard },
  { to: "/templates", label: "Templates", icon: Shapes },
  { to: "/images", label: "Images", icon: Camera },
  { to: "/brand", label: "Brand", icon: Palette },
] as const;

export default function Header({
  actions,
  showCopyActions = true,
  mode,
  onModeChange,
}: {
  actions?: ReactNode;
  showCopyActions?: boolean;
  mode?: "canvas" | "preview";
  onModeChange?: (mode: "canvas" | "preview") => void;
}) {
  const state = useEditorState();
  const { activeBrand } = useBrand();
  const toast = useToast();

  const mjml = useMemo(
    () => buildMjml(state.blocks, activeBrand),
    [state.blocks, activeBrand],
  );

  const handleCopyMjml = async () => {
    try {
      await navigator.clipboard.writeText(mjml);
      toast.success("MJML copied.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Copy failed.");
    }
  };

  const handleCopyHtml = async () => {
    try {
      const result = compileBlocks(state.blocks, activeBrand);
      await navigator.clipboard.writeText(result.html);
      toast.success("HTML copied.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Copy failed.");
    }
  };

  const hasSecondaryActions =
    Boolean(mode && onModeChange) || Boolean(actions) || showCopyActions;

  return (
    <header className="border-b border-slate-200 bg-white px-6 py-4">
      <div className="flex flex-col items-start gap-3">
        <h1 className="text-right text-lg font-semibold text-slate-900">
          MJML email editor
        </h1>

        <div className="flex flex-row space-around w-full overflow-x-auto">
          <div className="ml-auto inline-flex min-w-max items-center gap-2 rounded-full border border-slate-200 bg-slate-50 p-1 whitespace-nowrap">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold text-slate-600 transition hover:bg-white hover:text-slate-900",
                  )}
                  activeProps={{
                    className:
                      "inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-900 shadow-sm",
                  }}
                >
                  <Icon size={14} />
                  {link.label}
                </Link>
              );
            })}
          </div>
          {hasSecondaryActions ? (
            <div className="flex w-full flex-wrap items-center justify-end gap-2">
              {mode && onModeChange ? (
                <ToggleGroup
                  value={mode}
                  onValueChange={(value) => {
                    if (value === "canvas" || value === "preview") {
                      onModeChange(value);
                    }
                  }}
                >
                  <ToggleGroupItem value="canvas">Canvas</ToggleGroupItem>
                  <ToggleGroupItem value="preview">Preview</ToggleGroupItem>
                </ToggleGroup>
              ) : null}

              {actions ? (
                <div className="flex flex-wrap items-center gap-2">
                  {actions}
                </div>
              ) : null}

              {showCopyActions ? (
                <>
                  <Button
                    variant="pillNeutral"
                    size="pill"
                    onClick={handleCopyMjml}
                  >
                    <Copy size={14} />
                    Copy MJML
                  </Button>

                  <Button
                    variant="pillAccent"
                    size="pill"
                    onClick={handleCopyHtml}
                  >
                    <Copy size={14} />
                    Copy HTML
                  </Button>
                </>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
