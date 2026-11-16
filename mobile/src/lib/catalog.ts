import { supabase } from "./supabase";
import type { SpiceLevel } from "./orders";

export type Product = {
  id: string;
  categoryId: string;
  categoryTitle: string;
  name: string;
  description: string | null;
  unitPrice: number;
  spiceLevels: SpiceLevel[] | null;
  requiresGarlic: boolean;
  calories: number | null;
};

export type CatalogCategory = { key: string; title: string; products: Product[] };

const SPICES: SpiceLevel[] = ["acili", "az_acili", "acisiz"];

/** Paket siparişe açık ürünler (aynı veritabanı; yönetici değişikliği anında yansır) */
export async function fetchCatalog(): Promise<CatalogCategory[]> {
  const [cats, prods] = await Promise.all([
    supabase.from("categories").select("id, title, sub_section_title, sort_order, is_active").order("sort_order"),
    supabase
      .from("products")
      .select("id, category_id, name, option_group, option_name, description, price, sort_order, in_sub_section, is_active, is_orderable, spice_levels, requires_garlic, calories")
      .eq("is_active", true)
      .eq("is_orderable", true)
      .order("sort_order"),
  ]);
  if (cats.error) throw cats.error;
  if (prods.error) throw prods.error;

  const result: CatalogCategory[] = [];
  for (const c of cats.data ?? []) {
    if (!c.is_active) continue;
    const rows = (prods.data ?? []).filter((p) => p.category_id === c.id);
    const groups: [boolean, string][] = [
      [false, c.title as string],
      [true, ((c.sub_section_title as string | null) ?? c.title) as string],
    ];
    for (const [sub, title] of groups) {
      const products: Product[] = rows
        .filter((p) => Boolean(p.in_sub_section) === sub)
        .map((p) => {
          const levels = ((p.spice_levels as string[] | null) ?? []).filter((l): l is SpiceLevel =>
            SPICES.includes(l as SpiceLevel),
          );
          return {
            id: p.id as string,
            categoryId: c.id as string,
            categoryTitle: title,
            name: p.option_group ? `${p.option_group} — ${p.option_name ?? p.name}` : (p.name as string),
            description: (p.description as string | null) ?? null,
            unitPrice: Math.round(Number(p.price) * 100) / 100,
            spiceLevels: levels.length ? levels : null,
            requiresGarlic: Boolean(p.requires_garlic),
            calories: p.calories == null ? null : Number(p.calories),
          };
        });
      if (products.length) result.push({ key: `${c.id}${sub ? "-sub" : ""}`, title, products });
    }
  }
  return result;
}

export function defaultSpice(levels: SpiceLevel[]): SpiceLevel {
  if (levels.includes("az_acili")) return "az_acili";
  if (levels.includes("acili")) return "acili";
  return levels[0];
}
