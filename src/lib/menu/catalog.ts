import { createClient } from "@supabase/supabase-js";
import {
  menuCategories as codeMenu,
  type CardMenuItem,
  type MenuCategory,
  type RowMenuItem,
} from "@/lib/menu-data";
import {
  orderableProducts as codeProducts,
  type OrderableProduct,
} from "@/lib/orders/orderable-menu";
import { SPICE_LEVELS, type SpiceLevel } from "@/lib/orders/spice";

/** Supabase'deki ürün satırı */
export type ProductRow = {
  id: string;
  category_id: string;
  name: string;
  option_group: string | null;
  option_name: string | null;
  description: string | null;
  description_list: string[] | null;
  price: number | string;
  sort_order: number;
  in_sub_section: boolean;
  is_active: boolean;
  is_orderable: boolean;
  spice_levels: string[] | null;
  requires_garlic: boolean;
  /** Kalori (kcal); 20261116 migration'ından önce bu kolon yoktur */
  calories?: number | null;
};

export type CategoryRow = {
  id: string;
  title: string;
  layout: "cards" | "rows";
  sub_section_title: string | null;
  sort_order: number;
  is_active: boolean;
};

export type Catalog = {
  /** Ana sayfa ve QR menü görünümü */
  menu: MenuCategory[];
  /** Paket siparişte satılan ürünler (fiyat otoritesi) */
  orderable: OrderableProduct[];
  source: "database" | "code";
};

/** 1250 → "1.250,00 TL" */
export function formatPriceTl(value: number): string {
  const [i, d] = value.toFixed(2).split(".");
  return `${i.replace(/\B(?=(\d{3})+(?!\d))/g, ".")},${d} TL`;
}

function toSpiceLevels(raw: string[] | null): readonly SpiceLevel[] | null {
  if (!raw || raw.length === 0) return null;
  const valid = raw.filter((v): v is SpiceLevel =>
    (SPICE_LEVELS as readonly string[]).includes(v),
  );
  return valid.length ? valid : null;
}

export function productDisplayName(p: Pick<ProductRow, "name" | "option_group" | "option_name">) {
  return p.option_group ? `${p.option_group} — ${p.option_name ?? p.name}` : p.name;
}

export function buildCatalog(categories: CategoryRow[], products: ProductRow[]): Catalog {
  const sortedCats = [...categories]
    .filter((c) => c.is_active)
    .sort((a, b) => a.sort_order - b.sort_order);
  const active = products
    .filter((p) => p.is_active)
    .sort((a, b) => a.sort_order - b.sort_order);

  const menu: MenuCategory[] = [];
  const orderable: OrderableProduct[] = [];

  for (const cat of sortedCats) {
    const rows = active.filter((p) => p.category_id === cat.id);
    const main = rows.filter((p) => !p.in_sub_section);
    const sub = rows.filter((p) => p.in_sub_section);

    const subItems: RowMenuItem[] = sub.map((p) => ({
      name: productDisplayName(p),
      price: formatPriceTl(Number(p.price)),
      calories: p.calories ?? undefined,
    }));

    if (cat.layout === "cards") {
      const items: CardMenuItem[] = [];
      const groups = new Map<string, CardMenuItem>();
      for (const p of main) {
        if (p.option_group) {
          let g = groups.get(p.option_group);
          if (!g) {
            g = {
              name: p.option_group,
              options: [],
              description: p.description ?? undefined,
              descriptionList: p.description_list ?? undefined,
            };
            groups.set(p.option_group, g);
            items.push(g);
          }
          g.options!.push({
            name: p.option_name ?? p.name,
            price: formatPriceTl(Number(p.price)),
          });
        } else {
          items.push({
            name: p.name,
            price: formatPriceTl(Number(p.price)),
            description: p.description ?? undefined,
            descriptionList: p.description_list ?? undefined,
            calories: p.calories ?? undefined,
          });
        }
      }
      if (items.length || subItems.length) {
        menu.push({
          id: cat.id,
          title: cat.title,
          layout: "cards",
          items,
          subSectionTitle: cat.sub_section_title ?? undefined,
          subSectionItems: subItems.length ? subItems : undefined,
        });
      }
    } else {
      const items: RowMenuItem[] = main.map((p) => ({
        name: productDisplayName(p),
        price: formatPriceTl(Number(p.price)),
        calories: p.calories ?? undefined,
      }));
      if (items.length || subItems.length) {
        menu.push({
          id: cat.id,
          title: cat.title,
          layout: "rows",
          items,
          subSectionTitle: cat.sub_section_title ?? undefined,
          subSectionItems: subItems.length ? subItems : undefined,
        });
      }
    }

    for (const p of rows) {
      if (!p.is_orderable) continue;
      const spiceLevels = toSpiceLevels(p.spice_levels);
      orderable.push({
        id: p.id,
        categoryId: cat.id,
        categoryTitle: p.in_sub_section ? (cat.sub_section_title ?? cat.title) : cat.title,
        name: productDisplayName(p),
        description: p.description ?? undefined,
        unitPrice: Math.round(Number(p.price) * 100) / 100,
        spiceLevels,
        requiresGarlic: p.requires_garlic,
        requiresSpice: spiceLevels !== null,
        calories: p.calories ?? undefined,
      });
    }
  }

  return { menu, orderable, source: "database" };
}

const codeCatalog: Catalog = {
  menu: codeMenu,
  orderable: [...codeProducts],
  source: "code",
};

/**
 * Menüyü veritabanından okur. Veritabanı henüz kurulmadıysa veya erişilemiyorsa
 * koddaki menüye düşer, böylece site hiçbir zaman menüsüz kalmaz.
 */
export async function getCatalog(): Promise<Catalog> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return codeCatalog;

  try {
    const supabase = createClient(url, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const [cats, prods] = await Promise.all([
      supabase.from("categories").select("*"),
      supabase.from("products").select("*"),
    ]);
    if (cats.error || prods.error || !cats.data?.length || !prods.data?.length) {
      return codeCatalog;
    }
    return buildCatalog(cats.data as CategoryRow[], prods.data as ProductRow[]);
  } catch {
    return codeCatalog;
  }
}

export function getOrderableCategoriesFrom(products: readonly OrderableProduct[]) {
  const map = new Map<string, { id: string; title: string; products: OrderableProduct[] }>();
  for (const product of products) {
    const key = `${product.categoryId}|${product.categoryTitle}`;
    const existing = map.get(key);
    if (existing) existing.products.push(product);
    else map.set(key, { id: product.categoryId, title: product.categoryTitle, products: [product] });
  }
  return Array.from(map.values());
}
