import type { Template, TemplateInput, TemplateLibrary } from "./templates";
import {
  TEMPLATE_SCHEMA_VERSION,
  buildTemplatePreview,
  coerceStoredTemplate,
  createTemplateFromBlocks,
} from "./templates";
import type { Block, LayoutData } from "./editor";
import { buildMjmlJson, createBlock } from "./editor";

export type TemplateStore = {
  list: () => Promise<Template[]>;
  get: (id: string) => Promise<Template | null>;
  create: (input: TemplateInput) => Promise<Template>;
  update: (id: string, input: TemplateInput) => Promise<Template>;
  delete: (id: string) => Promise<void>;
};

const STORAGE_KEY = "email_editor.templates";

class LocalStorageTemplateStore implements TemplateStore {
  async list() {
    const library = readLibrary();
    return library.templates;
  }

  async get(id: string) {
    const library = readLibrary();
    return library.templates.find((template) => template.id === id) ?? null;
  }

  async create(input: TemplateInput) {
    const library = readLibrary();
    const template = createTemplateFromBlocks({
      ...input,
      preview: input.preview ?? buildTemplatePreview(input.blocks) ?? undefined,
    });
    const nextLibrary = {
      ...library,
      templates: [template, ...library.templates],
    };
    writeLibrary(nextLibrary);
    return template;
  }

  async update(id: string, input: TemplateInput) {
    const library = readLibrary();
    const now = new Date().toISOString();
    const templates = library.templates.map((template) => {
      if (template.id !== id) {
        return template;
      }
      return {
        ...template,
        name: input.name.trim() || template.name,
        description: input.description?.trim() || undefined,
        blocks: structuredClone(input.blocks),
        mjmlJson: input.mjmlJson ?? buildMjmlJson(input.blocks),
        preview:
          input.preview ??
          buildTemplatePreview(input.blocks) ??
          template.preview,
        updatedAt: now,
      };
    });

    const updated = templates.find((template) => template.id === id);
    if (!updated) {
      throw new Error("Template not found.");
    }

    writeLibrary({ ...library, templates });
    return updated;
  }

  async delete(id: string) {
    const library = readLibrary();
    writeLibrary({
      ...library,
      templates: library.templates.filter((template) => template.id !== id),
    });
  }
}

export const templateStore: TemplateStore = new LocalStorageTemplateStore();

function readLibrary(): TemplateLibrary {
  if (typeof window === "undefined") {
    return { schemaVersion: TEMPLATE_SCHEMA_VERSION, templates: [] };
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seeded = buildSeedLibrary();
      writeLibrary(seeded);
      return seeded;
    }
    const parsed = JSON.parse(raw) as unknown;
    if (!isPlainObject(parsed) || !Array.isArray(parsed.templates)) {
      return { schemaVersion: TEMPLATE_SCHEMA_VERSION, templates: [] };
    }
    const schemaVersion = parsed.schemaVersion;
    if (schemaVersion !== 1 && schemaVersion !== TEMPLATE_SCHEMA_VERSION) {
      return { schemaVersion: TEMPLATE_SCHEMA_VERSION, templates: [] };
    }
    const templates = parsed.templates
      .map((entry) => coerceStoredTemplate(entry))
      .filter(Boolean) as Template[];
    const library = { schemaVersion: TEMPLATE_SCHEMA_VERSION, templates };
    if (schemaVersion === 1) {
      writeLibrary(library);
    }
    return library;
  } catch {
    return { schemaVersion: TEMPLATE_SCHEMA_VERSION, templates: [] };
  }
}

function writeLibrary(library: TemplateLibrary) {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(library));
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function buildSeedLibrary(): TemplateLibrary {
  const templates: Template[] = [
    createTemplateFromBlocks({
      name: "Welcome Hero",
      description: "Hero image with introductory copy.",
      blocks: buildHeroBlocks(),
    }),
    createTemplateFromBlocks({
      name: "Product Highlight",
      description: "Two-column product callout.",
      blocks: buildProductBlocks(),
    }),
    createTemplateFromBlocks({
      name: "Weekly Digest",
      description: "Newsletter layout with stacked sections.",
      blocks: buildDigestBlocks(),
    }),
  ];

  return {
    schemaVersion: TEMPLATE_SCHEMA_VERSION,
    templates,
  };
}

function buildHeroBlocks(): Block[] {
  const heroImage = createBlock("image");
  heroImage.data = {
    ...heroImage.data,
    src: "https://placehold.co/600x400",
    alt: "Welcome hero",
    width: "600px",
  };

  const headline = createBlock("text");
  headline.data = {
    ...headline.data,
    content: "Thanks for joining us",
    color: "#0f172a",
    fontSize: "22px",
    align: "center",
  };

  const body = createBlock("text");
  body.data = {
    ...body.data,
    content: "Here is what you can expect in the next few days.",
    color: "#475569",
    fontSize: "14px",
    align: "center",
  };

  return [heroImage, headline, body];
}

function buildProductBlocks(): Block[] {
  const layout = createBlock("layout-2");
  const data = layout.data as LayoutData;
  data.backgroundColor = "#ffffff";
  data.padding = "20px";

  const productImage = createBlock("image");
  productImage.data = {
    ...productImage.data,
    src: "https://placehold.co/600x400",
    alt: "Product image",
    width: "260px",
  };

  const productTitle = createBlock("text");
  productTitle.data = {
    ...productTitle.data,
    content: "New feature spotlight",
    color: "#0f172a",
    fontSize: "18px",
    align: "left",
  };

  const productBody = createBlock("text");
  productBody.data = {
    ...productBody.data,
    content: "Showcase a top feature with a concise benefit statement.",
    color: "#475569",
    fontSize: "14px",
    align: "left",
  };

  data.columnBlocks = [[productImage], [productTitle, productBody]];

  return [layout];
}

function buildDigestBlocks(): Block[] {
  const intro = createBlock("text");
  intro.data = {
    ...intro.data,
    content: "This week at a glance",
    color: "#0f172a",
    fontSize: "20px",
    align: "left",
  };

  const updateOne = createBlock("text");
  updateOne.data = {
    ...updateOne.data,
    content: "• New onboarding flow launched on Monday.",
    color: "#475569",
    fontSize: "14px",
    align: "left",
  };

  const updateTwo = createBlock("text");
  updateTwo.data = {
    ...updateTwo.data,
    content: "• Customer stories campaign ready for review.",
    color: "#475569",
    fontSize: "14px",
    align: "left",
  };

  const updateThree = createBlock("text");
  updateThree.data = {
    ...updateThree.data,
    content: "• Weekly webinar scheduled for Thursday.",
    color: "#475569",
    fontSize: "14px",
    align: "left",
  };

  return [intro, updateOne, updateTwo, updateThree];
}
