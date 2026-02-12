import type { TextStyle, TextStyleId } from "@/lib/brand";
import { DEFAULT_TEXT_STYLES } from "@/lib/brand";

export const STYLE_ORDER: TextStyleId[] = [
  "heading1",
  "heading2",
  "heading3",
  "caption",
  "paragraph",
];

export function ensureTextStyles(styles: TextStyle[]): TextStyle[] {
  const ordered = STYLE_ORDER.map(
    (id) =>
      styles.find((style) => style.id === id) ??
      DEFAULT_TEXT_STYLES.find((style) => style.id === id)!,
  );
  const baseIds = new Set(STYLE_ORDER);
  const extras = styles.filter((style) => !baseIds.has(style.id as TextStyleId));
  return [...ordered, ...extras];
}
