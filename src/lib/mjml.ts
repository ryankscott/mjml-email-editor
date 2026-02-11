import mjml2html from "mjml-browser";

import type { Brand } from "./brand";
import type { Block } from "./editor";
import { buildMjml } from "./editor";

export type CompileResult = {
  html: string;
  errors: string[];
};

export function compileMjml(mjml: string): CompileResult {
  try {
    const result = mjml2html(mjml, { validationLevel: "soft" });
    const errors = Array.isArray(result.errors)
      ? result.errors.map((error) =>
          typeof error === "string"
            ? error
            : error.formattedMessage || JSON.stringify(error)
        )
      : [];

    return {
      html: result.html || "",
      errors,
    };
  } catch (error) {
    return {
      html: "",
      errors: [error instanceof Error ? error.message : String(error)],
    };
  }
}

export function compileBlocks(
  blocks: Block[],
  brand?: Brand | null
): CompileResult {
  return compileMjml(buildMjml(blocks, brand));
}
