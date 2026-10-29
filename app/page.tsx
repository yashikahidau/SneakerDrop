import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import Marquee from "@/components/Marquee";
import SneakerCatalogue from "@/components/SneakerCatalogue";
import FieldNotes from "@/components/FieldNotes";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <Marquee />
        <SneakerCatalogue />
        <FieldNotes />
      </main>
      <Footer />
    </>
  );
}
