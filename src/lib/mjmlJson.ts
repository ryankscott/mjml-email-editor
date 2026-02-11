export type MjmlJsonNode = {
  tagName: string;
  attributes?: Record<string, string>;
  children?: MjmlJsonNode[];
  content?: string;
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function normalizeMjmlNode(raw: unknown): MjmlJsonNode | null {
  if (!isPlainObject(raw)) {
    return null;
  }

  const tagName = raw.tagName;
  if (typeof tagName !== "string" || !tagName.trim()) {
    return null;
  }

  const attributesRaw = raw.attributes;
  let attributes: Record<string, string> | undefined;
  if (isPlainObject(attributesRaw)) {
    attributes = {};
    Object.entries(attributesRaw).forEach(([key, value]) => {
      if (value === null || value === undefined) {
        return;
      }
      attributes![key] = typeof value === "string" ? value : String(value);
    });
    if (Object.keys(attributes).length === 0) {
      attributes = undefined;
    }
  }

  const childrenRaw = raw.children;
  const children: MjmlJsonNode[] = [];
  if (Array.isArray(childrenRaw)) {
    childrenRaw.forEach((child) => {
      const normalized = normalizeMjmlNode(child);
      if (normalized) {
        children.push(normalized);
      }
    });
  }

  const content = typeof raw.content === "string" ? raw.content : undefined;

  return {
    tagName,
    attributes,
    children: children.length ? children : undefined,
    content,
  };
}

function escapeText(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttribute(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function renderAttributes(attributes?: Record<string, string>) {
  if (!attributes || Object.keys(attributes).length === 0) {
    return "";
  }
  const parts = Object.entries(attributes).map(
    ([key, value]) => `${key}="${escapeAttribute(value)}"`
  );
  return parts.length ? ` ${parts.join(" ")}` : "";
}

export function serializeMjmlJson(
  node: MjmlJsonNode,
  options?: { indent?: string }
): string {
  const indent = options?.indent ?? "  ";

  const serializeNode = (current: MjmlJsonNode, depth: number): string => {
    const pad = indent.repeat(depth);
    const attrs = renderAttributes(current.attributes);
    const hasChildren = Array.isArray(current.children) && current.children.length;
    const content =
      typeof current.content === "string"
        ? current.tagName === "mj-raw"
          ? current.content
          : escapeText(current.content)
        : "";

    if (!hasChildren) {
      return `${pad}<${current.tagName}${attrs}>${content}</${current.tagName}>`;
    }

    const childLines: string[] = [];
    if (content) {
      childLines.push(`${indent.repeat(depth + 1)}${content}`);
    }
    current.children!.forEach((child) => {
      childLines.push(serializeNode(child, depth + 1));
    });

    return `${pad}<${current.tagName}${attrs}>\n${childLines.join(
      "\n"
    )}\n${pad}</${current.tagName}>`;
  };

  return serializeNode(node, 0);
}
