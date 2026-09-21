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
};

export type RowMenuItem = {
  name: string;
  price: string;
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

/** Fiyatlar: SON MENÜ.pdf (Temmuz 2026) */
export const menuCategories: MenuCategory[] = [
  {
    id: "corbalar",
    title: "Çorbalar / Ana Ürünler",
    layout: "cards",
    items: [
      {
        name: "Gaziantep İşi Beyran",
        price: "450,00 TL",
        description:
          "Kuzu boyun ve kol eti, pirinç ve şifasıyla ilik suyu.",
      },
      {
        name: "Ciğer Kavurma Dürüm",
        price: "200,00 TL",
        description:
          "Kuzu ciğer, soğan piyazı ve harmanlanmış baharat çeşitleri.",
      },
      {
        name: "Nohut Dürüm",
        price: "150,00 TL",
        description:
          "Haşlanmış nohut harmanlanmış baharatlarla hazırlanır. Soğan piyazı ve patates kızartması ile servis edilir.",
      },
      {
        name: "Antep İşi Lahmacun",
        price: "200,00 TL",
        description: "Sarımsaklı Gaziantep Lahmacunu.",
      },
      {
        name: "Kaşarlı Lahmacun",
        price: "225,00 TL",
        description: "Kaşarlı Gaziantep lahmacun.",
      },
    ],
  },
  {
    id: "pideler",
    title: "Pideler",
    layout: "rows",
    items: [
      { name: "Kaşarlı Pide", price: "275,00 TL" },
      { name: "Kıymalı Pide", price: "350,00 TL" },
      { name: "Kuşbaşılı Pide", price: "400,00 TL" },
      { name: "Kıymalı Kaşarlı Pide", price: "375,00 TL" },
      { name: "Sucuklu Kaşarlı Pide", price: "325,00 TL" },
      { name: "Kuşbaşılı Kaşarlı Pide", price: "425,00 TL" },
      { name: "Kavurma Kaşarlı Pide", price: "450,00 TL" },
    ],
  },
  {
    id: "izgara",
    title: "Izgara Çeşitleri",
    layout: "rows",
    items: [
      { name: "Tavuk Şiş Dürüm (120 gr)", price: "280,00 TL" },
      { name: "Tavuk Şiş Porsiyon", price: "520,00 TL" },
      { name: "Adana Dürüm (100 gr)", price: "300,00 TL" },
      { name: "Adana Porsiyon", price: "600,00 TL" },
      { name: "Urfa Dürüm (100 gr)", price: "300,00 TL" },
      { name: "Urfa Porsiyon", price: "580,00 TL" },
      { name: "Kuşbaşı Dürüm (100 gr)", price: "350,00 TL" },
      { name: "Kuşbaşı Porsiyon", price: "650,00 TL" },
      { name: "Ciğer Dürüm (120 gr)", price: "290,00 TL" },
      { name: "Ciğer Porsiyon", price: "520,00 TL" },
      { name: "Sucuk Ekmek", price: "250,00 TL" },
      { name: "Köfte Ekmek", price: "270,00 TL" },
      { name: "Köfte Porsiyon", price: "540,00 TL" },
    ],
  },
  {
    id: "tatlilar",
    title: "Tatlılar",
    layout: "rows",
    items: [
      { name: "Şekerli Börek", price: "250,00 TL" },
      { name: "Hasır Künefe", price: "350,00 TL" },
      { name: "Katmer", price: "400,00 TL" },
    ],
  },
  {
    id: "ekstralar",
    title: "Extralar",
    layout: "rows",
    items: [
      { name: "İçli Köfte (Adet)", price: "125,00 TL" },
      { name: "Çiğköfte Porsiyon", price: "140,00 TL" },
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
    id: "icecekler",
    title: "İçecekler",
    layout: "rows",
    items: [
      {
        name: "Kutu ve Şişe Kola, Fanta, Sprite, Gazoz, Ice Tea",
        price: "90,00 TL",
      },
      { name: "Ayran", price: "50,00 TL" },
      { name: "Acılı / Acısız Şalgam", price: "50,00 TL" },
      { name: "Soda", price: "35,00 TL" },
      { name: "Su", price: "20,00 TL" },
      { name: "Türk Kahvesi", price: "50,00 TL" },
      { name: "Çay", price: "25,00 TL" },
    ],
  },
];
