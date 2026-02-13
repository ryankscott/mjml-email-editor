import type { TextStyleId } from "@/lib/brand";
import type { MjmlJsonNode } from "@/lib/mjmlJson";

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
  backgroundColorToken?: string;
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
  backgroundColorToken?: string;
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

export function isLayoutType(type: BlockType): type is "layout-2" | "layout-3" {
  return type === "layout-2" || type === "layout-3";
}

export function isLayoutBlock(block: Block): block is Block & { data: LayoutData } {
  return isLayoutType(block.type);
}
