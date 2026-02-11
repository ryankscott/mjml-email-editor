import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";

import type { ImageAsset } from "../../lib/stores/types";
import { getImageStore } from "../../lib/stores";
import type { Block, ImageData, LayoutData } from "../../lib/editor";
import { useEditor } from "./EditorProvider";

function findBlockById(blocks: Block[], blockId: string): Block | null {
  for (const block of blocks) {
    if (block.id === blockId) {
      return block;
    }
    if (block.type === "layout-2" || block.type === "layout-3") {
      const data = block.data as LayoutData;
      for (const column of data.columnBlocks) {
        const match = findBlockById(column, blockId);
        if (match) {
          return match;
        }
      }
    }
  }
  return null;
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

export default function ImageLibraryPage({
  onUploadButtonReady,
  showInlineUpload = true,
}: {
  onUploadButtonReady?: (trigger: () => void) => void;
  showInlineUpload?: boolean;
}) {
  const store = useMemo(() => getImageStore(), []);
  const { state, addBlock, updateBlock, selectBlock } = useEditor();
  const navigate = useNavigate();
  const [assets, setAssets] = useState<ImageAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrls, setPreviewUrls] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const loadAssets = async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await store.list();
      setAssets(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load images.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAssets();
  }, []);

  useEffect(() => {
    let isActive = true;
    let urlsToRevoke: string[] = [];
    const nextUrls: Record<string, string> = {};

    const buildUrls = async () => {
      for (const asset of assets) {
        const blob = await store.getBlob(asset.id);
        if (!blob || !isActive) {
          continue;
        }
        nextUrls[asset.id] = URL.createObjectURL(blob);
      }
      if (isActive) {
        setPreviewUrls(nextUrls);
        urlsToRevoke = Object.values(nextUrls);
      }
    };

    void buildUrls();

    return () => {
      isActive = false;
      urlsToRevoke.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [assets, store]);

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) {
      return;
    }
    setLoading(true);
    try {
      const uploads = Array.from(files).map((file) => store.create(file));
      await Promise.all(uploads);
      await loadAssets();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!onUploadButtonReady) {
      return;
    }
    const trigger = () => fileInputRef.current?.click();
    onUploadButtonReady(trigger);
  }, [onUploadButtonReady]);

  const handleApply = async (asset: ImageAsset) => {
    const blob = await store.getBlob(asset.id);
    if (!blob) {
      setError("Image not found.");
      return;
    }
    const dataUrl = await blobToDataUrl(blob);
    const target =
      state.selectedId ? findBlockById(state.blocks, state.selectedId) : null;
    if (target && target.type === "image") {
      updateBlock(target.id, {
        src: dataUrl,
        alt: asset.name,
        width: asset.width ? `${asset.width}px` : (target.data as ImageData).width,
        assetId: asset.id,
      });
      navigate({ to: "/editor" });
      return;
    }
    const newId = addBlock("image");
    updateBlock(newId, {
      src: dataUrl,
      alt: asset.name,
      width: asset.width ? `${asset.width}px` : "600px",
      assetId: asset.id,
    });
    selectBlock(newId);
    navigate({ to: "/editor" });
  };

  const handleDelete = async (assetId: string) => {
    const confirmed = window.confirm("Delete this image from the library?");
    if (!confirmed) {
      return;
    }
    await store.delete(assetId);
    await loadAssets();
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
        <span>{loading ? "Loading images..." : `${assets.length} images`}</span>
        {showInlineUpload ? (
          <label className="cursor-pointer rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50">
            Upload
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={(event) => handleUpload(event.target.files)}
              className="hidden"
            />
          </label>
        ) : (
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={(event) => handleUpload(event.target.files)}
            className="hidden"
          />
        )}
      </div>

      {error ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-3">
        {assets.length === 0 && !loading ? (
          <div className="col-span-full rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
            No images yet. Upload files to build your library.
          </div>
        ) : null}
        {assets.map((asset) => (
          <div
            key={asset.id}
            className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
          >
            <div className="h-32 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
              {previewUrls[asset.id] ? (
                <img
                  src={previewUrls[asset.id]}
                  alt={asset.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-slate-400">
                  Preview
                </div>
              )}
            </div>
            <div className="mt-2 text-xs font-semibold text-slate-700">
              {asset.name}
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleApply(asset)}
                className="rounded-full border border-cyan-300 bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700 transition hover:border-cyan-400 hover:bg-cyan-100"
              >
                Use in editor
              </button>
              <button
                type="button"
                onClick={() => handleDelete(asset.id)}
                className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700 transition hover:border-rose-300 hover:bg-rose-100"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
