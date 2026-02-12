import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";

import { useImageMutations, useImagesQuery } from "@/features/images/api/images";
import { findBlock, type ImageData } from "@/lib/editor";
import {
  useEditorActions,
  useEditorState,
} from "@/components/editor/EditorProvider";
import { EmptyState, ErrorNotice } from "@/shared/ui/AsyncState";

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
  const { data: assets = [], error, isLoading, refetch } = useImagesQuery();
  const { createImage, deleteImage, getBlob } = useImageMutations();
  const state = useEditorState();
  const { addBlock, updateBlock, selectBlock } = useEditorActions();
  const navigate = useNavigate();
  const [localError, setLocalError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [previewUrls, setPreviewUrls] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    let isActive = true;
    let urlsToRevoke: string[] = [];
    const nextUrls: Record<string, string> = {};

    const buildUrls = async () => {
      for (const asset of assets) {
        const blob = await getBlob(asset.id);
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
  }, [assets, getBlob]);

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) {
      return;
    }
    setUploading(true);
    setLocalError(null);
    try {
      await Promise.all(Array.from(files).map((file) => createImage(file)));
      await refetch();
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    if (!onUploadButtonReady) {
      return;
    }
    const trigger = () => fileInputRef.current?.click();
    onUploadButtonReady(trigger);
  }, [onUploadButtonReady]);

  const handleApply = async (assetId: string, assetName: string, width?: number) => {
    const blob = await getBlob(assetId);
    if (!blob) {
      setLocalError("Image not found.");
      return;
    }
    const dataUrl = await blobToDataUrl(blob);
    const target = state.selectedId ? findBlock(state.blocks, state.selectedId) : null;
    if (target && target.type === "image") {
      updateBlock(target.id, {
        src: dataUrl,
        alt: assetName,
        width: width ? `${width}px` : (target.data as ImageData).width,
        assetId,
      });
      navigate({ to: "/editor" });
      return;
    }
    const newId = addBlock("image");
    updateBlock(newId, {
      src: dataUrl,
      alt: assetName,
      width: width ? `${width}px` : "600px",
      assetId,
    });
    selectBlock(newId);
    navigate({ to: "/editor" });
  };

  const handleDelete = async (assetId: string) => {
    const confirmed = window.confirm("Delete this image from the library?");
    if (!confirmed) {
      return;
    }
    await deleteImage(assetId);
    await refetch();
  };

  const loading = isLoading || uploading;
  const errorMessage =
    localError ?? (error instanceof Error ? error.message : null);

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
              onChange={(event) => void handleUpload(event.target.files)}
              className="hidden"
            />
          </label>
        ) : (
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={(event) => void handleUpload(event.target.files)}
            className="hidden"
          />
        )}
      </div>

      {errorMessage ? <ErrorNotice message={errorMessage} /> : null}

      <div className="grid gap-4 md:grid-cols-3">
        {assets.length === 0 && !loading ? (
          <div className="col-span-full">
            <EmptyState>No images yet. Upload files to build your library.</EmptyState>
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
            <div className="mt-2 text-xs font-semibold text-slate-700">{asset.name}</div>
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void handleApply(asset.id, asset.name, asset.width)}
                className="rounded-full border border-cyan-300 bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700 transition hover:border-cyan-400 hover:bg-cyan-100"
              >
                Use in editor
              </button>
              <button
                type="button"
                onClick={() => void handleDelete(asset.id)}
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
