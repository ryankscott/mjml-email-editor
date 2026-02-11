import { resolveTextStyle, type Brand, type TextStyleId } from "./brand";
import type { MjmlJsonNode } from "./mjmlJson";
import { normalizeMjmlNode, serializeMjmlJson } from "./mjmlJson";

export type BlockType =
  | "section"
  | "text"
  | "image"
  | "layout-2"
  | "layout-3"
  | "divider"
  | "html";

export type BlockMeta = {
  mjmlComponent: string;
};

export type BlockDSL = MjmlJsonNode;

export type SectionData = {
  backgroundColor: string;
  padding: string;
};

export type TextData = {
  content: string;
  color: string;
  fontSize: string;
  align: "left" | "center" | "right";
  textStyle?: TextStyleId;
  colorToken?: string;
  fontFamily?: string;
  fontWeight?: string;
  lineHeight?: string;
};

export type ImageData = {
  src: string;
  alt: string;
  width: string;
  assetId?: string;
};

export type DividerData = {
  borderColor: string;
  borderWidth: string;
  borderStyle: string;
  padding: string;
};

export type HtmlData = {
  content: string;
};

export type LayoutData = {
  columns: 2 | 3;
  columnBlocks: Block[][];
  backgroundColor: string;
  padding: string;
};

export type BlockData =
  | SectionData
  | TextData
  | ImageData
  | LayoutData
  | DividerData
  | HtmlData;

export type Block = {
  id: string;
  type: BlockType;
  data: BlockData;
  dsl?: BlockDSL;
  meta?: BlockMeta;
};

const defaultSection: SectionData = {
  backgroundColor: "#ffffff",
  padding: "20px",
};

const defaultText: TextData = {
  content: "Your text here",
  color: "#111827",
  fontSize: "16px",
  align: "left",
};

const defaultImage: ImageData = {
  src: "https://placehold.co/600x400",
  alt: "Image",
  width: "600px",
};

const defaultLayout2: LayoutData = {
  columns: 2,
  columnBlocks: [[], []],
  backgroundColor: "#ffffff",
  padding: "16px",
};

const defaultLayout3: LayoutData = {
  columns: 3,
  columnBlocks: [[], [], []],
  backgroundColor: "#ffffff",
  padding: "16px",
};

const defaultDivider: DividerData = {
  borderColor: "#e2e8f0",
  borderWidth: "1px",
  borderStyle: "solid",
  padding: "10px 0",
};

const defaultHtml: HtmlData = {
  content: '<div style="text-align:center">Custom HTML</div>',
};

const defaultDataByType: Record<BlockType, BlockData> = {
  section: defaultSection,
  text: defaultText,
  image: defaultImage,
  "layout-2": defaultLayout2,
  "layout-3": defaultLayout3,
  divider: defaultDivider,
  html: defaultHtml,
};

export const BLOCK_MJML_COMPONENTS: Record<BlockType, string> = {
  section: "mj-section",
  text: "mj-text",
  image: "mj-image",
  "layout-2": "mj-section",
  "layout-3": "mj-section",
  divider: "mj-divider",
  html: "mj-raw",
};

export function createBlock(type: BlockType): Block {
  return {
    id: crypto.randomUUID(),
    type,
    data: structuredClone(defaultDataByType[type]),
    meta: {
      mjmlComponent: BLOCK_MJML_COMPONENTS[type],
    },
  };
}

