import {
  Navbar,
  Footer,
  FloatingWhatsAppButton,
  HeroSection,
  AboutSection,
  MenuSection,
  GallerySection,
  ContactSection,
  MapSection,
} from "@/components";
import { getCatalog } from "@/lib/menu/catalog";

/** Menü yöneticiden değişince en geç 60 sn içinde sitede görünür */
export const revalidate = 60;

export default async function Home() {
  const catalog = await getCatalog();
  return (
    <>
      <Navbar />
      <main id="main-content" className="flex-1" tabIndex={-1}>
        <HeroSection />
        <AboutSection />
        <MenuSection categories={catalog.menu} />
        <GallerySection />
        <ContactSection />
        <MapSection />
      </main>
      <Footer />
      <FloatingWhatsAppButton />
    </>
  );
}
