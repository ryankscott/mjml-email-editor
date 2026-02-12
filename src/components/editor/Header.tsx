import { useMemo, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Camera, Copy, LayoutDashboard, Palette, Shapes } from "lucide-react";

import { buildMjml } from "../../lib/editor";
import { compileBlocks } from "../../lib/mjml";
import { useBrand } from "./BrandProvider";
import { useEditorState } from "./EditorProvider";

const navLinks = [
  { to: "/editor", label: "Editor", icon: LayoutDashboard },
  { to: "/templates", label: "Templates", icon: Shapes },
  { to: "/images", label: "Images", icon: Camera },
  { to: "/brand", label: "Brand", icon: Palette },
];

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
  const [status, setStatus] = useState<string | null>(null);

  const mjml = useMemo(
    () => buildMjml(state.blocks, activeBrand),
    [state.blocks, activeBrand],
  );

  const handleCopyMjml = async () => {
    try {
      await navigator.clipboard.writeText(mjml);
      setStatus("MJML copied");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Copy failed");
    }
  };

  const handleCopyHtml = async () => {
    try {
      const result = compileBlocks(state.blocks, activeBrand);
      await navigator.clipboard.writeText(result.html);
      setStatus("HTML copied");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Copy failed");
    }
  };

  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-200 bg-white px-6 py-4">
      <div>
        <h1 className="text-lg font-semibold text-slate-900">
          MJML email editor
        </h1>
      </div>

      <div className="flex items-center gap-3 overflow-x-auto">
        <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 p-1 whitespace-nowrap">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.to}
                to={link.to}
                className="flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold text-slate-600 transition hover:bg-white hover:text-slate-900"
                activeProps={{
                  className:
                    "flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-900 shadow-sm",
                }}
              >
                <Icon size={14} />
                {link.label}
              </Link>
            );
          })}
        </div>
        {mode && onModeChange ? (
          <>
            <div className="hidden h-6 w-px bg-slate-200 sm:block" />
            <div className="flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 p-1 text-xs font-semibold text-slate-600">
              <button
                type="button"
                onClick={() => onModeChange("canvas")}
                className={`rounded-full px-3 py-1 transition ${
                  mode === "canvas"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Canvas
              </button>
              <button
                type="button"
                onClick={() => onModeChange("preview")}
                className={`rounded-full px-3 py-1 transition ${
                  mode === "preview"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Preview
              </button>
            </div>
          </>
        ) : null}
        <div className="hidden h-6 w-px bg-slate-200 sm:block" />
        {actions ? (
          <div className="flex items-center gap-2 whitespace-nowrap">
            {actions}
          </div>
        ) : null}
        {showCopyActions ? (
          <>
            <button
              type="button"
              onClick={handleCopyMjml}
              className="flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-slate-400 hover:bg-slate-50"
            >
              <Copy size={14} />
              Copy MJML
            </button>

            <button
              type="button"
              onClick={handleCopyHtml}
              className="flex items-center gap-2 rounded-full border border-cyan-300 bg-cyan-50 px-4 py-2 text-xs font-semibold text-cyan-700 shadow-sm transition hover:border-cyan-400 hover:bg-cyan-100"
            >
              <Copy size={14} />
              Copy HTML
            </button>
          </>
        ) : null}

        {status ? (
          <span className="text-xs text-slate-500">{status}</span>
        ) : null}
      </div>
    </div>
  );
}
