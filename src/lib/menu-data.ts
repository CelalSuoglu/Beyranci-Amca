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
        price: "160,00 TL",
        description:
          "Kuzu ciğer, soğan piyazı ve harmanlanmış baharat çeşitleri.",
      },
      {
        name: "Nohut Dürüm",
        price: "110,00 TL",
        description:
          "Gaziantep'in meşhur, oldukça doyurucu sokak lezzeti nohut dürümü, İlikli Kemik Suyunda haşlanmış nohutların pul biber, kimyon ve yağ ile kavrulup, lavaş içerisine soğan, maydanoz, domatesle ve patates kızartması ile servis edilir.",
      },
      {
        name: "Antep İşi Lahmacun",
        price: "150,00 TL",
        description: "Sarımsaklı Gaziantep Lahmacunu.",
      },
    ],
  },
  {
    id: "pideler",
    title: "Pideler",
    layout: "rows",
    items: [
      { name: "Kaşarlı Pide", price: "225,00 TL" },
      { name: "Kıymalı Pide", price: "275,00 TL" },
      { name: "Kuşbaşılı Pide", price: "300,00 TL" },
      { name: "Sucuklu Kaşarlı Pide", price: "300,00 TL" },
      { name: "Kuşbaşılı Kaşarlı Pide", price: "325,00 TL" },
      { name: "Kavurmalı Kaşarlı Pide", price: "350,00 TL" },
    ],
  },
  {
    id: "tatlilar",
    title: "Tatlılar",
    layout: "rows",
    items: [{ name: "hasir Künefe", price: "250,00 TL" }],
  },
  {
    id: "icecekler",
    title: "İçecekler",
    layout: "rows",
    items: [
      { name: "Kola", price: "60,00 TL" },
      { name: "Fanta", price: "60,00 TL" },
      { name: "Sprite", price: "60,00 TL" },
      { name: "Ice Tea", price: "60,00 TL" },
      { name: "Ayran", price: "50,00 TL" },
      { name: "Acılı / Acısız Şalgam", price: "40,00 TL" },
      { name: "Soda", price: "35,00 TL" },
    ],
  },
];
