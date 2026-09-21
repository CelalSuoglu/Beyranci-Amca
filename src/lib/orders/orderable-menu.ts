import { menuCategories } from "@/lib/menu-data";
import { getProductModifiers, type SpiceLevel } from "./spice";

export type OrderableProduct = {
  id: string;
  categoryId: string;
  categoryTitle: string;
  name: string;
  description?: string;
  /** Birim fiyat (TL, sayısal) */
  unitPrice: number;
  /** İzin verilen acı seçenekleri; null ise acı seçilmez */
  spiceLevels: readonly SpiceLevel[] | null;
  /** Beyran için sarımsak seçeneği zorunlu */
  requiresGarlic: boolean;
  /** Geriye dönük kısayol: spiceLevels dolu mu */
  requiresSpice: boolean;
};

/** "450,00 TL" / "450 TL" → 450 */
export function parsePriceTl(raw: string): number | null {
  const cleaned = raw
    .replace(/\s/g, "")
    .replace(/TL/gi, "")
    .replace(/\./g, "")
    .replace(",", ".")
    .trim();
  const value = Number.parseFloat(cleaned);
  if (!Number.isFinite(value) || value < 0) return null;
  return Math.round(value * 100) / 100;
}

function slugify(input: string): string {
  return input
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Paket siparişte sunulmayan ürünler (QR menüde kalabilir) */
function isExcludedFromPackage(name: string): boolean {
  const n = name.toLocaleLowerCase("tr-TR").trim();
  return (
    n.includes("türk kahvesi") ||
    n.includes("turk kahvesi") ||
    n === "çay"
  );
}

function buildProducts(): OrderableProduct[] {
  const products: OrderableProduct[] = [];

  for (const category of menuCategories) {
    for (const item of category.items) {
      if ("options" in item && item.options?.length) {
        for (const option of item.options) {
          const unitPrice = parsePriceTl(option.price);
          if (unitPrice === null) continue;
          const name = `${item.name} — ${option.name}`;
          if (isExcludedFromPackage(name)) continue;
          const modifiers = getProductModifiers(name);
          products.push({
            id: `${category.id}-${slugify(name)}`,
            categoryId: category.id,
            categoryTitle: category.title,
            name,
            description: item.description,
            unitPrice,
            spiceLevels: modifiers.spiceLevels,
            requiresGarlic: modifiers.requiresGarlic,
            requiresSpice: modifiers.spiceLevels !== null,
          });
        }
        continue;
      }

      if (!item.price) continue;
      if (isExcludedFromPackage(item.name)) continue;
      const unitPrice = parsePriceTl(item.price);
      if (unitPrice === null) continue;

      {
        const modifiers = getProductModifiers(item.name);
        products.push({
          id: `${category.id}-${slugify(item.name)}`,
          categoryId: category.id,
          categoryTitle: category.title,
          name: item.name,
          description:
            "description" in item ? item.description : undefined,
          unitPrice,
          spiceLevels: modifiers.spiceLevels,
          requiresGarlic: modifiers.requiresGarlic,
          requiresSpice: modifiers.spiceLevels !== null,
        });
      }
    }

    if (category.subSectionItems?.length) {
      for (const item of category.subSectionItems) {
        if (isExcludedFromPackage(item.name)) continue;
        const unitPrice = parsePriceTl(item.price);
        if (unitPrice === null) continue;
        const modifiers = getProductModifiers(item.name);
        products.push({
          id: `${category.id}-sub-${slugify(item.name)}`,
          categoryId: category.id,
          categoryTitle: category.subSectionTitle ?? category.title,
          name: item.name,
          unitPrice,
          spiceLevels: modifiers.spiceLevels,
          requiresGarlic: modifiers.requiresGarlic,
          requiresSpice: modifiers.spiceLevels !== null,
        });
      }
    }
  }

  return products;
}

export const orderableProducts: readonly OrderableProduct[] = buildProducts();

const productById = new Map(
  orderableProducts.map((product) => [product.id, product]),
);

export function getOrderableProduct(
  id: string,
): OrderableProduct | undefined {
  return productById.get(id);
}

export function getOrderableCategories(): {
  id: string;
  title: string;
  products: OrderableProduct[];
}[] {
  const map = new Map<
    string,
    { id: string; title: string; products: OrderableProduct[] }
  >();

  for (const product of orderableProducts) {
    const existing = map.get(product.categoryId);
    if (existing) {
      existing.products.push(product);
    } else {
      map.set(product.categoryId, {
        id: product.categoryId,
        title: product.categoryTitle,
        products: [product],
      });
    }
  }

  return Array.from(map.values());
}
