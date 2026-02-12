export default function PreviewContent({
  device,
  html,
}: {
  device: "desktop" | "mobile";
  html: string;
}) {
  return (
    <div className="flex-1 overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="flex h-full w-full justify-center overflow-y-auto bg-slate-100/60 p-6">
        {device === "desktop" ? <DesktopFrame html={html} /> : <MobileFrame html={html} />}
      </div>
    </div>
  );
}

function DesktopFrame({ html }: { html: string }) {
  return (
    <div className="w-[600px] max-w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
      <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-4 py-2">
        <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
        <span className="ml-2 text-xs text-slate-400">Preview</span>
      </div>
      <div className="h-[720px] bg-white">
        <iframe
          title="Email preview"
          srcDoc={html}
          sandbox=""
          className="h-full w-full"
          style={{ border: "none" }}
        />
      </div>
    </div>
  );
}

function MobileFrame({ html }: { html: string }) {
  return (
    <div className="w-[375px] max-w-full">
      <div className="rounded-[2.5rem] border-4 border-slate-900 bg-slate-900 p-3 shadow-xl">
        <div className="relative overflow-hidden rounded-[2rem] bg-white">
          <div className="pointer-events-none absolute left-1/2 top-2 h-6 w-24 -translate-x-1/2 rounded-full bg-slate-900" />
          <div className="pt-11">
            <iframe
              title="Email preview"
              srcDoc={html}
              sandbox=""
              className="h-[696px] w-full"
              style={{ border: "none" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
