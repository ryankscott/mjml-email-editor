import { useMemo, useState } from "react";
import { Copy } from "lucide-react";

import { buildMjml } from "../../lib/editor";
import { compileBlocks } from "../../lib/mjml";
import { useEditor } from "./EditorProvider";

export default function TopBar() {
  const { state } = useEditor();
  const [status, setStatus] = useState<string | null>(null);

  const mjml = useMemo(() => buildMjml(state.blocks), [state.blocks]);

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
      const result = compileBlocks(state.blocks);
      await navigator.clipboard.writeText(result.html);
      setStatus("HTML copied");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Copy failed");
    }
  };

  return (
    <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950 px-6 py-4">
      <div>
        <p className="text-xs text-slate-400">MJML Email Builder</p>
        <h1 className="text-lg font-semibold text-slate-100">Canvas</h1>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleCopyMjml}
          className="flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-200 transition hover:border-slate-500"
        >
          <Copy size={14} />
          Copy MJML
        </button>

        <button
          type="button"
          onClick={handleCopyHtml}
          className="flex items-center gap-2 rounded-full border border-cyan-500/50 bg-cyan-500/10 px-4 py-2 text-xs font-semibold text-cyan-100 transition hover:border-cyan-400"
        >
          <Copy size={14} />
          Copy HTML
        </button>

        {status ? (
          <span className="text-xs text-slate-400">{status}</span>
        ) : null}
      </div>
    </div>
  );
}
