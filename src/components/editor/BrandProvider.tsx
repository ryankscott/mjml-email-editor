import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type { Brand, BrandInput } from "../../lib/brand";
import { DEFAULT_COLORS, DEFAULT_TEXT_STYLES } from "../../lib/brand";
import { getBrandStore } from "../../lib/stores";

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
  const store = useMemo(() => getBrandStore(), []);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [activeBrandId, setActiveBrandIdState] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const [list, activeId] = await Promise.all([
      store.list(),
      store.getActiveId(),
    ]);
    setBrands(list);
    setActiveBrandIdState(activeId);
  }, [store]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const setActiveBrandId = useCallback(
    async (id: string | null) => {
      await store.setActiveId(id);
      await refresh();
    },
    [store, refresh]
  );

  const upsertBrand = useCallback(
    async (input: BrandInput) => {
      const saved = await store.upsert(input);
      await refresh();
      return saved;
    },
    [store, refresh]
  );

  const deleteBrand = useCallback(
    async (id: string) => {
      await store.delete(id);
      await refresh();
    },
    [store, refresh]
  );

  const createDefaultBrand = useCallback(async () => {
    const created = await store.upsert({
      name: "New Brand",
      colors: DEFAULT_COLORS.map((color) => ({
        ...color,
        id: crypto.randomUUID(),
      })),
      textStyles: DEFAULT_TEXT_STYLES.map((style) => ({ ...style })),
    });
    await refresh();
    return created;
  }, [store, refresh]);

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
    ]
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
