export function renderTextWithVariables(content: string) {
  const value = content ?? "";
  const regex = /{{\s*[\w.-]+\s*}}/g;
  const parts: Array<{ type: "text" | "var"; value: string }> = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(value))) {
    if (match.index > lastIndex) {
      parts.push({ type: "text", value: value.slice(lastIndex, match.index) });
    }
    parts.push({ type: "var", value: match[0] });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < value.length) {
    parts.push({ type: "text", value: value.slice(lastIndex) });
  }

  if (parts.length === 0) {
    return value;
  }

  return parts.map((part, index) =>
    part.type === "var" ? (
      <span
        key={`${part.value}-${index}`}
        className="mx-0.5 inline-flex items-center rounded-md bg-slate-100 px-1.5 py-0.5 font-mono text-[0.95em] text-slate-600"
      >
        {part.value}
      </span>
    ) : (
      <span key={`text-${index}`}>{part.value}</span>
    ),
  );
}
