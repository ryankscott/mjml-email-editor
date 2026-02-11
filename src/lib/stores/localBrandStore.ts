import type { Brand, BrandInput } from "../brand";
import { DEFAULT_COLORS, DEFAULT_TEXT_STYLES } from "../brand";
import type { BrandStore } from "./types";

const STORAGE_KEY = "email_editor.brands";
const SCHEMA_VERSION = 1;

type BrandLibrary = {
  schemaVersion: number;
  brands: Brand[];
  activeBrandId: string | null;
};

function createEmptyLibrary(): BrandLibrary {
  return { schemaVersion: SCHEMA_VERSION, brands: [], activeBrandId: null };
}

function coerceLibrary(raw: unknown): BrandLibrary {
  if (!raw || typeof raw !== "object") {
    return createEmptyLibrary();
  }
  const data = raw as Partial<BrandLibrary>;
  if (data.schemaVersion !== SCHEMA_VERSION || !Array.isArray(data.brands)) {
    return createEmptyLibrary();
  }
  return {
    schemaVersion: SCHEMA_VERSION,
    brands: data.brands as Brand[],
    activeBrandId:
      typeof data.activeBrandId === "string" ? data.activeBrandId : null,
  };
}

function readLibrary(): BrandLibrary {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return createEmptyLibrary();
  }
  try {
    const parsed = JSON.parse(raw) as unknown;
    return coerceLibrary(parsed);
  } catch {
    return createEmptyLibrary();
  }
}

function writeLibrary(library: BrandLibrary) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(library));
}

function normalizeInput(input: BrandInput): Brand {
  const now = new Date().toISOString();
  return {
    id: input.id ?? crypto.randomUUID(),
    name: input.name.trim() || "Untitled Brand",
    colors:
      input.colors && input.colors.length
        ? input.colors
        : DEFAULT_COLORS.map((color) => ({
            ...color,
            id: crypto.randomUUID(),
          })),
    textStyles:
      input.textStyles && input.textStyles.length
        ? input.textStyles
        : DEFAULT_TEXT_STYLES.map((style) => ({ ...style })),
    createdAt: now,
    updatedAt: now,
  };
}

export class LocalBrandStore implements BrandStore {
  async list() {
    return readLibrary().brands;
  }

  async get(id: string) {
    return readLibrary().brands.find((brand) => brand.id === id) ?? null;
  }

  async upsert(input: BrandInput) {
    const library = readLibrary();
    const existingIndex = input.id
      ? library.brands.findIndex((brand) => brand.id === input.id)
      : -1;
    if (existingIndex === -1) {
      const created = normalizeInput(input);
      const next = {
        ...library,
        brands: [created, ...library.brands],
        activeBrandId: library.activeBrandId ?? created.id,
      };
      writeLibrary(next);
      return created;
    }

    const existing = library.brands[existingIndex];
    const updated: Brand = {
      ...existing,
      name: input.name.trim() || existing.name,
      colors: input.colors,
      textStyles: input.textStyles,
      updatedAt: new Date().toISOString(),
    };
    const brands = [...library.brands];
    brands[existingIndex] = updated;
    writeLibrary({ ...library, brands });
    return updated;
  }

  async delete(id: string) {
    const library = readLibrary();
    const brands = library.brands.filter((brand) => brand.id !== id);
    const activeBrandId =
      library.activeBrandId === id ? brands[0]?.id ?? null : library.activeBrandId;
    writeLibrary({ ...library, brands, activeBrandId });
  }

  async getActiveId() {
    return readLibrary().activeBrandId ?? null;
  }

  async setActiveId(id: string | null) {
    const library = readLibrary();
    writeLibrary({ ...library, activeBrandId: id });
  }
}
