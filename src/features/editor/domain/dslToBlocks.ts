import type { MjmlJsonNode } from "@/lib/mjmlJson";
import { normalizeMjmlNode } from "@/lib/mjmlJson";

import { createBlock } from "./blockFactories";
import type {
  Block,
  BlockDSL,
  DividerData,
  HtmlData,
  ImageData,
  LayoutData,
  TextData,
} from "./types";

function isTextStyleId(value: string) {
  return (
    value === "heading1" ||
    value === "heading2" ||
    value === "heading3" ||
    value === "paragraph" ||
    value === "caption"
  );
}

function coerceAlign(
  value: string | undefined,
  fallback: "left" | "center" | "right",
) {
  if (value === "left" || value === "center" || value === "right") {
    return value;
  }
  return fallback;
}

function coerceString(value: string | undefined, fallback: string) {
  return typeof value === "string" ? value : fallback;
}

function nodeAttribute(node: MjmlJsonNode, key: string) {
  return node.attributes?.[key];
}

function textNodeToBlock(node: MjmlJsonNode): Block {
  const block = createBlock("text");
  const data = block.data as TextData;
  data.content = typeof node.content === "string" ? node.content : data.content;
  data.color = coerceString(nodeAttribute(node, "color"), data.color);
  data.fontSize = coerceString(nodeAttribute(node, "font-size"), data.fontSize);
  data.align = coerceAlign(nodeAttribute(node, "align"), data.align);
  data.fontFamily = nodeAttribute(node, "font-family") || data.fontFamily;
  data.fontWeight = nodeAttribute(node, "font-weight") || data.fontWeight;
  data.lineHeight = nodeAttribute(node, "line-height") || data.lineHeight;
  const textStyle = nodeAttribute(node, "data-text-style");
  if (textStyle && isTextStyleId(textStyle)) {
    data.textStyle = textStyle;
  }
  const colorToken = nodeAttribute(node, "data-color-token");
  if (colorToken) {
    data.colorToken = colorToken;
  }
  return block;
}

function imageNodeToBlock(node: MjmlJsonNode): Block {
  const block = createBlock("image");
  const data = block.data as ImageData;
  data.src = coerceString(nodeAttribute(node, "src"), data.src);
  data.alt = coerceString(nodeAttribute(node, "alt"), data.alt);
  data.width = coerceString(nodeAttribute(node, "width"), data.width);
  const assetId = nodeAttribute(node, "data-asset-id");
  if (assetId) {
    data.assetId = assetId;
  }
  return block;
}

function dividerNodeToBlock(node: MjmlJsonNode): Block {
  const block = createBlock("divider");
  const data = block.data as DividerData;
  data.borderColor = coerceString(
    nodeAttribute(node, "border-color"),
    data.borderColor,
  );
  data.borderWidth = coerceString(
    nodeAttribute(node, "border-width"),
    data.borderWidth,
  );
  data.borderStyle = coerceString(
    nodeAttribute(node, "border-style"),
    data.borderStyle,
  );
  data.padding = coerceString(nodeAttribute(node, "padding"), data.padding);
  return block;
}

function rawNodeToBlock(node: MjmlJsonNode): Block {
  const block = createBlock("html");
  const data = block.data as HtmlData;
  data.content = typeof node.content === "string" ? node.content : data.content;
  return block;
}

