import Topbar from "@/components/Topbar";
import Paths from "@/components/Paths";
import Methods from "@/components/Methods";
import FinalCta from "@/components/FinalCta";
import Footer from "@/components/Footer";
import { sitePageMetadata } from "@/lib/seo-metadata";

export const metadata = sitePageMetadata("/services", "Printing & Apparel Services in Bali", "Compare screen printing, DTF printing, embroidery, garment finishing, and apparel brand production in Bali.");

export default function ServicesPage() {
  return <><Topbar /><main className="inner-page">
    <div className="container inner-page__intro"><p className="eyebrow">Services / Bali, Indonesia</p><h1>Production built around your brief.</h1><p>Choose a print method or bring us the idea you are still shaping. We will confirm quantities, artwork, garment options, timing, and the right next step before production.</p></div>
    <Paths />
    <Methods />
    <FinalCta />
  </main><Footer /></>;
}
