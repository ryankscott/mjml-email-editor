export type BlockType = "section" | "text" | "image" | "layout-2" | "layout-3";

export type BlockDSL = {
  type: BlockType | "compound";
  name?: string;
  params?: Record<string, unknown>;
  children?: BlockDSL[] | BlockDSL[][];
};

export type SectionData = {
  backgroundColor: string;
  padding: string;
};

export type TextData = {
  content: string;
  color: string;
  fontSize: string;
  align: "left" | "center" | "right";
};

export type ImageData = {
  src: string;
  alt: string;
  width: string;
};

export type LayoutData = {
  columns: 2 | 3;
  columnBlocks: Block[][];
  backgroundColor: string;
  padding: string;
};

export type BlockData = SectionData | TextData | ImageData | LayoutData;

export type Block = {
  id: string;
  type: BlockType;
  data: BlockData;
  dsl?: BlockDSL;
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
  src: "https://via.placeholder.com/600x200?text=Image",
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

const defaultDataByType: Record<BlockType, BlockData> = {
  section: defaultSection,
  text: defaultText,
  image: defaultImage,
  "layout-2": defaultLayout2,
  "layout-3": defaultLayout3,
};

export function createBlock(type: BlockType): Block {
  return {
    id: crypto.randomUUID(),
    type,
    data: structuredClone(defaultDataByType[type]),
  };
}

export const FOOTER_DSL: BlockDSL = {
  type: "compound",
  name: "Footer",
  children: [
    {
      type: "layout-2",
      params: {
        backgroundColor: "#0f172a",
        padding: "16px",
      },
      children: [
        [
          {
            type: "image",
            params: {
              src: "https://via.placeholder.com/120x40?text=Logo",
              alt: "Logo",
              width: "120px",
            },
          },
        ],
        [
          {
            type: "text",
            params: {
              content: "Questions? Reply to this email",
              color: "#e2e8f0",
              fontSize: "12px",
              align: "right",
            },
          },
        ],
      ],
    },
    {
      type: "text",
      params: {
        content: "© 2026 Your Company. All rights reserved.",
        color: "#94a3b8",
        fontSize: "12px",
        align: "center",
      },
    },
  ],
};

export function expandDsl(dsl: BlockDSL): Block[] {
  if (dsl.type === "compound") {
    const children = Array.isArray(dsl.children) ? dsl.children : [];
    const expanded = (children as BlockDSL[]).flatMap((child) =>
      expandDsl(child)
    );
    return expanded.map((block) => ({ ...block, dsl }));
  }

  const block = createBlock(dsl.type);
  if (dsl.params) {
    block.data = {
      ...(block.data as object),
      ...dsl.params,
    } as BlockData;
  }

  if (block.type === "layout-2" || block.type === "layout-3") {
    const data = block.data as LayoutData;
    const columns = data.columns;
    const columnBlocks: Block[][] = Array.from({ length: columns }, () => []);
    if (Array.isArray(dsl.children)) {
      const children = dsl.children as BlockDSL[] | BlockDSL[][];
      if (Array.isArray(children[0])) {
        (children as BlockDSL[][]).forEach((column, columnIndex) => {
          const safeIndex = Math.min(columnIndex, columns - 1);
          const expanded = column.flatMap((child) => expandDsl(child));
          columnBlocks[safeIndex].push(
            ...expanded.filter((child) =>
              isBlockTypeAllowedInColumn(child.type)
            )
          );
        });
      } else {
        const expanded = (children as BlockDSL[]).flatMap((child) =>
          expandDsl(child)
        );
        expanded
          .filter((child) => isBlockTypeAllowedInColumn(child.type))
          .forEach((child, index) => {
            columnBlocks[index % columns].push(child);
          });
      }
    }
    data.columnBlocks = columnBlocks;
  }

  return [{ ...block, dsl }];
}

function isBlockTypeAllowedInColumn(blockType: BlockType) {
  return blockType === "text" || blockType === "image";
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function blockToMjml(block: Block) {
  if (block.type === "section") {
    const data = block.data as SectionData;
    return `\n      <mj-section background-color="${data.backgroundColor}" padding="${data.padding}">\n        <mj-column>\n          <mj-text color="#6b7280" font-size="14px">Section</mj-text>\n        </mj-column>\n      </mj-section>\n    `;
  }

  if (block.type === "layout-2" || block.type === "layout-3") {
    const data = block.data as LayoutData;
    const columns = data.columnBlocks
      .map((columnBlocks) => {
        const content = columnBlocks.length
          ? columnBlocks.map(blockToMjmlInColumn).join("\n")
          : '<mj-text color="#cbd5e1" font-size="12px" align="center">Drop blocks</mj-text>';
        return `\n      <mj-column>\n        ${content}\n      </mj-column>`;
      })
      .join("\n");

    return `\n      <mj-section background-color="${data.backgroundColor}" padding="${data.padding}">\n        ${columns}\n      </mj-section>\n    `;
  }

  if (block.type === "text") {
    const data = block.data as TextData;
    return `\n      <mj-section padding="0">\n        <mj-column>\n          <mj-text color="${data.color}" font-size="${data.fontSize}" align="${data.align}">${escapeHtml(
      data.content
    )}</mj-text>\n        </mj-column>\n      </mj-section>\n    `;
  }

  const data = block.data as ImageData;
  return `\n    <mj-section padding="0">\n      <mj-column>\n        <mj-image src="${data.src}" alt="${escapeHtml(data.alt)}" width="${data.width}" />\n      </mj-column>\n    </mj-section>\n  `;
}

function blockToMjmlInColumn(block: Block) {
  if (block.type === "text") {
    const data = block.data as TextData;
    return `<mj-text color="${data.color}" font-size="${data.fontSize}" align="${data.align}">${escapeHtml(
      data.content
    )}</mj-text>`;
  }

  if (block.type === "image") {
    const data = block.data as ImageData;
    return `<mj-image src="${data.src}" alt="${escapeHtml(data.alt)}" width="${data.width}" />`;
  }

  return `<mj-text color="#9ca3af" font-size="12px" align="center">Unsupported block in column</mj-text>`;
}

export function buildMjml(blocks: Block[]) {
  const bodyContent = blocks.length
    ? blocks.map(blockToMjml).join("\n")
    : `\n      <mj-section padding="40px">\n        <mj-column>\n          <mj-text color="#9ca3af" font-size="14px" align="center">Drop blocks to start building</mj-text>\n        </mj-column>\n      </mj-section>\n    `;

  return `\n<mjml>\n  <mj-head>\n    <mj-preview>Email preview</mj-preview>\n  </mj-head>\n  <mj-body background-color="#f8fafc">\n    ${bodyContent}\n  </mj-body>\n</mjml>\n`;
}
