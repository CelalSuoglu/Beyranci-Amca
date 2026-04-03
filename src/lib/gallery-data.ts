export type GalleryTile = {
  id: string;
  src: string;
  alt: string;
  caption: string;
  /** Yemek / atmosfer görselleri için `cover`; gerekirse `contain` */
  imageFit: "cover" | "contain";
  /** `object-position` için Tailwind sınıfları (kırpma dengesi) */
  objectPositionClass?: string;
};

/**
 * Yemek ve mekân atmosferi: Beyran → lahmacun → pide → ciğer kavurma.
 * Görseller `public/images/` altında.
 */
export const galleryFoodAndBrand: GalleryTile[] = [
  {
    id: "beyran",
    src: "/images/gallery-beyran-corbasi.png",
    alt: "Beyran çorbası — sıcak servis, bol etli kuzu ve pilav",
    caption: "Beyran Çorbası",
    imageFit: "contain",
  },
  {
    id: "ciger",
    src: "/images/gallery-ciger-kavurma.png",
    alt: "Ciğer kavurması — tavada sıcak servis, kaşık ve buhar; üst başlık ve taze malzemeler",
    caption: "Ciğer Kavurma",
    imageFit: "contain",
  },
  {
    id: "lahmacun",
    src: "/images/gallery-lahmacun.png",
    alt: "Taş fırında pişen lahmacun; yanında sıcak alev ve taş zemin",
    caption: "Lahmacun",
    imageFit: "contain",
  },
  {
    id: "pide",
    src: "/images/gallery-pide.png",
    alt: "Taş fırında pişen pideler; arka planda alev ve fırın atmosferi",
    caption: "Pide",
    imageFit: "contain",
  },
];
