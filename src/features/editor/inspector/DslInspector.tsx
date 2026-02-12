import type { BlockDSL } from "@/lib/editor";

export default function DslInspector({ dsl }: { dsl: BlockDSL }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-semibold text-slate-700">DSL (read-only)</p>
      <pre className="mt-2 whitespace-pre-wrap text-xs text-slate-600">
        {JSON.stringify(dsl, null, 2)}
      </pre>
    </div>
  );
}
