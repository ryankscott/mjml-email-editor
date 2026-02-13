import type {
  Block,
  BlockDSL,
  BlockType,
  DividerData,
  HtmlData,
  ImageData,
  LayoutData,
  TextData,
} from "./editor";
import {
  buildMjml,
  buildMjmlJson,
  createBlock,
  mjmlJsonToBlocks,
} from "./editor";
import type { MjmlJsonNode } from "./mjmlJson";
import { normalizeMjmlNode } from "./mjmlJson";
import { compileBlocks } from "./mjml";

export const TEMPLATE_SCHEMA_VERSION = 2 as const;

export type TemplatePreview = {
  mjml: string;
  html: string;
};

export type Template = {
  schemaVersion: typeof TEMPLATE_SCHEMA_VERSION;
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  preview?: TemplatePreview;
  blocks: Block[];
  mjmlJson: MjmlJsonNode;
};

export type TemplateInput = {
  name: string;
  description?: string;
  blocks: Block[];
  mjmlJson?: MjmlJsonNode;
  preview?: TemplatePreview;
};

export type TemplateLibrary = {
  schemaVersion: typeof TEMPLATE_SCHEMA_VERSION;
  templates: Template[];
};

const BLOCK_TYPES: BlockType[] = [
  "text",
  "image",
  "layout-2",
  "layout-3",
  "divider",
  "html",
];

const COLUMN_ALLOWED = new Set<BlockType>(["text", "image"]);

export function buildTemplatePreview(blocks: Block[]): TemplatePreview | null {
  try {
    const mjml = buildMjml(blocks);
    const result = compileBlocks(blocks);
    return {
      mjml,
      html: result.html,
    };
  } catch {
    return null;
  }
}

export function createTemplateFromBlocks(input: TemplateInput): Template {
  const now = new Date().toISOString();
  const preview =
    input.preview ?? buildTemplatePreview(input.blocks) ?? undefined;
  const mjmlJson = input.mjmlJson ?? buildMjmlJson(input.blocks);

  return {
    schemaVersion: TEMPLATE_SCHEMA_VERSION,
    id: crypto.randomUUID(),
    name: input.name.trim() || "Untitled Template",
    description: input.description?.trim() || undefined,
    createdAt: now,
    updatedAt: now,
    preview,
    blocks: structuredClone(input.blocks),
    mjmlJson,
  };
}

export function cloneBlocksWithNewIds(blocks: Block[]): Block[] {
  const cloned = blocks
    .map((block) => cloneBlock(block, "root"))
    .filter(Boolean) as Block[];
  return cloned;
}

export function parseTemplateJson(raw: unknown): {
  input: TemplateInput;
  warnings: string[];
} {
  if (!isPlainObject(raw)) {
    throw new Error("Template JSON must be an object.");
  }

  const schemaVersion = raw.schemaVersion;
  if (schemaVersion !== 1 && schemaVersion !== TEMPLATE_SCHEMA_VERSION) {
    throw new Error("Unsupported template schema version.");
  }

  const name = typeof raw.name === "string" ? raw.name.trim() : "";
  if (!name) {
    throw new Error("Template name is required.");
  }

  const description =
    typeof raw.description === "string" ? raw.description.trim() : undefined;
  const preview =
    isPlainObject(raw.preview) &&
    typeof raw.preview.mjml === "string" &&
    typeof raw.preview.html === "string"
      ? { mjml: raw.preview.mjml, html: raw.preview.html }
      : undefined;

  const warnings: string[] = [];
  let blocks: Block[] = [];
  let mjmlJson: MjmlJsonNode | null = null;

  if (schemaVersion === TEMPLATE_SCHEMA_VERSION) {
    mjmlJson = normalizeMjmlNode(raw.mjmlJson);
    if (!mjmlJson) {
      throw new Error("Template mjmlJson is required.");
    }
  }

  if (Array.isArray(raw.blocks)) {
    const sanitized = sanitizeBlocks(raw.blocks);
    blocks = sanitized.blocks;
    warnings.push(...sanitized.warnings);
  } else if (schemaVersion === TEMPLATE_SCHEMA_VERSION) {
    warnings.push("Template blocks missing; derived from mjmlJson.");
  } else {
    throw new Error("Template blocks must be an array.");
  }

  if (schemaVersion === 1) {
    mjmlJson = buildMjmlJson(blocks);
  } else if (!Array.isArray(raw.blocks)) {
    const derived = mjmlJsonToBlocks(mjmlJson!);
    blocks = derived.blocks;
    warnings.push(...derived.warnings);
  }

  return {
    input: {
      name,
      description,
      preview,
      blocks,
      mjmlJson: mjmlJson ?? buildMjmlJson(blocks),
    },
    warnings,
  };
}

