import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react";

import type { Brand, BrandInput } from "../../lib/brand";
import { useBrandMutations, useBrandsQuery } from "@/features/brand/api/brands";

type BrandContextValue = {
  brands: Brand[];
  activeBrand: Brand | null;
  activeBrandId: string | null;
  refresh: () => Promise<void>;
  setActiveBrandId: (id: string | null) => Promise<void>;
  upsertBrand: (input: BrandInput) => Promise<Brand>;
  deleteBrand: (id: string) => Promise<void>;
  createDefaultBrand: () => Promise<Brand>;
};

const BrandContext = createContext<BrandContextValue | null>(null);

export function BrandProvider({ children }: { children: ReactNode }) {
  const { data, refetch } = useBrandsQuery();
  const { upsertBrand, deleteBrand, setActiveBrandId, createDefaultBrand } =
    useBrandMutations();

  const brands = data?.brands ?? [];
  const activeBrandId = data?.activeBrandId ?? null;

  const refresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const activeBrand =
    brands.find((brand) => brand.id === activeBrandId) ?? null;

  const value = useMemo<BrandContextValue>(
    () => ({
      brands,
      activeBrand,
      activeBrandId,
      refresh,
      setActiveBrandId,
      upsertBrand,
      deleteBrand,
      createDefaultBrand,
    }),
    [
      brands,
      activeBrand,
      activeBrandId,
      refresh,
      setActiveBrandId,
      upsertBrand,
      deleteBrand,
      createDefaultBrand,
    ],
  );

  return <BrandContext.Provider value={value}>{children}</BrandContext.Provider>;
}

export function useBrand() {
  const context = useContext(BrandContext);
  if (!context) {
    throw new Error("useBrand must be used within BrandProvider");
  }
  return context;
}
