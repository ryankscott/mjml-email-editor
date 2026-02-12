import { describe, expect, it } from "vitest";

import {
  cloneBlock,
  createBlock,
  findBlock,
  findBlockLocation,
  insertBlock,
  moveBlock,
  removeBlock,
} from "@/lib/editor";

function createLayoutWithChildren() {
  const layout = createBlock("layout-2");
  const left1 = createBlock("text");
  const left2 = createBlock("image");
  const right1 = createBlock("text");

  const data = layout.data as { columnBlocks: Array<Array<ReturnType<typeof createBlock>>> };
  data.columnBlocks = [[left1, left2], [right1]];

  return { layout, left1, left2, right1 };
}

describe("blockTree", () => {
  it("inserts at root index", () => {
    const a = createBlock("text");
    const b = createBlock("image");

    const blocks = insertBlock([a], b, { index: 0 });

    expect(blocks[0]?.id).toBe(b.id);
    expect(blocks[1]?.id).toBe(a.id);
  });

  it("finds nested block location in layout columns", () => {
    const { layout, left2 } = createLayoutWithChildren();

    const location = findBlockLocation([layout], left2.id);

    expect(location).toEqual({
      parentId: layout.id,
      columnIndex: 0,
      index: 1,
    });
  });

  it("removes nested block", () => {
    const { layout, left1 } = createLayoutWithChildren();

    const result = removeBlock([layout], left1.id);

    expect(result.removed?.id).toBe(left1.id);
    const updatedLayout = result.blocks[0];
    const column = (updatedLayout?.data as { columnBlocks: unknown[][] }).columnBlocks[0];
    expect(column).toHaveLength(1);
  });

  it("moves nested block across columns", () => {
    const { layout, left1 } = createLayoutWithChildren();

    const moved = moveBlock([layout], left1.id, {
      parentId: layout.id,
      columnIndex: 1,
      index: 1,
    });

    const updatedLayout = moved[0];
    const data = updatedLayout?.data as { columnBlocks: Array<Array<{ id: string }>> };
    expect(data.columnBlocks[0]).toHaveLength(1);
    expect(data.columnBlocks[1][1]?.id).toBe(left1.id);
  });

  it("clones block after source location", () => {
    const source = createBlock("text");

    const result = cloneBlock([source], source.id);

    expect(result.clonedId).not.toBeNull();
    expect(result.blocks).toHaveLength(2);
    expect(result.blocks[0]?.id).toBe(source.id);
    expect(result.blocks[1]?.id).toBe(result.clonedId);
  });

  it("no-ops on invalid ids", () => {
    const source = createBlock("text");

    const moved = moveBlock([source], "missing", { index: 0 });
    const found = findBlock(moved, "missing");

    expect(moved).toEqual([source]);
    expect(found).toBeNull();
  });
});
