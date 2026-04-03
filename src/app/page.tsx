import {
  Navbar,
  Footer,
  FloatingWhatsAppButton,
  HeroSection,
  AboutSection,
  MenuSection,
  CampaignSection,
  GallerySection,
  ContactSection,
  MapSection,
} from "@/components";

export default function Home() {
  return (
    <>
      <Navbar />
      <main id="main-content" className="flex-1" tabIndex={-1}>
        <HeroSection />
        <AboutSection />
        <MenuSection />
        <CampaignSection />
        <GallerySection />
        <ContactSection />
        <MapSection />
      </main>
      <Footer />
      <FloatingWhatsAppButton />
    </>
  );
}