export const FOOTER_DSL: BlockDSL = {
  tagName: "mjml",
  children: [
    {
      tagName: "mj-body",
      children: [
        {
          tagName: "mj-section",
          attributes: {
            "background-color": "#0f172a",
            padding: "16px",
          },
          children: [
            {
              tagName: "mj-column",
              children: [
                {
                  tagName: "mj-image",
                  attributes: {
                    src: "https://placehold.co/600x400",
                    alt: "Logo",
                    width: "120px",
                  },
                },
              ],
            },
            {
              tagName: "mj-column",
              children: [
                {
                  tagName: "mj-text",
                  attributes: {
                    color: "#e2e8f0",
                    "font-size": "12px",
                    align: "right",
                  },
                  content: "Questions? Reply to this email",
                },
              ],
            },
          ],
        },
        {
          tagName: "mj-section",
          children: [
            {
              tagName: "mj-column",
              children: [
                {
                  tagName: "mj-text",
                  attributes: {
                    color: "#94a3b8",
                    "font-size": "12px",
                    align: "center",
                  },
                  content: "© 2026 Your Company. All rights reserved.",
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

export function expandDsl(dsl: BlockDSL): Block[] {
  const { blocks, warnings } = mjmlJsonToBlocks(dsl);
  if (warnings.length) {
    console.warn("MJML JSON DSL warnings:", warnings);
  }
  return blocks.map((block) => ({ ...block, dsl }));
}

function isBlockTypeAllowedInColumn(blockType: BlockType) {
  return blockType === "text" || blockType === "image";
}

function buildTextAttributesMap(data: TextData, brand?: Brand | null) {
  const resolved = resolveTextStyle(data, brand);
  const attributes: Record<string, string> = {
    color: resolved.color,
    "font-size": resolved.fontSize,
    align: data.align,
  };
  if (resolved.fontFamily) {
    attributes["font-family"] = resolved.fontFamily;
  }
  if (resolved.fontWeight) {
    attributes["font-weight"] = resolved.fontWeight;
  }
  if (resolved.lineHeight) {
    attributes["line-height"] = resolved.lineHeight;
  }
  return attributes;
}

function buildPlaceholderText() {
  return {
    tagName: "mj-text",
    attributes: {
      color: "#cbd5e1",
      "font-size": "12px",
      align: "center",
    },
    content: "Drop blocks",
  } satisfies MjmlJsonNode;
}

function blockToMjmlJsonInColumn(
  block: Block,
  brand?: Brand | null,
): MjmlJsonNode {
  if (block.type === "text") {
    const data = block.data as TextData;
    const attributes = buildTextAttributesMap(data, brand);
    return {
      tagName: "mj-text",
      attributes,
      content: data.content,
    };
  }

  const data = block.data as ImageData;
  const attributes: Record<string, string> = {
    src: data.src,
    alt: data.alt,
    width: data.width,
  };
  if (data.assetId) {
    attributes["data-asset-id"] = data.assetId;
  }
  return {
    tagName: "mj-image",
    attributes,
  };
}

export function blockToMjmlJson(block: Block, brand?: Brand | null) {
  if (block.type === "section") {
    const data = block.data as SectionData;
    return {
      tagName: "mj-section",
      attributes: {
        "background-color": data.backgroundColor,
        padding: data.padding,
      },
      children: [
        {
          tagName: "mj-column",
          children: [
            {
              tagName: "mj-text",
              attributes: {
                color: "#6b7280",
                "font-size": "14px",
              },
              content: "Section",
            },
          ],
        },
      ],
    } satisfies MjmlJsonNode;
  }

  if (block.type === "layout-2" || block.type === "layout-3") {
    const data = block.data as LayoutData;
    return {
      tagName: "mj-section",
      attributes: {
        "background-color": data.backgroundColor,
        padding: data.padding,
      },
      children: data.columnBlocks.map((columnBlocks) => ({
        tagName: "mj-column",
        children: columnBlocks.length
          ? columnBlocks.map((child) => blockToMjmlJsonInColumn(child, brand))
          : [buildPlaceholderText()],
      })),
    } satisfies MjmlJsonNode;
  }

  if (block.type === "text") {
    const data = block.data as TextData;
    const attributes = buildTextAttributesMap(data, brand);
    return {
      tagName: "mj-section",
      attributes: { padding: "0" },
      children: [
        {
          tagName: "mj-column",
          children: [
            {
              tagName: "mj-text",
              attributes,
              content: data.content,
            },
          ],
        },
      ],
    } satisfies MjmlJsonNode;
  }

  if (block.type === "divider") {
    const data = block.data as DividerData;
    return {
      tagName: "mj-section",
      attributes: { padding: "0" },
      children: [
        {
          tagName: "mj-column",
          children: [
            {
              tagName: "mj-divider",
              attributes: {
                "border-color": data.borderColor,
                "border-width": data.borderWidth,
                "border-style": data.borderStyle,
                padding: data.padding,
              },
            },
          ],
        },
      ],
    } satisfies MjmlJsonNode;
  }

  if (block.type === "html") {
    const data = block.data as HtmlData;
    return {
      tagName: "mj-section",
      attributes: { padding: "0" },
      children: [
        {
          tagName: "mj-column",
          children: [
            {
              tagName: "mj-raw",
              content: data.content,
            },
          ],
        },
      ],
    } satisfies MjmlJsonNode;
  }

  const data = block.data as ImageData;
  const attributes: Record<string, string> = {
    src: data.src,
    alt: data.alt,
    width: data.width,
  };
  if (data.assetId) {
    attributes["data-asset-id"] = data.assetId;
  }
  return {
    tagName: "mj-section",
    attributes: { padding: "0" },
    children: [
      {
        tagName: "mj-column",
        children: [
          {
            tagName: "mj-image",
            attributes,
          },
        ],
      },
    ],
  } satisfies MjmlJsonNode;
}

export function buildMjmlJson(blocks: Block[], brand?: Brand | null) {
  const bodyChildren = blocks.length
    ? blocks.map((block) => blockToMjmlJson(block, brand))
    : [
        {
          tagName: "mj-section",
          attributes: { padding: "40px" },
          children: [
            {
              tagName: "mj-column",
              children: [
                {
                  tagName: "mj-text",
                  attributes: {
                    color: "#9ca3af",
                    "font-size": "14px",
                    align: "center",
                  },
                  content: "Drop blocks to start building",
                },
              ],
            },
          ],
        } satisfies MjmlJsonNode,
      ];

  return {
    tagName: "mjml",
    children: [
      {
        tagName: "mj-head",
        children: [
          {
            tagName: "mj-preview",
            content: "Email preview",
          },
        ],
      },
      {
        tagName: "mj-body",
        attributes: {
          "background-color": "#f8fafc",
        },
        children: bodyChildren,
      },
    ],
  } satisfies MjmlJsonNode;
}

export function buildMjml(blocks: Block[], brand?: Brand | null) {
  return `${serializeMjmlJson(buildMjmlJson(blocks, brand))}\n`;
}

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
    warnings.push(`${path} has no columns; created a section block.`);
    const block = createBlock("section");
    const data = block.data as SectionData;
    data.backgroundColor = coerceString(
      nodeAttribute(section, "background-color"),
      data.backgroundColor,
    );
    data.padding = coerceString(
      nodeAttribute(section, "padding"),
      data.padding,
    );
    return { blocks: [block], warnings };
  }

  if (columns.length === 2 || columns.length === 3) {
    const block = createBlock(columns.length === 2 ? "layout-2" : "layout-3");
    const data = block.data as LayoutData;
    data.backgroundColor = coerceString(
      nodeAttribute(section, "background-color"),
      data.backgroundColor,
    );
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
      warnings.push(`${path} has empty column; created a section block.`);
      const block = createBlock("section");
      const data = block.data as SectionData;
      data.backgroundColor = coerceString(
        nodeAttribute(section, "background-color"),
        data.backgroundColor,
      );
      data.padding = coerceString(
        nodeAttribute(section, "padding"),
        data.padding,
      );
      return { blocks: [block], warnings };
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
