import { useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getImageStore } from "@/lib/stores";

const imageStore = getImageStore();

export const imagesQueryKey = ["images"] as const;

export function useImagesQuery() {
  return useQuery({
    queryKey: imagesQueryKey,
    queryFn: () => imageStore.list(),
  });
}

export function useImageMutations() {
  const queryClient = useQueryClient();
  const getBlob = useCallback((id: string) => imageStore.getBlob(id), []);

  const invalidateImages = () =>
    queryClient.invalidateQueries({ queryKey: imagesQueryKey });

  const createImageMutation = useMutation({
    mutationFn: (file: File) => imageStore.create(file),
    onSuccess: invalidateImages,
  });

  const deleteImageMutation = useMutation({
    mutationFn: (id: string) => imageStore.delete(id),
    onSuccess: invalidateImages,
  });

  return {
    createImage: createImageMutation.mutateAsync,
    deleteImage: deleteImageMutation.mutateAsync,
    isCreating: createImageMutation.isPending,
    isDeleting: deleteImageMutation.isPending,
    getBlob,
  };
}