export function coerceStoredTemplate(value: unknown): Template | null {
  if (!isPlainObject(value)) {
    return null;
  }
  const schemaVersion = value.schemaVersion;
  if (schemaVersion !== 1 && schemaVersion !== TEMPLATE_SCHEMA_VERSION) {
    return null;
  }
  if (typeof value.id !== "string" || typeof value.name !== "string") {
    return null;
  }
  if (!Array.isArray(value.blocks)) {
    return null;
  }

  const mjmlJson =
    normalizeMjmlNode((value as { mjmlJson?: unknown }).mjmlJson) ??
    buildMjmlJson(value.blocks as Block[]);

  return {
    ...(stripTemplateMeta(value) as Template),
    schemaVersion: TEMPLATE_SCHEMA_VERSION,
    mjmlJson,
  };
}

function cloneBlock(block: Block, context: "root" | "column"): Block | null {
  if (context === "column" && !COLUMN_ALLOWED.has(block.type)) {
    return null;
  }

  const cloned: Block = {
    ...block,
    id: crypto.randomUUID(),
    data: structuredClone(block.data),
    dsl: block.dsl ? (structuredClone(block.dsl) as BlockDSL) : undefined,
  };

  if (cloned.type === "layout-2" || cloned.type === "layout-3") {
    const data = cloned.data as LayoutData;
    data.columnBlocks = data.columnBlocks.map(
      (column) =>
        column
          .map((child) => cloneBlock(child, "column"))
          .filter(Boolean) as Block[],
    );
  }

  return cloned;
}

function sanitizeBlocks(rawBlocks: unknown[]): {
  blocks: Block[];
  warnings: string[];
} {
  const warnings: string[] = [];
  const blocks: Block[] = [];

  rawBlocks.forEach((rawBlock, index) => {
    const { block, warnings: blockWarnings } = sanitizeBlock(
      rawBlock,
      "root",
      `blocks[${index}]`,
    );
    warnings.push(...blockWarnings);
    if (block) {
      blocks.push(block);
    }
  });

  return { blocks, warnings };
}

