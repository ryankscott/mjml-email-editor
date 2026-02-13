import { resolveBrandColor, resolveTextStyle, type Brand } from "@/lib/brand";
import type { MjmlJsonNode } from "@/lib/mjmlJson";
import { serializeMjmlJson } from "@/lib/mjmlJson";

import type {
  Block,
  DividerData,
  HtmlData,
  ImageData,
  LayoutData,
  TextData,
} from "./types";

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

/**
 * Converts a content block to its corresponding MJML component (1:1 mapping).
 * This function handles: text, image, divider, and html blocks.
 * Layout blocks are handled separately by blockToMjmlJson.
 */
function blockToMjmlComponent(
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

  if (block.type === "image") {
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

  if (block.type === "divider") {
    const data = block.data as DividerData;
    return {
      tagName: "mj-divider",
      attributes: {
        "border-color": data.borderColor,
        "border-width": data.borderWidth,
        "border-style": data.borderStyle,
        padding: data.padding,
      },
    };
  }

  // html block
  const data = block.data as HtmlData;
  return {
    tagName: "mj-raw",
    content: data.content,
  };
}

/**
 * Converts a block to MJML JSON structure.
 * - Layout blocks (layout-2, layout-3) map to mj-section with multiple mj-columns
 * - Content blocks (text, image, divider, html) are wrapped in mj-section + mj-column by buildMjmlJson
 */
export function blockToMjmlJson(
  block: Block,
  brand?: Brand | null,
): MjmlJsonNode {
  // Layout blocks create sections with multiple columns
  if (block.type === "layout-2" || block.type === "layout-3") {
    const data = block.data as LayoutData;
    return {
      tagName: "mj-section",
      attributes: {
        "background-color": resolveBrandColor(
          data.backgroundColor,
          data.backgroundColorToken,
          brand,
        ),
        ...(data.backgroundColorToken
          ? { "data-background-color-token": data.backgroundColorToken }
          : {}),
        padding: data.padding,
      },
      children: data.columnBlocks.map((columnBlocks) => ({
        tagName: "mj-column",
        children: columnBlocks.length
          ? columnBlocks.map((child) => blockToMjmlComponent(child, brand))
          : [buildPlaceholderText()],
      })),
    } satisfies MjmlJsonNode;
  }

  // Content blocks get wrapped in section+column at the buildMjmlJson level
  // Here we just return them wrapped for consistency
  return {
    tagName: "mj-section",
    attributes: { padding: "0" },
    children: [
      {
        tagName: "mj-column",
        children: [blockToMjmlComponent(block, brand)],
      },
    ],
  } satisfies MjmlJsonNode;
}

export function buildMjmlJson(
  blocks: Block[],
  brand?: Brand | null,
): MjmlJsonNode {
  const bodyChildren: MjmlJsonNode[] = blocks.length
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
