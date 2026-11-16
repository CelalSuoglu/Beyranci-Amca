import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { fetchCatalog, type CatalogCategory, type Product } from "../lib/catalog";
import { GARLIC_LEVEL_LABELS, SPICE_LEVEL_LABELS, type GarlicLevel, type SpiceLevel } from "../lib/orders";

export type CartLine = {
  key: string;
  productId: string;
  quantity: number;
  spiceLevel: SpiceLevel | null;
  garlicLevel: GarlicLevel | null;
};

export type CartLineView = CartLine & { product: Product; lineTotal: number; displayName: string };

type CartValue = {
  catalog: CatalogCategory[];
  catalogLoading: boolean;
  catalogError: string | null;
  reloadCatalog: () => Promise<void>;
  productById: (id: string) => Product | undefined;
  lines: CartLineView[];
  count: number;
  subtotal: number;
  add: (productId: string, quantity: number, spice: SpiceLevel | null, garlic: GarlicLevel | null) => void;
  setQuantity: (key: string, quantity: number) => void;
  clear: () => void;
};

const STORAGE_KEY = "beyranci:cart:v1";
const CartContext = createContext<CartValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [catalog, setCatalog] = useState<CatalogCategory[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);

  const reloadCatalog = useCallback(async () => {
    try {
      setCatalog(await fetchCatalog());
      setCatalogError(null);
    } catch {
      setCatalogError("Menü yüklenemedi. İnternet bağlantınızı kontrol edin.");
    } finally {
      setCatalogLoading(false);
    }
  }, []);

  useEffect(() => {
    void reloadCatalog();
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) setCart(JSON.parse(raw) as CartLine[]);
      })
      .catch(() => undefined)
      .finally(() => setHydrated(true));
  }, [reloadCatalog]);

  useEffect(() => {
    if (hydrated) void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(cart)).catch(() => undefined);
  }, [cart, hydrated]);

  const map = useMemo(() => {
    const m = new Map<string, Product>();
    catalog.forEach((c) => c.products.forEach((p) => m.set(p.id, p)));
    return m;
  }, [catalog]);

  const lines = useMemo<CartLineView[]>(() => {
    const out: CartLineView[] = [];
    for (const line of cart) {
      const product = map.get(line.productId);
      if (!product) continue; // menüden kaldırılan ürün sepetten düşer
      const mods = [
        line.spiceLevel ? SPICE_LEVEL_LABELS[line.spiceLevel] : null,
        line.garlicLevel ? GARLIC_LEVEL_LABELS[line.garlicLevel] : null,
      ].filter(Boolean);
      out.push({
        ...line,
        product,
        lineTotal: Math.round(product.unitPrice * line.quantity * 100) / 100,
        displayName: mods.length ? `${product.name} (${mods.join(", ")})` : product.name,
      });
    }
    return out;
  }, [cart, map]);

  const add = useCallback<CartValue["add"]>((productId, quantity, spice, garlic) => {
    const key = [productId, spice ?? "", garlic ?? ""].join("__");
    setCart((prev) => {
      const existing = prev.find((l) => l.key === key);
      if (existing) {
        return prev.map((l) => (l.key === key ? { ...l, quantity: Math.min(99, l.quantity + quantity) } : l));
      }
      return [...prev, { key, productId, quantity: Math.min(99, quantity), spiceLevel: spice, garlicLevel: garlic }];
    });
  }, []);

  const setQuantity = useCallback((key: string, quantity: number) => {
    setCart((prev) =>
      quantity < 1 ? prev.filter((l) => l.key !== key) : prev.map((l) => (l.key === key ? { ...l, quantity: Math.min(99, quantity) } : l)),
    );
  }, []);

  const clear = useCallback(() => setCart([]), []);

  const value = useMemo<CartValue>(
    () => ({
      catalog,
      catalogLoading,
      catalogError,
      reloadCatalog,
      productById: (id) => map.get(id),
      lines,
      count: lines.reduce((s, l) => s + l.quantity, 0),
      subtotal: Math.round(lines.reduce((s, l) => s + l.lineTotal, 0) * 100) / 100,
      add,
      setQuantity,
      clear,
    }),
    [catalog, catalogLoading, catalogError, reloadCatalog, map, lines, add, setQuantity, clear],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart CartProvider içinde kullanılmalı");
  return ctx;
}
