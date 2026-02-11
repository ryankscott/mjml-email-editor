export type TextStyleId =
  | "heading1"
  | "heading2"
  | "heading3"
  | "paragraph"
  | "caption"
  | (string & {});

export type BrandColor = {
  id: string;
  name: string;
  value: string;
};

export type TextStyle = {
  id: TextStyleId;
  label: string;
  fontSize: string;
  fontFamily: string;
  fontWeight?: string;
  lineHeight?: string;
};

export type Brand = {
  id: string;
  name: string;
  colors: BrandColor[];
  textStyles: TextStyle[];
  createdAt: string;
  updatedAt: string;
};

export type BrandInput = {
  id?: string;
  name: string;
  colors: BrandColor[];
  textStyles: TextStyle[];
};

export const DEFAULT_TEXT_STYLES: TextStyle[] = [
  {
    id: "heading1",
    label: "Title",
    fontSize: "32px",
    fontFamily: "Helvetica, Arial, sans-serif",
    fontWeight: "700",
    lineHeight: "1.2",
  },
  {
    id: "heading2",
    label: "Subtitle",
    fontSize: "24px",
    fontFamily: "Helvetica, Arial, sans-serif",
    fontWeight: "700",
    lineHeight: "1.25",
  },
  {
    id: "heading3",
    label: "Heading",
    fontSize: "20px",
    fontFamily: "Helvetica, Arial, sans-serif",
    fontWeight: "600",
    lineHeight: "1.3",
  },
  {
    id: "paragraph",
    label: "Body",
    fontSize: "16px",
    fontFamily: "Helvetica, Arial, sans-serif",
    fontWeight: "400",
    lineHeight: "1.5",
  },
  {
    id: "caption",
    label: "Section header",
    fontSize: "12px",
    fontFamily: "Helvetica, Arial, sans-serif",
    fontWeight: "400",
    lineHeight: "1.4",
  },
];

export const DEFAULT_COLORS: BrandColor[] = [
  { id: crypto.randomUUID(), name: "Raisin", value: "#3b3438" },
  { id: crypto.randomUUID(), name: "Olive", value: "#7a7a2a" },
  { id: crypto.randomUUID(), name: "Dark Crimson", value: "#b3123f" },
  { id: crypto.randomUUID(), name: "Pumpkin", value: "#e46c1a" },
  { id: crypto.randomUUID(), name: "Gold", value: "#f2b544" },
  { id: crypto.randomUUID(), name: "Linen", value: "#efe5d8" },
  { id: crypto.randomUUID(), name: "Light Linen", value: "#f7f2eb" },
  { id: crypto.randomUUID(), name: "White", value: "#ffffff" },
  { id: crypto.randomUUID(), name: "Seaweed", value: "#2f6b5a" },
];

export type ResolvedTextStyle = {
  color: string;
  fontSize: string;
  fontFamily?: string;
  fontWeight?: string;
  lineHeight?: string;
};

export type TextStyleInput = {
  color: string;
  fontSize: string;
  textStyle?: TextStyleId;
  colorToken?: string;
  fontFamily?: string;
  fontWeight?: string;
  lineHeight?: string;
};

export function resolveTextStyle(
  data: TextStyleInput,
  brand?: Brand | null
): ResolvedTextStyle {
  const style = brand?.textStyles.find((entry) => entry.id === data.textStyle);
  const color = brand?.colors.find((entry) => entry.id === data.colorToken);

  return {
    color: color?.value ?? data.color,
    fontSize: style?.fontSize ?? data.fontSize,
    fontFamily: style?.fontFamily ?? data.fontFamily,
    fontWeight: style?.fontWeight ?? data.fontWeight,
    lineHeight: style?.lineHeight ?? data.lineHeight,
  };
}
