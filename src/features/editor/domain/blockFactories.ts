import type {
  Block,
  BlockDSL,
  BlockData,
  BlockType,
  DividerData,
  HtmlData,
  ImageData,
  LayoutData,
  SectionData,
  TextData,
} from "./types";

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
