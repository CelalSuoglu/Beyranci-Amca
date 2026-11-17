import { ALLERGEN_NOTICE, allergenShortLabels } from "@/lib/allergens";

/** Ürün adının yanında küçük alerjen etiketi: "Alerjen: Gluten, Süt" */
export function AllergenTags({ codes }: { codes?: readonly string[] }) {
  const labels = allergenShortLabels(codes);
  if (!labels.length) return null;
  return (
    <span className="mt-1 block text-xs font-normal leading-snug text-[#fdba74]/85">
      Alerjen: {labels.join(", ")}
    </span>
  );
}

/** Menü altındaki yasal bilgilendirme (fiyat, servis ücreti, kalori, alerjen) */
export function MenuLegalNote({ className }: { className?: string }) {
  return (
    <div className={className}>
      <ul className="mx-auto max-w-3xl space-y-1.5 text-center text-xs leading-relaxed text-[var(--foreground-muted)] sm:text-[0.8125rem]">
        <li>Fiyatlarımız Türk lirası olup KDV dahildir. Servis, kuver veya masa ücreti alınmaz.</li>
        <li>Kalori değerleri porsiyon başına yaklaşık değerlerdir.</li>
        <li>{ALLERGEN_NOTICE}</li>
      </ul>
    </div>
  );
}
