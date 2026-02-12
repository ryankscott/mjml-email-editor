import { describe, expect, it } from "vitest";

import { mjmlJsonToBlocks } from "@/lib/editor";

describe("dslToBlocks", () => {
  it("expands a simple mjml section into a text block", () => {
    const root = {
      tagName: "mjml",
      children: [
        {
          tagName: "mj-body",
          children: [
            {
              tagName: "mj-section",
              children: [
                {
                  tagName: "mj-column",
                  children: [
                    {
                      tagName: "mj-text",
                      content: "Hello",
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    };

    const result = mjmlJsonToBlocks(root);

    expect(result.blocks).toHaveLength(1);
    expect(result.blocks[0]?.type).toBe("text");
    expect(result.warnings).toHaveLength(0);
  });

  it("warns for unsupported root", () => {
    const result = mjmlJsonToBlocks({ tagName: "mj-column", children: [] });

    expect(result.blocks).toHaveLength(0);
    expect(result.warnings[0]).toContain("not supported");
  });

  it("drops unsupported tags in single column sections", () => {
    const root = {
      tagName: "mj-section",
      children: [
        {
          tagName: "mj-column",
          children: [
            { tagName: "mj-button", content: "CTA" },
            { tagName: "mj-text", content: "Body" },
          ],
        },
      ],
    };

    const result = mjmlJsonToBlocks(root);

    expect(result.blocks).toHaveLength(1);
    expect(result.blocks[0]?.type).toBe("text");
    expect(result.warnings.join(" ")).toContain("unsupported tag");
  });
});
