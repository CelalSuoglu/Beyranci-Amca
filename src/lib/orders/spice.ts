export const SPICE_LEVELS = ["acili", "az_acili", "acisiz"] as const;

export type SpiceLevel = (typeof SPICE_LEVELS)[number];

export const SPICE_LEVEL_LABELS: Record<SpiceLevel, string> = {
  acili: "Acılı",
  az_acili: "Az acılı",
  acisiz: "Acısız",
};

/**
 * Beyran, lahmacun ve kebap (Adana / Urfa) ürünlerinde acı seçeneği zorunlu.
 */
export function productRequiresSpice(productName: string): boolean {
  const n = productName.toLocaleLowerCase("tr-TR");
  return (
    n.includes("beyran") ||
    n.includes("lahmacun") ||
    n.includes("adana") ||
    n.includes("urfa")
  );
}
