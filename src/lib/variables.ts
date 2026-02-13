import { faker } from "@faker-js/faker";
import type { Block, BlockData, LayoutData } from "./editor";

export type SupportedVariable = {
  key: string;
  label: string;
  description: string;
  token: string;
};

export function formatVariableToken(key: string): string {
  return `{{ ${key} }}`;
}

export const SUPPORTED_VARIABLES: SupportedVariable[] = [
  {
    key: "first_name",
    label: "First name",
    description: "Recipient first name",
    token: formatVariableToken("first_name"),
  },
  {
    key: "last_name",
    label: "Last name",
    description: "Recipient last name",
    token: formatVariableToken("last_name"),
  },
  {
    key: "email",
    label: "Email",
    description: "Recipient email address",
    token: formatVariableToken("email"),
  },
  {
    key: "company",
    label: "Company",
    description: "Recipient company name",
    token: formatVariableToken("company"),
  },
  {
    key: "unsubscribe_url",
    label: "Unsubscribe URL",
    description: "Recipient unsubscribe link",
    token: formatVariableToken("unsubscribe_url"),
  },
];

export const SUPPORTED_VARIABLES_BY_KEY: Record<string, SupportedVariable> =
  Object.fromEntries(
    SUPPORTED_VARIABLES.map((variable) => [variable.key, variable])
  );

function collectVariableKeys(value: string, keys: Set<string>) {
  for (const match of value.matchAll(/{{\s*([\w.-]+)\s*}}/g)) {
    if (match[1]) {
      keys.add(match[1]);
    }
  }
}

function scanBlockData(data: BlockData, keys: Set<string>) {
  Object.values(data).forEach((value) => {
    if (typeof value === "string") {
      collectVariableKeys(value, keys);
    }
  });
}

function isLayoutData(data: BlockData): data is LayoutData {
  return (
    typeof (data as LayoutData).columns === "number" &&
    Array.isArray((data as LayoutData).columnBlocks)
  );
}

export function extractVariableKeysFromBlocks(blocks: Block[]): string[] {
  const keys = new Set<string>();

  const walk = (block: Block) => {
    if (isLayoutData(block.data)) {
      const { columnBlocks, ...rest } = block.data;
      scanBlockData(rest as BlockData, keys);
      columnBlocks.forEach((column) => column.forEach(walk));
      return;
    }

    scanBlockData(block.data, keys);
  };

  blocks.forEach(walk);
  return Array.from(keys);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function replaceVariables(
  html: string,
  values: Record<string, string>
): string {
  if (!html) {
    return html;
  }

  return html.replace(/{{\s*([\w.-]+)\s*}}/g, (match, key) => {
    if (Object.prototype.hasOwnProperty.call(values, key)) {
      return escapeHtml(values[key] ?? "");
    }
    return match;
  });
}

export function generateVariableValue(key: string): string {
  switch (key) {
    case "first_name":
      return faker.person.firstName();
    case "last_name":
      return faker.person.lastName();
    case "email":
      return faker.internet.email();
    case "company":
      return faker.company.name();
    case "unsubscribe_url":
      return faker.internet.url();
    default:
      return faker.lorem.words(2);
  }
}
