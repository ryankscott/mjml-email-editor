import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { BrandInput } from "@/lib/brand";
import { DEFAULT_COLORS, DEFAULT_TEXT_STYLES } from "@/lib/brand";
import { getBrandStore } from "@/lib/stores";

const brandStore = getBrandStore();

export const brandsQueryKey = ["brands"] as const;

export type BrandsQueryResult = {
  brands: Awaited<ReturnType<typeof brandStore.list>>;
  activeBrandId: string | null;
};

export function useBrandsQuery() {
  return useQuery({
    queryKey: brandsQueryKey,
    queryFn: async (): Promise<BrandsQueryResult> => {
      const [brands, activeBrandId] = await Promise.all([
        brandStore.list(),
        brandStore.getActiveId(),
      ]);
      return { brands, activeBrandId };
    },
  });
}

export function useBrandMutations() {
  const queryClient = useQueryClient();

  const invalidateBrands = () =>
    queryClient.invalidateQueries({ queryKey: brandsQueryKey });

  const upsertBrandMutation = useMutation({
    mutationFn: (input: BrandInput) => brandStore.upsert(input),
    onSuccess: invalidateBrands,
  });

  const deleteBrandMutation = useMutation({
    mutationFn: (id: string) => brandStore.delete(id),
    onSuccess: invalidateBrands,
  });

  const setActiveBrandMutation = useMutation({
    mutationFn: (id: string | null) => brandStore.setActiveId(id),
    onSuccess: invalidateBrands,
  });

  const createDefaultBrandMutation = useMutation({
    mutationFn: () =>
      brandStore.upsert({
        name: "New Brand",
        colors: DEFAULT_COLORS.map((color) => ({
          ...color,
          id: crypto.randomUUID(),
        })),
        textStyles: DEFAULT_TEXT_STYLES.map((style) => ({ ...style })),
      }),
    onSuccess: invalidateBrands,
  });

  return {
    upsertBrand: upsertBrandMutation.mutateAsync,
    deleteBrand: deleteBrandMutation.mutateAsync,
    setActiveBrandId: setActiveBrandMutation.mutateAsync,
    createDefaultBrand: createDefaultBrandMutation.mutateAsync,
    isSaving:
      upsertBrandMutation.isPending ||
      deleteBrandMutation.isPending ||
      setActiveBrandMutation.isPending ||
      createDefaultBrandMutation.isPending,
  };
}