function sectionNodeToBlocks(
  section: MjmlJsonNode,
  path: string,
): { blocks: Block[]; warnings: string[] } {
  const warnings: string[] = [];
  const children = section.children ?? [];
  const columns = children.filter((child) => child.tagName === "mj-column");
  children
    .filter((child) => child.tagName !== "mj-column")
    .forEach((child, index) => {
      warnings.push(
        `${path}.children[${index}] is "${child.tagName}" and was dropped.`,
      );
    });
  if (!columns.length) {
    warnings.push(`${path} has no columns and was skipped.`);
    return { blocks: [], warnings };
  }

  if (columns.length === 2 || columns.length === 3) {
    const block = createBlock(columns.length === 2 ? "layout-2" : "layout-3");
    const data = block.data as LayoutData;
    data.backgroundColor = coerceString(
      nodeAttribute(section, "background-color"),
      data.backgroundColor,
    );
    const backgroundToken = nodeAttribute(
      section,
      "data-background-color-token",
    );
    if (backgroundToken) {
      data.backgroundColorToken = backgroundToken;
    }
    data.padding = coerceString(
      nodeAttribute(section, "padding"),
      data.padding,
    );

    data.columnBlocks = columns.map((column, columnIndex) => {
      const columnBlocks: Block[] = [];
      (column.children ?? []).forEach((child, childIndex) => {
        if (child.tagName === "mj-text") {
          columnBlocks.push(textNodeToBlock(child));
        } else if (child.tagName === "mj-image") {
          columnBlocks.push(imageNodeToBlock(child));
        } else {
          warnings.push(
            `${path}.columns[${columnIndex}][${childIndex}] has unsupported tag "${child.tagName}" and was dropped.`,
          );
        }
      });
      return columnBlocks;
    });

    return { blocks: [block], warnings };
  }

  if (columns.length === 1) {
    const column = columns[0];
    const leafBlocks: Block[] = [];
    (column.children ?? []).forEach((child, childIndex) => {
      if (child.tagName === "mj-text") {
        leafBlocks.push(textNodeToBlock(child));
        return;
      }
      if (child.tagName === "mj-image") {
        leafBlocks.push(imageNodeToBlock(child));
        return;
      }
      if (child.tagName === "mj-divider") {
        leafBlocks.push(dividerNodeToBlock(child));
        return;
      }
      if (child.tagName === "mj-raw") {
        leafBlocks.push(rawNodeToBlock(child));
        return;
      }
      warnings.push(
        `${path}.column[${childIndex}] has unsupported tag "${child.tagName}" and was dropped.`,
      );
    });

    if (leafBlocks.length === 0) {
      warnings.push(`${path} has empty column and was skipped.`);
      return { blocks: [], warnings };
    }

    if (leafBlocks.length === 1) {
      return { blocks: leafBlocks, warnings };
    }

    warnings.push(
      `${path} has multiple column children; section attributes were dropped.`,
    );
    return { blocks: leafBlocks, warnings };
  }

  warnings.push(`${path} has unsupported column count and was skipped.`);
  return { blocks: [], warnings };
}

export function mjmlJsonToBlocks(root: BlockDSL): {
  blocks: Block[];
  warnings: string[];
} {
  const warnings: string[] = [];
  const normalized = normalizeMjmlNode(root);
  if (!normalized) {
    return { blocks: [], warnings: ["Invalid MJML JSON root."] };
  }

  const sections: MjmlJsonNode[] = [];

  if (normalized.tagName === "mjml") {
    const body = (normalized.children ?? []).find(
      (child) => child.tagName === "mj-body",
    );
    if (!body) {
      warnings.push("MJML root missing mj-body; no blocks generated.");
      return { blocks: [], warnings };
    }
    (body.children ?? []).forEach((child, index) => {
      if (child.tagName === "mj-section") {
        sections.push(child);
        return;
      }
      warnings.push(
        `mj-body child at index ${index} is "${child.tagName}" and was dropped.`,
      );
    });
  } else if (normalized.tagName === "mj-body") {
    (normalized.children ?? []).forEach((child, index) => {
      if (child.tagName === "mj-section") {
        sections.push(child);
        return;
      }
      warnings.push(
        `mj-body child at index ${index} is "${child.tagName}" and was dropped.`,
      );
    });
  } else if (normalized.tagName === "mj-section") {
    sections.push(normalized);
  } else {
    warnings.push(
      `Root tag "${normalized.tagName}" is not supported for block expansion.`,
    );
    return { blocks: [], warnings };
  }

  const blocks: Block[] = [];
  sections.forEach((section, index) => {
    const result = sectionNodeToBlocks(section, `sections[${index}]`);
    warnings.push(...result.warnings);
    blocks.push(...result.blocks);
  });

  return { blocks, warnings };
}

export function expandDsl(dsl: BlockDSL): Block[] {
  const { blocks, warnings } = mjmlJsonToBlocks(dsl);
  if (warnings.length) {
    console.warn("MJML JSON DSL warnings:", warnings);
  }
  return blocks.map((block) => ({ ...block, dsl }));
}
