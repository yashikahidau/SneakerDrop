import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import SneakerCatalogue from "@/components/SneakerCatalogue";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <SneakerCatalogue />
        <section id="journal" className="sr-only" aria-label="SneakerDrop journal" />
      </main>
      <Footer />
    </>
  );
}
