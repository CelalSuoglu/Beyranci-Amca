export type MenuItemOption = {
  name: string;
  price: string;
};

export type CardMenuItem = {
  name: string;
  price?: string;
  options?: MenuItemOption[];
  description?: string;
  descriptionList?: string[];
  /** Kalori (kcal) — yalnızca basılı menüde yazanlar */
  calories?: number;
};

export type RowMenuItem = {
  name: string;
  price: string;
  calories?: number;
};

export type MenuCategory =
  | {
      id: string;
      title: string;
      /** Açıklamalı ürünler için kart */
      layout: "cards";
      items: CardMenuItem[];
      subSectionTitle?: string;
      subSectionItems?: RowMenuItem[];
    }
  | {
      id: string;
      title: string;
      /** Kompakt satır listesi */
      layout: "rows";
      items: RowMenuItem[];
      subSectionTitle?: string;
      subSectionItems?: RowMenuItem[];
    };

/** Fiyatlar ve içerik: basılı menü (Kasım 2026). Kaloriler menüde yazdığı gibi. */
export const menuCategories: MenuCategory[] = [
  {
    id: "corbalar",
    title: "Çorbalar",
    layout: "cards",
    items: [
      {
        name: "Beyran",
        price: "450,00 TL",
        description: "Kuzu boyun ve kol eti, pirinç ve şifasıyla ilik suyu.",
        calories: 330,
      },
      {
        name: "Süzme Mercimek",
        price: "200,00 TL",
        description:
          "Kırmızı mercimek, soğan, havuç, patates, tereyağ ve baharatlarla enfes lezzet.",
        calories: 150,
      },
    ],
  },
  {
    id: "geleneksel",
    title: "Geleneksel Lezzetler",
    layout: "cards",
    items: [
      {
        name: "Nohut Dürüm",
        price: "150,00 TL",
        description:
          "Haşlanmış nohut harmanlanmış baharatlarla hazırlanır. Soğan piyazı ve patates kızartması ile servis edilir.",
        calories: 700,
      },
      {
        name: "Kavurma Dürüm",
        price: "200,00 TL",
        description:
          "Kuzu ciğer, soğan piyazı ve harmanlanmış baharat çeşitleri.",
        calories: 500,
      },
    ],
  },
  {
    id: "firindan",
    title: "Fırından",
    layout: "cards",
    items: [
      {
        name: "Gaziantep İşi Lahmacun",
        price: "200,00 TL",
        description:
          "Sarımsak, domates, maydanoz, taze biber ve özel Gaziantep baharatlarıyla hazırlanan harç, çıtır çıtır hamur.",
      },
    ],
    subSectionItems: [
      { name: "Kaşarlı Lahmacun", price: "225,00 TL" },
      { name: "Kaşarlı Pide", price: "275,00 TL" },
      { name: "Kıymalı Pide", price: "350,00 TL" },
      { name: "Kuşbaşılı Pide", price: "400,00 TL" },
      { name: "Kıymalı Kaşarlı Pide", price: "375,00 TL" },
      { name: "Kuşbaşı Kaşar Pide", price: "425,00 TL" },
      { name: "Sucuk Kaşar Pide", price: "325,00 TL" },
      { name: "Kavurma Kaşar Pide", price: "450,00 TL" },
    ],
  },
  {
    id: "cocuk-menu",
    title: "Çocuk Menüsü",
    layout: "rows",
    items: [
      { name: "Karışık Pizza / Ayran", price: "400,00 TL" },
      { name: "Margarita Pizza / Ayran", price: "370,00 TL" },
    ],
  },
  {
    id: "aperatifler",
    title: "Aperatifler",
    layout: "rows",
    items: [
      { name: "İçli Köfte", price: "125,00 TL" },
      { name: "Çiğköfte Porsiyon", price: "140,00 TL" },
    ],
  },
  {
    id: "tatlilar",
    title: "Tatlılar",
    layout: "rows",
    items: [{ name: "Şekerli Börek", price: "300,00 TL" }],
  },
  {
    id: "icecekler",
    title: "İçecekler",
    layout: "rows",
    items: [
      { name: "Gazlı İçecekler", price: "90,00 TL" },
      { name: "Ayran", price: "50,00 TL" },
      { name: "Acılı, Acısız Şalgam", price: "60,00 TL" },
      { name: "Su", price: "20,00 TL" },
      { name: "Soda", price: "35,00 TL" },
      { name: "Türk Kahvesi", price: "50,00 TL" },
      { name: "Çay", price: "25,00 TL" },
    ],
  },
];
