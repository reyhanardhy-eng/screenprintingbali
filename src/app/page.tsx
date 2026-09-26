import Topbar from "@/components/Topbar";
import Hero from "@/components/Hero";
import HomeOverview from "@/components/HomeOverview";
import StudioEquipment from "@/components/StudioEquipment";
import Work from "@/components/Work";
import Process from "@/components/Process";
import FinalCta from "@/components/FinalCta";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import { sitePageMetadata } from "@/lib/seo-metadata";

export const metadata = sitePageMetadata(
  "/",
  "Apparel Printing & Brand Studio in Bali",
  "Explore in-house screen printing, DTF printing, apparel finishing, and brand production services in Bali. View real work and request a quote."
);

export const revalidate = 60;

export default function Home() {
  return (
    <>
      <Topbar />
      <main className="home-page">
        <Hero />
        <Reveal><HomeOverview /></Reveal>
        <Reveal><StudioEquipment /></Reveal>
        <Reveal><Work layout="editorial" limit={6} title="The work starts in the print room." /></Reveal>
        <Reveal><Process /></Reveal>
        <Reveal><FinalCta /></Reveal>
      </main>
      <Footer />
    </>
  );
}
