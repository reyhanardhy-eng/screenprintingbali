import Topbar from "@/components/Topbar";
import Hero from "@/components/Hero";
import HomeOverview from "@/components/HomeOverview";
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
      <main>
        <Hero />
        <Reveal><HomeOverview /></Reveal>
        <Reveal><Work layout="grid" limit={6} title="Made in our Bali studio." /></Reveal>
        <Reveal><Process /></Reveal>
        <Reveal><FinalCta /></Reveal>
      </main>
      <Footer />
    </>
  );
}
