export type MenuItemOption = {
  name: string;
  price: string;
};

export type MenuItem = {
  name: string;
  price?: string;
  options?: MenuItemOption[];
  description?: string;
  descriptionList?: string[];
};

export type MenuCategory = {
  id: string;
  title: string;
  items: MenuItem[];
  /** Açıklamalı ürünler için kart; diğerleri için kompakt satır */
  layout: "cards" | "rows";
  subSectionTitle?: string;
  subSectionItems?: MenuItem[];
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
    id: "tavalar-ve-firin-kebaplari",
    title: "Tavalar ve Fırın Kebapları",
    layout: "rows",
    items: [
      { name: "Kilis Tava (1 Porsiyon)", price: "550,00 TL" },
      { name: "Eli Böğründe (1 Porsiyon)", price: "600,00 TL" },
      { name: "Patlıcan Kebabı (1 Porsiyon)", price: "575,00 TL" },
      { name: "Kuşbaşı Tava (1 Porsiyon)", price: "625,00 TL" },
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
    id: "kahvalti",
    title: "Kahvaltı",
    layout: "cards",
    items: [
      {
        name: "Serpme Kahvaltı",
        options: [
          { name: "Tek Kişilik Serpme Kahvaltı", price: "850,00 TL" },
          { name: "2 Kişilik Serpme Kahvaltı", price: "1500,00 TL" },
        ],
        descriptionList: [
          "Menemen",
          "Haşlanmış Yumurta",
          "Söğüş Tabağı",
          "Sigara Böreği",
          "Şekerli Börek",
          "Patates Kızartması",
          "Sucuk",
          "Sosis",
          "Salam",
          "Antep Peyniri",
          "Tulum Peyniri",
          "Çeçil Peyniri",
          "Top Peynir",
          "Beyaz Peynir",
          "Kaşar",
          "Bal",
          "Kaymak",
          "Tereyağı",
          "Siyah Zeytin",
          "Yeşil Zeytin",
          "Tahin - Pekmez",
          "Çilek Reçeli",
          "Vişne Reçeli",
          "Kayısı Reçeli",
          "Böğürtlen Reçeli",
          "Zahter",
          "Zeytinyağı",
        ],
      },
    ],
    subSectionTitle: "Kahvaltı Yanında Extralar",
    subSectionItems: [
      { name: "Sucuklu Yumurta", price: "200,00 TL" },
      { name: "Kavurmalı Yumurta", price: "250,00 TL" },
      { name: "Şekerli Börek", price: "150,00 TL" },
      { name: "Taze Sıkılmış Portakal Suyu", price: "80,00 TL" },
    ],
  },
  {
    id: "tatlilar",
    title: "Tatlılar",
    layout: "rows",
    items: [
      { name: "Katmer", price: "850,00 TL" },
      { name: "Tek Kişilik Künefe", price: "250,00 TL" },
    ],
  },
  {
    id: "icecekler",
    title: "İçecekler",
    layout: "rows",
    items: [
      { name: "Kola", price: "80,00 TL" },
      { name: "Fanta", price: "80,00 TL" },
      { name: "Sprite", price: "80,00 TL" },
      { name: "Ice Tea", price: "80,00 TL" },
      { name: "Ayran", price: "560,00 TL" },
      { name: "Acılı / Acısız Şalgam", price: "60,00 TL" },
      { name: "Soda", price: "35,00 TL" },
    ],
  },
];
