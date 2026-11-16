export type AdminCategory = {
  id: string;
  title: string;
  layout: "cards" | "rows";
  sub_section_title: string | null;
  sort_order: number;
  is_active: boolean;
};

export type AdminProduct = {
  id: string;
  category_id: string;
  name: string;
  option_group: string | null;
  option_name: string | null;
  description: string | null;
  price: number;
  sort_order: number;
  in_sub_section: boolean;
  is_active: boolean;
  is_orderable: boolean;
  spice_levels: string[] | null;
  requires_garlic: boolean;
  calories: number | null;
  image_url: string | null;
};

export function slugify(input: string): string {
  return input
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const SPICE_PRESETS = {
  none: null,
  simple: ["acili", "acisiz"],
  full: ["acili", "az_acili", "acisiz"],
} as const;

export type SpicePreset = keyof typeof SPICE_PRESETS;

export function spicePresetOf(levels: string[] | null): SpicePreset {
  if (!levels || levels.length === 0) return "none";
  return levels.includes("az_acili") ? "full" : "simple";
}

export async function revalidateMenu() {
  try {
    await fetch("/api/admin/revalidate", { method: "POST" });
  } catch {
    // site en geç 60 sn içinde kendiliğinden yenilenir
  }
}
