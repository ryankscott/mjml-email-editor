import type { ImageAsset, ImageStore } from "./types";

const META_KEY = "email_editor.imageMeta";
const META_VERSION = 1;

const DB_NAME = "email_editor.images";
const DB_VERSION = 1;
const STORE_NAME = "images";

type ImageMetaLibrary = {
  schemaVersion: number;
  assets: ImageAsset[];
};

function emptyMeta(): ImageMetaLibrary {
  return { schemaVersion: META_VERSION, assets: [] };
}

function readMeta(): ImageMetaLibrary {
  const raw = window.localStorage.getItem(META_KEY);
  if (!raw) {
    return emptyMeta();
  }
  try {
    const parsed = JSON.parse(raw) as ImageMetaLibrary;
    if (
      parsed.schemaVersion !== META_VERSION ||
      !Array.isArray(parsed.assets)
    ) {
      return emptyMeta();
    }
    return parsed;
  } catch {
    return emptyMeta();
  }
}

function writeMeta(library: ImageMetaLibrary) {
  window.localStorage.setItem(META_KEY, JSON.stringify(library));
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function withStore<T>(
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, mode);
    const store = tx.objectStore(STORE_NAME);
    const request = fn(store);
    request.onsuccess = () => resolve(request.result as T);
    request.onerror = () => reject(request.error);
  });
}

async function getImageDimensions(blob: Blob): Promise<{
  width?: number;
  height?: number;
}> {
  if (typeof createImageBitmap === "function") {
    try {
      const bitmap = await createImageBitmap(blob);
      const size = { width: bitmap.width, height: bitmap.height };
      bitmap.close();
      return size;
    } catch {
      return {};
    }
  }

  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(blob);
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      resolve({});
      URL.revokeObjectURL(url);
    };
    img.src = url;
  });
}

export class LocalImageStore implements ImageStore {
  async list() {
    return readMeta().assets;
  }

  async getBlob(id: string) {
    return withStore<Blob | null>("readonly", (store) => store.get(id));
  }

  async create(file: File) {
    const id = crypto.randomUUID();
    await withStore("readwrite", (store) => store.put(file, id));
    const { width, height } = await getImageDimensions(file);
    const asset: ImageAsset = {
      id,
      name: file.name || "Image",
      mime: file.type,
      size: file.size,
      width,
      height,
      createdAt: new Date().toISOString(),
    };
    const library = readMeta();
    writeMeta({ ...library, assets: [asset, ...library.assets] });
    return asset;
  }

  async delete(id: string) {
    await withStore("readwrite", (store) => store.delete(id));
    const library = readMeta();
    writeMeta({
      ...library,
      assets: library.assets.filter((asset) => asset.id !== id),
    });
  }
}
