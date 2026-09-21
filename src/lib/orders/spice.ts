export const SPICE_LEVELS = ["acili", "az_acili", "acisiz"] as const;

export type SpiceLevel = (typeof SPICE_LEVELS)[number];

export const SPICE_LEVEL_LABELS: Record<SpiceLevel, string> = {
  acili: "Acılı",
  az_acili: "Az acılı",
  acisiz: "Acısız",
};

/** Lahmacun ve kebap: yalnızca Acılı / Acısız */
export const SIMPLE_SPICE_LEVELS = ["acili", "acisiz"] as const satisfies readonly SpiceLevel[];

/** Beyran: Acılı / Az acılı / Acısız */
export const FULL_SPICE_LEVELS = [
  "acili",
  "az_acili",
  "acisiz",
] as const satisfies readonly SpiceLevel[];

export const GARLIC_LEVELS = ["az_sarimsakli", "bol_sarimsakli"] as const;

export type GarlicLevel = (typeof GARLIC_LEVELS)[number];

export const GARLIC_LEVEL_LABELS: Record<GarlicLevel, string> = {
  az_sarimsakli: "Az sarımsaklı",
  bol_sarimsakli: "Bol sarımsaklı",
};

export type ProductModifiers = {
  spiceLevels: readonly SpiceLevel[] | null;
  requiresGarlic: boolean;
};

/**
 * Beyran → acı (3 seçenek) + sarımsak
 * Lahmacun (kaşarlı dahil) ve Adana / Urfa kebap → Acılı / Acısız
 */
export function getProductModifiers(productName: string): ProductModifiers {
  const n = productName.toLocaleLowerCase("tr-TR");
  const isBeyran = n.includes("beyran");
  const isLahmacun = n.includes("lahmacun");
  const isKebab = n.includes("adana") || n.includes("urfa");

  if (isBeyran) {
    return { spiceLevels: FULL_SPICE_LEVELS, requiresGarlic: true };
  }
  if (isLahmacun || isKebab) {
    return { spiceLevels: SIMPLE_SPICE_LEVELS, requiresGarlic: false };
  }
  return { spiceLevels: null, requiresGarlic: false };
}

export function productRequiresSpice(productName: string): boolean {
  return getProductModifiers(productName).spiceLevels !== null;
}

export function isSpiceAllowed(
  level: SpiceLevel,
  allowed: readonly SpiceLevel[],
): boolean {
  return allowed.includes(level);
}

export function defaultSpiceLevel(
  allowed: readonly SpiceLevel[],
): SpiceLevel {
  if (allowed.includes("az_acili")) return "az_acili";
  if (allowed.includes("acili")) return "acili";
  return allowed[0]!;
}

export function formatModifierLabels(
  spiceLevel: SpiceLevel | null | undefined,
  garlicLevel: GarlicLevel | null | undefined,
): string | null {
  const parts: string[] = [];
  if (spiceLevel) parts.push(SPICE_LEVEL_LABELS[spiceLevel]);
  if (garlicLevel) parts.push(GARLIC_LEVEL_LABELS[garlicLevel]);
  return parts.length ? parts.join(", ") : null;
}
