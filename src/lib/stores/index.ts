import { LocalBrandStore } from "./localBrandStore";
import { LocalImageStore } from "./localImageStore";
import type { BrandStore, ImageStore } from "./types";

let brandStore: BrandStore | null = null;
let imageStore: ImageStore | null = null;

export function getBrandStore(): BrandStore {
  if (!brandStore) {
    brandStore = new LocalBrandStore();
  }
  return brandStore;
}

export function getImageStore(): ImageStore {
  if (!imageStore) {
    imageStore = new LocalImageStore();
  }
  return imageStore;
}
