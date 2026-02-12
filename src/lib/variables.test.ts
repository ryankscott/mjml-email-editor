import { describe, expect, it } from "vitest";

import { createBlock } from "@/lib/editor";
import { extractVariableKeysFromBlocks, replaceVariables } from "@/lib/variables";

describe("variables", () => {
  it("extracts variable keys from flat and nested blocks", () => {
    const text = createBlock("text");
    text.data = {
      ...text.data,
      content: "Hello {{ first_name }}",
    };

    const layout = createBlock("layout-2");
    const nested = createBlock("text");
    nested.data = {
      ...nested.data,
      content: "Company: {{ company }}",
    };
    (layout.data as { columnBlocks: unknown[][] }).columnBlocks = [[nested], []];

    const keys = extractVariableKeysFromBlocks([text, layout]);

    expect(keys.sort()).toEqual(["company", "first_name"]);
  });

  it("replaces known variables and leaves unknown tokens", () => {
    const html = "<p>{{ first_name }}</p><p>{{ unknown_key }}</p>";
    const replaced = replaceVariables(html, { first_name: "Ryan" });

    expect(replaced).toContain("Ryan");
    expect(replaced).toContain("{{ unknown_key }}");
  });

  it("escapes replacement values", () => {
    const html = "<p>{{ first_name }}</p>";
    const replaced = replaceVariables(html, { first_name: "<script>bad</script>" });

    expect(replaced).toContain("&lt;script&gt;bad&lt;/script&gt;");
  });
});
