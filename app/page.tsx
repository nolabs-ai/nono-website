import Header from "@/components/Header";
import Hero from "@/components/Hero";
import RegistryGallery from "@/components/RegistryGallery";
import CtaBanner from "@/components/CtaBanner";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <div className="h-px bg-border" />
        <RegistryGallery />
        <div className="h-px bg-border" />
        <CtaBanner />
      </main>
      <Footer />
    </>
  );
}