function sanitizeBlock(
  rawBlock: unknown,
  context: "root" | "column",
  path: string,
): { block: Block | null; warnings: string[] } {
  const warnings: string[] = [];

  if (!isPlainObject(rawBlock)) {
    warnings.push(`${path} is not an object and was skipped.`);
    return { block: null, warnings };
  }

  const type = rawBlock.type;
  if (!isBlockType(type)) {
    warnings.push(`${path} has an unknown block type and was skipped.`);
    return { block: null, warnings };
  }

  if (context === "column" && !COLUMN_ALLOWED.has(type)) {
    warnings.push(`${path} uses a block type not allowed in columns.`);
    return { block: null, warnings };
  }

  const base = createBlock(type);
  const data = isPlainObject(rawBlock.data) ? rawBlock.data : {};
  const rawMeta = isPlainObject(rawBlock.meta) ? rawBlock.meta : null;
  const mjmlComponent =
    typeof rawMeta?.mjmlComponent === "string"
      ? rawMeta.mjmlComponent
      : base.meta?.mjmlComponent;

  let sanitizedData = base.data;

  if (type === "text") {
    const baseData = base.data as TextData;
    sanitizedData = {
      content: coerceString(data.content, baseData.content),
      color: coerceString(data.color, baseData.color),
      fontSize: coerceString(data.fontSize, baseData.fontSize),
      align: coerceAlign(data.align, baseData.align),
      textStyle: coerceTextStyle(data.textStyle),
      colorToken: coerceOptionalString(data.colorToken),
      fontFamily: coerceOptionalString(data.fontFamily),
      fontWeight: coerceOptionalString(data.fontWeight),
      lineHeight: coerceOptionalString(data.lineHeight),
    };
  } else if (type === "image") {
    const baseData = base.data as ImageData;
    sanitizedData = {
      src: coerceString(data.src, baseData.src),
      alt: coerceString(data.alt, baseData.alt),
      width: coerceString(data.width, baseData.width),
      assetId: coerceOptionalString(data.assetId),
    };
  } else if (type === "layout-2" || type === "layout-3") {
    const baseData = base.data as LayoutData;
    const rawColumns = Array.isArray(data.columnBlocks)
      ? data.columnBlocks
      : [];
    const columnBlocks: Block[][] = Array.from(
      { length: baseData.columns },
      () => [],
    );

    rawColumns.forEach((column, columnIndex) => {
      if (!Array.isArray(column) || columnIndex >= baseData.columns) {
        return;
      }
      column.forEach((child, childIndex) => {
        const childPath = `${path}.columnBlocks[${columnIndex}][${childIndex}]`;
        const { block, warnings: childWarnings } = sanitizeBlock(
          child,
          "column",
          childPath,
        );
        warnings.push(...childWarnings);
        if (block) {
          columnBlocks[columnIndex].push(block);
        }
      });
    });

    sanitizedData = {
      columns: baseData.columns,
      backgroundColor: coerceString(
        data.backgroundColor,
        baseData.backgroundColor,
      ),
      padding: coerceString(data.padding, baseData.padding),
      columnBlocks,
    };
  } else if (type === "divider") {
    const baseData = base.data as DividerData;
    sanitizedData = {
      borderColor: coerceString(data.borderColor, baseData.borderColor),
      borderWidth: coerceString(data.borderWidth, baseData.borderWidth),
      borderStyle: coerceString(data.borderStyle, baseData.borderStyle),
      padding: coerceString(data.padding, baseData.padding),
    };
  } else if (type === "html") {
    const baseData = base.data as HtmlData;
    sanitizedData = {
      content: coerceString(data.content, baseData.content),
    };
  }

  const block: Block = {
    id: crypto.randomUUID(),
    type,
    data: sanitizedData,
    meta: mjmlComponent ? { mjmlComponent } : undefined,
  };

  const normalizedDsl = normalizeMjmlNode((rawBlock as { dsl?: unknown }).dsl);
  if (normalizedDsl) {
    block.dsl = normalizedDsl as BlockDSL;
  }

  return { block, warnings };
}

function isBlockType(value: unknown): value is BlockType {
  return typeof value === "string" && BLOCK_TYPES.includes(value as BlockType);
}

function coerceString(value: unknown, fallback: string): string {
  return typeof value === "string" ? value : fallback;
}

function coerceOptionalString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length ? value : undefined;
}

function coerceTextStyle(value: unknown) {
  if (typeof value === "string" && value.trim().length) {
    return value;
  }
  return undefined;
}

function coerceAlign(value: unknown, fallback: "left" | "center" | "right") {
  if (value === "left" || value === "center" || value === "right") {
    return value;
  }
  return fallback;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stripTemplateMeta(value: Record<string, unknown>) {
  const { category: _category, tags: _tags, ...rest } = value;
  return rest;
}
