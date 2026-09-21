/**
 * Kampanya içerikleri — yalnızca buradan güncelleyin.
 * Fiyatlar güncel menüye göre (SON MENÜ.pdf) ayarlandı.
 */
export const campaigns = [
  {
    id: "nohut",
    title: "Nohut Dürüm + İçecek",
    price: "220",
    currency: "TL",
    gradient:
      "from-[#3d1810] via-[#2a120e] to-[#1a0c08] ring-[#d4af37]/25",
    accent: "text-[#fde68a]",
    glow: "after:bg-[radial-gradient(circle_at_30%_0%,rgba(234,88,12,0.22),transparent_55%)]",
  },
  {
    id: "ciger",
    title: "Ciğer Kavurma Dürüm + İçecek",
    price: "260",
    currency: "TL",
    gradient:
      "from-[#451a0a] via-[#2d120c] to-[#140804] ring-[#ea580c]/30",
    accent: "text-[#fdba74]",
    glow: "after:bg-[radial-gradient(circle_at_70%_0%,rgba(212,175,55,0.14),transparent_50%)]",
  },
  {
    id: "icli-kofte",
    title: "2 Adet İçli Köfte",
    price: "220",
    currency: "TL",
    gradient:
      "from-[#2a1810] via-[#1f120e] to-[#120a08] ring-[#d4af37]/20",
    accent: "text-[#fde68a]",
    glow: "after:bg-[radial-gradient(circle_at_50%_0%,rgba(212,175,55,0.18),transparent_55%)]",
  },
] as const;
