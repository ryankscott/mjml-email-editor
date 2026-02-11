import type { Brand, BrandInput } from "../brand";

export type ImageAsset = {
  id: string;
  name: string;
  mime: string;
  size: number;
  width?: number;
  height?: number;
  createdAt: string;
};

export type BrandStore = {
  list: () => Promise<Brand[]>;
  get: (id: string) => Promise<Brand | null>;
  upsert: (input: BrandInput) => Promise<Brand>;
  delete: (id: string) => Promise<void>;
  getActiveId: () => Promise<string | null>;
  setActiveId: (id: string | null) => Promise<void>;
};

export type ImageStore = {
  list: () => Promise<ImageAsset[]>;
  getBlob: (id: string) => Promise<Blob | null>;
  create: (file: File) => Promise<ImageAsset>;
  delete: (id: string) => Promise<void>;
};
